import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import InformeVisual from '@/components/shared/InformeVisual'

/* Tarjeta del listado de informes: banda visual (si el informe tiene ficha
   en informesVisuales.js), tema y fecha, título, bajada y link. */
export default function EntryCard({ titulo, resumen, fecha, tema, url, imagen, visual }) {
  return (
    <div
      className="border flex flex-col overflow-hidden transition-colors hover:border-slate-400"
      style={{ background: 'var(--c-surface)', borderColor: 'var(--c-rule)' }}
    >
      {visual ? (
        <InformeVisual visual={visual} />
      ) : imagen ? (
        <img
          src={imagen}
          alt={titulo}
          loading="lazy"
          className="w-full h-44 object-cover"
        />
      ) : null}

      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {tema && <Badge>{tema}</Badge>}
          {fecha && <span className="text-xs" style={{ color: 'var(--c-ink-mid)' }}>{fecha}</span>}
        </div>

        <h3 className="text-base font-semibold leading-snug" style={{ color: 'var(--c-ink)' }}>{titulo}</h3>

        {resumen && <p className="text-sm line-clamp-3" style={{ color: 'var(--c-ink-mid)' }}>{resumen}</p>}

        {url && (
          <Link to={url} className="mt-auto pt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 no-underline">
            Ver informe →
          </Link>
        )}
      </div>
    </div>
  )
}
