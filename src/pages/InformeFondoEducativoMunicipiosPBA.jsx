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
import { DATA } from '@/lib/variacion'

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
}

// ─── DATOS ───────────────────────────────────────────────────

/* Fondo de Financiamiento Educativo acumulado enero-diciembre 2025 sobre la
   matrícula estatal 2025 de cada distrito. `fondo` va en millones de pesos;
   `matricula`, en alumnos del sistema estatal; `porAlumno`, en pesos. */
const TOP15 = [
  { pos: 1,  muni: 'Puán',                   matricula: 1804, fondo: 1323, porAlumno: 733196 },
  { pos: 2,  muni: 'General Guido',          matricula: 719,  fondo: 508,  porAlumno: 705954 },
  { pos: 3,  muni: 'Pila',                   matricula: 1079, fondo: 752,  porAlumno: 696774 },
  { pos: 4,  muni: 'General Alvear',         matricula: 1892, fondo: 1079, porAlumno: 570434 },
  { pos: 5,  muni: 'Rauch',                  matricula: 2136, fondo: 1162, porAlumno: 544076 },
  { pos: 6,  muni: 'Adolfo Gonzales Chaves', matricula: 1985, fondo: 1061, porAlumno: 534527 },
  { pos: 7,  muni: 'Carlos Tejedor',         matricula: 2188, fondo: 1169, porAlumno: 534378 },
  { pos: 8,  muni: 'Tordillo',               matricula: 585,  fondo: 303,  porAlumno: 517496 },
  { pos: 9,  muni: 'Guaminí',                matricula: 2486, fondo: 1277, porAlumno: 513783 },
  { pos: 10, muni: 'Pellegrini',             matricula: 1074, fondo: 532,  porAlumno: 495203 },
  { pos: 11, muni: 'Tapalqué',               matricula: 2202, fondo: 1073, porAlumno: 487287 },
  { pos: 12, muni: 'Lezama',                 matricula: 887,  fondo: 425,  porAlumno: 479032 },
  { pos: 13, muni: 'San Cayetano',           matricula: 1487, fondo: 704,  porAlumno: 473605 },
  { pos: 14, muni: 'Adolfo Alsina',          matricula: 3070, fondo: 1399, porAlumno: 455745 },
  { pos: 15, muni: 'General La Madrid',      matricula: 2553, fondo: 1161, porAlumno: 454858 },
]

/* Medido por habitante, los quince últimos eran los 15 partidos del GBA. Por
   alumno son ocho del GBA y siete de afuera, por eso la columna `gba`. */
const BOTTOM15 = [
  { pos: 121, muni: 'Berazategui',        matricula: 59682,  fondo: 8161,  porAlumno: 136741, gba: true  },
  { pos: 122, muni: 'Almirante Brown',    matricula: 89845,  fondo: 11798, porAlumno: 131319, gba: true  },
  { pos: 123, muni: 'Florencio Varela',   matricula: 90082,  fondo: 11827, porAlumno: 131295, gba: true  },
  { pos: 124, muni: 'Pinamar',            matricula: 8283,   fondo: 1086,  porAlumno: 131145, gba: false },
  { pos: 125, muni: 'La Costa',           matricula: 19485,  fondo: 2545,  porAlumno: 130621, gba: false },
  { pos: 126, muni: 'Escobar',            matricula: 46799,  fondo: 6002,  porAlumno: 128240, gba: false },
  { pos: 127, muni: 'Esteban Echeverría', matricula: 61133,  fondo: 7761,  porAlumno: 126950, gba: true  },
  { pos: 128, muni: 'Merlo',              matricula: 105659, fondo: 13134, porAlumno: 124301, gba: true  },
  { pos: 129, muni: 'Presidente Perón',   matricula: 23069,  fondo: 2855,  porAlumno: 123757, gba: false },
  { pos: 130, muni: 'Pilar',              matricula: 68595,  fondo: 8318,  porAlumno: 121269, gba: false },
  { pos: 131, muni: 'Moreno',             matricula: 111894, fondo: 13558, porAlumno: 121170, gba: true  },
  { pos: 132, muni: 'San Vicente',        matricula: 24016,  fondo: 2899,  porAlumno: 120722, gba: false },
  { pos: 133, muni: 'José C. Paz',        matricula: 59469,  fondo: 7164,  porAlumno: 120473, gba: true  },
  { pos: 134, muni: 'Ezeiza',             matricula: 41179,  fondo: 4916,  porAlumno: 119370, gba: true  },
  { pos: 135, muni: 'General Rodríguez',  matricula: 34334,  fondo: 3786,  porAlumno: 110256, gba: false },
]

