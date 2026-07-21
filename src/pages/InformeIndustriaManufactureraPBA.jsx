import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft, Download, ExternalLink } from 'lucide-react'
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
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler)
ChartJS.defaults.font.family = 'Poppins, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'

// ─── COLORES ─────────────────────────────────────────────────

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

const B = {
  700: '#152952',
  600: '#1a3d7c',
  500: '#1f4795',
  400: '#3d65b2',
  300: '#6a8bca',
  200: '#a1b4e0',
  100: '#d0daf0',
  50:  '#edf1f8',
}

const NEG = '#b91c1c'

// ─── DATOS ───────────────────────────────────────────────────

const SERIE = [
  { label: 'Mar-25', gen: 83.7, des: 85.0 },
  { label: 'Abr-25', gen: 89.6, des: 89.9 },
  { label: 'May-25', gen: 90.5, des: 89.3 },
  { label: 'Jun-25', gen: 85.9, des: 87.7 },
  { label: 'Jul-25', gen: 91.4, des: 86.8 },
  { label: 'Ago-25', gen: 92.9, des: 91.0 },
  { label: 'Sep-25', gen: 92.3, des: 88.0 },
  { label: 'Oct-25', gen: 93.8, des: 87.8 },
  { label: 'Nov-25', gen: 83.7, des: 83.0 },
  { label: 'Dic-25', gen: 86.4, des: 86.4 },
  { label: 'Ene-26', gen: 81.8, des: 90.6 },
  { label: 'Feb-26', gen: 80.5, des: 88.8 },
  { label: 'Mar-26', gen: 94.7, des: 94.1 },
]

const VAR_INTERANUAL = [
  { label: 'Mar-25', value: 2.3 },
  { label: 'Abr-25', value: 8.4 },
  { label: 'May-25', value: 3.1 },
  { label: 'Jun-25', value: 8.7 },
  { label: 'Jul-25', value: 1.1 },
  { label: 'Ago-25', value: 1.2 },
  { label: 'Sep-25', value: 2.9 },
  { label: 'Oct-25', value: 0.4 },
  { label: 'Nov-25', value: -10.2 },
  { label: 'Dic-25', value: -3.5 },
  { label: 'Ene-26', value: -1.6 },
  { label: 'Feb-26', value: -1.3 },
  { label: 'Mar-26', value: 13.2 },
]

// Cuadro 1 completo: [Período, Índice, Desestac., Var. mensual desestac., Var. interanual, Var. acumulada]
const TABLA_SERIE = [
  ['Mar-25', '83,7', '85,0', '−5,9', '2,3', '5,4'],
  ['Abr-25', '89,6', '89,9', '5,8', '8,4', '6,2'],
  ['May-25', '90,5', '89,3', '−0,6', '3,1', '5,5'],
  ['Jun-25', '85,9', '87,7', '−1,8', '8,7', '6,0'],
  ['Jul-25', '91,4', '86,8', '−1,1', '1,1', '5,3'],
  ['Ago-25', '92,9', '91,0', '4,9', '1,2', '4,7'],
  ['Sep-25', '92,3', '88,0', '−3,3', '2,9', '4,5'],
  ['Oct-25', '93,8', '87,8', '−0,2', '0,4', '4,0'],
  ['Nov-25', '83,7', '83,0', '−5,5', '−10,2', '2,6'],
  ['Dic-25', '86,4', '86,4', '4,1', '−3,5', '2,1'],
  ['Ene-26', '81,8', '90,6', '4,8', '−1,6', '−1,6'],
  ['Feb-26', '80,5', '88,8', '−1,9', '−1,3', '−1,4'],
  ['Mar-26', '94,7', '94,1', '5,9', '13,2', '3,5'],
]

