import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Menu, X, ArrowUp, Mail, Twitter, Linkedin } from 'lucide-react'

const NAV = [
  { to: '/reportes',        label: 'Reportes rápidos' },
  { to: '/informes',        label: 'Informes' },
  { to: '/hilos',           label: 'Publicaciones' },
  { to: '/visualizaciones', label: 'Visualizaciones' },
  { to: '/datos',           label: 'Datasets' },
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <NavLink to="/" className="text-brand-600 font-bold text-base hover:text-brand-700 transition-colors no-underline tracking-tight">
            Datos PBA
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors no-underline ${
                    isActive
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-500 hover:text-brand-600 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menú"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <nav className="md:hidden bg-white border-t border-slate-100 px-4 pb-4 flex flex-col gap-1">
            {NAV.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm font-medium rounded-lg transition-colors no-underline ${
                    isActive
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      {/* Contact section */}
      <section className="bg-white border-t border-slate-200/60 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="text-base font-bold text-brand-600 mb-2">Datos PBA</p>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Repositorio de análisis político y datos abiertos sobre la Provincia de Buenos Aires.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Contenido</p>
            <ul className="space-y-2.5">
              {NAV.map(l => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className="text-sm text-slate-600 hover:text-brand-600 transition-colors no-underline"
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Contacto</p>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contacto@datospba.com"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 transition-colors no-underline"
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
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 transition-colors no-underline"
                >
                  <Twitter className="w-4 h-4 shrink-0 text-slate-400" />
                  @datospba
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/datospba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 transition-colors no-underline"
                >
                  <Linkedin className="w-4 h-4 shrink-0 text-slate-400" />
                  Datos PBA
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="bg-brand-50 border-t border-brand-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Datos PBA. Todos los derechos reservados.</span>
        </div>
      </footer>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-white border border-brand-200 shadow-md flex items-center justify-center text-brand-500 hover:text-brand-700 hover:shadow-lg transition-all"
          aria-label="Volver arriba"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
