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
import { DATA, colorEscalaValoracion, getColorVariacion } from '@/lib/variacion'
import { CONURBANO_VIEWBOX, CONURBANO_PATHS, CONURBANO_CENTROS } from '@/lib/conurbanoPaths'

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
  barra:    '#64748B',
}

// ─── DATOS ───────────────────────────────────────────────────

/* Todo sale del Informe SNIC 2025 de la Provincia de Buenos Aires (Dirección
   Nacional de Estadística Criminal, septiembre de 2026). Las tasas por partido
   son las publicadas; los agregados Conurbano / resto de la provincia son
   cálculo propio, explicado en <NotaMetodologica />. */

const FUENTE = 'Ministerio de Seguridad Nacional, SNIC-SAT 2025'

const ANIOS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']

/* Tablas 2 y 3: víctimas de homicidios dolosos y tasa cada 100.000 hab. */
const HOM_VICTIMAS = [1150, 990, 992, 903, 931, 838, 740, 829, 820, 775]
const HOM_TASA     = [6.8, 5.8, 5.8, 5.2, 5.3, 4.7, 4.3, 4.8, 4.7, 4.4]

/* Tabla 5 agregada: víctimas 2024 y 2025 y tasas por territorio. */
const TERRITORIOS = [
  // territorio, víctimas 2024, víctimas 2025, var., tasa 2024, tasa 2025
  ['Conurbano (24 partidos)', '607', '597', '−1,6%', '5,6', '5,5'],
  ['Resto de la provincia',   '213', '178', '−16,4%', '3,2', '2,7'],
  ['Provincia',               '820', '775', '−5,5%', '4,7', '4,4'],
]

/* Tablas 5, 19 y 49 a 55, Conurbano 2025. Tasas cada 100.000 hab. */
const PARTIDOS = [
  // partido, hom. víctimas, hom. tasa, tent. víctimas, tent. tasa, lesiones tasa, robos hechos, robos tasa, hurtos tasa, viales tasa
  ['Almirante Brown',     36, 6.2, 42, 7.2, 537, 4639, 798.2, 353, 1.4],
  ['Avellaneda',          17, 4.7, 13, 3.6, 532, 3150, 862.2, 582, 2.7],
  ['Berazategui',          7, 2.0, 10, 2.8, 611, 2345, 656.9, 372, 7.8],
  ['Esteban Echeverría',  15, 4.5, 20, 5.9, 534, 2805, 832.2, 419, 3.6],
  ['Ezeiza',               4, 2.0, 11, 5.5, 765, 1027, 510.3, 650, 7.0],
  ['Florencio Varela',    26, 5.3, 52, 10.5, 622, 2325, 469.6, 273, 2.4],
  ['General San Martín',  39, 8.8, 30, 6.7, 447, 4480, 1006.1, 574, 1.6],
  ['Hurlingham',           7, 3.8,  3, 1.6, 424, 1033, 559.6, 292, 2.7],
  ['Ituzaingó',            6, 3.4,  4, 2.3, 369, 1535, 864.4, 601, 1.7],
  ['José C. Paz',         27, 8.3, 38, 11.6, 449, 2904, 887.7, 363, 5.2],
  ['La Matanza',         149, 8.1, 47, 2.6, 242, 17434, 951.5, 422, 3.2],
  ['Lanús',               15, 3.3, 24, 5.2, 542, 4979, 1087.9, 614, 2.6],
  ['Lomas de Zamora',     51, 7.4, 42, 6.1, 498, 5469, 796.0, 455, 1.7],
  ['Malvinas Argentinas', 11, 3.2, 22, 6.3, 455, 2861, 820.4, 389, 3.4],
  ['Merlo',               33, 5.7, 32, 5.5, 326, 4060, 701.3, 286, 3.6],
  ['Moreno',              48, 8.4, 47, 8.2, 389, 3731, 650.0, 290, 3.0],
  ['Morón',               16, 4.9,  4, 1.2, 274, 3760, 1140.9, 760, 4.6],
  ['Quilmes',             36, 5.7, 29, 4.6, 390, 6255, 993.0, 377, 5.6],
  ['San Fernando',        12, 7.0,  9, 5.3, 436, 813, 476.8, 354, 2.9],
  ['San Isidro',           8, 2.7, 11, 3.7, 276, 1692, 572.1, 524, 3.4],
  ['San Miguel',           4, 1.2,  8, 2.4, 322, 1017, 310.2, 353, 1.5],
  ['Tigre',               10, 2.2, 11, 2.5, 423, 1672, 374.3, 399, 2.2],
  ['Tres de Febrero',     17, 4.7,  8, 2.2, 285, 3185, 877.8, 499, 2.5],
  ['Vicente López',        3, 1.1,  3, 1.1, 164, 1113, 396.6, 411, 3.6],
]

const CONURBANO = { hom: 5.5, tent: 4.8, robos: 781 }

/* Comparación entre territorios, 2025. Cantidad y tasa del Conurbano, tasa
   del resto de la provincia y cociente. */
