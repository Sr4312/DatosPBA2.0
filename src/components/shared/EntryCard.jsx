import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

export default function EntryCard({ titulo, resumen, fecha, tema, municipio, insights, url, imagen }) {
  return (
    <div
      className="bg-white border flex flex-col overflow-hidden hover:border-slate-300 transition-colors"
      style={{ borderColor: 'var(--rule)' }}
    >
      {imagen && (
        <img
          src={imagen}
          alt={titulo}
          loading="lazy"
          className="w-full h-44 object-cover"
        />
      )}

      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {tema && <Badge>{tema}</Badge>}
          {fecha && <span className="text-xs text-slate-500">{fecha}</span>}
        </div>

        <h3 className="text-base font-semibold text-slate-900 leading-snug">{titulo}</h3>

        {resumen && <p className="text-sm text-slate-500 line-clamp-3">{resumen}</p>}

        {municipio && (
          <span className="text-xs text-slate-500">{municipio}</span>
        )}

        {insights && insights.length > 0 && (
          <ul className="mt-1 space-y-1.5">
            {insights.slice(0, 2).map((ins, i) => (
              <li key={i} className="text-xs text-slate-500 leading-relaxed">
                {ins}
              </li>
            ))}
          </ul>
        )}

        {url && (
          <Link to={url} className="mt-auto text-xs font-semibold text-brand-600 hover:text-brand-700 no-underline">
            Ver informe →
          </Link>
        )}
      </div>
    </div>
  )
}
