import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA, DATA_BORDES, VALORACION_HEX, getColorVariacion } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)
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
}

// ─── DATOS ───────────────────────────────────────────────────

/* Existencias bovinas a diciembre de 2024 por partido. `stock` en cabezas;
   `part`, en % del total provincial; `puesto2017`, la posición que ocupaba
   el partido en diciembre de 2017; `var17` y `var23`, variación porcentual
   del stock entre diciembre de 2017 y de 2024 y entre diciembre de 2023 y
   de 2024. La polaridad es 'mayor-es-mejor': el stock es una magnitud de
   actividad productiva del distrito. */
const TOP15 = [
  { pos: 1,  muni: 'Ayacucho',          stock: 823119, part: 4.24, puesto2017: 1,  var17: 0.9,   var23: 1.6  },
  { pos: 2,  muni: 'Olavarría',         stock: 702846, part: 3.62, puesto2017: 2,  var17: -2.3,  var23: -4.2 },
  { pos: 3,  muni: 'Azul',              stock: 590088, part: 3.04, puesto2017: 3,  var17: -1.1,  var23: -1.5 },
  { pos: 4,  muni: 'Benito Juárez',     stock: 479189, part: 2.47, puesto2017: 4,  var17: -0.5,  var23: -0.6 },
  { pos: 5,  muni: 'General La Madrid', stock: 445757, part: 2.30, puesto2017: 6,  var17: -5.5,  var23: -1.0 },
  { pos: 6,  muni: 'Rauch',             stock: 443678, part: 2.28, puesto2017: 9,  var17: 3.1,   var23: 3.6  },
  { pos: 7,  muni: 'Lincoln',           stock: 428532, part: 2.21, puesto2017: 7,  var17: -7.0,  var23: -0.4 },
  { pos: 8,  muni: 'Chascomús',         stock: 394013, part: 2.03, puesto2017: 10, var17: -8.2,  var23: 4.3  },
  { pos: 9,  muni: 'Bolívar',           stock: 390906, part: 2.01, puesto2017: 8,  var17: -9.8,  var23: -3.9 },
  { pos: 10, muni: 'Tapalqué',          stock: 384892, part: 1.98, puesto2017: 14, var17: 5.3,   var23: -0.3 },
  { pos: 11, muni: 'Villarino',         stock: 375646, part: 1.93, puesto2017: 5,  var17: -20.4, var23: -6.3 },
  { pos: 12, muni: 'General Villegas',  stock: 364737, part: 1.88, puesto2017: 21, var17: 10.3,  var23: -4.9 },
  { pos: 13, muni: 'Laprida',           stock: 363874, part: 1.87, puesto2017: 12, var17: -4.7,  var23: 0.1  },
  { pos: 14, muni: 'Mar Chiquita',      stock: 358887, part: 1.85, puesto2017: 17, var17: 1.5,   var23: 0.8  },
  { pos: 15, muni: 'Trenque Lauquen',   stock: 353703, part: 1.82, puesto2017: 11, var17: -7.4,  var23: -5.0 },
]

/* Puestos ganados (positivo) o perdidos (negativo) entre diciembre de 2017 y
   diciembre de 2024. Quedan afuera los cinco partidos que no se movieron:
   Ayacucho, Olavarría, Azul, Benito Juárez y Lincoln. */
const MOVIMIENTOS = TOP15
  .map(d => ({ muni: d.muni, puestos: d.puesto2017 - d.pos, desde: d.puesto2017, hasta: d.pos }))
  .filter(d => d.puestos !== 0)
  .sort((a, b) => b.puestos - a.puestos)


/* Stock de los tres primeros del ranking, en miles de cabezas, diciembre de
   cada año. PROVISORIO: los valores de 2018 a 2022 están leídos a ojo del
   gráfico de líneas del informe fuente (PDF), redondeados al millar; 2017 y
   2023 salen de aplicar las variaciones publicadas al dato de 2024, y 2024 es
   exacto. Reemplazar por la serie de la planilla cuando esté disponible. */