// Cuadro 2: bloques industriales (marzo 2026), ordenados por var. interanual desc.
const BLOQUES = [
  { label: 'Productos químicos',     indice: 124.5, varia: 40.5,  acum: 18.6,  inc: 6.78 },
  { label: 'Minerales no metálicos', indice: 88.2,  varia: 25.5,  acum: 5.7,   inc: 0.93 },
  { label: 'Tabaco',                 indice: 66.1,  varia: 19.7,  acum: 10.3,  inc: 0.06 },
  { label: 'Textiles y cueros',      indice: 66.7,  varia: 17.7,  acum: 3.5,   inc: 1.20 },
  { label: 'Máquinas y equipos',     indice: 94.0,  varia: 16.5,  acum: 8.1,   inc: 1.96 },
  { label: 'Papel y cartón',         indice: 69.3,  varia: 12.1,  acum: -6.1,  inc: 0.50 },
  { label: 'Refinación de petróleo', indice: 129.0, varia: 9.8,   acum: 9.8,   inc: 1.27 },
  { label: 'Alimentos y bebidas',    indice: 99.8,  varia: 7.8,   acum: 0.3,   inc: 1.89 },
  { label: 'Caucho y plástico',      indice: 57.7,  varia: 3.5,   acum: -11.6, inc: 0.13 },
  { label: 'Vehículos automotores',  indice: 95.4,  varia: -6.8,  acum: -18.9, inc: -0.62 },
  { label: 'Metales comunes',        indice: 63.8,  varia: -14.0, acum: -7.1,  inc: -0.89 },
]

// Incidencia sobre el +13,2% agregado, ordenada desc.
const INCIDENCIAS = [...BLOQUES].sort((a, b) => b.inc - a.inc)

const HERO_STATS = [
  { n: '13,2%',   label: 'suba interanual del ISIM-PBA en marzo de 2026',        color: '#93c5fd' },
  { n: '+5,9%',   label: 'variación mensual desestacionalizada frente a febrero', color: '#a5f3fc' },
  { n: '9 de 11', label: 'bloques industriales con alza interanual en marzo',     color: '#6ee7b7' },
  { n: '+3,5%',   label: 'acumulado del primer trimestre 2026 vs. 2025',          color: '#fde68a' },
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
  const upscale  = Math.max(1, DL_MIN_W / captured.width)
  const innerW   = Math.round(captured.width * upscale)
  const innerH   = Math.round(captured.height * upscale)
  const titleH   = fuente ? 96 : 72
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

function DownloadableViz({ title, fuente, children }) {
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
            fontFamily: 'Poppins, sans-serif',
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

// ─── COMPONENTES UI ──────────────────────────────────────────

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

function SH({ num, title }) {
  return (
    <div style={{ borderBottom: `2px solid ${C.ink}`, paddingBottom: '0.75rem', marginBottom: '1.75rem', marginTop: '3rem' }}>
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: B[400], marginBottom: '0.2rem' }}>{num}</p>
      <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.875rem)', fontWeight: 700, color: C.ink, lineHeight: 1.05, letterSpacing: '-0.015em' }}>{title}</h2>
    </div>
  )
}

