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
import { getColorVariacion, getTonoVariacion, VALORACION_HEX } from '@/lib/variacion'

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

/* Serie mensual de abril de 2025 a abril de 2026, con el índice general, el
   desestacionalizado y las variaciones que publica la fuente. Los valores
   fueron revisados por la Dirección Provincial de Estadística en esta edición:
   marzo de 2026 pasó de 13,2% a 13,5% interanual. */
const SERIE = [
  { mes: ['Abr', '25'], gen: 89.6, desest: 89.7, mensual:  5.6, ia:   8.4, acum:  6.2 },
  { mes: ['May', '25'], gen: 90.5, desest: 89.4, mensual: -0.3, ia:   3.1, acum:  5.5 },
  { mes: ['Jun', '25'], gen: 85.9, desest: 87.7, mensual: -2.0, ia:   8.7, acum:  6.0 },
  { mes: ['Jul', '25'], gen: 91.4, desest: 86.7, mensual: -1.1, ia:   1.1, acum:  5.3 },
  { mes: ['Ago', '25'], gen: 92.9, desest: 91.0, mensual:  5.0, ia:   1.2, acum:  4.7 },
  { mes: ['Sep', '25'], gen: 92.3, desest: 88.1, mensual: -3.3, ia:   2.9, acum:  4.5 },
  { mes: ['Oct', '25'], gen: 93.8, desest: 88.0, mensual: -0.1, ia:   0.4, acum:  4.0 },
  { mes: ['Nov', '25'], gen: 83.7, desest: 83.1, mensual: -5.5, ia: -10.2, acum:  2.6 },
  { mes: ['Dic', '25'], gen: 86.4, desest: 86.6, mensual:  4.1, ia:  -3.5, acum:  2.1 },
  { mes: ['Ene', '26'], gen: 82.0, desest: 90.7, mensual:  4.8, ia:  -1.3, acum: -1.3 },
  { mes: ['Feb', '26'], gen: 80.5, desest: 88.7, mensual: -2.2, ia:  -1.2, acum: -1.3 },
  { mes: ['Mar', '26'], gen: 95.0, desest: 94.3, mensual:  6.3, ia:  13.5, acum:  3.7 },
  { mes: ['Abr', '26'], gen: 91.8, desest: 92.0, mensual: -2.5, ia:   2.5, acum:  3.4 },
]

/* Los once bloques del indicador, ordenados por incidencia sobre la variación
   agregada de abril. La incidencia combina cuánto se movió el bloque y cuánto
   pesa en el índice: por eso Alimentos y bebidas resta más que Metales comunes
   pese a caer bastante menos. */
const BLOQUES = [
  { bloque: 'Productos químicos',      indice: 127.7, ia:  26.1, acum:  20.5, incid:  4.66 },
  { bloque: 'Máquinas y equipos',      indice:  89.7, ia:  12.4, acum:   9.2, incid:  1.37 },
  { bloque: 'Papel y cartón',          indice:  68.0, ia:  16.8, acum:   1.3, incid:  0.61 },
  { bloque: 'Refinación de petróleo',  indice: 129.4, ia:   1.6, acum:   7.6, incid:  0.21 },
  { bloque: 'Minerales no metálicos',  indice:  88.2, ia:   5.0, acum:   5.5, incid:  0.20 },
  { bloque: 'Tabaco',                  indice:  54.5, ia:  -5.6, acum:   6.2, incid: -0.02 },
  { bloque: 'Caucho y plástico',       indice:  56.8, ia:  -3.3, acum:  -9.4, incid: -0.12 },
  { bloque: 'Textiles y cueros',       indice:  62.4, ia:  -6.7, acum:   0.6, incid: -0.50 },
  { bloque: 'Vehículos automotores',   indice:  91.1, ia:  -9.7, acum: -16.4, incid: -0.82 },
  { bloque: 'Metales comunes',         indice:  68.3, ia: -19.8, acum: -11.2, incid: -1.36 },
  { bloque: 'Alimentos y bebidas',     indice:  89.1, ia:  -7.5, acum:  -1.5, incid: -1.77 },
]

