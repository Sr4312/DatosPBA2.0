import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft, Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler
)

ChartJS.defaults.font.family = 'Poppins, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'

const C = {
  bg:       'var(--c-bg)',
  ink:      'var(--c-ink)',
  inkMid:   'var(--c-ink-mid)',
  inkLight: 'var(--c-ink-light)',
  rule:     'var(--c-rule)',
  card:     'var(--c-surface)',
  hero:     '#0a1628',
  accent:   '#3d65b2',
}

const D = {
  red:    '#dc2626',
  redBg:  '#fef2f2',
  green:  '#16a34a',
  greenBg:'#f0fdf4',
  warn:   '#b45309',
  warnBg: '#fef3c7',
  amber:  '#d97706',
}

// ─── DATOS ───────────────────────────────────────────────────
// Fuente: Empiria, "Ranking fiscal provincial 2025" - Informe económico N°531 (22 jun. 2026), en base a MECON y DNAP.

// Resultado primario, Nación (eje x) vs Provincias (eje y), en % del PBI.
// 2024 (+0,4%) y 2025 (-0,1%) en provincias están confirmados por el texto del informe.
// El resto de la serie (2011-2023) y el eje Nación son una reconstrucción visual
// aproximada a partir del gráfico de cuadrantes publicado por Empiria.
const PUNTOS_CUADRANTE = [
  { year: 2011, nacion: -3.0, provincias: -0.65 },
  { year: 2012, nacion: -3.0, provincias: -0.30 },
  { year: 2013, nacion: -2.3, provincias: -0.05 },
  { year: 2014, nacion: -3.5, provincias:  0.13 },
  { year: 2015, nacion: -4.0, provincias: -0.70 },
  { year: 2016, nacion: -5.0, provincias: -0.55 },
  { year: 2017, nacion: -5.5, provincias: -0.45 },
  { year: 2018, nacion: -4.0, provincias:  0.40 },
  { year: 2019, nacion: -3.3, provincias:  0.15 },
  { year: 2020, nacion: -7.0, provincias:  0.30 },
  { year: 2021, nacion: -2.5, provincias:  0.60 },
  { year: 2022, nacion: -2.0, provincias:  0.70 },
  { year: 2023, nacion: -3.5, provincias:  0.05 },
  { year: 2024, nacion:  2.0, provincias:  0.40, destacado: true },
  { year: 2025, nacion:  1.7, provincias: -0.10, destacado: true },
]

const GASTO_INGRESOS = [
  { cat: 'Gasto total\nprovincias',  val: 6,  tipo: 'gasto' },
  { cat: 'Ingresos\nprovincias',     val: 3,  tipo: 'ingreso' },
  { cat: 'Personal',                 val: 7,  tipo: 'gasto' },
  { cat: 'Jubilaciones',             val: 11, tipo: 'gasto' },
  { cat: 'Obra pública',             val: 3,  tipo: 'gasto' },
  { cat: 'Gasto Nación',             val: -2, tipo: 'nacion' },
]

const OBRA_PUBLICA = [
  { provincia: 'Río Negro',   pct: 93 },
  { provincia: 'Santa Cruz',  pct: 78 },
  { provincia: 'San Luis',    pct: -49 },
  { provincia: 'Chaco',       pct: -37 },
]

const HERO_STATS = [
  { n: '−0,1%',  label: 'déficit primario provincial 2025, % del PBI (vs. +0,4% en 2024)', color: '#fda4af' },
  { n: '−0,4%',  label: 'resultado financiero provincial 2025, % del PBI (vs. +0,1% en 2024)', color: '#fda4af' },
  { n: '+7%',    label: 'crecimiento real del gasto en personal, en todas las provincias',  color: '#93c5fd' },
  { n: '4 de 24', label: 'provincias que mejoraron sus cuentas fiscales en 2025',            color: '#6ee7b7' },
]

// ─── ANIMACIÓN ───────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

// ─── DOWNLOAD ────────────────────────────────────────────────

const DL_PADDING  = 60
const DL_FOOTER_H = 56
const DL_MIN_W    = 1200

