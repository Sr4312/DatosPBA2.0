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
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)
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
  accent:   '#15803d',
}

// Paleta verde (análoga a la azul de los informes de referencia)
const G = {
  700: '#14532d',
  600: '#166534',
  500: '#15803d',
  400: '#16a34a',
  300: '#4ade80',
  200: '#86efac',
  100: '#bbf7d0',
  50:  '#f0fdf4',
}

// ─── DATOS ───────────────────────────────────────────────────

const SERIE_VARIACION = [
  { year: '2020',   value: -9.8 },
  { year: '2021',   value: 11.8 },
  { year: '2022',   value: 7.4  },
  { year: '2023*',  value: -0.9 },
  { year: '2024*',  value: -3.6 },
  { year: '2025**', value: 4.2  },
]

const COMPOSICION = [
  { label: 'Productores de Servicios',  value: 47.0, color: G[700] },
  { label: 'Productores de Bienes',     value: 34.5, color: G[500] },
  { label: 'IVA y otros impuestos',     value: 18.5, color: G[300] },
]

const SECTORES = [
  { label: 'Industria',                    var: '+2,8%',  part: '20,8%', inc: 0.59 },
  { label: 'Comercio',                     var: '+3,5%',  part: '12,7%', inc: 0.45 },
  { label: 'Agropecuario',                 var: '+5,6%',  part: '8,1%',  inc: 0.44 },
  { label: 'Ss. inmobiliarios y empresariales', var: '+4,0%',  part: '10,9%', inc: 0.44 },
  { label: 'Intermediación financiera',    var: '+24,9%', part: '1,9%',  inc: 0.39 },
  { label: 'Transporte y comunicaciones',  var: '+2,4%',  part: '8,6%',  inc: 0.21 },
]

const NACION = [
  { label: 'VAB de bienes',    value: 40.3 },
  { label: 'PBG-PBA total',    value: 35.7 },
  { label: 'VAB de servicios', value: 32.4 },
]

const HERO_STATS = [
  { n: '+4,2%',      label: 'crecimiento real en 2025, segundo mejor de la serie 2004-2025', color: '#6ee7b7' },
  { n: '$263.668 M', label: 'PBG-PBA a precios constantes de 2004',                          color: '#a5f3fc' },
  { n: '35,7%',      label: 'participación en el PBI de Nación',                             color: '#fde68a' },
  { n: '14 de 16',   label: 'sectores registraron alzas interanuales',                       color: '#93c5fd' },
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
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: G[500], marginBottom: '0.2rem' }}>{num}</p>
      <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.875rem)', fontWeight: 700, color: C.ink, lineHeight: 1.05, letterSpacing: '-0.015em' }}>{title}</h2>
    </div>
  )
}

