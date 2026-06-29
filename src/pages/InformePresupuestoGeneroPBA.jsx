import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft, Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)
ChartJS.defaults.font.family = 'Poppins, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'

// ─── COLORES ─────────────────────────────────────────────────

const C = {
  bg:       'var(--c-bg)',
  ink:      'var(--c-ink)',
  inkMid:   'var(--c-ink-mid)',
  inkLight: 'var(--c-ink-light)',
  rule:     'var(--c-rule)',
  hero:     '#0a1628',
  accent:   '#7c3aed',
}

const V = {
  700: '#4c1d95',
  600: '#5b21b6',
  500: '#6d28d9',
  400: '#7c3aed',
  300: '#a78bfa',
  200: '#c4b5fd',
  100: '#e9d5ff',
  50:  '#f5f3ff',
}

// ─── DATOS ───────────────────────────────────────────────────
// Fuente: Presupuesto 2026 - Provincia de Buenos Aires, Planilla 35 (PPG)

const BRECHAS = [
  { label: 'Tiempo y cuidados (TYC)',          value: 80.2, monto: 1434197.6 },
  { label: 'Salud sexual y (no) reproductiva',  value: 8.6,  monto: 154128.1  },
  { label: 'Prevención de violencia (PEV)',     value: 4.0,  monto: 71918.7   },
  { label: 'Transversalización (TPG)',          value: 3.7,  monto: 66435.1  },
  { label: 'Empleo e ingresos (EMP/ING)',       value: 3.4,  monto: 60957.4  },
]

const JURISDICCIONES = [
  { jur: 'Min. de Desarrollo de la Comunidad', ini: 16,  monto: 1072626.8, pct: 60.0 },
  { jur: 'Ministerio de Salud',                ini: 11,  monto: 272755.5,  pct: 15.3 },
  { jur: 'Dir. Gral. de Cultura y Educación',   ini: 9,   monto: 225707.5,  pct: 12.6 },
  { jur: 'Ministerio de Seguridad',             ini: 1,   monto: 60206.9,   pct: 3.4  },
  { jur: 'Instituto de la Vivienda',            ini: 4,   monto: 33277.6,   pct: 1.9  },
  { jur: 'Instituto Cultural',                  ini: 16,  monto: 32711.4,   pct: 1.8  },
  { jur: 'Min. de Infraestructura y Serv. Públ.', ini: 10, monto: 28176.5,  pct: 1.6  },
  { jur: 'Ministerio de Mujeres y Diversidad',  ini: 25,  monto: 21660.3,   pct: 1.2  },
  { jur: 'OPISU',                               ini: 21,  monto: 18782.4,   pct: 1.1  },
  { jur: 'Min. de Justicia y Derechos Humanos', ini: 8,   monto: 6728.9,    pct: 0.4  },
  { jur: 'Otros 16 organismos',                 ini: 37,  monto: 14902.8,   pct: 0.8  },
]

const GENERO_NETO = [
  { label: 'Salud sexual y (no) reproductiva', value: 154128.1, color: V[700] },
  { label: 'Prevención de violencia',          value: 71918.7,  color: V[500] },
  { label: 'Transversalización institucional', value: 66435.1,  color: V[300] },
  { label: 'Empleo e ingresos focalizado',     value: 60957.4,  color: V[200] },
]

const COMPARATIVA = [
  { label: 'Presentado como "género" (PPG total)', value: 4.2, color: '#94a3b8' },
  { label: 'Específicamente focalizado (neto)',    value: 0.82, color: V[500] },
]

const HERO_STATS = [
  { n: '4,2%',  label: 'del presupuesto presentado como "de género"', color: '#cbd5e1' },
  { n: '0,82%', label: 'corresponde efectivamente a brechas de género', color: V[200] },
  { n: '80,2%', label: 'del PPG es gasto social reetiquetado (TYC)',    color: '#fda4af' },
  { n: '1,2%',  label: 'del PPG ejecuta el Min. de Mujeres y Diversidad', color: '#93c5fd' },
]

// ─── ANIMACIÓN ───────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

// ─── DOWNLOAD ────────────────────────────────────────────────

const DL_PADDING  = 60
const DL_FOOTER_H = 56
const DL_MIN_W    = 1200