function drawFooter(ctx, y, w) {
  ctx.fillStyle = '#0a1628'
  ctx.fillRect(0, y, w, DL_FOOTER_H)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.round(w * 0.018)}px Poppins, Roboto, system-ui, sans-serif`
  ctx.fillText('Datos', DL_PADDING, y + DL_FOOTER_H * 0.65)
  ctx.fillStyle = '#60a5fa'
  ctx.fillText('PBA', DL_PADDING + Math.round(w * 0.06), y + DL_FOOTER_H * 0.65)
  ctx.fillStyle = '#94a3b8'
  ctx.font = `${Math.round(w * 0.013)}px Poppins, Roboto, system-ui, sans-serif`
  ctx.fillText('datospba.com', w - DL_PADDING - Math.round(w * 0.11), y + DL_FOOTER_H * 0.65)
}

function triggerDownload(canvas, filename) {
  const a = document.createElement('a')
  a.download = filename.replace(/[^a-zA-Z0-9\-_áéíóúñ ]/g, '').trim() + '.png'
  a.href = canvas.toDataURL('image/png')
  a.click()
}

async function downloadVizContainer(node, title, fuente) {
  const captured = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const upscale = Math.max(1, DL_MIN_W / captured.width)
  const innerW  = Math.round(captured.width * upscale)
  const innerH  = Math.round(captured.height * upscale)
  const titleH  = fuente ? 96 : 72
  const W = innerW
  const H = innerH + titleH + DL_FOOTER_H

  const out = document.createElement('canvas')
  out.width = W; out.height = H
  const ctx = out.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#0a1628'
  ctx.font = `bold ${Math.round(W * 0.020)}px Poppins, Roboto, system-ui, sans-serif`
  ctx.fillText(title, DL_PADDING, Math.round(titleH * 0.52), W - DL_PADDING * 2)

  if (fuente) {
    ctx.fillStyle = '#94a3b8'
    ctx.font = `${Math.round(W * 0.014)}px Poppins, Roboto, system-ui, sans-serif`
    ctx.fillText(`Fuente: ${fuente}`, DL_PADDING, Math.round(titleH * 0.82))
  }

  ctx.drawImage(captured, 0, titleH, innerW, innerH)
  drawFooter(ctx, H - DL_FOOTER_H, W)
  triggerDownload(out, title)
}

function DownloadableViz({ title, fuente = 'Empiria en base a MECON y DNAP', children }) {
  const ref    = useRef(null)
  const btnRef = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    if (!ref.current || busy) return
    setBusy(true)
    if (btnRef.current) btnRef.current.style.visibility = 'hidden'
    try { await downloadVizContainer(ref.current, title, fuente) }
    catch (e) { console.error(e) }
    if (btnRef.current) btnRef.current.style.visibility = ''
    setBusy(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={btnRef} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={handleDownload}
          disabled={busy}
          title="Descargar PNG con marca DatosPBA"
          style={{
            background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 8,
            padding: '6px 10px', cursor: busy ? 'wait' : 'pointer', color: C.inkMid,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.72rem', fontWeight: 600, transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.accent; e.currentTarget.style.borderColor = C.accent }}
          onMouseLeave={e => { e.currentTarget.style.color = C.inkMid; e.currentTarget.style.borderColor = C.rule }}
        >
          <Download style={{ width: 13, height: 13 }} />
          {busy ? 'generando…' : 'Descargar PNG'}
        </button>
      </div>
      <div ref={ref} style={{ background: C.bg }}>
        {children}
      </div>
    </div>
  )
}

function SectionLabel({ children, dark = false, color }) {
  return (
    <p
      style={{ color: color || (dark ? 'rgba(255,255,255,0.5)' : C.accent) }}
      className="text-xs font-semibold tracking-[0.18em] uppercase mb-3"
    >
      {children}
    </p>
  )
}

function MC({ label, value, unit, accent = false }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.rule}`,
      borderLeft: `3px solid ${accent ? C.accent : C.inkLight}`,
      borderRadius: 12,
      padding: '18px 20px',
    }}>
      <p style={{
        fontSize: '0.72rem', fontWeight: 700, color: C.inkMid,
        textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
      }}>
        {label}
      </p>
      <div
        className="font-display"
        style={{ fontSize: '2.2rem', fontWeight: 700, color: accent ? C.accent : C.ink, lineHeight: 1 }}
      >
        {value}
      </div>
      {unit && <p style={{ fontSize: '0.76rem', color: C.inkMid, marginTop: 4 }}>{unit}</p>}
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────

