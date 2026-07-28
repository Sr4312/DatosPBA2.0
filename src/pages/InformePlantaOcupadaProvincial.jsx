import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
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
  accent:   '#3d65b2',
}

// ─── DATOS ───────────────────────────────────────────────────

/* Planta ocupada de la Provincia de Buenos Aires en los años de corte que
   publica la tabla de la fuente. Los tramos intermedios no están relevados
   acá: la nota metodológica lo aclara. */
const SERIE_PBA = [
  { anio: 2000, planta: 428408 },
  { anio: 2001, planta: 412984 },
  { anio: 2002, planta: 406182 },
  { anio: 2003, planta: 426880 },
  { anio: 2007, planta: 521807 },
  { anio: 2011, planta: 638440 },
  { anio: 2015, planta: 677362 },
  { anio: 2019, planta: 624685 },
  { anio: 2023, planta: 635227 },
  { anio: 2024, planta: 657328 },
]

/* La planta ocupada no tiene una dirección deseable: más agentes no es mejor
   ni peor sin discutir qué funciones cubren. Toda la serie va como 'neutro'. */
const FASES = [
  { periodo: '2000-2001', inicio: 428408, fin: 412984, variacion: '−3,6%' },
  { periodo: '2001-2002', inicio: 412984, fin: 406182, variacion: '−1,6%' },
  { periodo: '2002-2003', inicio: 406182, fin: 426880, variacion: '+5,1%' },
  { periodo: '2003-2007', inicio: 426880, fin: 521807, variacion: '+22,2%' },
  { periodo: '2007-2015', inicio: 521807, fin: 677362, variacion: '+29,8%' },
  { periodo: '2015-2019', inicio: 677362, fin: 624685, variacion: '−7,8%' },
  { periodo: '2019-2023', inicio: 624685, fin: 635227, variacion: '+1,7%' },
  { periodo: '2023-2024', inicio: 635227, fin: 657328, variacion: '+3,5%' },
]

const PROVINCIAS = [
  { nombre: 'Buenos Aires', color: DATA[1], borde: DATA_BORDES[1] },
  { nombre: 'Santa Fe',     color: DATA[3], borde: DATA_BORDES[3] },
  { nombre: 'Córdoba',      color: DATA[2], borde: DATA_BORDES[2] },
  { nombre: 'Mendoza',      color: DATA[4], borde: DATA_BORDES[4] },
]

const COMPARACION = [
  { anio: 2000, ba: 428408, sf: 104623, cba:  76079, mza: 63257 },
  { anio: 2003, ba: 426880, sf:  98323, cba:  88914, mza: 61281 },
  { anio: 2007, ba: 521807, sf: 106800, cba: 100658, mza: 72118 },
  { anio: 2011, ba: 638440, sf: 112060, cba: 116086, mza: 86660 },
  { anio: 2015, ba: 677362, sf: 132496, cba: 126438, mza: 93670 },
  { anio: 2019, ba: 624685, sf: 140303, cba: 127758, mza: 91128 },
  { anio: 2023, ba: 635227, sf: 152860, cba: 132358, mza: 93834 },
  { anio: 2024, ba: 657328, sf: 151850, cba: 131305, mza: 91784 },
]

// Ordenado de mayor a menor: es un ranking.
const CRECIMIENTO = [
  { prov: 'Córdoba',      pct: 72.6, de:  76079, a: 131305 },
  { prov: 'Buenos Aires', pct: 53.4, de: 428408, a: 657328 },
  { prov: 'Santa Fe',     pct: 45.1, de: 104623, a: 151850 },
  { prov: 'Mendoza',      pct: 45.1, de:  63257, a:  91784 },
]

const CADA_MIL = [
  { anio: 2000, ba: 30.5, sf: 34.1, cba: 24.9, mza: 39.8 },
  { anio: 2010, ba: 39.4, sf: 34.2, cba: 33.5, mza: 44.9 },
  { anio: 2024, ba: 37.7, sf: 41.3, cba: 33.3, mza: 44.9 },
]

const HERO_STATS = [
  { label: 'Planta ocupada',         valor: '657.328', variacion: '+3,5%',  polaridad: 'neutro', periodo: 'agentes en 2024, vs. 2023' },
  { label: 'Variación 2000-2024',    valor: '+53,4%',  polaridad: 'neutro', periodo: 'desde 428.408 agentes' },
  { label: 'Cada mil habitantes',    valor: '37,7',    polaridad: 'neutro', periodo: 'empleados provinciales, 2024' },
  { label: 'Contracción 2015-2019',  valor: '−7,8%',   polaridad: 'neutro', periodo: '52.677 agentes menos' },
]

