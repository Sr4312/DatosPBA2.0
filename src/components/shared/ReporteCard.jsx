import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function TendenciaIcon({ tendencia }) {
  if (tendencia === 'sube') return (
    <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center shrink-0">
      <TrendingUp className="w-4 h-4 text-green-600" />
    </div>
  )
  if (tendencia === 'baja') return (
    <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center shrink-0">
      <TrendingDown className="w-4 h-4 text-red-500" />
    </div>
  )
  return (
    <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center shrink-0">
      <Minus className="w-4 h-4 text-slate-400" />
    </div>
  )
}

export default function ReporteCard({ reporte, index = 0 }) {
  const varColor = reporte.tendencia === 'sube'
    ? 'text-green-600'
    : reporte.tendencia === 'baja'
    ? 'text-red-500'
    : 'text-slate-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      className="bg-white rounded-xl border border-slate-200/60 px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow"
    >
      <TendenciaIcon tendencia={reporte.tendencia} />

      <div className="flex flex-col gap-0.5 shrink-0 w-24">
        <span className="text-xl font-bold text-[#0a1628] leading-none">{reporte.dato}</span>
        {reporte.variacion && (
          <span className={`text-xs font-medium ${varColor}`}>{reporte.variacion}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 border-l border-slate-100 pl-4">
        <p className="text-sm font-semibold text-slate-900 leading-snug truncate">{reporte.titulo}</p>
        {reporte.descripcion && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{reporte.descripcion}</p>
        )}
      </div>

      <span className="text-[10px] text-slate-300 shrink-0 hidden sm:block">{reporte.fecha}</span>
    </motion.div>
  )
}