function drawFooter(ctx, y, w) {
  ctx.fillStyle = '#0a1628'
  ctx.fillRect(0, y, w, DL_FOOTER_H)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.round(w * 0.018)}px Poppins, Roboto, system-ui, sans-serif`
  ctx.fillText('Datos', DL_PADDING, y + DL_FOOTER_H * 0.65)
  ctx.fillStyle = '#60a5fa'
  ctx.fillText('PBA', DL_PADDING + Math.round(w * 0.06), y + DL_FOOTER_H * 0.65)
  ctx.fillStyle = '#94a3b8'
  ctx.font = `${Math.round(w * 0.013)}px Poppins, Roboto, system-ui, sans-serif`
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
  ctx.fillStyle = '#0a1628'
  ctx.font = `bold ${Math.round(W * 0.020)}px Poppins, Roboto, system-ui, sans-serif`
  ctx.fillText(title, DL_PADDING, Math.round(titleH * 0.52), W - DL_PADDING * 2)
  if (fuente) {
    ctx.fillStyle = '#94a3b8'
    ctx.font = `${Math.round(W * 0.014)}px Poppins, Roboto, system-ui, sans-serif`
    ctx.fillText(`Fuente: ${fuente}`, DL_PADDING, Math.round(titleH * 0.82))
  }
  ctx.drawImage(captured, 0, titleH, innerW, innerH)
  drawFooter(ctx, H - DL_FOOTER_H, W)
  triggerDownload(out, title)
}

function DownloadableViz({ title, fuente, children }) {
  const ref    = useRef(null)
  const btnRef = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    if (!ref.current || busy) return
    setBusy(true)
    if (btnRef.current) btnRef.current.style.visibility = 'hidden'
    try { await downloadVizContainer(ref.current, title, fuente) }
    catch (e) { console.error(e) }
    if (btnRef.current) btnRef.current.style.visibility = ''
    setBusy(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={btnRef} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={handleDownload}
          disabled={busy}
          title="Descargar PNG con marca DatosPBA"
          style={{
            background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 8,
            padding: '6px 10px', cursor: busy ? 'wait' : 'pointer', color: C.inkMid,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.72rem', fontWeight: 600, transition: 'color 0.15s, border-color 0.15s',
            fontFamily: 'Poppins, sans-serif',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.accent; e.currentTarget.style.borderColor = C.accent }}
          onMouseLeave={e => { e.currentTarget.style.color = C.inkMid; e.currentTarget.style.borderColor = C.rule }}
        >
          <Download style={{ width: 13, height: 13 }} />
          {busy ? 'generando…' : 'Descargar PNG'}
        </button>
      </div>
      <div ref={ref} style={{ background: C.bg }}>
        {children}
      </div>
    </div>
  )
}

// ─── COMPONENTES UI ──────────────────────────────────────────

function SectionLabel({ children, dark = false, color }) {
  return (
    <p
      style={{ color: color || (dark ? 'rgba(255,255,255,0.5)' : C.accent) }}
      className="text-xs font-semibold tracking-[0.18em] uppercase mb-3"
    >
      {children}
    </p>
  )
}

function SH({ num, title }) {
  return (
    <div style={{ borderBottom: `2px solid ${C.ink}`, paddingBottom: '0.75rem', marginBottom: '1.75rem', marginTop: '3rem' }}>
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: V[400], marginBottom: '0.2rem' }}>{num}</p>
      <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.875rem)', fontWeight: 700, color: C.ink, lineHeight: 1.05, letterSpacing: '-0.015em' }}>{title}</h2>
    </div>
  )
}

function MC({ label, value, unit, accent = false }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${C.rule}`,
      borderLeft: `4px solid ${accent ? V[600] : V[400]}`,
      padding: '1.125rem 1.125rem 1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: '0.625rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.875rem', fontWeight: 800, color: accent ? V[600] : C.ink, lineHeight: 1, marginBottom: '0.375rem' }}>{value}</div>
      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.4 }}>{unit}</div>
    </div>
  )
}

function ChartCard({ title, fuente, legend, height = 220, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, padding: '1.25rem 1.25rem 0.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0' }}>
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
      {fuente && <p style={{ fontSize: '0.625rem', color: '#94a3b8', textAlign: 'right', marginTop: '0.625rem', fontStyle: 'italic' }}>{fuente}</p>}
    </div>
  )
}

// ─── CHART COMPONENTS ────────────────────────────────────────

