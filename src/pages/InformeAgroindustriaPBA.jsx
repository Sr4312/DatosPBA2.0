import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA, DATA_BORDES } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, ArcElement, Tooltip, Legend)
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

const B = {
  700: '#152952',
  600: '#1a3d7c',
  500: '#1f4795',
  400: '#3d65b2',
  300: '#6a8bca',
  200: '#a1b4e0',
  100: '#d0daf0',
  50:  '#edf1f8',
}

// ─── DATOS ───────────────────────────────────────────────────

const PRODUCCION_CULTIVOS = [
  { label: 'Cebada',  value: 93.1 },
  { label: 'Girasol', value: 56   },
  { label: 'Trigo',   value: 49.5 },
  { label: 'Soja',    value: 33.1 },
  { label: 'Maíz',    value: 28.9 },
]

const EMPLEO_POR_HA = [
  { label: 'Bajo cubierta', value: 1209, tipo: 'intensivo' },
  { label: 'Porcinos',      value: 46,   tipo: 'intensivo' },
  { label: 'Soja',          value: 11,   tipo: 'extensivo' },
  { label: 'Trigo',         value: 8,    tipo: 'extensivo' },
  { label: 'Maíz',          value: 6,    tipo: 'extensivo' },
]

const TIERRA_GRUPOS = [
  { label: 'Grandes (+1.000 ha)',     eap: 16, sup: 66.5 },
  { label: 'Medianas (100–1.000 ha)', eap: 54, sup: 31.7 },
  { label: 'Pequeñas (−100 ha)',      eap: 30, sup: 1.8  },
]

const EAP_EVOLUCION = [
  { year: '1988', eap: 75531 },
  { year: '2002', eap: 51116 },
  { year: '2018', eap: 36700 },
]

/* Colores categóricos (participación por complejo, no valoración): los cuatro
   complejos principales usan la paleta DATA; los menores y "Resto", neutros. */
const EXPORTACIONES = [
  { label: 'Soja y subprod.',  value: 29, color: DATA[1] },
  { label: 'Maíz',             value: 14, color: DATA[2] },
  { label: 'Bovinos',          value: 9,  color: DATA[3] },
  { label: 'Trigo',            value: 8,  color: DATA[4] },
  { label: 'Pesquero',         value: 4,  color: '#64748b' },
  { label: 'Girasol',          value: 4,  color: '#94a3b8' },
  { label: 'Lácteos / cebada', value: 5,  color: '#cbd5e1' },
  { label: 'Resto',            value: 27, color: '#e2e8f0' },
]

/* Cifras de nivel sin variación: el contexto va en `periodo` y el color del
   valor lo pone <Cifra> (blanco sobre el hero), nunca la posición. */
const HERO_STATS = [
  { valor: '26%',   periodo: 'de la producción agroindustrial nacional' },
  { valor: '35%',   periodo: 'de las exportaciones totales del país' },
  { valor: '4,2 M', periodo: 'puestos de trabajo generados (2023)' },
  { valor: '61%',   periodo: 'de las exportaciones son agroindustriales' },
]

/* Acentos puramente categóricos (dimensión del desafío, no valoración):
   se mapean a la paleta DATA vía DATA_BORDES (variantes AA sobre blanco). */
