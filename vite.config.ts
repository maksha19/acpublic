import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

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

/**
 * GitHub Pages has no SPA rewrite rule, so a hard refresh on /register — or any
 * emailed deep link like /my?code=... — asks GitHub for a file that does not
 * exist and gets a 404 page. GitHub does serve 404.html for unknown paths, so
 * shipping a copy of index.html under that name hands control to React Router
 * and the deep link works.
 *
 * This is the reason BrowserRouter is usable here at all instead of HashRouter.
 */
function githubPagesSpaFallback() {
  return {
    name: 'gh-pages-spa-fallback',
    apply: 'build' as const,
    closeBundle() {
      const index = resolve(import.meta.dirname, 'dist/index.html')
      if (existsSync(index)) {
        copyFileSync(index, resolve(import.meta.dirname, 'dist/404.html'))
      }
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss(), githubPagesSpaFallback()],
  server: {
    // strictPort, because the API only allows the exact origins it was deployed
    // with. Vite's default is to quietly move to the next free port, and the
    // symptom of that is every request failing CORS with nothing in the logs
    // pointing at the port as the cause. Failing to start is far kinder.
    port: 5173,
    strictPort: true,
  },
})
