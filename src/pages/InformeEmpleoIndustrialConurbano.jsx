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
import { DATA, getColorVariacion, VALORACION_HEX } from '@/lib/variacion'

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

/* El empleo es un indicador 'mayor-es-mejor': la suba se pinta con el tono de
   valoración positiva y la caída con el negativo. Chart.js no resuelve
   variables CSS, por eso van los equivalentes hex del sistema. */
const SUBE = VALORACION_HEX.better.base
const CAE  = VALORACION_HEX.worse.base

/* Los cinco polos que concentran el 47,5% del empleo industrial. En los
   gráficos de nivel se pintan con la serie principal y el resto en neutro:
   el color marca de quién habla la sección, no una valoración. */
const POLO = DATA[1]
const RESTO = '#64748B'

// ─── DATOS ───────────────────────────────────────────────────

/* Puestos industriales formales a junio de 2025 y las tres ventanas de
   variación de la Tabla 1 del documento de la UNSAM:
     v18 = enero 2024 - junio 2025 · v12 = julio 2024 - junio 2025
     v6  = enero - junio 2025
   Los 24 valores de `puestos` suman 339.110, el total que publica la fuente. */
const MUNICIPIOS = [
  { m: 'La Matanza',          puestos: 39533, part: 11.66, v18:  -3.85, v12:  -0.11, v6:  -0.38, polo: true },
  { m: 'General San Martín',  puestos: 35983, part: 10.61, v18:  -3.93, v12:  -0.83, v6:  -0.24, polo: true },
  { m: 'Tigre',               puestos: 29506, part:  8.70, v18:  -4.44, v12:  -2.35, v6:  -1.58, polo: true },
  { m: 'Vicente López',       puestos: 29254, part:  8.63, v18:  -2.55, v12:  -0.91, v6:  -0.87, polo: true },
  { m: 'Tres de Febrero',     puestos: 26672, part:  7.87, v18:   1.37, v12:   2.98, v6:   0.46, polo: true },
  { m: 'Quilmes',             puestos: 19082, part:  5.63, v18:  -4.50, v12:  -0.88, v6:   0.04 },
  { m: 'Avellaneda',          puestos: 18449, part:  5.44, v18:  -5.14, v12:  -2.84, v6:  -2.85 },
  { m: 'Lanús',               puestos: 18112, part:  5.34, v18:  -7.22, v12:  -3.23, v6:  -1.65 },
  { m: 'Malvinas Argentinas', puestos: 15161, part:  4.47, v18:   0.14, v12:   2.00, v6:   1.55 },
  { m: 'San Isidro',          puestos: 13353, part:  3.94, v18:  -4.36, v12:  -0.68, v6:  -2.18 },
  { m: 'Almirante Brown',     puestos: 11223, part:  3.31, v18:  -3.77, v12:  -0.35, v6:  -1.58 },
  { m: 'Lomas de Zamora',     puestos: 10352, part:  3.05, v18: -12.88, v12: -10.09, v6:  -5.85 },
  { m: 'Morón',               puestos: 10137, part:  2.99, v18:  -1.04, v12:   0.13, v6:  -1.17 },
  { m: 'Ezeiza',              puestos:  9612, part:  2.83, v18:   8.63, v12:  11.40, v6:   8.40 },
  { m: 'San Fernando',        puestos:  8472, part:  2.50, v18: -12.35, v12: -12.06, v6: -10.05 },
  { m: 'Berazategui',         puestos:  7893, part:  2.33, v18:  -4.88, v12:  -3.83, v6:   0.45 },
  { m: 'Moreno',              puestos:  7481, part:  2.21, v18:   1.84, v12:   3.04, v6:   1.59 },
  { m: 'Esteban Echeverría',  puestos:  7409, part:  2.18, v18:  -4.83, v12:  -2.13, v6:  -1.83 },
  { m: 'Hurlingham',          puestos:  4871, part:  1.44, v18:  -2.77, v12:   1.12, v6:  -0.18 },
  { m: 'Florencio Varela',    puestos:  4563, part:  1.35, v18:  -4.12, v12:  -2.52, v6:  -1.32 },
  { m: 'Merlo',               puestos:  3918, part:  1.16, v18:  -8.80, v12:  -4.09, v6:  -3.83 },
  { m: 'San Miguel',          puestos:  3710, part:  1.09, v18:   0.27, v12:   1.34, v6:  -2.29 },
  { m: 'Ituzaingó',           puestos:  3204, part:  0.94, v18:  -5.96, v12:  -0.65, v6:  -0.90 },
  { m: 'José C. Paz',         puestos:  1160, part:  0.34, v18:   2.84, v12:   6.81, v6:   4.04 },
]