const DESAFIOS = [
  {
    icon: '🏛️', color: DATA_BORDES[1], variant: 'data1',
    title: 'Presión fiscal y retenciones', tag: 'Político',
    body: 'Argentina mantiene retenciones a las exportaciones agropecuarias que no tienen equivalente en los principales competidores globales. Aunque el gobierno Milei las redujo (soja de 26% a 24%; trigo de 9,5% a 7,5% en dic. 2025), el reclamo histórico del sector es su eliminación total. El costo fiscal acumulado en más de 20 años se estima en USD 209.000 millones según la SRA.',
  },
  {
    icon: '👷', color: DATA_BORDES[1], variant: 'data1',
    title: 'Generación de empleo insuficiente', tag: 'Social',
    body: 'El modelo extensivo de commodities -soja, trigo, maíz- genera muy poco empleo por hectárea (6–11 personas/1.000 ha) en comparación con la horticultura intensiva (1.209 personas/1.000 ha). La concentración de la tierra y la mecanización agudizaron la expulsión de trabajadores rurales: un 18,5% menos de permanentes entre 2008 y 2018.',
  },
  {
    icon: '🌱', color: DATA_BORDES[2], variant: 'data2',
    title: 'Impacto ambiental y agroquímicos', tag: 'Ambiental',
    body: 'Argentina registra la tasa más alta del mundo en uso de plaguicidas: 12 litros por habitante por año. En Buenos Aires, la soja demandaba el 46% del total de plaguicidas utilizados. Sólo 71 de los 135 municipios cuentan con ordenanzas que regulan distancias de aplicación; 28 no tienen regulación alguna.',
  },
  {
    icon: '📐', color: DATA_BORDES[2], variant: 'data2',
    title: 'Concentración de la tierra y escala', tag: 'Estructural',
    body: 'El 16% de las EAP controla el 66,5% de la superficie bonaerense. Esta concentración limita el acceso a la tierra para nuevos productores, empuja a la informalidad y dificulta políticas de diversificación productiva. El número de EAP cayó un 51% entre 1988 y 2018.',
  },
  {
    icon: '🌦️', color: DATA_BORDES[3], variant: 'data3',
    title: 'Vulnerabilidad climática y sequía', tag: 'Productivo',
    body: 'La dependencia de las lluvias es estructural en la Pampa Bonaerense. La sequía de 2022/23 redujo las exportaciones agroindustriales en un 36%, golpeando fuertemente al sector. El cambio climático amenaza con volver más frecuentes estos eventos extremos, sin mecanismos de cobertura suficientemente desarrollados para pequeños y medianos productores.',
  },
  {
    icon: '🔄', color: DATA_BORDES[1], variant: 'data1',
    title: 'Escasa diversificación productiva', tag: 'Estratégico',
    body: 'La hegemonía de cuatro commodities (soja, maíz, trigo, girasol) hace al sector muy dependiente de los ciclos de precios internacionales. La horticultura, a pesar de abastecer de alimentos frescos a las grandes ciudades, representaba apenas el 0,2% de la superficie cultivada provincial según el CNA 2018.',
  },
]

const RECOMENDACIONES = [
  {
    num: 'Recomendación 1 · Fiscal',
    title: 'Continuar la reducción gradual y predecible de retenciones',
    body: 'La eliminación progresiva de los derechos de exportación -especialmente para los complejos con mayor generación de empleo en origen, como trigo y cebada- debe estar acompañada de mecanismos de compensación fiscal. La previsibilidad de reglas es tan importante como el nivel de la alícuota.',
  },
  {
    num: 'Recomendación 2 · Tierras',
    title: 'Políticas de acceso a la tierra para pequeños y medianos productores',
    body: 'La concentración extrema del suelo bonaerense requiere políticas activas: catastros actualizados, impuesto progresivo a la tierra ociosa o subutilizada, y programas de crédito para pequeños productores familiares y cooperativas de la economía social.',
  },
  {
    num: 'Recomendación 3 · Ambiental',
    title: 'Marco regulatorio provincial unificado para agroquímicos',
    body: 'La ausencia de regulación en 28 municipios bonaerenses es una brecha grave. La Provincia debe avanzar en un marco normativo mínimo unificado que establezca zonas de exclusión alrededor de centros urbanos, escuelas rurales y cursos de agua.',
  },
  {
    num: 'Recomendación 4 · Empleo',
    title: 'Fomentar la intensificación productiva y la horticultura',
    body: 'Dado el diferencial en generación de empleo (1.209 vs. 6 puestos por 1.000 ha), la política provincial debería incentivar la transición hacia producciones intensivas: horticultura, fruticultura, porcicultura y producción bajo cubierta, con acceso a crédito y mercados de proximidad.',
  },
  {
    num: 'Recomendación 5 · Sustentabilidad',
    title: 'Escalar el programa de agroecología y transición productiva',
    body: 'El registro voluntario de productores agroecológicos de PBA (321 productores, 23.000 ha) debe escalarse con incentivos concretos: desgravaciones impositivas, primas de precio y acceso preferencial a mercados públicos, articulando con la UTT y otras organizaciones del sector.',
  },
  {
    num: 'Recomendación 6 · Riesgo climático',
    title: 'Ampliar los instrumentos de gestión del riesgo climático',
    body: 'Los seguros agrícolas y los fondos de emergencia agropecuaria deben llegar a los pequeños y medianos productores que hoy no acceden a ellos. La Provincia puede articular con Nación para ampliar la cobertura de seguros multi-riesgo subsidiados.',
  },
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
      <div ref={ref} style={{ background: 'var(--c-bg)' }}>
        {children}
      </div>
      <button
        onClick={handleDownload}
        disabled={busy}
        style={{
          background: 'none', border: 'none', padding: 0, marginTop: 8,
          fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-ink-mid)',
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
    <div style={{ borderBottom: `2px solid ${C.ink}`, paddingBottom: '0.75rem', marginBottom: '1.75rem', marginTop: '3rem' }}>
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

function ChartCard({ title, fuente, legend, height = 220, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, padding: '1.25rem 1.25rem 0.875rem', margin: '1.25rem 0' }}>
      {title && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>{title}</p>}
      {legend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '0.625rem' }}>
          {legend.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              {l.label}
            </div>
          ))}
        </div>
      )}
      <div style={{ position: 'relative', height }}>{children}</div>
      {fuente && (
        <div style={{ borderTop: '1px solid var(--c-rule)', marginTop: '0.75rem', paddingTop: '0.625rem' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--c-ink-light)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Fuente y período</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--c-ink-mid)' }}>{fuente}</span>
        </div>
      )}
    </div>
  )
}