const GRUPOS = [
  { grupo: 'GBA (24 partidos)',           matriculaPct: 58.1, fondosPct: 49.3 },
  { grupo: 'Resto de la Provincia (111)', matriculaPct: 41.9, fondosPct: 50.7 },
]

/* Los 135 municipios ordenados por tamaño de su matrícula estatal y partidos en
   cinco grupos de 27. `porAlumno` es el promedio ponderado de cada grupo: el
   fondo total del grupo sobre su matrícula total.

   `eje` es la etiqueta del gráfico, partida en dos líneas: en una sola, las
   cinco no entran a 390px de ancho y Chart.js saltea dos. `rango` es el corte
   exacto del grupo y va en la tabla de datos. */
const TRAMOS = [
  { eje: ['Menos de', '2.600'], rango: '585 a 2.553 alumnos',      porAlumno: 433960, gba: 0 },
  { eje: ['2.600 a', '4.800'],  rango: '2.582 a 4.794 alumnos',    porAlumno: 315007, gba: 0 },
  { eje: ['4.800 a', '9.200'],  rango: '4.990 a 9.149 alumnos',    porAlumno: 252047, gba: 0 },
  { eje: ['9.200 a', '23.500'], rango: '9.164 a 23.507 alumnos',   porAlumno: 182770, gba: 5 },
  { eje: ['Más de', '23.500'],  rango: '24.016 a 252.635 alumnos', porAlumno: 141126, gba: 19 },
]

/* El mismo fondo con los dos denominadores. La columna por habitante es la que
   publicó la primera versión de este informe. */
const DENOMINADOR = [
  { concepto: 'Promedio provincial',                     hab: '$25.372',              alu: '$167.729' },
  { concepto: 'GBA (24 partidos)',                       hab: '$20.215',              alu: '$142.486' },
  { concepto: 'Resto de la Provincia (111 municipios)',  hab: '$33.753',              alu: '$202.684' },
  { concepto: 'Diferencia a favor del interior',         hab: '67%',                  alu: '42,2%' },
  { concepto: 'Brecha entre el primero y el último',     hab: '12,2 veces',           alu: '6,6 veces' },
  { concepto: 'Partidos del GBA entre los 15 últimos',   hab: '15 de 15',             alu: '8 de 15' },
  { concepto: 'Puesto de Vicente López',                 hab: '135º',                 alu: '65º' },
  { concepto: 'Peso del GBA en el denominador',          hab: '61,9% de la población', alu: '58,1% de la matrícula' },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>. Un
   reparto de fondos no tiene dirección deseable propia: todas van en neutro. */
const HERO_STATS = [
  { label: 'Fondo Educativo repartido', valor: '$444.611', unidad: 'millones', polaridad: 'neutro', periodo: 'acumulado enero-diciembre 2025' },
  { label: 'Promedio provincial',       valor: '$167.729', polaridad: 'neutro', periodo: 'por alumno estatal, 135 municipios' },
  { label: 'Brecha entre extremos',     valor: '6,6', unidad: 'veces', polaridad: 'neutro', periodo: 'Puán sobre General Rodríguez' },
  { label: 'Interior sobre GBA',        valor: '42,2%', polaridad: 'neutro', periodo: 'más por alumno estatal' },
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

/* Ficha técnica del gráfico: fuente, período, universo y unidad, como elemento
   de diseño visible bajo cada visualización. */
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

const fmtNum    = v => v.toLocaleString('es-AR', { maximumFractionDigits: 0 })
const fmtPesos  = v => '$' + fmtNum(v)
const fmtMiles1 = v => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmtPct    = v => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'

// Barras verticales: valor arriba de cada barra
function makeVValueLabels(fmt) {
  return {
    id: 'vValueLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.data.datasets.forEach((dataset, di) => {
        chart.getDatasetMeta(di).data.forEach((bar, i) => {
          ctx.save()
          ctx.fillStyle = '#334155'
          ctx.font = 'bold 11px Archivo, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(fmt(dataset.data[i]), bar.x, bar.y - 7)
          ctx.restore()
        })
      })
    },
  }
}

