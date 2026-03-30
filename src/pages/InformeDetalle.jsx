import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { informes, visualizaciones } from '@/components/data/mockData'
import VizCard from '@/components/visualizaciones/VizCard'

export default function InformeDetalle() {
  const { id } = useParams()
  const informe = informes.find(inf => inf.id === id)

  if (!informe) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-slate-400 text-sm mb-4">Informe no encontrado.</p>
        <Link to="/informes" className="text-brand-600 hover:text-brand-700 text-sm no-underline">
          ← Volver a informes
        </Link>
      </div>
    )
  }

  // visualizaciones vinculadas a este informe
  const vizRelacionadas = visualizaciones.filter(v => v.informeUrl === `/informes/${id}`)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <Link
          to="/informes"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 no-underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {informe.tema && <Badge variant="secondary">{informe.tema}</Badge>}
            {informe.fecha && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3 h-3" />{informe.fecha}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0a1628] leading-tight tracking-tight mb-4">
            {informe.titulo}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">{informe.bajada}</p>
        </div>

        {/* Municipios */}
        {informe.municipios?.length > 0 && (
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            {informe.municipios.map(m => (
              <span key={m} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{m}</span>
            ))}
          </div>
        )}

        {/* Insights */}
        {informe.insights?.length > 0 && (
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 mb-10">
            <h2 className="text-sm font-semibold text-brand-800 mb-3 uppercase tracking-wide">Hallazgos clave</h2>
            <ul className="space-y-2.5">
              {informe.insights.map((ins, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                  {ins}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Visualizaciones relacionadas */}
        {vizRelacionadas.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#0a1628] mb-5">Visualizaciones</h2>
            <div className="flex flex-col gap-6">
              {vizRelacionadas.map((viz, i) => (
                <VizCard key={viz.id} viz={viz} index={i} />
              ))}
            </div>
          </div>
        )}

      </motion.div>
    </div>
  )
}
