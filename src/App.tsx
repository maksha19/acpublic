import { Outlet, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
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
        lede="That link may be incomplete. Registration links in our emails carry both a code and a
              key — check that the whole link was copied, including everything after the &amp; sign."
      />
      <LinkButton to="/" variant="secondary">
        Back to home
      </LinkButton>
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
