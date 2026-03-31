import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart2, Table2 } from 'lucide-react'
import { informes, datasets, hilos, reportesRapidos, visualizaciones } from '@/components/data/mockData'
import EntryCard from '@/components/shared/EntryCard'
import MedidorMunicipal from '@/components/MedidorMunicipal'
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
    <div className="mb-8 flex items-center justify-between border-b-2 border-[#0a1628] pb-3">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] leading-none tracking-tight">
        {title}
      </h2>
      <Link to={href} className="text-sm font-medium text-slate-400 hover:text-[#0a1628] no-underline shrink-0 transition-colors">
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

        <div className="flex justify-end mb-3">
          <Link to="/reportes" className="text-sm font-medium text-slate-400 hover:text-[#0a1628] no-underline transition-colors">
            Ver todos →
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 items-center">

          <div className="sm:w-2/5 shrink-0 flex items-center justify-start">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] leading-none tracking-tight">
              Reportes rápidos
            </h2>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex gap-4 ticker-track" style={{ width: 'max-content' }}>
              {doubled.map((r, i) => (
                <div
                  key={i}
                  className="w-44 shrink-0 bg-white rounded-xl border border-slate-200/60 p-4 flex flex-col gap-2 shadow-sm"
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

/* ── Publicaciones: título a la izquierda + ticker de tweets a la derecha ── */
function PublicacionesTicker({ hilos }) {
  const doubled = [...hilos, ...hilos, ...hilos, ...hilos]
  return (
    <section className="mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex justify-end mb-3">
          <Link to="/hilos" className="text-sm font-medium text-slate-400 hover:text-[#0a1628] no-underline transition-colors">
            Ver todos →
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 items-center">

          <div className="sm:w-2/5 shrink-0 flex items-center justify-start">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] leading-none tracking-tight">
              Publicaciones
            </h2>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex gap-4 ticker-track" style={{ width: 'max-content' }}>
              {doubled.map((h, i) => (
                <a
                  key={i}
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-64 shrink-0 bg-white rounded-xl border border-slate-200/60 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow no-underline"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/logo-icon.png" alt="DataPBA" className="w-8 h-8 rounded-full shrink-0 object-cover" />
                      <div className="leading-tight">
                        <p className="text-xs font-bold text-slate-900">DataPBA</p>
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
                className="bg-white rounded-xl border border-slate-200/60 p-4 flex flex-col gap-2 hover:shadow-md transition-shadow shadow-sm"
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

const BUBBLES = [
  { id: 'Economía',                     lines: ['Economía'],                        r: 75, cx: 195, cy: 170, color: '#93c5fd', anim: 'drift-a', dur: '7s',  delay: '0s'   },
  { id: 'Pobreza y desigualdad',        lines: ['Pobreza y', 'desigualdad'],        r: 58, cx: 340, cy: 80,  color: '#cbd5e1', anim: 'drift-b', dur: '8.5s',delay: '0.8s' },
  { id: 'Educación',                    lines: ['Educación'],                       r: 52, cx: 68,  cy: 252, color: '#7dd3fc', anim: 'drift-c', dur: '9s',  delay: '1.4s' },
  { id: 'Instituciones y gobernanza',   lines: ['Instituciones', 'y gobernanza'],   r: 44, cx: 348, cy: 258, color: '#c4b5fd', anim: 'drift-d', dur: '7.8s',delay: '0.4s' },
  { id: 'Demografía',                   lines: ['Demografía'],                      r: 35, cx: 220, cy: 42,  color: '#e2e8f0', anim: 'drift-e', dur: '6.5s',delay: '2s'   },
  { id: 'Territorio e infraestructura', lines: ['Territorio e', 'infraestructura'], r: 35, cx: 52,  cy: 110, color: '#a5f3fc', anim: 'drift-f', dur: '10s', delay: '0.2s' },
]

function BubbleChart() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)

  return (
    <svg viewBox="0 0 420 310" className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <style>{`
          @keyframes drift-a {
            0%   { transform: translate(0px,   0px); }
            20%  { transform: translate(5px,  -8px); }
            45%  { transform: translate(-4px, -5px); }
            70%  { transform: translate(3px,  -12px); }
            100% { transform: translate(0px,   0px); }
          }
          @keyframes drift-b {
            0%   { transform: translate(0px,   0px); }
            25%  { transform: translate(-6px, -7px); }
            55%  { transform: translate(4px,  -10px); }
            80%  { transform: translate(-3px, -3px); }
            100% { transform: translate(0px,   0px); }
          }
          @keyframes drift-c {
            0%   { transform: translate(0px,   0px); }
            30%  { transform: translate(6px,  -6px); }
            60%  { transform: translate(-5px, -9px); }
            85%  { transform: translate(3px,  -4px); }
            100% { transform: translate(0px,   0px); }
          }
          @keyframes drift-d {
            0%   { transform: translate(0px,   0px); }
            35%  { transform: translate(-4px, -10px); }
            65%  { transform: translate(6px,  -6px); }
            100% { transform: translate(0px,   0px); }
          }
          @keyframes drift-e {
            0%   { transform: translate(0px,   0px); }
            40%  { transform: translate(5px,  -9px); }
            70%  { transform: translate(-6px, -5px); }
            100% { transform: translate(0px,   0px); }
          }
          @keyframes drift-f {
            0%   { transform: translate(0px,   0px); }
            20%  { transform: translate(-5px, -7px); }
            50%  { transform: translate(4px,  -11px); }
            75%  { transform: translate(-3px, -4px); }
            100% { transform: translate(0px,   0px); }
          }
        `}</style>
        {BUBBLES.map(b => {
          const gid = `grad-${b.id.replace(/[\s&]/g, '-')}`
          return (
            <radialGradient key={gid} id={gid} cx="40%" cy="35%" r="70%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="50%"  stopColor={b.color}  stopOpacity="0.18" />
              <stop offset="100%" stopColor={b.color}  stopOpacity="0.06" />
            </radialGradient>
          )
        })}
      </defs>

      {BUBBLES.map(b => {
        const isHov = hovered === b.id
        const gradId = `grad-${b.id.replace(/[\s&]/g, '-')}`
        const lineH = b.r < 42 ? 11 : b.r < 55 ? 12 : 13
        const fontSize = b.r < 42 ? 9.5 : b.r < 55 ? 10.5 : b.r < 65 ? 11.5 : 13
        const totalH = (b.lines.length - 1) * lineH

        return (
          <g
            key={b.id}
            style={{
              animation: `${b.anim} ${b.dur} ease-in-out infinite`,
              animationDelay: b.delay,
              animationPlayState: isHov ? 'paused' : 'running',
            }}
          >
            <g
              style={{
                cursor: 'pointer',
                transformOrigin: `${b.cx}px ${b.cy}px`,
                transform: isHov ? 'scale(1.14)' : 'scale(1)',
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(`/beta?theme=${encodeURIComponent(b.id)}`)}
            >
              {/* Outer dashed ring */}
              <circle
                cx={b.cx} cy={b.cy} r={b.r + 7}
                fill="none"
                stroke={b.color}
                strokeWidth="0.5"
                strokeOpacity={isHov ? 0.3 : 0}
                strokeDasharray="3 5"
                style={{ transition: 'stroke-opacity 0.3s' }}
              />
              {/* Main bubble — ghost style */}
              <circle
                cx={b.cx} cy={b.cy} r={b.r}
                fill={`url(#${gradId})`}
                stroke={b.color}
                strokeWidth="0.8"
                strokeOpacity={isHov ? 0.7 : 0.3}
                style={{
                  transition: 'stroke-opacity 0.25s',
                  filter: isHov ? `drop-shadow(0 0 8px ${b.color}55)` : 'none',
                }}
              />
              {/* Labels */}
              {b.lines.map((line, i) => (
                <text
                  key={i}
                  x={b.cx}
                  y={b.cy - totalH / 2 + i * lineH + fontSize * 0.35}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fill={isHov ? '#ffffff' : 'rgba(255,255,255,0.82)'}
                  fontFamily="inherit"
                  fontWeight={isHov ? '600' : '400'}
                  style={{ transition: 'fill 0.2s', userSelect: 'none' }}
                >
                  {line}
                </text>
              ))}
            </g>
          </g>
        )
      })}
    </svg>
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
      {/* Hero */}
      <section className="bg-[#0a1628] py-12 sm:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-12">

            {/* Izquierda: texto */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-brand-400 text-xs font-semibold tracking-[0.2em] uppercase mb-8">
                Provincia de Buenos Aires
              </p>
              <h1 className="text-5xl sm:text-7xl font-normal text-white tracking-tight leading-none mb-6">
                Data<span className="text-brand-400 font-bold">PBA</span>
              </h1>
              <p className="text-base text-slate-400 max-w-md leading-relaxed mb-10">
                Análisis político basado en evidencia para la Provincia de Buenos Aires.
              </p>
              <div className="flex gap-10 pt-8 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white">135</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">municipios</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">17M+</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">habitantes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">2025</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">datos actualizados</p>
                </div>
              </div>
            </motion.div>

            {/* Derecha: burbujas por temática */}
            <motion.div
              className="hidden lg:flex flex-1 items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{ minWidth: 0, maxWidth: '500px' }}
            >
              <BubbleChart />
            </motion.div>

          </div>
        </div>
      </section>

      <div className="py-16">
        {/* 1. Reportes rápidos */}
        <ReportesTicker reportes={allReportes} />

        {/* 2. Medidor Municipal */}
        <MedidorMunicipal />

        {/* Informes — full width grid */}
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
