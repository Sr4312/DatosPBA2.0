import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, ExternalLink } from 'lucide-react'
import html2canvas from 'html2canvas'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler)
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
  card:     'var(--c-surface)',
  hero:     '#0F172A',
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

const SERIE_NACIONAL = [
  { label: 'Mar-07', value: 66.8 },
  { label: 'Dic-08', value: 90.7 },
  { label: 'Sep-15', value: 96.1 },
  { label: 'Jun-18', value: 55.8 },
  { label: 'Jun-19', value: 61.5 },
  { label: 'Mar-20', value: 67.4 },
  { label: 'Sep-23', value: 79.1 },
  { label: 'Dic-23', value: 74.6 },
  { label: 'Mar-24', value: 65.0 },
  { label: 'Dic-25', value: 56.4 },
  { label: 'Mar-26', value: 62.5 },
  { label: 'Jun-26', value: 61.9 },
]

const RANKING_PROVINCIAS = [
  { label: 'Entre Ríos',   value: 65.5 },
  { label: 'Nacional',     value: 61.9 },
  { label: 'Córdoba',      value: 60.2 },
  { label: 'Buenos Aires', value: 59.0 },
  { label: 'La Pampa',     value: 58.9 },
  { label: 'San Luis',     value: 58.2 },
  { label: 'Santa Fe',     value: 55.6 },
]

const CULTIVOS_PBA = [
  { label: 'Trigo',   value: 62.2 },
  { label: 'Soja',    value: 62.1 },
  { label: 'Girasol', value: 60.2 },
  { label: 'Maíz',    value: 51.4 },
]

const TABLA_PROVINCIA_CULTIVO = [
  ['General', '61,9%', '60,2%', '59,0%', '55,6%', '58,9%', '65,5%', '58,2%'],
  ['Soja',    '61,7%', '61,4%', '62,1%', '58,2%', '61,4%', '65,9%', '61,6%'],
  ['Maíz',    '59,0%', '55,8%', '51,4%', '46,7%', '54,0%', '58,6%', '55,6%'],
  ['Trigo',   '73,6%', '94,5%', '62,2%', '61,0%', '116,1%', '82,0%', 's/d'],
  ['Girasol', '68,1%', '63,0%', '60,2%', '65,3%', '59,2%', 's/d', 's/d'],
]

/* Composición por nivel de gobierno: categorías sin valoración, siguen la
   paleta DATA en orden de magnitud (como IMPUESTOS en InformeKPMGIIBB). */
const FEDERALISMO = [
  { label: 'Nacionales no coparticipables', value: 56.7, color: DATA[1] },
  { label: 'Nacionales coparticipables',    value: 32.9, color: DATA[2] },
  { label: 'Provinciales',                  value: 9.3,  color: DATA[3] },
  { label: 'Municipales',                   value: 1.1,  color: DATA[4] },
]

const HECTAREA_PBA = [
  ['Costos de producción',            '$941.070'],
  ['Impuestos nacionales',            '$412.277'],
  ['Costo de la tierra',              '$207.887'],
  ['Resultado para el productor',     '$121.454'],
  ['Impuestos provinciales',          '$55.792'],
  ['Tasas municipales',               '$6.008'],
]

const FLETE_VBP = [
  { label: 'San Luis',     value: 21.6 },
  { label: 'Córdoba',      value: 20.2 },
  { label: 'La Pampa',     value: 20.2 },
  { label: 'Entre Ríos',   value: 17.0 },
  { label: 'Buenos Aires', value: 16.4 },
  { label: 'Santa Fe',     value: 11.1 },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. Las cuatro son niveles sin variación y el
   texto original es frase-continuación del número, por eso va en `periodo`. */
const HERO_STATS = [
  { valor: '59%',      periodo: 'de la renta agrícola bonaerense se la lleva el Estado' },
  { valor: '61,9%',    periodo: 'es el promedio nacional del Índice FADA (jun. 2026)' },
  { valor: '$474.077', periodo: 'paga en impuestos una hectárea promedio en PBA' },
  { valor: '51,4%',    periodo: 'la carga del maíz, la menor entre los cultivos bonaerenses' },
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
    <div style={{ borderBottom: `2px solid ${C.ink}`, paddingBottom: '0.75rem', marginBottom: '1.75rem', marginTop: '3rem' }}>
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
      <div style={{ position: 'relative', height }}>{children}</div>
      {fuente && (
        <div style={{ borderTop: '1px solid var(--c-rule)', marginTop: '0.75rem', paddingTop: '0.625rem' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--c-ink-light)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Fuente y período</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--c-ink-mid)' }}>{fuente}</span>
        </div>
      )}
    </div>
  )
}

