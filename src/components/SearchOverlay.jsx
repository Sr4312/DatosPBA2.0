import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { informes, hilos, reportesRapidos, visualizaciones, datasets } from '@/components/data/mockData'

const INDEX = [
  ...informes.map(x => ({
    id: x.id,
    tipo: 'Informe',
    titulo: x.titulo,
    subtitulo: x.bajada,
    url: x.url,
    tema: x.tema,
  })),
  ...hilos.map(x => ({
    id: x.id,
    tipo: 'Publicación',
    titulo: x.titulo,
    subtitulo: x.resumen,
    url: x.url,
    tema: x.tema,
    external: true,
  })),
  ...reportesRapidos.map(x => ({
    id: x.id,
    tipo: 'Reporte rápido',
    titulo: x.titulo,
    subtitulo: x.dato,
    url: '/reportes',
    tema: x.tema,
  })),
  ...visualizaciones.map(x => ({
    id: x.id,
    tipo: 'Visualización',
    titulo: x.titulo,
    subtitulo: x.fuente,
    url: `/visualizaciones#${x.id}`,
    tema: x.tema,
  })),
  ...datasets.map(x => ({
    id: x.id,
    tipo: 'Dataset',
    titulo: x.nombre,
    subtitulo: x.descripcion,
    url: '/datos',
    tema: x.formato,
  })),
]

function match(item, q) {
  const s = q.toLowerCase()
  return (
    item.titulo?.toLowerCase().includes(s) ||
    item.subtitulo?.toLowerCase().includes(s) ||
    item.tema?.toLowerCase().includes(s)
  )
}

const TIPO_COLOR = {
  'Informe':        'bg-brand-100 text-brand-700',
  'Publicación':    'bg-purple-100 text-purple-700',
  'Reporte rápido': 'bg-amber-100 text-amber-700',
  'Visualización':  'bg-sky-100 text-sky-700',
  'Dataset':        'bg-slate-100 text-slate-600',
}

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = query.trim().length >= 2
    ? INDEX.filter(item => match(item, query.trim())).slice(0, 12)
    : []

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar en DatosPBA..."
            className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {results.map(item => (
              <li key={`${item.tipo}-${item.id}`}>
                {item.external ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors no-underline"
                  >
                    <ResultContent item={item} />
                  </a>
                ) : (
                  <Link
                    to={item.url}
                    onClick={onClose}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors no-underline"
                  >
                    <ResultContent item={item} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}

        {query.trim().length >= 2 && results.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-slate-400">
            Sin resultados para "{query}"
          </div>
        )}

        {query.trim().length < 2 && (
          <div className="px-4 py-4 text-xs text-slate-400">
            Escribí al menos 2 caracteres para buscar
          </div>
        )}
      </div>
    </div>
  )
}

function ResultContent({ item }) {
  return (
    <>
      <span className={`mt-0.5 shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${TIPO_COLOR[item.tipo] ?? 'bg-slate-100 text-slate-600'}`}>
        {item.tipo}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{item.titulo}</p>
        {item.subtitulo && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitulo}</p>
        )}
      </div>
    </>
  )
}