const RANKING_V12 = [...MUNICIPIOS].sort((a, b) => b.v12 - a.v12)

/* Los cinco polos principales, con las tres ventanas y la intensidad por
   habitante. Vicente López repite exactamente los tres valores de la fila
   "Promedio Conurbano" de la fuente: ver la nota metodológica. */
const POLOS_TABLA = [
  { m: 'La Matanza',         puestos: '39.533', part: '11,66%', cada1000: '21,5',  v18: '−3,85%', v12: '−0,11%', v6: '−0,38%' },
  { m: 'General San Martín', puestos: '35.983', part: '10,61%', cada1000: '79,9',  v18: '−3,93%', v12: '−0,83%', v6: '−0,24%' },
  { m: 'Tigre',              puestos: '29.506', part:  '8,70%', cada1000: '64,0',  v18: '−4,44%', v12: '−2,35%', v6: '−1,58%' },
  { m: 'Vicente López',      puestos: '29.254', part:  '8,63%', cada1000: '103,2', v18: '−2,55%', v12: '−0,91%', v6: '−0,87%' },
  { m: 'Tres de Febrero',    puestos: '26.672', part:  '7,87%', cada1000: '73,2',  v18: '+1,37%', v12: '+2,98%', v6: '+0,46%' },
  { m: 'Promedio Conurbano', puestos: '339.110', part: '100%',  cada1000: '-',     v18: '−2,55%', v12: '−0,91%', v6: '−0,87%', total: true },
]

/* Cálculo propio: puestos de junio de 2025 sobre población del Censo 2022.
   Los diez municipios de mayor intensidad, sobre los 24 del Conurbano. */
const POR_HABITANTE = [
  { m: 'Vicente López',       valor: 103.2, polo: true },
  { m: 'General San Martín',  valor:  79.9, polo: true },
  { m: 'Tres de Febrero',     valor:  73.2, polo: true },
  { m: 'Tigre',               valor:  64.0, polo: true },
  { m: 'Avellaneda',          valor:  50.2 },
  { m: 'San Fernando',        valor:  48.0 },
  { m: 'San Isidro',          valor:  45.8 },
  { m: 'Ezeiza',              valor:  40.4 },
  { m: 'Lanús',               valor:  39.4 },
  { m: 'Malvinas Argentinas', valor:  37.1 },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. */
const HERO_STATS = [
  { label: 'Empleo industrial del Conurbano', valor: '339.110', unidad: 'puestos', variacion: '−2,3%', polaridad: 'mayor-es-mejor', periodo: 'desde 346.809 en enero de 2019' },
  { label: 'Variación de los últimos doce meses', valor: '−0,91%', polaridad: 'mayor-es-mejor', periodo: 'promedio de los 24 municipios' },
  { label: 'Municipios que ganaron empleo', valor: '8', unidad: 'de 24', polaridad: 'neutro', periodo: 'julio 2024 - junio 2025' },
  { label: 'Empleo en esos ocho municipios', valor: '23,2%', polaridad: 'neutro', periodo: 'del total industrial del Conurbano' },
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

/* Ficha técnica del gráfico: fuente, período, universo, unidad y las reservas
   que apliquen, como elemento de diseño visible bajo cada visualización. */
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

const fmtPct = v =>
  (v > 0 ? '+' : v < 0 ? '−' : '') +
  Math.abs(v).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'

const fmtNum = v => v.toLocaleString('es-AR')

const fmtUno = v => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/* Rankings largos: el eje de valores se reemplaza por una columna de valores a
   la derecha. Con 24 barras, eje y labels a la vez se pisan en pantallas
   angostas y el sistema de diseño pide uno de los dos, nunca los dos. */
function makeValueColumn(fmt) {
  return {
    id: 'valueColumn',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.data.datasets.forEach((dataset, di) => {
        chart.getDatasetMeta(di).data.forEach((bar, i) => {
          ctx.save()
          ctx.fillStyle = '#334155'
          ctx.font = 'bold 11px Archivo, sans-serif'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'middle'
          ctx.fillText(fmt(dataset.data[i]), chart.width - 6, bar.y)
          ctx.restore()
        })
      })
    },
  }
}

/* Igual que el anterior, más la línea de cero: en un ranking divergente es la
   única referencia que necesita el lector para separar subas de caídas. */
function makeRankLabels(fmt) {
  return {
    id: 'rankLabels',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart
      const x = Math.round(scales.x.getPixelForValue(0)) + 0.5
      ctx.save()
      ctx.strokeStyle = 'rgba(15,23,42,0.35)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, chartArea.top)
      ctx.lineTo(x, chartArea.bottom)
      ctx.stroke()
      ctx.restore()
    },
    afterDatasetsDraw: makeValueColumn(fmt).afterDatasetsDraw,
  }
}