function Hero() {
  return (
    <div className="bg-pattern-dark" style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <Link
          to="/informes"
          className="inline-flex items-center gap-1.5 text-sm no-underline mb-10"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <m.div {...fadeUp(0)}>
          <SectionLabel dark color="#93c5fd">Empiria · Informe económico N°531</SectionLabel>
        </m.div>

        <m.h1
          {...fadeUp(0.05)}
          className="font-display"
          style={{
            fontSize: 'clamp(2rem, 4.6vw, 3.2rem)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.12, marginBottom: 20, maxWidth: 820,
          }}
        >
          El regreso del<br />
          <span style={{ color: '#93c5fd' }}>déficit subnacional</span>
        </m.h1>

        <m.p
          {...fadeUp(0.1)}
          style={{
            color: 'rgba(255,255,255,0.60)', maxWidth: 720,
            lineHeight: 1.7, fontSize: '1.05rem',
          }}
        >
          Por primera vez en 25 años, la Nación registra superávit mientras el conjunto de las
          provincias presenta déficit. Las administraciones provinciales pasaron de un{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>superávit primario de 0,4% del PBI en 2024</strong>{' '}
          a un déficit de 0,1% en 2025, empujadas por un gasto en personal y jubilaciones que
          creció muy por encima de los ingresos.
        </m.p>

        <m.div
          {...fadeUp(0.15)}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
        >
          {HERO_STATS.map((s, i) => (
            <m.div
              key={i}
              {...fadeUp(0.1 * i + 0.2)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 16,
              }}
              className="p-5"
            >
              <div className="font-display text-4xl font-bold mb-1" style={{ color: s.color }}>{s.n}</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.45 }}>{s.label}</p>
            </m.div>
          ))}
        </m.div>

        <m.div
          {...fadeUp(0.3)}
          style={{
            display: 'flex', gap: 32, marginTop: 28,
            paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Fuente',      val: 'Consultora Empiria' },
            { label: 'Base',        val: 'MECON y DNAP' },
            { label: 'Informe',     val: 'Económico N°531' },
            { label: 'Publicado',   val: '22 de junio de 2026' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{item.val}</div>
            </div>
          ))}
        </m.div>
      </div>
    </div>
  )
}

// ─── SECCIÓN 1: CUADRANTE NACIÓN VS PROVINCIAS ────────────────

