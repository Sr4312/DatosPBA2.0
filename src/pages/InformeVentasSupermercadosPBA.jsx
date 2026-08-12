import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA, getColorVariacion } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)
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

/* Serie mensual de mayo de 2025 a mayo de 2026. Cada fila trae los niveles de
   la PBA y las variaciones interanuales de todas las aperturas publicadas.
   `corr` es a precios corrientes y `real` a precios constantes de dic. 2016. */
const SERIE = [
  { mes: ['May', '25'], nivelCorr: 671493.8, nivelReal: 7781.6, corrPBA: 40.0, realPBA:   4.2, corrNac: 40.7, realNac:  6.1, realGBA:   2.0, realResto:  9.6 },
  { mes: ['Jun', '25'], nivelCorr: 673698.8, nivelReal: 7676.6, corrPBA: 28.9, realPBA:  -3.0, corrNac: 31.1, realNac:  0.8, realGBA:  -6.6, realResto:  5.9 },
  { mes: ['Jul', '25'], nivelCorr: 679024.4, nivelReal: 7606.6, corrPBA: 28.6, realPBA:  -1.8, corrNac: 29.6, realNac:  1.0, realGBA:  -5.5, realResto:  7.0 },
  { mes: ['Ago', '25'], nivelCorr: 709791.0, nivelReal: 7824.3, corrPBA: 26.7, realPBA:  -1.0, corrNac: 26.3, realNac:  0.3, realGBA:  -2.7, realResto:  3.2 },
  { mes: ['Sep', '25'], nivelCorr: 644595.3, nivelReal: 6938.4, corrPBA: 21.9, realPBA:  -4.9, corrNac: 23.8, realNac: -0.8, realGBA:  -7.9, realResto:  2.3 },
  { mes: ['Oct', '25'], nivelCorr: 710184.8, nivelReal: 7528.7, corrPBA: 25.3, realPBA:  -1.8, corrNac: 27.8, realNac:  2.7, realGBA:   0.0, realResto: -5.7 },
  { mes: ['Nov', '25'], nivelCorr: 740650.1, nivelReal: 7707.1, corrPBA: 19.8, realPBA:  -6.4, corrNac: 21.2, realNac: -2.8, realGBA:  -9.4, realResto:  0.3 },
  { mes: ['Dic', '25'], nivelCorr: 964375.7, nivelReal: 9878.5, corrPBA: 24.0, realPBA:  -2.3, corrNac: 25.5, realNac:  0.5, realGBA:  -4.9, realResto:  3.3 },
  { mes: ['Ene', '26'], nivelCorr: 806493.4, nivelReal: 7969.9, corrPBA: 22.6, realPBA:  -5.0, corrNac: 25.1, realNac: -1.2, realGBA:  -7.6, realResto: -0.2 },
  { mes: ['Feb', '26'], nivelCorr: 748512.3, nivelReal: 7147.0, corrPBA: 21.1, realPBA:  -7.1, corrNac: 23.5, realNac: -3.1, realGBA:  -9.5, realResto: -2.4 },
  { mes: ['Mar', '26'], nivelCorr: 824919.4, nivelReal: 7664.6, corrPBA: 16.7, realPBA: -10.2, corrNac: 20.4, realNac: -5.1, realGBA: -12.6, realResto: -4.8 },
  { mes: ['Abr', '26'], nivelCorr: 791596.5, nivelReal: 7192.4, corrPBA: 19.1, realPBA:  -7.4, corrNac: 21.5, realNac: -3.7, realGBA:  -9.4, realResto: -3.1 },
  { mes: ['May', '26'], nivelCorr: 839081.7, nivelReal: 7514.2, corrPBA: 25.0, realPBA:  -3.4, corrNac: 25.9, realNac: -0.7, realGBA:  -6.0, realResto:  2.3 },
]

/* Acumulado enero-mayo, en millones de pesos. La columna real está en pesos
   constantes de diciembre de 2016, por eso los órdenes de magnitud difieren. */