// ─── CHART COMPONENTS ────────────────────────────────────────

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8 }

/* Eje de categorías: con nombres como "Malvinas Argentinas" Chart.js recorta
   la escala al 30% del canvas y come letras en pantallas chicas. */
const ejeCategorias = {
  ticks: { font: { size: 11 } },
  grid: { display: false },
  border: { display: false },
  afterFit(scale) {
    scale.width = Math.max(scale.width, 132)
  },
}

function ChartPuestos() {
  const data = {
    labels: MUNICIPIOS.map(d => d.m),
    datasets: [{
      data: MUNICIPIOS.map(d => d.puestos),
      backgroundColor: MUNICIPIOS.map(d => (d.polo ? POLO : RESTO)),
      borderRadius: 2,
      barPercentage: 0.74,
    }],
  }
  return (
    <ChartCard
      title="Puestos de trabajo industrial formales por municipio - Junio 2025"
      hallazgo="Gráfico de barras horizontales: La Matanza (39.533 puestos), General San Martín (35.983), Tigre (29.506), Vicente López (29.254) y Tres de Febrero (26.672) concentran el 47,5% de los 339.110 puestos industriales del Conurbano; José C. Paz, el último, tiene 1.160."
      tabla={{
        columnas: ['Municipio', 'Puestos', '% del Conurbano'],
        filas: MUNICIPIOS.map(d => [d.m, fmtNum(d.puestos), fmtUno(d.part) + '%']),
      }}
      ficha={[
        ['Fuente', 'SIPA - Secretaría de Trabajo, vía UNSAM-EEyN, documento N° 99'],
        ['Período', 'junio de 2025'],
        ['Universo', '24 municipios del Conurbano - 339.110 puestos'],
        ['Unidad', 'puestos de trabajo industrial formales'],
      ]}
      legend={[
        { label: 'Los cinco polos principales', color: POLO },
        { label: 'Resto del Conurbano', color: RESTO },
      ]}
      height={560}
    >
      <Bar
        data={data}
        plugins={[makeValueColumn(fmtNum)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 54 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtNum(ctx.raw)} puestos` } },
          },
          scales: {
            x: {
              min: 0,
              ticks: { display: false },
              grid: { display: false },
              border: { display: false },
            },
            y: ejeCategorias,
          },
        }}
      />
    </ChartCard>
  )
}

function ChartVariacion() {
  const data = {
    labels: RANKING_V12.map(d => d.m),
    datasets: [{
      data: RANKING_V12.map(d => d.v12),
      backgroundColor: RANKING_V12.map(d => (d.v12 >= 0 ? SUBE : CAE)),
      borderRadius: 2,
      barPercentage: 0.74,
    }],
  }
  return (
    <ChartCard
      title="Variación del empleo industrial por municipio, julio 2024 - junio 2025"
      hallazgo="Gráfico de barras horizontales: ocho municipios sumaron empleo industrial en los doce meses cerrados en junio de 2025, encabezados por Ezeiza con 11,40%, y dieciséis perdieron, con San Fernando (−12,06%) y Lomas de Zamora (−10,09%) muy por debajo del resto."
      tabla={{
        columnas: ['Municipio', 'Variación %', 'Puestos jun. 2025'],
        filas: RANKING_V12.map(d => [d.m, fmtPct(d.v12), fmtNum(d.puestos)]),
      }}
      ficha={[
        ['Fuente', 'SIPA - Secretaría de Trabajo, vía UNSAM-EEyN, documento N° 99'],
        ['Período', 'julio de 2024 - junio de 2025'],
        ['Universo', '24 municipios del Conurbano'],
        ['Unidad', '% de variación de puestos industriales formales'],
        ['Promedio', '−0,91% en el total del Conurbano'],
        ['Reserva', 'Vicente López repite los tres valores del promedio en la fuente'],
      ]}
      legend={[
        { label: 'Sumó empleo industrial', color: SUBE },
        { label: 'Perdió empleo industrial', color: CAE },
      ]}
      height={560}
    >
      <Bar
        data={data}
        plugins={[makeRankLabels(fmtPct)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 58 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtPct(ctx.raw)}` } },
          },
          scales: {
            x: {
              min: -13, max: 12,
              ticks: { display: false },
              grid: { display: false },
              border: { display: false },
            },
            y: ejeCategorias,
          },
        }}
      />
    </ChartCard>
  )
}