function ResultadoPrimarioQuadrante() {
  const W = 760, H = 540
  const padL = 76, padR = 76, padT = 36, padB = 56
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const xDomain = [-9, 9]
  const yDomain = [-0.8, 0.8]
  const xScale = v => padL + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * innerW
  const yScale = v => padT + ((yDomain[1] - v) / (yDomain[1] - yDomain[0])) * innerH

  const gridX = [-9, -6, -3, 0, 3, 6, 9]
  const gridY = [0.8, 0.4, 0, -0.4, -0.8]

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: 16, overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 600, height: 'auto', display: 'block' }}>
        {/* Grid */}
        {gridX.map(v => (
          <line key={`x${v}`} x1={xScale(v)} y1={padT} x2={xScale(v)} y2={H - padB}
                stroke={v === 0 ? 'rgba(13,17,23,0.25)' : C.rule} strokeWidth={v === 0 ? 1.5 : 1} />
        ))}
        {gridY.map(v => (
          <line key={`y${v}`} x1={padL} y1={yScale(v)} x2={W - padR} y2={yScale(v)}
                stroke={v === 0 ? 'rgba(13,17,23,0.25)' : C.rule} strokeWidth={v === 0 ? 1.5 : 1} />
        ))}

        {/* Axis ticks */}
        {gridX.map(v => (
          <text key={`xt${v}`} x={xScale(v)} y={H - padB + 18} textAnchor="middle"
                fontSize="11" fill={C.inkLight} fontFamily="Poppins, sans-serif">
            {v > 0 ? `+${v}%` : `${v}%`}
          </text>
        ))}
        {gridY.map(v => (
          <text key={`yt${v}`} x={padL - 10} y={yScale(v) + 4} textAnchor="end"
                fontSize="11" fill={C.inkLight} fontFamily="Poppins, sans-serif">
            {v > 0 ? `+${v.toFixed(1)}%`.replace('.', ',') : `${v.toFixed(1)}%`.replace('.', ',')}
          </text>
        ))}

        {/* Axis titles */}
        <text x={padL + innerW / 2} y={H - 8} textAnchor="middle"
              fontSize="11.5" fontWeight="700" fill={C.inkMid} fontFamily="Poppins, sans-serif">
          Nación
        </text>
        <text x={18} y={padT + innerH / 2} textAnchor="middle"
              fontSize="11.5" fontWeight="700" fill={C.inkMid} fontFamily="Poppins, sans-serif"
              transform={`rotate(-90, 18, ${padT + innerH / 2})`}>
          Provincias
        </text>

        {/* Quadrant labels */}
        <text x={padL + 8} y={padT + 16} fontSize="10.5" fontWeight="700" fill={D.red} fontFamily="Poppins, sans-serif">Déficit Nación</text>
        <text x={padL + 8} y={padT + 30} fontSize="10.5" fontWeight="700" fill={D.red} fontFamily="Poppins, sans-serif">Superávit Provincias</text>

        <text x={W - padR - 8} y={padT + 16} textAnchor="end" fontSize="10.5" fontWeight="700" fill={D.green} fontFamily="Poppins, sans-serif">Superávit Nación</text>
        <text x={W - padR - 8} y={padT + 30} textAnchor="end" fontSize="10.5" fontWeight="700" fill={D.green} fontFamily="Poppins, sans-serif">Superávit Provincias</text>

        <text x={padL + 8} y={H - padB - 24} fontSize="10.5" fontWeight="700" fill={D.red} fontFamily="Poppins, sans-serif">Déficit Nación</text>
        <text x={padL + 8} y={H - padB - 10} fontSize="10.5" fontWeight="700" fill={D.red} fontFamily="Poppins, sans-serif">Déficit Provincias</text>

        <text x={W - padR - 8} y={H - padB - 24} textAnchor="end" fontSize="10.5" fontWeight="700" fill={D.green} fontFamily="Poppins, sans-serif">Superávit Nación</text>
        <text x={W - padR - 8} y={H - padB - 10} textAnchor="end" fontSize="10.5" fontWeight="700" fill={D.green} fontFamily="Poppins, sans-serif">Déficit Provincias</text>

        {/* Puntos */}
        {PUNTOS_CUADRANTE.map(p => {
          const cx = xScale(p.nacion)
          const cy = yScale(p.provincias)
          const r = p.destacado ? 6 : 4.2
          const color = p.destacado ? C.accent : C.inkLight
          return (
            <g key={p.year}>
              <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={p.destacado ? 0.95 : 0.55} stroke="#fff" strokeWidth={1.4} />
              <text x={cx + r + 5} y={cy + 3.5} fontSize={p.destacado ? '11.5' : '10'}
                    fontWeight={p.destacado ? '700' : '500'}
                    fill={p.destacado ? C.accent : C.inkMid} fontFamily="Poppins, sans-serif">
                {p.year}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="text-[11px] mt-3 px-1" style={{ color: C.inkLight }}>
        Valores 2024 (+0,4%) y 2025 (-0,1%) en provincias confirmados por el informe. El resto de la
        serie histórica y el eje Nación son una reconstrucción visual aproximada del gráfico de
        cuadrantes publicado. Fuente: Empiria en base a MECON y DNAP.
      </p>
    </div>
  )
}

// ─── SECCIÓN 2: GASTO VS INGRESOS ─────────────────────────────

function GastoIngresosChart() {
  const data = {
    labels: GASTO_INGRESOS.map(d => d.cat),
    datasets: [{
      label: 'Variación real interanual',
      data: GASTO_INGRESOS.map(d => d.val),
      backgroundColor: GASTO_INGRESOS.map(d =>
        d.tipo === 'nacion' ? D.green : d.tipo === 'ingreso' ? '#94a3b8' : D.amber
      ),
      borderRadius: 5,
      borderSkipped: false,
    }],
  }

  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
        padding: 12, cornerRadius: 8,
        callbacks: { label: ctx => ` ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y}% real i.a.` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: 600 } },
      },
      y: {
        grid: { color: 'rgba(13,17,23,0.09)' },
        ticks: { callback: v => `${v > 0 ? '+' : ''}${v}%` },
      },
    },
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ height: 300 }}>
        <Bar data={data} options={opts} />
      </div>
      <p className="text-[11px] mt-3 px-1" style={{ color: C.inkLight }}>
        Variación real interanual, 2025 vs. 2024. Fuente: Empiria en base a MECON y DNAP.
      </p>
    </div>
  )
}

// ─── SECCIÓN 3: OBRA PÚBLICA ──────────────────────────────────

