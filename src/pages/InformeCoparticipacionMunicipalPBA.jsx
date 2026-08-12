import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Scatter } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, PointElement, Tooltip, Legend)
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

/* Coparticipación bruta acumulada enero-diciembre 2025 y población del Censo
   2022. `bruta` va en millones de pesos; `perCapita`, en pesos por habitante. */
const TOP15 = [
  { pos: 1,  muni: 'Puán',              pob: 16613,  bruta: 21269,  perCapita: 1280240 },
  { pos: 2,  muni: 'Pila',              pob: 4642,   bruta: 5782,   perCapita: 1245532 },
  { pos: 3,  muni: 'San Cayetano',      pob: 8994,   bruta: 10351,  perCapita: 1150854 },
  { pos: 4,  muni: 'General La Madrid', pob: 11618,  bruta: 13090,  perCapita: 1126659 },
  { pos: 5,  muni: 'Tornquist',         pob: 14810,  bruta: 16156,  perCapita: 1090858 },
  { pos: 6,  muni: 'General Guido',     pob: 3174,   bruta: 3371,   perCapita: 1062202 },
  { pos: 7,  muni: 'Guaminí',           pob: 11801,  bruta: 12102,  perCapita: 1025546 },
  { pos: 8,  muni: 'Tordillo',          pob: 2542,   bruta: 2401,   perCapita: 944514  },
  { pos: 9,  muni: 'General Lavalle',   pob: 4870,   bruta: 4535,   perCapita: 931165  },
  { pos: 10, muni: 'Tapalqué',          pob: 10783,  bruta: 9929,   perCapita: 920767  },
  { pos: 11, muni: 'Coronel Dorrego',   pob: 15968,  bruta: 14385,  perCapita: 900875  },
  { pos: 12, muni: 'Adolfo Alsina',     pob: 17552,  bruta: 15803,  perCapita: 900355  },
  { pos: 13, muni: 'Daireaux',          pob: 18422,  bruta: 15960,  perCapita: 866348  },
  { pos: 14, muni: 'Laprida',           pob: 11646,  bruta: 9876,   perCapita: 848016  },
  { pos: 15, muni: 'General Pinto',     pob: 12941,  bruta: 10777,  perCapita: 832799  },
]

const BOTTOM15 = [
  { pos: 121, muni: 'San Vicente',         pob: 98215,   bruta: 13286,  perCapita: 135275, gba: false },
  { pos: 122, muni: 'Moreno',              pob: 576632,  bruta: 77884,  perCapita: 135066, gba: true  },
  { pos: 123, muni: 'Pergamino',           pob: 115340,  bruta: 15577,  perCapita: 135050, gba: false },
  { pos: 124, muni: 'La Matanza',          pob: 1841247, bruta: 241846, perCapita: 131349, gba: true  },
  { pos: 125, muni: 'General Rodríguez',   pob: 142709,  bruta: 18084,  perCapita: 126716, gba: false },
  { pos: 126, muni: 'Lanús',               pob: 461267,  bruta: 58294,  perCapita: 126378, gba: true  },
  { pos: 127, muni: 'San Nicolás',         pob: 167824,  bruta: 20832,  perCapita: 124133, gba: false },
  { pos: 128, muni: 'Almirante Brown',     pob: 584827,  bruta: 72471,  perCapita: 123918, gba: true  },
  { pos: 129, muni: 'Morón',               pob: 331183,  bruta: 40052,  perCapita: 120935, gba: true  },
  { pos: 130, muni: 'Avellaneda',          pob: 367554,  bruta: 43037,  perCapita: 117090, gba: true  },
  { pos: 131, muni: 'Ezeiza',              pob: 201511,  bruta: 23582,  perCapita: 117028, gba: true  },
  { pos: 132, muni: 'General Pueyrredón',  pob: 667082,  bruta: 77007,  perCapita: 115439, gba: false },
  { pos: 133, muni: 'Quilmes',             pob: 633391,  bruta: 71220,  perCapita: 112443, gba: true  },
  { pos: 134, muni: 'Ituzaingó',           pob: 180232,  bruta: 18963,  perCapita: 105214, gba: true  },
  { pos: 135, muni: 'Tres de Febrero',     pob: 364176,  bruta: 36135,  perCapita: 99225,  gba: true  },
]

