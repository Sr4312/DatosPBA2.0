import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { m } from 'framer-motion'
import { BarChart2, Table2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
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

/* ── Reportes: stock-style ticker bar ───────────────────────────────────── */
function ReportesTicker({ reportes }) {
  const doubled = [...reportes, ...reportes, ...reportes, ...reportes]
  return (
    <div className="bg-white border-b border-slate-200 overflow-hidden">
      <div className="flex ticker-track" style={{ width: 'max-content' }}>
        {doubled.map((r, i) => {
          const isUp = r.tendencia === 'sube'
          const isDown = r.tendencia === 'baja'
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 border-r border-slate-100 shrink-0"
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isUp ? 'bg-green-50' : isDown ? 'bg-red-50' : 'bg-slate-50'}`}>
                {isUp ? <TrendingUp className="w-4 h-4 text-green-600" /> : isDown ? <TrendingDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{r.titulo}</span>
                  <span className="text-[10px] text-slate-400">{r.fecha}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0a1628]">{r.dato}</span>
                  {r.variacion && (
                    <span className={`text-xs font-medium ${isUp ? 'text-green-600' : isDown ? 'text-red-500' : 'text-slate-400'}`}>{r.variacion}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
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

          <div className="w-full flex-1 overflow-hidden">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vizs.map((viz, i) => {
            const Icon = TIPO_ICON[viz.tipo] ?? BarChart2
            const ChartComponent = viz.tipo !== 'tabla' ? CHART_COMPONENTS[viz.tipo] ?? Bar : null
            return (
              <m.div
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
              </m.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── Datasets: row design with stats ──────────────────────────────────────── */
function DatasetsSection({ dsets }) {
  const visible = dsets.slice(0, 5)
  const hasMore = dsets.length > 5
  return (
    <section className="mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="Datasets" href="/datos" />
        <div className="flex flex-col gap-2">
          {visible.map((ds, i) => (
            <m.div
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
            </m.div>
          ))}
        </div>
        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Link
              to="/datos"
              className="px-6 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all no-underline"
            >
              Ver más →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

const RADAR_THEMES = [
  { id: 'Economía',                     lines: ['Economía'],                        deg: 0   },
  { id: 'Demografía',                   lines: ['Demografía'],                      deg: 60  },
  { id: 'Educación',                    lines: ['Educación'],                       deg: 120 },
  { id: 'Pobreza y desigualdad',        lines: ['Pobreza y', 'desigualdad'],        deg: 180 },
  { id: 'Territorio e infraestructura', lines: ['Territorio e', 'infraestructura'], deg: 240 },
  { id: 'Instituciones y gobernanza',   lines: ['Instituciones y', 'gobernanza'],   deg: 300 },
]

// counts[i]: aesthetic values per theme (Economía, Demografía, Educación, Pobreza, Territorio, Instituciones)
const RADAR_SERIES = [
  { id: 'informes',        label: 'Informes',        color: '#60a5fa', counts: [4, 1, 2, 3, 1, 1] },
  { id: 'publicaciones',   label: 'Publicaciones',   color: '#c084fc', counts: [3, 2, 2, 2, 1, 3] },
  { id: 'visualizaciones', label: 'Visualizaciones', color: '#2dd4bf', counts: [2, 3, 1, 2, 2, 4] },
  { id: 'datasets',        label: 'Datasets',        color: '#fbbf24', counts: [4, 2, 3, 1, 3, 1] },
]

function RadarChart() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)

  const MAX = 4
  const cx = 260, cy = 220, R = 130
  const toRad = deg => (deg - 90) * Math.PI / 180
  const pt = (deg, scale = 1) => {
    const a = toRad(deg)
    return [cx + R * scale * Math.cos(a), cy + R * scale * Math.sin(a)]
  }
  const hexPath = scale => {
    const pts = RADAR_THEMES.map(t => pt(t.deg, scale))
    return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z'
  }
  const seriesPath = counts => {
    const pts = RADAR_THEMES.map((t, i) => pt(t.deg, counts[i] / MAX))
    return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z'
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <svg viewBox="0 0 520 455" className="w-full" style={{ maxHeight: '400px' }}>
        {[0.25, 0.5, 0.75, 1.0].map(v => (
          <path key={v} d={hexPath(v)} fill="none"
            stroke={v === 1.0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}
            strokeWidth={v === 1.0 ? 1.2 : 0.7} />
        ))}
        {RADAR_THEMES.map(t => {
          const [x, y] = pt(t.deg)
          return <line key={t.id} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)}
            stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        })}
        {[...RADAR_SERIES]
          .sort((a, b) => (hovered === a.id ? 1 : 0) - (hovered === b.id ? 1 : 0))
          .map(s => {
            const isHov = hovered === s.id
            const dimmed = hovered !== null && !isHov
            return (
              <path key={s.id} d={seriesPath(s.counts)}
                fill={s.color + (isHov ? '44' : '1e')}
                stroke={s.color}
                strokeWidth={isHov ? 2.5 : 1.5}
                opacity={dimmed ? 0.25 : 1}
                style={{ transition: 'all 0.2s' }} />
            )
          })}
        {RADAR_SERIES.flatMap(s =>
          RADAR_THEMES.map((t, i) => {
            if (s.counts[i] === 0) return null
            const isHov = hovered === s.id
            const dimmed = hovered !== null && !isHov
            const [x, y] = pt(t.deg, s.counts[i] / MAX)
            return (
              <circle key={`${s.id}-${t.id}`}
                cx={x.toFixed(1)} cy={y.toFixed(1)}
                r={isHov ? 5 : 3.5} fill={s.color}
                opacity={dimmed ? 0.25 : isHov ? 1 : 0.85}
                style={{ transition: 'all 0.2s' }} />
            )
          })
        )}
        {RADAR_THEMES.map(t => {
          const [lx, ly] = pt(t.deg, 1.5)
          const anchor = (t.deg < 30 || t.deg > 330) ? 'middle'
            : (t.deg > 150 && t.deg < 210) ? 'middle'
            : t.deg < 180 ? 'start' : 'end'
          return (
            <g key={t.id} style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/beta?theme=${encodeURIComponent(t.id)}`)}>
              {t.lines.map((line, j) => (
                <text key={j}
                  x={lx.toFixed(1)}
                  y={(ly + j * 13 - (t.lines.length - 1) * 6.5).toFixed(1)}
                  textAnchor={anchor} fontSize="16"
                  fill="rgba(255,255,255,0.7)"
                  fontFamily="inherit" fontWeight="600"
                  style={{ userSelect: 'none' }}>
                  {line}
                </text>
              ))}
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-2 justify-center">
        {RADAR_SERIES.map(s => (
          <button key={s.id}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
            style={{
              fontSize: '12px', fontWeight: 500,
              background: hovered === s.id ? s.color + '28' : 'rgba(255,255,255,0.06)',
              color: hovered === s.id ? s.color : 'rgba(255,255,255,0.55)',
              border: `1px solid ${hovered === s.id ? s.color + '55' : 'rgba(255,255,255,0.1)'}`,
            }}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
      </div>
    </div>
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
      {/* Reportes rápidos — ticker */}
      <ReportesTicker reportes={allReportes} />

      {/* Hero */}
      <section className="bg-[#0a1628] bg-pattern-dark py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-8 lg:gap-12">

            {/* Izquierda: texto */}
            <m.div
              className="flex-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-brand-400 text-xs font-semibold tracking-[0.2em] uppercase mb-8">
                Provincia de Buenos Aires
              </p>
              <h1 className="text-5xl sm:text-7xl font-normal text-white tracking-tight leading-none mb-6">
                Datos<span className="text-brand-400 font-bold">PBA</span>
              </h1>
              <div className="flex gap-6 sm:gap-10 pt-8">
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
            </m.div>

            {/* Derecha: radar por temática */}
            <div className="w-full lg:flex-1 lg:max-w-[500px]">
              <RadarChart />
            </div>

          </div>
        </div>
      </section>

      <div className="py-16">
        {/* 1. Medidor Municipal */}
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
