import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA, DATA_BORDES, getColorVariacion } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)
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

/* Todo sale de la Coyuntura Agropecuaria del II trimestre de 2026 de la
   Dirección Provincial de Estadística (agosto de 2026). Las variaciones se
   recalcularon sobre los niveles de cada cuadro; donde la publicación no
   cierra con sus propios cuadros, se explica en <NotaMetodologica />. */

const FUENTE = 'Dirección Provincial de Estadística (PBA)'

const TRIMESTRES = ['I-25', 'II-25', 'III-25', 'IV-25', 'I-26', 'II-26']

/* Cuadro 1: área sembrada, campaña previa y actual (millones de ha). */
const AREA = [
  // cultivo, campaña actual, previa, actual, var. i.a. %
  ['Soja',    '2025/26', 5.5, 5.3, '−2,8%'],
  ['Maíz',    '2025/26', 3.1, 3.2, '+3,4%'],
  ['Trigo',   '2026/27', 2.6, 2.5, '−3,4%'],
  ['Cebada',  '2026/27', 1.2, 1.2, '−0,1%'],
  ['Girasol', '2025/26', 1.2, 1.3, '+8,3%'],
]

/* Cuadro 1: última campaña con producción publicada. */
const PRODUCCION = [
  // cultivo, campaña, área cosechada (M ha), producción (M t), var. i.a., rinde (t/ha)
  ['Soja',    '2024/25', '5,4', '15,5', '+4,3%',  '2,9'],
  ['Maíz',    '2024/25', '2,4', '17,2', '−3,7%',  '7,2'],
  ['Trigo',   '2025/26', '2,5', '11,1', '+20,1%', '4,4'],
  ['Cebada',  '2025/26', '1,1', '5,4',  '+17,5%', '4,8'],
  ['Girasol', '2024/25', '1,2', '2,8',  '+17,9%', '2,4'],
]

/* Cuadro 2a: precio promedio en puerto, $ nominales por tonelada. */
const PRECIOS = {
  Girasol: [353950, 373894, 464843, 492281, 520406, 597426],
  Soja:    [316747, 315312, 387046, 492703, 473969, 450985],
  Trigo:   [214457, 231518, 263363, 254661, 255002, 286897],
  Maíz:    [212581, 216233, 231387, 263523, 258460, 257705],
}
const PRECIOS_VAR = { Girasol: '+59,8%', Soja: '+43,0%', Trigo: '+23,9%', Maíz: '+19,2%' }

/* Cuadro 4: destinos de las exportaciones granarias, acumulado ene-jun 2026. */
const DESTINOS_CEREALES = [
  ['Vietnam', '486,7', '15,2'], ['Arabia Saudita', '364,8', '11,4'], ['Brasil', '315,8', '9,9'],
  ['China', '229,4', '7,2'], ['Argelia', '217,7', '6,8'], ['Perú', '175,4', '5,5'],
  ['Resto', '1.413,6', '44,1'], ['Total', '3.203,4', '100,0'],
]
const DESTINOS_OLEAGINOSAS = [
  ['China', '301,3', '42,9'], ['Bulgaria', '118,3', '16,9'], ['Países Bajos', '37,7', '5,4'],
  ['Turquía', '36,2', '5,2'], ['España', '36,2', '5,2'], ['Portugal', '28,8', '4,1'],
  ['Resto', '143,0', '20,4'], ['Total', '701,5', '100,0'],
]

/* Cuadro 5: faena fiscalizada en la Provincia, cabezas. */
const FAENA = {
  bovino:  [1651468, 1754266, 1842051, 1722523, 1534512, 1584721],
  porcino: [970453, 1044103, 1051448, 1086115, 1094721, 1155118],
}

/* Cuadro 8: Mercado Agroganadero, $ nominales por kg vivo. */
const HACIENDA = [
  // categoría, II-25, I-26, II-26, var. i.a.
  ['Novillo',    '2.803', '4.340', '4.216', '+50,4%'],
  ['Novillito',  '3.048', '4.611', '4.628', '+51,8%'],
  ['Vaquillona', '2.921', '4.289', '4.393', '+50,4%'],
  ['Vaca',       '1.494', '2.672', '2.545', '+70,4%'],
  ['Toro',       '1.579', '2.785', '2.705', '+71,3%'],
]