const COMPARACION = [
  ['Homicidios dolosos',                  '597',    '5,5',  '2,7', '2,1'],
  ['Tentativas de homicidio',             '520',    '4,8',  '4,8', '1,0'],
  ['Lesiones dolosas',                    '43.971', '407',  '479', '0,9'],
  ['Delitos contra la integridad sexual', '9.428',  '87',   '81',  '1,1'],
  ['Abusos sexuales con acceso carnal',   '1.345',  '12,5', '17,0', '0,7'],
  ['Amenazas',                            '40.956', '379',  '428', '0,9'],
  ['Robos totales',                       '84.284', '781',  '520', '1,5'],
  ['Hurtos totales',                      '46.203', '428',  '501', '0,9'],
  ['Muertes en siniestros viales',        '348',    '3,2',  '9,6', '0,3'],
]

/* Tablas 11, 63, 65, 73 y 109: hechos registrados por año. */
const RUPTURA = [
  // categoría, 2016, 2019, 2023, 2024, 2025, var. 2023-2025
  ['Delitos contra la seguridad pública', '7.911', '24.030', '25.251', '11.724', '1.948', '−92,3%'],
  ['Delitos contra el orden público',     '6.445', '3.278',  '2.504',  '1.172',  '203',   '−91,9%'],
  ['Delitos contra la fe pública',        '4.653', '6.527',  '8.013',  '5.182',  '667',   '−91,7%'],
  ['Otros delitos en leyes especiales',   's/d',   '1.569',  '6.190',  '11.175', '13.035', '+110,6%'],
  ['Robos agravados por lesiones o muerte', '771', '2.022',  '2.758',  '4.131',  '6.439', '+133,5%'],
]

/* Tabla 6: víctimas de lesiones dolosas según sexo, % del total. */
const LESIONES_ANIOS   = ANIOS.slice(1)
const LESIONES_MUJERES = [42.6, 43.5, 43.5, 52.4, 55.8, 60.4, 59.8, 60.0, 60.3]
const LESIONES_VARONES = [53.0, 51.9, 51.5, 43.9, 34.5, 35.9, 37.5, 37.3, 37.9]

const HERO_STATS = [
  { label: 'Víctimas de homicidio doloso en la Provincia', valor: '775', variacion: '−5,5%', polaridad: 'menor-es-mejor', periodo: '2025, contra 820 en 2024' },
  { label: 'Víctimas en los 24 partidos del Conurbano', valor: '597', variacion: '−1,6%', polaridad: 'menor-es-mejor', periodo: '2025, contra 607 en 2024' },
  { label: 'Víctimas en el resto de la provincia', valor: '178', variacion: '−16,4%', polaridad: 'menor-es-mejor', periodo: '2025, contra 213 en 2024' },
  { label: 'Tasa del Conurbano sobre la del resto', valor: '2,1', unidad: 'veces', polaridad: 'neutro', periodo: '5,5 contra 2,7 cada 100.000 hab., 2025' },
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

function ChartCard({ title, hallazgo, ficha, tabla, legend, height = 220, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, padding: '1.25rem 1.25rem 0.875rem', margin: '1.25rem 0' }}>
      {title && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>{title}</p>}
      {legend}
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

function Leyenda({ items }) {
  return (
    <div aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: '0.72rem', color: C.inkMid, marginBottom: '0.75rem' }}>
      {items.map(([label, color]) => (
        <span key={label}><span style={{ display: 'inline-block', width: 10, height: 10, background: color, marginRight: 6 }} />{label}</span>
      ))}
    </div>
  )
}

// ─── FORMATO ─────────────────────────────────────────────────

const fmtN = (v, dec = 0) => v.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec })

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 2 }
const grilla = { color: 'rgba(13,17,23,0.08)' }

// ─── PLUGINS ─────────────────────────────────────────────────

/* Barras horizontales: tasa en negrita al final de la barra y, al lado, la
   cantidad entre paréntesis en gris. */
function makeHLabels(fmtTasa, cantidades) {
  return {
    id: 'hLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.getDatasetMeta(0).data.forEach((bar, i) => {
        const tasa = fmtTasa(chart.data.datasets[0].data[i])
        ctx.save()
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        ctx.font = 'bold 11px Archivo, sans-serif'
        ctx.fillStyle = '#334155'
        ctx.fillText(tasa, bar.x + 6, bar.y)
        const w = ctx.measureText(tasa).width
        ctx.font = '11px Archivo, sans-serif'
        ctx.fillStyle = '#64748B'
        ctx.fillText(`(${fmtN(cantidades[i])})`, bar.x + 12 + w, bar.y)
        ctx.restore()
      })
    },
  }
}

/* Línea vertical punteada con el promedio del Conurbano, etiquetada arriba. */
function makeRefLine(valor, etiqueta) {
  return {
    id: 'refLine',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart
      const x = scales.x.getPixelForValue(valor)
      ctx.save()
      ctx.strokeStyle = '#64748B'
      ctx.setLineDash([4, 4])
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, chartArea.top - 4)
      ctx.lineTo(x, chartArea.bottom)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#64748B'
      ctx.font = '600 11px Archivo, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(etiqueta, x, chartArea.top - 6)
      ctx.restore()
    },
  }
}

