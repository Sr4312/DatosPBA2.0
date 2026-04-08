import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { supabase } from '@/lib/supabase'
import EntryCard from '@/components/shared/EntryCard'
import TickerBar from '@/components/shared/TickerBar'
import MedidorMunicipal from '@/components/MedidorMunicipal'
import { Badge } from '@/components/ui/badge'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler)

function SectionHeader({ title, href }) {
  return (
    <div className="mb-8 flex items-center justify-between border-b-2 border-[#0a1628] pb-3">
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0a1628] leading-none tracking-tight">
        {title}
      </h2>
      <Link to={href} className="text-sm font-medium text-slate-400 hover:text-[#0a1628] no-underline shrink-0 transition-colors">
        Ver todos →
      </Link>
    </div>
  )
}

const XLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

function PublicacionesTicker({ hilos }) {
  const doubled = [...hilos, ...hilos, ...hilos, ...hilos]
  return (
    <section className="mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <SectionHeader title="Publicaciones" href="/hilos" />
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-4 ticker-track" style={{ width: 'max-content' }}>
          {doubled.map((h, i) => (
            <a
              key={i}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-64 shrink-0 bg-white rounded-xl border border-slate-200/60 border-l-4 border-l-purple-400 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow no-underline"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo-icon.svg" alt="DatosPBA" className="w-8 h-8 rounded-full shrink-0 object-cover" />
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-slate-900">DatosPBA</p>
                    <p className="text-[10px] text-slate-400">@datospba</p>
                  </div>
                </div>
                <span className="text-slate-900"><XLogo /></span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed line-clamp-4 flex-1">{h.resumen}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">{h.fecha}</span>
                {h.tema && <Badge variant="secondary" className="text-[10px] py-0">{h.tema}</Badge>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

const CHART_COMPONENTS = { bar: Bar, line: Line }

function getHeroViz(sortedInformes, visualizaciones) {
  for (const inf of sortedInformes) {
    const linked = visualizaciones.filter(v => (v.informe_url ?? v.informeUrl) === inf.url && v.tipo !== 'tabla')
    if (linked.length > 0) {
      const chartData = (v) => v.chart_data ?? v.chartData
      const viz = linked.find(v => (chartData(v)?.datasets?.length ?? 0) > 1) ?? linked[0]
      return { viz, informe: inf }
    }
  }
  return null
}

function HeroVizPanel({ informe, viz }) {
  const chartRef = useRef(null)
  const ChartComponent = CHART_COMPONENTS[viz.tipo] ?? Bar
  const chartData = viz.chart_data ?? viz.chartData
  const chartOptions = viz.chart_options ?? viz.chartOptions

  const darkTicks = { color: 'rgba(255,255,255,0.45)', font: { family: 'Poppins', size: 10 } }
  const darkGrid  = { color: 'rgba(255,255,255,0.07)' }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: (chartData?.datasets?.length ?? 0) > 1,
        position: 'bottom',
        labels: { font: { family: 'Poppins', size: 10 }, color: 'rgba(255,255,255,0.55)', boxWidth: 10, padding: 10 },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ...(chartOptions?.scales?.x ?? {}),
        ticks: { ...(chartOptions?.scales?.x?.ticks ?? {}), ...darkTicks },
        grid: darkGrid,
        title: { ...(chartOptions?.scales?.x?.title ?? {}), color: 'rgba(255,255,255,0.3)' },
      },
      y: {
        ...(chartOptions?.scales?.y ?? {}),
        ticks: { ...(chartOptions?.scales?.y?.ticks ?? {}), ...darkTicks },
        grid: darkGrid,
        title: { ...(chartOptions?.scales?.y?.title ?? {}), color: 'rgba(255,255,255,0.3)' },
      },
    },
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className="w-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
        <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-[0.18em]">
          Último informe
        </span>
      </div>

      <p className="text-base font-semibold text-white leading-snug mb-4 line-clamp-2">
        {informe.titulo}
      </p>

      <div style={{ height: 260 }}>
        <ChartComponent ref={chartRef} data={chartData} options={options} />
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
          {informe.bajada}
        </p>
        <Link
          to={informe.url}
          className="inline-block mt-2 text-xs font-semibold text-brand-400 hover:text-brand-300 no-underline transition-colors"
        >
          Ver informe completo →
        </Link>
      </div>
    </m.div>
  )
}

export default function Home() {
  const [informes, setInformes] = useState([])
  const [reportes, setReportes] = useState([])
  const [hilos, setHilos] = useState([])
  const [visualizaciones, setVisualizaciones] = useState([])

  useEffect(() => {
    Promise.all([
      supabase.from('informes').select('*').order('fecha_orden', { ascending: false }),
      supabase.from('reportes_rapidos').select('*').order('fecha_orden', { ascending: false }),
      supabase.from('hilos').select('*').order('fecha_orden', { ascending: false }),
      supabase.from('visualizaciones').select('*'),
    ]).then(([{ data: inf }, { data: rep }, { data: hil }, { data: viz }]) => {
      setInformes(inf || [])
      setReportes(rep || [])
      setHilos(hil || [])
      setVisualizaciones(viz || [])
    })
  }, [])

  const heroData = informes.length && visualizaciones.length
    ? getHeroViz(informes, visualizaciones)
    : null

  return (
    <div>
      <TickerBar reportes={reportes} />

      {/* Hero */}
      <section className="bg-[#0a1628] bg-pattern-dark py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-10 lg:gap-16">

            <m.div
              className="flex-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-brand-400 text-xs font-semibold tracking-[0.2em] uppercase mb-6">
                Provincia de Buenos Aires
              </p>
              <h1 className="font-display text-5xl sm:text-7xl font-normal text-white tracking-tight leading-none">
                Datos<span className="text-brand-400 font-bold">PBA</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mt-5 max-w-sm">
                Datos, análisis e informes sobre política, economía y territorio bonaerense.
              </p>
              <div className="flex gap-8 sm:gap-12 mt-10 pt-8 border-t border-white/10">
                <div>
                  <p className="text-3xl font-bold text-white tabular-nums leading-none">135</p>
                  <p className="text-[11px] text-slate-500 mt-2 uppercase tracking-widest">municipios</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white tabular-nums leading-none">17M+</p>
                  <p className="text-[11px] text-slate-500 mt-2 uppercase tracking-widest">habitantes</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white tabular-nums leading-none">2026</p>
                  <p className="text-[11px] text-slate-500 mt-2 uppercase tracking-widest">actualizado</p>
                </div>
              </div>
            </m.div>

            {heroData && (
              <div className="w-full lg:flex-1 lg:max-w-[500px]">
                <HeroVizPanel viz={heroData.viz} informe={heroData.informe} />
              </div>
            )}

          </div>
        </div>
      </section>

      <div className="py-16">
        <MedidorMunicipal />

        <section className="mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader title="Informes" href="/informes" />
            <div className="grid sm:grid-cols-2 gap-5">
              {informes.slice(0, 4).map((inf, i) => (
                <EntryCard
                  key={inf.id}
                  titulo={inf.titulo}
                  resumen={inf.bajada}
                  fecha={inf.fecha}
                  tema={inf.tema}
                  municipio={inf.municipios?.join(', ')}
                  insights={inf.insights}
                  url={inf.url}
                  imagen={inf.imagen}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>

        <PublicacionesTicker hilos={hilos} />
      </div>
    </div>
  )
}