function ChartPorHabitante() {
  const data = {
    labels: POR_HABITANTE.map(d => d.m),
    datasets: [{
      data: POR_HABITANTE.map(d => d.valor),
      backgroundColor: POR_HABITANTE.map(d => (d.polo ? POLO : RESTO)),
      borderRadius: 2,
      barPercentage: 0.7,
    }],
  }
  return (
    <ChartCard
      title="Puestos industriales formales cada 1.000 habitantes - Junio 2025"
      hallazgo="Gráfico de barras horizontales: Vicente López tiene 103,2 puestos industriales cada 1.000 habitantes, seguido por General San Martín (79,9), Tres de Febrero (73,2) y Tigre (64,0); La Matanza, primera en cantidad de puestos, queda fuera de los diez primeros con 21,5."
      tabla={{
        columnas: ['Municipio', 'Cada 1.000 habitantes'],
        filas: POR_HABITANTE.map(d => [d.m, fmtUno(d.valor)]),
      }}
      ficha={[
        ['Fuente', 'SIPA - Secretaría de Trabajo e INDEC, Censo 2022 - cálculo propio'],
        ['Período', 'puestos de junio de 2025 y población censada en 2022'],
        ['Universo', 'los 10 municipios de mayor intensidad, sobre los 24 del Conurbano'],
        ['Unidad', 'puestos industriales formales cada 1.000 habitantes'],
        ['Reserva', 'mide dónde están los establecimientos, no dónde viven los trabajadores'],
      ]}
      legend={[
        /* La Matanza, el quinto polo, no entra en los diez primeros: la
           etiqueta habla de pertenencia al grupo, no de cuántos se ven. */
        { label: 'Entre los cinco polos principales', color: POLO },
        { label: 'Resto del Conurbano', color: RESTO },
      ]}
      height={300}
    >
      <Bar
        data={data}
        plugins={[makeValueColumn(fmtUno)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 48 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtUno(ctx.raw)} cada 1.000 hab.` } },
          },
          scales: {
            x: {
              min: 0,
              ticks: { display: false },
              grid: { display: false },
              border: { display: false },
            },
            y: ejeCategorias,
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">SIPA · Secretaría de Trabajo · Enero 2024 - junio 2025</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Empleo industrial en los<br />
          municipios del Conurbano
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          En junio de 2025 el Conurbano tenía{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>339.110</strong> puestos de trabajo industrial
          formales, 2,3% menos que en enero de 2019. En los últimos doce meses ocho de los 24 municipios
          ganaron empleo industrial y dieciséis perdieron, con caídas que van de una décima a doce puntos
          porcentuales.
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
            { label: 'Fuente',        val: 'SIPA - Secretaría de Trabajo, vía UNSAM-EEyN' },
            { label: 'Universo',      val: '24 municipios del Conurbano · 339.110 puestos' },
            { label: 'Período',       val: 'Enero 2024 - junio 2025' },
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
          Ocho municipios crecen, pero 77 de cada 100 puestos están donde el empleo cae
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          Los municipios que sumaron empleo industrial en el último año reúnen{' '}
          <strong>78.804 puestos</strong>, el 23,2% del Conurbano, y casi todos son distritos de baja
          densidad fabril: José C. Paz crece 6,81% sobre una base de 1.160 puestos. Del otro lado, cuatro de
          los cinco polos que sostienen casi la mitad del empleo industrial metropolitano siguen perdiendo.
          Hasta que la recuperación no llegue ahí, el agregado va a seguir cayendo por más municipios que
          aparezcan del lado positivo del ranking.
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
        Los datos provienen del documento N° 99 de <strong style={{ color: C.ink }}>Documentos de Economía Regional
        y Sectorial</strong> de la Escuela de Economía y Negocios de la UNSAM (julio de 2026), que procesa registros
        del SIPA publicados por la Secretaría de Trabajo, Empleo y Seguridad Social. El universo son los puestos
        de trabajo industrial <strong style={{ color: C.ink }}>formales</strong>: no incluye empleo no registrado ni
        trabajo por cuenta propia, que en varios municipios del Conurbano explican una parte relevante de la
        ocupación en la industria.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        El documento de base tiene tres inconsistencias internas que resolvimos a favor de su Tabla 1, la única
        serie numérica completa que publica. Primero: el texto reporta caídas de 8,88% para Lomas de Zamora y
        13,40% para Merlo, mientras la tabla registra <strong style={{ color: C.ink }}>−12,88% y −8,80%</strong>;
        los dígitos parecen transpuestos entre los dos municipios. Segundo: los tres valores de
        <strong style={{ color: C.ink }}> Vicente López</strong> coinciden exactamente con los de la fila
        "Promedio Conurbano", lo que sugiere un error de carga; publicamos la cifra con esa reserva. Tercero: la
        caída de 2,9% que el texto atribuye al año calendario 2024 no se puede encadenar con las tres ventanas de
        la tabla, así que la citamos como dato de la fuente y no la usamos en ningún cálculo.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        La serie mensual de enero de 2019 a junio de 2025 aparece en el documento como gráfico y sin tabla de
        valores: por eso este informe no la reproduce. Las tres ventanas de variación cubren 18, 12 y 6 meses, de
        modo que sus magnitudes no son comparables entre sí. Los puestos cada 1.000 habitantes son cálculo propio
        de DatosPBA sobre la población del Censo 2022 y miden dónde están los establecimientos, no dónde viven
        los trabajadores: en el Conurbano el desacople entre residencia y lugar de trabajo es alto.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeEmpleoIndustrialConurbano() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* LA ESTRUCTURA — gráfico a lo ancho y prosa, sin tarjetas */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Cinco municipios concentran el 47,5% del empleo industrial" />
        <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          La Matanza (39.533 puestos), General San Martín (35.983), Tigre (29.506), Vicente López (29.254) y
          Tres de Febrero (26.672) suman 160.948 puestos industriales formales sobre los 339.110 del Conurbano.
          La distribución sigue el trazado de los corredores donde se instaló la industria del AMBA: la Ruta 3,
          la avenida General Paz y el eje del río Reconquista. Es una estructura que el ciclo de los últimos
          años no movió.
        </p>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          En el otro extremo, los seis municipios más chicos, de José C. Paz con 1.160 puestos a Hurlingham con
          4.871, reúnen el 6,3% del empleo industrial. Esa asimetría es lo que vuelve engañoso cualquier ranking
          de variación porcentual: un punto de caída en La Matanza equivale a 395 puestos y un punto de suba en
          José C. Paz, a 12.
        </p>
        <DownloadableViz title="Puestos industriales formales por municipio - Junio 2025" fuente="SIPA - Secretaría de Trabajo, vía UNSAM-EEyN">
          <ChartPuestos />
        </DownloadableViz>
      </div>

      {/* LOS CINCO POLOS — solo tabla densa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Solo Tres de Febrero creció entre los cinco polos principales" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Los cinco distritos que sostienen casi la mitad del empleo industrial del Conurbano llegaron a junio
            de 2025 con trayectorias distintas. Cuatro perdieron puestos en las tres ventanas que publica la
            fuente. Tres de Febrero creció en las tres, sobre una base de 26.672 puestos: es el quinto en volumen
            y el tercero en empleo industrial por habitante.
          </p>
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Municipio', 'Puestos jun. 2025', '% del Conurbano', 'Cada 1.000 hab.', 'Ene. 2024 - jun. 2025', 'Jul. 2024 - jun. 2025', 'Ene. - jun. 2025'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POLOS_TABLA.map((r, i, arr) => (
                  <tr
                    key={r.m}
                    style={{
                      borderBottom: i < arr.length - 1 ? '0.5px solid #f1f5f9' : 'none',
                      borderTop: r.total ? `1px solid ${C.rule}` : undefined,
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: r.total ? 700 : 600 }}>{r.m}</td>
                    <td className="tabular-nums" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.puestos}</td>
                    <td className="tabular-nums" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.part}</td>
                    <td className="tabular-nums" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.cada1000}</td>
                    {[r.v18, r.v12, r.v6].map((v, j) => (
                      <td
                        key={j}
                        className="tabular-nums"
                        style={{
                          padding: '0.75rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right',
                          color: getColorVariacion({ variacion: v, polaridad: 'mayor-es-mejor', texto: true }),
                        }}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FichaTecnica items={[
            ['Fuente', 'SIPA - Secretaría de Trabajo, vía UNSAM-EEyN, documento N° 99'],
            ['Período', 'tres ventanas de 18, 12 y 6 meses, cerradas en junio de 2025'],
            ['Universo', 'los cinco municipios de mayor empleo industrial, sobre 24'],
            ['Unidad', 'puestos formales y % de variación'],
            ['Cada 1.000 hab.', 'cálculo propio sobre población del Censo 2022'],
            ['Reserva', 'Vicente López repite los tres valores del promedio en la fuente'],
          ]} />
        </div>
      </div>

      {/* EL RANKING — prosa, gráfico y tarjetas */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Ezeiza encabeza el ranking con la cuarta parte del empleo de La Matanza" />
        <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          En los doce meses cerrados en junio de 2025, ocho municipios sumaron empleo industrial y dieciséis
          perdieron, sobre un promedio del Conurbano de −0,91%. Ezeiza encabeza con 11,40%, seguido por José C.
          Paz (6,81%), Moreno (3,04%) y Tres de Febrero (2,98%). Los tres primeros tienen 9.612, 1.160 y 7.481
          puestos: entre los tres no llegan al empleo industrial de Tigre.
        </p>
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          En el extremo opuesto, San Fernando y Lomas de Zamora caen más de diez puntos en el mismo período y
          quedan lejos del resto: la tercera peor variación, la de Merlo, es de −4,09%. La fuente vincula el caso
          de San Fernando con el cierre de una de las fábricas de neumáticos del país, y señala que los tres
          municipios comparten fuerte peso de textil, indumentaria y calzado, poca diversificación productiva y
          escasa presencia de parques industriales formales.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <CifraCard label="San Fernando" valor="8.472" unidad="puestos" variacion="−12,06%" polaridad="mayor-es-mejor" periodo="jul. 2024 - jun. 2025 · −17,0% desde 2019" />
          <CifraCard label="Lomas de Zamora" valor="10.352" unidad="puestos" variacion="−10,09%" polaridad="mayor-es-mejor" periodo="jul. 2024 - jun. 2025" />
          <CifraCard label="Merlo" valor="3.918" unidad="puestos" variacion="−4,09%" polaridad="mayor-es-mejor" periodo="jul. 2024 - jun. 2025" />
        </div>
        <DownloadableViz title="Variación del empleo industrial por municipio, jul. 2024 - jun. 2025" fuente="SIPA - Secretaría de Trabajo, vía UNSAM-EEyN">
          <ChartVariacion />
        </DownloadableViz>
      </div>

      {/* POR HABITANTE — gráfico primero, prosa después */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Vicente López tiene 103 puestos industriales cada 1.000 habitantes" />
          <DownloadableViz title="Puestos industriales cada 1.000 habitantes - Junio 2025" fuente="SIPA - Secretaría de Trabajo e INDEC, Censo 2022">
            <ChartPorHabitante />
          </DownloadableViz>
          <p className="text-base leading-relaxed mt-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Relacionar los puestos de junio de 2025 con la población del Censo 2022 reordena el mapa. Vicente
            López, cuarto en volumen, tiene 103,2 puestos industriales cada 1.000 habitantes: casi cinco veces la
            intensidad de La Matanza (21,5), que es primera en cantidad y queda fuera de los diez primeros de
            este ranking. Los cuatro lugares iniciales los ocupan municipios del norte y del primer cordón, donde
            la industria convive con poblaciones comparativamente chicas. Para la discusión pública la diferencia
            no es menor: un cierre en Vicente López o en Tres de Febrero pesa mucho más sobre el empleo local que
            el mismo cierre en un distrito del segundo cordón.
          </p>
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
            Gutiérrez Cabello, A. (2026). "Informe sobre el empleo industrial del Conurbano Bonaerense".
            Documentos de Economía Regional y Sectorial, n° 99, ISSN 2618-494X. CERE - Centro de Economía
            Regional, Escuela de Economía y Negocios, Universidad Nacional de San Martín · Sistema Integrado
            Previsional Argentino (SIPA), Secretaría de Trabajo, Empleo y Seguridad Social de la Nación ·
            INDEC (2023). Censo Nacional de Población, Hogares y Viviendas 2022 · Elaboración propia
            DatosPBA · 2026
          </p>
          <a
            href="https://www.unsam.edu.ar/escuelas/economia/"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            UNSAM - Escuela de Economía y Negocios <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