/* Cuadro 10: destinos de las exportaciones de carnes, acumulado ene-jun 2026. */
const CARNES_VALOR = [
  ['China', 500.5, 36.5], ['Estados Unidos', 257.5, 18.8], ['Israel', 169.3, 12.4],
  ['Alemania', 90.7, 6.6], ['Países Bajos', 70.1, 5.1], ['Chile', 42.6, 3.1],
]
const CARNES_VOLUMEN = [
  ['China', '112.155', '45,7'], ['Estados Unidos', '30.005', '12,2'], ['Israel', '15.321', '6,2'],
  ['Rusia', '14.259', '5,8'], ['Alemania', '6.339', '2,6'], ['Perú', '5.779', '2,4'],
  ['Resto', '61.415', '25,0'], ['Total', '245.272', '100,0'],
]

const HERO_STATS = [
  { label: 'Exportaciones de cereales y oleaginosas', valor: '3.905', unidad: 'mill. US$', variacion: '+26,9%', polaridad: 'mayor-es-mejor', periodo: 'ene-jun 2026, interanual' },
  { label: 'Faena bovina provincial', valor: '1,58', unidad: 'millones de cabezas', variacion: '−9,7%', polaridad: 'neutro', periodo: 'II trim. 2026, interanual' },
  { label: 'Novillo en el Mercado Agroganadero', valor: '$4.216', unidad: 'por kg vivo', variacion: '+50,4%', polaridad: 'neutro', periodo: 'promedio II trim. 2026, interanual' },
  { label: 'Exportaciones de carnes', valor: '1.370', unidad: 'mill. US$', variacion: '+35,3%', polaridad: 'mayor-es-mejor', periodo: 'ene-jun 2026, interanual' },
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

function ChartCard({ title, hallazgo, ficha, tabla, height = 220, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, padding: '1.25rem 1.25rem 0.875rem', margin: '1.25rem 0' }}>
      {title && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>{title}</p>}
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

const fmtN = (v, dec = 0) => v.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec })

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 2 }
const grilla = { color: 'rgba(13,17,23,0.08)' }

// ─── VALUE LABELS PLUGINS ────────────────────────────────────

/* Barras verticales agrupadas: el valor va arriba de cada barra. */
function makeVLabels(fmt) {
  return {
    id: 'vLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.data.datasets.forEach((dataset, di) => {
        chart.getDatasetMeta(di).data.forEach((bar, i) => {
          ctx.save()
          ctx.fillStyle = '#334155'
          ctx.font = 'bold 11px Archivo, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(fmt(dataset.data[i]), bar.x, bar.y - 4)
          ctx.restore()
        })
      })
    },
  }
}

/* Barras horizontales: la etiqueta va al final de la barra. */
function makeHLabels(fmt) {
  return {
    id: 'hLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.data.datasets.forEach((dataset, di) => {
        chart.getDatasetMeta(di).data.forEach((bar, i) => {
          ctx.save()
          ctx.fillStyle = '#334155'
          ctx.font = 'bold 11px Archivo, sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(fmt(dataset.data[i]), bar.x + 6, bar.y)
          ctx.restore()
        })
      })
    },
  }
}

/* Líneas con seis puntos: el valor se escribe solo en el último, a la derecha,
   con el nombre de la serie. El resto queda en el tooltip y en la tabla. */
function makeLastLabels(fmt) {
  return {
    id: 'lastLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.data.datasets.forEach((dataset, di) => {
        const pts = chart.getDatasetMeta(di).data
        const last = pts[pts.length - 1]
        if (!last) return
        ctx.save()
        ctx.fillStyle = dataset.borderColor
        ctx.font = 'bold 11px Archivo, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${dataset.label} ${fmt(dataset.data[dataset.data.length - 1])}`, last.x + 8, last.y)
        ctx.restore()
      })
    },
  }
}

// ─── GRÁFICOS ────────────────────────────────────────────────