/* Mismo universo, ordenado por nivel del índice: muestra qué bloques quedaron
   por encima y por debajo de su producción de 2012. */
const POR_NIVEL = [...BLOQUES].sort((a, b) => b.indice - a.indice)

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. */
const HERO_STATS = [
  { label: 'ISIM-PBA',            valor: '91,8', unidad: 'puntos', variacion: '+2,5%', polaridad: 'mayor-es-mejor', periodo: 'i.a.; índice base 2012=100' },
  { label: 'Variación mensual desestacionalizada', valor: '−2,5%', variacion: '−2,5%', polaridad: 'mayor-es-mejor', periodo: 'vs. marzo de 2026' },
  { label: 'Bloques en alza',     valor: '5', unidad: 'de 11', polaridad: 'neutro', periodo: 'eran 9 en marzo' },
  { label: 'Acumulado enero-abril', valor: '+3,4%', variacion: '+3,4%', polaridad: 'mayor-es-mejor', periodo: 'vs. igual período de 2025' },
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

const fmtPP = v =>
  `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtIndice = v => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/* Los ticks del eje no llevan signo "+", pero sí el menos tipográfico, para no
   mezclar guion y U+2212 dentro del mismo gráfico. Chart.js dibuja además un
   tick sobre el límite del eje: si no cae en la grilla de a 5, se omite. */
const fmtEjePct = v => (v % 5 === 0 ? `${v < 0 ? '−' : ''}${Math.abs(v)}%` : '')

const etiquetaMes = m => `${m[0]}. ${m[1]}`

/* El color de cada barra sale de polaridad × signo, nunca de un verde o un rojo
   elegido a mano: en producción industrial, más es mejor. */
const tonoProduccion = v => VALORACION_HEX[getTonoVariacion({ variacion: v, polaridad: 'mayor-es-mejor' })].base

// ─── VALUE LABELS PLUGINS ────────────────────────────────────

/* Barras verticales con signo: la etiqueta va arriba de las positivas y debajo
   de las negativas. */
const labelsVerticales = {
  id: 'labelsVerticales',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.getDatasetMeta(0).data.forEach((bar, i) => {
      const v = chart.data.datasets[0].data[i]
      ctx.save()
      ctx.fillStyle = '#334155'
      ctx.font = 'bold 9.5px Archivo, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = v < 0 ? 'top' : 'bottom'
      ctx.fillText(fmtPct(v), bar.x, v < 0 ? bar.y + 4 : bar.y - 4)
      ctx.restore()
    })
  },
}

/* Barras horizontales con signo: la etiqueta queda afuera de la punta. En
   pantallas chicas el área de trazado se angosta y la cifra de las barras
   negativas terminaba encima del nombre del bloque: ahí las cifras pasan todas
   a una columna a la derecha. */
const labelsIncidencia = {
  id: 'labelsIncidencia',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    const columna = chart.width < 560
    chart.getDatasetMeta(0).data.forEach((bar, i) => {
      const v = chart.data.datasets[0].data[i]
      ctx.save()
      ctx.fillStyle = getTonoVariacion({ variacion: v, polaridad: 'mayor-es-mejor' }) === 'worse'
        ? VALORACION_HEX.worse.text
        : '#334155'
      ctx.font = 'bold 11px Archivo, sans-serif'
      ctx.textBaseline = 'middle'
      if (columna) {
        ctx.textAlign = 'right'
        ctx.fillText(fmtPP(v), chart.width - 4, bar.y)
      } else {
        ctx.textAlign = v < 0 ? 'right' : 'left'
        ctx.fillText(fmtPP(v), v < 0 ? bar.x - 6 : bar.x + 6, bar.y)
      }
      ctx.restore()
    })
  },
}

// ─── CHART COMPONENTS ────────────────────────────────────────

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8 }

/* El cero es la referencia que separa crecer de caer: se pinta más marcado que
   el resto de la grilla. */
const gridCero = ctx => (ctx.tick.value === 0 ? 'rgba(13,17,23,0.30)' : 'rgba(13,17,23,0.08)')

/* Cuando cada barra lleva su cifra escrita, el eje de valor repite el dato: se
   oculta y queda solo el cero, que es la referencia que el ranking necesita. */
const gridSoloCero = ctx => (ctx.tick.value === 0 ? 'rgba(13,17,23,0.30)' : 'transparent')

/* En pantallas chicas los nombres largos se parten en dos líneas: si no, el eje
   se queda con todo el ancho y las barras se reducen a un muñón. Se corta por
   el punto que deja la línea más larga lo más corta posible. */
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

/* Eje de categorías. Chart.js le da como máximo el 30% del canvas y ahí
   "Minerales no metálicos" pierde letras; se le permite el ancho que necesita,
   pero sin pasar del 45% para que la barra siga siendo lo que se lee. */
function ejeCategorias(anchoDeseado) {
  return {
    grid: { display: false },
    border: { display: false },
    ticks: {
      font: { size: 11 },
      /* Con etiquetas de dos líneas Chart.js saltea categorías por falta de
         alto: acá ninguna puede faltar. */
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

function ChartSerie() {
  const data = {
    labels: SERIE.map(d => d.mes),
    datasets: [{
      data: SERIE.map(d => d.ia),
      backgroundColor: SERIE.map(d => tonoProduccion(d.ia)),
      borderRadius: 4, barPercentage: 0.7,
    }],
  }
  return (
    <ChartCard
      title="ISIM-PBA. Variación interanual mensual"
      hallazgo="Gráfico de barras: la suba interanual del ISIM-PBA pasó de 13,5% en marzo de 2026 a 2,5% en abril. El peor mes de la serie fue noviembre de 2025, con una caída de 10,2%."
      tabla={{
        columnas: ['Mes', 'Var. interanual', 'Índice', 'Desestacionalizado'],
        filas: SERIE.map(d => [etiquetaMes(d.mes), fmtPct(d.ia), fmtIndice(d.gen), fmtIndice(d.desest)]),
      }}
      ficha={[
        ['Fuente', 'Dirección Provincial de Estadística - ISIM-PBA'],
        ['Período', 'abril 2025 - abril 2026'],
        ['Universo', 'establecimientos industriales de la provincia de Buenos Aires'],
        ['Unidad', 'variación interanual en % del índice base 2012=100'],
        ['Estado', 'abril 2026 preliminar; resto de la serie provisoria'],
      ]}
      legend={[
        { label: 'Alza interanual', color: VALORACION_HEX.better.base },
        { label: 'Caída interanual', color: VALORACION_HEX.worse.base },
      ]}
      height={260}
    >
      <Bar
        data={data}
        plugins={[labelsVerticales]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 18, bottom: 10 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtPct(ctx.raw)} interanual` } },
          },
          scales: {
            y: { min: -12, max: 15, ticks: { stepSize: 5, callback: fmtEjePct }, grid: { color: gridCero }, border: { display: false } },
            x: { ticks: { font: { size: 10.5 }, maxRotation: 0, autoSkip: false }, grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartIncidencias() {
  const data = {
    labels: BLOQUES.map(b => b.bloque),
    datasets: [{
      data: BLOQUES.map(b => b.incid),
      backgroundColor: BLOQUES.map(b => tonoProduccion(b.incid)),
      borderRadius: 4, barPercentage: 0.72,
    }],
  }
  return (
    <ChartCard
      title="Incidencia de cada bloque en la variación interanual del ISIM-PBA, en puntos porcentuales"
      hallazgo="Gráfico de barras horizontales: Productos químicos aportó 4,66 puntos porcentuales a la suba de 2,5% del indicador, mientras Alimentos y bebidas restó 1,77 y Metales comunes 1,36."
      tabla={{
        columnas: ['Bloque', 'Incidencia (pp)', 'Var. interanual'],
        filas: BLOQUES.map(b => [b.bloque, fmtPP(b.incid), fmtPct(b.ia)]),
      }}
      ficha={[
        ['Fuente', 'Dirección Provincial de Estadística - ISIM-PBA'],
        ['Período', 'abril 2026 vs. abril 2025'],
        ['Universo', 'los 11 bloques sectoriales del indicador'],
        ['Unidad', 'puntos porcentuales de aporte a la variación agregada'],
        ['Estado', 'dato preliminar'],
      ]}
      legend={[
        { label: 'Aporte positivo', color: VALORACION_HEX.better.base },
        { label: 'Aporte negativo', color: VALORACION_HEX.worse.base },
      ]}
      height={340}
    >
      <Bar
        data={data}
        plugins={[labelsIncidencia]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { left: 34, right: 40 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtPP(ctx.raw)} pp · variación ${fmtPct(BLOQUES[ctx.dataIndex].ia)}` } },
          },
          scales: {
            x: { min: -2.2, max: 5.2, ticks: { display: false }, grid: { color: gridSoloCero }, border: { display: false } },
            y: ejeCategorias(150),
          },
        }}
      />
    </ChartCard>
  )
}

// ─── TABLAS ──────────────────────────────────────────────────

function TablaBloques() {
  const head = ['Bloque industrial', 'Índice (2012=100)', 'Var. interanual', 'Var. acumulada', 'Incidencia (pp)']
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map((h, i) => (
              <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {POR_NIVEL.map(b => (
            <tr key={b.bloque} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
              <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{b.bloque}</td>
              {/* El nivel del índice no es una variación: va sin color, y el
                  contraste contra 100 lo hace el texto de la sección. */}
              <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtIndice(b.indice)}</td>
              <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: b.ia, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(b.ia)}</td>
              <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: b.acum, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(b.acum)}</td>
              <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: b.incid, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPP(b.incid)}</td>
            </tr>
          ))}
          <tr style={{ background: '#f8fafc' }}>
            <td style={{ padding: '0.65rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700 }}>Industria manufacturera</td>
            <td className="tabular-nums" style={{ padding: '0.65rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700, textAlign: 'right' }}>91,8</td>
            <td className="tabular-nums" style={{ padding: '0.65rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700, textAlign: 'right' }}>+2,5%</td>
            <td className="tabular-nums" style={{ padding: '0.65rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700, textAlign: 'right' }}>+3,4%</td>
            <td className="tabular-nums" style={{ padding: '0.65rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700, textAlign: 'right' }}>+2,47</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function TablaSerie() {
  const head = ['Mes', 'ISIM-PBA', 'Desestacionalizado', 'Var. mensual desest.', 'Var. interanual', 'Var. acumulada']
  return (
    <details style={{ margin: '1.25rem 0 0' }}>
      <summary style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink, cursor: 'pointer', padding: '0.75rem 0' }}>
        Ver la serie mensual completa, de abril de 2025 a abril de 2026
      </summary>
      <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'auto', maxHeight: 520, marginTop: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {head.map((h, i) => (
                <th key={h} style={{ position: 'sticky', top: 0, background: '#f8fafc', textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.625rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SERIE.map(d => (
              <tr key={etiquetaMes(d.mes)} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                <td style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.ink, fontWeight: 600 }}>{etiquetaMes(d.mes)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.inkMid, textAlign: 'right' }}>{fmtIndice(d.gen)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.inkMid, textAlign: 'right' }}>{fmtIndice(d.desest)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: d.mensual, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(d.mensual)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: d.ia, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(d.ia)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: d.acum, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(d.acum)}</td>
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">Dir. Prov. de Estadística · ISIM-PBA · Abril 2026</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          La industria manufacturera<br />
          bonaerense en abril de 2026
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          El indicador que mide la producción industrial de la Provincia creció{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>2,5% interanual</strong> en abril, después del
          13,5% de marzo. Seis de los once bloques sectoriales cayeron y el crecimiento quedó concentrado en
          un solo rubro.
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
            { label: 'Fuente',        val: 'Dir. Prov. de Estadística - ISIM-PBA' },
            { label: 'Universo',      val: '11 bloques industriales de la PBA' },
            { label: 'Período',       val: 'Abr. 2026 vs. abr. 2025' },
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
          Un solo bloque sostiene el crecimiento de la industria bonaerense
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          Productos químicos aportó <strong>4,66 puntos porcentuales</strong> a una suba agregada de 2,5%.
          Descontado ese bloque, los otros diez restaron 2,2 puntos y el indicador habría cerrado abril en
          baja. Entre los seis rubros que cayeron está Alimentos y bebidas, el de mayor peso del índice.
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
        El dato de abril de 2026 es <strong style={{ color: C.ink }}>preliminar</strong> y los meses de 2025 y
        2026 son provisorios: la Dirección Provincial de Estadística los revisa en cada publicación. En esta
        edición la variación interanual de marzo pasó de 13,2% a 13,5% respecto de lo informado en su
        momento, de modo que las cifras de este informe no coinciden exactamente con las de la edición
        anterior de esta misma serie.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        El ISIM-PBA es un índice de volumen físico con base 2012=100, construido sobre un relevamiento propio
        de establecimientos industriales bonaerenses. Mide producción, no facturación ni empleo. La
        incidencia de cada bloque combina cuánto varió el bloque con cuánto pesa en la canasta del índice: por
        eso Alimentos y bebidas resta más que Metales comunes pese a caer bastante menos. La fuente{' '}
        <strong style={{ color: C.ink }}>no publica los ponderadores</strong> de cada bloque.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        La serie desestacionalizada la calcula la propia fuente y no es comparable, punto a punto, con la
        serie original: una y otra pueden moverse en sentidos distintos en un mismo mes. Con un solo dato
        mensual no se puede establecer si la moderación de abril responde a una base de comparación más
        exigente, a factores puntuales de algunos bloques o a un cambio de tendencia.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeISIMAbril2026() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* LA SERIE — prosa y gráfico a lo ancho: trece barras rotuladas se
          pisaban entre sí en media columna */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="El repunte de marzo duró un mes" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El ISIM-PBA cerró abril en 91,8 puntos, contra 89,6 de abril de 2025. La suba de 2,5% deja al
          indicador en terreno positivo por segundo mes seguido, después de cuatro meses consecutivos en
          baja entre noviembre de 2025 y febrero de 2026.
        </p>
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          La comparación con marzo es la que define el tono del mes. Aquel 13,5% fue el mejor registro de
          los últimos trece meses y abril devuelve al indicador a la zona donde se movió buena parte de
          2025: cinco de los nueve meses de ese año que cubre la serie quedaron entre 0,4% y 3,1%.
        </p>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El acumulado del cuatrimestre queda 3,4% arriba de 2025, sostenido por marzo. Enero y febrero
          habían cerrado en baja, y el peor mes de toda la serie sigue siendo noviembre de 2025, con una
          caída interanual de 10,2%.
        </p>
        <DownloadableViz title="ISIM-PBA. Variación interanual mensual" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA">
          <ChartSerie />
        </DownloadableViz>
      </div>

      {/* LAS INCIDENCIAS — gráfico primero, después prosa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Productos químicos aportó 4,66 puntos y los otros diez bloques restaron 2,2" />
          <DownloadableViz title="Incidencia de cada bloque en la variación del ISIM-PBA" fuente="Dirección Provincial de Estadística, Ministerio de Economía PBA">
            <ChartIncidencias />
          </DownloadableViz>
          <p className="text-base leading-relaxed mt-6 mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La incidencia es la medida que ordena el mes, porque combina cuánto se movió cada bloque con
            cuánto pesa en el índice. Productos químicos creció 26,1% y explicó por sí solo el 66% de todo el
            aporte positivo. Alimentos y bebidas cayó 7,5% y fue igual la mayor incidencia negativa, con 1,77
            puntos: pesa lo suficiente como para restar más que Metales comunes, que se derrumbó 19,8%.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Aporte de Productos químicos" valor="+4,66" unidad="pp" variacion="+4,66" polaridad="mayor-es-mejor" periodo="sobre una suba total de 2,5%" />
            <CifraCard label="Aporte de los otros diez bloques" valor="−2,20" unidad="pp" variacion="−2,20" polaridad="mayor-es-mejor" periodo="el indicador habría caído sin químicos" />
            <CifraCard label="La mayor caída del mes" valor="−19,8%" variacion="−19,8%" polaridad="mayor-es-mejor" periodo="Metales comunes; restó 1,36 pp" />
          </div>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Cuatro bloques que en marzo crecían pasaron a terreno negativo: Alimentos y bebidas, Textiles y
            cueros, Caucho y plástico y Tabaco. Metales comunes y Vehículos automotores ya venían en baja en
            marzo y siguieron ahí. En el acumulado del año, Vehículos automotores es el rubro más golpeado, 16,4%
            debajo del primer cuatrimestre de 2025.
          </p>
        </div>
      </div>

      {/* LOS NIVELES — prosa y tabla densa */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Solo dos de los once bloques producen más que en 2012" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Con base 2012=100, el nivel del índice ubica a cada bloque respecto de su propia producción de hace
          catorce años. Solo Refinación de petróleo (129,4) y Productos químicos (127,7) la superan hoy. Los
          dos son, además, los que marcaron el mejor abril de sus
          respectivas series históricas. El agregado provincial cerró en 91,8, un 8,2% por debajo de 2012.
        </p>
        <TablaBloques />
        <FichaTecnica items={[
          ['Fuente', 'Dirección Provincial de Estadística - ISIM-PBA'],
          ['Período', 'abril 2026, con acumulado enero-abril'],
          ['Universo', 'los 11 bloques sectoriales del indicador'],
          ['Unidad', 'índice base 2012=100, variación % e incidencia en pp'],
          ['Estado', 'dato preliminar'],
        ]} />
        <p className="text-base leading-relaxed mt-6" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          En el otro extremo, Tabaco produce hoy poco más de la mitad que en 2012 (54,5 puntos), seguido por
          Caucho y plástico (56,8) y Textiles y cueros (62,4). Papel y cartón está en 68,0 pese a haber
          crecido 16,8% interanual en abril: viene de un piso muy bajo, y una suba de dos dígitos sobre esa
          base todavía lo deja lejos de su nivel de referencia.
        </p>
      </div>

      {/* LA SERIE SIN ESTACIONALIDAD — prosa, cifras y serie completa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Sin estacionalidad, abril es el segundo mejor mes de los últimos trece" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La serie desestacionalizada cayó 2,5% respecto de marzo y quedó en 92,0 puntos. Ese retroceso
            mensual convive con un nivel alto: en los trece meses de la serie solo marzo de 2026 lo supera,
            con 94,3. La lectura mensual y la lectura de nivel apuntan a lados distintos, y conviene tener
            las dos a la vista antes de leer abril como un quiebre.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Nivel desestacionalizado" valor="92,0" unidad="puntos" polaridad="neutro" periodo="abril de 2026" />
            <CifraCard label="Máximo de la serie" valor="94,3" unidad="puntos" polaridad="neutro" periodo="marzo de 2026" />
            <CifraCard label="Piso de la serie" valor="83,1" unidad="puntos" polaridad="neutro" periodo="noviembre de 2025" />
          </div>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La distancia entre el piso de noviembre y el techo de marzo es de 11,2 puntos de índice en cuatro
            meses, una amplitud grande para una serie que busca justamente limpiar los vaivenes del
            calendario. Con dato preliminar y meses provisorios, la moderación de abril es un dato para
            confirmar en las próximas publicaciones.
          </p>
          <TablaSerie />
          <FichaTecnica items={[
            ['Fuente', 'Dirección Provincial de Estadística - ISIM-PBA'],
            ['Período', 'abril 2025 - abril 2026'],
            ['Universo', 'industria manufacturera de la provincia de Buenos Aires'],
            ['Unidad', 'índice base 2012=100 y variaciones en %'],
            ['Estado', 'abril 2026 preliminar; resto de la serie provisoria'],
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
            Indicador Sintético de la Industria Manufacturera de la provincia de Buenos Aires (ISIM-PBA),
            datos a abril de 2026, publicado en julio de 2026 · Elaboración propia DatosPBA · 2026
          </p>
          <a
            href="https://www.estadistica.ec.gba.gov.ar/dpe/economia/indicadores-economicos"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Dirección Provincial de Estadística - Indicadores económicos <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