/* Línea: valor escrito solo en los puntos indicados. */
function makePointLabels(indices, fmt) {
  return {
    id: 'pointLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.data.datasets.forEach((dataset, di) => {
        const pts = chart.getDatasetMeta(di).data
        indices.forEach(i => {
          const p = pts[i]
          if (!p) return
          ctx.save()
          ctx.fillStyle = '#334155'
          ctx.font = 'bold 11px Archivo, sans-serif'
          ctx.textAlign = i === 0 ? 'left' : i === pts.length - 1 ? 'right' : 'center'
          const abajo = i === pts.length - 1
          ctx.textBaseline = abajo ? 'top' : 'bottom'
          ctx.fillText(fmt(dataset.data[i], i), p.x, abajo ? p.y + 8 : p.y - 8)
          ctx.restore()
        })
      })
    },
  }
}

/* Dos series cortas: nombre y valor al final de cada línea. */
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

function ChartHomicidiosSerie() {
  const data = {
    labels: ANIOS,
    datasets: [{
      label: 'Tasa',
      data: HOM_TASA,
      borderColor: DATA[1], backgroundColor: DATA[1],
      borderWidth: 2, pointRadius: 3, tension: 0,
    }],
  }
  return (
    <ChartCard
      title="Víctimas de homicidios dolosos cada 100.000 habitantes, 2016-2025"
      hallazgo="Gráfico de línea: la tasa de homicidios dolosos de la Provincia bajó de 6,8 cada 100.000 habitantes en 2016 a 4,4 en 2025. El mínimo de la serie fue 4,3 en 2022."
      tabla={{
        columnas: ['Año', 'Víctimas', 'Tasa'],
        filas: ANIOS.map((a, i) => [a, fmtN(HOM_VICTIMAS[i]), fmtN(HOM_TASA[i], 1)]),
      }}
      ficha={[
        ['Fuente', 'SNIC-SAT 2025, tablas 2 y 3'],
        ['Período', '2016-2025'],
        ['Universo', 'Provincia de Buenos Aires'],
        ['Unidad', 'víctimas cada 100.000 habitantes'],
      ]}
      height={250}
    >
      <Line
        data={data}
        plugins={[makePointLabels([0, 6, 9], (v, i) => `${fmtN(v, 1)} (${fmtN(HOM_VICTIMAS[i])})`)]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 24, left: 4, right: 4 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtN(ctx.raw, 1)} cada 100.000 hab. (${fmtN(HOM_VICTIMAS[ctx.dataIndex])} víctimas)` } },
          },
          scales: {
            y: { min: 0, max: 8, grid: grilla, border: { display: false }, ticks: { stepSize: 2 } },
            x: { grid: { display: false }, border: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

/* Ranking horizontal de los 24 partidos para un indicador. */
function ChartRanking({ col, colCant, dec, destacados, refValor, refLabel, title, hallazgo, ficha, tablaCols }) {
  const orden = [...PARTIDOS].sort((a, b) => b[col] - a[col])
  const data = {
    labels: orden.map(p => p[0]),
    datasets: [{
      data: orden.map(p => p[col]),
      backgroundColor: orden.map(p => (destacados.includes(p[0]) ? DATA[1] : C.barra)),
      borderRadius: 0, barThickness: 14,
    }],
  }
  return (
    <ChartCard
      title={title}
      hallazgo={hallazgo}
      tabla={{
        columnas: ['Partido', ...tablaCols],
        filas: orden.map(p => [p[0], fmtN(p[col], dec), fmtN(p[colCant])]),
      }}
      ficha={ficha}
      height={24 * 22 + 40}
    >
      <Bar
        data={data}
        plugins={[makeHLabels(v => fmtN(v, dec), orden.map(p => p[colCant])), makeRefLine(refValor, refLabel)]}
        options={{
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 22, right: 92 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtN(ctx.raw, dec)} cada 100.000 hab. (${fmtN(orden[ctx.dataIndex][colCant])})` } },
          },
          scales: {
            x: { min: 0, ticks: { display: false }, grid: { display: false }, border: { display: false } },
            y: {
              grid: { display: false }, border: { display: false },
              ticks: {
                autoSkip: false, color: '#334155',
                font: ctx => ({ size: 12, weight: destacados.includes(orden[ctx.index]?.[0]) ? 700 : 400 }),
              },
            },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartLesiones() {
  const data = {
    labels: LESIONES_ANIOS,
    datasets: [
      { label: 'Mujeres', data: LESIONES_MUJERES, borderColor: DATA[1], backgroundColor: DATA[1], borderWidth: 2, pointRadius: 3, tension: 0 },
      { label: 'Varones', data: LESIONES_VARONES, borderColor: DATA[2], backgroundColor: DATA[2], borderWidth: 2, pointRadius: 3, tension: 0 },
    ],
  }
  return (
    <ChartCard
      title="Víctimas de lesiones dolosas según sexo, 2017-2025 (% del total)"
      hallazgo="Gráfico de líneas: las mujeres pasaron de 42,6% de las víctimas de lesiones dolosas en 2017 a 60,3% en 2025, y los varones de 53,0% a 37,9%. El cruce ocurrió en 2020."
      tabla={{
        columnas: ['Año', 'Mujeres (%)', 'Varones (%)'],
        filas: LESIONES_ANIOS.map((a, i) => [a, fmtN(LESIONES_MUJERES[i], 1), fmtN(LESIONES_VARONES[i], 1)]),
      }}
      ficha={[
        ['Fuente', 'SNIC-SAT 2025, tabla 6'],
        ['Período', '2017-2025'],
        ['Universo', 'víctimas de lesiones dolosas, Provincia'],
        ['Unidad', '% del total; el resto es sexo sin determinar (9,7% en 2021)'],
      ]}
      height={260}
    >
      <Line
        data={data}
        plugins={[makeLastLabels(v => `${fmtN(v, 1)}%`)]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 104 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, mode: 'index', intersect: false, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${fmtN(ctx.raw, 1)}%` } },
          },
          scales: {
            y: { min: 0, max: 70, grid: grilla, border: { display: false }, ticks: { stepSize: 10, callback: v => `${v}%` } },
            x: { grid: { display: false }, border: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

// ─── MAPA ────────────────────────────────────────────────────

/* Cinco clases fijas, las mismas del informe en PDF. La tasa de homicidios es
   de polaridad menor-es-mejor: la clase más alta toma el extremo "peor" de la
   escala de valoración. */
const CLASES_MAPA = [
  { min: 7,   label: '7 o más',   color: colorEscalaValoracion(0) },
  { min: 5.5, label: '5,5 a 6,9', color: colorEscalaValoracion(0.25) },
  { min: 4,   label: '4 a 5,4',   color: colorEscalaValoracion(0.5) },
  { min: 2.5, label: '2,5 a 3,9', color: colorEscalaValoracion(0.75) },
  { min: 0,   label: 'Menos de 2,5', color: colorEscalaValoracion(1) },
]
const claseDe = t => CLASES_MAPA.find(c => t >= c.min)

/* Nombres cortos para los partidos chicos del primer cordón. */
const NOMBRE_MAPA = {
  'General San Martín': 'San Martín', 'Tres de Febrero': '3 de Febrero', 'Vicente López': 'V. López',
  'Malvinas Argentinas': 'Malvinas', 'Esteban Echeverría': 'E. Echeverría', 'Lomas de Zamora': 'Lomas',
  'Almirante Brown': 'A. Brown', 'Florencio Varela': 'F. Varela', 'San Fernando': 'S. Fernando',
  'Hurlingham': 'Hurlingham', 'Ituzaingó': 'Ituzaingó',
}

/* Ajustes a mano donde el centroide cae sobre un borde o la etiqueta pisa a
   la del vecino. En unidades del viewBox. */
const AJUSTE_ETIQUETA = {
  'Vicente López': [4, 4], 'Tres de Febrero': [9, 4],
  'Hurlingham': [-6, -5], 'Morón': [4, 6], 'Ituzaingó': [-4, 4],
}

function MapaHomicidios() {
  const tasas = Object.fromEntries(PARTIDOS.map(p => [p[0], p[2]]))
  return (
    <ChartCard
      title="Víctimas de homicidios dolosos cada 100.000 habitantes por partido, 2025"
      hallazgo="Mapa del Conurbano: General San Martín (8,8), Moreno (8,4), José C. Paz (8,3), La Matanza (8,1), Lomas de Zamora (7,4) y San Fernando (7,0) tienen tasas de 7 o más. Vicente López (1,1), San Miguel (1,2), Ezeiza (2,0), Berazategui (2,0) y Tigre (2,2) están por debajo de 2,5."
      legend={<Leyenda items={CLASES_MAPA.map(c => [c.label, c.color])} />}
      ficha={[
        ['Fuente', 'SNIC-SAT 2025, tabla 5'],
        ['Período', '2025'],
        ['Universo', '24 partidos del Conurbano'],
        ['Límites', 'departamentos_argentina (GitHub), sin islas del Delta'],
      ]}
      height="auto"
    >
      <svg viewBox={CONURBANO_VIEWBOX} style={{ width: '100%', maxWidth: 760, height: 'auto', display: 'block', margin: '0 auto', overflow: 'visible' }}>
        <path d={CONURBANO_PATHS.CABA} fill="#F1F5F9" stroke="#F1F5F9" strokeWidth="0.6" />
        <text x={CONURBANO_CENTROS.CABA[0]} y={CONURBANO_CENTROS.CABA[1]} textAnchor="middle" fontSize="12" fill="#64748B">CABA</text>
        {PARTIDOS.map(([nombre]) => (
          <path key={nombre} d={CONURBANO_PATHS[nombre]} fill={claseDe(tasas[nombre]).color} stroke="#fff" strokeWidth="1.2" strokeLinejoin="round">
            <title>{`${nombre}: ${fmtN(tasas[nombre], 1)} cada 100.000 hab.`}</title>
          </path>
        ))}
        {/* San Fernando continental es muy chico: etiqueta afuera, sobre el río. */}
        <g style={{ pointerEvents: 'none' }}>
          <line x1={CONURBANO_CENTROS['San Fernando'][0]} y1={CONURBANO_CENTROS['San Fernando'][1]} x2={CONURBANO_CENTROS['San Fernando'][0] + 58} y2={CONURBANO_CENTROS['San Fernando'][1] - 30} stroke="#64748B" strokeWidth="0.8" />
          <circle cx={CONURBANO_CENTROS['San Fernando'][0]} cy={CONURBANO_CENTROS['San Fernando'][1]} r="1.8" fill="#0F172A" />
          <text x={CONURBANO_CENTROS['San Fernando'][0] + 61} y={CONURBANO_CENTROS['San Fernando'][1] - 38} fontSize="9.5" fill="#334155">San Fernando</text>
          <text x={CONURBANO_CENTROS['San Fernando'][0] + 61} y={CONURBANO_CENTROS['San Fernando'][1] - 25} fontSize="12" fontWeight="700" fill="#0F172A" className="tabular-nums">{fmtN(tasas['San Fernando'], 1)}</text>
        </g>
        {PARTIDOS.filter(([nombre]) => nombre !== 'San Fernando').map(([nombre]) => {
          const [dx, dy] = AJUSTE_ETIQUETA[nombre] || [0, 0]
          const [x, y] = CONURBANO_CENTROS[nombre]
          return (
            <g key={nombre} transform={`translate(${x + dx} ${y + dy})`} style={{ pointerEvents: 'none' }} fill="#fff">
              <text textAnchor="middle" y="-3" fontSize="9.5">{NOMBRE_MAPA[nombre] || nombre}</text>
              <text textAnchor="middle" y="10" fontSize="12" fontWeight="700" className="tabular-nums">{fmtN(tasas[nombre], 1)}</text>
            </g>
          )
        })}
      </svg>
    </ChartCard>
  )
}

// ─── TABLA ───────────────────────────────────────────────────

/* Tabla genérica. `variaciones` indica qué columnas son variación y con qué
   polaridad se colorean. Las últimas `totales` filas van en negrita. */
function Tabla({ titulo, head, filas, variaciones = {}, totales = 0, minWidth = 0 }) {
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
            const esTotal = i >= arr.length - totales
            return (
              <tr key={i} style={{ borderBottom: i < arr.length - 1 ? '0.5px solid #f1f5f9' : 'none', borderTop: esTotal && i === arr.length - totales ? `1px solid ${C.ink}` : undefined }}>
                {fila.map((celda, j) => {
                  const polaridad = variaciones[j]
                  const color = polaridad
                    ? getColorVariacion({ variacion: celda, polaridad, texto: true })
                    : (j === 0 ? C.ink : C.inkMid)
                  return (
                    <td
                      key={j}
                      className={j === 0 ? undefined : 'tabular-nums'}
                      style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', textAlign: j === 0 ? 'left' : 'right', color, fontWeight: j === 0 || esTotal || polaridad ? 600 : 400, whiteSpace: j === 0 ? 'normal' : 'nowrap' }}
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">Ministerio de Seguridad Nacional · SNIC · Año 2025</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Delito en la Provincia de Buenos Aires, 2025
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}>
          La Provincia registró 775 víctimas de homicidio doloso en 2025, 45 menos que en 2024, y su tasa
          quedó en 4,4 cada 100.000 habitantes.{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>En los 24 partidos del Conurbano los homicidios
          casi no bajaron.</strong> El resto de los delitos se registró con sistemas nuevos y solo admite
          comparaciones entre territorios.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
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

        <div style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}>
          {[
            { label: 'Fuente',        val: 'SNIC-SAT, Ministerio de Seguridad Nacional' },
            { label: 'Universo',      val: 'Provincia de Buenos Aires y 24 partidos del Conurbano' },
            { label: 'Período',       val: '2025, con series desde 2016' },
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

function Tesis() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-10">
      <div style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '1.25rem' }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 2.6vw, 1.75rem)', fontWeight: 700, color: C.ink, lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: '0.75rem', maxWidth: 800 }}>
          La baja de los homicidios pasó por el interior y no llegó al Conurbano
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          De las 45 víctimas menos que contó la Provincia, <strong>35 corresponden a los partidos del
          interior</strong>. El Conurbano, con el 62% de la población, reúne el 77% de los homicidios y
          mantuvo su tasa prácticamente igual. El promedio provincial mejora y se acerca al mínimo de la
          serie, pero la distancia entre los dos territorios se agranda. Para la discusión sobre seguridad,
          el número que importa es el de los partidos donde la violencia letal se sostiene: el corredor
          noroeste y La Matanza.
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
        Los datos son los del Informe del Sistema Nacional de Información Criminal (SNIC) 2025 para la
        Provincia de Buenos Aires, publicado por la Dirección Nacional de Estadística Criminal del Ministerio
        de Seguridad Nacional en septiembre de 2026. El SNIC registra hechos presuntamente delictivos según
        las primeras actuaciones policiales y de los organismos que toman denuncias, no condenas.
      </p>
      <p style={p}>
        <strong style={{ color: C.ink }}>Conurbano y resto de la provincia.</strong> El Conurbano son los 24
        partidos del Gran Buenos Aires según el INDEC. El resto de la provincia es el total provincial menos
        esos 24 partidos, e incluye los hechos sin departamento determinado. Las tasas por partido son las que
        publica el SNIC, con proyecciones de población del INDEC basadas en el Censo 2022. Las tasas agregadas
        de los dos territorios son cálculo de DatosPBA: el informe no publica la población de cada partido, así
        que se la reconstruyó a partir de las cantidades y tasas publicadas. El resultado es un Conurbano de unos
        10,8 millones de habitantes, el 62% de la Provincia.
      </p>
      <p style={p}>
        <strong style={{ color: C.ink }}>Ruptura de serie.</strong> La Provincia cambió en 2025 sus sistemas
        de carga, cruzó información con la Procuración General y modificó la forma de consolidar hechos y
        víctimas. El informe oficial desaconseja comparar con años anteriores las categorías afectadas, sin
        detallar exactamente cuáles son. Por eso las variaciones 2024-2025 solo se usan para homicidios dolosos,
        que el SNIC releva caso por caso y contrasta con registros de prensa. Para el resto de los delitos, el
        informe compara territorios dentro de 2025.
      </p>
      <p style={p}>
        <strong style={{ color: C.ink }}>Pocos casos.</strong> Siguiendo al informe oficial, las variaciones
        sobre menos de 20 casos y las tasas de partidos con pocos hechos deben leerse con cautela. Por eso cada
        ranking muestra la cantidad junto a la tasa.
      </p>
      <p style={{ ...p, marginBottom: 0 }}>
        <strong style={{ color: C.ink }}>Observaciones sobre la fuente.</strong> Los 5.444 hechos de tenencia
        simple de estupefacientes figuran registrados en su totalidad por fuerzas federales y ninguno por la
        Policía provincial, algo poco verosímil dada su distribución territorial. El texto remite además a un
        anexo de rectificaciones que no está incluido. Ninguno de los dos puntos afecta los indicadores de este
        informe.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

const parrafo = { color: C.inkMid, maxWidth: '72ch' }

export default function InformeDelitoSNICPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* SERIE PROVINCIAL - texto y gráfico a dos columnas, tabla por territorio debajo */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="La tasa provincial de 4,4 es la segunda más baja desde 2016" />
        <div className="grid lg:grid-cols-2 gap-x-10 items-start">
          <div className="min-w-0">
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              En 2016 la Provincia contó 1.150 víctimas de homicidio doloso. Nueve años después la tasa es un
              35% menor y quedó una décima por encima del mínimo de 2022. El perfil de las víctimas no cambió:
              el 85,3% son varones.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              La mejora del último año fue muy desigual. En el resto de la provincia los homicidios cayeron
              16,4%. En el Conurbano bajaron 1,6%, diez víctimas menos sobre 607.
            </p>
            <p className="text-base leading-relaxed" style={{ color: C.inkMid }}>
              En 2024 la tasa del Conurbano era 1,8 veces la del resto de la provincia. En 2025 la duplicó.
            </p>
          </div>
          <div className="min-w-0">
            <DownloadableViz title="Tasa de homicidios dolosos - PBA, 2016-2025" fuente={FUENTE}>
              <ChartHomicidiosSerie />
            </DownloadableViz>
          </div>
        </div>
        <Tabla
          titulo="Víctimas de homicidios dolosos y tasa cada 100.000 habitantes, por territorio"
          head={['Territorio', 'Víctimas 2024', 'Víctimas 2025', 'Var. %', 'Tasa 2024', 'Tasa 2025']}
          filas={TERRITORIOS}
          variaciones={{ 3: 'menor-es-mejor' }}
          totales={1}
          minWidth={600}
        />
        <FichaTecnica items={[
          ['Fuente', 'SNIC-SAT 2025, tabla 5; agregados de DatosPBA'],
          ['Período', '2024 y 2025'],
          ['Universo', 'Conurbano: 24 partidos del GBA (INDEC)'],
          ['Unidad', 'víctimas y víctimas cada 100.000 hab.'],
        ]} />
      </div>

      {/* PARTIDOS - prosa, mapa y ranking lado a lado, tarjetas al final */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Dentro del Conurbano, la tasa va de 1,1 en Vicente López a 8,8 en General San Martín" />
          <p className="text-base leading-relaxed mb-3" style={parrafo}>
            General San Martín, Moreno, José C. Paz y La Matanza superan los 8 homicidios cada 100.000
            habitantes. Entre los cuatro suman 263 víctimas, el 44% del Conurbano, con cerca del 30% de su
            población. La Matanza sola aporta 149, una de cada cuatro.
          </p>
          <p className="text-base leading-relaxed" style={parrafo}>
            En el otro extremo, Vicente López, San Miguel, Ezeiza, Berazategui y Tigre están por debajo de
            2,5, menos que el promedio del interior. Con tan pocos casos, uno o dos hechos alcanzan para mover
            a un partido varios lugares: San Fernando tiene una tasa de 7,0 con 12 víctimas, y Vicente López
            y San Miguel registraron 3 y 4.
          </p>
          <DownloadableViz title="Tasa de homicidios dolosos por partido - Conurbano, 2025" fuente={FUENTE}>
            <MapaHomicidios />
          </DownloadableViz>
          <DownloadableViz title="Ranking de tasa de homicidios dolosos - Conurbano, 2025" fuente={FUENTE}>
            <ChartRanking
              col={2} colCant={1} dec={1}
              destacados={['General San Martín', 'Moreno', 'José C. Paz']}
              refValor={CONURBANO.hom} refLabel="Conurbano: 5,5"
              title="Tasa cada 100.000 habitantes y, entre paréntesis, víctimas, 2025"
              hallazgo="Gráfico de barras horizontales: General San Martín (8,8, 39 víctimas), Moreno (8,4, 48) y José C. Paz (8,3, 27) tienen las tasas de homicidio más altas del Conurbano, cuyo promedio es 5,5. Vicente López (1,1, 3 víctimas) tiene la más baja."
              tablaCols={['Tasa', 'Víctimas']}
              ficha={[
                ['Fuente', 'SNIC-SAT 2025, tabla 5'],
                ['Período', '2025'],
                ['Unidad', 'víctimas cada 100.000 hab.'],
              ]}
            />
          </DownloadableViz>
    </div>
      </div>

      {/* RUPTURA DE SERIE - prosa y una tabla sola */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Tres categorías perdieron más del 90% de sus registros entre 2023 y 2025" />
        <p className="text-base leading-relaxed mb-3" style={parrafo}>
          El cambio en los sistemas de carga de la Provincia se ve en los números antes que en la advertencia
          del informe oficial. Los delitos contra la seguridad pública rondaron los 25.000 hechos anuales entre
          2019 y 2023, y en 2025 fueron 1.948. En paralelo, los otros delitos previstos en leyes especiales se
          duplicaron y los robos agravados por lesiones o muerte se multiplicaron por 2,3.
        </p>
        <p className="text-base leading-relaxed" style={parrafo}>
          El patrón sugiere una reclasificación entre códigos. Los delitos contra el orden público cayeron en la
          misma proporción y ni siquiera figuran entre las categorías que el informe da por afectadas. Por
          eso, fuera de los homicidios, lo que sigue compara territorios dentro de 2025.
        </p>
        <Tabla
          titulo="Hechos registrados por año en categorías alcanzadas por el cambio de registro"
          head={['Categoría', '2016', '2019', '2023', '2024', '2025', 'Var. 2023-2025']}
          filas={RUPTURA}
          variaciones={{ 6: 'neutro' }}
          minWidth={720}
        />
        <FichaTecnica items={[
          ['Fuente', 'SNIC-SAT 2025, tablas 11, 63, 65, 73 y 109'],
          ['Período', '2016-2025'],
          ['Universo', 'Provincia de Buenos Aires'],
          ['Unidad', 'hechos; s/d: la serie empieza en 2017'],
        ]} />
      </div>

      {/* TENTATIVAS - gráfico a lo ancho y un párrafo */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="José C. Paz y Florencio Varela duplican la tasa de tentativas de homicidio del Conurbano" />
          <p className="text-base leading-relaxed" style={parrafo}>
            Hubo 840 víctimas de tentativa de homicidio en la Provincia, 520 de ellas en el Conurbano. La tasa
            es de 4,8 cada 100.000 habitantes en los dos territorios, así que la concentración de los homicidios
            consumados no se repite acá. Entre partidos la dispersión es mayor. La Matanza, cuarta en homicidios,
            queda en la mitad de abajo con 2,6. Las tasas más bajas, las de Vicente López, Morón y Hurlingham,
            se apoyan en 3 o 4 víctimas cada una.
          </p>
          <DownloadableViz title="Tasa de tentativas de homicidio por partido - Conurbano, 2025" fuente={FUENTE}>
            <ChartRanking
              col={4} colCant={3} dec={1}
              destacados={['José C. Paz', 'Florencio Varela']}
              refValor={CONURBANO.tent} refLabel="Conurbano: 4,8"
              title="Víctimas de homicidios dolosos en grado de tentativa cada 100.000 habitantes y, entre paréntesis, víctimas, 2025"
              hallazgo="Gráfico de barras horizontales: José C. Paz (11,6, 38 víctimas) y Florencio Varela (10,5, 52) tienen las tasas de tentativas de homicidio más altas del Conurbano, cuyo promedio es 4,8. Vicente López (1,1), Morón (1,2) y Hurlingham (1,6) tienen las más bajas."
              tablaCols={['Tasa', 'Víctimas']}
              ficha={[
                ['Fuente', 'SNIC-SAT 2025'],
                ['Período', '2025'],
                ['Universo', '24 partidos del Conurbano'],
                ['Unidad', 'víctimas cada 100.000 hab.'],
              ]}
            />
          </DownloadableViz>
        </div>
      </div>

      {/* ROBOS - dos columnas: gráfico y texto, tarjetas en el texto */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Morón, Lanús y General San Martín superan los 1.000 robos cada 100.000 habitantes" />
        <div className="grid lg:grid-cols-2 gap-x-10 items-start">
          <div className="min-w-0">
            <DownloadableViz title="Tasa de robos por partido - Conurbano, 2025" fuente={FUENTE}>
              <ChartRanking
                col={7} colCant={6} dec={1}
                destacados={['Morón', 'Lanús', 'General San Martín']}
                refValor={CONURBANO.robos} refLabel="Conurbano: 781"
                title="Hechos de robo cada 100.000 habitantes y, entre paréntesis, hechos, 2025"
                hallazgo="Gráfico de barras horizontales: Morón (1.140,9 robos cada 100.000 habitantes), Lanús (1.087,9) y General San Martín (1.006,1) tienen las tasas de robo más altas del Conurbano, cuyo promedio es 781. San Miguel (310,2) tiene la más baja."
                tablaCols={['Tasa', 'Hechos']}
                ficha={[
                  ['Fuente', 'SNIC-SAT 2025'],
                  ['Período', '2025'],
                  ['Unidad', 'hechos cada 100.000 hab.; incluye tentativas y robos agravados'],
                ]}
              />
            </DownloadableViz>
          </div>
          <div className="min-w-0">
            <p className="text-base leading-relaxed mb-4 lg:mt-5" style={{ color: C.inkMid }}>
              El Conurbano registró 84.284 robos en 2025, contando tentativas y robos agravados. Son el 71% del
              total provincial, con una tasa 50% más alta que la del resto de la provincia. Con los hurtos pasa
              al revés: el interior tiene más por habitante.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              La Matanza reúne 17.434 hechos, uno de cada cinco robos del Conurbano. En tasa, el mapa es distinto
              al de los homicidios. Morón y Lanús encabezan y los partidos del noroeste quedan en el medio.
            </p>
            <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid }}>
              Una tasa de robos alta puede reflejar más delito, más denuncias o las dos cosas, y la propensión a
              denunciar varía entre partidos. Los registros del Conurbano bajaron 15,7% contra 2024, un número
              que la ruptura de serie deja sin lectura firme.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <CifraCard label="Robos cada 100.000 hab., resto de la provincia" valor="520" polaridad="neutro" periodo="2025" />
              <CifraCard label="Hurtos cada 100.000 hab., Conurbano" valor="428" polaridad="neutro" periodo="2025; resto 501" />
            </div>
          </div>
        </div>
      </div>

      {/* CONURBANO VS. RESTO - tabla densa primero, prosa después */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Las muertes viales son tres veces más frecuentes en el interior que en el Conurbano" />
          <Tabla
            titulo="Tasas cada 100.000 habitantes por territorio, 2025"
            head={['Indicador', 'Conurbano, cantidad', 'Conurbano, tasa', 'Resto, tasa', 'Conurbano / resto']}
            filas={COMPARACION}
            minWidth={640}
          />
          <FichaTecnica items={[
            ['Fuente', 'SNIC-SAT 2025; agregados territoriales de DatosPBA'],
            ['Período', '2025'],
            ['Universo', 'víctimas o hechos, según el indicador'],
            ['Unidad', 'cada 100.000 habitantes; cociente en veces'],
          ]} />
          <p className="text-base leading-relaxed mt-6 mb-3" style={parrafo}>
            La comparación entre territorios de un mismo año no depende de la continuidad de la serie. El
            Conurbano solo supera al resto de la provincia con claridad en homicidios y robos. El interior registra
            más lesiones dolosas, abusos sexuales con acceso carnal, amenazas y hurtos por habitante.
          </p>
          <p className="text-base leading-relaxed" style={parrafo}>
            Las muertes en siniestros viales marcan la diferencia más grande de la tabla: 9,6 cada 100.000
            habitantes en el interior y 3,2 en el Conurbano. Fuera del Conurbano, morir en un siniestro vial es
            más de tres veces más frecuente que morir en un homicidio.
          </p>
        </div>
      </div>

      {/* LESIONES - prosa y gráfico a lo ancho */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Desde 2020, seis de cada diez víctimas de lesiones dolosas son mujeres" />
        <p className="text-base leading-relaxed" style={parrafo}>
          En 2025 hubo 75.807 víctimas de lesiones dolosas en la Provincia, 43.971 en el Conurbano. Hasta 2019
          la mayoría eran varones. El giro coincide con la pandemia y con la incorporación progresiva de
          denuncias tomadas por el Ministerio Público, entre ellas las de violencia de género. Es probable que
          refleje un cambio en qué se denuncia y se registra más que en la violencia misma, pero los datos
          disponibles no permiten confirmarlo.
        </p>
        <DownloadableViz title="Víctimas de lesiones dolosas según sexo - PBA, 2017-2025" fuente={FUENTE}>
          <ChartLesiones />
        </DownloadableViz>
      </div>

      {/* ANEXO - tabla por partido */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Los 24 partidos, indicador por indicador" />
          <p className="text-base leading-relaxed" style={parrafo}>
            Tasas cada 100.000 habitantes en 2025, en orden alfabético. La primera columna es la cantidad de
            víctimas de homicidio, para leer cada tasa con su base.
          </p>
          <Tabla
            head={['Partido', 'Homicidios (víctimas)', 'Homicidios', 'Tentativas', 'Lesiones dolosas', 'Robos', 'Hurtos', 'Muertes viales']}
            filas={[
              ...PARTIDOS.map(p => [p[0], fmtN(p[1]), fmtN(p[2], 1), fmtN(p[4], 1), fmtN(p[5]), fmtN(Math.round(p[7])), fmtN(p[8]), fmtN(p[9], 1)]),
              ['Conurbano', '597', '5,5', '4,8', '407', '781', '428', '3,2'],
              ['Provincia', '775', '4,4', '4,8', '435', '682', '456', '5,7'],
            ]}
            totales={2}
            minWidth={820}
          />
          <FichaTecnica items={[
            ['Fuente', 'SNIC-SAT 2025, tablas por departamento'],
            ['Período', '2025'],
            ['Universo', '24 partidos del Conurbano'],
            ['Unidad', 'cada 100.000 hab.; robos incluye tentativas y agravados, hurtos incluye tentativas'],
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
            Ministerio de Seguridad Nacional, Dirección Nacional de Estadística Criminal. Informe del Sistema
            Nacional de Información Criminal - Sistema Alerta Temprana (SNIC-SAT) 2025, Provincia de Buenos Aires
            (septiembre de 2026) · INDEC, proyecciones de población basadas en el Censo 2022 · Límites de partidos:
            repositorio departamentos_argentina · Elaboración propia DatosPBA · 2026
          </p>
          <a
            href="https://www.argentina.gob.ar/seguridad/estadisticascriminales"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            SNIC - Estadísticas criminales <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