const ACUMULADO = [
  { region: 'Provincia de Buenos Aires', corr: 4010603.3, corrVar: 20.8, real: 37488.2, realVar: -6.7 },
  { region: '24 partidos del GBA',       corr: 2689098.4, corrVar: 19.0, real: 24774.2, realVar: -9.1 },
  { region: 'Resto de la Provincia',     corr: 1321504.9, corrVar: 24.7, real: 12713.9, realVar: -1.6 },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. La variación nominal va como 'neutro' porque
   sin el dato de precios no dice si el resultado mejoró o empeoró. */
const HERO_STATS = [
  { label: 'Ventas en supermercados', valor: '$839.082', unidad: 'millones', variacion: '+25,0%', polaridad: 'neutro', periodo: 'i.a. a precios corrientes, mayo 2026' },
  { label: 'Volumen vendido',         valor: '−3,4%',    variacion: '−3,4%', polaridad: 'mayor-es-mejor', periodo: 'i.a. a precios constantes' },
  { label: 'Volumen en el GBA',       valor: '−6,0%',    variacion: '−6,0%', polaridad: 'mayor-es-mejor', periodo: 'i.a.; concentra dos tercios de las ventas' },
  { label: 'Acumulado enero-mayo',    valor: '−6,7%',    variacion: '−6,7%', polaridad: 'mayor-es-mejor', periodo: 'volumen, vs. enero-mayo 2025' },
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

// ─── FORMATO ─────────────────────────────────────────────────

const fmtPct = v =>
  `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`

/* Los ticks del eje no llevan signo "+", pero sí el menos tipográfico, para no
   mezclar guion y U+2212 dentro del mismo gráfico. Chart.js dibuja además un
   tick sobre el límite del eje: si no cae en la grilla de a 5, se omite. */
const fmtEje = v => (v % 5 === 0 ? `${v < 0 ? '−' : ''}${Math.abs(v)}%` : '')

const fmtMill = v => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const etiquetaMes = m => `${m[0]}. ${m[1]}`

// ─── VALUE LABELS PLUGIN ─────────────────────────────────────

/* En una serie de 13 puntos rotular todo satura el gráfico. Se rotula el último
   valor de cada línea, que es el dato del mes que informa esta edición.
   Los rótulos se apilan afuera del área de trazado, a la derecha del último
   punto, y se separan entre sí cuando dos líneas cierran cerca: con tres series
   el GBA y la Provincia terminaban a 2,6 puntos y las cifras se pisaban. */
const ALTO_LABEL = 14

const lastPointLabels = {
  id: 'lastPointLabels',
  afterDatasetsDraw(chart) {
    const { ctx, chartArea } = chart

    const rotulos = chart.data.datasets.map((dataset, di) => {
      const puntos = chart.getDatasetMeta(di).data
      const ultimo = puntos[puntos.length - 1]
      if (!ultimo) return null
      return { y: ultimo.y, texto: fmtPct(dataset.data[dataset.data.length - 1]) }
    }).filter(Boolean).sort((a, b) => a.y - b.y)

    // De arriba hacia abajo: si un rótulo cae sobre el anterior, se lo empuja.
    let piso = chartArea.top + ALTO_LABEL / 2
    rotulos.forEach(r => {
      r.y = Math.max(r.y, piso)
      piso = r.y + ALTO_LABEL
    })

    ctx.save()
    // Color uniforme y no el de la serie: a 11px el teal no llega a 4.5:1
    // sobre blanco. La asociación con su línea la da la posición del label.
    ctx.fillStyle = '#334155'
    ctx.font = 'bold 11px Archivo, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    rotulos.forEach(r => ctx.fillText(r.texto, chartArea.right + 6, r.y))
    ctx.restore()
  },
}

// ─── CHART COMPONENTS ────────────────────────────────────────

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8 }

const LINEA_BASE = { tension: 0.25, borderWidth: 2, pointRadius: 2.5, pointHoverRadius: 5 }

/* El cero es la referencia que separa crecer de caer: se pinta más marcado que
   el resto de la grilla. */
const gridCero = ctx => (ctx.tick.value === 0 ? 'rgba(13,17,23,0.30)' : 'rgba(13,17,23,0.08)')

const escalaMeses = {
  ticks: { font: { size: 9.5 }, maxRotation: 0, autoSkip: false },
  grid: { display: false },
}

function ChartTijera() {
  const data = {
    labels: SERIE.map(d => d.mes),
    datasets: [
      { label: 'Precios corrientes', data: SERIE.map(d => d.corrPBA), borderColor: DATA[2], backgroundColor: DATA[2], ...LINEA_BASE },
      { label: 'Precios constantes', data: SERIE.map(d => d.realPBA), borderColor: DATA[1], backgroundColor: DATA[1], ...LINEA_BASE },
    ],
  }
  return (
    <ChartCard
      title="Ventas en supermercados de la PBA. Variación interanual a precios corrientes y constantes"
      hallazgo="Gráfico de líneas: en mayo de 2026 las ventas de la PBA crecieron 25,0% interanual a precios corrientes y cayeron 3,4% a precios constantes. Las dos series se separan todos los meses de la serie, con la brecha más ancha en marzo de 2026."
      tabla={{
        columnas: ['Mes', 'Precios corrientes', 'Precios constantes'],
        filas: SERIE.map(d => [etiquetaMes(d.mes), fmtPct(d.corrPBA), fmtPct(d.realPBA)]),
      }}
      ficha={[
        ['Fuente', 'Dir. Prov. de Estadística sobre Encuesta de supermercados del INDEC'],
        ['Período', 'mayo 2025 - mayo 2026'],
        ['Universo', 'provincia de Buenos Aires'],
        ['Unidad', 'variación interanual en %'],
      ]}
      legend={[{ label: 'Precios corrientes', color: DATA[2] }, { label: 'Precios constantes de dic. 2016', color: DATA[1] }]}
      height={260}
    >
      <Line
        data={data}
        plugins={[lastPointLabels]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 14, right: 48 } },
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${fmtPct(ctx.raw)}` } },
          },
          scales: {
            y: { min: -13, max: 42, ticks: { stepSize: 10, callback: fmtEje }, grid: { color: gridCero }, border: { display: false } },
            x: escalaMeses,
          },
        }}
      />
    </ChartCard>
  )
}

function ChartRegiones() {
  const data = {
    labels: SERIE.map(d => d.mes),
    datasets: [
      { label: 'Provincia de Buenos Aires', data: SERIE.map(d => d.realPBA),   borderColor: DATA[4], backgroundColor: DATA[4], ...LINEA_BASE, borderDash: [4, 3] },
      { label: '24 partidos del GBA',       data: SERIE.map(d => d.realGBA),   borderColor: DATA[1], backgroundColor: DATA[1], ...LINEA_BASE },
      { label: 'Resto de la Provincia',     data: SERIE.map(d => d.realResto), borderColor: DATA[2], backgroundColor: DATA[2], ...LINEA_BASE },
    ],
  }
  return (
    <ChartCard
      title="Volumen vendido por región. Variación interanual a precios constantes"
      hallazgo="Gráfico de líneas: en mayo de 2026 el resto de la Provincia creció 2,3% en volumen y los 24 partidos del GBA cayeron 6,0%. El GBA no registra una variación interanual positiva desde mayo de 2025."
      tabla={{
        columnas: ['Mes', 'Provincia', '24 partidos del GBA', 'Resto de la Provincia'],
        filas: SERIE.map(d => [etiquetaMes(d.mes), fmtPct(d.realPBA), fmtPct(d.realGBA), fmtPct(d.realResto)]),
      }}
      ficha={[
        ['Fuente', 'Dir. Prov. de Estadística sobre Encuesta de supermercados del INDEC'],
        ['Período', 'mayo 2025 - mayo 2026'],
        ['Universo', 'PBA, 24 partidos del GBA y resto de la Provincia'],
        ['Unidad', 'variación interanual en % a precios constantes de dic. 2016'],
      ]}
      legend={[
        { label: 'Provincia de Buenos Aires', color: DATA[4] },
        { label: '24 partidos del GBA', color: DATA[1] },
        { label: 'Resto de la Provincia', color: DATA[2] },
      ]}
      height={280}
    >
      <Line
        data={data}
        plugins={[lastPointLabels]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 14, right: 48 } },
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${fmtPct(ctx.raw)}` } },
          },
          scales: {
            y: { min: -14, max: 11, ticks: { stepSize: 5, callback: fmtEje }, grid: { color: gridCero }, border: { display: false } },
            x: escalaMeses,
          },
        }}
      />
    </ChartCard>
  )
}

