import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA, getColorVariacion } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
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
  accent:   '#3d65b2',
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

const POBLACION_TABLA = [
  { ind: 'Población total de referencia',         t2025: '13.090', t2026: '13.229', variacion: '+139', polaridad: 'neutro' },
  { ind: 'Población económicamente activa (PEA)', t2025: '6.344',  t2026: '6.356',  variacion: '+12',  polaridad: 'neutro' },
  { ind: 'Población ocupada',                     t2025: '5.731',  t2026: '5.741',  variacion: '+10',  polaridad: 'mayor-es-mejor' },
  { ind: 'Población desocupada',                  t2025: '613',    t2026: '615',    variacion: '+2',   polaridad: 'menor-es-mejor' },
  { ind: 'Población subocupada',                  t2025: '694',    t2026: '770',    variacion: '+76',  polaridad: 'menor-es-mejor' },
]

const DESOCUPACION_CONTEXTO = [
  { label: 'Partidos del GBA',            value: 9.7 },
  { label: 'Total 31 aglomerados (EPH)',  value: 7.8 },
  { label: 'CABA',                        value: 4.8 },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. */
const HERO_STATS = [
  { label: 'Tasa de desocupación', valor: '9,7%',  variacion: '0,0 pp',  polaridad: 'menor-es-mejor', periodo: 'vs. 1T2025' },
  { label: 'Tasa de actividad',    valor: '48,0%', variacion: '−0,5 pp', polaridad: 'mayor-es-mejor', periodo: 'desde 48,5% en 1T2025' },
  { label: 'Tasa de empleo',       valor: '43,4%', variacion: '−0,4 pp', polaridad: 'mayor-es-mejor', periodo: 'desde 43,8% en 1T2025' },
  { label: 'Subocupación horaria', valor: '12,1%', variacion: '+1,2 pp', polaridad: 'menor-es-mejor', periodo: 'desde 10,9% en 1T2025' },
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

/* La descarga es un link de texto debajo del gráfico, alineado a su borde
   izquierdo. El botón queda fuera del nodo capturado, así el PNG no lo incluye. */
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
      <div ref={ref} style={{ background: C.bg }}>
        {children}
      </div>
      <button
        onClick={handleDownload}
        disabled={busy}
        style={{
          background: 'none', border: 'none', padding: 0, marginTop: 8,
          fontSize: '0.75rem', fontWeight: 600, color: C.inkMid,
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

/* Ficha técnica del gráfico: fuente, período, universo, unidad y CV cuando
   aplica, como elemento de diseño visible bajo cada visualización. */
function FichaTecnica({ items }) {
  return (
    <div style={{
      borderTop: `1px solid ${C.rule}`, marginTop: '0.75rem', paddingTop: '0.625rem',
      display: 'flex', flexWrap: 'wrap', gap: '0.375rem 1.75rem',
    }}>
      {items.map(([k, v]) => (
        <div key={k}>
          <span style={{ fontSize: '0.62rem', color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{k}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: C.inkMid }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function ChartCard({ title, hallazgo, ficha, tabla, legend, height = 220, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, padding: '1.25rem 1.25rem 0.875rem', margin: '1.25rem 0' }}>
      {title && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>{title}</p>}
      {legend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '0.625rem' }} aria-hidden="true">
          {legend.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              {l.label}
            </div>
          ))}
        </div>
      )}
      <div style={{ position: 'relative', height }} role="img" aria-label={hallazgo || title}>{children}</div>
      {tabla && (
        <details style={{ marginTop: '0.625rem' }}>
          <summary style={{ fontSize: '0.72rem', fontWeight: 600, color: C.inkMid, cursor: 'pointer' }}>
            Ver los datos del gráfico en tabla
          </summary>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
            <thead>
              <tr>
                {tabla.columnas.map((c, i) => (
                  <th key={c} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.68rem', color: C.inkMid, fontWeight: 700, padding: '0.3rem 0.5rem', borderBottom: `1px solid ${C.rule}` }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabla.filas.map((fila, i) => (
                <tr key={i}>
                  {fila.map((celda, j) => (
                    <td key={j} className="tabular-nums" style={{ textAlign: j === 0 ? 'left' : 'right', fontSize: '0.75rem', color: j === 0 ? C.ink : C.inkMid, padding: '0.3rem 0.5rem', borderBottom: `1px solid var(--surface-2)` }}>{celda}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
      {ficha && <FichaTecnica items={ficha} />}
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
        ctx.font = 'bold 11px Archivo, sans-serif'
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

function ChartTasas() {
  const data = {
    labels: TASAS_PRINCIPALES.map(d => d.label),
    datasets: [
      { label: '1° trim. 2025', data: TASAS_PRINCIPALES.map(d => d.t2025), backgroundColor: DATA[2], borderRadius: 4, barPercentage: 0.55 },
      { label: '1° trim. 2026', data: TASAS_PRINCIPALES.map(d => d.t2026), backgroundColor: DATA[1], borderRadius: 4, barPercentage: 0.55 },
    ],
  }
  return (
    <ChartCard
      title="Tasas de actividad, empleo y desocupación — Partidos del GBA"
      hallazgo="Gráfico de barras: entre el 1° trimestre de 2025 y el de 2026 la actividad cayó de 48,5% a 48,0%, el empleo de 43,8% a 43,4% y la desocupación se mantuvo en 9,7%."
      tabla={{
        columnas: ['Tasa', '1° trim. 2025', '1° trim. 2026'],
        filas: TASAS_PRINCIPALES.map(d => [d.label, fmtPct(d.t2025), fmtPct(d.t2026)]),
      }}
      ficha={[
        ['Fuente', 'INDEC, EPH — cuadro 3.1'],
        ['Período', '1° trim. 2025 y 1° trim. 2026'],
        ['Universo', '24 partidos del GBA'],
        ['Unidad', 'actividad y empleo: % de la población · desocupación: % de la PEA'],
        ['CV', 'desocupación 1T2026: 7,1%'],
      ]}
      legend={[{ label: '1° trim. 2025', color: DATA[2] }, { label: '1° trim. 2026', color: DATA[1] }]}
      height={230}
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
      { label: '1° trim. 2025', data: SUBOCUPACION.map(d => d.t2025), backgroundColor: DATA[2], borderRadius: 4, barPercentage: 0.55 },
      { label: '1° trim. 2026', data: SUBOCUPACION.map(d => d.t2026), backgroundColor: DATA[1], borderRadius: 4, barPercentage: 0.55 },
    ],
  }
  return (
    <ChartCard
      title="Subocupación horaria como % de la PEA — Partidos del GBA"
      hallazgo="Gráfico de barras: la subocupación total pasó de 10,9% a 12,1% de la PEA; la no demandante subió de 3,3% a 4,9% y la demandante bajó de 7,7% a 7,2%."
      tabla={{
        columnas: ['Indicador', '1° trim. 2025', '1° trim. 2026'],
        filas: SUBOCUPACION.map(d => [d.label, fmtPct(d.t2025), fmtPct(d.t2026)]),
      }}
      ficha={[
        ['Fuente', 'INDEC, EPH — cuadro 3.1'],
        ['Período', '1° trim. 2025 y 1° trim. 2026'],
        ['Universo', '24 partidos del GBA'],
        ['Unidad', '% de la PEA'],
      ]}
      legend={[{ label: '1° trim. 2025', color: DATA[2] }, { label: '1° trim. 2026', color: DATA[1] }]}
      height={230}
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

function ChartContexto() {
  const data = {
    labels: DESOCUPACION_CONTEXTO.map(d => d.label),
    datasets: [{
      data: DESOCUPACION_CONTEXTO.map(d => d.value),
      backgroundColor: DATA[1],
      borderRadius: 4, barPercentage: 0.6,
    }],
  }
  return (
    <ChartCard
      title="Tasa de desocupación por área geográfica — 1° trimestre 2026"
      hallazgo="Gráfico de barras horizontales: la desocupación de los partidos del GBA (9,7%) duplica con creces la de CABA (4,8%) y supera el promedio de los 31 aglomerados (7,8%)."
      tabla={{
        columnas: ['Área', 'Tasa de desocupación'],
        filas: DESOCUPACION_CONTEXTO.map(d => [d.label, fmtPct(d.value)]),
      }}
      ficha={[
        ['Fuente', 'INDEC, EPH — cuadro 3.1'],
        ['Período', '1° trim. 2026'],
        ['Universo', 'GBA, CABA y total de 31 aglomerados urbanos'],
        ['Unidad', '% de la PEA'],
      ]}
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
    <div style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-12">
        <Link to="/informes" className="inline-flex items-center gap-1.5 text-sm no-underline mb-10" style={{ color: 'rgba(255,255,255,0.62)' }}>
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <SectionLabel dark color="rgba(255,255,255,0.62)">INDEC · EPH · Primer trimestre 2026</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Mercado de trabajo en<br />
          los partidos del GBA
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          En el primer trimestre de 2026 la desocupación en los 24 partidos del conurbano se mantuvo en{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>9,7%</strong>, pero con menos actividad, menos empleo
          y un salto de la subocupación horaria: el ajuste del mercado laboral se dio por reducción de horas
          trabajadas, no por despidos hacia la desocupación abierta.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
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

        <div style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}
        >
          {[
            { label: 'Fuente',        val: 'INDEC — EPH, informes técnicos' },
            { label: 'Universo',      val: '24 partidos del GBA · 13.229.000 personas' },
            { label: 'Período',       val: '1° trim. 2026 vs. 1° trim. 2025' },
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

/* La tesis va primero y la evidencia después: este bloque abre el informe
   inmediatamente después del hero. */
function Tesis() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-10">
      <div style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '1.25rem' }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 2.6vw, 1.75rem)', fontWeight: 700, color: C.ink, lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: '0.75rem', maxWidth: 800 }}>
          El deterioro vino por las horas trabajadas, no por los despidos
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          La desocupación del conurbano no subió, pero el mercado de trabajo se deterioró igual:
          cayeron la actividad y el empleo, y <strong>76.000 personas más</strong> pasaron a trabajar
          menos horas de las que necesitan. La brecha con CABA sigue duplicando la desocupación.
        </p>
      </div>
    </div>
  )
}

// ─── NOTA METODOLÓGICA ───────────────────────────────────────

function NotaMetodologica() {
  return (
    <div style={{
        background: 'var(--surface-2)',
        borderTop: '2px solid var(--ink)',
        padding: '18px 20px',
      }}
    >
      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
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
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeMercadoTrabajoGBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* LAS TASAS PRINCIPALES — texto y gráfico a dos columnas */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Las tasas principales" />
        <div className="grid lg:grid-cols-2 gap-x-10 items-start">
          <div>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              Los partidos del Gran Buenos Aires concentran la mayor densidad poblacional de la Provincia y son,
              según la propia EPH, la subregión bonaerense con peor desempeño relativo del mercado de trabajo.
              En el primer trimestre de 2026, sobre una población de referencia de 13.229.000 personas,
              6.356.000 integraban la población económicamente activa (PEA).
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              La estabilidad de la desocupación en 9,7% no debe leerse de manera aislada: se explica, en parte,
              por la caída simultánea de la tasa de actividad, que retrajo a personas del mercado laboral en lugar
              de que fueran absorbidas por el empleo. Una porción de quienes dejaron de buscar trabajo activamente
              pasó a la inactividad, lo que morigera el efecto sobre la tasa de desocupación aun cuando el empleo
              también retrocedió.
            </p>
            <p className="text-base leading-relaxed" style={{ color: C.inkMid }}>
              En el mismo período, la proporción de ocupados que demandan otro empleo bajó de 17,8% a 15,8%
              de la PEA (−2,0 puntos porcentuales).
            </p>
          </div>
          <DownloadableViz title="Tasas de actividad, empleo y desocupación — Partidos del GBA" fuente="INDEC, EPH — 1T2025 y 1T2026">
            <ChartTasas />
          </DownloadableViz>
        </div>
      </div>

      {/* EL AJUSTE POR HORAS (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="El ajuste por horas" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El indicador que más se movió en la comparación interanual es la subocupación horaria, que agrupa
            a las personas ocupadas que trabajan menos de 35 horas semanales por causas involuntarias y están
            dispuestas a trabajar más. En los partidos del GBA pasó de 10,9% a 12,1% de la PEA entre el primer
            trimestre de 2025 y el mismo trimestre de 2026. La suba se concentró en la subocupación no
            demandante —personas que no buscan activamente otro empleo pero están disponibles para trabajar
            más horas—, mientras que la demandante descendió levemente.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5" style={{ maxWidth: 560 }}>
            <CifraCard label="Subocupación no demandante" valor="4,9%" variacion="+1,6 pp" polaridad="menor-es-mejor" periodo="desde 3,3% en 1T2025" />
            <CifraCard label="Subocupación demandante" valor="7,2%" variacion="−0,5 pp" polaridad="menor-es-mejor" periodo="desde 7,7% en 1T2025" />
          </div>
          <DownloadableViz title="Subocupación horaria — Partidos del GBA" fuente="INDEC, EPH — 1T2025 y 1T2026">
            <ChartSubocupacion />
          </DownloadableViz>
        </div>
      </div>

      {/* DE TASAS A PERSONAS — solo tabla densa */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="De tasas a personas" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Más allá de las tasas, la EPH permite dimensionar estos cambios en términos de personas. El dato más
          relevante: el incremento de la población subocupada (+76.000 personas) superó ampliamente al de la
          población ocupada (+10.000) y al de la desocupada (+2.000) en el mismo período. Buena parte del ajuste
          se dio por reducción de horas trabajadas dentro del universo de ocupados, no por un pasaje directo
          hacia la desocupación abierta.
        </p>
        <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Indicador', '1° trim. 2025 (miles)', '1° trim. 2026 (miles)', 'Variación (miles)'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {POBLACION_TABLA.map((r, i, arr) => (
                <tr key={i} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.ind}</td>
                  <td className="tabular-nums" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.t2025}</td>
                  <td className="tabular-nums" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.t2026}</td>
                  <td
                    className="tabular-nums"
                    style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: r.variacion, polaridad: r.polaridad, texto: true }) }}
                  >
                    {r.variacion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <FichaTecnica items={[
          ['Fuente', 'INDEC, EPH — cuadro 3.2'],
          ['Período', '1° trim. 2025 vs. 1° trim. 2026'],
          ['Universo', '24 partidos del GBA'],
          ['Unidad', 'miles de personas'],
        ]} />
      </div>

      {/* LA BRECHA CON CABA (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="La brecha con CABA" />
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La desocupación en los partidos del GBA (9,7%) continúa siendo considerablemente más alta que la de
            la Ciudad Autónoma de Buenos Aires (4,8%) y que el promedio del total de 31 aglomerados urbanos
            relevados por la EPH (7,8%). La brecha con CABA equivale a 4,9 puntos porcentuales: la desocupación
            del conurbano duplica con creces a la de la Ciudad. Esta diferencia es estructural: se repite, con
            oscilaciones menores, en los sucesivos informes trimestrales de la EPH desde que existe esta
            desagregación geográfica.
          </p>
          <DownloadableViz title="Tasa de desocupación por área geográfica — 1T2026" fuente="INDEC, EPH — 1T2026">
            <ChartContexto />
          </DownloadableViz>
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
            INDEC (2026). "Mercado de trabajo. Tasas e indicadores socioeconómicos (EPH). Primer trimestre de 2026".
            Informes técnicos, Vol. 10, n° 151 — 22 de junio de 2026 · INDEC (2025). "Mercado de trabajo. Tasas e
            indicadores socioeconómicos (EPH). Primer trimestre de 2025". Informes técnicos, Vol. 9, n° 144 — 19 de
            junio de 2025 · Elaboración propia DatosPBA · 2026
          </p>
          <a
            href="https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-31-58"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            INDEC — Mercado de trabajo (EPH) <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
