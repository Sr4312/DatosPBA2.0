import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, ExternalLink } from 'lucide-react'
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
import Cifra from '@/components/shared/Cifra'
import { DATA, VALORACION_HEX, getTonoVariacion, getColorVariacion } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)
ChartJS.defaults.font.family = 'Archivo, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'

// ─── COLORES ─────────────────────────────────────────────────

const C = {
  bg:       'var(--c-bg)',
  ink:      'var(--c-ink)',
  inkMid:   'var(--c-ink-mid)',
  inkLight: 'var(--c-ink-light)',
  rule:     'var(--c-rule)',
  hero:     '#0F172A',
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
  { label: 'Productores de Servicios',  value: 47.0, color: DATA[1] },
  { label: 'Productores de Bienes',     value: 34.5, color: DATA[2] },
  { label: 'IVA y otros impuestos',     value: 18.5, color: DATA[3] },
]

const SECTORES = [
  { label: 'Industria',                    var: '+2,8%',  part: '20,8%', inc: 0.59, polaridad: 'mayor-es-mejor' },
  { label: 'Comercio',                     var: '+3,5%',  part: '12,7%', inc: 0.45, polaridad: 'mayor-es-mejor' },
  { label: 'Agropecuario',                 var: '+5,6%',  part: '8,1%',  inc: 0.44, polaridad: 'mayor-es-mejor' },
  { label: 'Ss. inmobiliarios y empresariales', var: '+4,0%',  part: '10,9%', inc: 0.44, polaridad: 'mayor-es-mejor' },
  { label: 'Intermediación financiera',    var: '+24,9%', part: '1,9%',  inc: 0.39, polaridad: 'mayor-es-mejor' },
  { label: 'Transporte y comunicaciones',  var: '+2,4%',  part: '8,6%',  inc: 0.21, polaridad: 'mayor-es-mejor' },
]

