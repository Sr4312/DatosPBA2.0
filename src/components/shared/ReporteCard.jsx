import { m } from 'framer-motion'
import Cifra from './Cifra'

export default function ReporteCard({ reporte, index = 0 }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/50 px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow"
    >
      <div className="shrink-0 w-32">
        <Cifra
          size="sm"
          valor={reporte.dato}
          variacion={reporte.variacion}
          polaridad={reporte.polaridad ?? 'neutro'}
        />
      </div>

      <div className="flex-1 min-w-0 border-l border-slate-100 dark:border-slate-700 pl-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate">{reporte.titulo}</p>
        {reporte.descripcion && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{reporte.descripcion}</p>
        )}
      </div>

      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block">{reporte.fecha}</span>
    </m.div>
  )
}
