import { NavLink, Outlet } from 'react-router-dom'

/* BRAND NOTE — the Toastmasters brand manual permits exactly one logo, used
   as supplied, and forbids redrawing or recolouring it. So Phase 0 uses a plain
   type lockup rather than an approximation. Drop the official asset into
   public/ and swap it in during Phase 1, once someone with brand authority has
   signed off on placement and clear space. Inventing a logo now would be worse
   than having none. */

const navItem = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center rounded-md px-3 font-heading text-[15px] font-semibold
   transition-colors duration-150 ${
     isActive ? 'bg-white/15 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
   }`

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Skip link — the nav is short, but the registration desk tabs through
          these pages and it costs nothing. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50
                   focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold
                   focus:text-primary"
      >
        Skip to content
      </a>

      <header className="bg-primary">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="text-white">
            <span className="block font-heading text-lg font-bold leading-tight">
              Annual Conference 2027
            </span>
            <span className="block text-[13px] uppercase tracking-[0.14em] text-white/75">
              Toastmasters District
            </span>
          </NavLink>
          <nav aria-label="Main" className="flex flex-wrap gap-1">
            <NavLink to="/" className={navItem} end>
              Home
            </NavLink>
            <NavLink to="/register" className={navItem}>
              Register
            </NavLink>
            <NavLink to="/my" className={navItem}>
              My registration
            </NavLink>
          </nav>
        </div>
      </header>

      {/* A visible, honest banner. The committee will see this demo and a
          prototype that does not say it is one gets mistaken for finished. */}
      <div className="bg-happy-yellow">
        <p className="mx-auto max-w-5xl px-4 py-2 text-[15px] font-semibold text-loyal-blue">
          Demonstration only — Phase 0 prototype. Data here is not real and emails are not
          delivered.
        </p>
      </div>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-[15px] text-muted-fg">
          <p>Annual Conference 2027 · Toastmasters District</p>
          <p className="mt-1">
            Questions about your registration? Contact the registration team — details to follow.
          </p>
        </div>
      </footer>
    </div>
  )
}