function ObraPublicaChart() {
  const data = {
    labels: OBRA_PUBLICA.map(p => p.provincia),
    datasets: [{
      label: 'Variación real interanual del gasto en capital',
      data: OBRA_PUBLICA.map(p => p.pct),
      backgroundColor: OBRA_PUBLICA.map(p => p.pct >= 0 ? D.green : D.red),
      borderRadius: 5,
      borderSkipped: false,
    }],
  }

  const opts = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
        padding: 12, cornerRadius: 8,
        callbacks: { label: ctx => ` ${ctx.parsed.x > 0 ? '+' : ''}${ctx.parsed.x}% real i.a.` },
      },
    },
    scales: {
      x: {
        min: -60, max: 100,
        grid: { color: 'rgba(13,17,23,0.09)' },
        ticks: { callback: v => `${v > 0 ? '+' : ''}${v}%` },
      },
      y: {
        grid: { display: false },
        ticks: { font: { weight: 600 } },
      },
    },
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ height: 220 }}>
        <Bar data={data} options={opts} />
      </div>
      <p className="text-[11px] mt-3 px-1" style={{ color: C.inkLight }}>
        Casos destacados entre las 10 provincias que aumentaron y las 12 que redujeron su gasto en
        capital en términos reales. Fuente: Empiria en base a MECON y DNAP.
      </p>
    </div>
  )
}

// ─── NOTA METODOLÓGICA ────────────────────────────────────────

function NotaMetodologica() {
  return (
    <m.div
      {...fadeUp(0)}
      style={{
        background: D.warnBg,
        border: `1px solid ${D.warn}30`,
        borderLeft: `3px solid ${D.warn}`,
        borderRadius: 12,
        padding: '18px 20px',
      }}
    >
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: D.warn, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
        Nota sobre los datos
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        El ranking fiscal 2025 de Empiria pondera cuatro atributos estandarizados: autonomía
        (ingresos provinciales + regalías sobre ingresos totales), resultado primario (% del PBG),
        exposición financiera (stock de deuda sobre ingresos totales) y calidad del gasto (gasto
        de capital sobre gasto en personal). El detalle del ranking completo de las 24 provincias
        no se reproduce en este informe; para esa comparación remitirse al Informe económico N°531
        de Empiria. En el gráfico de cuadrantes, los valores de provincias para{' '}
        <strong style={{ color: C.ink }}>2024 (+0,4%)</strong> y{' '}
        <strong style={{ color: C.ink }}>2025 (-0,1%)</strong> están confirmados por el texto del
        informe; el resto de la serie histórica (2011-2023) y la posición de Nación en cada año son
        una reconstrucción visual aproximada a partir del gráfico publicado.
      </p>
    </m.div>
  )
}

// ─── PÁGINA ───────────────────────────────────────────────────