const NACION = [
  { label: 'VAB de bienes',    value: 40.3 },
  { label: 'PBG-PBA total',    value: 35.7 },
  { label: 'VAB de servicios', value: 32.4 },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. */
const HERO_STATS = [
  { valor: '+4,2%', variacion: '+4,2%', polaridad: 'mayor-es-mejor', periodo: 'crecimiento real en 2025, segundo mejor de la serie 2004-2025' },
  { valor: '$263.668 M', periodo: 'PBG-PBA a precios constantes de 2004' },
  { valor: '35,7%',      periodo: 'participación en el PBI de Nación' },
  { valor: '14 de 16',   periodo: 'sectores registraron alzas interanuales' },
]

// ─── DOWNLOAD ────────────────────────────────────────────────

const DL_PADDING  = 60
const DL_FOOTER_H = 56
const DL_MIN_W    = 1200

function drawFooter(ctx, y, w) {
  ctx.fillStyle = '#0F172A'
  ctx.fillRect(0, y, w, DL_FOOTER_H)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.round(w * 0.018)}px Archivo, Roboto, system-ui, sans-serif`
  ctx.fillText('Datos', DL_PADDING, y + DL_FOOTER_H * 0.65)
  ctx.fillStyle = '#60a5fa'
  ctx.fillText('PBA', DL_PADDING + Math.round(w * 0.06), y + DL_FOOTER_H * 0.65)
  ctx.fillStyle = '#94a3b8'
  ctx.font = `${Math.round(w * 0.013)}px Archivo, Roboto, system-ui, sans-serif`
  ctx.fillText('datospba.com', w - DL_PADDING - Math.round(w * 0.11), y + DL_FOOTER_H * 0.65)
}

function triggerDownload(canvas, filename) {
  const a = document.createElement('a')
  a.download = filename.replace(/[^a-zA-Z0-9\-_áéíóúñ ]/g, '').trim() + '.png'
  a.href = canvas.toDataURL('image/png')
  a.click()
}

async function downloadVizContainer(node, title, fuente) {
  const { default: html2canvas } = await import('html2canvas')
  // html2canvas no respeta el estado colapsado de <details>: pintaria la tabla
  // encima de la ficha tecnica. La excluimos de la captura.
  const captured = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    ignoreElements: el => el.tagName === 'DETAILS',
  })
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
  ctx.fillStyle = '#0F172A'
  ctx.font = `bold ${Math.round(W * 0.020)}px Archivo, Roboto, system-ui, sans-serif`
  ctx.fillText(title, DL_PADDING, Math.round(titleH * 0.52), W - DL_PADDING * 2)
  if (fuente) {
    ctx.fillStyle = '#94a3b8'
    ctx.font = `${Math.round(W * 0.014)}px Archivo, Roboto, system-ui, sans-serif`
    ctx.fillText(`Fuente: ${fuente}`, DL_PADDING, Math.round(titleH * 0.82))
  }
  ctx.drawImage(captured, 0, titleH, innerW, innerH)
  drawFooter(ctx, H - DL_FOOTER_H, W)
  triggerDownload(out, title)
}

/* Descarga como link de texto bajo el gráfico, alineado a su borde izquierdo.
   El botón queda fuera del nodo capturado, así el PNG no lo incluye. */
function DownloadableViz({ title, fuente, children }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    if (!ref.current || busy) return
    setBusy(true)
    try { await downloadVizContainer(ref.current, title, fuente) }
    catch (e) { console.error(e) }
    setBusy(false)
  }

  return (
    <div>
      <div ref={ref} style={{ background: 'var(--c-bg)' }}>
        {children}
      </div>
      <button
        onClick={handleDownload}
        disabled={busy}
        style={{
          background: 'none', border: 'none', padding: 0, marginTop: 8,
          fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-ink-mid)',
          textDecoration: 'underline', textUnderlineOffset: 3,
          cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit',
        }}
      >
        {busy ? 'Generando la imagen…' : 'Descargar el gráfico (PNG)'}
      </button>
    </div>
  )
}

// ─── COMPONENTES UI ──────────────────────────────────────────

function SectionLabel({ children, dark = false, color }) {
  return (
    <p
      style={{ color: color || (dark ? 'rgba(255,255,255,0.5)' : C.accent) }}
      className={dark ? 'text-xs font-semibold tracking-[0.18em] uppercase mb-3' : 'text-sm font-semibold mb-3'}
    >
      {children}
    </p>
  )
}

function SH({ title }) {
  return (
    <div style={{ borderBottom: `2px solid ${C.ink}`, paddingBottom: '0.75rem', marginBottom: '1.5rem', marginTop: '2.25rem' }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.875rem)', fontWeight: 700, color: C.ink, lineHeight: 1.05, letterSpacing: '-0.015em' }}>{title}</h2>
    </div>
  )
}

function CifraCard(props) {
  return (
    <div style={{
      background: '#fff', borderRadius: 2,
      border: `1px solid ${C.rule}`,
      padding: '1.125rem 1.125rem 1rem',
      
    }}>
      <Cifra size="md" {...props} />
    </div>
  )
}

function ChartCard({ title, fuente, legend, height = 220, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, padding: '1.25rem 1.25rem 0.875rem', margin: '1.25rem 0' }}>
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
      <div style={{ position: 'relative', height }} role="img" aria-label={title}>{children}</div>
      {fuente && (
        <div style={{ borderTop: '1px solid var(--c-rule)', marginTop: '0.75rem', paddingTop: '0.625rem' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--c-ink-light)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Fuente y período</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--c-ink-mid)' }}>{fuente}</span>
        </div>
      )}
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
        ctx.font = 'bold 11px Archivo, sans-serif'
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
          ctx.font = 'bold 11px Archivo, sans-serif'
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

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8 }

function ChartSerie() {
  const data = {
    labels: SERIE_VARIACION.map(d => d.year),
    datasets: [{
      data: SERIE_VARIACION.map(d => d.value),
      /* Valoración por polaridad × signo (canvas: se usan los hex equivalentes
         de los tokens de valoración, no un verde/rojo elegido a mano). */
      backgroundColor: SERIE_VARIACION.map(d =>
        VALORACION_HEX[getTonoVariacion({ variacion: d.value, polaridad: 'mayor-es-mejor' })].base
      ),
      borderRadius: 4, barPercentage: 0.55,
    }],
  }
  return (
    <ChartCard
      title="Variación interanual del PBG-PBA a precios constantes de 2004"
      fuente="Dirección Provincial de Estadística. (*) Provisorio. (**) Preliminar."
      legend={[{ label: 'Años de crecimiento', color: VALORACION_HEX.better.base }, { label: 'Años de caída', color: VALORACION_HEX.worse.base }]}
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
      backgroundColor: DATA[1],
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
      backgroundColor: DATA[1],
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
    <div style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <Link to="/informes" className="inline-flex items-center gap-1.5 text-sm no-underline mb-10" style={{ color: 'rgba(255,255,255,0.62)' }}>
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <div>
          <SectionLabel dark color="rgba(255,255,255,0.62)">Dirección Provincial de Estadística · Ministerio de Economía PBA</SectionLabel>
        </div>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Producto Bruto Geográfico<br />
          <span>de la Provincia de Buenos Aires</span>
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          La economía bonaerense creció{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>4,2% a precios constantes en 2025</strong>, el segundo
          mejor registro de la serie 2004-2025, tras dos años consecutivos de caída. El repunte fue de base amplia,
          impulsado por la Industria, el Comercio y el sector Agropecuario.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          {HERO_STATS.map((s, i) => (
            <div
              key={i}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2 }}
              className="p-5"
            >
              <Cifra dark size="xl" label={s.label} valor={s.valor} variacion={s.variacion} polaridad={s.polaridad} periodo={s.periodo} />
            </div>
          ))}
        </div>

        <div
          style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}
        >
          {[
            { label: 'Fuente',        val: 'DPE - Ministerio de Economía PBA' },
            { label: 'Serie',         val: 'Base 2004 = 100 · 2004-2025' },
            { label: 'Carácter',      val: 'Estimación preliminar, sujeta a revisión' },
            { label: 'Actualización', val: 'Julio 2026' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── TESIS ───────────────────────────────────────────────────

function Tesis() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-10">
      <div style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '1.25rem' }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 2.6vw, 1.75rem)', fontWeight: 700, color: C.ink, lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: '0.75rem', maxWidth: 800 }}>
          El repunte de 4,2% fue de base amplia, con 14 de los 16 sectores en alza
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          Tras dos años de contracción, la economía bonaerense se recuperó en 2025 con un crecimiento de{' '}
          <strong>4,2%</strong>, el segundo mejor de la serie 2004-2025 y de base amplia: 14 de los 16
          sectores en alza, con Industria, Comercio y Agro como motores. La Provincia sigue explicando
          más de un tercio del producto nacional.
        </p>
      </div>
    </div>
  )
}

// ─── NOTA METODOLÓGICA ───────────────────────────────────────

function NotaMetodologica() {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        borderTop: '2px solid var(--ink)',
        padding: '18px 20px',
      }}
    >
      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
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
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformePBGPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* 01 — NIVEL Y EVOLUCIÓN */}
      <div className="max-w-5xl mx-auto px-6 pt-2 pb-12">
        <div>
          <SH title="La recuperación de 2025" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En 2025 el PBG-PBA alcanzó $263.668 millones de pesos constantes de 2004, una suba real de 4,2%
            que lo posicionó como el segundo mejor valor de toda la serie desde 2004, solo por debajo del récord
            de 2022, y que sucede a dos años consecutivos de contracción (2023 y 2024). A precios corrientes,
            el producto provincial alcanzó $288.853.456 millones, con un alza interanual de 44,0%.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Suba a precios corrientes" valor="+44,0%" variacion="+44,0%" polaridad="neutro" periodo="vs. +45,2% de Nación" />
            <CifraCard label="Inflación implícita (IPI-PBA)" valor="+38,3%" variacion="+38,3%" polaridad="neutro" periodo="variación de precios 2025" />
            <CifraCard label="Crecimiento real de Nación" valor="+4,4%" variacion="+4,4%" polaridad="mayor-es-mejor" periodo="PBI, a precios constantes" />
          </div>
          <DownloadableViz title="Variación interanual del PBG-PBA a precios constantes" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA">
            <ChartSerie />
          </DownloadableViz>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Los últimos seis años muestran un patrón de fuerte volatilidad: a la caída de 2020 asociada a la
            pandemia (−9,8%) le siguió una recuperación sostenida hasta 2022, dos años de contracción en 2023
            (−0,9%) y 2024 (−3,6%), y el repunte registrado en 2025.
          </p>
        </div>
      </div>

      {/* 02 — COMPOSICIÓN (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <div>
            <SH title="Bienes, servicios e impuestos" />
            <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
              De los 4,2 puntos porcentuales de crecimiento real del PBG-PBA en 2025, los sectores productores
              de servicios aportaron 1,60 p.p. y los productores de bienes 1,13 p.p., mientras que los impuestos
              a los productos sumaron 1,45 p.p. En términos de participación, los servicios explican casi la mitad
              del producto provincial.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <CifraCard label="Productores de Servicios" valor="+3,4%" variacion="+3,4%" polaridad="mayor-es-mejor" periodo="1,60 p.p. de incidencia · 47,0% del PBG" />
              <CifraCard label="Productores de Bienes" valor="+3,2%" variacion="+3,2%" polaridad="mayor-es-mejor" periodo="1,13 p.p. de incidencia · 34,5% del PBG" />
              <CifraCard label="IVA y otros impuestos" valor="+8,1%" variacion="+8,1%" polaridad="neutro" periodo="1,45 p.p. de incidencia · 18,5% del PBG" />
            </div>
            <DownloadableViz title="Composición del PBG-PBA 2025 por grandes componentes" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA">
              <ChartComposicion />
            </DownloadableViz>
          </div>
        </div>
      </div>

      {/* 03 — SECTORES */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div>
          <SH title="Los motores del crecimiento" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            De los 16 sectores que componen el PBG-PBA, 14 registraron alzas interanuales en 2025 y solo 2
            (Salud y Administración pública) mostraron descensos. Industria fue el sector que más aportó al
            crecimiento, seguido por Comercio y el sector Agropecuario. El sector Financiero registró la mayor
            suba interanual de toda la serie desde 2004 (+24,9%), aunque con incidencia moderada dado su bajo
            peso relativo en la estructura productiva.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Industria" valor="0,59" unidad="p.p." variacion="+2,8% i.a." polaridad="mayor-es-mejor" periodo="20,8% del PBG" />
            <CifraCard label="Comercio" valor="0,45" unidad="p.p." variacion="+3,5% i.a." polaridad="mayor-es-mejor" periodo="12,7% del PBG" />
            <CifraCard label="Intermediación financiera" valor="+24,9%" variacion="+24,9%" polaridad="mayor-es-mejor" periodo="mayor suba interanual desde 2004" />
          </div>
          <DownloadableViz title="Incidencia de cada sector en el crecimiento del PBG-PBA 2025" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA">
            <ChartSectores />
          </DownloadableViz>
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0', overflowX: 'auto' }}>
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
                    <td
                      className="tabular-nums"
                      style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', fontWeight: 600, color: getColorVariacion({ variacion: s.var, polaridad: s.polaridad, texto: true }) }}
                    >
                      {s.var}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{s.part}</td>
                    <td
                      className="tabular-nums"
                      style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', fontWeight: 600, color: getColorVariacion({ variacion: s.inc, polaridad: s.polaridad, texto: true }) }}
                    >
                      {s.inc.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 04 — NACIÓN (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <div>
            <SH title="El peso bonaerense en el PBI" />
            <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
              La participación del PBG-PBA en el Producto Bruto Interno de Nación fue de 35,7% en 2025, en línea
              con el promedio del período 2004-2024. Los sectores productores de bienes bonaerenses pesan más en
              el total nacional (40,3% del VAB de bienes) que los de servicios (32,4%), reflejo del rol destacado
              de la Provincia en la producción industrial y agropecuaria del país.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <CifraCard label="PBG-PBA / PBI Nación" valor="35,7%" periodo="en línea con el promedio 2004-2024" />
              <CifraCard label="VAB de bienes" valor="40,3%" periodo="del total nacional de bienes" />
              <CifraCard label="VAB de servicios" valor="32,4%" periodo="del total nacional de servicios" />
            </div>
            <DownloadableViz title="Participación bonaerense en el total nacional, 2025" fuente="Dirección Provincial de Estadística · INDEC">
              <ChartNacion />
            </DownloadableViz>
          </div>
        </div>
      </div>

      {/* NOTA METODOLÓGICA */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <NotaMetodologica />
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-sm font-semibold" style={{ color: C.ink }}>
            Fuentes
          </p>
          <p className="text-sm mt-1" style={{ color: C.inkMid }}>
            Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires - "Producto
            Bruto Geográfico de la Provincia de Buenos Aires (PBG-PBA). Año 2025", base 2004, publicado en julio de
            2026 · INDEC, para las comparaciones con el PBI de Nación · Elaboración propia DatosPBA · 2026
          </p>
          <a
            href="https://www.estadistica.ec.gba.gov.ar/"
            target="_blank" rel="noopener noreferrer"
            className="text-sm mt-2"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4,
              fontWeight: 600,
            }}
          >
            Dirección Provincial de Estadística <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