// ─── TABLAS ──────────────────────────────────────────────────

function TablaAcumulado() {
  const head = ['Región', 'Acum. corriente (mill. $)', 'Var. i.a.', 'Acum. constante (mill. $)', 'Var. i.a.']
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map((h, i) => (
              /* Hay dos columnas "Var. i.a.": la key va por posición */
              <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ACUMULADO.map((r, i, arr) => (
            <tr key={r.region} style={{ borderBottom: i < arr.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}>
              <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.region}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtMill(r.corr)}</td>
              {/* La variación nominal no lleva color: sin el dato de precios no
                  informa si el resultado mejoró o empeoró. */}
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: r.corrVar, polaridad: 'neutro', texto: true }) }}>{fmtPct(r.corrVar)}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtMill(r.real)}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: r.realVar, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(r.realVar)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaSerie() {
  const head = ['Mes', 'Ventas PBA (mill. $)', 'Var. i.a.', 'Volumen PBA (mill. $ de dic. 2016)', 'Var. i.a.', 'GBA', 'Resto PBA']
  return (
    <details style={{ margin: '1.25rem 0 0' }}>
      <summary style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink, cursor: 'pointer', padding: '0.75rem 0' }}>
        Ver la serie mensual completa, de mayo de 2025 a mayo de 2026
      </summary>
      <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'auto', maxHeight: 520, marginTop: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {head.map((h, i) => (
                /* Hay dos columnas "Var. i.a.": la key va por posición */
              <th key={i} style={{ position: 'sticky', top: 0, background: '#f8fafc', textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.625rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SERIE.map(d => (
              <tr key={etiquetaMes(d.mes)} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                <td style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.ink, fontWeight: 600 }}>{etiquetaMes(d.mes)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.inkMid, textAlign: 'right' }}>{fmtMill(d.nivelCorr)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.inkMid, textAlign: 'right' }}>{fmtPct(d.corrPBA)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.inkMid, textAlign: 'right' }}>{fmtMill(d.nivelReal)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: d.realPBA, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(d.realPBA)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: d.realGBA, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(d.realGBA)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: d.realResto, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(d.realResto)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">Dir. Prov. de Estadística · Encuesta de supermercados · Mayo 2026</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Ventas en supermercados<br />
          de la Provincia de Buenos Aires
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          En mayo de 2026 los supermercados bonaerenses facturaron 25,0% más que un año atrás y vendieron{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>3,4% menos en volumen</strong>. La caída real
          fue 2,7 puntos más profunda que la del promedio nacional y se concentró en el conurbano.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
          {HERO_STATS.map((s, i) => (
            <div
              key={i}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2 }}
              className="p-5"
            >
              <Cifra dark size="xl" label={s.label} valor={s.valor} unidad={s.unidad} variacion={s.variacion} polaridad={s.polaridad} periodo={s.periodo} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}
        >
          {[
            { label: 'Fuente',        val: 'Dir. Prov. de Estadística - INDEC' },
            { label: 'Universo',      val: 'Principales cadenas de supermercados' },
            { label: 'Período',       val: 'May. 2026 vs. may. 2025' },
            { label: 'Actualización', val: 'Agosto 2026' },
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
          El conurbano no vende más en volumen desde mayo de 2025
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          La facturación creció 25,0% interanual y el volumen vendido cayó 3,4%: la diferencia son precios,
          que subieron 29,4%. El promedio provincial reúne dos trayectorias distintas. El resto de la
          Provincia creció <strong>2,3%</strong> en volumen, después de cuatro meses en baja, y los 24
          partidos del GBA cayeron 6,0% sin anotar un mes positivo en todo el último año.
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
        La Encuesta de supermercados del INDEC releva la facturación de{' '}
        <strong style={{ color: C.ink }}>las principales cadenas del país</strong>, no el consumo total de
        alimentos y bebidas. Quedan fuera los autoservicios de cercanía, los mayoristas y el comercio de
        barrio, de modo que una caída del volumen vendido en supermercados no equivale, sin más, a una caída
        del consumo: parte de la retracción puede ser migración de compras hacia canales que esta encuesta no
        mide.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        Las series a precios constantes son de la Dirección Provincial de Estadística, que deflacta las
        ventas corrientes por grupo de artículos y región con índices de precios específicos según
        clasificación COICOP, en base diciembre de 2016. Es una aproximación al volumen físico, no un conteo
        de unidades vendidas. El índice de precios implícitos que se usa acá surge del cociente entre las dos
        series: no es un índice publicado por la fuente y no es comparable con el IPC general.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        La apertura territorial entre los 24 partidos del GBA y el resto de la Provincia la elabora la
        Dirección Provincial de Estadística sobre el reprocesamiento del dato del INDEC. Este informe se
        limita a los resultados generales y{' '}
        <strong style={{ color: C.ink }}>no desagrega por grupo de artículos</strong>, apertura que sí publica
        el informe original y que permitiría distinguir qué rubros explican la caída del volumen.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeVentasSupermercadosPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* LA TIJERA — prosa y gráfico a lo ancho: trece meses de dos series no
          entran en media columna sin apretar los puntos */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="La facturación subió 25,0% y los precios implícitos, 29,4%" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Los supermercados bonaerenses facturaron $839.081,7 millones en mayo. Es el registro nominal
          más alto de 2026 y solo diciembre lo supera en los últimos trece meses. Medida a precios
          constantes de diciembre de 2016, esa misma facturación equivale a $7.514,2 millones, un 3,4%
          menos que un año atrás.
        </p>
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          La distancia entre las dos lecturas es el índice de precios implícitos de la góndola
          bonaerense, que subió 29,4% interanual y 1,5% respecto de abril. Con precios creciendo más
          rápido que las ventas, la facturación sube y el volumen baja al mismo tiempo.
        </p>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Las dos curvas no se cruzaron en ningún momento de la serie: el volumen cayó en doce de los
          trece meses relevados y la única suba fue la de mayo de 2025. El peor registro real es el de
          marzo de 2026, con la facturación creciendo 16,7% y el volumen cayendo 10,2%. Mayo es el mejor
          dato real desde diciembre.
        </p>
        <DownloadableViz title="Ventas en supermercados de la PBA a precios corrientes y constantes" fuente="Dir. Prov. de Estadística sobre Encuesta de supermercados del INDEC">
          <ChartTijera />
        </DownloadableViz>
      </div>

      {/* LA DIVERGENCIA TERRITORIAL — gráfico primero, después prosa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="El resto de la Provincia creció 2,3% en volumen y el GBA cayó 6,0%" />
          <DownloadableViz title="Volumen vendido por región. Variación interanual" fuente="Dir. Prov. de Estadística sobre Encuesta de supermercados del INDEC">
            <ChartRegiones />
          </DownloadableViz>
          <p className="text-base leading-relaxed mt-6 mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Mayo rompe la sincronía de las dos regiones. El resto de la Provincia vuelve a terreno positivo
            después de cuatro meses de caídas. Los 24 partidos del GBA no anotan una variación real positiva
            desde mayo de 2025: en los doce meses siguientes promediaron un retroceso de 6,8% y su mejor
            registro fue el cero exacto de octubre. En pesos constantes, el conurbano vendió $321,9 millones
            menos que un año atrás y el interior $54,5 millones más.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Volumen en el resto de la PBA" valor="+2,3%" variacion="+2,3%" polaridad="mayor-es-mejor" periodo="i.a.; venía de cuatro meses en baja" />
            <CifraCard label="Brecha entre las dos regiones" valor="8,3" unidad="pp" polaridad="neutro" periodo="a favor del resto de la Provincia" />
            <CifraCard label="Peso del GBA en el volumen provincial" valor="67,2%" polaridad="neutro" periodo="68,2% de la facturación corriente" />
          </div>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La divergencia también aparece en la facturación, aunque más apagada: 22,9% de suba nominal en el
            GBA contra 29,7% en el interior, 6,8 puntos de diferencia. Como el conurbano concentra dos
            tercios de las ventas provinciales, su desempeño arrastra el resultado agregado de la Provincia
            aun cuando la otra región crezca.
          </p>
        </div>
      </div>

      {/* LA PARTICIPACIÓN NACIONAL — prosa y cifras, sin gráfico */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="La Provincia perdió un punto de peso en el volumen vendido del país" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          A nivel nacional las ventas de mayo sumaron $2.502.789,7 millones, con una suba nominal de 25,9% y
          una caída real de 0,7%. La PBA quedó por debajo en las dos lecturas: 0,9 puntos menos de
          crecimiento nominal y 2,7 puntos más de caída real. El retroceso bonaerense es, en volumen, casi
          cinco veces el del promedio del país.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ maxWidth: 560 }}>
          <CifraCard label="Peso en las ventas corrientes del país" valor="33,5%" variacion="−0,3 pp" polaridad="neutro" periodo="desde 33,8% en mayo de 2025" />
          <CifraCard label="Peso en el volumen vendido del país" valor="33,9%" variacion="−1,0 pp" polaridad="neutro" periodo="desde 34,9% en mayo de 2025" />
        </div>
        <p className="text-base leading-relaxed mt-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          La Provincia pierde participación más rápido en volumen que en pesos. Su porción del gasto
          nacional en supermercados se achicó tres décimas en doce meses; su porción de las unidades
          vendidas, un punto entero. Para un distrito que explica un tercio del consumo en supermercados del
          país, es un movimiento que conviene seguir mes a mes.
        </p>
      </div>

      {/* EL ACUMULADO — prosa, tabla y serie completa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="El conurbano explica el 92% de la caída del volumen provincial del año" />
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En los primeros cinco meses de 2026 la Provincia facturó $4.010.603,3 millones, contra
            $3.318.844,3 millones del mismo tramo de 2025. En volumen, el acumulado pasó de $40.171,7 a
            $37.488,2 millones constantes. De esos $2.683,5 millones de caída, $2.471,3 millones
            corresponden a los 24 partidos del GBA.
          </p>
          <TablaAcumulado />
          <FichaTecnica items={[
            ['Fuente', 'Dir. Prov. de Estadística sobre Encuesta de supermercados del INDEC'],
            ['Período', 'enero-mayo 2026 vs. enero-mayo 2025'],
            ['Universo', 'PBA, 24 partidos del GBA y resto de la Provincia'],
            ['Unidad', 'millones de pesos corrientes y de pesos constantes de dic. 2016'],
          ]} />
          <p className="text-base leading-relaxed mt-6" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El acumulado ordena lo que el dato mensual todavía deja abierto. El repunte de mayo en el
            interior llega después de un tramo de cinco meses que igual cierra en baja, y la distancia entre
            las dos regiones en el año es de 7,5 puntos. La suba de mayo alcanza para cortar una racha, no
            para revertir el saldo del año.
          </p>
          <TablaSerie />
          <FichaTecnica items={[
            ['Fuente', 'Dir. Prov. de Estadística sobre Encuesta de supermercados del INDEC'],
            ['Período', 'mayo 2025 - mayo 2026'],
            ['Universo', 'PBA, 24 partidos del GBA y resto de la Provincia'],
            ['Unidad', 'millones de pesos y variación interanual en %'],
          ]} />
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
            Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires.
            "Ventas en Supermercados de la Provincia de Buenos Aires", datos de mayo de 2026, publicado en
            julio de 2026 · INDEC, Encuesta de supermercados · INDEC, Índice de Precios al Consumidor (IPC),
            utilizado como deflactor de las series a precios constantes con base diciembre de 2016 ·
            Elaboración propia DatosPBA · 2026
          </p>
          <a
            href="https://www.estadistica.ec.gba.gov.ar/dpe/estadistica/comercio-servicios"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Dirección Provincial de Estadística - Comercio y servicios <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <br />
          <a
            href="https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-14-45"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-2"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            INDEC - Encuesta de supermercados <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