const pctLabelsPlugin = {
  id: 'pctLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, di) => {
      chart.getDatasetMeta(di).data.forEach((bar, i) => {
        const v = dataset.data[i]
        ctx.save()
        ctx.fillStyle = '#334155'
        ctx.font = 'bold 11px Poppins, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${v}%`, bar.x + 8, bar.y)
        ctx.restore()
      })
    })
  },
}

function ChartBrechas() {
  const data = {
    labels: BRECHAS.map(d => d.label),
    datasets: [{
      data: BRECHAS.map(d => d.value),
      backgroundColor: [V[700], V[500], V[400], V[300], V[200]],
      borderRadius: 4, barPercentage: 0.65,
    }],
  }
  return (
    <ChartCard
      title="Distribución del PPG 2026 por brecha de impacto"
      fuente="Presupuesto 2026 - Provincia de Buenos Aires, Planilla 35 (PPG)"
      height={240}
    >
      <Bar
        data={data}
        plugins={[pctLabelsPlugin]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 36 } },
          plugins: { legend: { display: false }, tooltip: { backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw}% del PPG` } } },
          scales: { x: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } }, y: { grid: { display: false } } },
        }}
      />
    </ChartCard>
  )
}

function ChartComparativa() {
  const data = {
    labels: COMPARATIVA.map(d => d.label),
    datasets: [{
      data: COMPARATIVA.map(d => d.value),
      backgroundColor: COMPARATIVA.map(d => d.color),
      borderRadius: 4, barPercentage: 0.5,
    }],
  }
  return (
    <ChartCard
      title="Lo discursivo vs. lo efectivo: % del presupuesto provincial total"
      fuente="Presupuesto 2026 - Provincia de Buenos Aires, Planilla 35 (PPG)"
      height={170}
    >
      <Bar
        data={data}
        plugins={[pctLabelsPlugin]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 50 } },
          plugins: { legend: { display: false }, tooltip: { backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `  ${ctx.raw}% del presupuesto provincial` } } },
          scales: { x: { max: 5, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } }, y: { ticks: { font: { size: 11 } }, grid: { display: false } } },
        }}
      />
    </ChartCard>
  )
}

function ChartGeneroNeto() {
  const data = {
    labels: GENERO_NETO.map(d => `${d.label} (${(d.value / 1000).toFixed(0)} M)`),
    datasets: [{ data: GENERO_NETO.map(d => d.value), backgroundColor: GENERO_NETO.map(d => d.color), borderWidth: 2, borderColor: '#fff' }],
  }
  return (
    <ChartCard
      title="Composición del gasto en género neto: $353.439 millones (0,82% del presupuesto)"
      fuente="Presupuesto 2026 - Provincia de Buenos Aires, Planilla 35 (PPG)"
      height={300}
    >
      <Doughnut data={data} options={{
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: { display: true, position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10, padding: 10 } },
          tooltip: {
            backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8,
            callbacks: { label: ctx => `  ${GENERO_NETO[ctx.dataIndex].label}: $${ctx.raw.toLocaleString('es-AR')} M` },
          },
        },
      }} />
    </ChartCard>
  )
}

// ─── HERO ────────────────────────────────────────────────────

function Hero() {
  return (
    <div className="bg-pattern-dark" style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <Link to="/informes" className="inline-flex items-center gap-1.5 text-sm no-underline mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <m.div {...fadeUp(0)}>
          <SectionLabel dark color={V[200]}>Presupuesto Provincial 2026 · Planilla 35 (PPG)</SectionLabel>
        </m.div>

        <m.h1
          {...fadeUp(0.05)}
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          El maquillaje contable<br />
          <span style={{ color: V[200] }}>del Presupuesto de Género</span>
        </m.h1>

        <m.p
          {...fadeUp(0.1)}
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          La Provincia presenta un Presupuesto con Perspectiva de Género (PPG) de{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>$1,79 billones</strong>, el 4,2% del
          presupuesto total. Al abrir las planillas, solo $353.439 millones —el 0,82%— corresponden
          efectivamente a políticas focalizadas en cerrar brechas de género.
        </m.p>

        <m.div {...fadeUp(0.15)} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          {HERO_STATS.map((s, i) => (
            <m.div
              key={i}
              {...fadeUp(0.1 * i + 0.2)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16 }}
              className="p-5"
            >
              <div className="font-display text-4xl font-bold mb-1" style={{ color: s.color }}>{s.n}</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.45 }}>{s.label}</p>
            </m.div>
          ))}
        </m.div>

        <m.div
          {...fadeUp(0.3)}
          style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}
        >
          {[
            { label: 'Fuente',          val: 'Presupuesto 2026 PBA - Planilla 35 (PPG)' },
            { label: 'PPG total',       val: '$1.787.636,8 millones' },
            { label: 'Iniciativas / organismos', val: '158 iniciativas · 26 organismos' },
            { label: 'Actualización',   val: 'Junio 2026' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{item.val}</div>
            </div>
          ))}
        </m.div>
      </div>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformePresupuestoGeneroPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* 01 */}
        <m.div {...fadeUp()}>
          <SH num="01 · Metodología" title="Qué mide (y qué no mide) el PPG" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El Presupuesto con Perspectiva de Género es una herramienta de clasificación presupuestaria
            que etiqueta partidas según su impacto en cinco brechas de desigualdad de género. La
            metodología está alineada con estándares de ONU Mujeres y es técnicamente válida: el
            problema no es la herramienta, sino su aplicación política.
          </p>
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Categoría', 'Sigla', 'Qué incluye'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Tiempo y Cuidados', 'TYC', 'Partidas que benefician desproporcionadamente a mujeres por la distribución desigual de tareas de cuidado'],
                  ['Salud sexual y (no) reproductiva', 'SAL', 'Políticas focalizadas en la salud específica de mujeres y diversidades'],
                  ['Prevención de violencia de género', 'PEV', 'Programas para prevenir, abordar y reparar situaciones de violencia'],
                  ['Transversalización', 'TPG', 'Capacitaciones, oficinas de género, comunicación inclusiva, estructura institucional'],
                  ['Empleo e ingresos', 'EMP/ING', 'Políticas focalizadas en cerrar brechas laborales y de autonomía económica'],
                ].map(([cat, sigla, desc], i, arr) => (
                  <tr key={i} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{cat}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{sigla}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La clasificación distingue además entre partidas PPG-Total (el total del crédito tiene
            perspectiva de género) y PPG-Parcial (el crédito se computa con un ponderador), lo que
            evita la doble contabilización dentro del presupuesto oficial.
          </p>
        </m.div>

        {/* 02 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="02 · Cifras oficiales" title="Dónde dice ir la plata del 'presupuesto de género'" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La categoría Tiempo y Cuidados concentra el 80,2% del PPG 2026. Funciona como un recipiente
            amplio que absorbe gasto social universal —Servicio Alimentario Escolar, MESA Bonaerense,
            jornada extendida, maternidades provinciales— y lo etiqueta como gasto de género. Son
            políticas legítimas, pero el Estado las financiaría igual sin ese rótulo.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <MC label="PPG total 2026" value="$1,79 B" unit="1.787.636,8 millones" accent />
            <MC label="Iniciativas" value="158" unit="ejecutadas en el ejercicio" />
            <MC label="Organismos" value="26" unit="jurisdicciones ejecutoras" />
            <MC label="Concentración en TYC" value="80,2%" unit="del PPG total" />
          </div>
          <DownloadableViz title="Distribución del PPG 2026 por brecha de impacto" fuente="Presupuesto 2026 PBA, Planilla 35">
            <ChartBrechas />
          </DownloadableViz>
        </m.div>

        {/* 03 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="03 · Concentración institucional" title="El ministerio que lleva el nombre, recibe 1 de cada 2.000 pesos" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El PPG es ejecutado por 26 organismos, pero está extremadamente concentrado: tres
            jurisdicciones acumulan el 88% del total. El Ministerio de Desarrollo de la Comunidad
            administra el 60% del PPG, mientras el Ministerio de Mujeres y Diversidad —la única cartera
            creada específicamente para coordinar la política de género— apenas ejecuta el 1,2%.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="Min. Desarrollo de la Comunidad" value="60,0%" unit="$1.072.626,8 M del PPG" accent />
            <MC label="Min. Mujeres y Diversidad" value="1,2%" unit="$21.660,3 M del PPG" />
            <MC label="Min. Mujeres / presupuesto total" value="0,050%" unit="1 de cada 2.000 pesos provinciales" />
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Jurisdicción', 'Iniciativas', 'Crédito (M $)', '% PPG'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JURISDICCIONES.map((j, i, arr) => (
                  <tr key={j.jur} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none', background: j.jur === 'Ministerio de Mujeres y Diversidad' ? V[50] : 'transparent' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: j.jur === 'Ministerio de Mujeres y Diversidad' ? 700 : 600 }}>{j.jur}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{j.ini}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{j.monto.toLocaleString('es-AR')}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid, fontWeight: 600 }}>{j.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </m.div>

        {/* 04 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="04 · El gasto neto" title="Lo que queda si se saca el maquillaje" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Si se elimina del cómputo la categoría Tiempo y Cuidados —que captura gasto social
            universal— el gasto estrictamente focalizado en brechas de género cae a $353.439 millones:
            el 0,82% del presupuesto provincial, frente al 4,2% discursivo. Por cada peso presentado
            como "de género", solo 20 centavos corresponden a una política específicamente focalizada.
          </p>
          <DownloadableViz title="Lo discursivo vs. lo efectivo" fuente="Presupuesto 2026 PBA, Planilla 35">
            <ChartComparativa />
          </DownloadableViz>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 mt-5">
            <MC label="Género neto" value="$353.439 M" unit="0,82% del presupuesto provincial" accent />
            <MC label="Brecha discursiva" value="5,1x" unit="entre el 4,2% anunciado y el 0,82% real" />
            <MC label="Categorías que componen el neto" value="4" unit="SAL · PEV · TPG · EMP/ING" />
          </div>
          <DownloadableViz title="Composición del gasto en género neto" fuente="Presupuesto 2026 PBA, Planilla 35">
            <ChartGeneroNeto />
          </DownloadableViz>
        </m.div>

        {/* Nota metodológica */}
        <m.div {...fadeUp(0.05)}>
          <div style={{ borderLeft: `3px solid ${V[300]}`, padding: '0.875rem 1.25rem', background: V[50], borderRadius: '0 0.5rem 0.5rem 0', margin: '2.5rem 0 1.5rem', maxWidth: '72ch' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: V[600], textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
              Nota sobre los datos
            </p>
            <p style={{ fontSize: '0.8125rem', color: C.inkMid, lineHeight: 1.65 }}>
              La metodología del PPG está alineada con estándares de ONU Mujeres y organismos
              multilaterales, y es técnicamente válida: distingue partidas PPG-Total de PPG-Parcial para
              evitar doble contabilización. El cuestionamiento de este informe no es metodológico sino
              de uso político: la categoría Tiempo y Cuidados funciona como un recipiente amplio que
              absorbe gasto social universal que el Estado gastaría de igual forma sin etiqueta de
              género, inflando la magnitud del PPG en el discurso oficial. Todos los datos provienen de
              la Planilla 35 del Presupuesto 2026 de la Provincia de Buenos Aires.
            </p>
          </div>
        </m.div>

        {/* Conclusión */}
        <m.div
          {...fadeUp(0.05)}
          className="bg-pattern-dark"
          style={{ background: C.hero, borderRadius: 20, padding: '44px 48px', position: 'relative', overflow: 'hidden', margin: '2rem 0' }}
        >
          <div style={{ position: 'absolute', right: -80, top: -80, width: 280, height: 280, borderRadius: '50%', border: '40px solid rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', right: 60, bottom: -100, width: 180, height: 180, borderRadius: '50%', border: '30px solid rgba(255,255,255,0.03)' }} />
          <div className="relative z-10">
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>
              El argumento
            </p>
            <p style={{ color: '#fff', fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
              El Gobierno distribuye la etiqueta "género" por todas las áreas para inflar la cifra en el
              discurso, pero deja a la cartera específicamente creada para la igualdad con un
              presupuesto marginal. Solo el{' '}
              <span style={{ color: V[200], fontWeight: 700 }}>0,82% del presupuesto provincial</span>{' '}
              cierra brechas específicas de género.{' '}
              <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                Esconder el gasto real dentro de otras jurisdicciones no es transparencia: es marketing
                presupuestario.
              </span>
            </p>
          </div>
        </m.div>

        {/* Fuentes */}
        <m.div {...fadeUp(0.05)}>
          <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: '1rem', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.6875rem', color: C.inkLight, lineHeight: 1.75 }}>
              <strong style={{ color: '#64748b' }}>Fuentes:</strong>{' '}
              Presupuesto 2026 - Provincia de Buenos Aires, Planilla 35 (Presupuesto con Perspectiva de
              Género) · Elaboración propia DatosPBA.
            </p>
          </div>
        </m.div>

      </div>
    </div>
  )
}
