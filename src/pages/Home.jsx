import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, Table2 } from 'lucide-react'
import { informes, datasets, hilos, reportesRapidos, visualizaciones } from '@/components/data/mockData'
import EntryCard from '@/components/shared/EntryCard'
import { Badge } from '@/components/ui/badge'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

const byDate = arr => [...arr].sort((a, b) => (b.fechaOrden || '').localeCompare(a.fechaOrden || ''))

const TIPO_ICON  = { bar: BarChart2, line: BarChart2, tabla: Table2 }
const TIPO_LABEL = { bar: 'Gráfico de barras', line: 'Serie temporal', tabla: 'Tabla' }
const CHART_COMPONENTS = { bar: Bar, line: Line }

const MINI_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: {
    x: { ticks: { display: false }, grid: { display: false }, border: { display: false } },
    y: { ticks: { display: false }, grid: { display: false }, border: { display: false } },
  },
  animation: false,
}

function SectionHeader({ title, href }) {
  return (
    <div className="mb-8 flex items-end justify-between border-b border-slate-200 pb-4">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] leading-none tracking-tight">
        {title}
      </h2>
      <Link to={href} className="text-sm font-medium text-brand-600 hover:text-brand-700 no-underline shrink-0 mb-0.5">
        Ver todos →
      </Link>
    </div>
  )
}