const ANIOS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
const TOP3_SERIE = [
  { muni: 'Ayacucho',  color: DATA[1],        valores: [816, 832, 843, 850, 834, 838, 810, 823] },
  { muni: 'Olavarría', color: DATA[2],        valores: [719, 723, 732, 720, 714, 754, 734, 703] },
  { muni: 'Azul',      color: DATA_BORDES[3], valores: [597, 600, 616, 617, 606, 607, 599, 590] },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. */
/* La unidad va en el período y no en `unidad`: en el tamaño xl "cabezas" al
   lado de un número de ocho cifras no entra en la tarjeta del hero. */
const HERO_STATS = [
  { label: 'Stock bovino provincial',        valor: '19,4', unidad: 'millones', variacion: '−5,4%', polaridad: 'mayor-es-mejor', periodo: '19.419.086 cabezas · vs. diciembre de 2017' },
  { label: 'Ayacucho, primero del ranking',  valor: '823.119',    variacion: '+0,9%',  polaridad: 'mayor-es-mejor', periodo: 'cabezas · vs. diciembre de 2017' },
  { label: 'Los quince primeros, sobre el total', valor: '35,5%', polaridad: 'neutro',         periodo: '6.899.867 cabezas en diciembre de 2024' },
  { label: 'Villarino, del 5° al 11° puesto', valor: '375.646',   variacion: '−20,4%', polaridad: 'mayor-es-mejor', periodo: 'cabezas · vs. diciembre de 2017' },
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
      style={{ color: color || (dark ? 'rgba(255,255,255,0.5)' : C.inkMid) }}
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

/* Ficha técnica del gráfico: fuente, período, universo y unidad, como
   elemento de diseño visible bajo cada visualización. */
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

// ─── FORMATOS Y VALUE LABELS ─────────────────────────────────

const fmtNum  = v => v.toLocaleString('es-AR', { maximumFractionDigits: 0 })
const fmtPct2 = v => v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
/* Variación con signo explícito: el menos es U+2212, como en el resto del sitio. */
const fmtVar  = v => {
  const abs = Math.abs(v).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return (v > 0 ? '+' : v < 0 ? '−' : '') + abs + '%'
}
const fmtPuestos = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v)

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

// Barras horizontales divergentes: la etiqueta va del lado hacia el que crece la barra
function makeDivergingLabels(fmt) {
  return {
    id: 'divergingLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.data.datasets.forEach((dataset, di) => {
        chart.getDatasetMeta(di).data.forEach((bar, i) => {
          const v = dataset.data[i]
          ctx.save()
          ctx.fillStyle = '#334155'
          ctx.font = 'bold 11px Archivo, sans-serif'
          ctx.textAlign = v < 0 ? 'right' : 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(fmt(v), v < 0 ? bar.x - 8 : bar.x + 8, bar.y)
          ctx.restore()
        })
      })
    },
  }
}

// ─── CHART COMPONENTS ────────────────────────────────────────

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8 }

/* Eje de valor oculto: cuando cada barra lleva su cifra escrita al lado, el eje
   repite el dato y le come ancho al gráfico. La unidad va en la ficha técnica.
   Es una función porque Chart.js escribe dentro de las opciones que recibe. */
const ejeValorOculto = () => ({
  min: 0,
  ticks: { display: false },
  grid: { display: false },
  border: { display: false },
})

/* En pantallas chicas los nombres largos se parten en dos líneas: si no, el eje
   se queda con todo el ancho y las barras se reducen a un muñón. */
function partirEtiqueta(texto, anchoCanvas) {
  if (anchoCanvas > 560 || texto.length <= 20) return texto
  const palabras = texto.split(' ')
  if (palabras.length < 2) return texto
  let mejor = null
  for (let i = 1; i < palabras.length; i++) {
    const lineas = [palabras.slice(0, i).join(' '), palabras.slice(i).join(' ')]
    const costo = Math.max(lineas[0].length, lineas[1].length)
    if (!mejor || costo < mejor.costo) mejor = { costo, lineas }
  }
  return mejor.lineas
}

/* Eje de categorías con el ancho que "General La Madrid" necesita, sin pasar
   del 45% del canvas para que la barra siga siendo lo que se lee. */
function ejeCategorias(anchoDeseado) {
  return {
    grid: { display: false },
    border: { display: false },
    ticks: {
      font: { size: 11 },
      autoSkip: false,
      callback(value) {
        return partirEtiqueta(this.getLabelForValue(value), this.chart.width)
      },
    },
    afterFit(scale) {
      scale.width = Math.max(scale.width, Math.min(anchoDeseado, scale.chart.width * 0.45))
    },
  }
}

