import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { Calendar, MapPin, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import VizCard from '@/components/visualizaciones/VizCard'

export default function InformeDetalle() {
  const { id } = useParams()
  const [informe, setInforme] = useState(null)
  const [vizRelacionadas, setVizRelacionadas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('informes').select('*').eq('id', id).single(),
      supabase.from('visualizaciones').select('*').eq('informe_url', `/informes/${id}`),
    ]).then(([{ data: inf }, { data: viz }]) => {
      setInforme(inf)
      setVizRelacionadas(viz || [])
      setLoading(false)
    })
  }, [id])

  if (loading) return null

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <Link
          to="/informes"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 no-underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

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

        {informe.municipios?.length > 0 && (
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            {informe.municipios.map(m => (
              <span key={m} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{m}</span>
            ))}
          </div>
        )}

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

        {informe.cuerpo?.length > 0 && (
          <div className="prose prose-slate max-w-none mb-10 space-y-4">
            {informe.cuerpo.map((parrafo, i) => (
              <p key={i} className="text-base text-slate-700 leading-relaxed">{parrafo}</p>
            ))}
          </div>
        )}

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

      </m.div>
    </div>
  )
}