function ChartArea() {
  const data = {
    labels: AREA.map(a => a[0]),
    datasets: [
      { label: 'Campaña actual', data: AREA.map(a => a[3]), backgroundColor: DATA[1], borderRadius: 0, maxBarThickness: 30 },
      { label: 'Campaña previa', data: AREA.map(a => a[2]), backgroundColor: DATA[2], borderRadius: 0, maxBarThickness: 30 },
    ],
  }
  return (
    <ChartCard
      title="Área sembrada por cultivo, campaña actual y previa (millones de hectáreas)"
      hallazgo="Gráfico de barras: la soja pasó de 5,5 a 5,3 millones de hectáreas, el maíz de 3,1 a 3,2, el trigo de 2,6 a 2,5, la cebada se mantuvo en 1,2 y el girasol subió de 1,2 a 1,3."
      tabla={{
        columnas: ['Cultivo', 'Campaña actual', 'Previa (M ha)', 'Actual (M ha)', 'Var. i.a.'],
        filas: AREA.map(a => [a[0], a[1], fmtN(a[2], 1), fmtN(a[3], 1), a[4]]),
      }}
      ficha={[
        ['Fuente', 'SAGyP (Estimaciones agrícolas), vía DPE'],
        ['Período', 'gruesa 2025/26 y fina 2026/27'],
        ['Universo', 'Provincia de Buenos Aires'],
        ['Unidad', 'millones de hectáreas'],
      ]}
      height={260}
    >
      <div aria-hidden="true" style={{ display: 'flex', gap: 16, fontSize: '0.72rem', color: C.inkMid, position: 'absolute', top: 0, right: 0 }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: DATA[1], marginRight: 6 }} />Actual</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: DATA[2], marginRight: 6 }} />Previa</span>
      </div>
      <Bar
        data={data}
        plugins={[makeVLabels(v => fmtN(v, 1))]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 28 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${fmtN(ctx.raw, 1)} M ha` } },
          },
          scales: {
            y: { min: 0, ticks: { display: false }, grid: grilla, border: { display: false } },
            x: { grid: { display: false }, border: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

const COLORES_PRECIOS = { Girasol: DATA[1], Soja: DATA[2], Trigo: DATA_BORDES[3], Maíz: DATA[4] }

function ChartPrecios() {
  const data = {
    labels: TRIMESTRES,
    datasets: Object.entries(PRECIOS).map(([cultivo, valores]) => ({
      label: cultivo,
      data: valores,
      borderColor: COLORES_PRECIOS[cultivo],
      backgroundColor: COLORES_PRECIOS[cultivo],
      borderWidth: 2, pointRadius: 3, tension: 0,
    })),
  }
  return (
    <ChartCard
      title="Precio promedio en puerto por trimestre ($ nominales por tonelada)"
      hallazgo="Gráfico de líneas: entre el segundo trimestre de 2025 y el de 2026 el girasol pasó de 373.894 a 597.426 pesos por tonelada, la soja de 315.312 a 450.985, el trigo de 231.518 a 286.897 y el maíz de 216.233 a 257.705."
      tabla={{
        columnas: ['Cultivo', ...TRIMESTRES, 'Var. i.a. II trim.'],
        filas: Object.entries(PRECIOS).map(([cultivo, v]) => [cultivo, ...v.map(x => fmtN(x)), PRECIOS_VAR[cultivo]]),
      }}
      ficha={[
        ['Fuente', 'Bolsa de Cereales y SAGyP, vía DPE'],
        ['Período', 'I trim. 2025 a II trim. 2026'],
        ['Universo', 'puertos de Bahía Blanca, Quequén y Rosario'],
        ['Unidad', '$ nominales por tonelada, sin deflactar'],
      ]}
      height={300}
    >
      <Line
        data={data}
        plugins={[makeLastLabels(v => fmtN(v))]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 128 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, mode: 'index', intersect: false, callbacks: { label: ctx => `  ${ctx.dataset.label}: $${fmtN(ctx.raw)}` } },
          },
          scales: {
            y: { min: 150000, grid: grilla, border: { display: false }, ticks: { callback: v => `$${fmtN(v / 1000)} mil` } },
            x: { grid: { display: false }, border: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartFaena() {
  const enMillones = v => Math.round(v / 10000) / 100
  const data = {
    labels: TRIMESTRES,
    datasets: [
      { label: 'Bovina', data: FAENA.bovino.map(enMillones), borderColor: DATA[1], backgroundColor: DATA[1], borderWidth: 2, pointRadius: 3, tension: 0 },
      { label: 'Porcina', data: FAENA.porcino.map(enMillones), borderColor: DATA[2], backgroundColor: DATA[2], borderWidth: 2, pointRadius: 3, tension: 0 },
    ],
  }
  return (
    <ChartCard
      title="Faena fiscalizada en la Provincia por trimestre (millones de cabezas)"
      hallazgo="Gráfico de líneas: la faena bovina bajó de 1,84 millones de cabezas en el tercer trimestre de 2025 a 1,58 millones en el segundo de 2026, mientras la porcina subió en cada trimestre, de 0,97 a 1,16 millones."
      tabla={{
        columnas: ['Especie', ...TRIMESTRES],
        filas: [
          ['Bovina', ...FAENA.bovino.map(x => fmtN(x))],
          ['Porcina', ...FAENA.porcino.map(x => fmtN(x))],
        ],
      }}
      ficha={[
        ['Fuente', 'SENASA, vía DPE'],
        ['Período', 'I trim. 2025 a II trim. 2026'],
        ['Universo', 'faena fiscalizada en la Provincia'],
        ['Unidad', 'millones de cabezas; último trimestre provisorio'],
      ]}
      height={260}
    >
      <Line
        data={data}
        plugins={[makeLastLabels(v => fmtN(v, 2))]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 96 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, mode: 'index', intersect: false, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${fmtN(ctx.raw, 2)} M` } },
          },
          scales: {
            y: { min: 0.8, max: 2, grid: grilla, border: { display: false }, ticks: { callback: v => fmtN(v, 1) } },
            x: { grid: { display: false }, border: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartCarnes() {
  const data = {
    labels: CARNES_VALOR.map(d => d[0]),
    datasets: [{
      label: 'Millones de US$',
      data: CARNES_VALOR.map(d => d[1]),
      backgroundColor: CARNES_VALOR.map((_, i) => (i === 0 ? DATA[1] : DATA[2])),
      borderRadius: 0, maxBarThickness: 24,
    }],
  }
  return (
    <ChartCard
      title="Exportaciones bonaerenses de carnes por destino, enero a junio de 2026 (millones de US$)"
      hallazgo="Gráfico de barras horizontales: China compró carne bonaerense por 500,5 millones de dólares en el primer semestre, el 36,5% del total, seguida por Estados Unidos con 257,5 millones e Israel con 169,3 millones."
      tabla={{
        columnas: ['Destino', 'Millones de US$', '% del total'],
        filas: CARNES_VALOR.map(d => [d[0], fmtN(d[1], 1), fmtN(d[2], 1)]),
      }}
      ficha={[
        ['Fuente', 'INDEC, vía DPE'],
        ['Período', 'acumulado enero-junio 2026'],
        ['Universo', 'exportaciones de carnes de la Provincia'],
        ['Unidad', 'millones de US$; resto de destinos: 239,6'],
      ]}
      height={240}
    >
      <Bar
        data={data}
        plugins={[makeHLabels(v => fmtN(v, 1))]}
        options={{
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 56 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtN(ctx.raw, 1)} millones de US$ (${fmtN(CARNES_VALOR[ctx.dataIndex][2], 1)}%)` } },
          },
          scales: {
            x: { min: 0, ticks: { display: false }, grid: grilla, border: { display: false } },
            y: { grid: { display: false }, border: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

// ─── TABLA ───────────────────────────────────────────────────

/* Tabla genérica. `variaciones` indica qué columnas son variación y con qué
   polaridad se colorean: { 4: 'mayor-es-mejor' }. La última fila puede ir en
   negrita si es un total. */
function Tabla({ titulo, head, filas, variaciones = {}, conTotal = false, minWidth = 0 }) {
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflowX: 'auto', margin: '1.25rem 0 0' }}>
      {titulo && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', padding: '1rem 1rem 0' }}>{titulo}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map((h, i) => (
              <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i, arr) => {
            const esTotal = conTotal && i === arr.length - 1
            return (
              <tr key={i} style={{ borderBottom: i < arr.length - 1 ? '0.5px solid #f1f5f9' : 'none', borderTop: esTotal ? `1px solid ${C.rule}` : undefined }}>
                {fila.map((celda, j) => {
                  const polaridad = variaciones[j]
                  const color = polaridad
                    ? getColorVariacion({ variacion: celda, polaridad, texto: true })
                    : (j === 0 ? C.ink : C.inkMid)
                  return (
                    <td
                      key={j}
                      className={j === 0 ? undefined : 'tabular-nums'}
                      style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', textAlign: j === 0 ? 'left' : 'right', color, fontWeight: j === 0 || esTotal || polaridad ? 600 : 400 }}
                    >
                      {celda}
                    </td>
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

// ─── HERO ────────────────────────────────────────────────────

function Hero() {
  return (
    <div style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-12">
        <Link to="/informes" className="inline-flex items-center gap-1.5 text-sm no-underline mb-10" style={{ color: 'rgba(255,255,255,0.62)' }}>
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <SectionLabel dark color="rgba(255,255,255,0.62)">DPE · Coyuntura Agropecuaria · II trimestre 2026</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Coyuntura agropecuaria bonaerense,<br />
          segundo trimestre de 2026
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}>
          La campaña gruesa 2025/26 cerró con menos soja y más maíz y girasol, y la fina 2026/27
          arrancó con menos trigo.{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Granos y carnes exportaron más dólares
          que en el primer semestre de 2025</strong>, mientras la faena bovina retrocedió y el novillo
          cortó su racha de subas.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 hero-coyuntura">
          {HERO_STATS.map((s, i) => (
            <div
              key={i}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2 }}
              className="p-5 min-w-0"
            >
              <Cifra dark size="xl" label={s.label} valor={s.valor} unidad={s.unidad} variacion={s.variacion} polaridad={s.polaridad} periodo={s.periodo} />
            </div>
          ))}
        </div>
        <style>{`.hero-coyuntura .text-data-xl { font-size: clamp(1.5rem, 4vw, 2.5rem); }`}</style>

        <div style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}>
          {[
            { label: 'Fuente',        val: 'Dirección Provincial de Estadística' },
            { label: 'Universo',      val: 'Provincia de Buenos Aires' },
            { label: 'Período',       val: 'II trimestre 2026 y acumulado enero-junio' },
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

function Tesis() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-10">
      <div style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '1.25rem' }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 2.6vw, 1.75rem)', fontWeight: 700, color: C.ink, lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: '0.75rem', maxWidth: 800 }}>
          La carne vacuna vale más afuera y rinde menos en la mesa
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          Las exportaciones bonaerenses de carnes crecieron 35,3% en dólares con casi el mismo tonelaje
          que un año atrás. El salto vino por precio. Del otro lado, la faena cae y los productores retienen
          vientres, así que hay menos carne para repartir, y el ajuste lo absorbe el mercado interno. El
          consumo aparente bajó a <strong>45,1 kg por habitante, 11,3% menos</strong>, y quedó por debajo
          del de carne aviar. La Provincia hace más de la mitad de la faena bovina del país: lo que pase con
          esa oferta en los próximos trimestres se va a sentir primero en sus frigoríficos y en el precio
          que pagan sus hogares.
        </p>
      </div>
    </div>
  )
}

// ─── NOTA METODOLÓGICA ───────────────────────────────────────

function NotaMetodologica() {
  const p = { fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }
  return (
    <div style={{ background: 'var(--surface-2)', borderTop: '2px solid var(--ink)', padding: '18px 20px' }}>
      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
        Nota metodológica
      </p>
      <p style={p}>
        Los datos son los de la Coyuntura Agropecuaria del II trimestre de 2026 de la Dirección
        Provincial de Estadística, que reúne fuentes nacionales. Las campañas en curso son preliminares y
        la faena del último trimestre es provisoria: las dos pueden corregirse en la próxima edición. Los
        precios están en pesos corrientes y no se deflactaron. Las exportaciones son acumuladas de enero
        a junio y se comparan con el mismo semestre de 2025. El consumo aparente es un dato total país.
      </p>
      <p style={p}>
        <strong style={{ color: C.ink }}>No se publican los precios FOB en dólares.</strong> En el cuadro
        de la fuente, las variaciones interanuales no se desprenden de los niveles que el mismo cuadro
        informa: el maíz figura con 206,3 dólares por tonelada en los dos segundos trimestres y una caída
        de 5,4%. Hasta que la fuente lo aclare, el informe no afirma nada sobre precios en dólares.
      </p>
      <p style={p}>
        Tres ajustes sobre la publicación original. La faena bovina nacional cae 10,5% según el cuadro de
        categorías (3.040,9 contra 3.397,5 miles de cabezas), y no 10,1% como dice el texto. Los totales
        anuales de 2025 de faena porcina y aviar repiten exactamente los de 2024, así que se usan solo los
        datos trimestrales. Y la suba del novillo es de 50,4% para el promedio del trimestre; el 47,6%
        que cita la fuente compara junio contra junio.
      </p>
      <p style={{ ...p, marginBottom: 0 }}>
        La producción de 23,1 millones de toneladas de maíz 2025/26 es una primera proyección de la Bolsa
        de Cereales de Rosario, con la cosecha al 70%. Sobre un área cosechada similar a la de las dos
        campañas previas (2,4 millones de hectáreas) implicaría un rinde cercano a 9,6 t/ha, muy por
        encima de los 7,2 a 7,4 t/ha de esas campañas: conviene tomarla con cautela hasta el cierre.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

const parrafo = { color: C.inkMid, maxWidth: '72ch' }

export default function InformeCoyunturaAgropecuariaPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* SUPERFICIE - texto y gráfico a dos columnas, tabla de producción debajo */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="La soja resigna 2,8% de superficie y el girasol suma 8,3%" />
        <div className="grid lg:grid-cols-2 gap-x-10 items-start">
          <div className="min-w-0">
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              La cosecha de soja terminó a fines de junio sobre 5,3 millones de hectáreas, 2,8% menos que
              en la campaña anterior. La Bolsa de Cereales de Rosario proyecta unos 14,3 millones de
              toneladas, por debajo de las 15,5 de 2024/25.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              El maíz fue para el otro lado. Creció 3,4% hasta 3,2 millones de hectáreas y a fines de julio
              llevaba cosechado el 70% del área, con demoras por la humedad del grano y las lluvias. La
              primera estimación de la misma Bolsa es de 23,1 millones de toneladas. El girasol cerró sobre
              1,3 millones de hectáreas, la mayor suba de superficie de la gruesa.
            </p>
            <p className="text-base leading-relaxed" style={{ color: C.inkMid }}>
              La fina 2026/27 empezó con menos intención de siembra: 3,4% menos de trigo y 0,1% menos de
              cebada. Pesa el precio de los fertilizantes, justo después de una campaña triguera que rindió
              4,4 toneladas por hectárea y subió 20,1% su producción.
            </p>
          </div>
          <div className="min-w-0">
            <DownloadableViz title="Área sembrada por cultivo, campaña actual y previa - PBA" fuente={FUENTE}>
              <ChartArea />
            </DownloadableViz>
          </div>
        </div>
        <Tabla
          titulo="Producción y rinde de la última campaña con datos cerrados"
          head={['Cultivo', 'Campaña', 'Área cosechada (M ha)', 'Producción (M t)', 'Var. i.a.', 'Rinde (t/ha)']}
          filas={PRODUCCION}
          variaciones={{ 4: 'mayor-es-mejor' }}
          minWidth={600}
        />
        <FichaTecnica items={[
          ['Fuente', 'SAGyP (Estimaciones agrícolas), vía DPE'],
          ['Período', 'gruesa 2024/25 y fina 2025/26'],
          ['Universo', 'Provincia de Buenos Aires'],
          ['Unidad', 'millones de ha, millones de t, t/ha'],
        ]} />
      </div>

      {/* PRECIOS - gráfico a lo ancho y prosa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="En pesos, el girasol subió 59,8% en un año y el maíz 19,2%" />
          <DownloadableViz title="Precio promedio en puerto de los principales granos, por trimestre" fuente={FUENTE}>
            <ChartPrecios />
          </DownloadableViz>
          <p className="text-base leading-relaxed mt-5 mb-3" style={parrafo}>
            Los cuatro granos cotizaron más caro que en el segundo trimestre de 2025 en los puertos de
            Bahía Blanca, Quequén y Rosario. El girasol llegó a 597.426 pesos por tonelada y es el único
            que sube sin pausa en los seis trimestres del gráfico. La soja subió 43,0% interanual, pero ya
            acumula dos trimestres de baja desde el pico de fines de 2025. Trigo y maíz quedaron atrás, con
            23,9% y 19,2%.
          </p>
          <p className="text-base leading-relaxed" style={parrafo}>
            Son precios nominales, sin descontar la inflación ni la variación del tipo de cambio. La
            comparación en dólares queda fuera de este informe por un problema en la fuente que se
            detalla en la nota metodológica.
          </p>
        </div>
      </div>

      {/* EXPORTACIONES GRANARIAS - tarjetas, párrafo y dos tablas */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="China compra el 42,9% de las oleaginosas y Vietnam encabeza los cereales con 15,2%" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CifraCard label="Cereales" valor="3.203" unidad="millones de US$" variacion="+20,7%" polaridad="mayor-es-mejor" periodo="ene-jun 2026, 15,0 millones de t" />
          <CifraCard label="Semillas y frutos oleaginosos" valor="701,5" unidad="millones de US$" variacion="+66,4%" polaridad="mayor-es-mejor" periodo="ene-jun 2026, 1,5 millones de t" />
          <CifraCard label="Volumen total exportado" valor="16,5" unidad="millones de t" variacion="+29,1%" polaridad="mayor-es-mejor" periodo="ene-jun 2026, cereales y oleaginosas" />
        </div>
        <p className="text-base leading-relaxed mt-6" style={parrafo}>
          Los embarques crecieron más en toneladas que en dólares, otra señal de que el precio por tonelada
          no acompañó. Las oleaginosas crecieron 71,4% en volumen. Los destinos son dos
          mapas distintos. Los cereales se reparten entre Asia, Medio Oriente, África y América del Sur, y ningún
          país supera el 16%. Las oleaginosas dependen de China, que se lleva más del doble que Bulgaria,
          el segundo comprador.
        </p>
        <div className="grid md:grid-cols-2 gap-x-6">
          <div className="min-w-0">
            <Tabla titulo="Cereales por destino" head={['Destino', 'Millones de US$', '%']} filas={DESTINOS_CEREALES} conTotal />
          </div>
          <div className="min-w-0">
            <Tabla titulo="Oleaginosas por destino" head={['Destino', 'Millones de US$', '%']} filas={DESTINOS_OLEAGINOSAS} conTotal />
          </div>
        </div>
        <FichaTecnica items={[
          ['Fuente', 'INDEC, vía DPE'],
          ['Período', 'acumulado enero-junio 2026'],
          ['Universo', 'exportaciones de la Provincia, rubros Cereales y Oleaginosas'],
          ['Unidad', 'millones de US$ y % del total'],
        ]} />
      </div>

      {/* FAENA - dos columnas y tarjetas al final */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="La faena porcina sube 10,6% y ya equivale al 73% de la bovina en cabezas" />
          <div className="grid lg:grid-cols-2 gap-x-10 items-start">
            <div className="min-w-0">
              <DownloadableViz title="Faena fiscalizada bovina y porcina - PBA, por trimestre" fuente={FUENTE}>
                <ChartFaena />
              </DownloadableViz>
            </div>
            <div className="min-w-0">
              <p className="text-base leading-relaxed mb-4 lg:mt-5" style={{ color: C.inkMid }}>
                La Provincia faenó 1,16 millones de cerdos en el trimestre, una serie que sube trimestre a
                trimestre desde comienzos de 2025. Los bovinos fueron en sentido contrario, con 1,58 millones de cabezas,
                el 52,1% de toda la faena nacional, que cayó 10,5%.
              </p>
              <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
                Detrás de la baja bovina hay retención. Las hembras fueron el 46,4% de la faena nacional,
                contra 47,8% un año antes, y un porcentaje menor indica que se guardan más vientres para
                reponer el rodeo. Los animales, además, salen más pesados. En mayo y junio la res con hueso
                superó los 240 kg, algo que no pasaba en más de tres décadas.
              </p>
              <p className="text-base leading-relaxed" style={{ color: C.inkMid }}>
                La faena aviar bajó 4,2%, con 60,0 millones de aves. La fuente lo atribuye a dificultades
                financieras de algunos establecimientos, que frenaron su producción.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <CifraCard label="Faena aviar provincial" valor="60,0" unidad="millones de aves" variacion="−4,2%" polaridad="neutro" periodo="II trim. 2026, interanual" />
            <CifraCard label="Hembras en la faena nacional" valor="46,4%" polaridad="neutro" periodo="II trim. 2026; 47,8% un año antes" />
            <CifraCard label="Faena bovina nacional" valor="3,04" unidad="millones de cabezas" variacion="−10,5%" polaridad="neutro" periodo="II trim. 2026, interanual" />
          </div>
        </div>
      </div>

      {/* PRECIOS DE HACIENDA Y CONSUMO - tabla primero, prosa, tarjetas al final */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="El novillo cortó trece trimestres de subas y la vaca cuesta 70,4% más que hace un año" />
        <Tabla
          titulo="Precio promedio por categoría en el Mercado Agroganadero ($ por kg vivo)"
          head={['Categoría', 'II trim. 2025', 'I trim. 2026', 'II trim. 2026', 'Var. i.a.']}
          filas={HACIENDA}
          variaciones={{ 4: 'neutro' }}
          minWidth={520}
        />
        <FichaTecnica items={[
          ['Fuente', 'Mercado Agroganadero, vía DPE'],
          ['Período', 'II trim. 2025, I y II trim. 2026'],
          ['Universo', 'hacienda comercializada en el Mercado Agroganadero'],
          ['Unidad', '$ nominales por kg vivo'],
        ]} />
        <p className="text-base leading-relaxed mt-6 mb-3" style={parrafo}>
          El novillo bajó 2,9% contra el primer trimestre, la primera caída después de trece trimestres
          seguidos de aumentos. La vaca y el toro también cedieron, mientras el novillito y la vaquillona
          siguieron subiendo. En la comparación interanual las cinco categorías aumentan entre 50% y 71%, y
          las más baratas, vaca y toro, son las que más se encarecieron.
        </p>
        <p className="text-base leading-relaxed mb-5" style={parrafo}>
          El país produjo 726,1 mil toneladas de carne vacuna en el trimestre y exportó el 29,0%. Lo que
          quedó alcanzó para un consumo aparente que ya no encabeza la dieta. La carne aviar pasó adelante y el
          cerdo es la carne que más crece.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CifraCard label="Consumo de carne vacuna" valor="45,1" unidad="kg/hab/año" variacion="−11,3%" polaridad="neutro" periodo="II trim. 2026, total país" />
          <CifraCard label="Consumo de carne aviar" valor="46,0" unidad="kg/hab/año" variacion="+1,4%" polaridad="neutro" periodo="II trim. 2026, total país" />
          <CifraCard label="Consumo de carne porcina" valor="21,0" unidad="kg/hab/año" variacion="+7,9%" polaridad="neutro" periodo="II trim. 2026, total país" />
        </div>
      </div>

      {/* EXPORTACIONES DE CARNES - prosa, gráfico a lo ancho y tabla de volumen */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Estados Unidos paga casi el doble por tonelada de carne que China" />
          <p className="text-base leading-relaxed mb-3" style={parrafo}>
            La Provincia exportó 245.272 toneladas de carne entre enero y junio, 0,7% menos que un año antes,
            y el 83,6% fue carne bovina. La tonelada bovina se vendió a 6.963 dólares en junio, 33,1% más
            que en junio de 2025. A mediados de 2024 valía 3.740 y en mayo de este año tocó un máximo
            cercano a 7.300.
          </p>
          <p className="text-base leading-relaxed" style={parrafo}>
            China sigue siendo el primer comprador, con el 45,7% del volumen y el 36,5% del valor. La
            diferencia entre las dos cifras es el precio. Cada tonelada enviada a China se pagó en promedio
            4.463 dólares, contra 8.582 la de Estados Unidos y 11.050 la de Israel.
          </p>
          <DownloadableViz title="Exportaciones de carnes por destino - PBA, enero a junio 2026" fuente={FUENTE}>
            <ChartCarnes />
          </DownloadableViz>
          <Tabla titulo="Exportaciones de carnes por destino, en toneladas" head={['Destino', 'Toneladas', '%']} filas={CARNES_VOLUMEN} conTotal />
          <FichaTecnica items={[
            ['Fuente', 'INDEC, vía DPE'],
            ['Período', 'acumulado enero-junio 2026'],
            ['Universo', 'exportaciones de carnes de la Provincia'],
            ['Unidad', 'toneladas y % del total'],
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
            Coyuntura Agropecuaria, II trimestre 2026 (agosto de 2026) · Secretaría de Agricultura, Ganadería
            y Pesca de la Nación, Estimaciones agrícolas e Indicadores del Sector Bovino · Bolsa de Cereales
            de Rosario · Bolsa de Cereales y Monitor de Comercio Agropecuario · INDEC · SENASA · CICCRA ·
            Mercado Agroganadero · Elaboración propia DatosPBA · 2026
          </p>
          <a
            href="https://www.estadistica.ec.gba.gov.ar/dpe/"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Dirección Provincial de Estadística - PBA <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
