import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Menu, X, Search } from 'lucide-react'
import SearchOverlay from './SearchOverlay'

const NAV = [
  { to: '/informes',        label: 'Informes' },
  { to: '/hilos',           label: 'Publicaciones' },
  { to: '/quienes-somos',   label: '¿Quiénes somos?' },
  { to: '/datos',           label: 'Datasets' },
  { to: '/beta',            label: 'Beta' },
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--rule)' }}>
        <div className="px-4 sm:px-6 flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2 no-underline shrink-0">
            <img src="/logo-bars.svg" alt="" style={{ height: '36px', width: 'auto' }} />
            <span className="text-xl text-[#0F172A] tracking-tight">Datos<span className="font-bold">PBA</span></span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-base font-medium transition-colors no-underline ${
                    isActive
                      ? 'text-[#0F172A] underline underline-offset-8 decoration-2'
                      : 'text-slate-500 hover:text-[#0F172A]'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded border border-slate-200 text-slate-500 hover:text-[#0F172A] hover:border-slate-300 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Buscar</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 border border-slate-200 rounded px-1.5 py-0.5">
                Ctrl K
              </kbd>
            </button>

            <button
              className="lg:hidden p-2 text-slate-500 hover:text-[#0F172A] transition-colors"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menú"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="lg:hidden border-t px-4 pb-4 flex flex-col gap-1 bg-white" style={{ borderColor: 'var(--rule)' }}>
            {NAV.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm font-medium no-underline ${
                    isActive ? 'text-[#0F172A] font-semibold' : 'text-slate-500'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />

      <main>
        <Outlet />
      </main>

      {/* Contacto */}
      <section className="bg-white border-t-2 border-[#0F172A] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <img src="/logo-bars.svg" alt="DatosPBA" className="h-10 w-auto mb-4" />
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Publicación independiente de periodismo de datos sobre la Provincia de
              Buenos Aires. Cada cifra publica su fuente, su período y su metodología.
            </p>
          </div>

          <div>
            <p className="text-label uppercase text-slate-500 mb-4">Contenido</p>
            <ul className="space-y-2.5">
              {[...NAV, { to: '/metodologia', label: 'Metodología' }].map(l => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className="text-sm text-slate-600 hover:text-[#0F172A] transition-colors no-underline"
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-label uppercase text-slate-500 mb-4">Contacto</p>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contacto@datospba.com"
                  className="text-sm text-slate-600 hover:text-[#0F172A] transition-colors no-underline"
                >
                  contacto@datospba.com
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/datospba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-[#0F172A] transition-colors no-underline"
                >
                  @datospba en X
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="bg-[#0F172A] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center text-xs text-slate-400">
          <span>© {new Date().getFullYear()} DatosPBA</span>
          <span>Provincia de Buenos Aires</span>
        </div>
      </footer>
    </div>
  )
}
