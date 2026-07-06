import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import ReporteCard from '@/components/shared/ReporteCard'
import TickerBar from '@/components/shared/TickerBar'

export default function ReportesRapidos() {
  const [reportes, setReportes] = useState([])

  useEffect(() => {
    supabase.from('reportes_rapidos').select('*').order('fecha_orden', { ascending: false })
      .then(({ data }) => setReportes(data || []))
  }, [])

  return (
    <div>
      <TickerBar reportes={reportes} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-display text-4xl font-bold text-[#0a1628] dark:text-slate-100 tracking-tight mb-3">Reportes rápidos</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Datos puntuales, comparativas y hallazgos concisos</p>
        </m.div>

        <div className="flex flex-col gap-3">
          {reportes.map((r, i) => (
            <ReporteCard key={r.id} reporte={r} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
