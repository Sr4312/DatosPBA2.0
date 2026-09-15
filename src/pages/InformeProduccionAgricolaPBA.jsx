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
  accent:   '#3d65b2',
}

// ─── DATOS ───────────────────────────────────────────────────

/* Cada cultivo lleva su propia ventana temporal: la fuente todavía no cerró
   2025/26 para la cosecha gruesa, y cebada arrastra un corte metodológico
   que deja solo 10 campañas comparables (ver <NotaMetodologica />). */

const SOJA = [
  ['General Villegas', 11238868, 4.78, 2836],
  ['Pergamino',         9893370, 4.21, 3671],
  ['9 de Julio',        8213484, 3.49, 3200],
  ['Lincoln',           7481668, 3.18, 2931],
  ['Rivadavia',         6937766, 2.95, 3130],
  ['Trenque Lauquen',   6613768, 2.81, 2870],
  ['Chacabuco',         6464067, 2.75, 3596],
  ['Rojas',             6287480, 2.67, 3666],
  ['Junín',             6123314, 2.60, 3482],
  ['Pehuajó',           6105297, 2.60, 2954],
  ['25 de Mayo',        5952254, 2.53, 2874],
  ['Salto',             5709101, 2.43, 3631],
  ['Bragado',           4934977, 2.10, 3130],
  ['General Arenales',  4877738, 2.07, 3564],
  ['Tandil',            4625134, 1.97, 2160],
]

const SOJA_PRIMERA = [
  ['General Villegas', 9416565, 4.97, 3007],
  ['Pergamino',        8692139, 4.59, 4015],
  ['9 de Julio',       6901138, 3.65, 3662],
  ['Lincoln',          6083346, 3.21, 3155],
  ['Rivadavia',        6031467, 3.19, 3307],
  ['Trenque Lauquen',  5460995, 2.88, 3057],
  ['Chacabuco',        5380505, 2.84, 3965],
  ['Rojas',            5062442, 2.67, 4062],
  ['Junín',            4871383, 2.57, 3905],
  ['Salto',            4845007, 2.56, 4057],
]

const SOJA_SEGUNDA = [
  ['General Villegas', 1822303, 3.98, 2191],
  ['Lobería',          1606652, 3.51, 1586],
  ['Necochea',         1442539, 3.15, 1417],
  ['Lincoln',          1398322, 3.06, 2239],
  ['Pehuajó',          1354931, 2.96, 2444],
  ['Tandil',           1326238, 2.90, 1572],
  ['9 de Julio',       1312347, 2.87, 1924],
  ['Junín',            1251931, 2.74, 2450],
  ['Rojas',            1225038, 2.68, 2612],
  ['Pergamino',        1201231, 2.62, 2267],
]

const MAIZ = [
  ['General Villegas', 10753449, 5.68, 7747],
  ['Trenque Lauquen',   9257761, 4.89, 7698],
  ['Rivadavia',         7836450, 4.14, 8047],
  ['Pehuajó',           7281555, 3.84, 7937],
  ['Lincoln',           6662001, 3.52, 8366],
  ['9 de Julio',        5559159, 2.93, 7968],
  ['Tres Arroyos',      4195452, 2.21, 6197],
  ['25 de Mayo',        4191280, 2.21, 7400],
  ['General Pinto',     3997337, 2.11, 8277],
  ['Pergamino',         3980053, 2.10, 8638],
  ['Carlos Tejedor',    3754274, 1.98, 7426],
  ['Rojas',             3723884, 1.97, 9070],
  ['Chacabuco',         3677704, 1.94, 8567],
  ['Bolívar',           3662593, 1.93, 7076],
  ['Junín',             3652892, 1.93, 8763],
]

