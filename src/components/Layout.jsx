import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Menu, X, ArrowUp, Mail, Twitter, Search, Sun, Moon } from 'lucide-react'
import SearchOverlay from './SearchOverlay'
import { useTheme } from '../context/ThemeContext'

const NAV = [
  { to: '/informes',        label: 'Informes' },
  { to: '/hilos',           label: 'Publicaciones' },
  { to: '/quienes-somos',   label: '¿Quiénes somos?' },
  { to: '/datos',           label: 'Datasets' },
  { to: '/beta',            label: 'Beta', icon: true },
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const [scrolled, setScrolled] = useState(false)
  const { isDark, toggle } = useTheme()

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 400)
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-2.5 px-3 sm:px-8 lg:px-16' : ''}`}>
        <div className={`transition-all duration-300 ${scrolled ? 'max-w-7xl mx-auto rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-md bg-white/85 dark:bg-slate-900/90 overflow-hidden' : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/50 shadow-sm'}`}>
          <div className={`px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-24'}`}>
            <NavLink to="/" className="flex items-center gap-2 no-underline shrink-0">
              <img src="/logo-bars.svg" alt="DatosPBA" style={{ height: scrolled ? '36px' : '56px', width: 'auto', transition: 'height 0.3s' }} />
              <div className="flex flex-col leading-tight overflow-hidden">
                <span className="text-xl text-[#0a1628] dark:text-slate-100 tracking-tight">Datos<span className="font-bold">PBA</span></span>
                <span className={`text-[10px] text-slate-400 hidden sm:block leading-snug transition-all duration-300 ${scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'}`}>Análisis basado en evidencia<br />para la Provincia de Buenos Aires.</span>
              </div>
            </NavLink>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-base font-medium rounded-lg transition-colors no-underline flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-brand-100 dark:bg-brand-700/30 text-brand-700 dark:text-brand-300'
                        : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-700/20 dark:hover:text-brand-300'
                    }`
                  }
                >
                  {l.icon && <img src="/logo-bars.svg" alt="" className="w-4 h-4 object-contain" />}
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-[#0a1628] dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Buscar</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                  Ctrl K
                </kbd>
              </button>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menú"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu drawer */}
          {menuOpen && (
            <nav className="lg:hidden border-t border-slate-100 dark:border-slate-700/50 px-4 pb-4 flex flex-col gap-1">
              {NAV.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 text-sm font-medium rounded-lg transition-colors no-underline ${
                      isActive
                        ? 'bg-brand-100 dark:bg-brand-700/30 text-brand-700 dark:text-brand-300'
                        : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />

      <main>
        <Outlet />
      </main>

      {/* Contact section */}
      <section className="bg-white dark:bg-slate-900 border-t-2 border-[#0a1628] dark:border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src="/logo-bars.svg" alt="DatosPBA" className="h-10 w-auto mb-4" />
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Repositorio de análisis político y datos abiertos sobre la Provincia de Buenos Aires.
            </p>
            <p className="text-[11px] text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-6 font-medium">
              Análisis basado en evidencia
            </p>
          </div>

          {/* Nav links */}
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Contenido</p>
            <ul className="space-y-2.5">
              {NAV.map(l => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors no-underline"
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Contacto</p>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contacto@datospba.com"
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors no-underline"
                >
                  <Mail className="w-4 h-4 shrink-0 text-slate-400" />
                  contacto@datospba.com
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/datospba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors no-underline"
                >
                  <Twitter className="w-4 h-4 shrink-0 text-slate-400" />
                  @datospba
                </a>
              </li>

            </ul>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a1628] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center text-xs text-slate-400">
          <span>© {new Date().getFullYear()} DatosPBA</span>
          <span className="text-brand-300 font-medium tracking-widest uppercase text-[10px]">Provincia de Buenos Aires</span>
        </div>
      </footer>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-[#0a1628] shadow-lg flex items-center justify-center text-white hover:bg-brand-600 hover:shadow-xl transition-all"
          aria-label="Volver arriba"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
