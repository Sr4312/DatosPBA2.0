import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function EntryCard({ titulo, resumen, fecha, tema, municipio, insights, url, imagen, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="bg-white rounded-2xl border border-slate-200/60 flex flex-col hover:shadow-md transition-shadow overflow-hidden"
    >
      {imagen && (
        <img
          src={imagen}
          alt={titulo}
          className="w-full h-40 object-cover"
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

        {resumen && <p className="text-sm text-slate-500 line-clamp-2">{resumen}</p>}

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
          <Link to={url} className="mt-auto flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 no-underline">
            Ver informe <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </motion.div>
  )
}