function MC({ label, value, unit, accent = false, negative = false }) {
  const numberColor = negative ? NEG : accent ? B[600] : C.ink
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${C.rule}`,
      borderLeft: `4px solid ${negative ? NEG : accent ? B[600] : B[400]}`,
      padding: '1.125rem 1.125rem 1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: '0.625rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.875rem', fontWeight: 800, color: numberColor, lineHeight: 1, marginBottom: '0.375rem' }}>{value}</div>
      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.4 }}>{unit}</div>
    </div>
  )
}

function ChartCard({ title, fuente, legend, height = 220, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, padding: '1.25rem 1.25rem 0.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0' }}>
      {title && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>{title}</p>}
      {legend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '0.625rem' }}>
          {legend.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              {l.label}
            </div>
          ))}
        </div>
      )}
      <div style={{ position: 'relative', height }}>{children}</div>
      {fuente && <p style={{ fontSize: '0.625rem', color: '#94a3b8', textAlign: 'right', marginTop: '0.625rem', fontStyle: 'italic' }}>{fuente}</p>}
    </div>
  )
}

// ─── VALUE LABELS PLUGINS ────────────────────────────────────

const fmtPct1 = v => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
const fmtPP2  = v => v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Barras horizontales con signo: etiqueta afuera de la punta de la barra.
function horizontalLabels(id, fmt) {
  return {
    id,
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      const meta = chart.getDatasetMeta(0)
      meta.data.forEach((bar, i) => {
        const v = chart.data.datasets[0].data[i]
        ctx.save()
        ctx.fillStyle = v < 0 ? NEG : '#334155'
        ctx.font = 'bold 11px Poppins, sans-serif'
        ctx.textBaseline = 'middle'
        ctx.textAlign = v < 0 ? 'right' : 'left'
        ctx.fillText(fmt(v), v < 0 ? bar.x - 6 : bar.x + 6, bar.y)
        ctx.restore()
      })
    },
  }
}

// Barras verticales con signo: etiqueta arriba (positivas) o abajo (negativas).
const verticalPctLabels = {
  id: 'verticalPctLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    const meta = chart.getDatasetMeta(0)
    meta.data.forEach((bar, i) => {
      const v = chart.data.datasets[0].data[i]
      ctx.save()
      ctx.fillStyle = v < 0 ? NEG : '#334155'
      ctx.font = 'bold 9px Poppins, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = v < 0 ? 'top' : 'bottom'
      ctx.fillText(fmtPct1(v), bar.x, v < 0 ? bar.y + 4 : bar.y - 4)
      ctx.restore()
    })
  },
}

const bloquesLabels     = horizontalLabels('bloquesLabels', fmtPct1)
const incidenciasLabels = horizontalLabels('incidenciasLabels', fmtPP2)

// ─── CHART COMPONENTS ────────────────────────────────────────

function ChartSerie() {
  const data = {
    labels: SERIE.map(d => d.label),
    datasets: [
      {
        label: 'ISIM-PBA',
        data: SERIE.map(d => d.gen),
        borderColor: B[500],
        backgroundColor: 'rgba(31,71,149,0.10)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: B[500],
      },
      {
        label: 'Serie desestacionalizada',
        data: SERIE.map(d => d.des),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderDash: [5, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#f59e0b',
      },
    ],
  }
  return (
    <ChartCard
      title="ISIM-PBA — nivel general y serie desestacionalizada (marzo 2025 – marzo 2026, base 2012=100)"
      fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA — ISIM-PBA"
      legend={[{ label: 'Nivel general', color: B[500] }, { label: 'Desestacionalizado', color: '#f59e0b' }]}
      height={270}
    >
      <Line data={data} options={{
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: C.hero, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${ctx.raw.toLocaleString('es-AR')}` } },
        },
        scales: {
          y: { min: 70, max: 100, grid: { color: 'rgba(13,17,23,0.08)' } },
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0 } },
        },
      }} />
    </ChartCard>
  )
}

