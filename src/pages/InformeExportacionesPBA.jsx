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
import { DATA, getColorVariacion } from '@/lib/variacion'

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

const SERIE_JUNIO = [
  { anio: '2022', valor: 2961 },
  { anio: '2023', valor: 2089 },
  { anio: '2024', valor: 2450 },
  { anio: '2025', valor: 2627 },
  { anio: '2026', valor: 2709 },
]

const SERIE_SEMESTRE = [
  { anio: '2022', valor: 16258 },
  { anio: '2023', valor: 13034 },
  { anio: '2024', valor: 14343 },
  { anio: '2025', valor: 14506 },
  { anio: '2026', valor: 15748 },
]

const RUBROS_JUNIO = [
  { rubro: 'Productos Primarios',              pba: 520,   nacion: 1886, varPBA: 2.2,   varNacion: 3.6,  estructura: 19.2, participacion: 27.6 },
  { rubro: 'Manufacturas de Origen Agropecuario', pba: 714, nacion: 3344, varPBA: -15.1, varNacion: 31.6, estructura: 26.4, participacion: 21.4 },
  { rubro: 'Manufacturas de Origen Industrial', pba: 1087, nacion: 2418, varPBA: 5.4,   varNacion: 31.4, estructura: 40.1, participacion: 44.9 },
  { rubro: 'Combustibles y Energía',            pba: 388,  nacion: 1406, varPBA: 57.5,  varNacion: 31.1, estructura: 14.3, participacion: 27.6 },
]

const RUBROS_SEMESTRE = [
  { rubro: 'Productos Primarios',              pba: 4191, nacion: 12631, varPBA: 27.4,  varNacion: 24.4, estructura: 26.6, participacion: 33.2 },
  { rubro: 'Manufacturas de Origen Agropecuario', pba: 3631, nacion: 15819, varPBA: -16.1, varNacion: 15.1, estructura: 23.1, participacion: 23.0 },
  { rubro: 'Manufacturas de Origen Industrial', pba: 5658, nacion: 13385, varPBA: 5.9,   varNacion: 27.5, estructura: 35.9, participacion: 42.3 },
  { rubro: 'Combustibles y Energía',            pba: 2268, nacion: 7619,  varPBA: 46.7,  varNacion: 42.5, estructura: 14.4, participacion: 29.8 },
]

const DESTINOS = [
  { zona: 'MERCOSUR',           junioMill: 848, junioPct: 31.3, semMill: 4607, semPct: 29.3 },
  { zona: 'China',               junioMill: 301, junioPct: 11.1, semMill: 1340, semPct: 8.5 },
  { zona: 'USMCA (ex NAFTA)',    junioMill: 211, junioPct: 7.8,  semMill: 1088, semPct: 6.9 },
  { zona: 'Resto de ALADI',      junioMill: 196, junioPct: 7.3,  semMill: 1151, semPct: 7.3 },
  { zona: 'Chile',                junioMill: 147, junioPct: 5.4,  semMill: 827,  semPct: 5.3 },
  { zona: 'Unión Europea',        junioMill: 143, junioPct: 5.3,  semMill: 957,  semPct: 6.1 },
  { zona: 'Medio Oriente',        junioMill: 136, junioPct: 5.0,  semMill: 957,  semPct: 6.1 },
  { zona: 'Resto de zonas',       junioMill: 727, junioPct: 26.8, semMill: 4821, semPct: 30.5 },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. Más exportaciones y más participación
   son 'mayor-es-mejor'; la participación bonaerense en el total nacional
   queda en 'neutro' porque perder peso relativo con crecimiento en niveles
   no es en sí un resultado negativo. */
const HERO_STATS = [
  { label: 'Exportaciones de junio 2026', valor: 'US$ 2.709', unidad: 'millones', variacion: '+3,1%', polaridad: 'mayor-es-mejor', periodo: 'interanual' },
  { label: 'Acumulado 1er semestre 2026', valor: 'US$ 15.748', unidad: 'millones', variacion: '+8,6%', polaridad: 'mayor-es-mejor', periodo: 'interanual' },
  { label: 'Participación en el total del país', valor: '29,9%', polaridad: 'neutro', periodo: 'junio 2026; 31,8% en el semestre' },
  { label: 'Combustibles y Energía en junio', valor: '+57,5%', variacion: '+57,5%', polaridad: 'mayor-es-mejor', periodo: 'i.a.; el rubro más dinámico del mes' },
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

const fmtMill = v => v.toLocaleString('es-AR')

// ─── VALUE LABELS PLUGIN ─────────────────────────────────────

const valueLabelsMill = {
  id: 'valueLabelsMill',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, di) => {
      const meta = chart.getDatasetMeta(di)
      meta.data.forEach((bar, i) => {
        const v = dataset.data[i]
        ctx.save()
        ctx.fillStyle = '#334155'
        ctx.font = 'bold 11px Archivo, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(fmtMill(v), bar.x, bar.y - 4)
        ctx.restore()
      })
    })
  },
}