// ─── FORMATO ─────────────────────────────────────────────────

const fmtAgentes = v => v.toLocaleString('es-AR')
const fmtPct1    = v => (v > 0 ? '+' : '') + v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
const fmtRatio   = v => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

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

// ─── VALUE LABELS PLUGINS ────────────────────────────────────

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
          ctx.font = 'bold 10px Archivo, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(fmt(dataset.data[i]), bar.x, bar.y - 6)
          ctx.restore()
        })
      })
    },
  }
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

/* Eje X lineal, no categórico: los años de corte no están equiespaciados y una
   escala de categorías los dibujaría como si lo estuvieran. */
const ejeAnios = {
  type: 'linear',
  min: 2000,
  max: 2024,
  ticks: { stepSize: 4, callback: v => String(v), font: { size: 10 }, maxRotation: 0 },
  grid: { display: false },
}

function ChartSeriePBA() {
  const data = {
    datasets: [{
      label: 'Planta ocupada',
      data: SERIE_PBA.map(d => ({ x: d.anio, y: d.planta })),
      borderColor: DATA[1],
      backgroundColor: DATA[1],
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0,
    }],
  }
  return (
    <ChartCard
      title="Planta ocupada del sector público de la Provincia de Buenos Aires"
      hallazgo="Gráfico de línea: la planta ocupada bonaerense cayó de 428.408 agentes en 2000 a 406.182 en 2002, subió hasta 677.362 en 2015, retrocedió a 624.685 en 2019 y volvió a 657.328 en 2024."
      tabla={{
        columnas: ['Año', 'Planta ocupada'],
        filas: SERIE_PBA.map(d => [String(d.anio), fmtAgentes(d.planta)]),
      }}
      ficha={[
        ['Fuente', 'DNAP, Ministerio de Economía — Ocupación y gastos salariales provinciales'],
        ['Período', '2000-2024, años de corte'],
        ['Universo', 'Administración central, organismos descentralizados y cuentas especiales'],
        ['Unidad', 'agentes'],
      ]}
      height={260}
    >
      <Line
        data={data}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { title: ctx => String(ctx[0].parsed.x), label: ctx => `  ${fmtAgentes(ctx.parsed.y)} agentes` } },
          },
          scales: {
            y: { min: 380000, max: 700000, ticks: { stepSize: 40000, callback: v => fmtAgentes(v) }, grid: { color: 'rgba(13,17,23,0.08)' } },
            x: ejeAnios,
          },
        }}
      />
    </ChartCard>
  )
}

function ChartComparacion() {
  const claves = { 'Buenos Aires': 'ba', 'Santa Fe': 'sf', 'Córdoba': 'cba', 'Mendoza': 'mza' }
  const data = {
    datasets: PROVINCIAS.map(p => ({
      label: p.nombre,
      data: COMPARACION.map(d => ({ x: d.anio, y: d[claves[p.nombre]] })),
      borderColor: p.borde,
      backgroundColor: p.borde,
      borderWidth: 2,
      pointRadius: 2.5,
      pointHoverRadius: 5,
      tension: 0,
    })),
  }
  return (
    <ChartCard
      title="Planta ocupada del sector público provincial por jurisdicción"
      hallazgo="Gráfico de líneas: la planta bonaerense (657.328 agentes en 2024) corre muy por encima de Santa Fe (151.850), Córdoba (131.305) y Mendoza (91.784), que se mueven juntas por debajo de los 160.000 agentes en todo el período."
      tabla={{
        columnas: ['Año', 'Buenos Aires', 'Santa Fe', 'Córdoba', 'Mendoza'],
        filas: COMPARACION.map(d => [String(d.anio), fmtAgentes(d.ba), fmtAgentes(d.sf), fmtAgentes(d.cba), fmtAgentes(d.mza)]),
      }}
      ficha={[
        ['Fuente', 'DNAP, Ministerio de Economía — Ocupación y gastos salariales provinciales'],
        ['Período', '2000-2024, años de corte'],
        ['Universo', 'Buenos Aires, Santa Fe, Córdoba y Mendoza · sin municipios'],
        ['Unidad', 'agentes'],
      ]}
      legend={PROVINCIAS.map(p => ({ label: p.nombre, color: p.borde }))}
      height={280}
    >
      <Line
        data={data}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { title: ctx => String(ctx[0].parsed.x), label: ctx => `  ${ctx.dataset.label}: ${fmtAgentes(ctx.parsed.y)}` } },
          },
          scales: {
            y: { min: 0, max: 700000, ticks: { callback: v => fmtAgentes(v) }, grid: { color: 'rgba(13,17,23,0.08)' } },
            x: ejeAnios,
          },
        }}
      />
    </ChartCard>
  )
}

