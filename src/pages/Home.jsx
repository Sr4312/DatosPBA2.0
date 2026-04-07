import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { m } from 'framer-motion'
import { informes, hilos, reportesRapidos } from '@/components/data/mockData'
import EntryCard from '@/components/shared/EntryCard'
import TickerBar from '@/components/shared/TickerBar'
import MedidorMunicipal from '@/components/MedidorMunicipal'
import { Badge } from '@/components/ui/badge'

const byDate = arr => [...arr].sort((a, b) => (b.fechaOrden || '').localeCompare(a.fechaOrden || ''))

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

/* ── Publicaciones: header estándar + ticker de tweets ── */
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
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let id
    let start = null
    const duration = 1400
    function step(ts) {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setProgress(1 - Math.pow(1 - p, 3)) // ease-out cubic
      if (p < 1) id = requestAnimationFrame(step)
    }
    id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [])

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
    const pts = RADAR_THEMES.map((t, i) => pt(t.deg, counts[i] / MAX * progress))
    return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z'
  }

  const gridOpacity  = Math.min(progress * 3, 1)
  const labelOpacity = Math.max(0, (progress - 0.4) / 0.6)
  const legendOpacity = Math.max(0, (progress - 0.7) / 0.3)

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <svg viewBox="0 0 520 455" className="w-full" style={{ maxHeight: '400px' }}>
        {[0.25, 0.5, 0.75, 1.0].map(v => (
          <path key={v} d={hexPath(v)} fill="none"
            stroke={v === 1.0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}
            strokeWidth={v === 1.0 ? 1.2 : 0.7}
            opacity={gridOpacity} />
        ))}
        {RADAR_THEMES.map(t => {
          const [x, y] = pt(t.deg)
          return <line key={t.id} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)}
            stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"
            opacity={gridOpacity} />
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
                style={{ transition: 'opacity 0.2s, stroke-width 0.2s, fill 0.2s' }} />
            )
          })}
        {RADAR_SERIES.flatMap(s =>
          RADAR_THEMES.map((t, i) => {
            if (s.counts[i] === 0) return null
            const isHov = hovered === s.id
            const dimmed = hovered !== null && !isHov
            const [x, y] = pt(t.deg, s.counts[i] / MAX * progress)
            return (
              <circle key={`${s.id}-${t.id}`}
                cx={x.toFixed(1)} cy={y.toFixed(1)}
                r={isHov ? 5 : 3.5} fill={s.color}
                opacity={dimmed ? 0.25 : isHov ? 1 : 0.85}
                style={{ transition: 'r 0.2s, opacity 0.2s' }} />
            )
          })
        )}
        {RADAR_THEMES.map(t => {
          const [lx, ly] = pt(t.deg, 1.5)
          const anchor = (t.deg < 30 || t.deg > 330) ? 'middle'
            : (t.deg > 150 && t.deg < 210) ? 'middle'
            : t.deg < 180 ? 'start' : 'end'
          return (
            <g key={t.id} style={{ cursor: 'pointer', opacity: labelOpacity }}
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
      <div className="flex flex-wrap gap-2 justify-center" style={{ opacity: legendOpacity }}>
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

const allInformes = byDate(informes)
const allReportes = byDate(reportesRapidos)
const allHilos    = byDate(hilos)

export default function Home() {

  return (
    <div>
      {/* Reportes rápidos — ticker */}
      <TickerBar reportes={allReportes} />

      {/* Hero */}
      <section className="bg-[#0a1628] bg-pattern-dark py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-10 lg:gap-16">

            {/* Izquierda: texto */}
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
                  <p className="text-3xl font-bold text-white tabular-nums leading-none">2025</p>
                  <p className="text-[11px] text-slate-500 mt-2 uppercase tracking-widest">actualizado</p>
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

      </div>
    </div>
  )
}
