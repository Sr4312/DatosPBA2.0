import { motion } from 'framer-motion'
import { Calendar, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function HiloCard({ hilo, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="bg-white rounded-2xl border border-slate-200/60 flex flex-col hover:shadow-md transition-shadow overflow-hidden"
    >
      {hilo.imagen && (
        <img
          src={hilo.imagen}
          alt={hilo.titulo}
          className="w-full h-36 object-cover"
        />
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          {hilo.tema && <Badge variant="secondary">{hilo.tema}</Badge>}
          {hilo.plataforma && <span className="text-xs text-slate-400 shrink-0">{hilo.plataforma}</span>}
        </div>

        <h3 className="text-sm font-semibold text-slate-900 leading-snug">{hilo.titulo}</h3>

        {hilo.resumen && <p className="text-xs text-slate-500 line-clamp-3 flex-1">{hilo.resumen}</p>}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />{hilo.fecha}
          </span>
          {hilo.url && (
            <a
              href={hilo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 no-underline"
            >
              Ver hilo <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