function ChartTop15() {
  const data = {
    labels: TOP15.map(d => d.muni),
    datasets: [{
      data: TOP15.map(d => d.stock),
      backgroundColor: DATA[1],
      borderRadius: 4, barPercentage: 0.72,
    }],
  }
  return (
    <ChartCard
      title="Los 15 municipios con mayor stock bovino - Cabezas a diciembre de 2024"
      hallazgo="Gráfico de barras horizontales: Ayacucho encabeza el ranking con 823.119 cabezas, seguido por Olavarría con 702.846 y Azul con 590.088; del quinto puesto en adelante los valores van de 445.757 (General La Madrid) a 353.703 (Trenque Lauquen)."
      tabla={{
        columnas: ['Municipio', 'Cabezas dic-2024', '% del total provincial'],
        filas: TOP15.map(d => [d.muni, fmtNum(d.stock), fmtPct2(d.part)]),
      }}
      ficha={[
        ['Fuente', 'Existencias bovinas por partido'],
        ['Período', 'diciembre de 2024'],
        ['Universo', '135 partidos bonaerenses · 19.419.086 cabezas'],
        ['Unidad', 'cabezas'],
      ]}
      height={430}
    >
      <Bar
        data={data}
        plugins={[makeHValueLabels(fmtNum)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 64 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtNum(ctx.raw)} cabezas` } },
          },
          scales: {
            x: ejeValorOculto(),
            y: ejeCategorias(132),
          },
        }}
      />
    </ChartCard>
  )
}

function ChartMovimientos() {
  const data = {
    labels: MOVIMIENTOS.map(d => d.muni),
    datasets: [{
      data: MOVIMIENTOS.map(d => d.puestos),
      /* Ganar puestos es la valoración positiva bajo 'mayor-es-mejor': el color
         sale de la paleta de valoración, no de un hex escrito a mano. */
      backgroundColor: MOVIMIENTOS.map(d => d.puestos > 0 ? VALORACION_HEX.better.base : VALORACION_HEX.worse.base),
      borderRadius: 4, barPercentage: 0.66,
    }],
  }
  return (
    <ChartCard
      title="Puestos ganados y perdidos en el ranking provincial entre diciembre de 2017 y diciembre de 2024"
      hallazgo="Gráfico de barras horizontales divergentes: General Villegas ganó 9 puestos (del 21° al 12°), Tapalqué 4, Rauch y Mar Chiquita 3, Chascomús 2 y General La Madrid 1; Villarino perdió 6 puestos (del 5° al 11°), Trenque Lauquen 4, y Bolívar y Laprida 1 cada uno."
      tabla={{
        columnas: ['Municipio', 'Puesto 2017', 'Puesto 2024', 'Puestos'],
        filas: MOVIMIENTOS.map(d => [d.muni, String(d.desde), String(d.hasta), fmtPuestos(d.puestos)]),
      }}
      ficha={[
        ['Fuente', 'Existencias bovinas por partido'],
        ['Período', 'diciembre de 2017 y diciembre de 2024'],
        ['Universo', 'los 10 partidos del top 15 que cambiaron de puesto'],
        ['Unidad', 'puestos en el ranking de 135 partidos'],
      ]}
      legend={[
        { label: 'Ganó puestos', color: VALORACION_HEX.better.base },
        { label: 'Perdió puestos', color: VALORACION_HEX.worse.base },
      ]}
      height={330}
    >
      <Bar
        data={data}
        plugins={[makeDivergingLabels(fmtPuestos)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 28, left: 28 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => {
              const d = MOVIMIENTOS[ctx.dataIndex]
              return `  del ${d.desde}° al ${d.hasta}° puesto (${fmtPuestos(d.puestos)})`
            } } },
          },
          scales: {
            x: {
              min: -10, max: 10,
              ticks: { display: false, stepSize: 1 },
              grid: { color: ctx => (ctx.tick.value === 0 ? 'rgba(13,17,23,0.35)' : 'transparent'), drawTicks: false },
              border: { display: false },
            },
            y: ejeCategorias(132),
          },
        }}
      />
    </ChartCard>
  )
}

function ChartTop3Serie() {
  const data = {
    labels: ANIOS.map(String),
    datasets: TOP3_SERIE.map(d => ({
      label: d.muni,
      data: d.valores,
      borderColor: d.color,
      backgroundColor: d.color,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0,
    })),
  }
  return (
    <ChartCard
      title="Stock bovino de los tres primeros del ranking - Miles de cabezas a diciembre de cada año"
      hallazgo="Gráfico de líneas: Ayacucho tocó su máximo en 2020 con unas 850.000 cabezas y cerró 2024 en 823.119; Olavarría subió hasta unas 754.000 en 2022 y cayó a 702.846 en 2024; Azul se movió entre 590.000 y 617.000 en todo el período."
      tabla={{
        columnas: ['Año', ...TOP3_SERIE.map(d => d.muni + ' (miles)')],
        filas: ANIOS.map((a, i) => [String(a), ...TOP3_SERIE.map(d => fmtNum(d.valores[i]))]),
      }}
      ficha={[
        ['Fuente', 'Existencias bovinas por partido'],
        ['Período', 'diciembre de 2017 a diciembre de 2024'],
        ['Unidad', 'miles de cabezas'],
        ['Escala', 'eje truncado en 550.000 cabezas para leer el recorrido de las series'],
        ['Precisión', '2018 a 2022 leídos del gráfico de la fuente y redondeados al millar; 2017 y 2023 calculados desde las variaciones publicadas'],
      ]}
      legend={TOP3_SERIE.map(d => ({ label: d.muni, color: d.color }))}
      height={280}
    >
      <Line
        data={data}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${fmtNum(ctx.parsed.y)} mil cabezas` } },
          },
          scales: {
            y: { min: 550, max: 875, ticks: { stepSize: 50, callback: v => fmtNum(v) }, grid: { color: 'rgba(13,17,23,0.08)' } },
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">Existencias bovinas por partido · Diciembre de 2017 a diciembre de 2024</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Los quince municipios con más<br />
          ganado bovino de la Provincia
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          Ayacucho, Olavarría y Azul encabezan el rodeo bonaerense a diciembre de 2024 y
          sostienen ese orden desde 2017. Detrás, el ranking se recompuso: General Villegas
          subió nueve puestos y Villarino perdió un quinto de su stock. Mientras tanto, la
          Provincia tiene <strong style={{ color: 'rgba(255,255,255,0.9)' }}>1,1 millones de cabezas</strong> menos
          que siete años atrás.
        </p>

        {/* En dos columnas de 390px una cifra de seis dígitos a 40px se sale de
           la tarjeta: el tamaño baja con el viewport y vuelve a 40px en escritorio. */}
        <style>{`.hero-bovino .text-data-xl { font-size: clamp(1.5rem, 4vw, 2.5rem) }`}</style>
        <div className="hero-bovino grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
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
            { label: 'Fuente',        val: 'Existencias bovinas por partido, a diciembre de cada año' },
            { label: 'Universo',      val: '135 partidos de la Provincia de Buenos Aires' },
            { label: 'Período',       val: 'diciembre de 2017 a diciembre de 2024' },
            { label: 'Actualización', val: 'Septiembre 2026' },
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
          El podio ganadero no cambió en siete años, pero la Provincia perdió 1,1 millones de cabezas
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          La ganadería bonaerense sigue concentrada en el centro y el sudeste: los quince primeros
          partidos reúnen <strong>el 35,5% del rodeo provincial</strong> y esa proporción casi no se
          movió desde 2017. Lo que sí cambió es el tamaño de la torta. El stock cayó en la Provincia y
          en diez de los quince líderes, así que buena parte de los ascensos en el ranking no son
          partidos que crecieron, sino partidos que retrocedieron menos que sus vecinos. Para los
          municipios ganaderos, que financian parte de su presupuesto con tasas ligadas al movimiento
          de hacienda, esa contracción es un dato fiscal, no solo productivo.
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
        El informe usa la serie de <strong style={{ color: C.ink }}>existencias bovinas declaradas por partido</strong>,
        con corte a diciembre de cada año entre 2017 y 2024. Es una medida de stock, no de producción:
        la fuente no releva faena, producción de carne, exportaciones ni la composición del rodeo por
        categoría (terneros, novillos, vacas), así que ninguna de esas dimensiones se analiza acá. El
        ranking se construye sobre las cabezas a diciembre de 2024 y las posiciones de 2017 salen de la
        misma serie.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        Las variaciones se pintan con polaridad <strong style={{ color: C.ink }}>mayor-es-mejor</strong>: el stock
        es una magnitud de actividad productiva del distrito y su caída se lee como retroceso. Ganar
        puestos en el ranking es un movimiento relativo y puede convivir con una pérdida de cabezas,
        como en Chascomús. La serie de ese partido muestra bajas puntuales en 2019 (320.925 cabezas) y
        2022 (315.466) seguidas de recuperaciones, un patrón más irregular que el del resto del grupo,
        cuya causa no puede establecerse con esta fuente.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        La serie de los tres primeros del ranking (2017-2024) se reconstruyó a partir del gráfico del
        informe fuente: los valores de 2018 a 2022 están leídos de esa imagen y redondeados al millar,
        así que pueden diferir en algunos miles de cabezas del dato declarado. Los de 2017 y 2023 se
        calcularon aplicando las variaciones publicadas al stock de 2024.
        San Miguel figura con 4 o 5 cabezas hasta 2020 y sin datos desde 2021, en línea con su perfil
        urbano; el caso no afecta el ranking. La caída del stock provincial entre 2017 y 2024 no puede
        atribuirse a una causa específica sin información adicional sobre precios relativos,
        condiciones climáticas o políticas sectoriales del período.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

const th = (i, first = 1) => ({
  textAlign: i < first ? 'left' : 'right',
  fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase',
  letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}`,
})

export default function InformeStockBovinoMunicipiosPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* EL TRAMO ALTO - texto y gráfico a dos columnas */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Ayacucho, Olavarría y Azul reúnen el 10,9% del rodeo provincial" />
        {/* min-w-0 en las dos celdas: sin eso el canvas del gráfico fija el ancho
           mínimo de la columna y la sección desborda el viewport al achicarlo. */}
        <div className="grid lg:grid-cols-2 gap-x-10 items-start">
          <div className="min-w-0">
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              Los tres primeros suman 2.116.053 cabezas, más que los cuatro partidos que los siguen
              en el ranking tomados juntos. Ayacucho, en el sudeste, es el único de los tres
              que terminó 2024 con más hacienda que en 2017, y amplió la distancia sobre Olavarría:
              la ventaja pasó de 96.935 cabezas a 120.273 en siete años.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              Con Benito Juárez, cuarto con 479.189 cabezas, se cierra un bloque que no cambió de
              orden en todo el período. Es un núcleo de cría y engorde del centro y el sudeste, sobre
              suelos y clima aptos para la actividad, y explica por qué el mapa ganadero bonaerense
              se parece tanto al de hace una década.
            </p>
            <p className="text-base leading-relaxed" style={{ color: C.inkMid }}>
              Del quinto puesto para abajo la tabla se aplana. Entre General La Madrid (445.757) y
              Trenque Lauquen (353.703), último del grupo, hay once partidos en un rango de 92.000
              cabezas, y ahí es donde se produjeron todos los cambios de posición.
            </p>
          </div>
          <div className="min-w-0">
            <DownloadableViz title="Los 15 municipios con mayor stock bovino - diciembre de 2024" fuente="Existencias bovinas por partido, diciembre de 2024">
              <ChartTop15 />
            </DownloadableViz>
          </div>
        </div>
      </div>

      {/* LA TABLA COMPLETA (fondo blanco alternado) - solo tabla densa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Diez de los quince líderes tienen menos hacienda que en 2017" />
          <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Solo cinco partidos del grupo terminaron 2024 por encima de su stock de 2017: General
            Villegas, Tapalqué, Rauch, Mar Chiquita y Ayacucho. Las caídas más profundas del período
            son las de Villarino, Bolívar (−9,8%) y Chascomús (−8,2%). En el último año la foto es
            parecida: cinco subas interanuales, encabezadas por Chascomús (+4,3%) y Rauch (+3,6%), y
            diez bajas, con Villarino, Trenque Lauquen y General Villegas en el fondo.
          </p>
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['#', 'Municipio', 'Cabezas dic-2024', '% del total', 'Puesto 2017', 'Var. 2017-2024', 'Var. 2023-2024'].map((h, i) => (
                    <th key={h} style={th(i, 2)}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP15.map((r, i, arr) => (
                  <tr key={r.muni} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkLight }}>{r.pos}</td>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.muni}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600, textAlign: 'right' }}>{fmtNum(r.stock)}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtPct2(r.part)}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.puesto2017}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: fmtVar(r.var17), polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtVar(r.var17)}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: fmtVar(r.var23), polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtVar(r.var23)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FichaTecnica items={[
            ['Fuente', 'Existencias bovinas por partido'],
            ['Período', 'diciembre de 2017, 2023 y 2024'],
            ['Universo', 'los 15 partidos con más stock en diciembre de 2024, sobre 135'],
            ['Unidad', 'cabezas, % del total provincial y variación % del stock'],
          ]} />
        </div>
      </div>

      {/* LOS MOVIMIENTOS - gráfico a lo ancho y después la prosa */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="General Villegas subió nueve puestos y Villarino bajó seis" />
        <DownloadableViz title="Puestos ganados y perdidos en el ranking bovino - 2017 a 2024" fuente="Existencias bovinas por partido, diciembre de 2017 y de 2024">
          <ChartMovimientos />
        </DownloadableViz>
        <p className="text-base leading-relaxed mt-5 mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          General Villegas, en el noroeste, es el caso más marcado: pasó de 330.743 cabezas a
          364.737 y entró al top 15 desde el puesto 21. Tapalqué sumó 5,3% y trepó del 14° al 10°.
          Rauch y Mar Chiquita ganaron tres puestos cada uno con subas más modestas, de 3,1% y 1,5%.
        </p>
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          En la otra dirección, Villarino, en el sudoeste, resignó 96.439 cabezas y cayó del quinto
          al undécimo lugar. Trenque Lauquen bajó cuatro puestos con una pérdida de 7,4%. Chascomús
          es la excepción que muestra cómo funciona un ranking en un rodeo que se achica: perdió 8,2%
          de su stock y aun así subió dos posiciones, porque Bolívar y Villarino cayeron más.
        </p>
      </div>

      {/* EL STOCK PROVINCIAL (fondo blanco alternado) - prosa y tarjetas */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Desde el máximo de 2018 el rodeo provincial se achicó 7,0%" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La serie provincial tocó su máximo en diciembre de 2018, con 20.869.946 cabezas, y desde
            entonces bajó casi todos los años. Hubo una recuperación leve en 2022 y la caída se retomó
            en 2023 y 2024. Como los quince líderes cayeron algo menos que el conjunto, su
            participación se mantuvo en torno al 35% durante todo el período: la concentración
            territorial no aumentó, se sostuvo sobre un total más chico.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ maxWidth: 760 }}>
            <CifraCard label="Máximo del período, dic-2018" valor="20.869.946" unidad="cabezas" variacion="+1,7%" polaridad="mayor-es-mejor" periodo="vs. diciembre de 2017" />
            <CifraCard label="Caída desde el máximo" valor="1.450.860" unidad="cabezas" variacion="−7,0%" polaridad="mayor-es-mejor" periodo="dic-2018 a dic-2024" />
            <CifraCard label="Los tres primeros, sobre el total" valor="10,9%" polaridad="neutro" periodo="2.116.053 cabezas en dic-2024" />
          </div>
          <FichaTecnica items={[
            ['Fuente', 'Existencias bovinas por partido, suma de los 135 partidos'],
            ['Período', 'diciembre de 2017, 2018 y 2024'],
            ['Unidad', 'cabezas y variación % del stock'],
          ]} />
          <p className="text-base leading-relaxed mt-6 mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Los tres primeros no acompañaron la curva provincial al mismo ritmo. Ayacucho creció hasta
            2020, con cerca de 850.000 cabezas, y desde ahí resignó parte de esa suba. Olavarría tuvo su
            pico más tarde, en 2022, con unas 754.000 cabezas, y perdió alrededor de 50.000 en los dos
            años siguientes. Azul es la serie más chata del grupo: se movió en una banda de menos de
            30.000 cabezas durante todo el período.
          </p>
          <DownloadableViz title="Stock bovino de los tres primeros del ranking - 2017 a 2024" fuente="Existencias bovinas por partido, diciembre de cada año">
            <ChartTop3Serie />
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
            Stock ganadero bovino por municipio, Provincia de Buenos Aires. Existencias a diciembre de
            cada año, serie diciembre 2017 - diciembre 2024, 135 partidos · Elaboración propia
            DatosPBA · 2026
          </p>
        </div>
      </div>
    </div>
  )
}
