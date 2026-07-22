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
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
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

// ─── DATOS ───────────────────────────────────────────────────

const TASAS_PRINCIPALES = [
  { label: 'Tasa de actividad',    t2025: 48.5, t2026: 48.0 },
  { label: 'Tasa de empleo',       t2025: 43.8, t2026: 43.4 },
  { label: 'Tasa de desocupación', t2025: 9.7,  t2026: 9.7  },
]

const SUBOCUPACION = [
  { label: 'Subocupación total',         t2025: 10.9, t2026: 12.1 },
  { label: 'Subocup. demandante',        t2025: 7.7,  t2026: 7.2  },
  { label: 'Subocup. no demandante',     t2025: 3.3,  t2026: 4.9  },
]

const VARIACION_POBLACION = [
  { label: 'Población subocupada', value: 76 },
  { label: 'Población ocupada',    value: 10 },
  { label: 'Población desocupada', value: 2  },
]

const POBLACION_TABLA = [
  ['Población total de referencia',          '13.090', '13.229', '+139'],
  ['Población económicamente activa (PEA)',  '6.344',  '6.356',  '+12'],
  ['Población ocupada',                      '5.731',  '5.741',  '+10'],
  ['Población desocupada',                   '613',    '615',    '+2'],
  ['Población subocupada',                   '694',    '770',    '+76'],
]

const DESOCUPACION_CONTEXTO = [
  { label: 'Partidos del GBA',            value: 9.7 },
  { label: 'Total 31 aglomerados (EPH)',  value: 7.8 },
  { label: 'CABA',                        value: 4.8 },
]

