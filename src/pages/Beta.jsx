import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ExternalLink } from 'lucide-react'
import { informes, hilos, reportesRapidos, datasets } from '@/components/data/mockData'

const TYPE_STYLES = {
  'Informe':     { bg: 'bg-brand-100',  text: 'text-brand-700',  border: 'border-brand-400' },
  'Publicación': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-400' },
  'Reporte':     { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-400' },
  'Dataset':     { bg: 'bg-slate-100',  text: 'text-slate-700',  border: 'border-slate-400' },
}

function buildItems() {
  const items = []

  informes.forEach(i => items.push({
    id: i.id, type: 'Informe',
    title: i.titulo, description: i.bajada,
    theme: i.tema, date: i.fecha,
    href: i.url, external: false,
  }))

  hilos.forEach(h => items.push({
    id: h.id, type: 'Publicación',
    title: h.titulo, description: h.resumen,
    theme: h.tema, date: h.fecha,
    href: h.url, external: true,
  }))

  reportesRapidos.forEach(r => items.push({
    id: r.id, type: 'Reporte',
    title: r.titulo, description: `${r.dato} - ${r.descripcion}`,
    theme: r.tema, date: r.fecha,
    href: '/reportes', external: false,
  }))

  datasets.forEach(d => items.push({
    id: d.id, type: 'Dataset',
    title: d.nombre, description: d.descripcion,
    theme: d.tema || 'Datos', date: d.fechaActualizacion,
    href: '/datos', external: false,
  }))

  return items
}

const ALL_ITEMS = buildItems()
const ALL_THEMES = ['Todos', ...Array.from(new Set(ALL_ITEMS.map(i => i.theme))).sort()]

function BetaCard({ item }) {
  const s = TYPE_STYLES[item.type]
  const inner = (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${s.border} p-5 h-full flex flex-col gap-3 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
          {item.type}
        </span>
        {item.external && <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />}
      </div>
      <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">{item.title}</p>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{item.description}</p>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{item.theme}</span>
        <span className="text-[10px] text-slate-400">{item.date}</span>
      </div>
    </div>
  )

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className="no-underline block h-full">
        {inner}
      </a>
    )
  }
  return (
    <Link to={item.href} className="no-underline block h-full">
      {inner}
    </Link>
  )
}

export default function Beta() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState(searchParams.get('theme') || 'Todos')

  const filtered = useMemo(() => {
    let result = ALL_ITEMS
    if (theme !== 'Todos') result = result.filter(i => i.theme === theme)
    if (query.trim().length >= 2) {
      const q = query.toLowerCase()
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.theme.toLowerCase().includes(q)
      )
    }
    return result
  }, [query, theme])

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      {/* Header */}
      <div className="bg-[#0a1628] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo-bars.svg" alt="DatosPBA" className="h-8 w-8 object-contain" />
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-[0.2em]">Beta</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Explorador de contenido</h1>
          <p className="text-slate-400 text-sm">Todo el contenido de DatosPBA en un solo lugar.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-14 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por palabra clave..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>

          {/* Theme filters */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_THEMES.map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  theme === t
                    ? 'bg-[#0a1628] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-xs text-slate-400 mb-5">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {theme !== 'Todos' ? ` en "${theme}"` : ''}
          {query.trim().length >= 2 ? ` para "${query.trim()}"` : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            No se encontraron resultados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(item => (
              <BetaCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
