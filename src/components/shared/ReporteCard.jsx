import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ReporteCard({ reporte, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      {reporte.tema && <Badge variant="secondary" className="w-fit">{reporte.tema}</Badge>}

      {reporte.dato && (
        <div className="text-4xl font-bold text-[#0a1628] tracking-tight">{reporte.dato}</div>
      )}

      <h3 className="text-sm font-semibold text-slate-900 leading-snug">{reporte.titulo}</h3>

      {reporte.descripcion && (
        <p className="text-xs text-slate-500 line-clamp-3 flex-1">{reporte.descripcion}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
        {reporte.fuente && <span>Fuente: {reporte.fuente}</span>}
        {reporte.fecha && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />{reporte.fecha}
          </span>
        )}
      </div>
    </motion.div>
  )
}