// ─── VALUE LABELS PLUGIN ─────────────────────────────────────

const valueLabelsPlugin = {
  id: 'valueLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    const horizontal = chart.options.indexAxis === 'y'
    chart.data.datasets.forEach((dataset, di) => {
      chart.getDatasetMeta(di).data.forEach((bar, i) => {
        const v = dataset.data[i]
        const label = v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
        ctx.save()
        ctx.fillStyle = '#334155'
        ctx.font = 'bold 11px Archivo, sans-serif'
        if (horizontal) {
          ctx.textAlign = 'left'
          ctx.fillText(label, bar.x + 6, bar.y + 4)
        } else {
          ctx.textAlign = 'center'
          ctx.fillText(label, bar.x, bar.y - 7)
        }
        ctx.restore()
      })
    })
  },
}

// ─── CHART COMPONENTS ────────────────────────────────────────

function ChartSerieNacional() {
  const data = {
    labels: SERIE_NACIONAL.map(d => d.label),
    datasets: [{
      data: SERIE_NACIONAL.map(d => d.value),
      borderColor: DATA[1],
      backgroundColor: 'rgba(225,29,116,0.12)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: DATA[1],
    }],
  }
  return (
    <ChartCard
      title="Índice FADA nacional — puntos de referencia de la serie 2007–2026 (% de la renta agrícola)"
      fuente="FADA, Índice FADA junio 2026"
      height={260}
    >
      <Line data={data} options={{
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: C.hero, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR')}%` } },
        },
        scales: {
          y: { min: 40, max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0 } },
        },
      }} />
    </ChartCard>
  )
}

