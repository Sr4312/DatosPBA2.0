import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { Calendar, MapPin, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function EntryCard({ titulo, resumen, fecha, tema, municipio, insights, url, imagen, index = 0 }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="bg-white rounded-xl border border-slate-200/60 border-l-4 border-l-brand-400 flex flex-col hover:shadow-md hover:border-l-brand-500 transition-all overflow-hidden"
    >
      {imagen && (
        <img
          src={imagen}
          alt={titulo}
          className="w-full h-44 object-cover"
        />
      )}

      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {tema && <Badge variant="secondary">{tema}</Badge>}
          {fecha && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="w-3 h-3" />{fecha}
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-900 leading-snug">{titulo}</h3>

        {resumen && <p className="text-sm text-slate-500 line-clamp-3">{resumen}</p>}

        {municipio && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3" />{municipio}
          </span>
        )}

        {insights && insights.length > 0 && (
          <ul className="mt-1 space-y-1.5">
            {insights.slice(0, 2).map((ins, i) => (
              <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-400 shrink-0" />
                {ins}
              </li>
            ))}
          </ul>
        )}

        {url && (
          <Link to={url} className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 no-underline group">
            Ver informe
            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </m.div>
  )
}
