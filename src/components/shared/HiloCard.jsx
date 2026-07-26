import { Badge } from '@/components/ui/badge'

export default function HiloCard({ hilo }) {
  return (
    <div
      className="bg-white border flex flex-col overflow-hidden hover:border-slate-300 transition-colors"
      style={{ borderColor: 'var(--rule)' }}
    >
      {hilo.imagen && (
        <img
          src={hilo.imagen}
          alt={hilo.titulo}
          loading="lazy"
          className="w-full h-36 object-cover"
        />
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          {hilo.tema && <Badge>{hilo.tema}</Badge>}
          {hilo.plataforma && <span className="text-xs text-slate-500 shrink-0">{hilo.plataforma}</span>}
        </div>

        <h3 className="text-sm font-semibold text-slate-900 leading-snug">{hilo.titulo}</h3>

        {hilo.resumen && <p className="text-xs text-slate-500 line-clamp-3 flex-1">{hilo.resumen}</p>}

        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--rule)' }}>
          <span className="text-xs text-slate-500">{hilo.fecha}</span>
          {hilo.url && (
            <a
              href={hilo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 no-underline"
            >
              Ver hilo →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