const TRIGO = [
  ['Tres Arroyos',           6361215, 5.49, 4058],
  ['Coronel Dorrego',        4742049, 4.09, 3232],
  ['Coronel Suárez',         4332769, 3.74, 2869],
  ['Adolfo Alsina',          4024044, 3.47, 2782],
  ['Lobería',                3382728, 2.92, 4483],
  ['Coronel Pringles',       3377926, 2.91, 3351],
  ['General Villegas',       3060875, 2.64, 3310],
  ['Necochea',               2991728, 2.58, 4377],
  ['Tandil',                 2708721, 2.34, 4506],
  ['Adolfo Gonzales Chaves', 2677786, 2.31, 3760],
  ['Guaminí',                2577156, 2.22, 2903],
  ['Azul',                   2377982, 2.05, 4194],
  ['9 de Julio',             2370317, 2.04, 4104],
  ['Pehuajó',                2299877, 1.98, 4004],
  ['Pergamino',              2293847, 1.98, 4481],
]

const TRIGO_CANDEAL = [
  ['Coronel Dorrego',        846111, 26.10, 2919],
  ['Coronel Pringles',       413635, 12.76, 3170],
  ['Tres Arroyos',           323521,  9.98, 3773],
  ['Olavarría',              174750,  5.39, 3824],
  ['Coronel Suárez',         140374,  4.33, 2399],
  ['Adolfo Gonzales Chaves', 138271,  4.27, 3762],
  ['Tandil',                 116903,  3.61, 4513],
  ['Lobería',                107011,  3.30, 4209],
  ['Balcarce',               105389,  3.25, 4183],
  ['San Cayetano',           105334,  3.25, 3388],
]

const CEBADA = [
  ['Coronel Dorrego',        4319469, 10.26, 3673],
  ['Tres Arroyos',           3490364,  8.29, 4132],
  ['Necochea',               3072774,  7.30, 4058],
  ['Lobería',                2782125,  6.61, 4990],
  ['Tandil',                 2385961,  5.67, 4946],
  ['San Cayetano',           2067884,  4.91, 4010],
  ['Coronel Suárez',         1926872,  4.58, 3699],
  ['Azul',                   1504342,  3.57, 4740],
  ['Puán',                   1488584,  3.54, 3122],
  ['Benito Juárez',          1486465,  3.53, 4655],
  ['Adolfo Gonzales Chaves', 1455606,  3.46, 4058],
  ['Coronel Pringles',       1261108,  3.00, 3650],
  ['Balcarce',               1003597,  2.38, 5049],
  ['Saavedra',                880664,  2.09, 3186],
  ['Tornquist',               804950,  1.91, 2881],
]

const GIRASOL = [
  ['Necochea',          1996310, 6.72, 2220],
  ['Tres Arroyos',      1928936, 6.49, 2142],
  ['Lobería',           1721585, 5.79, 2246],
  ['Trenque Lauquen',   1494944, 5.03, 2408],
  ['Adolfo Alsina',     1439056, 4.84, 1987],
  ['Tandil',            1392464, 4.69, 2329],
  ['Balcarce',          1258630, 4.24, 2323],
  ['Guaminí',           1162708, 3.91, 2303],
  ['Pellegrini',        1052300, 3.54, 2309],
  ['Coronel Suárez',    1001309, 3.37, 1932],
  ['San Cayetano',       872386, 2.94, 2072],
  ['General Alvarado',   805622, 2.71, 2425],
  ['Ayacucho',           705955, 2.38, 2261],
  ['Tres Lomas',         668220, 2.25, 2365],
  ['Coronel Dorrego',    613571, 2.06, 1625],
]

const AVENA = [
  ['Tornquist',              571423, 8.43, 2413],
  ['Puán',                   534805, 7.89, 2153],
  ['Saavedra',               409743, 6.04, 2517],
  ['Coronel Suárez',         368593, 5.44, 2773],
  ['25 de Mayo',             306073, 4.51, 2893],
  ['Coronel Pringles',       276319, 4.08, 2310],
  ['Tres Arroyos',           276279, 4.08, 2806],
  ['General la Madrid',      262496, 3.87, 2717],
  ['Coronel Dorrego',        235540, 3.47, 2221],
  ['Adolfo Alsina',          208020, 3.07, 2360],
  ['Adolfo Gonzales Chaves', 161085, 2.38, 2337],
  ['Patagones',              143283, 2.11, 1018],
  ['Saladillo',              129747, 1.91, 2952],
  ['Guaminí',                120300, 1.77, 2392],
  ['Villarino',               99092, 1.46,  997],
]