function Tag({ children, variant = 'data1' }) {
  const s = {
    data1: { background: `${DATA[1]}1a`, color: DATA_BORDES[1] },
    data2: { background: `${DATA[2]}1a`, color: DATA_BORDES[2] },
    data3: { background: `${DATA[3]}1a`, color: DATA_BORDES[3] },
    data4: { background: `${DATA[4]}14`, color: DATA_BORDES[4] },
  }
  return (
    <span style={{ ...s[variant], display: 'inline-flex', alignItems: 'center', fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '0.3rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

// ─── CHART COMPONENTS ────────────────────────────────────────

function ChartParticipacion() {
  const data = {
    labels: PRODUCCION_CULTIVOS.map(d => d.label),
    datasets: [{
      data: PRODUCCION_CULTIVOS.map(d => d.value),
      backgroundColor: DATA[1],
      borderRadius: 4, barPercentage: 0.65,
    }],
  }
  return (
    <ChartCard
      title="Participación de Buenos Aires en producción nacional por cultivo (promedio 2009/10–2018/19)"
      fuente="CNA 2018 · Ministerio de Desarrollo Agrario PBA · Agencia Tierra Viva (2022)"
      height={210}
    >
      <Bar data={data} options={{
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw}%` } } },
        scales: { x: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' }}, y: { grid: { display: false } } },
      }} />
    </ChartCard>
  )
}

const valueLabelsPlugin = {
  id: 'valueLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, di) => {
      chart.getDatasetMeta(di).data.forEach((bar, i) => {
        const v = dataset.data[i]
        const label = v >= 1000 ? v.toLocaleString('es-AR') : String(v)
        ctx.save()
        ctx.fillStyle = '#334155'
        ctx.font = 'bold 11px Archivo, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(label, bar.x, bar.y - 7)
        ctx.restore()
      })
    })
  },
}

function ChartEmpleoPorHa() {
  const data = {
    labels: EMPLEO_POR_HA.map(d => d.label),
    datasets: [{
      data: EMPLEO_POR_HA.map(d => d.value),
      backgroundColor: EMPLEO_POR_HA.map(d => d.tipo === 'intensivo' ? DATA[1] : DATA[2]),
      borderRadius: 4, barPercentage: 0.6,
    }],
  }
  return (
    <ChartCard
      title="Empleos por cada 1.000 hectáreas según tipo de producción"
      fuente="Gobierno PBA / OIT (en Agencia Tierra Viva, 2022)"
      legend={[{ label: 'Intensivos / diversificados', color: DATA[1] }, { label: 'Extensivos / commodities', color: DATA[2] }]}
      height={260}
    >
      <Bar
        data={data}
        plugins={[valueLabelsPlugin]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 20 } },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR')} empleos / 1.000 ha` } },
          },
          scales: {
            y: {
              type: 'logarithmic',
              ticks: {
                callback: v => [1, 10, 100, 1000].includes(v) ? (v >= 1000 ? v / 1000 + 'K' : v) : '',
              },
              grid: { color: 'rgba(13,17,23,0.08)' },
            },
            x: { grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartTierra() {
  const data = {
    labels: TIERRA_GRUPOS.map(d => d.label),
    datasets: [
      { label: '% de EAP',        data: TIERRA_GRUPOS.map(d => d.eap), backgroundColor: DATA[2], borderRadius: 4, barPercentage: 0.5 },
      { label: '% de superficie', data: TIERRA_GRUPOS.map(d => d.sup), backgroundColor: DATA[1], borderRadius: 4, barPercentage: 0.5 },
    ],
  }
  return (
    <ChartCard
      title="Distribución de tierra por tamaño de explotación (PBA, 2018)"
      fuente="CNA 2018 · Agencia Tierra Viva (2022)"
      legend={[{ label: '% de EAP', color: DATA[2] }, { label: '% de superficie', color: DATA[1] }]}
      height={195}
    >
      <Bar data={data} options={{
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${ctx.raw}%` } } },
        scales: { y: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' }}, x: { ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { display: false } } },
      }} />
    </ChartCard>
  )
}

function ChartEAP() {
  const data = {
    labels: EAP_EVOLUCION.map(d => d.year),
    datasets: [{ data: EAP_EVOLUCION.map(d => d.eap), backgroundColor: DATA[1], borderRadius: 4, barPercentage: 0.55 }],
  }
  return (
    <ChartCard
      title="Evolución de explotaciones agropecuarias en PBA"
      fuente="CNA 1988, 2002, 2018"
      height={175}
    >
      <Bar data={data} options={{
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw.toLocaleString('es-AR')} EAP` } } },
        scales: { y: { ticks: { callback: v => (v / 1000).toFixed(0) + 'K' }, grid: { color: 'rgba(13,17,23,0.08)' }}, x: { grid: { display: false } } },
      }} />
    </ChartCard>
  )
}

function ChartExportaciones() {
  const data = {
    labels: EXPORTACIONES.map(d => d.label),
    datasets: [{ data: EXPORTACIONES.map(d => d.value), backgroundColor: EXPORTACIONES.map(d => d.color), borderWidth: 2, borderColor: '#fff' }],
  }
  return (
    <ChartCard
      title="Principales complejos exportadores de Argentina (participación estimada, 2025)"
      fuente="FADA (2026) · BCR · Secretaría de Agricultura"
      height={300}
    >
      <Doughnut data={data} options={{
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: { display: true, position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10, padding: 10 } },
          tooltip: { backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.label}: ~${ctx.raw}%` } },
        },
      }} />
    </ChartCard>
  )
}

// ─── HERO ────────────────────────────────────────────────────

function Hero() {
  return (
    <div style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <Link to="/informes" className="inline-flex items-center gap-1.5 text-sm no-underline mb-10" style={{ color: 'rgba(255,255,255,0.62)' }}>
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <div>
          <SectionLabel dark color="rgba(255,255,255,0.62)">FADA · INDEC · Tierra Viva · Bolsa de Cereales · Argendata</SectionLabel>
        </div>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          La agroindustria en la<br />
          <span>Provincia de Buenos Aires</span>
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          Buenos Aires concentra el{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>26% de la producción agroindustrial</strong>{' '}
          nacional y el 35% de las exportaciones del país. Un análisis del peso productivo bonaerense, los desafíos estructurales del modelo y las políticas que pueden transformarlo.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
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

        <div
          style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}
        >
          {[
            { label: 'Fuente principal',    val: 'FADA (2025) · Argendata · Tierra Viva' },
            { label: 'Superficie provincial', val: '23,7 millones de ha rurales' },
            { label: 'EAP relevadas',       val: 'CNA 2018 - 36.700 explotaciones' },
            { label: 'Actualización',       val: 'Mayo 2026' },
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

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeAgroindustriaPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* 01 */}
        <div>
          <SH title="La provincia como epicentro agroindustrial" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Buenos Aires es la jurisdicción con mayor peso económico del país y el corazón de su sistema agroindustrial. Con más de 30,7 millones de hectáreas totales y aproximadamente 23,7 millones de superficie rural, concentra el 26% de la producción agroindustrial nacional y el 35% de las exportaciones totales del país.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <CifraCard label="Participación en agroindustria nacional" valor="26%" periodo="de la producción del país" />
            <CifraCard label="Exportaciones provinciales" valor="35%" periodo="del total exportado" />
            <CifraCard label="Establecimientos agropecuarios" valor="36.700" periodo="EAP (CNA 2018)" />
            <CifraCard label="Superficie rural" valor="23,7 M" unidad="hectáreas" />
          </div>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La producción provincial en promedio decenal (2009/10–2018/19) representó el 93,1% de la cebada nacional, el 56% del girasol, el 49,5% del trigo, el 33,1% de la soja y el 28,9% del maíz.
          </p>
          <DownloadableViz title="Participación de Buenos Aires en producción nacional por cultivo" fuente="CNA 2018 · Ministerio de Desarrollo Agrario PBA">
            <ChartParticipacion />
          </DownloadableViz>
        </div>

        {/* 02 */}
        <div>
          <SH title="El mapa productivo bonaerense" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El territorio provincial organiza su producción en zonas claramente diferenciadas. Al norte se extiende la "zona núcleo" del agronegocio, dominada por la soja. El sudeste concentra trigo y cebada con porciones hortícolas. El centro y oeste serrano se orientan hacia la ganadería bovina, mientras el "cinturón verde" (de La Plata a Campana) rodea al Conurbano con producción hortícola intensiva.
          </p>
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Zona', 'Actividad predominante', 'Municipios de referencia'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Norte / zona núcleo',      'Soja transgénica, maíz',           'Pergamino, Ramallo, San Nicolás'],
                  ['Sudeste',                  'Trigo, cebada, papa, horticultura', 'Tres Arroyos, Coronel Suárez, Balcarce'],
                  ['Centro / serranías oeste', 'Ganadería bovina, pasturas',        'Olavarría, Tandil, Azul'],
                  ['Cinturón verde',           'Horticultura intensiva',            'La Plata, Escobar, Campana'],
                  ['Sudoeste',                 'Girasol, ganadería extensiva',      'Bahía Blanca, Coronel Dorrego'],
                ].map(([zona, act, munis], i, arr) => (
                  <tr key={i} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{zona}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{act}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{munis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 03 */}
        <div>
          <SH title="Empleo y cadenas de valor" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Las cadenas agroindustriales generaron 4,2 millones de puestos de trabajo en Argentina en 2023, equivalentes al 22,4% del empleo privado nacional (FADA, 2025). Buenos Aires concentra cerca del 28% de los establecimientos agropecuarios del país y es la primera jurisdicción generadora de empleo con el 31,2% del total nacional.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Empleo en CAI (Argentina)" valor="4,2 M" periodo="puestos, 2023" />
            <CifraCard label="Cadenas trigo y cebada (PBA)" valor="+200 K" periodo="empleos directos" />
            <CifraCard label="EAP lideradas por PBA" valor="28%" periodo="del total nacional" />
          </div>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Sin embargo, existe una brecha estructural entre empleo y modelo productivo: cada 1.000 hectáreas, los cultivos extensivos generan muy poco empleo directo comparado con las producciones intensivas.
          </p>
          <DownloadableViz title="Empleos por cada 1.000 hectáreas según tipo de producción" fuente="Gobierno PBA / OIT · Agencia Tierra Viva, 2022">
            <ChartEmpleoPorHa />
          </DownloadableViz>
        </div>

        {/* 04 */}
        <div>
          <SH title="La distribución de la tierra" />
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El Censo Agropecuario 2018 reveló una concentración extrema de la propiedad de la tierra. El 16% de las explotaciones agropecuarias -aquellas con más de 1.000 hectáreas- controlan el 66,5% de la superficie total provincial. En el extremo opuesto, el 30% de las EAP con menos de 100 ha apenas posee el 1,8% del suelo.
          </p>
          <DownloadableViz title="Distribución de tierra por tamaño de explotación (PBA, 2018)" fuente="CNA 2018 · Agencia Tierra Viva (2022)">
            <ChartTierra />
          </DownloadableViz>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Este proceso de concentración vino acompañado de una reducción drástica del número de explotaciones: de 75.531 en 1988 a 36.700 en 2018, casi la mitad en tres décadas. La densidad de población rural cayó de 1 persona cada 141 hectáreas en 1988 a 1 cada 258 en 2018.
          </p>
        </div>

        {/* 05 */}
        <div>
          <SH title="El debate sobre el modelo productivo" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La soja transgénica -aprobada en Argentina en 1996- transformó radicalmente el paisaje productivo bonaerense. En 2018, la oleaginosa representaba el 86,5% de las hectáreas sembradas con oleaginosas, con 3,9 millones de hectáreas. Sólo el cultivo de soja demandaba el 46% del total de plaguicidas utilizados, con el glifosato como producto más empleado.
          </p>
          <div style={{ borderLeft: `3px solid ${B[300]}`, padding: '0.875rem 1.25rem', background: B[50], borderRadius: '0 0.5rem 0.5rem 0', margin: '1.5rem 0', maxWidth: '72ch' }}>
            <p style={{ fontSize: '0.9rem', color: B[700], fontStyle: 'italic', lineHeight: 1.7 }}>
              "La agricultura dominante busca reducir al mínimo el empleo directo en las explotaciones."
            </p>
            <cite style={{ fontSize: '0.6875rem', color: B[400], fontStyle: 'normal', fontWeight: 500, display: 'block', marginTop: '0.5rem' }}>
              - Informe PBA / OIT, citado en Agencia Tierra Viva (2022)
            </cite>
          </div>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Como contrapunto, se multiplican las experiencias alternativas. El registro voluntario de productores agroecológicos del Ministerio de Desarrollo Agrario PBA cuenta con 321 productores que representan 23.000 hectáreas. La UTT (Unión de Trabajadores de la Tierra) representa a 9.000 familias en los cordones hortícolas del Conurbano, General Pueyrredón, Villarino y Bahía Blanca.
          </p>
          <DownloadableViz title="Evolución de explotaciones agropecuarias en PBA" fuente="CNA 1988, 2002, 2018">
            <ChartEAP />
          </DownloadableViz>
        </div>

        {/* 06 */}
        <div>
          <SH title="Exportaciones y rol en la economía nacional" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Las cadenas agroindustriales generaron exportaciones por USD 52.900 millones en 2025, el 61% del total exportado por Argentina -6 de cada 10 dólares que ingresaron al país. Entre enero y octubre de 2025, los complejos de granos líderes sumaron USD 28.875 millones, un 5% más en valor y 10% en volumen respecto de 2024.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Exportaciones agroindustriales 2025" valor="USD 52,9 B" periodo="récord histórico en volumen" />
            <CifraCard label="Participación en exportaciones" valor="61%" periodo="del total exportado por Argentina" />
            <CifraCard label="Retenciones agro (ARCA 2024)" valor="USD 5,99 B" periodo="91% proviene de las CAI" />
          </div>
          <DownloadableViz title="Principales complejos exportadores de Argentina (2025)" fuente="FADA (2026) · BCR · Secretaría de Agricultura">
            <ChartExportaciones />
          </DownloadableViz>
        </div>

        {/* 07 */}
        <div>
          <SH title="Desafíos estructurales del sector" />
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0' }}>
            {DESAFIOS.map((d, i) => (
              <div
                key={i}
                style={{ display: 'flex', gap: '0.875rem', padding: '1rem 1.25rem', borderBottom: i < DESAFIOS.length - 1 ? `0.5px solid #f1f5f9` : 'none', borderLeft: `4px solid ${d.color}`, transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '2.125rem', height: '2.125rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem', background: d.color + '20' }}>
                  {d.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: C.ink, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    {d.title} <Tag variant={d.variant}>{d.tag}</Tag>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: C.inkMid, lineHeight: 1.65 }}>{d.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 08 */}
        <div>
          <SH title="Recomendaciones de política" />
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            {RECOMENDACIONES.map((r, i) => (
              <div
                key={i}
                style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, borderLeft: `4px solid ${B[500]}`, padding: '1.125rem 1.25rem', transition: 'box-shadow 0.15s, border-left-color 0.15s' }}
                
              >
                <div style={{ fontSize: '0.575rem', fontWeight: 700, letterSpacing: '0.17em', textTransform: 'uppercase', color: B[400], marginBottom: '0.375rem' }}>{r.num}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.ink, marginBottom: '0.4rem' }}>{r.title}</div>
                <div style={{ fontSize: '0.8125rem', color: C.inkMid, lineHeight: 1.65 }}>{r.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fuentes */}
        <div>
          <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: '3rem', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.6875rem', color: C.inkLight, lineHeight: 1.75 }}>
              <strong style={{ color: '#64748b' }}>Fuentes:</strong>{' '}
              FADA (2025) - Empleo en las Cadenas Agroindustriales 2023; BCCBA - Informe Económico N° 453 (julio 2025); Agencia Tierra Viva (2022) - "Buenos Aires: pilar del agronegocio"; Ministerio de Economía Nación / CEP XXI; CNA 2018; BCR - Informativo Semanal (2024, 2026); Argentina.gob.ar / Secretaría de Agricultura; Chequeado (2024); Argendata / Fund.ar.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