const HERO_STATS = [
  { n: '9,7%',    label: 'tasa de desocupación, igual que en el 1T2025',      color: '#93c5fd' },
  { n: '12,1%',   label: 'subocupación horaria, desde 10,9% un año atrás',    color: '#fde68a' },
  { n: '+76 mil', label: 'personas subocupadas más que en el 1T2025',         color: '#a5f3fc' },
  { n: '48,0%',   label: 'tasa de actividad, desde 48,5% un año atrás',       color: '#6ee7b7' },
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

function MC({ label, value, unit, accent = false }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${C.rule}`,
      borderLeft: `4px solid ${accent ? B[600] : B[400]}`,
      padding: '1.125rem 1.125rem 1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: '0.625rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.875rem', fontWeight: 800, color: accent ? B[600] : C.ink, lineHeight: 1, marginBottom: '0.375rem' }}>{value}</div>
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

const fmtPct = v => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'

// Barras verticales: valor arriba de cada barra
const valueLabelsPct = {
  id: 'valueLabelsPct',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, di) => {
      chart.getDatasetMeta(di).data.forEach((bar, i) => {
        ctx.save()
        ctx.fillStyle = '#334155'
        ctx.font = 'bold 11px Poppins, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(fmtPct(dataset.data[i]), bar.x, bar.y - 7)
        ctx.restore()
      })
    })
  },
}

// Barras horizontales: valor a la derecha de cada barra
function makeHValueLabels(fmt) {
  return {
    id: 'hValueLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.data.datasets.forEach((dataset, di) => {
        chart.getDatasetMeta(di).data.forEach((bar, i) => {
          ctx.save()
          ctx.fillStyle = '#334155'
          ctx.font = 'bold 11px Poppins, sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(fmt(dataset.data[i]), bar.x + 8, bar.y)
          ctx.restore()
        })
      })
    },
  }
}

// ─── CHART COMPONENTS ────────────────────────────────────────

const tooltipBase = { backgroundColor: '#0a1628', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8 }

function ChartTasas() {
  const data = {
    labels: TASAS_PRINCIPALES.map(d => d.label),
    datasets: [
      { label: '1° trim. 2025', data: TASAS_PRINCIPALES.map(d => d.t2025), backgroundColor: B[200], borderRadius: 4, barPercentage: 0.55 },
      { label: '1° trim. 2026', data: TASAS_PRINCIPALES.map(d => d.t2026), backgroundColor: B[500], borderRadius: 4, barPercentage: 0.55 },
    ],
  }
  return (
    <ChartCard
      title="Tasas de actividad, empleo y desocupación — Partidos del GBA"
      fuente="INDEC, EPH, cuadro 3.1 — 1° trim. 2025 y 1° trim. 2026"
      legend={[{ label: '1° trim. 2025', color: B[200] }, { label: '1° trim. 2026', color: B[500] }]}
      height={240}
    >
      <Bar
        data={data}
        plugins={[valueLabelsPct]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 20 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${fmtPct(ctx.raw)}` } },
          },
          scales: {
            y: { max: 60, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
            x: { ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartSubocupacion() {
  const data = {
    labels: SUBOCUPACION.map(d => d.label),
    datasets: [
      { label: '1° trim. 2025', data: SUBOCUPACION.map(d => d.t2025), backgroundColor: B[200], borderRadius: 4, barPercentage: 0.55 },
      { label: '1° trim. 2026', data: SUBOCUPACION.map(d => d.t2026), backgroundColor: B[500], borderRadius: 4, barPercentage: 0.55 },
    ],
  }
  return (
    <ChartCard
      title="Subocupación horaria como % de la PEA — Partidos del GBA"
      fuente="INDEC, EPH, cuadro 3.1 — 1° trim. 2025 y 1° trim. 2026"
      legend={[{ label: '1° trim. 2025', color: B[200] }, { label: '1° trim. 2026', color: B[500] }]}
      height={240}
    >
      <Bar
        data={data}
        plugins={[valueLabelsPct]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 20 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${fmtPct(ctx.raw)}` } },
          },
          scales: {
            y: { max: 15, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
            x: { ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartVariacionAbsoluta() {
  const data = {
    labels: VARIACION_POBLACION.map(d => d.label),
    datasets: [{
      data: VARIACION_POBLACION.map(d => d.value),
      backgroundColor: [B[600], B[400], B[200]],
      borderRadius: 4, barPercentage: 0.6,
    }],
  }
  return (
    <ChartCard
      title="Variación interanual de población por condición de actividad (en miles de personas)"
      fuente="INDEC, EPH, cuadro 3.2 — 1° trim. 2025 vs. 1° trim. 2026"
      height={195}
    >
      <Bar
        data={data}
        plugins={[makeHValueLabels(v => `+${v} mil`)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 64 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  +${ctx.raw}.000 personas` } },
          },
          scales: {
            x: { ticks: { callback: v => '+' + v + ' mil' }, grid: { color: 'rgba(13,17,23,0.08)' } },
            y: { grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartContexto() {
  const data = {
    labels: DESOCUPACION_CONTEXTO.map(d => d.label),
    datasets: [{
      data: DESOCUPACION_CONTEXTO.map(d => d.value),
      backgroundColor: [B[600], B[400], B[200]],
      borderRadius: 4, barPercentage: 0.6,
    }],
  }
  return (
    <ChartCard
      title="Tasa de desocupación por área geográfica — 1° trimestre 2026"
      fuente="INDEC, EPH, cuadro 3.1 — 1° trim. 2026"
      height={195}
    >
      <Bar
        data={data}
        plugins={[makeHValueLabels(fmtPct)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 56 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtPct(ctx.raw)}` } },
          },
          scales: {
            x: { max: 12, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
            y: { grid: { display: false } },
          },
        }}
      />
    </ChartCard>
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
          <SectionLabel dark color="#93c5fd">INDEC · EPH · Primer trimestre 2026</SectionLabel>
        </m.div>

        <m.h1
          {...fadeUp(0.05)}
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Mercado de trabajo en<br />
          <span style={{ color: '#93c5fd' }}>los partidos del GBA</span>
        </m.h1>

        <m.p
          {...fadeUp(0.1)}
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          En el primer trimestre de 2026 la desocupación en los 24 partidos del conurbano se mantuvo en{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>9,7%</strong>, pero con menos actividad, menos empleo
          y un salto de la subocupación horaria: el ajuste del mercado laboral se dio por reducción de horas
          trabajadas, no por despidos hacia la desocupación abierta.
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
            { label: 'Fuente',        val: 'INDEC — EPH, informes técnicos' },
            { label: 'Universo',      val: '24 partidos del GBA · 13.229.000 personas' },
            { label: 'Período',       val: '1° trim. 2026 vs. 1° trim. 2025' },
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

// ─── NOTA METODOLÓGICA ───────────────────────────────────────

function NotaMetodologica() {
  return (
    <m.div
      {...fadeUp(0)}
      style={{
        background: '#fffbeb',
        border: '1px solid #d9770630',
        borderLeft: '3px solid #d97706',
        borderRadius: 12,
        padding: '18px 20px',
      }}
    >
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
        Nota metodológica
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        Este informe utiliza exclusivamente los datos de los <strong style={{ color: C.ink }}>"Partidos del Gran Buenos Aires"</strong>,
        la desagregación de la EPH para los 24 partidos del conurbano. Este recorte <strong style={{ color: C.ink }}>no equivale a la
        Provincia de Buenos Aires</strong>: la EPH también releva por separado Gran La Plata, Mar del Plata, Bahía Blanca-Cerri
        y, parcialmente, San Nicolás-Villa Constitución, que no están incluidos en estas cifras. Las comparaciones con
        CABA y el total de 31 aglomerados se presentan solo como referencia de contexto.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        Las estimaciones son estadísticamente confiables: el coeficiente de variación de la tasa de desocupación del
        1° trim. 2026 fue de <strong style={{ color: C.ink }}>7,1%</strong> (intervalo de confianza del 90% entre 8,5% y 10,8%),
        muy por debajo del umbral de 16% a partir del cual el INDEC recomienda tratar las estimaciones con cautela.
        Los datos no permiten atribuir causalidad a los movimientos sin información adicional sobre rama de actividad,
        categoría ocupacional o política económica.
      </p>
    </m.div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeMercadoTrabajoGBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      {/* 01 — PANORAMA GENERAL */}
      <div className="max-w-5xl mx-auto px-6 pt-2 pb-12">
        <m.div {...fadeUp()}>
          <SH num="01 · Panorama general" title="Las tasas principales" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Los partidos del Gran Buenos Aires concentran la mayor densidad poblacional de la Provincia y son,
            según la propia EPH, la subregión bonaerense con peor desempeño relativo del mercado de trabajo.
            En el primer trimestre de 2026, sobre una población de referencia de 13.229.000 personas,
            6.356.000 integraban la población económicamente activa (PEA).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <MC label="Tasa de desocupación" value="9,7%" unit="idéntica al 1T2025" accent />
            <MC label="Tasa de actividad" value="48,0%" unit="−0,5 p.p. interanual" />
            <MC label="Tasa de empleo" value="43,4%" unit="−0,4 p.p. interanual" />
            <MC label="Ocupados demandantes" value="15,8%" unit="−2,0 p.p. interanual" />
          </div>
          <DownloadableViz title="Tasas de actividad, empleo y desocupación — Partidos del GBA" fuente="INDEC, EPH — 1T2025 y 1T2026">
            <ChartTasas />
          </DownloadableViz>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La estabilidad de la desocupación en 9,7% no debe leerse de manera aislada: se explica, en parte,
            por la caída simultánea de la tasa de actividad, que retrajo a personas del mercado laboral en lugar
            de que fueran absorbidas por el empleo. Una porción de quienes dejaron de buscar trabajo activamente
            pasó a la inactividad, lo que morigera el efecto sobre la tasa de desocupación aun cuando el empleo
            también retrocedió.
          </p>
        </m.div>
      </div>

      {/* 02 — SUBOCUPACIÓN (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <m.div {...fadeUp(0.05)}>
            <SH num="02 · Subocupación" title="El ajuste por horas" />
            <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
              El indicador que más se movió en la comparación interanual es la subocupación horaria, que agrupa
              a las personas ocupadas que trabajan menos de 35 horas semanales por causas involuntarias y están
              dispuestas a trabajar más. En los partidos del GBA pasó de 10,9% a 12,1% de la PEA entre el primer
              trimestre de 2025 y el mismo trimestre de 2026.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <MC label="Subocupación no demandante" value="4,9%" unit="desde 3,3% — +1,6 p.p." accent />
              <MC label="Subocupación total" value="12,1%" unit="desde 10,9% — +1,2 p.p." />
              <MC label="Subocupación demandante" value="7,2%" unit="desde 7,7% — −0,5 p.p." />
            </div>
            <DownloadableViz title="Subocupación horaria — Partidos del GBA" fuente="INDEC, EPH — 1T2025 y 1T2026">
              <ChartSubocupacion />
            </DownloadableViz>
            <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
              La suba se concentró en la subocupación no demandante —personas que no buscan activamente otro
              empleo pero están disponibles para trabajar más horas—, que creció de 3,3% a 4,9%, mientras que la
              subocupación demandante descendió levemente, de 7,7% a 7,2%.
            </p>
          </m.div>
        </div>
      </div>

      {/* 03 — MAGNITUDES ABSOLUTAS */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <m.div {...fadeUp(0.05)}>
          <SH num="03 · Magnitudes absolutas" title="De tasas a personas" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Más allá de las tasas, la EPH permite dimensionar estos cambios en términos de personas. El dato más
            relevante: el incremento de la población subocupada (+76.000 personas) superó ampliamente al de la
            población ocupada (+10.000) y al de la desocupada (+2.000) en el mismo período. Buena parte del ajuste
            se dio por reducción de horas trabajadas dentro del universo de ocupados, no por un pasaje directo
            hacia la desocupación abierta.
          </p>
          <DownloadableViz title="Variación interanual de población por condición de actividad — Partidos del GBA" fuente="INDEC, EPH — 1T2025 vs. 1T2026">
            <ChartVariacionAbsoluta />
          </DownloadableViz>
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Indicador', '1° trim. 2025 (miles)', '1° trim. 2026 (miles)', 'Variación (miles)'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POBLACION_TABLA.map(([ind, a, b, v], i, arr) => (
                  <tr key={i} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{ind}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{a}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{b}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: B[600], fontWeight: 600 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </m.div>
      </div>

      {/* 04 — CONTEXTO (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <m.div {...fadeUp(0.05)}>
            <SH num="04 · Contexto" title="La brecha con CABA" />
            <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
              La desocupación en los partidos del GBA (9,7%) continúa siendo considerablemente más alta que la de
              la Ciudad Autónoma de Buenos Aires (4,8%) y que el promedio del total de 31 aglomerados urbanos
              relevados por la EPH (7,8%). La brecha con CABA equivale a 4,9 puntos porcentuales: la desocupación
              del conurbano duplica con creces a la de la Ciudad.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <MC label="Partidos del GBA" value="9,7%" unit="tasa de desocupación 1T2026" accent />
              <MC label="Total 31 aglomerados" value="7,8%" unit="promedio nacional urbano EPH" />
              <MC label="CABA" value="4,8%" unit="brecha de 4,9 p.p. con el GBA" />
            </div>
            <DownloadableViz title="Tasa de desocupación por área geográfica — 1T2026" fuente="INDEC, EPH — 1T2026">
              <ChartContexto />
            </DownloadableViz>
            <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
              Esta diferencia es estructural: se repite, con oscilaciones menores, en los sucesivos informes
              trimestrales de la EPH desde que existe esta desagregación geográfica.
            </p>
          </m.div>
        </div>
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
              La desocupación del conurbano no subió, pero el mercado de trabajo se deterioró igual:
              cayeron la actividad y el empleo, y{' '}
              <span style={{ color: '#93c5fd', fontWeight: 700 }}>76.000 personas más</span>{' '}
              pasaron a trabajar menos horas de las que necesitan.{' '}
              <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                El ajuste fue por horas, no por despidos — y la brecha con CABA sigue duplicando la desocupación.
              </span>
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-31-58"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none',
                  borderRadius: 999, padding: '10px 20px',
                  fontSize: '0.82rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                INDEC — Mercado de trabajo (EPH) <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </m.div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-xs font-semibold" style={{ color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Fuentes
          </p>
          <p className="text-sm mt-1" style={{ color: C.inkMid }}>
            INDEC (2026). "Mercado de trabajo. Tasas e indicadores socioeconómicos (EPH). Primer trimestre de 2026".
            Informes técnicos, Vol. 10, n° 151 — 22 de junio de 2026 · INDEC (2025). "Mercado de trabajo. Tasas e
            indicadores socioeconómicos (EPH). Primer trimestre de 2025". Informes técnicos, Vol. 9, n° 144 — 19 de
            junio de 2025 · Elaboración propia DatosPBA · 2026
          </p>
        </div>
      </div>
    </div>
  )
}