const SORGO = [
  ['Adolfo Alsina',    562900, 9.20, 3866],
  ['Guaminí',          437070, 7.14, 4123],
  ['Pergamino',        323216, 5.28, 6370],
  ['Pellegrini',       186618, 3.05, 3964],
  ['General Villegas', 182153, 2.98, 4710],
  ['San Nicolás',      177693, 2.90, 5869],
  ['9 de Julio',       165453, 2.70, 6382],
  ['Lincoln',          151782, 2.48, 4913],
  ['Tres Lomas',       147055, 2.40, 4029],
  ['Saavedra',         127350, 2.08, 3025],
  ['Trenque Lauquen',  118780, 1.94, 5663],
  ['Rojas',            117126, 1.91, 5804],
  ['Salliqueló',       114613, 1.87, 3935],
  ['Junín',            112520, 1.84, 5502],
  ['Tornquist',        108725, 1.78, 2842],
]

/* Ventana, total provincial acumulado, municipios con registro y peso del
   top 15. El % del top 15 es el indicador de concentración territorial. */
const CULTIVOS = {
  soja:    { ventana: '2010/11 a 2024/25', total: 235200865, municipios: 103, top15: 43.14 },
  maiz:    { ventana: '2010/11 a 2024/25', total: 189477904, municipios: 103, top15: 43.37 },
  trigo:   { ventana: '2011/12 a 2025/26', total: 115910500, municipios: 103, top15: 42.77 },
  cebada:  { ventana: '2016/17 a 2025/26', total:  42091337, municipios: 101, top15: 71.11 },
  girasol: { ventana: '2010/11 a 2024/25', total:  29714845, municipios: 102, top15: 60.96 },
  avena:   { ventana: '2011/12 a 2025/26', total:   6779572, municipios: 103, top15: 60.52 },
  sorgo:   { ventana: '2010/11 a 2024/25', total:   6118411, municipios:  95, top15: 49.57 },
}

const FUENTE = 'Dirección de Estimaciones Agrícolas, Ministerio de Economía de la Nación'

/* Rankings de producción acumulada: sin variación interanual que valorar,
   así que todas las cifras van en polaridad neutra. */
const HERO_STATS = [
  { label: 'Soja acumulada en 15 campañas', valor: '235,2', unidad: 'millones de t', polaridad: 'neutro', periodo: 'campañas 2010/11 a 2024/25' },
  { label: 'General Villegas, primero en soja y en maíz', valor: '11,2', unidad: 'millones de t', polaridad: 'neutro', periodo: '4,78% del total provincial de soja' },
  { label: 'Tres Arroyos, primero en trigo', valor: '6,4', unidad: 'millones de t', polaridad: 'neutro', periodo: '5,49% del total provincial' },
  { label: 'Coronel Dorrego en trigo candeal', valor: '26,1%', polaridad: 'neutro', periodo: 'del total provincial en un solo municipio' },
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

const fmtT = v => v.toLocaleString('es-AR')

const fmtPct = v => `${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`

/* Miles de toneladas, redondeadas: la unidad del eje de los rankings. */
const enMiles = v => Math.round(v / 1000)

// ─── VALUE LABELS PLUGIN ─────────────────────────────────────

/* Barras horizontales: la etiqueta va al final de la barra, no arriba. */
const valueLabelsMiles = {
  id: 'valueLabelsMiles',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, di) => {
      const meta = chart.getDatasetMeta(di)
      meta.data.forEach((bar, i) => {
        ctx.save()
        ctx.fillStyle = '#334155'
        ctx.font = 'bold 11px Archivo, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(fmtT(dataset.data[i]), bar.x + 6, bar.y)
        ctx.restore()
      })
    })
  },
}

// ─── CHART ───────────────────────────────────────────────────

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 2 }