const GRUPOS = [
  { grupo: 'GBA (24 partidos)',                 pobPct: 61.9, fondosPct: 46.4 },
  { grupo: 'Resto de la Provincia (111)',       pobPct: 38.1, fondosPct: 53.6 },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>. Un
   reparto de fondos no tiene dirección deseable propia: todas van en neutro. */
const HERO_STATS = [
  { label: 'Coparticipación bruta repartida', valor: '$3,60', unidad: 'billones', polaridad: 'neutro', periodo: 'acumulado enero-diciembre 2025' },
  { label: 'Promedio provincial',             valor: '$205.720', polaridad: 'neutro', periodo: 'por habitante, 135 municipios' },
  { label: 'Brecha entre extremos',           valor: '12,9', unidad: 'veces', polaridad: 'neutro', periodo: 'Puán sobre Tres de Febrero' },
  { label: 'Fondos que recibe el GBA',        valor: '46,4%', polaridad: 'neutro', periodo: 'con el 61,9% de la población' },
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

// ─── FORMATOS Y VALUE LABELS ─────────────────────────────────

const fmtNum   = v => v.toLocaleString('es-AR', { maximumFractionDigits: 0 })
const fmtPesos = v => '$' + fmtNum(v)
const fmtMiles = v => fmtNum(v)
const fmtPct   = v => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'

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

/* Eje de valor oculto: cuando cada barra lleva su cifra escrita al lado, el eje
   repite el dato y le come ancho al gráfico. La unidad va en la ficha técnica. */
const ejeValorOculto = {
  min: 0,
  ticks: { display: false },
  grid: { display: false },
  border: { display: false },
}

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
      data: TOP15.map(d => Math.round(d.perCapita / 1000)),
      backgroundColor: DATA[2],
      borderRadius: 4, barPercentage: 0.72,
    }],
  }
  return (
    <ChartCard
      title="Los 15 municipios con mayor coparticipación por habitante - En miles de $, acumulado 2025"
      hallazgo="Gráfico de barras horizontales: Puán encabeza el ranking con $1.280.240 de coparticipación por habitante, seguido por Pila con $1.245.532 y San Cayetano con $1.150.854; el decimoquinto, General Pinto, recibe $832.799."
      tabla={{
        columnas: ['Municipio', 'Población 2022', 'Coparticipación por habitante'],
        filas: TOP15.map(d => [d.muni, fmtNum(d.pob), fmtPesos(d.perCapita)]),
      }}
      ficha={[
        ['Fuente', 'Ministerio de Economía PBA y Dirección Provincial de Estadística'],
        ['Período', 'acumulado enero-diciembre 2025'],
        ['Universo', '135 municipios bonaerenses'],
        ['Unidad', 'miles de $ por habitante (Censo 2022)'],
      ]}
      height={430}
    >
      <Bar
        data={data}
        plugins={[makeHValueLabels(fmtMiles)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 52 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtMiles(ctx.raw)} mil por habitante` } },
          },
          scales: {
            x: ejeValorOculto,
            y: ejeCategorias(132),
          },
        }}
      />
    </ChartCard>
  )
}

function ChartGrupos() {
  const data = {
    labels: ['Población (Censo 2022)', 'Coparticipación bruta 2025'],
    /* Con solo dos categorías, los valores por defecto reparten las barras a lo
       ancho de todo el canvas y el par deja de leerse como par. */
    datasets: [
      { label: 'GBA (24 partidos)', data: [GRUPOS[0].pobPct, GRUPOS[0].fondosPct], backgroundColor: DATA[1], borderRadius: 4, categoryPercentage: 0.4, barPercentage: 0.92 },
      { label: 'Resto de la Provincia (111)', data: [GRUPOS[1].pobPct, GRUPOS[1].fondosPct], backgroundColor: DATA[2], borderRadius: 4, categoryPercentage: 0.4, barPercentage: 0.92 },
    ],
  }
  return (
    <ChartCard
      title="Participación en la población y en los fondos coparticipados"
      hallazgo="Gráfico de barras: el GBA reúne el 61,9% de la población provincial y recibe el 46,4% de la coparticipación bruta, mientras que los 111 municipios restantes tienen el 38,1% de la población y captan el 53,6% de los fondos."
      tabla={{
        columnas: ['Grupo', '% de la población', '% de la coparticipación'],
        filas: GRUPOS.map(g => [g.grupo, fmtPct(g.pobPct), fmtPct(g.fondosPct)]),
      }}
      ficha={[
        ['Fuente', 'Ministerio de Economía PBA y Dirección Provincial de Estadística'],
        ['Período', 'acumulado enero-diciembre 2025'],
        ['Universo', '135 municipios - 17.523.996 habitantes'],
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

function ChartDispersion() {
  const punto = d => ({ x: d.pob, y: Math.round(d.perCapita / 1000), muni: d.muni })
  const data = {
    datasets: [
      {
        label: 'GBA (24 partidos)',
        data: BOTTOM15.filter(d => d.gba).map(punto),
        backgroundColor: DATA[1], pointRadius: 5, pointHoverRadius: 7,
      },
      {
        label: 'Resto de la Provincia',
        data: [...TOP15.map(punto), ...BOTTOM15.filter(d => !d.gba).map(punto)],
        backgroundColor: DATA[2], pointRadius: 5, pointHoverRadius: 7,
      },
    ],
  }
  return (
    <ChartCard
      title="Coparticipación por habitante según población del municipio - Extremos del ranking"
      hallazgo="Gráfico de dispersión con los dos ejes en escala logarítmica: los municipios de menos de 20.000 habitantes se ubican entre 833 y 1.280 miles de pesos por habitante, y todos los distritos de más de 90.000 habitantes quedan por debajo de 136 mil, pertenezcan o no al conurbano."
      tabla={{
        columnas: ['Municipio', 'Población 2022', 'Coparticipación por habitante'],
        filas: [...TOP15, ...BOTTOM15].map(d => [d.muni, fmtNum(d.pob), fmtPesos(d.perCapita)]),
      }}
      ficha={[
        ['Fuente', 'Ministerio de Economía PBA y Dirección Provincial de Estadística'],
        ['Período', 'acumulado enero-diciembre 2025'],
        ['Universo', 'los 30 municipios de los dos extremos del ranking'],
        ['Unidad', 'miles de $ por habitante y población, los dos en escala logarítmica'],
        ['Escala', 'ejes logarítmicos: sin ellos los 15 distritos grandes se apilan sobre el eje'],
      ]}
      legend={[{ label: 'GBA (24 partidos)', color: DATA[1] }, { label: 'Resto de la Provincia', color: DATA[2] }]}
      height={300}
    >
      <Scatter
        data={data}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              ...tooltipBase,
              callbacks: {
                label: ctx => `  ${ctx.raw.muni}: ${fmtMiles(ctx.raw.y)} mil por habitante · ${fmtNum(ctx.raw.x)} habitantes`,
              },
            },
          },
          scales: {
            x: {
              type: 'logarithmic',
              title: { display: true, text: 'Población (Censo 2022, escala logarítmica)', font: { size: 10 } },
              ticks: { callback: v => ([1000, 10000, 100000, 1000000].includes(v) ? fmtNum(v) : ''), font: { size: 10 } },
              grid: { color: 'rgba(13,17,23,0.08)' },
            },
            /* Los quince distritos grandes caen entre 99 y 135 mil y los quince
               chicos entre 833 y 1.280: en escala lineal el primer grupo queda
               aplastado contra el eje. La escala se declara en la ficha. */
            y: {
              type: 'logarithmic',
              min: 80,
              max: 1600,
              title: { display: true, text: 'Miles de $ por habitante (escala logarítmica)', font: { size: 10 } },
              ticks: { callback: v => ([100, 200, 500, 1000].includes(v) ? fmtNum(v) : ''), font: { size: 10 } },
              grid: { color: 'rgba(13,17,23,0.08)' },
            },
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
          La coparticipación municipal,<br />
          medida por habitante
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          Durante 2025 la Provincia repartió{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>$3,60 billones</strong> de coparticipación bruta
          entre sus 135 municipios. Puán recibió $1.280.240 por habitante y Tres de Febrero, $99.225. Los dos
          cobran del mismo régimen.
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
            { label: 'Fuente',        val: 'Ministerio de Economía PBA - Coordinación Municipal' },
            { label: 'Universo',      val: '135 municipios · 17.523.996 habitantes' },
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
          El reparto no sigue al padrón: sigue a un coeficiente escrito hace décadas
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          La Ley 10.559 distribuye por coeficientes fijos que no se actualizan cuando cambia la población.
          El resultado es que <strong>el municipio bonaerense promedio del interior recibe 88% más por habitante
          que el promedio del conurbano</strong>, y que un intendente del GBA administra menos de un peso de
          coparticipación por cada diez que administra su par de un partido chico. Es la primera restricción
          fiscal de cualquier gestión municipal y no se decide en el municipio.
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
        <strong style={{ color: C.ink }}>Coparticipación Bruta</strong>, que es el componente principal pero no
        el único. Quedan fuera el Fondo de Financiamiento Educativo, el Fondo de Fortalecimiento Fiscal
        Municipal, el Fondo de Inclusión Social y otras partidas que se reparten con criterios propios. Un
        municipio puede compensar parte de su posición en este ranking con esos fondos o con su recaudación
        de tasas, que este análisis no mide.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        El monto por habitante divide el acumulado enero-diciembre de 2025 por la población del{' '}
        <strong style={{ color: C.ink }}>Censo 2022</strong>. No hay proyección poblacional post-censal ni
        ajuste por inflación intra-anual: los pesos de enero y los de diciembre se suman a valor nominal, así
        que las cifras sirven para comparar municipios entre sí y no para comparar con otros años.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        El gráfico de dispersión toma los 30 municipios de los dos extremos del ranking, que son los que la
        fuente publica en detalle. La relación entre tamaño y monto por habitante se sostiene también en los
        105 municipios intermedios, según el gráfico completo del informe original.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeCoparticipacionMunicipalPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* LOS QUINCE PRIMEROS — prosa y gráfico a lo ancho: quince barras con
          nombre de municipio no entran en media columna */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Los quince primeros del ranking no llegan a 19.000 habitantes" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Puán encabeza la tabla con 16.613 habitantes y $21.269 millones cobrados en el año. Detrás
          aparecen Pila, con 4.642 habitantes, y San Cayetano, con 8.994. Ninguno de los quince primeros
          supera los 18.422 vecinos del Censo 2022, y tres de ellos no llegan a los 5.000.
        </p>
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          La lista es de geografía homogénea: son distritos del sudoeste bonaerense, de la cuenca del
          Salado y del noroeste agropecuario. Tordillo, con 2.542 habitantes, cobra $2.401 millones, una
          cifra menor en el total provincial que igual le alcanza para ubicarse octavo por habitante.
        </p>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          La escala importa para leer estos números. Un municipio de 3.000 habitantes necesita una
          comuna, un hospital y una red vial rural igual que uno de 30.000, y el costo fijo de esa
          estructura se reparte entre muchos menos contribuyentes.
        </p>
        <DownloadableViz title="Los 15 municipios con mayor coparticipación por habitante - 2025" fuente="Ministerio de Economía PBA y DPE, acumulado 2025">
          <ChartTop15 />
        </DownloadableViz>
      </div>

      {/* EL OTRO EXTREMO (fondo blanco alternado) — solo tabla densa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Tres de Febrero cierra la tabla con $99.225 por habitante" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En el fondo del ranking hay diez partidos del conurbano y cinco distritos grandes del interior.
            La Matanza recibió $241.846 millones, el monto más alto de la Provincia, y con 1.841.247
            habitantes queda en el puesto 124. General Pueyrredón, San Nicolás, Pergamino, General Rodríguez
            y San Vicente completan el grupo: ninguno es del GBA y todos superan los 90.000 habitantes.
          </p>
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['#', 'Municipio', 'Grupo', 'Población 2022', 'Coparticipación 2025 (millones de $)', 'Por habitante'].map((h, i) => (
                    <th key={h} style={{ textAlign: i <= 2 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BOTTOM15.map((r, i, arr) => (
                  <tr key={r.muni} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkLight }}>{r.pos}</td>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.muni}</td>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.75rem', color: C.inkMid }}>{r.gba ? 'GBA' : 'Interior'}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtNum(r.pob)}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtNum(r.bruta)}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600, textAlign: 'right' }}>{fmtPesos(r.perCapita)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FichaTecnica items={[
            ['Fuente', 'Ministerio de Economía PBA y Dirección Provincial de Estadística'],
            ['Período', 'acumulado enero-diciembre 2025'],
            ['Universo', 'puestos 121 a 135 de los 135 municipios'],
            ['Unidad', 'millones de $ y $ por habitante'],
          ]} />
        </div>
      </div>

      {/* GBA VS RESTO */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Seis de cada diez bonaerenses viven en el GBA y ahí va el 46,4% de los fondos" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Agrupar los 135 municipios en dos bloques confirma a escala provincial lo que muestran los extremos.
          Los 24 partidos del conurbano reúnen 10.849.299 habitantes y cobraron $1,67 billones. Los 111
          municipios del interior, con 6.674.697 habitantes, cobraron $1,93 billones. La diferencia por
          habitante entre un bloque y otro es de $135.468.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5" style={{ maxWidth: 760 }}>
          <CifraCard label="GBA, por habitante" valor="$154.122" polaridad="neutro" periodo="24 partidos, promedio ponderado" />
          <CifraCard label="Interior, por habitante" valor="$289.590" polaridad="neutro" periodo="111 municipios, promedio ponderado" />
          <CifraCard label="Diferencia entre bloques" valor="88%" polaridad="neutro" periodo="a favor del interior" />
        </div>
        <DownloadableViz title="Participación en la población y en los fondos coparticipados - 2025" fuente="Ministerio de Economía PBA y DPE, acumulado 2025">
          <ChartGrupos />
        </DownloadableViz>
      </div>

      {/* TAMAÑO POBLACIONAL (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Lo que ordena el reparto es el tamaño del distrito, no su ubicación" />
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La pertenencia al conurbano describe el resultado pero no lo explica. General Pueyrredón, San
            Nicolás y Pergamino están en el interior y cobran por habitante lo mismo que Avellaneda o Morón.
            Lo que comparten es la población. Puesta la población en escala logarítmica, la nube de puntos
            cae de izquierda a derecha sin que el color del punto agregue información: los distritos de más de
            90.000 habitantes se apilan todos en la franja baja del gráfico, sean del GBA o no.
          </p>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Para la discusión pública bonaerense esto corre el eje del reclamo. El debate suele plantearse
            como conurbano contra interior, y los datos muestran una escala de otro tipo: los coeficientes de
            la Ley 10.559 favorecen al municipio chico, y el conurbano aparece en el fondo de la tabla porque
            ahí están los distritos más poblados. Cualquier revisión del régimen que reparta por población
            movería recursos hacia el GBA, pero también hacia Mar del Plata, Pergamino y San Nicolás.
          </p>
          <DownloadableViz title="Coparticipación por habitante según población del municipio - 2025" fuente="Ministerio de Economía PBA y DPE, acumulado 2025">
            <ChartDispersion />
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
            Ministerio de Economía de la Provincia de Buenos Aires, Dirección Provincial de Coordinación
            Municipal. "Transferencias de Fondos a los Municipios", columna Coparticipación Bruta, acumulado
            enero-diciembre 2025 · Dirección Provincial de Estadística, Ministerio de Economía de la Provincia
            de Buenos Aires. Población total por municipio, Censo Nacional de Población, Hogares y Viviendas
            2022 · Ley provincial 10.559 y sus modificatorias, régimen de coparticipación municipal ·
            Elaboración propia DatosPBA · 2026
          </p>
          <a
            href="https://www.gba.gob.ar/economia/coordinacion_municipal/transferencias_municipios"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Ministerio de Economía PBA - Transferencias a municipios <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