function ChartVarInteranual() {
  const data = {
    labels: VAR_INTERANUAL.map(d => d.label),
    datasets: [{
      data: VAR_INTERANUAL.map(d => d.value),
      backgroundColor: VAR_INTERANUAL.map(d => d.value < 0 ? NEG : B[500]),
      borderRadius: 4, barPercentage: 0.72,
    }],
  }
  return (
    <ChartCard
      title="ISIM-PBA — variación interanual mensual (marzo 2025 – marzo 2026)"
      fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA — ISIM-PBA"
      legend={[{ label: 'Alza interanual', color: B[500] }, { label: 'Caída interanual', color: NEG }]}
      height={260}
    >
      <Bar
        data={data}
        plugins={[verticalPctLabels]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 18, bottom: 6 } },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: C.hero, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR')}% interanual` } },
          },
          scales: {
            y: { suggestedMin: -14, suggestedMax: 16, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
            x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0 } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartBloques() {
  const data = {
    labels: BLOQUES.map(d => d.label),
    datasets: [{
      data: BLOQUES.map(d => d.varia),
      backgroundColor: BLOQUES.map(d => d.varia < 0 ? NEG : B[500]),
      borderRadius: 4, barPercentage: 0.7,
    }],
  }
  return (
    <ChartCard
      title="Variación interanual por bloque industrial (marzo 2026)"
      fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA — ISIM-PBA"
      legend={[{ label: 'Alza interanual', color: B[500] }, { label: 'Caída interanual', color: NEG }]}
      height={340}
    >
      <Bar
        data={data}
        plugins={[bloquesLabels]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { left: 40, right: 52 } },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: C.hero, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR')}% interanual` } },
          },
          scales: {
            x: { suggestedMin: -20, suggestedMax: 50, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
            y: { grid: { display: false }, ticks: { font: { size: 11 } } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartIncidencias() {
  const data = {
    labels: INCIDENCIAS.map(d => d.label),
    datasets: [{
      data: INCIDENCIAS.map(d => d.inc),
      backgroundColor: INCIDENCIAS.map(d => d.inc < 0 ? NEG : (d.inc >= 1.5 ? B[600] : B[400])),
      borderRadius: 4, barPercentage: 0.7,
    }],
  }
  return (
    <ChartCard
      title="Incidencia de cada bloque en la variación interanual del ISIM-PBA (marzo 2026, en p.p.)"
      fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA — ISIM-PBA"
      legend={[{ label: 'Mayor aporte', color: B[600] }, { label: 'Aporte positivo', color: B[400] }, { label: 'Aporte negativo', color: NEG }]}
      height={340}
    >
      <Bar
        data={data}
        plugins={[incidenciasLabels]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { left: 30, right: 46 } },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: C.hero, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} p.p.` } },
          },
          scales: {
            x: { suggestedMin: -1.5, suggestedMax: 7.5, grid: { color: 'rgba(13,17,23,0.08)' } },
            y: { grid: { display: false }, ticks: { font: { size: 11 } } },
          },
        }}
      />
    </ChartCard>
  )
}

// ─── TABLAS ──────────────────────────────────────────────────

function TablaSerie() {
  const head = ['Período', 'ISIM-PBA', 'Desestac.', 'Var. mens. desest.', 'Var. interanual', 'Var. acumulada']
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map(h => (
              <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLA_SERIE.map((row, i, arr) => {
            const highlight = i === arr.length - 1
            return (
              <tr key={row[0]} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none', background: highlight ? B[50] : 'transparent' }}>
                {row.map((cell, j) => {
                  const isNeg = cell.startsWith('−')
                  return (
                    <td key={j} style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: j === 0 ? C.ink : isNeg ? NEG : C.inkMid, fontWeight: j === 0 || highlight ? 600 : 400 }}>{cell}</td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TablaBloques() {
  const head = ['Bloque industrial', 'Índice', 'Var. interanual', 'Var. acumulada', 'Incidencia (p.p.)']
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map(h => (
              <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BLOQUES.map((b, i) => (
            <tr key={b.label} style={{ borderBottom: i < BLOQUES.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
              <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{b.label}</td>
              <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{b.indice.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
              <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: b.varia < 0 ? NEG : C.inkMid, fontWeight: 600 }}>{fmtPct1(b.varia)}</td>
              <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: b.acum < 0 ? NEG : C.inkMid }}>{fmtPct1(b.acum)}</td>
              <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: b.inc < 0 ? NEG : C.inkMid }}>{fmtPP2(b.inc)}</td>
            </tr>
          ))}
          <tr style={{ background: B[50] }}>
            <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700 }}>Industria manufacturera</td>
            <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700 }}>94,7</td>
            <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700 }}>13,2%</td>
            <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700 }}>3,5%</td>
            <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700 }}>13,20</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────

function Hero() {
  return (
    <div className="bg-pattern-dark" style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <Link to="/informes" className="inline-flex items-center gap-1.5 text-sm no-underline mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <m.div {...fadeUp(0)}>
          <SectionLabel dark color="#93c5fd">ISIM-PBA · Dirección Provincial de Estadística · Ministerio de Economía PBA · Marzo 2026</SectionLabel>
        </m.div>

        <m.h1
          {...fadeUp(0.05)}
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          La industria manufacturera bonaerense<br />
          <span style={{ color: '#93c5fd' }}>rebotó 13,2% en marzo</span>
        </m.h1>

        <m.p
          {...fadeUp(0.1)}
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          Tras un primer bimestre de 2026 en baja, el ISIM-PBA marcó en marzo su mayor suba interanual reciente para ese mes, impulsada por{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Productos químicos y Máquinas y equipos</strong>. Nueve de once bloques crecieron, aunque siete siguen por debajo de los niveles de actividad de 2012.
        </m.p>

        <m.div {...fadeUp(0.15)} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          {HERO_STATS.map((s, i) => (
            <m.div
              key={i}
              {...fadeUp(0.1 * i + 0.2)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16 }}
              className="p-5"
            >
              <div className="font-display text-4xl font-bold mb-1" style={{ color: s.color }}>{s.n}</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.45 }}>{s.label}</p>
            </m.div>
          ))}
        </m.div>

        <m.div
          {...fadeUp(0.3)}
          style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}
        >
          {[
            { label: 'Fuente',       val: 'Dirección Provincial de Estadística · ME PBA' },
            { label: 'Indicador',    val: 'ISIM-PBA · base 2012=100' },
            { label: 'Dato',         val: 'Marzo 2026 (preliminar)' },
            { label: 'Actualización', val: 'Julio 2026' },
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

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeIndustriaManufactureraPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* 01 */}
        <m.div {...fadeUp()}>
          <SH num="01 · Contexto" title="Qué es y qué mide el ISIM-PBA" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El Indicador Sintético de la Industria Manufacturera de la provincia de Buenos Aires (ISIM-PBA) es elaborado por la Dirección Provincial de Estadística del Ministerio de Economía bonaerense a partir de un relevamiento propio sobre establecimientos industriales de la Provincia. Tiene base 2012=100 y sigue la evolución de corto plazo de la actividad fabril, una referencia clave dado que la Provincia concentra una porción sustancial de la producción manufacturera del país.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="Índice ISIM-PBA (mar. 2026)" value="94,7" unit="base 2012=100 · dato preliminar" accent />
            <MC label="Bloques sectoriales relevados" value="11" unit="ramas de la industria manufacturera" />
            <MC label="Bloques en alza interanual" value="9 de 11" unit="en marzo de 2026" />
          </div>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El indicador se desagrega en once bloques: alimentos y bebidas, tabaco, textiles y cueros, papel y cartón, refinación de petróleo, productos químicos, caucho y plástico, minerales no metálicos, metales comunes, máquinas y equipos, y vehículos automotores. El dato de marzo de 2026 es preliminar y está sujeto a revisión.
          </p>
        </m.div>

        {/* 02 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="02 · Resultado general" title="El rebote de marzo revierte el arranque de año" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En marzo de 2026 el ISIM-PBA alcanzó 94,7 puntos, frente a 83,7 en marzo de 2025: una suba interanual del 13,2%. En la comparación desestacionalizada, el índice se ubicó en 94,1 puntos, con un alza del 5,9% respecto de febrero, que había marcado 80,5 puntos, el nivel más bajo del período analizado.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="ISIM-PBA (mar. 2026)" value="94,7" unit="vs. 83,7 en marzo de 2025" accent />
            <MC label="Serie desestacionalizada" value="94,1" unit="+5,9% respecto de febrero" />
            <MC label="Piso reciente (feb. 2026)" value="80,5" unit="el nivel más bajo del período" negative />
          </div>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El repunte contrasta con la desaceleración de fines de 2025, cuando el índice había caído 10,2% interanual en noviembre. La serie de los últimos doce meses muestra la recuperación de marzo tras el piso del verano.
          </p>
          <DownloadableViz title="ISIM-PBA: nivel general y serie desestacionalizada (mar. 2025 – mar. 2026)" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA — ISIM-PBA">
            <ChartSerie />
          </DownloadableViz>
        </m.div>

        {/* 03 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="03 · Evolución interanual" title="De tres meses en rojo al salto del 13,2%" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El primer bimestre de 2026 había mostrado variaciones interanuales negativas —enero −1,6% y febrero −1,3%—, en línea con la caída de noviembre de 2025 (−10,2%), la mayor del período. Con el salto de marzo (+13,2%), el acumulado del primer trimestre se ubicó 3,5% por encima de igual período de 2025.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="Acumulado 1er trimestre 2026" value="+3,5%" unit="respecto de igual período de 2025" accent />
            <MC label="Enero / febrero 2026" value="−1,6% / −1,3%" unit="caídas interanuales" negative />
            <MC label="Noviembre 2025" value="−10,2%" unit="la mayor caída del período" negative />
          </div>
          <DownloadableViz title="ISIM-PBA: variación interanual mensual (mar. 2025 – mar. 2026)" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA — ISIM-PBA">
            <ChartVarInteranual />
          </DownloadableViz>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El cuadro completo detalla el nivel general, la serie desestacionalizada y las variaciones mensuales, interanuales y acumuladas de los últimos trece meses.
          </p>
          <TablaSerie />
        </m.div>

        {/* 04 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="04 · Bloques industriales" title="Nueve de once ramas en terreno positivo" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En marzo, nueve de los once bloques mostraron alzas interanuales. Productos químicos encabezó con +40,5%, seguido por Minerales no metálicos (+25,5%), Tabaco (+19,7%), Textiles y cueros (+17,7%) y Máquinas y equipos (+16,5%). Los únicos bloques con caída fueron Vehículos automotores (−6,8%) y Metales comunes (−14,0%).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="Productos químicos" value="+40,5%" unit="la mayor suba interanual" accent />
            <MC label="Minerales no metálicos" value="+25,5%" unit="segunda mayor suba" />
            <MC label="Metales comunes" value="−14,0%" unit="la mayor caída del mes" negative />
          </div>
          <DownloadableViz title="Variación interanual por bloque industrial (marzo 2026)" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA — ISIM-PBA">
            <ChartBloques />
          </DownloadableViz>
          <TablaBloques />
        </m.div>

        {/* 05 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="05 · Incidencias" title="El alza la explican dos bloques" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Detrás del +13,2% agregado hay un crecimiento fuertemente concentrado. Productos químicos aportó 6,78 puntos porcentuales y Máquinas y equipos 1,96: entre ambos explican más de dos tercios de la incidencia positiva total. Les siguieron Alimentos y bebidas (1,89 p.p.), Refinación de petróleo (1,27) y Textiles y cueros (1,20).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="Productos químicos" value="6,78 pp" unit="de incidencia en el +13,2%" accent />
            <MC label="Máquinas y equipos" value="1,96 pp" unit="segundo mayor aporte" />
            <MC label="Químicos + Máquinas" value=">2/3" unit="de la incidencia positiva total" />
          </div>
          <DownloadableViz title="Incidencia de cada bloque en la variación interanual del ISIM-PBA (marzo 2026)" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA — ISIM-PBA">
            <ChartIncidencias />
          </DownloadableViz>
        </m.div>

        {/* 06 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="06 · La contracara" title="Autos, metales y una base todavía baja" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El repunte tiene matices. Vehículos automotores acumuló su quinta baja interanual consecutiva (−6,8%) y Metales comunes cayó 14,0%, con incidencias negativas de 0,62 y 0,89 puntos porcentuales respectivamente. Además, pese al crecimiento generalizado, siete de los once bloques permanecen por debajo de los niveles de actividad del año base 2012, lo que matiza la lectura del salto interanual de marzo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="Vehículos automotores" value="−6,8%" unit="quinta baja interanual seguida" negative />
            <MC label="Metales comunes" value="−14,0%" unit="incidencia de −0,89 p.p." negative />
            <MC label="Bloques bajo el nivel 2012" value="7 de 11" unit="aún por debajo del año base" accent />
          </div>
        </m.div>

        {/* NOTA METODOLÓGICA */}
        <m.div {...fadeUp(0.05)}>
          <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: '3rem', paddingTop: '1.5rem' }}>
            <SectionLabel>Nota metodológica</SectionLabel>
            <p style={{ fontSize: '0.8125rem', color: C.inkMid, lineHeight: 1.75, maxWidth: '72ch' }}>
              El ISIM-PBA se construye con base 2012=100 a partir de un relevamiento propio de la Dirección Provincial de Estadística sobre establecimientos industriales bonaerenses. El dato de marzo de 2026 es preliminar y los meses de 2025 y 2026 son provisorios, por lo que pueden revisarse en publicaciones posteriores. La serie desestacionalizada corrige los efectos de calendario y estacionalidad, y puede diferir del nivel general en la lectura mensual. La "incidencia" mide el aporte, en puntos porcentuales, de cada bloque a la variación interanual del índice agregado. Los datos corresponden a información difundida en junio de 2026.
            </p>
          </div>
        </m.div>

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
              La industria bonaerense creció{' '}
              <span style={{ color: '#93c5fd', fontWeight: 700 }}>13,2% interanual en marzo</span>, el mayor salto reciente para ese mes,
              pero sobre una base de comparación baja: enero y febrero cerraron en caída y{' '}
              <span style={{ color: '#93c5fd', fontWeight: 700 }}>7 de 11 bloques</span> siguen por debajo de 2012.
              Además, el alza estuvo muy concentrada en Productos químicos y Máquinas y equipos.{' '}
              <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                Los datos no alcanzan para saber si marzo inicia una tendencia o responde a factores puntuales de comparación.
              </span>
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://www.ec.gba.gov.ar"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none',
                  borderRadius: 999, padding: '10px 20px',
                  fontSize: '0.82rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                Ministerio de Economía PBA <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
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
              Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires — Indicador Sintético de la Industria Manufacturera de la provincia de Buenos Aires (ISIM-PBA). Datos a marzo de 2026, difundidos en junio de 2026 · ec.gba.gov.ar
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