const valueLabelsPct = makeVValueLabels(fmtPct)

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

/* Eje de valor oculto: cuando cada barra lleva su cifra escrita al lado, el eje
   repite el dato y le come ancho al gráfico. La unidad va en la ficha técnica.
   Es una función y no un objeto porque Chart.js escribe dentro de las opciones
   de escala que recibe. Acá la misma configuración la usan un gráfico
   horizontal (como eje x) y uno vertical (como eje y), y compartir el objeto
   entre los dos deja que lo que escribe el primero llegue al segundo. */
const ejeValorOculto = () => ({
  min: 0,
  ticks: { display: false },
  grid: { display: false },
  border: { display: false },
})

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
   "Adolfo Gonzales Chaves" pierde letras; se le permite el ancho que necesita,
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

function ChartTop15() {
  const data = {
    labels: TOP15.map(d => d.muni),
    datasets: [{
      data: TOP15.map(d => Number((d.porAlumno / 1000).toFixed(1))),
      backgroundColor: DATA[2],
      borderRadius: 4, barPercentage: 0.72,
    }],
  }
  return (
    <ChartCard
      title="Los 15 municipios con mayor Fondo Educativo por alumno estatal - En miles de $, acumulado 2025"
      hallazgo="Gráfico de barras horizontales: Puán encabeza el ranking con $733.196 de Fondo Educativo por alumno estatal, seguido por General Guido con $705.954 y Pila con $696.774; el decimoquinto, General La Madrid, recibe $454.858. Los quince son municipios del interior y ninguno supera los 3.100 alumnos estatales."
      tabla={{
        columnas: ['Municipio', 'Matrícula estatal 2025', 'Fondo Educativo por alumno'],
        filas: TOP15.map(d => [d.muni, fmtNum(d.matricula), fmtPesos(d.porAlumno)]),
      }}
      ficha={[
        ['Fuente', 'Ministerio de Economía PBA y DGCyE'],
        ['Período', 'fondo acumulado enero-diciembre 2025 y matrícula 2025'],
        ['Universo', '135 municipios bonaerenses'],
        ['Unidad', 'miles de $ por alumno del sistema estatal'],
      ]}
      height={430}
    >
      <Bar
        data={data}
        plugins={[makeHValueLabels(fmtMiles1)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 52 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtMiles1(ctx.raw)} mil por alumno` } },
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

function ChartGrupos() {
  const data = {
    labels: ['Matrícula estatal 2025', 'Fondo Educativo 2025'],
    /* Con solo dos categorías, los valores por defecto reparten las barras a lo
       ancho de todo el canvas y el par deja de leerse como par. */
    datasets: [
      { label: 'GBA (24 partidos)', data: [GRUPOS[0].matriculaPct, GRUPOS[0].fondosPct], backgroundColor: DATA[1], borderRadius: 4, categoryPercentage: 0.4, barPercentage: 0.92 },
      { label: 'Resto de la Provincia (111)', data: [GRUPOS[1].matriculaPct, GRUPOS[1].fondosPct], backgroundColor: DATA[2], borderRadius: 4, categoryPercentage: 0.4, barPercentage: 0.92 },
    ],
  }
  return (
    <ChartCard
      title="Participación en la matrícula estatal y en el Fondo Educativo"
      hallazgo="Gráfico de barras: el GBA reúne el 58,1% de la matrícula estatal de la provincia y recibe el 49,3% del Fondo Educativo, mientras que los 111 municipios restantes tienen el 41,9% de la matrícula y captan el 50,7% del fondo."
      tabla={{
        columnas: ['Grupo', '% de la matrícula estatal', '% del Fondo Educativo'],
        filas: GRUPOS.map(g => [g.grupo, fmtPct(g.matriculaPct), fmtPct(g.fondosPct)]),
      }}
      ficha={[
        ['Fuente', 'Ministerio de Economía PBA y DGCyE'],
        ['Período', 'fondo acumulado enero-diciembre 2025 y matrícula 2025'],
        ['Universo', '135 municipios - 2.650.770 alumnos estatales'],
        ['Unidad', '% del total provincial'],
      ]}
      legend={[{ label: 'GBA (24 partidos)', color: DATA[1] }, { label: 'Resto de la Provincia (111)', color: DATA[2] }]}
      height={250}
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
            y: { max: 70, ticks: { stepSize: 10, callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' }, border: { display: false } },
            x: { ticks: { font: { size: 11 }, maxRotation: 0 }, grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

/* Los 135 municipios agrupados por tamaño de matrícula. Barras verticales
   porque el eje de abajo es una escala ordenada, no una lista de nombres. */
function ChartTramos() {
  const data = {
    labels: TRAMOS.map(t => t.eje),
    datasets: [{
      data: TRAMOS.map(t => Number((t.porAlumno / 1000).toFixed(1))),
      backgroundColor: DATA[2],
      borderRadius: 4, barPercentage: 0.62,
    }],
  }
  return (
    <ChartCard
      title="Fondo Educativo por alumno según el tamaño de la matrícula estatal del municipio - En miles de $"
      hallazgo="Gráfico de barras: los 27 municipios con menos de 2.600 alumnos estatales reciben $433.960 por alumno y los 27 más grandes, $141.126. El valor cae en cada uno de los cinco tramos a medida que crece la matrícula."
      tabla={{
        columnas: ['Tamaño de la matrícula estatal', 'Municipios', 'Del GBA', 'Fondo Educativo por alumno'],
        filas: TRAMOS.map(t => [t.rango, '27', String(t.gba), fmtPesos(t.porAlumno)]),
      }}
      ficha={[
        ['Fuente', 'Ministerio de Economía PBA y DGCyE'],
        ['Período', 'fondo acumulado enero-diciembre 2025 y matrícula 2025'],
        ['Universo', '135 municipios en cinco grupos de 27'],
        ['Unidad', 'miles de $ por alumno, promedio ponderado del grupo'],
      ]}
      height={260}
    >
      <Bar
        data={data}
        plugins={[makeVValueLabels(fmtMiles1)]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 22 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtMiles1(ctx.raw)} mil por alumno` } },
          },
          scales: {
            y: ejeValorOculto(),
            x: { ticks: { font: { size: 11 }, maxRotation: 0 }, grid: { display: false }, border: { display: false } },
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">Ministerio de Economía PBA · Transferencias a municipios · Acumulado 2025</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          El Fondo Educativo municipal,<br />
          medido por alumno
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          El Fondo de Financiamiento Educativo repartió{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>$444.611 millones</strong> entre los 135
          municipios bonaerenses durante 2025. Por cada alumno del sistema estatal, Puán cobró $733.196 y
          General Rodríguez, $110.256. Los quince primeros son del interior, pero los quince últimos ya no
          son todos del conurbano.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
          {HERO_STATS.map((s, i) => (
            <div
              key={i}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2 }}
              className="p-5"
            >
              <Cifra dark size="xl" label={s.label} valor={s.valor} unidad={s.unidad} polaridad={s.polaridad} periodo={s.periodo} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}
        >
          {[
            { label: 'Fuente',        val: 'Ministerio de Economía PBA y DGCyE' },
            { label: 'Universo',      val: '135 municipios · 2.650.770 alumnos estatales' },
            { label: 'Período',       val: 'acumulado enero-diciembre 2025' },
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
          Por alumno, lo que ordena el Fondo Educativo es el tamaño del distrito, no la frontera del
          conurbano
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          Dividido por la población, el fondo separaba a la provincia en dos bloques nítidos: interior arriba
          y conurbano abajo. Dividido por la matrícula estatal, los quince primeros siguen siendo del interior
          pero{' '}
          <strong>el fondo de la tabla mezcla ocho partidos del GBA con siete distritos de afuera</strong>,
          entre ellos Pinamar, La Costa y General Rodríguez. Lo que ordena el reparto es cuántos alumnos tiene
          cada municipio: los 27 más chicos reciben tres veces más por alumno que los 27 más grandes.
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
        El informe usa una sola columna de las transferencias provinciales, la de{' '}
        <strong style={{ color: C.ink }}>Fondo de Financ. Educativo</strong>. Quedan fuera la Coparticipación
        Bruta, el Fondo de Fortalecimiento Fiscal Municipal, el Fondo de Inclusión Social y las demás
        partidas, que se reparten con criterios propios. La posición de un municipio en este ranking no
        describe el total de recursos que recibe de la Provincia.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        El monto por alumno divide el acumulado enero-diciembre de 2025 por la{' '}
        <strong style={{ color: C.ink }}>matrícula estatal del distrito en 2025</strong>: los alumnos de
        nivel inicial, primario y secundario de gestión estatal que releva la Dirección de Información y
        Estadística de la DGCyE. Quedan afuera el nivel superior y la matrícula de gestión privada. Los dos
        términos del cociente son del mismo año, a diferencia de la versión por habitante, que usaba
        población del Censo 2022. No hay ajuste por inflación intra-anual.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        El denominador elegido cambia el resultado y conviene decir cómo. Dividir por la matrícula estatal
        mide los pesos disponibles por cada chico del sistema que el fondo financia, y por eso mejora la
        posición de los distritos con mucha escuela privada. Dividir por la matrícula total daría un valor más
        bajo en esos mismos distritos: con ese denominador el promedio provincial sería de $112.539 por alumno
        en lugar de $167.729. Los dos cálculos usan el mismo fondo y la misma fuente.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        La relación entre el tamaño de la matrícula y los pesos por alumno se midió sobre los 135 municipios:
        el coeficiente de correlación de rangos entre las dos variables es de <strong style={{ color: C.ink }}>-0,87</strong>.
        Es una asociación fuerte, no una regla: General Pueyrredón, Villa Gesell y Pinamar quedan fuera de
        línea. El informe no reconstruye los coeficientes con los que la Provincia reparte el fondo, sino el
        resultado del reparto.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        Las cifras por habitante de la tabla comparativa son las que publicó la primera versión de este
        informe, con población del Censo 2022. La relación de 12,3% con la coparticipación bruta toma el
        informe anterior de esta serie, con la misma fuente y el mismo período.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeFondoEducativoMunicipiosPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* LOS PRIMEROS DEL RANKING — prosa y gráfico a lo ancho */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Ninguno de los quince primeros llega a 3.100 alumnos estatales" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Puán encabeza la tabla: cobró $1.323 millones en el año y tiene 1.804 alumnos en escuelas
          estatales, así que le corresponden $733.196 por alumno, más de cuatro veces el promedio provincial.
          Detrás aparecen General Guido, con 719 alumnos, y Pila, con 1.079. Tordillo, que es el distrito con
          la matrícula estatal más chica de la provincia -585 alumnos-, queda octavo.
        </p>
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Del primer puesto al cuarto se pierden más de $160.000 por alumno. De ahí en adelante la pendiente
          se aplana: entre General Alvear, cuarto con $570.434, y General La Madrid, decimoquinto con
          $454.858, hay once municipios repartidos en un rango estrecho. Lezama, el municipio más joven de la
          provincia, aparece duodécimo con 887 alumnos estatales.
        </p>
        <DownloadableViz title="Los 15 municipios con mayor Fondo Educativo por alumno estatal - 2025" fuente="Ministerio de Economía PBA y DGCyE, 2025">
          <ChartTop15 />
        </DownloadableViz>
      </div>

      {/* EL FONDO DE LA TABLA (fondo blanco alternado) — solo tabla densa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Los quince últimos ya no son los quince del conurbano" />
          <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            General Rodríguez cierra el ranking: $3.786 millones para 34.334 alumnos estatales, $110.256 por
            alumno, 6,6 veces menos que Puán. Con él entran al fondo de la tabla otros seis municipios que no
            son del conurbano histórico: San Vicente, Presidente Perón, Escobar, Pilar, Pinamar y La Costa.
            Siete de los quince últimos quedan afuera de los 24 partidos del GBA.
          </p>
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Del otro lado, los dos partidos que el ranking por habitante ponía al final suben muchísimo:
            Vicente López pasa del puesto 135 al 65 y San Isidro, del 134 al 86. En los dos, cerca de dos
            tercios de la matrícula está en escuelas privadas -68,0% y 64,4%-, y el denominador por habitante
            contaba a esos chicos igual que a los del sistema estatal. La Matanza, con la matrícula estatal
            más grande de la provincia, queda 112º con $147.600.
          </p>
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['#', 'Municipio', 'Bloque', 'Matrícula estatal', 'Fondo Educativo 2025 (millones de $)', 'Por alumno'].map((h, i) => (
                    <th key={h} style={{ textAlign: i <= 2 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BOTTOM15.map((r, i, arr) => (
                  <tr key={r.muni} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkLight }}>{r.pos}</td>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.muni}</td>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{r.gba ? 'GBA' : 'Interior'}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtNum(r.matricula)}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtNum(r.fondo)}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600, textAlign: 'right' }}>{fmtPesos(r.porAlumno)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FichaTecnica items={[
            ['Fuente', 'Ministerio de Economía PBA y DGCyE'],
            ['Período', 'fondo acumulado enero-diciembre 2025 y matrícula 2025'],
            ['Universo', 'puestos 121 a 135 de los 135 municipios: 8 del GBA y 7 del interior'],
            ['Unidad', 'millones de $ y $ por alumno estatal'],
          ]} />
        </div>
      </div>

      {/* EL TAMAÑO DE LA MATRÍCULA */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Cuanto más grande es la matrícula, menos pesos por alumno" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Ordenados de menor a mayor matrícula estatal y partidos en cinco grupos de 27, los municipios
          muestran una escalera sin escalones invertidos: $433.960 por alumno en los más chicos, después
          $315.007, $252.047, $182.770 y $141.126 en los 27 más grandes. Ningún partido del GBA aparece en los
          tres primeros grupos; en el último hay diecinueve.
        </p>
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Las excepciones son pocas y se pueden nombrar. General Pueyrredón, con 80.031 alumnos estatales,
          queda 90º y le gana a los veinticuatro partidos del conurbano menos a Vicente López, San Isidro y
          Tres de Febrero. En la otra dirección, Villa Gesell y Pinamar tienen menos de 8.300 alumnos
          y caen al 110º y al 124º.
        </p>
        <DownloadableViz title="Fondo Educativo por alumno según el tamaño de la matrícula estatal - 2025" fuente="Ministerio de Economía PBA y DGCyE, 2025">
          <ChartTramos />
        </DownloadableViz>
      </div>

      {/* GBA VS RESTO (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="El GBA recibe el 49,3% del fondo con el 58,1% de la matrícula estatal" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Los 24 partidos del conurbano cobraron $219.317 millones y los 111 municipios del interior,
          $225.294 millones. El reparto entre bloques está casi partido al medio, sobre matrículas estatales
          que no lo están: 1.539.216 alumnos de un lado y 1.111.554 del otro. La diferencia por alumno entre
          un bloque y otro es de $60.198.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5" style={{ maxWidth: 760 }}>
          <CifraCard label="GBA, por alumno estatal" valor="$142.486" polaridad="neutro" periodo="24 partidos, promedio ponderado" />
          <CifraCard label="Interior, por alumno estatal" valor="$202.684" polaridad="neutro" periodo="111 municipios, promedio ponderado" />
          <CifraCard label="Diferencia entre bloques" valor="42,2%" polaridad="neutro" periodo="a favor del interior" />
        </div>
        <DownloadableViz title="Participación en la matrícula estatal y en el Fondo Educativo - 2025" fuente="Ministerio de Economía PBA y DGCyE, 2025">
          <ChartGrupos />
        </DownloadableViz>
        </div>
      </div>

      {/* LOS DOS DENOMINADORES, LADO A LADO */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="La misma plata, con los dos denominadores" />
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '0 0 0.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['', 'Por habitante', 'Por alumno estatal'].map((h, i) => (
                    <th key={h || i} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DENOMINADOR.map((r, i, arr) => (
                  <tr key={r.concepto} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.concepto}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.hab}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600, textAlign: 'right' }}>{r.alu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FichaTecnica items={[
            ['Fuente', 'Ministerio de Economía PBA, Dirección Provincial de Estadística y DGCyE'],
            ['Período', 'acumulado enero-diciembre 2025'],
            ['Universo', '135 municipios, el mismo fondo con dos denominadores'],
            ['Unidad', '$ por habitante, $ por alumno estatal y % del total'],
          ]} />
          <p className="text-base leading-relaxed mt-5 mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El sentido general no cambia: el interior recibe más que el conurbano con los dos denominadores y
            ningún partido del GBA entra entre los quince primeros. Lo que cambia es la magnitud y el fondo de
            la tabla. La brecha entre el primero y el último pasa de 12,2 veces a 6,6, y la diferencia a favor
            del interior baja de 67% a 42,2%.
          </p>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La razón es que la población de un distrito y su matrícula estatal no son la misma cosa. El
            conurbano concentra el 61,9% de los habitantes, el 60,6% de la matrícula total y el 58,1% de la
            estatal: en el GBA el sector privado educa al 35,7% de los chicos y en el interior, al 28,6%.
            Medir por habitante le cargaba a Vicente López y a San Isidro un denominador que incluye a los dos
            tercios de su matrícula que van a escuelas privadas.
          </p>
          <p className="text-base leading-relaxed mt-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La comparación con el otro instrumento de transferencia se mantiene en pie: el Fondo Educativo
            equivale al 12,3% de lo que la Provincia repartió por coparticipación bruta durante 2025.
          </p>
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
            Ministerio de Economía de la Provincia de Buenos Aires, Dirección Provincial de Coordinación
            Municipal. "Transferencias de Fondos a los Municipios", columna Fondo de Financ. Educativo,
            acumulado enero-diciembre 2025 · Dirección General de Cultura y Educación de la Provincia de
            Buenos Aires, Dirección de Información y Estadística. "Matrícula por año de estudio",
            relevamiento inicial 2025, niveles inicial, primario y secundario por distrito y sector ·
            Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires.
            Población total por municipio, Censo Nacional de Población, Hogares y Viviendas 2022 · DatosPBA
            (2026), "La coparticipación municipal bonaerense, medida por habitante" · Elaboración propia
            DatosPBA · 2026
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.75rem' }}>
            <a
              href="https://www.gba.gob.ar/economia/coordinacion_municipal/transferencias_municipios"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
            >
              Ministerio de Economía PBA - Transferencias a municipios <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              to="/informes/coparticipacion-municipal-pba-2025"
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
            >
              El informe anterior de esta serie: la coparticipación municipal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
