import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * PHASE 0: GitHub Pages serves this repo at https://<user>.github.io/ac-public/,
 * so every asset path must be prefixed. PHASE 1: once the custom domain is live,
 * change this to '/'.
 *
 * Getting it wrong does not produce an error — it produces a blank white page
 * with 404s for the JS bundle in the console. Worth knowing before you spend an
 * afternoon on it.
 */
const BASE = '/ac-public/'

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