// ─── CHART COMPONENTS ────────────────────────────────────────

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 2 }

function ChartSerieJunio() {
  const data = {
    labels: SERIE_JUNIO.map(d => d.anio),
    datasets: [{ label: 'Exportaciones de junio', data: SERIE_JUNIO.map(d => d.valor), backgroundColor: DATA[1], borderRadius: 0, maxBarThickness: 56 }],
  }
  return (
    <ChartCard
      title="Exportaciones de la Provincia de Buenos Aires. Mes de junio, período 2022-2026 (en millones de U$S)"
      hallazgo="Gráfico de barras: las exportaciones de junio de 2026 sumaron 2.709 millones de dólares, el segundo mejor valor de los últimos cinco junios, solo por debajo de 2022."
      tabla={{
        columnas: ['Año', 'Millones de U$S'],
        filas: SERIE_JUNIO.map(d => [d.anio, fmtMill(d.valor)]),
      }}
      ficha={[
        ['Fuente', 'Dir. Prov. de Estadística sobre datos preliminares del INDEC'],
        ['Período', 'junio, años 2022 a 2026'],
        ['Universo', 'provincia de Buenos Aires'],
        ['Unidad', 'millones de dólares'],
      ]}
      height={260}
    >
      <Bar
        data={data}
        plugins={[valueLabelsMill]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 24 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtMill(ctx.raw)} millones de U$S` } },
          },
          scales: {
            y: { min: 0, ticks: { display: false }, grid: { color: 'rgba(13,17,23,0.08)' }, border: { display: false } },
            x: { grid: { display: false }, border: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartSerieSemestre() {
  const data = {
    labels: SERIE_SEMESTRE.map(d => d.anio),
    datasets: [{ label: 'Exportaciones del primer semestre', data: SERIE_SEMESTRE.map(d => d.valor), backgroundColor: DATA[2], borderRadius: 0, maxBarThickness: 56 }],
  }
  return (
    <ChartCard
      title="Exportaciones de la Provincia de Buenos Aires. Primer semestre, período 2022-2026 (en millones de U$S)"
      hallazgo="Gráfico de barras: el primer semestre de 2026 exportó 15.748 millones de dólares, el segundo mejor registro de la serie desde 2010 para ese período, solo por debajo de 2022."
      tabla={{
        columnas: ['Año', 'Millones de U$S'],
        filas: SERIE_SEMESTRE.map(d => [d.anio, fmtMill(d.valor)]),
      }}
      ficha={[
        ['Fuente', 'Dir. Prov. de Estadística sobre datos preliminares del INDEC'],
        ['Período', 'primer semestre, años 2022 a 2026'],
        ['Universo', 'provincia de Buenos Aires'],
        ['Unidad', 'millones de dólares'],
      ]}
      height={260}
    >
      <Bar
        data={data}
        plugins={[valueLabelsMill]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 24 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtMill(ctx.raw)} millones de U$S` } },
          },
          scales: {
            y: { min: 0, ticks: { display: false }, grid: { color: 'rgba(13,17,23,0.08)' }, border: { display: false } },
            x: { grid: { display: false }, border: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartEstructuraRubros() {
  const data = {
    labels: ['Productos\nPrimarios', 'MOA', 'MOI', 'Combustibles\ny Energía'],
    datasets: [
      { label: '2025', data: [22.7, 29.8, 36.8, 10.7], backgroundColor: DATA[2], maxBarThickness: 40 },
      { label: '2026', data: RUBROS_SEMESTRE.map(r => r.estructura), backgroundColor: DATA[1], maxBarThickness: 40 },
    ],
  }
  return (
    <ChartCard
      title="Estructura de las exportaciones por grandes rubros. PBA, primer semestre, 2025 y 2026"
      hallazgo="Gráfico de barras: Productos Primarios subió de 22,7% a 26,6% de la estructura exportadora entre el primer semestre de 2025 y el de 2026, y las Manufacturas de Origen Agropecuario bajaron de 29,8% a 23,1%."
      tabla={{
        columnas: ['Rubro', '2025 (%)', '2026 (%)'],
        filas: [
          ['Productos Primarios', '22,7', '26,6'],
          ['Manufacturas de Origen Agropecuario', '29,8', '23,1'],
          ['Manufacturas de Origen Industrial', '36,8', '35,9'],
          ['Combustibles y Energía', '10,7', '14,4'],
        ],
      }}
      ficha={[
        ['Fuente', 'Dir. Prov. de Estadística sobre datos preliminares del INDEC'],
        ['Período', '1er semestre 2025 y 1er semestre 2026'],
        ['Universo', 'provincia de Buenos Aires'],
        ['Unidad', 'estructura porcentual sobre el total exportado'],
      ]}
      legend={[{ label: '2025', color: DATA[2] }, { label: '2026', color: DATA[1] }]}
      height={260}
    >
      <Bar
        data={data}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${ctx.raw.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` } },
          },
          scales: {
            y: { min: 0, max: 40, ticks: { stepSize: 10, callback: v => `${v}%` }, grid: { color: 'rgba(13,17,23,0.08)' }, border: { display: false } },
            x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10.5 } } },
          },
        }}
      />
    </ChartCard>
  )
}

// ─── TABLAS ──────────────────────────────────────────────────

function TablaRubros({ datos, titulo }) {
  const head = ['Rubro', 'PBA (mill. U$S)', 'Nación (mill. U$S)', 'Var. PBA', 'Var. Nación', 'Estructura PBA', 'Part. PBA/Nación']
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
      {titulo && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', padding: '1rem 1rem 0' }}>{titulo}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map((h, i) => (
              <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((r, i, arr) => (
            <tr key={r.rubro} style={{ borderBottom: i < arr.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}>
              <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.rubro}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtMill(r.pba)}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtMill(r.nacion)}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: r.varPBA, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(r.varPBA)}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtPct(r.varNacion)}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.estructura.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.participacion.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaDestinos() {
  const head = ['Zona / País', 'Junio (mill. U$S)', 'Junio (%)', '1er sem. (mill. U$S)', '1er sem. (%)']
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map((h, i) => (
              <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DESTINOS.map((d, i, arr) => (
            <tr key={d.zona} style={{ borderBottom: i < arr.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}>
              <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{d.zona}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtMill(d.junioMill)}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{d.junioPct.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtMill(d.semMill)}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{d.semPct.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</td>
            </tr>
          ))}
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">Dir. Prov. de Estadística · Comercio exterior · Junio 2026</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Exportaciones de la<br />
          Provincia de Buenos Aires
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          En junio de 2026 la Provincia exportó 2.709 millones de dólares, 3,1% más que un año atrás, y
          acumuló <strong style={{ color: 'rgba(255,255,255,0.9)' }}>15.748 millones en el primer semestre</strong>,
          8,6% por encima de 2025. Combustibles y Energía traccionó el mes; Productos Primarios, el semestre.
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
            { label: 'Universo',      val: 'Comercio exterior de la Provincia' },
            { label: 'Período',       val: 'Junio y 1er sem. 2026 vs. 2025' },
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
          La Provincia crece en dólares, pero pierde participación en el total del país
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          Las exportaciones bonaerenses subieron 3,1% en junio y 8,6% en el semestre, sus mejores registros
          para esos períodos en varios años. Pero el país entero creció mucho más rápido —24,5% y 24,4%
          respectivamente— así que la Provincia bajó su participación en el total nacional a{' '}
          <strong>29,9%</strong> en el mes, el registro más bajo entre los últimos períodos comparables.
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
        Los datos de este informe son{' '}
        <strong style={{ color: C.ink }}>preliminares y están sujetos a revisión</strong> por parte del
        organismo emisor. La Dirección Provincial de Estadística los elabora a partir de información
        publicada por el INDEC, que a su vez procesa los registros aduaneros de exportación.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        La comparación interanual en volumen físico (toneladas) se limita al dato agregado del mes; el
        informe original desagrega por rubro las variaciones de cantidad, apertura que este resumen no
        reproduce. La participación de la Provincia en el total nacional puede variar por revisiones
        posteriores de la fuente, tanto en el numerador provincial como en el denominador país.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeExportacionesPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* JUNIO 2026 */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Junio: el segundo mejor valor de la serie para el mes, con Combustibles como motor" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Las exportaciones bonaerenses totalizaron 2.709 millones de dólares en junio de 2026, un 3,1% más
          que en igual mes de 2025 y 26,6% por encima del promedio 2010-2025 para ese mes. En volumen físico,
          sin embargo, las toneladas exportadas cayeron 19,2% interanual, una caída bastante más pronunciada
          que la nacional (−0,3%), explicada principalmente por la baja en las cantidades vendidas de
          Manufacturas de Origen Agropecuario.
        </p>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Por grandes rubros, el desempeño fue positivo en todos los casos salvo en las Manufacturas de
          Origen Agropecuario (MOA), que cayeron 15,1% interanual. Las Manufacturas de Origen Industrial
          (MOI) se consolidaron como el rubro de mayor peso relativo, con 40,1% de las exportaciones
          provinciales. Combustibles y Energía fue el más dinámico, con un salto de 57,5% que le permitió
          alcanzar el mejor valor de toda la serie para un mes de junio, aunque partiendo de una base
          reducida (14,3% de participación).
        </p>
        <DownloadableViz title="Exportaciones de la Provincia de Buenos Aires - junio, 2022-2026" fuente="Dir. Prov. de Estadística sobre datos preliminares del INDEC">
          <ChartSerieJunio />
        </DownloadableViz>
        <TablaRubros datos={RUBROS_JUNIO} titulo="Exportaciones por grandes rubros. PBA y Nación, junio 2026" />
        <FichaTecnica items={[
          ['Fuente', 'Dir. Prov. de Estadística sobre datos preliminares del INDEC'],
          ['Período', 'junio 2026 vs. junio 2025'],
          ['Universo', 'provincia de Buenos Aires y total país'],
          ['Unidad', 'millones de dólares y variación interanual en %'],
        ]} />
      </div>

      {/* PRIMER SEMESTRE */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="El semestre lo traccionan los Productos Primarios, no los Combustibles" />
          <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            En el acumulado de los primeros seis meses de 2026, las exportaciones bonaerenses sumaron
            15.748 millones de dólares, con un incremento interanual de 8,6%: el segundo mejor registro de
            la serie histórica desde 2010 para un primer semestre, solo por debajo de 2022. La Provincia
            aportó el 31,8% de las exportaciones totales del país en el período, una participación superior
            a la de junio considerado en forma aislada.
          </p>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            A diferencia de lo observado en junio en forma aislada, en el semestre el principal impulso
            provino de los Productos Primarios, que crecieron 27,4% interanual y explicaron la mayor
            incidencia positiva (6,21 puntos porcentuales) sobre la variación total. Las MOI mantuvieron el
            mayor peso en la estructura exportadora (35,9%), mientras que las MOA fueron el único rubro con
            incidencia negativa, al caer 16,1% y reducir su participación a 23,1% del total, desde 29,8% un
            año atrás.
          </p>
          <DownloadableViz title="Exportaciones de la Provincia de Buenos Aires - primer semestre, 2022-2026" fuente="Dir. Prov. de Estadística sobre datos preliminares del INDEC">
            <ChartSerieSemestre />
          </DownloadableViz>
          <TablaRubros datos={RUBROS_SEMESTRE} titulo="Exportaciones por grandes rubros. PBA y Nación, primer semestre 2026" />
          <FichaTecnica items={[
            ['Fuente', 'Dir. Prov. de Estadística sobre datos preliminares del INDEC'],
            ['Período', '1er semestre 2026 vs. 1er semestre 2025'],
            ['Universo', 'provincia de Buenos Aires y total país'],
            ['Unidad', 'millones de dólares y variación interanual en %'],
          ]} />
          <DownloadableViz title="Estructura de las exportaciones bonaerenses por grandes rubros, 2025 y 2026" fuente="Dir. Prov. de Estadística sobre datos preliminares del INDEC">
            <ChartEstructuraRubros />
          </DownloadableViz>
        </div>
      </div>

      {/* DESTINOS */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="El MERCOSUR lidera pese a caer, mientras China y EE.UU. ganan peso" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El MERCOSUR fue la principal zona de destino de las exportaciones bonaerenses tanto en junio
          (31,3% del total, 848 millones de dólares, +0,3% interanual) como en el semestre (29,3%, 4.607
          millones, +3,3%). Brasil continuó siendo el socio comercial individual más relevante de la
          Provincia, aunque con caídas interanuales en ambos períodos —5,5% en junio y 2,0% en el
          semestre— en un contexto de menores compras de vehículos y de trigo por parte del mercado
          brasileño.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5" style={{ maxWidth: 560 }}>
          <CifraCard label="Peso de China en el semestre" valor="8,5%" variacion="+29,3%" polaridad="mayor-es-mejor" periodo="i.a. en dólares; segundo destino en importancia" />
          <CifraCard label="Peso de EE.UU. en el semestre" valor="6,9%" variacion="+49,9%" polaridad="mayor-es-mejor" periodo="i.a.; impulsado por carne bovina" />
        </div>
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          China se ubicó como segundo destino en importancia, con crecimientos interanuales de 1,4% en
          junio y 29,3% en el semestre. Estados Unidos mostró la mayor incidencia positiva relativa entre
          los principales mercados, con subas de 66,9% en junio y 49,9% en el semestre, impulsadas
          principalmente por mayores compras de carne bovina.
        </p>
        <TablaDestinos />
        <FichaTecnica items={[
          ['Fuente', 'Dir. Prov. de Estadística sobre datos preliminares del INDEC'],
          ['Período', 'junio 2026 y 1er semestre 2026'],
          ['Universo', 'exportaciones de la provincia de Buenos Aires por zona de destino'],
          ['Unidad', 'millones de dólares y estructura porcentual'],
        ]} />
        <p className="text-base leading-relaxed mt-6" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Dentro del MERCOSUR, Brasil concentró el 64,7% de las ventas bonaerenses a países limítrofes en
          el primer semestre, seguido por Chile (15,1%), Paraguay (10,5%) y Uruguay (7,4%). La composición
          de lo exportado a Brasil estuvo dominada por Manufacturas de Origen Industrial (75,1% en el
          semestre), en particular material de transporte terrestre, lo que expone a ese flujo comercial a
          la dinámica del mercado automotor brasileño.
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
            Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires.
            "Exportaciones de la Provincia de Buenos Aires", Datos Junio 2026, publicado en agosto de 2026 ·
            Instituto Nacional de Estadística y Censos (INDEC) · Ministerio de Economía de Brasil (para los
            datos de importaciones brasileñas citados en el informe original) · Elaboración propia DatosPBA
            · 2026
          </p>
          <a
            href="https://www.estadistica.ec.gba.gov.ar/dpe/estadistica/comercio-exterior"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Dirección Provincial de Estadística - Comercio exterior <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <br />
          <a
            href="https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-9-31"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-2"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            INDEC - Intercambio comercial argentino <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