/* Un solo componente para los siete rankings: mismo formato, distintos datos.
   Toma los primeros 10 del top 15, que es lo que entra legible en el alto. */
function ChartRanking({ cultivo, filas, ventana, color = DATA[1] }) {
  const top10 = filas.slice(0, 10)
  const data = {
    labels: top10.map(f => f[0]),
    datasets: [{
      label: 'Producción acumulada',
      data: top10.map(f => enMiles(f[1])),
      backgroundColor: color,
      borderRadius: 0,
      maxBarThickness: 22,
    }],
  }
  return (
    <ChartCard
      title={`${cultivo}: primeros 10 municipios por producción acumulada (${ventana}, en miles de toneladas)`}
      hallazgo={`Gráfico de barras horizontales: ${top10[0][0]} encabeza el ranking de ${cultivo.toLowerCase()} con ${fmtT(enMiles(top10[0][1]))} miles de toneladas acumuladas, el ${fmtPct(top10[0][2])} del total provincial.`}
      tabla={{
        columnas: ['Municipio', 'Miles de toneladas', '% del total provincial'],
        filas: top10.map(f => [f[0], fmtT(enMiles(f[1])), fmtPct(f[2])]),
      }}
      ficha={[
        ['Fuente', FUENTE],
        ['Período', `campañas ${ventana}`],
        ['Universo', 'municipios de la provincia de Buenos Aires'],
        ['Unidad', 'miles de toneladas acumuladas'],
      ]}
      height={320}
    >
      <Bar
        data={data}
        plugins={[valueLabelsMiles]}
        options={{
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 56 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtT(ctx.raw)} miles de toneladas` } },
          },
          scales: {
            x: { min: 0, ticks: { display: false }, grid: { color: 'rgba(13,17,23,0.08)' }, border: { display: false } },
            y: { grid: { display: false }, border: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

// ─── TABLA ───────────────────────────────────────────────────

function TablaRanking({ filas, titulo }) {
  const head = ['#', 'Municipio', 'Producción acumulada (t)', '% del total provincial', 'Rendimiento promedio (kg/ha)']
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
      {titulo && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', padding: '1rem 1rem 0' }}>{titulo}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map((h, i) => (
              <th key={i} style={{ textAlign: i <= 1 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map(([municipio, produccion, pct, rinde], i, arr) => (
            <tr key={municipio} style={{ borderBottom: i < arr.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkLight }}>{i + 1}</td>
              <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{municipio}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtT(produccion)}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtPct(pct)}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtT(rinde)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function fichaCultivo(ventana) {
  return [
    ['Fuente', FUENTE],
    ['Período', `campañas ${ventana}`],
    ['Universo', 'municipios de la provincia de Buenos Aires'],
    ['Unidad', 'toneladas acumuladas, % y kg/ha'],
  ]
}

// ─── HERO ────────────────────────────────────────────────────

function Hero() {
  return (
    <div style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-12">
        <Link to="/informes" className="inline-flex items-center gap-1.5 text-sm no-underline mb-10" style={{ color: 'rgba(255,255,255,0.62)' }}>
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <SectionLabel dark color="rgba(255,255,255,0.62)">Estimaciones Agrícolas · Producción · Agosto 2026</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Producción agrícola en la<br />
          Provincia de Buenos Aires
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          Quince campañas de soja, maíz, trigo, cebada, girasol, avena y sorgo en los 135 municipios
          bonaerenses, ordenadas por producción acumulada.{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Los cultivos de verano mandan en el noroeste
          y los de invierno en el sudeste</strong>, un patrón que no se movió en todo el período.
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
            { label: 'Fuente',        val: 'Dir. de Estimaciones Agrícolas - Nación' },
            { label: 'Universo',      val: '135 municipios bonaerenses' },
            { label: 'Período',       val: 'Últimas 15 campañas por cultivo' },
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
          La Provincia tiene dos agros, y cada uno ocupa su propia mitad del mapa
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          Soja y maíz se concentran en el noroeste - General Villegas encabeza los dos rankings - mientras
          que trigo, cebada, girasol y avena tienen su eje en el sudeste y el sur, con Tres Arroyos, Coronel
          Dorrego, Necochea y Lobería repitiéndose campaña tras campaña. Lo que cambia entre cultivos no es
          tanto el mapa como cuán apretado está: el top 15 explica el{' '}
          <strong>60,96% del girasol</strong> pero apenas el 42,77% del trigo.
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
        La ventana no es la misma para todos los cultivos porque la campaña 2025/26 todavía no está
        cerrada. Los de cosecha gruesa (soja, maíz, girasol, sorgo) van de 2010/11 a 2024/25; los de
        cosecha fina (trigo, cebada, avena), de 2011/12 a 2025/26.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        <strong style={{ color: C.ink }}>Cebada es la excepción y corre sobre 10 campañas, no 15.</strong>{' '}
        La fuente relevó cebada abierta en cervecera y forrajera hasta 2015/16, y desde 2016/17 publica
        solo "cebada total". Forzar una ventana de 15 años mezclaría dos metodologías de relevamiento
        distintas, así que el ranking de cebada usa 2016/17 a 2025/26. Eso también explica por qué su
        concentración (71,11% en el top 15) no es comparable en forma directa con la del resto.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        Los municipios se ordenan por producción acumulada en toda la ventana, no por promedio anual. El
        rendimiento es un promedio ponderado - producción acumulada sobre superficie cosechada acumulada -
        y no el promedio simple de los rindes anuales. Los nombres de municipio se normalizaron por
        identificador censal (Indec, Censo Nacional 2010), porque la fuente alterna variantes de tildado y
        mayúsculas para un mismo partido según el año. Quedan fuera del informe los cultivos de escala
        marginal en la Provincia (arveja, maní, centeno, alpiste, colza, mijo, lenteja, poroto, garbanzo,
        cártamo y lino) y los que no registran datos en los últimos 15 años (ajo, cebolla, cítricos y papa).
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeProduccionAgricolaPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* SOJA */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Soja: el mayor volumen de la Provincia, con el noroeste al frente" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          La soja es el cultivo de mayor volumen de producción bonaerense: entre 2010/11 y 2024/25 la
          Provincia acumuló 235.200.865 toneladas repartidas entre 103 municipios con registro. General
          Villegas encabeza el ranking con 11,2 millones de toneladas, el 4,78% del total provincial,
          seguido por Pergamino, 9 de Julio, Lincoln y Rivadavia. Los cinco primeros son partidos del
          noroeste y todos tienen las 15 campañas completas.
        </p>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El top 15 reúne el 43,14% de la producción provincial, una concentración moderada: el resto se
          reparte entre un número amplio de municipios. Los rendimientos del ranking se mueven en una banda
          ancha, de 2.160 kg/ha en Tandil a 3.671 kg/ha en Pergamino, lo que muestra que el volumen
          acumulado depende tanto de la superficie sembrada como del rinde.
        </p>
        <DownloadableViz title="Soja - primeros 10 municipios productores, campañas 2010/11 a 2024/25" fuente={FUENTE}>
          <ChartRanking cultivo="Soja" filas={SOJA} ventana={CULTIVOS.soja.ventana} />
        </DownloadableViz>
        <TablaRanking filas={SOJA} titulo="Soja: top 15 municipios productores (2010/11 a 2024/25)" />
        <FichaTecnica items={fichaCultivo(CULTIVOS.soja.ventana)} />
      </div>

      {/* SOJA POR TIPO DE OCUPACIÓN */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Dentro de la soja conviven dos geografías distintas" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La apertura por tipo de ocupación separa dos cultivos que el agregado esconde. La soja de
            primera repite el patrón general y la lideran los partidos del noroeste. La de segunda, que se
            siembra después de cosechar un cultivo de invierno en el mismo ciclo, tiene su liderazgo en el
            sudeste triguero: Lobería, Necochea y Tandil aparecen arriba, y son la huella del doble cultivo
            trigo-soja en esa región.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5" style={{ maxWidth: 560 }}>
            <CifraCard label="Lobería en soja de segunda" valor="3,51%" polaridad="neutro" periodo="segundo puesto; no entra al top 15 de soja total" />
            <CifraCard label="Rinde de la soja de segunda en Necochea" valor="1.417" unidad="kg/ha" polaridad="neutro" periodo="frente a 4.062 kg/ha de la de primera en Rojas" />
          </div>
          <TablaRanking filas={SOJA_PRIMERA} titulo="Soja de primera ocupación: top 10 municipios productores (2010/11 a 2024/25)" />
          <FichaTecnica items={fichaCultivo(CULTIVOS.soja.ventana)} />
          <TablaRanking filas={SOJA_SEGUNDA} titulo="Soja de segunda ocupación: top 10 municipios productores (2010/11 a 2024/25)" />
          <FichaTecnica items={fichaCultivo(CULTIVOS.soja.ventana)} />
        </div>
      </div>

      {/* MAÍZ */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Maíz: la misma geografía que la soja, con rindes muy superiores" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El maíz acumuló 189.477.904 toneladas entre 2010/11 y 2024/25, también con 103 municipios
          productores. El ranking repite en gran medida el mapa de la soja: General Villegas vuelve a
          encabezarlo, ahora con 10,8 millones de toneladas y el 5,68% del total, seguido por Trenque
          Lauquen, Rivadavia, Pehuajó y Lincoln.
        </p>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Lo que separa a los dos cultivos no es dónde se producen sino cuánto rinden: los promedios
          ponderados del top 15 de maíz se mueven entre 6.197 y 9.070 kg/ha, más del doble que los de soja,
          en línea con el mayor potencial de rinde del cultivo. La concentración es casi idéntica: 43,37%
          contra 43,14%.
        </p>
        <DownloadableViz title="Maíz - primeros 10 municipios productores, campañas 2010/11 a 2024/25" fuente={FUENTE}>
          <ChartRanking cultivo="Maíz" filas={MAIZ} ventana={CULTIVOS.maiz.ventana} color={DATA[2]} />
        </DownloadableViz>
        <TablaRanking filas={MAIZ} titulo="Maíz: top 15 municipios productores (2010/11 a 2024/25)" />
        <FichaTecnica items={fichaCultivo(CULTIVOS.maiz.ventana)} />
      </div>

      {/* TRIGO */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Trigo: el eje se corre al sudeste y la concentración baja" />
          <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Con 115.910.500 toneladas acumuladas entre 2011/12 y 2025/26, el trigo es el principal cultivo
            de invierno de la Provincia y el primero cuyo mapa se corre del noroeste. Tres Arroyos lidera
            con 6,4 millones de toneladas y el 5,49% del total provincial, seguido por Coronel Dorrego,
            Coronel Suárez, Adolfo Alsina y Lobería: todos partidos del sudeste y el sur.
          </p>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Es además el cultivo menos concentrado de los siete: el top 15 explica el 42,77% de la
            producción provincial. General Villegas, el primero de los rankings de verano, aparece acá
            séptimo - una señal de que los partidos del noroeste también siembran trigo, pero sin dominar.
          </p>
          <DownloadableViz title="Trigo - primeros 10 municipios productores, campañas 2011/12 a 2025/26" fuente={FUENTE}>
            <ChartRanking cultivo="Trigo" filas={TRIGO} ventana={CULTIVOS.trigo.ventana} />
          </DownloadableViz>
          <TablaRanking filas={TRIGO} titulo="Trigo: top 15 municipios productores (2011/12 a 2025/26)" />
          <FichaTecnica items={fichaCultivo(CULTIVOS.trigo.ventana)} />
        </div>
      </div>

      {/* TRIGO CANDEAL */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="El trigo candeal es otra cosa: un cuarto del total en un solo municipio" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El candeal, destinado sobre todo a la industria de la pastificación, es de escala muy inferior al
          trigo pan y está mucho más concentrado. Coronel Dorrego reúne por sí solo el 26,10% de la
          producción provincial acumulada, seguido por Coronel Pringles (12,76%) y Tres Arroyos (9,98%):
          entre tres municipios explican casi la mitad del candeal bonaerense. Solo 58 de los 135
          municipios registraron producción en la ventana, contra 103 en trigo total.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5" style={{ maxWidth: 560 }}>
          <CifraCard label="Coronel Dorrego en trigo candeal" valor="26,10%" polaridad="neutro" periodo="del total provincial acumulado" />
          <CifraCard label="Municipios con producción de candeal" valor="58" unidad="de 135" polaridad="neutro" periodo="contra 103 en trigo total" />
        </div>
        <TablaRanking filas={TRIGO_CANDEAL} titulo="Trigo candeal: top 10 municipios productores (2011/12 a 2025/26)" />
        <FichaTecnica items={fichaCultivo(CULTIVOS.trigo.ventana)} />
      </div>

      {/* CEBADA */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Cebada: el mapa del trigo, pero mucho más apretado" />
          <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La cebada acumuló 42.091.337 toneladas entre 2016/17 y 2025/26 - una ventana de 10 campañas y no
            de 15, por el corte metodológico que se detalla en la nota al pie - con 101 municipios
            productores. Coronel Dorrego encabeza con 4,3 millones de toneladas y el 10,26% del total,
            seguido por Tres Arroyos, Necochea, Lobería y Tandil.
          </p>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Su geografía coincide casi punto por punto con la del trigo, pero la concentración es de otro
            orden: el top 15 acumula el 71,11% de la producción provincial, el valor más alto de los siete
            cultivos. Parte de esa diferencia es real y parte se explica por la ventana más corta, así que
            no conviene compararla en forma directa con el 42,77% del trigo.
          </p>
          <DownloadableViz title="Cebada - primeros 10 municipios productores, campañas 2016/17 a 2025/26" fuente={FUENTE}>
            <ChartRanking cultivo="Cebada" filas={CEBADA} ventana={CULTIVOS.cebada.ventana} color={DATA[2]} />
          </DownloadableViz>
          <TablaRanking filas={CEBADA} titulo="Cebada: top 15 municipios productores (2016/17 a 2025/26)" />
          <FichaTecnica items={fichaCultivo(CULTIVOS.cebada.ventana)} />
        </div>
      </div>

      {/* GIRASOL */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Girasol: el cultivo más concentrado, entre el sudeste y el oeste semiárido" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Entre 2010/11 y 2024/25 el girasol sumó 29.714.845 toneladas con 102 municipios productores.
          Necochea lidera con 1,99 millones de toneladas y el 6,72% del total, seguido de cerca por Tres
          Arroyos y Lobería, los tres en el sudeste bonaerense.
        </p>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Detrás aparecen Trenque Lauquen y Adolfo Alsina, ya en la región semiárida del oeste, donde el
          girasol funciona como alternativa frente a cultivos de mayor requerimiento hídrico. Es el cultivo
          con mayor concentración territorial de los siete sobre ventana completa de 15 campañas: el top 15
          reúne el 60,96% de la producción provincial.
        </p>
        <DownloadableViz title="Girasol - primeros 10 municipios productores, campañas 2010/11 a 2024/25" fuente={FUENTE}>
          <ChartRanking cultivo="Girasol" filas={GIRASOL} ventana={CULTIVOS.girasol.ventana} />
        </DownloadableViz>
        <TablaRanking filas={GIRASOL} titulo="Girasol: top 15 municipios productores (2010/11 a 2024/25)" />
        <FichaTecnica items={fichaCultivo(CULTIVOS.girasol.ventana)} />
      </div>

      {/* AVENA Y SORGO */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Avena y sorgo: los dos cultivos chicos tienen sus propios mapas" />
          <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La avena acumuló 6.779.572 toneladas entre 2011/12 y 2025/26 con 103 municipios productores. Su
            foco no es el núcleo triguero del sudeste sino el sudoeste bonaerense: Tornquist, Puán y
            Saavedra encabezan el ranking, una región de condiciones agroecológicas distintas. El top 15
            concentra el 60,52%, casi tanto como el girasol.
          </p>
          <DownloadableViz title="Avena - primeros 10 municipios productores, campañas 2011/12 a 2025/26" fuente={FUENTE}>
            <ChartRanking cultivo="Avena" filas={AVENA} ventana={CULTIVOS.avena.ventana} color={DATA[2]} />
          </DownloadableViz>
          <TablaRanking filas={AVENA} titulo="Avena: top 15 municipios productores (2011/12 a 2025/26)" />
          <FichaTecnica items={fichaCultivo(CULTIVOS.avena.ventana)} />
          <p className="text-base leading-relaxed mt-6 mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El sorgo es el de menor volumen absoluto de los siete: 6.118.411 toneladas entre 2010/11 y
            2024/25, con 95 municipios productores, el universo más chico del informe. Cultivo de verano con
            buena tolerancia a la menor disponibilidad hídrica, se concentra en el oeste y el noroeste:
            Adolfo Alsina y Guaminí, sobre el límite con La Pampa, encabezan el ranking, seguidos por
            Pergamino - que aporta además el mejor rinde del top 15, 6.370 kg/ha. El top 15 acumula el
            49,57% de la producción provincial.
          </p>
          <DownloadableViz title="Sorgo - primeros 10 municipios productores, campañas 2010/11 a 2024/25" fuente={FUENTE}>
            <ChartRanking cultivo="Sorgo" filas={SORGO} ventana={CULTIVOS.sorgo.ventana} />
          </DownloadableViz>
          <TablaRanking filas={SORGO} titulo="Sorgo: top 15 municipios productores (2010/11 a 2024/25)" />
          <FichaTecnica items={fichaCultivo(CULTIVOS.sorgo.ventana)} />
        </div>
      </div>

      {/* CIERRE */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Qué queda del relevamiento" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Quince años de datos confirman una geografía productiva estable y bien diferenciada. Los cultivos
          de verano tienen su núcleo en el noroeste, con General Villegas, Pergamino, 9 de Julio, Lincoln,
          Trenque Lauquen y Rivadavia repitiéndose entre los primeros puestos de soja y maíz. Los de
          invierno y el girasol se concentran en el sudeste y el sur, con Tres Arroyos, Coronel Dorrego,
          Coronel Suárez, Necochea, Lobería y Tandil como protagonistas recurrentes.
        </p>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Las aperturas por tipo de producción muestran que dentro de un mismo cultivo pueden convivir
          patrones distintos: la soja de segunda pesa más en el sudeste que la de primera, y el candeal está
          concentrado en un puñado de municipios donde el trigo pan está disperso. El nivel de concentración
          es lo que más varía entre cultivos - alto en girasol (60,96%) y avena (60,52%), moderado en soja
          (43,14%), maíz (43,37%) y trigo (42,77%) - y marca cuáles dependen de unos pocos partidos y cuáles
          se reparten entre muchos. Un análisis complementario sobre la evolución interanual de superficie y
          rendimiento en estos mismos municipios permitiría leer las tendencias recientes, que este corte
          acumulado no captura.
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
            Ministerio de Economía de la Nación, Secretaría de Agricultura, Ganadería y Pesca, Dirección
            Nacional de Agricultura, Dirección de Estimaciones Agrícolas. "Estimaciones agrícolas", serie
            histórica por campaña y municipio, campañas 1969/70 a 2025/26, publicada en el Catálogo de Datos
            Abiertos de la Provincia de Buenos Aires. Fecha de actualización de la fuente: 2 de julio de
            2026 · Indec, Censo Nacional 2010, para la normalización de nombres de municipio · Elaboración
            propia DatosPBA · 2026
          </p>
          <a
            href="https://catalogo.datos.gba.gob.ar/dataset/estimaciones-agricolas"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Catálogo de Datos Abiertos PBA - Estimaciones agrícolas <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <br />
          <a
            href="https://www.magyp.gob.ar/sitio/areas/estimaciones/"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-2"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Dirección de Estimaciones Agrícolas - Nación <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