function ChartRankingProvincias() {
  const data = {
    labels: RANKING_PROVINCIAS.map(d => d.label),
    datasets: [{
      data: RANKING_PROVINCIAS.map(d => d.value),
      backgroundColor: RANKING_PROVINCIAS.map(d =>
        d.label === 'Buenos Aires' ? DATA[1] : d.label === 'Nacional' ? DATA[4] : DATA[2]),
      borderRadius: 4, barPercentage: 0.65,
    }],
  }
  return (
    <ChartCard
      title="Participación del Estado en la renta agrícola por provincia (junio 2026)"
      fuente="FADA, Índice FADA junio 2026"
      legend={[{ label: 'Buenos Aires', color: DATA[1] }, { label: 'Promedio nacional', color: DATA[4] }, { label: 'Otras provincias', color: DATA[2] }]}
      height={250}
    >
      <Bar
        data={data}
        plugins={[valueLabelsPlugin]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 48 } },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: C.hero, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR')}% de la renta` } },
          },
          scales: {
            x: { max: 75, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
            y: { grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartCultivosPBA() {
  const data = {
    labels: CULTIVOS_PBA.map(d => d.label),
    datasets: [{
      data: CULTIVOS_PBA.map(d => d.value),
      backgroundColor: DATA[1],
      borderRadius: 4, barPercentage: 0.55,
    }],
  }
  return (
    <ChartCard
      title="Participación del Estado por cultivo en Buenos Aires (junio 2026)"
      fuente="FADA, Índice FADA junio 2026"
      height={230}
    >
      <Bar
        data={data}
        plugins={[valueLabelsPlugin]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 20 } },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: C.hero, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR')}% de la renta` } },
          },
          scales: {
            y: { max: 70, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
            x: { grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartFederalismo() {
  const data = {
    labels: FEDERALISMO.map(d => d.label),
    datasets: [{ data: FEDERALISMO.map(d => d.value), backgroundColor: FEDERALISMO.map(d => d.color), borderWidth: 2, borderColor: '#fff' }],
  }
  return (
    <ChartCard
      title="Composición de los impuestos que paga una hectárea agrícola, por nivel de gobierno (junio 2026)"
      fuente="FADA, Índice FADA junio 2026"
      legend={FEDERALISMO.map(d => ({ label: `${d.label}: ${d.value.toLocaleString('es-AR')}%`, color: d.color }))}
      height={260}
    >
      <Doughnut data={data} options={{
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: C.hero, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.label}: ${ctx.raw.toLocaleString('es-AR')}%` } },
        },
      }} />
    </ChartCard>
  )
}

function ChartFlete() {
  const data = {
    labels: FLETE_VBP.map(d => d.label),
    datasets: [{
      data: FLETE_VBP.map(d => d.value),
      backgroundColor: FLETE_VBP.map(d => d.label === 'Buenos Aires' ? DATA[1] : DATA[2]),
      borderRadius: 4, barPercentage: 0.65,
    }],
  }
  return (
    <ChartCard
      title="Peso del flete sobre el valor bruto de producción del maíz, por provincia (junio 2026)"
      fuente="FADA, Índice FADA junio 2026"
      legend={[{ label: 'Buenos Aires', color: DATA[1] }, { label: 'Otras provincias', color: DATA[2] }]}
      height={230}
    >
      <Bar
        data={data}
        plugins={[valueLabelsPlugin]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 48 } },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: C.hero, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR')}% del valor de producción` } },
          },
          scales: {
            x: { max: 26, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
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
          <SectionLabel dark color="rgba(255,255,255,0.62)">FADA · Índice de participación del Estado en la renta agrícola · Junio 2026</SectionLabel>
        </div>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          El Estado se queda con el 59%<br />
          <span>de la renta agrícola bonaerense</span>
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          Según el Índice FADA de junio de 2026, Buenos Aires exhibe una carga tributaria agrícola{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>por debajo del promedio nacional (61,9%)</strong>{' '}
          y de provincias como Córdoba y Entre Ríos, aunque con fuertes diferencias según el cultivo: del 51,4% del maíz al 62,2% del trigo.
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
            { label: 'Fuente',        val: 'FADA - Índice FADA, junio 2026' },
            { label: 'Frecuencia',    val: 'Medición trimestral desde 2007' },
            { label: 'Autoras',       val: 'N. Pisani Claro · A. Semadeni' },
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

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeIndiceFADA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* 01 */}
        <div>
          <SH title="Qué es y qué mide el Índice FADA" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El Índice FADA es elaborado trimestralmente por la Fundación Agropecuaria para el Desarrollo de Argentina y mide la participación del Estado (impuestos nacionales, provinciales y municipales) sobre la renta agrícola: lo que queda de restar al valor de la producción los costos necesarios para producir. Esa renta se distribuye en tres componentes: los impuestos, la renta de la tierra y el resultado del productor.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Índice FADA nacional (jun. 2026)" valor="61,9%" periodo="de la renta agrícola va a impuestos" />
            <CifraCard label="Variación vs. marzo 2026" valor="−0,7" unidad="pp" periodo="desde el 62,5% de la medición anterior" />
            <CifraCard label="Resultado para el productor" valor="8,5%" periodo="de la renta; el 29,7% restante es costo de la tierra" />
          </div>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En junio de 2026 el índice nacional se ubicó en 61,9%: por debajo del promedio de la serie histórica y lejos de los picos de 2008-2009 y 2015, aunque por encima de los mínimos de 2018 y de fines de 2025.
          </p>
          <DownloadableViz title="Índice FADA nacional - serie 2007-2026" fuente="FADA, Índice FADA junio 2026">
            <ChartSerieNacional />
          </DownloadableViz>
        </div>

        {/* 02 */}
        <div>
          <SH title="Buenos Aires, debajo del promedio nacional" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Con un 59% de participación estatal en la renta agrícola, Buenos Aires se ubica por debajo del promedio nacional (61,9%), de Entre Ríos (65,5%) y de Córdoba (60,2%), aunque por encima de Santa Fe (55,6%). FADA aclara que un índice mayor no implica necesariamente pagar más impuestos en pesos: refleja la conjunción entre el peso de los tributos y una renta que puede ser menor por diferencias de rindes y costos entre regiones.
          </p>
          <DownloadableViz title="Índice FADA por provincia - junio 2026" fuente="FADA, Índice FADA junio 2026">
            <ChartRankingProvincias />
          </DownloadableViz>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En Buenos Aires y Santa Fe, donde los rendimientos promedio son mejores, la participación del Estado se ve compensada por una renta mayor, lo que explica un índice general más bajo. El caso extremo es el trigo en La Pampa (116,1%): por el encarecimiento de la urea, el cultivo directamente no es rentable allí antes de impuestos.
          </p>
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Cultivo', 'Nacional', 'Córdoba', 'Buenos Aires', 'Santa Fe', 'La Pampa', 'Entre Ríos', 'San Luis'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLA_PROVINCIA_CULTIVO.map((row, i, arr) => (
                  <tr key={i} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: j === 0 ? C.ink : j === 3 ? DATA[1] : C.inkMid, fontWeight: j === 0 || j === 3 ? 600 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 03 */}
        <div>
          <SH title="Del 51,4% del maíz al 62,2% del trigo" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Dentro de Buenos Aires, el maíz presenta la menor carga relativa entre los cuatro cultivos ponderados, mientras que trigo y soja muestran valores casi idénticos y el girasol se ubica en un nivel intermedio. A nivel nacional, el informe señala al trigo como "el caso más crítico" (73,6%), golpeado por la suba del 49% anual en el precio de la urea que FADA atribuye a las tensiones geopolíticas en Medio Oriente.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <CifraCard label="Maíz" valor="51,4%" periodo="la menor carga en PBA" />
            <CifraCard label="Girasol" valor="60,2%" periodo="nivel intermedio" />
            <CifraCard label="Soja" valor="62,1%" periodo="similar al trigo" />
            <CifraCard label="Trigo" valor="62,2%" periodo="la mayor carga en PBA" />
          </div>
          <DownloadableViz title="Índice FADA por cultivo en Buenos Aires - junio 2026" fuente="FADA, Índice FADA junio 2026">
            <ChartCultivosPBA />
          </DownloadableViz>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Pese al encarecimiento de los fertilizantes, el índice del trigo mejoró respecto de marzo de 2026 por la combinación de mayores precios internacionales (+15,5% trimestral) y la reducción de los derechos de exportación del 7,5% al 5,5%.
          </p>
        </div>

        {/* 04 */}
        <div>
          <SH title="Nueve de cada diez pesos van a la Nación" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Del total de impuestos que paga una hectárea agrícola en el país, el 56,7% son tributos nacionales no coparticipables -principalmente derechos de exportación-, el nivel más bajo para un mes de junio desde 2007, con excepción de junio de 2018. FADA advierte que este esquema afecta al federalismo fiscal: los recursos generados en las regiones productivas no retornan de forma directa a las provincias donde se originan.
          </p>
          <DownloadableViz title="Composición de impuestos por nivel de gobierno - junio 2026" fuente="FADA, Índice FADA junio 2026">
            <ChartFederalismo />
          </DownloadableViz>
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En Buenos Aires, una hectárea promedio pagó en junio de 2026 $412.277 de impuestos nacionales, $55.792 de impuestos provinciales -sobre todo inmobiliario rural, con ingresos brutos al 1% y sellos- y $6.008 de tasas municipales, mayoritariamente viales: el 70% de lo recaudado se destina a caminos rurales.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Impuestos nacionales (PBA)" valor="$412.277" periodo="por hectárea promedio, jun. 2026" />
            <CifraCard label="Impuestos provinciales (PBA)" valor="$55.792" periodo="inmobiliario rural, IIBB y sellos" />
            <CifraCard label="Tasas municipales (PBA)" valor="$6.008" periodo="promedio; 70% va a caminos rurales" />
          </div>
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Distribución del valor de producción por hectárea (PBA)', 'Monto'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HECTAREA_PBA.map(([concepto, monto], i, arr) => (
                  <tr key={i} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{concepto}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{monto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El monto provincial es un promedio: en la zona núcleo, el inmobiliario rural casi triplica ese valor. Para inicios de 2026, FADA registra aumentos del inmobiliario rural de entre 70% y 110%. Buenos Aires y Santa Fe son, además, las únicas jurisdicciones relevadas donde los municipios cobran tasas sobre las áreas rurales, porque cada partido bonaerense tiene jurisdicción sobre su territorio rural completo.
          </p>
        </div>

        {/* 05 */}
        <div>
          <SH title="El flete: pesa mucho en los costos, poco en el valor" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En Buenos Aires, el flete representa el 38,1% de los costos totales de una hectárea de maíz, el valor más alto entre las seis provincias relevadas. Pero medido sobre el valor bruto de producción, la provincia queda en una posición favorable: solo el 16,4% del ingreso que genera esa hectárea se destina al transporte, 1,7 de cada 10 camiones producidos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Flete sobre costos del maíz (PBA)" valor="38,1%" periodo="el más alto de las 6 provincias" />
            <CifraCard label="Flete sobre valor de producción" valor="16,4%" periodo="segundo más bajo, tras Santa Fe" />
            <CifraCard label="Distancia promedio a puerto" valor="250" unidad="km" periodo="vs. 340 km de Córdoba y La Pampa" />
          </div>
          <DownloadableViz title="Peso del flete sobre el valor de producción del maíz - junio 2026" fuente="FADA, Índice FADA junio 2026">
            <ChartFlete />
          </DownloadableViz>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La aparente contradicción se explica porque Buenos Aires combina rendimientos más altos con una distancia a puerto relativamente corta: eso eleva el valor de producción por hectárea y diluye el peso proporcional del flete, aun cuando su participación en la estructura interna de costos sea alta. A nivel nacional, los costos de transporte subieron 26% en pesos respecto de marzo.
          </p>
        </div>

        {/* NOTA METODOLÓGICA */}
        <div>
          <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: '3rem', paddingTop: '1.5rem' }}>
            <SectionLabel>Nota metodológica</SectionLabel>
            <p style={{ fontSize: '0.8125rem', color: C.inkMid, lineHeight: 1.75, maxWidth: '72ch' }}>
              El Índice FADA no debe confundirse con "presión tributaria" en sentido estricto: esta última mide los impuestos sobre el valor bruto de producción sin descontar costos, mientras que el Índice FADA los mide sobre la renta (ingresos menos costos), lo que amplifica su magnitud porcentual. Los índices provinciales ponderan soja, maíz, trigo y girasol según su participación en la superficie sembrada de cada provincia; para San Luis se consideran solo soja y maíz, y para Entre Ríos, soja, maíz y trigo. Los tributos municipales se miden desde junio de 2019. El tipo de cambio de referencia de junio de 2026 fue de $1.430. La periodización por gobiernos de la serie histórica proviene del gráfico original de FADA y se reproduce como dato, no como valoración.
            </p>
          </div>
        </div>

      </div>

      {/* CONCLUSIÓN */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div
         
          style={{
            background: C.hero, borderRadius: 2,
            padding: '44px 48px', position: 'relative', overflow: 'hidden',
          }}
        >

          <div className="relative z-10">
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>
              El argumento
            </p>
            <p style={{
              color: '#fff', fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
              lineHeight: 1.6, fontWeight: 500, maxWidth: 800,
            }}>
              De cada hectárea agrícola bonaerense, el Estado se queda con el{' '}
              <span style={{ fontWeight: 700 }}>59% de la renta</span>, y casi el 90% de esos impuestos son nacionales.
              Los recursos que genera el campo bonaerense no vuelven de forma directa a la provincia ni a sus municipios,
              que apenas capturan el 9,3% y el 1,1% del total.{' '}
              <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                El problema no es solo cuánto se paga, sino quién lo recauda.
              </span>
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://fundacionfada.org"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: '#fff', textDecoration: 'underline', textUnderlineOffset: 4,
                  fontSize: '0.82rem', fontWeight: 600,
                }}
              >
                Fundación FADA <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: C.ink }}>
              Fuentes
            </p>
            <p className="text-sm mt-1" style={{ color: C.inkMid }}>
              Fundación Agropecuaria para el Desarrollo de Argentina (FADA), Índice FADA: Participación del Estado en la renta agrícola, junio de 2026 · Autoras: Nicolle Pisani Claro (Economista Jefe) y Antonella Semadeni (Economista) · fundacionfada.org
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