function MC({ label, value, unit, accent = false }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${C.rule}`,
      borderLeft: `4px solid ${accent ? G[600] : G[400]}`,
      padding: '1.125rem 1.125rem 1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: '0.625rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.875rem', fontWeight: 800, color: accent ? G[600] : C.ink, lineHeight: 1, marginBottom: '0.375rem' }}>{value}</div>
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

const fmtPct = v => {
  const s = Math.abs(v).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return (v > 0 ? '+' : v < 0 ? '−' : '') + s + '%'
}

// Barras verticales: valor arriba de la barra (o debajo si es negativa)
const valueLabelsSigned = {
  id: 'valueLabelsSigned',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, di) => {
      chart.getDatasetMeta(di).data.forEach((bar, i) => {
        const v = dataset.data[i]
        ctx.save()
        ctx.fillStyle = '#334155'
        ctx.font = 'bold 11px Poppins, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(fmtPct(v), bar.x, v >= 0 ? bar.y - 7 : bar.y + 16)
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

function ChartSerie() {
  const data = {
    labels: SERIE_VARIACION.map(d => d.year),
    datasets: [{
      data: SERIE_VARIACION.map(d => d.value),
      backgroundColor: SERIE_VARIACION.map(d => d.value >= 0 ? G[500] : '#94a3b8'),
      borderRadius: 4, barPercentage: 0.55,
    }],
  }
  return (
    <ChartCard
      title="Variación interanual del PBG-PBA a precios constantes de 2004"
      fuente="Dirección Provincial de Estadística. (*) Provisorio. (**) Preliminar."
      legend={[{ label: 'Años de crecimiento', color: G[500] }, { label: 'Años de caída', color: '#94a3b8' }]}
      height={240}
    >
      <Bar
        data={data}
        plugins={[valueLabelsSigned]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 20, bottom: 6 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtPct(ctx.raw)}` } },
          },
          scales: {
            y: { ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
            x: { grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartComposicion() {
  const data = {
    labels: COMPOSICION.map(d => d.label),
    datasets: [{ data: COMPOSICION.map(d => d.value), backgroundColor: COMPOSICION.map(d => d.color), borderWidth: 2, borderColor: '#fff' }],
  }
  return (
    <ChartCard
      title="Composición del PBG-PBA 2025 por grandes componentes"
      fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA"
      legend={COMPOSICION.map(d => ({ label: `${d.label}: ${d.value.toLocaleString('es-AR', { minimumFractionDigits: 1 })}%`, color: d.color }))}
      height={260}
    >
      <Doughnut data={data} options={{
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.label}: ${ctx.raw.toLocaleString('es-AR', { minimumFractionDigits: 1 })}%` } },
        },
      }} />
    </ChartCard>
  )
}

function ChartSectores() {
  const data = {
    labels: SECTORES.map(d => d.label),
    datasets: [{
      data: SECTORES.map(d => d.inc),
      backgroundColor: [G[700], G[600], G[500], G[400], G[300], G[200]],
      borderRadius: 4, barPercentage: 0.65,
    }],
  }
  return (
    <ChartCard
      title="Incidencia de cada sector en el crecimiento del PBG-PBA 2025 (en puntos porcentuales)"
      fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA"
      height={250}
    >
      <Bar
        data={data}
        plugins={[makeHValueLabels(v => v.toLocaleString('es-AR', { minimumFractionDigits: 2 }) + ' p.p.')]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 64 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR', { minimumFractionDigits: 2 })} p.p. de incidencia` } },
          },
          scales: {
            x: { grid: { color: 'rgba(13,17,23,0.08)' }, ticks: { callback: v => v.toLocaleString('es-AR') } },
            y: { ticks: { font: { size: 10 } }, grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartNacion() {
  const data = {
    labels: NACION.map(d => d.label),
    datasets: [{
      data: NACION.map(d => d.value),
      backgroundColor: [G[600], G[500], G[300]],
      borderRadius: 4, barPercentage: 0.6,
    }],
  }
  return (
    <ChartCard
      title="Participación bonaerense en el total nacional, 2025"
      fuente="Dirección Provincial de Estadística · INDEC"
      height={195}
    >
      <Bar
        data={data}
        plugins={[makeHValueLabels(v => v.toLocaleString('es-AR', { minimumFractionDigits: 1 }) + '%')]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 56 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR', { minimumFractionDigits: 1 })}% del total nacional` } },
          },
          scales: {
            x: { max: 50, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
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
          <SectionLabel dark color="#6ee7b7">Dirección Provincial de Estadística · Ministerio de Economía PBA</SectionLabel>
        </m.div>

        <m.h1
          {...fadeUp(0.05)}
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Producto Bruto Geográfico<br />
          <span style={{ color: '#6ee7b7' }}>de la Provincia de Buenos Aires</span>
        </m.h1>

        <m.p
          {...fadeUp(0.1)}
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          La economía bonaerense creció{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>4,2% a precios constantes en 2025</strong>, el segundo
          mejor registro de la serie 2004-2025, tras dos años consecutivos de caída. El repunte fue de base amplia,
          impulsado por la Industria, el Comercio y el sector Agropecuario.
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
            { label: 'Fuente',        val: 'DPE — Ministerio de Economía PBA' },
            { label: 'Serie',         val: 'Base 2004 = 100 · 2004-2025' },
            { label: 'Carácter',      val: 'Estimación preliminar, sujeta a revisión' },
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
        Los valores de 2025 son una <strong style={{ color: C.ink }}>estimación preliminar</strong> de la Dirección
        Provincial de Estadística, sujeta a revisión: los valores definitivos podrían diferir de los aquí presentados.
        Los de 2023 y 2024 son provisorios. La serie se elabora con base 2004 = 100 y se presenta a precios corrientes
        y a precios constantes de 2004, lo que permite distinguir la variación de precios (medida por el Índice de
        Precios Implícitos, IPI-PBA, +38,3% en 2025) de la variación real de la actividad.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        El PBG-PBA mide la actividad económica de <strong style={{ color: C.ink }}>toda la Provincia</strong> (135
        municipios), a diferencia de las estadísticas laborales de la EPH, que en Buenos Aires se relevan únicamente
        sobre los Partidos del Gran Buenos Aires. Ambos indicadores no son directamente comparables.
      </p>
    </m.div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformePBGPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      {/* 01 — NIVEL Y EVOLUCIÓN */}
      <div className="max-w-5xl mx-auto px-6 pt-2 pb-12">
        <m.div {...fadeUp()}>
          <SH num="01 · Nivel y evolución" title="La recuperación de 2025" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En 2025 el PBG-PBA alcanzó $263.668 millones de pesos constantes de 2004, una suba real de 4,2%
            que lo posicionó como el segundo mejor valor de toda la serie desde 2004, solo por debajo del récord
            de 2022, y que sucede a dos años consecutivos de contracción (2023 y 2024). A precios corrientes,
            el producto provincial alcanzó $288.853.456 millones, con un alza interanual de 44,0%.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <MC label="Crecimiento real 2025" value="+4,2%" unit="a precios constantes de 2004" accent />
            <MC label="Suba a precios corrientes" value="+44,0%" unit="vs. +45,2% de Nación" />
            <MC label="Inflación implícita (IPI-PBA)" value="+38,3%" unit="variación de precios 2025" />
            <MC label="Crecimiento real de Nación" value="+4,4%" unit="PBI, a precios constantes" />
          </div>
          <DownloadableViz title="Variación interanual del PBG-PBA a precios constantes" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA">
            <ChartSerie />
          </DownloadableViz>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Los últimos seis años muestran un patrón de fuerte volatilidad: a la caída de 2020 asociada a la
            pandemia (−9,8%) le siguió una recuperación sostenida hasta 2022, dos años de contracción en 2023
            (−0,9%) y 2024 (−3,6%), y el repunte registrado en 2025.
          </p>
        </m.div>
      </div>

      {/* 02 — COMPOSICIÓN (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <m.div {...fadeUp(0.05)}>
            <SH num="02 · Composición" title="Bienes, servicios e impuestos" />
            <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
              De los 4,2 puntos porcentuales de crecimiento real del PBG-PBA en 2025, los sectores productores
              de servicios aportaron 1,60 p.p. y los productores de bienes 1,13 p.p., mientras que los impuestos
              a los productos sumaron 1,45 p.p. En términos de participación, los servicios explican casi la mitad
              del producto provincial.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <MC label="Productores de Servicios" value="+3,4%" unit="1,60 p.p. de incidencia · 47,0% del PBG" accent />
              <MC label="Productores de Bienes" value="+3,2%" unit="1,13 p.p. de incidencia · 34,5% del PBG" />
              <MC label="IVA y otros impuestos" value="+8,1%" unit="1,45 p.p. de incidencia · 18,5% del PBG" />
            </div>
            <DownloadableViz title="Composición del PBG-PBA 2025 por grandes componentes" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA">
              <ChartComposicion />
            </DownloadableViz>
          </m.div>
        </div>
      </div>

      {/* 03 — SECTORES */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <m.div {...fadeUp(0.05)}>
          <SH num="03 · Sectores" title="Los motores del crecimiento" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            De los 16 sectores que componen el PBG-PBA, 14 registraron alzas interanuales en 2025 y solo 2
            (Salud y Administración pública) mostraron descensos. Industria fue el sector que más aportó al
            crecimiento, seguido por Comercio y el sector Agropecuario. El sector Financiero registró la mayor
            suba interanual de toda la serie desde 2004 (+24,9%), aunque con incidencia moderada dado su bajo
            peso relativo en la estructura productiva.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="Industria" value="0,59 p.p." unit="+2,8% i.a. · 20,8% del PBG" accent />
            <MC label="Comercio" value="0,45 p.p." unit="+3,5% i.a. · 12,7% del PBG" />
            <MC label="Intermediación financiera" value="+24,9%" unit="mayor suba interanual desde 2004" />
          </div>
          <DownloadableViz title="Incidencia de cada sector en el crecimiento del PBG-PBA 2025" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA">
            <ChartSectores />
          </DownloadableViz>
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Sector', 'Var. interanual', 'Participación en PBG', 'Incidencia (p.p.)'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SECTORES.map((s, i, arr) => (
                  <tr key={i} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{s.label}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{s.var}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{s.part}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: G[600], fontWeight: 600 }}>{s.inc.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </m.div>
      </div>

      {/* 04 — NACIÓN (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <m.div {...fadeUp(0.05)}>
            <SH num="04 · Nación" title="El peso bonaerense en el PBI" />
            <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
              La participación del PBG-PBA en el Producto Bruto Interno de Nación fue de 35,7% en 2025, en línea
              con el promedio del período 2004-2024. Los sectores productores de bienes bonaerenses pesan más en
              el total nacional (40,3% del VAB de bienes) que los de servicios (32,4%), reflejo del rol destacado
              de la Provincia en la producción industrial y agropecuaria del país.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <MC label="PBG-PBA / PBI Nación" value="35,7%" unit="en línea con el promedio 2004-2024" accent />
              <MC label="VAB de bienes" value="40,3%" unit="del total nacional de bienes" />
              <MC label="VAB de servicios" value="32,4%" unit="del total nacional de servicios" />
            </div>
            <DownloadableViz title="Participación bonaerense en el total nacional, 2025" fuente="Dirección Provincial de Estadística · INDEC">
              <ChartNacion />
            </DownloadableViz>
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
              Tras dos años de contracción, la economía bonaerense se recuperó en 2025 con un crecimiento de{' '}
              <span style={{ color: '#6ee7b7', fontWeight: 700 }}>4,2%</span>, el segundo mejor de la serie
              2004-2025 y de base amplia: 14 de los 16 sectores en alza, con Industria, Comercio y Agro como
              motores.{' '}
              <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                La Provincia sigue explicando más de un tercio del producto nacional.
              </span>
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://www.estadistica.ec.gba.gov.ar/"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none',
                  borderRadius: 999, padding: '10px 20px',
                  fontSize: '0.82rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                Dirección Provincial de Estadística <ExternalLink className="w-3.5 h-3.5" />
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
            Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires — "Producto
            Bruto Geográfico de la Provincia de Buenos Aires (PBG-PBA). Año 2025", base 2004, publicado en julio de
            2026 · INDEC, para las comparaciones con el PBI de Nación · Elaboración propia DatosPBA · 2026
          </p>
        </div>
      </div>
    </div>
  )
}
