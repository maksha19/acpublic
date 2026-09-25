import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Outlet, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { prefetchDirectory } from './lib/directory'
import Home from './pages/Home'
import Register from './pages/Register'
import Payment from './pages/Payment'
import MyRegistration from './pages/MyRegistration'
import { Card, LinkButton, PageHeader } from './components/ui'

function NotFound() {
  return (
    <Card>
      <PageHeader
        title="Page not found"
        lede="That link may be incomplete or out of date. Use Check my registration to have a
              fresh link emailed to you."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton to="/my">Check my registration</LinkButton>
        <LinkButton to="/" variant="secondary">
          Back to home
        </LinkButton>
      </div>
    </Card>
  )
}

/** The exact container the old <main> used to impose. The transactional pages
 *  keep it (pixel-identical to before); Home opts out so its landing bands can
 *  run the full viewport width. */
function Contained() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <Outlet />
    </div>
  )
}

export default function App() {
  // The member roster is fetched once, as the site loads, so the club lookup
  // on the register form answers from memory. A failure here is silent — the
  // form falls back to a typed club (lib/directory.ts).
  const queryClient = useQueryClient()
  useEffect(() => {
    void prefetchDirectory(queryClient)
  }, [queryClient])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route element={<Contained />}>
          <Route path="register" element={<Register />} />
          {/* Deep-linked from the registration email, with the access key. */}
          <Route path="register/:code/payment" element={<Payment />} />
          <Route path="my" element={<MyRegistration />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
