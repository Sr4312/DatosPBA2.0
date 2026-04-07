import { useMemo } from 'react'
import { m } from 'framer-motion'
import { reportesRapidos } from '@/components/data/mockData'
import ReporteCard from '@/components/shared/ReporteCard'
import TickerBar from '@/components/shared/TickerBar'

export default function ReportesRapidos() {
  const sorted = useMemo(
    () => [...reportesRapidos].sort((a, b) => (b.fechaOrden || '').localeCompare(a.fechaOrden || '')),
    []
  )

  return (
    <div>
      <TickerBar reportes={sorted} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-[#0a1628] tracking-tight mb-3">Reportes rápidos</h1>
          <p className="text-lg text-slate-600">Datos puntuales, comparativas y hallazgos concisos</p>
        </m.div>

        <div className="flex flex-col gap-3">
          {sorted.map((r, i) => (
            <ReporteCard key={r.id} reporte={r} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
