import { m } from 'framer-motion'
import { Calendar, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function HiloCard({ hilo, index = 0 }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/50 border-l-4 border-l-purple-400 flex flex-col hover:shadow-md hover:-translate-y-0.5 hover:border-l-purple-500 transition-all overflow-hidden"
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
          {hilo.tema && <Badge variant="secondary">{hilo.tema}</Badge>}
          {hilo.plataforma && <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{hilo.plataforma}</span>}
        </div>

        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">{hilo.titulo}</h3>

        {hilo.resumen && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 flex-1">{hilo.resumen}</p>}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Calendar className="w-3 h-3" />{hilo.fecha}
          </span>
          {hilo.url && (
            <a
              href={hilo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 no-underline"
            >
              Ver hilo <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </m.div>
  )
}