function ChartCrecimiento() {
  const data = {
    labels: CRECIMIENTO.map(d => d.prov),
    datasets: [{
      data: CRECIMIENTO.map(d => d.pct),
      /* Buenos Aires en la serie principal; el resto en el neutro del sistema
         (#64748B, 4,4:1 sobre blanco). El valor va escrito sobre cada barra:
         el color destaca, no informa. */
      backgroundColor: CRECIMIENTO.map(d => (d.prov === 'Buenos Aires' ? DATA[1] : VALORACION_HEX.neutral.base)),
      borderRadius: 4,
      barPercentage: 0.6,
    }],
  }
  return (
    <ChartCard
      title="Crecimiento de la planta ocupada entre 2000 y 2024"
      hallazgo="Gráfico de barras horizontales: Córdoba encabeza el crecimiento de su planta ocupada con 72,6%, seguida por Buenos Aires con 53,4% y por Santa Fe y Mendoza con 45,1% cada una."
      tabla={{
        columnas: ['Provincia', '2000', '2024', 'Variación'],
        filas: CRECIMIENTO.map(d => [d.prov, fmtAgentes(d.de), fmtAgentes(d.a), fmtPct1(d.pct)]),
      }}
      ficha={[
        ['Fuente', 'DNAP, Ministerio de Economía — Ocupación y gastos salariales provinciales'],
        ['Período', '2000 y 2024'],
        ['Universo', 'Buenos Aires, Santa Fe, Córdoba y Mendoza · sin municipios'],
        ['Unidad', '% de variación sobre la planta de 2000'],
      ]}
      height={195}
    >
      <Bar
        data={data}
        plugins={[makeHValueLabels(fmtPct1)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 56 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtPct1(ctx.raw)}` } },
          },
          scales: {
            x: { max: 85, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
            y: { grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartCadaMil() {
  const claves = { 'Buenos Aires': 'ba', 'Santa Fe': 'sf', 'Córdoba': 'cba', 'Mendoza': 'mza' }
  /* Tres cortes = tres series de la paleta de dato, del más viejo al más
     reciente. El cyan no llega a 3:1 sobre blanco: lleva su borde. */
  const serie = {
    2000: { fondo: DATA[3], borde: DATA_BORDES[3] },
    2010: { fondo: DATA[2], borde: DATA[2] },
    2024: { fondo: DATA[1], borde: DATA[1] },
  }
  const data = {
    labels: PROVINCIAS.map(p => p.nombre),
    datasets: CADA_MIL.map(fila => ({
      label: String(fila.anio),
      data: PROVINCIAS.map(p => fila[claves[p.nombre]]),
      backgroundColor: serie[fila.anio].fondo,
      borderColor: serie[fila.anio].borde,
      borderWidth: 1,
      borderRadius: 4,
      barPercentage: 0.75,
    })),
  }
  return (
    <ChartCard
      title="Empleados públicos provinciales cada mil habitantes"
      hallazgo="Gráfico de barras: en 2024 Mendoza tuvo 44,9 empleados provinciales cada mil habitantes, Santa Fe 41,3, Buenos Aires 37,7 y Córdoba 33,3; en 2000 Buenos Aires era la anteúltima con 30,5."
      tabla={{
        columnas: ['Año', 'Buenos Aires', 'Santa Fe', 'Córdoba', 'Mendoza'],
        filas: CADA_MIL.map(d => [String(d.anio), fmtRatio(d.ba), fmtRatio(d.sf), fmtRatio(d.cba), fmtRatio(d.mza)]),
      }}
      ficha={[
        ['Fuente', 'DNAP, Ministerio de Economía — Ocupación y gastos salariales provinciales'],
        ['Período', '2000, 2010 y 2024'],
        ['Universo', 'Buenos Aires, Santa Fe, Córdoba y Mendoza · sin municipios'],
        ['Unidad', 'empleados provinciales cada mil habitantes'],
      ]}
      legend={CADA_MIL.map(d => ({ label: String(d.anio), color: serie[d.anio].borde }))}
      height={250}
    >
      <Bar
        data={data}
        plugins={[makeVValueLabels(fmtRatio)]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 20 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${fmtRatio(ctx.raw)}` } },
          },
          scales: {
            y: { max: 50, ticks: { stepSize: 10, callback: v => String(v) }, grid: { color: 'rgba(13,17,23,0.08)' } },
            x: { ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { display: false } },
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">DNAP · Ocupación y gastos salariales provinciales · 2000-2024</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          La planta ocupada del Estado<br />
          bonaerense, de 2000 a 2024
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          El sector público provincial sumó{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>228.920 agentes</strong> en veinticuatro años.
          El recorrido no fue lineal: dos contracciones —la de la crisis de 2001-2002 y la de 2015-2019—
          cortaron una expansión que se concentró entre 2003 y 2015.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
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
            { label: 'Fuente',        val: 'DNAP — Ministerio de Economía de la Nación' },
            { label: 'Universo',      val: 'Sector público provincial no financiero · sin municipios' },
            { label: 'Período',       val: '2000-2024' },
            { label: 'Actualización', val: 'Julio 2026' },
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
          El tamaño del Estado bonaerense se explica por su población, no por su ritmo de expansión
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          Buenos Aires tiene la planta más grande de las cuatro provincias más pobladas y le saca cuatro
          veces al segundo puesto. Es lo que corresponde al distrito con más habitantes del país. Medida
          contra su propia población, la dotación bonaerense queda tercera de cuatro; y su crecimiento de{' '}
          <strong>53,4%</strong> en veinticuatro años quedó 19 puntos por debajo del de Córdoba.
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
        La variable "planta ocupada" cuenta a los agentes efectivamente ocupados en la administración
        central, los organismos descentralizados y las cuentas especiales de cada jurisdicción.{' '}
        <strong style={{ color: C.ink }}>No incluye a los municipios</strong>, lo que en Buenos Aires
        deja fuera la planta de 135 gobiernos locales, ni a las empresas públicas o al sector financiero
        provincial. La definición del universo relevado puede variar entre provincias y a lo largo del
        tiempo, de modo que las comparaciones interprovinciales admiten diferencias de cobertura menores.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        Los gráficos usan los <strong style={{ color: C.ink }}>años de corte</strong> que publica la tabla
        de la fuente —2000 a 2003 anuales, y luego 2007, 2011, 2015, 2019, 2023 y 2024—, no la serie anual
        completa. Los tramos entre esos años se dibujan como interpolación y no representan el valor de
        cada año intermedio. Un caso concreto: la serie anual alcanza su máximo en 2017 y cae desde ahí,
        de manera que la contracción del tramo 2015-2019 empezó después de ese pico y no en 2015.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        Para 2024 se usó el último ejercicio disponible en la fuente al momento de elaborar este informe.
        En el indicador de empleados cada mil habitantes, la fuente no explicita qué serie poblacional
        usa como denominador: los valores se reproducen tal como fueron publicados. Una sola serie de
        dotación no permite atribuir causas a cada fase de expansión o contracción; para eso haría falta
        cruzarla con el gasto público, el peso de educación, salud y seguridad, y los cambios de
        organización estatal de cada provincia.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformePlantaOcupadaProvincial() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* LA EXPANSIÓN 2003-2015 — prosa, cifras y gráfico a lo ancho */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Entre 2003 y 2015 la planta ocupada creció 58,7%" />
        <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          La serie arranca en 2000 con 428.408 agentes y baja durante dos años seguidos. El piso llegó en
          2002: la salida de la convertibilidad se llevó 22.226 puestos de la administración provincial.
        </p>
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Desde 2003 la dotación volvió a crecer y no dejó de hacerlo, salvo oscilaciones menores, durante
          doce años. El tramo 2007-2015 es el de mayor expansión de toda la serie: 29,8% en ocho años.
          Recién en 2015 la curva se da vuelta.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5" style={{ maxWidth: 560 }}>
          <CifraCard label="Piso de la serie" valor="406.182" polaridad="neutro" periodo="agentes en 2002" />
          <CifraCard label="De 2002 a 2015" valor="+271.180" polaridad="neutro" periodo="agentes sumados en trece años" />
        </div>
        <DownloadableViz title="Planta ocupada del sector público bonaerense, 2000-2024" fuente="DNAP, Ministerio de Economía de la Nación">
          <ChartSeriePBA />
        </DownloadableViz>
      </div>

      {/* LAS FASES — tabla densa sola, sobre fondo blanco alternado */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Dos de los ocho tramos de la serie fueron de caída" />
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '0.5rem 0 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Tramo', 'Planta al inicio', 'Planta al final', 'Variación'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FASES.map((r, i, arr) => (
                  <tr key={r.periodo} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.periodo}</td>
                    <td className="tabular-nums" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtAgentes(r.inicio)}</td>
                    <td className="tabular-nums" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtAgentes(r.fin)}</td>
                    <td
                      className="tabular-nums"
                      style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: r.variacion, polaridad: 'neutro', texto: true }) }}
                    >
                      {r.variacion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FichaTecnica items={[
            ['Fuente', 'DNAP, Ministerio de Economía — Ocupación y gastos salariales provinciales'],
            ['Período', '2000-2024, tramos de la serie'],
            ['Universo', 'Sector público provincial no financiero de Buenos Aires'],
            ['Unidad', 'agentes y % de variación'],
          ]} />
          <p className="text-base leading-relaxed mt-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La contracción de 2015-2019 fue la única prolongada después de la crisis: 52.677 agentes menos
            en cuatro años. Los cinco años siguientes recuperaron buena parte de esa pérdida, pero la planta
            de 2024 todavía está 20.034 agentes por debajo del nivel de 2015.
          </p>
        </div>
      </div>

      {/* LA COMPARACIÓN INTERPROVINCIAL — dos columnas y gráfico a lo ancho */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Buenos Aires reúne 657.328 agentes; Santa Fe, la segunda, 151.850" />
        <div className="grid lg:grid-cols-2 gap-x-10 items-start">
          <div>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              En 2024 la planta bonaerense equivale a 1,8 veces la suma de las otras tres provincias más
              pobladas del país. Córdoba tuvo 131.305 agentes y Mendoza 91.784. La distancia es de escala,
              y se sostiene sin cambios en los veinticuatro años de la serie.
            </p>
            <p className="text-base leading-relaxed" style={{ color: C.inkMid }}>
              El orden se altera cuando se mira el ritmo. Córdoba sumó 72,6% a su dotación desde 2000, casi
              veinte puntos más que Buenos Aires. Santa Fe y Mendoza crecieron 45,1% cada una, una
              coincidencia decimal que arranca de números muy distintos: Santa Fe partió de 104.623 agentes
              y Mendoza de 63.257.
            </p>
          </div>
          <DownloadableViz title="Crecimiento de la planta ocupada por provincia, 2000-2024" fuente="DNAP, Ministerio de Economía de la Nación">
            <ChartCrecimiento />
          </DownloadableViz>
        </div>
        <DownloadableViz title="Planta ocupada provincial por jurisdicción, 2000-2024" fuente="DNAP, Ministerio de Economía de la Nación">
          <ChartComparacion />
        </DownloadableViz>
      </div>

      {/* CADA MIL HABITANTES (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Cada mil habitantes, Buenos Aires emplea 37,7 y Mendoza 44,9" />
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Ninguna de las dos comparaciones anteriores descuenta la población. El indicador de empleados
            provinciales cada mil habitantes sí lo hace, y reordena el tablero: en 2024 Mendoza registró
            44,9, Santa Fe 41,3, Buenos Aires 37,7 y Córdoba 33,3.
          </p>
          <DownloadableViz title="Empleados públicos provinciales cada mil habitantes" fuente="DNAP, Ministerio de Economía de la Nación">
            <ChartCadaMil />
          </DownloadableViz>
          <p className="text-base leading-relaxed mt-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La posición bonaerense no fue estable. En 2000 estaba por debajo de Santa Fe y de Mendoza, con
            30,5 empleados cada mil habitantes. Para 2010 había pasado a Santa Fe —39,4 contra 34,2— y se
            mantuvo arriba hasta el final de esa década, cuando Santa Fe volvió a superarla. Frente a
            Mendoza quedó siempre debajo; frente a Córdoba, siempre arriba.
          </p>
          <p className="text-base leading-relaxed mt-4" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La discusión pública sobre el tamaño del Estado bonaerense suele apoyarse en el número absoluto,
            que es el más alto del país por definición demográfica. El indicador que compara ubica a la
            Provincia en el medio del pelotón. La pregunta que sigue —en qué funciones están esos agentes,
            cuántos son docentes, personal de salud o policías— esta serie no la responde.
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
            Dirección Nacional de Asuntos Provinciales, Ministerio de Economía de la Nación.
            "Ocupación y gastos salariales provinciales", serie 1987-2024, elaborada sobre la base de la
            información remitida semestralmente por cada provincia · Elaboración propia DatosPBA · 2026
          </p>
          <a
            href="https://www.argentina.gob.ar/economia/sechacienda/asuntosprovinciales"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            DNAP — Información fiscal provincial y municipal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