/* ── Reportes: título a la izquierda + ticker horizontal a la derecha ───── */
function ReportesTicker({ reportes }) {
  const doubled = [...reportes, ...reportes, ...reportes, ...reportes]
  return (
    <section className="mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Ver todos arriba a la derecha */}
        <div className="flex justify-end mb-3">
          <Link to="/reportes" className="text-sm font-medium text-brand-600 hover:text-brand-700 no-underline">
            Ver todos →
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 items-center">

          {/* Izquierda: título centrado verticalmente */}
          <div className="sm:w-2/5 shrink-0 flex items-center justify-start sm:justify-start">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] leading-none tracking-tight">
              Reportes rápidos
            </h2>
          </div>

          {/* Derecha: ticker horizontal */}
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-4 ticker-track" style={{ width: 'max-content' }}>
              {doubled.map((r, i) => (
                <div
                  key={i}
                  className="w-44 shrink-0 bg-white rounded-2xl border border-slate-200/60 p-4 flex flex-col gap-2 shadow-sm"
                >
                  {r.tema && (
                    <Badge variant="secondary" className="w-fit text-[10px] py-0">{r.tema}</Badge>
                  )}
                  <div className="text-2xl font-bold text-[#0a1628] leading-none">{r.dato}</div>
                  <p className="text-xs font-medium text-slate-700 leading-snug line-clamp-2">{r.titulo}</p>
                  <p className="text-[10px] text-slate-400 mt-auto">{r.fuente}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

const XLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

/* ── Publicaciones: título a la izquierda + tweet ciclando a la derecha ─── */
function PublicacionesTicker({ hilos }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % hilos.length), 4000)
    return () => clearInterval(t)
  }, [hilos.length])

  const h = hilos[idx]

  return (
    <section className="mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-8 items-center">

          {/* Izquierda: título centrado */}
          <div className="flex flex-col items-center justify-center text-center sm:w-1/2 gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] leading-none tracking-tight">
              Publicaciones
            </h2>
            <Link to="/hilos" className="text-sm font-medium text-brand-600 hover:text-brand-700 no-underline">
              Ver todos →
            </Link>
          </div>

          {/* Derecha: tweet ciclando — formato celular */}
          <div className="flex justify-center sm:w-1/2 w-full">
            <div className="w-72 relative" style={{ height: '288px' }}>
              <AnimatePresence mode="wait">
                <motion.a
                  key={h.id}
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-white rounded-3xl border border-slate-200 p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow shadow-md no-underline cursor-pointer"
                  style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">DP</span>
                      </div>
                      <div className="leading-tight">
                        <p className="text-sm font-bold text-slate-900">Datos PBA</p>
                        <p className="text-xs text-slate-400">@datospba</p>
                      </div>
                    </div>
                    <span className="text-slate-900"><XLogo /></span>
                  </div>

                  {/* Texto del tweet */}
                  <p className="text-sm text-slate-800 leading-relaxed line-clamp-5 flex-1">
                    {h.resumen}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{h.fecha}</span>
                    {h.tema && <Badge variant="secondary" className="text-[10px] py-0">{h.tema}</Badge>}
                  </div>
                </motion.a>
              </AnimatePresence>
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {hilos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-brand-500' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ── Visualizaciones: compact multi-card grid ──────────────────────────── */
function VizMiniGrid({ vizs }) {
  return (
    <section className="mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="Visualizaciones" href="/visualizaciones" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {vizs.map((viz, i) => {
            const Icon = TIPO_ICON[viz.tipo] ?? BarChart2
            const ChartComponent = viz.tipo !== 'tabla' ? CHART_COMPONENTS[viz.tipo] ?? Bar : null
            return (
              <motion.div
                key={viz.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className="bg-white rounded-2xl border border-slate-200/60 p-4 flex flex-col gap-2 hover:shadow-md transition-shadow shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px]">{TIPO_LABEL[viz.tipo]}</span>
                  </div>
                  {viz.tema && <Badge variant="secondary" className="text-[10px] py-0 shrink-0">{viz.tema}</Badge>}
                </div>
                <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">{viz.titulo}</h3>
                {ChartComponent && viz.chartData ? (
                  <div className="h-20 mt-1">
                    <ChartComponent data={viz.chartData} options={MINI_OPTIONS} />
                  </div>
                ) : (
                  <div className="h-20 mt-1 bg-brand-50 rounded-lg flex items-center justify-center">
                    <Table2 className="w-5 h-5 text-brand-200" />
                  </div>
                )}
                <div className="mt-auto flex flex-col gap-1">
                  <Link
                    to={`/visualizaciones#${viz.id}`}
                    className="text-[11px] text-brand-600 hover:text-brand-700 font-medium no-underline"
                  >
                    Ver completo →
                  </Link>
                  {viz.informeUrl && (
                    <a
                      href={viz.informeUrl}
                      className="text-[11px] text-slate-500 hover:text-slate-700 font-medium no-underline"
                    >
                      Ver informe →
                    </a>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── Datasets: row design with stats ──────────────────────────────────────── */
function DatasetsSection({ dsets }) {
  return (
    <section className="mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="Datasets" href="/datos" />
        <div className="flex flex-col gap-2">
          {dsets.map((ds, i) => (
            <motion.div
              key={ds.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="bg-white rounded-xl border border-slate-200/60 px-5 py-3.5 flex items-center gap-4 hover:shadow-sm hover:border-brand-200 transition-all shadow-sm"
            >
              <div className="shrink-0">
                <Badge variant="secondary" className="font-mono text-[11px]">{ds.formato}</Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{ds.nombre}</p>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{ds.descripcion}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6 shrink-0 text-xs text-slate-500">
                <div className="text-center">
                  <p className="font-semibold text-slate-800">{ds.registros?.toLocaleString('es-AR')}</p>
                  <p className="text-slate-400">registros</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800">{ds.variables}</p>
                  <p className="text-slate-400">variables</p>
                </div>
                <div className="text-center hidden lg:block">
                  <p className="font-semibold text-slate-800 text-xs">{ds.cobertura}</p>
                  <p className="text-slate-400">cobertura</p>
                </div>
                <p className="text-slate-300 text-[11px]">{ds.fechaActualizacion}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const allInformes = byDate(informes)
  const allReportes = byDate(reportesRapidos)
  const allHilos    = byDate(hilos)
  const allViz      = byDate(visualizaciones)
  const allDatasets = byDate(datasets)

  return (
    <div>
      {/* Hero — centered, gradient background */}
      <section className="bg-gradient-to-b from-brand-100 via-brand-50 to-[#f0f8f9] py-24 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold tracking-wide uppercase">
              Provincia de Buenos Aires
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-[#0a1628] tracking-tight mb-5 leading-tight">
              Datos <span className="text-brand-600">PBA</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
              Análisis político basado en evidencia para la Provincia de Buenos Aires.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="py-16">
        {/* 1. Reportes rápidos */}
        <ReportesTicker reportes={allReportes} />

        {/* 2. Informes — full width grid */}
        <section className="mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader title="Informes" href="/informes" />
            <div className="grid sm:grid-cols-2 gap-5">
              {allInformes.slice(0, 4).map((inf, i) => (
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

        {/* 3. Publicaciones — vertical auto-scroll */}
        <PublicacionesTicker hilos={allHilos} />

        {/* 4. Visualizaciones — compact multi-card grid */}
        <VizMiniGrid vizs={allViz} />

        {/* 5. Datasets — row design */}
        <DatasetsSection dsets={allDatasets} />
      </div>
    </div>
  )
}