export default function InformeRankingFiscalPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.ink }}>

      <Hero />

      {/* SECCIÓN 1 - CUADRANTE NACIÓN VS PROVINCIAS */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-10">
            <SectionLabel>Sección 1 · Una relación fiscal que se invierte</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Nación y provincias cambian de lugar después de 25 años
            </h2>
            <p style={{ color: C.inkMid, maxWidth: '72ch' }} className="text-sm">
              Durante buena parte de las últimas décadas, los desequilibrios fiscales se
              concentraban en el gobierno nacional, mientras los distritos subnacionales mostraban
              mayor equilibrio. En 2025 sucede exactamente lo contrario: la Nación exhibe
              superávit y las provincias vuelven a registrar déficits agregados.
            </p>
          </m.div>
          <m.div {...fadeUp(0.1)}>
            <DownloadableViz title="Resultado primario - Nación vs. Provincias, 2011-2025 (% del PBI)">
              <ResultadoPrimarioQuadrante />
            </DownloadableViz>
          </m.div>
        </div>
      </div>

      {/* SECCIÓN 2 - GASTO VS INGRESOS */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel>Sección 2 · El motor del deterioro</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            El gasto provincial crece el doble que los ingresos
          </h2>
          <p style={{ color: C.inkMid, maxWidth: '72ch' }} className="text-sm">
            El gasto total provincial aumentó 6% real interanual frente a un crecimiento de
            apenas 3% de los ingresos. El gasto en personal subió 7% real en{' '}
            <strong style={{ color: C.ink }}>todas las provincias</strong>, y el gasto previsional
            11%. En sentido contrario, la administración nacional redujo su gasto real 2%.
          </p>
        </m.div>
        <m.div {...fadeUp(0.1)}>
          <DownloadableViz title="Variación real interanual del gasto y los ingresos provinciales, 2025">
            <GastoIngresosChart />
          </DownloadableViz>
        </m.div>
      </div>

      {/* SECCIÓN 3 - OBRA PÚBLICA */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 3 · Una tijera desigual</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              El gasto en obra pública creció 3%, pero no para todas las provincias igual
            </h2>
            <p style={{ color: C.inkMid, maxWidth: '72ch' }} className="text-sm">
              De las 24 provincias, 10 aumentaron su gasto en capital en términos reales y 12 lo
              redujeron. Río Negro (+93%) y Santa Cruz (+78%) lideran las subas; San Luis (-49%)
              y Chaco (-37%) registran las mayores caídas.
            </p>
          </m.div>
          <m.div {...fadeUp(0.1)}>
            <DownloadableViz title="Variación real del gasto en obra pública por provincia, 2025 vs. 2024">
              <ObraPublicaChart />
            </DownloadableViz>
          </m.div>
        </div>
      </div>

      {/* SECCIÓN 4 - BUENOS AIRES */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel>Sección 4 · El caso bonaerense</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Buenos Aires: alta autonomía, déficit y la mayor deuda del país
          </h2>
          <p style={{ color: C.inkMid, maxWidth: '72ch' }} className="text-sm">
            La provincia económicamente más importante del país, con cerca del 38% de la
            población argentina, ocupa el puesto 15 del ranking general de Empiria. La paradoja
            bonaerense: a pesar de contar con una elevada autonomía de recursos, mantiene
            importantes desequilibrios fiscales y un desempeño negativo en calidad del gasto.
          </p>
        </m.div>
        <m.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MC label="Ranking fiscal general" value="15° / 24" unit="posición de PBA, la jurisdicción más poblada del país" accent />
          <MC label="Resultado primario" value="-0,3%" unit="del PBG provincial, 2025" />
          <MC label="Resultado financiero" value="-0,8%" unit="del PBG provincial, 2025" />
          <MC label="Deuda / ingresos totales" value="52%" unit="la exposición financiera más alta del país" accent />
        </m.div>
      </div>

      {/* NOTA METODOLÓGICA */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <NotaMetodologica />
      </div>

      {/* CONCLUSIÓN */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <m.div
          {...fadeUp(0)}
          className="bg-pattern-dark"
          style={{
            background: C.hero, borderRadius: 20,
            padding: '44px 48px', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', right: -80, top: -80,
            width: 280, height: 280, borderRadius: '50%',
            border: '40px solid rgba(255,255,255,0.04)',
          }} />
          <div style={{
            position: 'absolute', right: 60, bottom: -100,
            width: 180, height: 180, borderRadius: '50%',
            border: '30px solid rgba(255,255,255,0.03)',
          }} />

          <div className="relative z-10">
            <p style={{
              color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem',
              textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16,
            }}>
              El argumento
            </p>
            <p style={{
              color: '#fff', fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
              lineHeight: 1.6, fontWeight: 500, maxWidth: 800,
            }}>
              Por primera vez en 25 años, la Nación corrige sus cuentas y las provincias las
              empeoran. El gasto en personal y jubilaciones, no la obra pública, es lo que rompió
              el equilibrio. Buenos Aires resume la tensión:{' '}
              <span style={{ color: '#93c5fd', fontWeight: 700 }}>alta presión tributaria, déficit fiscal y la mayor deuda del país</span>{' '}
              en la jurisdicción económica más importante de la Argentina.{' '}
              <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                Sin equilibrio fiscal, no hay margen para reducir la exposición financiera.
              </span>
            </p>
          </div>
        </m.div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold" style={{ color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Fuentes
            </p>
            <p className="text-sm mt-1" style={{ color: C.inkMid }}>
              Empiria - "Ranking fiscal provincial 2025", Informe económico N°531 (22 jun. 2026) ·
              en base a MECON y DNAP · Elaboración propia DatosPBA · 2026
            </p>
          </div>
          <Link to="/informes" className="text-sm no-underline font-medium" style={{ color: C.inkLight }}>
            ← Ver todos los informes
          </Link>
        </div>
      </div>

    </div>
  )
}
