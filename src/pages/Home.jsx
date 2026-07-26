import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="mb-8 flex items-center justify-between border-b-2 border-[#0F172A] dark:border-slate-700 pb-3">
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-slate-100 leading-none tracking-tight">
        {title}
      </h2>
      <Link to={href} className="text-sm font-medium text-slate-500 hover:text-[#0F172A] dark:hover:text-slate-100 no-underline shrink-0 transition-colors">
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
  if (!hilos.length) return null
  const doubled = [...hilos, ...hilos]
  return (
    <section className="mb-16 py-10 border-y" style={{ borderColor: 'var(--rule)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <SectionHeader title="Publicaciones" href="/hilos" />
      </div>
      <div className="max-w-7xl mx-auto pl-4 sm:pl-6 overflow-hidden relative">
        <div className="flex gap-4 ticker-track" style={{ width: 'max-content' }}>
          {doubled.map((h, i) => (
            <a
              key={i}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-72 shrink-0 bg-white border p-4 flex flex-col gap-3 no-underline hover:border-slate-300 transition-colors"
              style={{ borderColor: 'var(--rule)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo-icon.svg" alt="DatosPBA" className="w-7 h-7 rounded-full shrink-0 object-cover" />
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">DatosPBA</p>
                    <p className="text-[10px] text-slate-500">@datospba</p>
                  </div>
                </div>
                <span className="text-slate-500"><XLogo /></span>
              </div>
              <p className={`text-xs text-slate-700 dark:text-slate-500 leading-relaxed ${h.imagen ? 'line-clamp-3' : 'line-clamp-4 flex-1'}`}>{h.resumen}</p>
              {h.imagen && (
                <img
                  src={h.imagen}
                  alt=""
                  loading="lazy"
                  className="w-full h-28 object-cover rounded-lg border border-slate-200/70 dark:border-slate-700"
                />
              )}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
                <span className="text-[10px] text-slate-500">{h.fecha}</span>
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

function getInformeViz(inf, visualizaciones) {
  const linked = visualizaciones.filter(v => (v.informe_url ?? v.informeUrl) === inf.url && v.tipo !== 'tabla')
  if (linked.length === 0) return null
  const chartData = (v) => v.chart_data ?? v.chartData
  return linked.find(v => (chartData(v)?.datasets?.length ?? 0) > 1) ?? linked[0]
}

function getHeroViz(sortedInformes, visualizaciones) {
  for (const inf of sortedInformes) {
    const viz = getInformeViz(inf, visualizaciones)
    if (viz) return { viz, informe: inf }
  }
  return null
}

function getFeaturedInforme(sortedInformes, visualizaciones) {
  const inf = sortedInformes[0]
  if (!inf) return null
  return { inf, viz: getInformeViz(inf, visualizaciones) }
}

function FeaturedInformeCard({ inf, viz }) {
  const chartRef = useRef(null)
  const ChartComponent = viz ? (CHART_COMPONENTS[viz.tipo] ?? Bar) : null
  const chartData = viz?.chart_data ?? viz?.chartData
  const chartOptions = viz?.chart_options ?? viz?.chartOptions

  const darkTicks = { color: 'rgba(255,255,255,0.62)', font: { family: 'Archivo', size: 10 } }
  const darkGrid = { color: 'rgba(255,255,255,0.07)' }

  const options = viz ? {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: chartOptions?.indexAxis ?? 'x',
    plugins: {
      legend: {
        display: (chartData?.datasets?.length ?? 0) > 1,
        position: 'bottom',
        labels: { font: { family: 'Archivo', size: 10 }, color: 'rgba(255,255,255,0.55)', boxWidth: 10, padding: 10 },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ...(chartOptions?.scales?.x ?? {}),
        ticks: { ...(chartOptions?.scales?.x?.ticks ?? {}), ...darkTicks },
        grid: darkGrid,
        title: { ...(chartOptions?.scales?.x?.title ?? {}), color: 'rgba(255,255,255,0.45)' },
      },
      y: {
        ...(chartOptions?.scales?.y ?? {}),
        ticks: { ...(chartOptions?.scales?.y?.ticks ?? {}), ...darkTicks },
        grid: darkGrid,
        title: { ...(chartOptions?.scales?.y?.title ?? {}), color: 'rgba(255,255,255,0.45)' },
      },
    },
  } : null

  return (
    <div className="bg-white border overflow-hidden grid lg:grid-cols-5 mb-5" style={{ borderColor: 'var(--rule)' }}>
      <div className="lg:col-span-3 p-6 sm:p-8 flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {inf.tema && <Badge>{inf.tema}</Badge>}
          {inf.fecha && <span className="text-xs text-slate-500">{inf.fecha}</span>}
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight tracking-tight">
          {inf.titulo}
        </h3>
        {inf.bajada && <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{inf.bajada}</p>}
        <Link to={inf.url} className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 no-underline pt-2">
          Leer informe →
        </Link>
      </div>

      <div className="lg:col-span-2 bg-[#0F172A] p-6 sm:p-7 flex flex-col">
        {viz && ChartComponent ? (
          <div className="flex-1 min-h-[240px]">
            <ChartComponent ref={chartRef} data={chartData} options={options} />
          </div>
        ) : (
          <p className="text-white/70 text-sm leading-relaxed">{inf.bajada}</p>
        )}
      </div>
    </div>
  )
}

function HeroVizPanel({ informe, viz }) {
  const chartRef = useRef(null)
  const ChartComponent = CHART_COMPONENTS[viz.tipo] ?? Bar
  const chartData = viz.chart_data ?? viz.chartData
  const chartOptions = viz.chart_options ?? viz.chartOptions

  const darkTicks = { color: 'rgba(255,255,255,0.62)', font: { family: 'Archivo', size: 10 } }
  const darkGrid  = { color: 'rgba(255,255,255,0.07)' }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: chartOptions?.indexAxis ?? 'x',
    plugins: {
      legend: {
        display: (chartData?.datasets?.length ?? 0) > 1,
        position: 'bottom',
        labels: { font: { family: 'Archivo', size: 10 }, color: 'rgba(255,255,255,0.55)', boxWidth: 10, padding: 10 },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ...(chartOptions?.scales?.x ?? {}),
        ticks: { ...(chartOptions?.scales?.x?.ticks ?? {}), ...darkTicks },
        grid: darkGrid,
        title: { ...(chartOptions?.scales?.x?.title ?? {}), color: 'rgba(255,255,255,0.45)' },
      },
      y: {
        ...(chartOptions?.scales?.y ?? {}),
        ticks: { ...(chartOptions?.scales?.y?.ticks ?? {}), ...darkTicks },
        grid: darkGrid,
        title: { ...(chartOptions?.scales?.y?.title ?? {}), color: 'rgba(255,255,255,0.45)' },
      },
    },
  }

  return (
    <div className="w-full flex flex-col">
      <p className="text-caption text-slate-400 mb-3">Último informe</p>

      <p className="text-base font-semibold text-white leading-snug mb-4 line-clamp-2">
        {informe.titulo}
      </p>

      <div style={{ height: 260 }}>
        <ChartComponent ref={chartRef} data={chartData} options={options} />
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
          {informe.bajada}
        </p>
        <Link
          to={informe.url}
          className="inline-block mt-2 text-xs font-semibold text-brand-400 hover:text-brand-300 no-underline transition-colors"
        >
          Ver informe completo →
        </Link>
      </div>
    </div>
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

  const featuredInforme = informes.length
    ? getFeaturedInforme(informes, visualizaciones)
    : null

  const gridInformes = featuredInforme
    ? informes.filter(i => i.id !== featuredInforme.inf.id).slice(0, 4)
    : informes.slice(0, 4)

  return (
    <div>
      <TickerBar reportes={reportes} />

      {/* Hero */}
      <section className="bg-[#0F172A] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-10 lg:gap-16">

            <div className="flex-1">
              <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.08]">
                Periodismo de datos sobre la provincia de Buenos Aires.
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mt-5 max-w-md">
                Informes sobre economía, trabajo y gestión pública de los 135 municipios.
                Cada cifra publica su fuente, su período y su nota metodológica.
              </p>
            </div>

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

            {featuredInforme && (
              <FeaturedInformeCard inf={featuredInforme.inf} viz={featuredInforme.viz} />
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              {gridInformes.map((inf, i) => (
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
