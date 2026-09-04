import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * PHASE 1: served from a Cloudflare Worker at the root of
 * https://public.district80ac.com/, so asset paths are root-relative. This was
 * '/ac-public/' under GitHub Pages (https://<user>.github.io/ac-public/) — do
 * not put that back without moving the site back to a subpath.
 *
 * Getting it wrong produces a blank white page and a *clean* network tab, which
 * is what makes it expensive to chase. The Worker's SPA fallback answers the
 * bogus /ac-public/assets/index-*.js request with index.html and HTTP 200, so
 * nothing goes red; the browser then refuses the module for its text/html MIME
 * type and React never mounts. The error is console-only.
 *
 * BASE also feeds BrowserRouter's basename via import.meta.env.BASE_URL in
 * main.tsx, so a wrong value blanks the page a second, independent way: no
 * route matches '/' when the basename is '/ac-public/'.
 */
const BASE = '/'

// SPA deep links (a refresh on /register, an emailed /my?code=... link) are
// handled by the Cloudflare Worker: wrangler.jsonc sets
// assets.not_found_handling = "single-page-application", which answers any
// unknown path with index.html. Under GitHub Pages this needed a build step
// copying index.html to 404.html — gone with the move.
export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss()],
  server: {
    // strictPort, because the API only allows the exact origins it was deployed
    // with. Vite's default is to quietly move to the next free port, and the
    // symptom of that is every request failing CORS with nothing in the logs
    // pointing at the port as the cause. Failing to start is far kinder.
    port: 5173,
    strictPort: true,
  },
})
