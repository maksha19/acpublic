import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
// Brand typefaces, self-hosted via @fontsource so no visitor's browser talks
// to a font CDN. Libre Franklin for the page header, Aileron for everything
// else, Alice for quotes — see AC2027_Brand_Guidelines.md.
import '@fontsource/libre-franklin/700.css'
import '@fontsource/aileron/400.css'
import '@fontsource/aileron/600.css'
import '@fontsource/aileron/700.css'
import '@fontsource/alice/400.css'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Conference details change rarely; refetching on every window focus just
      // burns Lambda invocations.
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      // One retry only. A 404 on a wrong access key should surface immediately
      // rather than after three attempts.
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* basename must match Vite's base, or every link 404s on GitHub Pages. */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
