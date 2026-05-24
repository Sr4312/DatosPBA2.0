import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

let cachedIndex = null

async function buildIndex() {
  if (cachedIndex) return cachedIndex
  const [{ data: informes }, { data: hilos }, { data: reportes }, { data: datasets }] = await Promise.all([
    supabase.from('informes').select('id, titulo, bajada, url, tema'),
    supabase.from('hilos').select('id, titulo, resumen, url, tema'),
    supabase.from('reportes_rapidos').select('id, titulo, dato'),
    supabase.from('datasets').select('id, nombre, descripcion, formato'),
  ])
  cachedIndex = [
    ...(informes || []).map(x => ({ id: x.id, tipo: 'Informe', titulo: x.titulo, subtitulo: x.bajada, url: x.url, tema: x.tema })),
    ...(hilos || []).map(x => ({ id: x.id, tipo: 'Publicación', titulo: x.titulo, subtitulo: x.resumen, url: x.url, tema: x.tema, external: true })),
    ...(reportes || []).map(x => ({ id: x.id, tipo: 'Reporte rápido', titulo: x.titulo, subtitulo: x.dato, url: '/reportes' })),
    ...(datasets || []).map(x => ({ id: x.id, tipo: 'Dataset', titulo: x.nombre, subtitulo: x.descripcion, url: '/datos', tema: x.formato })),
  ]
  return cachedIndex
}

function match(item, q) {
  const s = q.toLowerCase()
  return (
    item.titulo?.toLowerCase().includes(s) ||
    item.subtitulo?.toLowerCase().includes(s) ||
    item.tema?.toLowerCase().includes(s)
  )
}

const TIPO_COLOR = {
  'Informe':        'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-300',
  'Publicación':    'bg-purple-100 text-purple-700 dark:bg-purple-700/30 dark:text-purple-300',
  'Reporte rápido': 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300',
  'Dataset':        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
      buildIndex().then(setIndex)
    }
  }, [open])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = query.trim().length >= 2
    ? index.filter(item => match(item, query.trim())).slice(0, 12)
    : []

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar en DatosPBA..."
            className="flex-1 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none bg-transparent"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
            {results.map(item => (
              <li key={`${item.tipo}-${item.id}`}>
                {item.external ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors no-underline"
                  >
                    <ResultContent item={item} />
                  </a>
                ) : (
                  <Link
                    to={item.url}
                    onClick={onClose}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors no-underline"
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
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{item.titulo}</p>
        {item.subtitulo && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitulo}</p>
        )}
      </div>
    </>
  )
}
