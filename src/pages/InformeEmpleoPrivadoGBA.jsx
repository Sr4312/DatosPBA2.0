import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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
import { getColorVariacion, VALORACION_HEX } from '@/lib/variacion'

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

/* El empleo es un indicador 'mayor-es-mejor': la suba se pinta con el tono de
   valoración positiva y la caída con el negativo. Chart.js no resuelve
   variables CSS, por eso van los equivalentes hex del sistema. */
const SUBE = VALORACION_HEX.better.base
const CAE  = VALORACION_HEX.worse.base

// ─── DATOS ───────────────────────────────────────────────────

/* Los cinco partidos de mayor suba y los seis de mayor caída porcentual.
   General San Martín no integra el cuadro de niveles: la fuente publica su
   variación porcentual, no los puestos de diciembre de 2023 y 2025. */
const VARIACION_PARTIDOS = [
  { partido: 'Exaltación de la Cruz', pct:  11.62 },
  { partido: 'Marcos Paz',            pct:   6.96 },
  { partido: 'Ezeiza',                pct:   4.20 },
  { partido: 'General Rodríguez',     pct:   1.76 },
  { partido: 'Tres de Febrero',       pct:   1.34 },
  { partido: 'General San Martín',    pct:  -5.82 },
  { partido: 'San Isidro',            pct:  -6.06 },
  { partido: 'San Fernando',          pct:  -7.95 },
  { partido: 'Berisso',               pct: -10.86 },
  { partido: 'Zárate',                pct: -11.18 },
  { partido: 'Ensenada',              pct: -18.85 },
]

const NIVELES_TABLA = [
  {
    grupo: 'Los cinco de mayor suba porcentual',
    filas: [
      { partido: 'Exaltación de la Cruz', d2023: '3.871',  d2025: '4.321',  abs: '+450'    },
      { partido: 'Marcos Paz',            d2023: '3.291',  d2025: '3.520',  abs: '+229'    },
      { partido: 'Ezeiza',                d2023: '31.706', d2025: '33.037', abs: '+1.331'  },
      { partido: 'General Rodríguez',     d2023: '15.435', d2025: '15.707', abs: '+272'    },
      { partido: 'Tres de Febrero',       d2023: '56.850', d2025: '57.609', abs: '+759'    },
    ],
  },
  {
    grupo: 'Los cinco de mayor caída porcentual',
    filas: [
      { partido: 'Ensenada',      d2023: '12.757', d2025: '10.352', abs: '−2.405' },
      { partido: 'Zárate',        d2023: '29.241', d2025: '25.972', abs: '−3.269' },
      { partido: 'Berisso',       d2023: '6.473',  d2025: '5.770',  abs: '−703'   },
      { partido: 'San Fernando',  d2023: '26.151', d2025: '24.071', abs: '−2.080' },
      { partido: 'San Isidro',    d2023: '99.077', d2025: '93.071', abs: '−6.006' },
    ],
  },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. */
const HERO_STATS = [
  { label: 'Empleo privado en el GBA', valor: '−3,1%',  polaridad: 'mayor-es-mejor', periodo: '40 partidos, bienio completo' },
  { label: 'Partidos que perdieron empleo', valor: '33', unidad: 'de 40', polaridad: 'neutro', periodo: 'los otros 7 sumaron puestos' },
  { label: 'Mayor caída: Ensenada', valor: '10.352', unidad: 'puestos', variacion: '−18,9%', polaridad: 'mayor-es-mejor', periodo: 'desde 12.757 en dic. 2023' },
  { label: 'Mayor suba: Exaltación de la Cruz', valor: '4.321', unidad: 'puestos', variacion: '+11,6%', polaridad: 'mayor-es-mejor', periodo: 'desde 3.871 en dic. 2023' },
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

// ─── VALUE LABELS PLUGIN ─────────────────────────────────────

const fmtPct = v =>
  (v > 0 ? '+' : v < 0 ? '−' : '') +
  Math.abs(v).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'

/* Ranking divergente de 11 barras: el eje de valores se reemplaza por una
   columna de valores a la derecha, más la línea de cero como única referencia.
   Con esta cantidad de barras, eje y labels a la vez se pisan en pantallas
   angostas y el sistema de diseño pide uno de los dos, nunca los dos. */
function makeRankLabels(fmt) {
  return {
    id: 'rankLabels',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart
      const x = Math.round(scales.x.getPixelForValue(0)) + 0.5
      ctx.save()
      ctx.strokeStyle = 'rgba(15,23,42,0.35)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, chartArea.top)
      ctx.lineTo(x, chartArea.bottom)
      ctx.stroke()
      ctx.restore()
    },
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.data.datasets.forEach((dataset, di) => {
        chart.getDatasetMeta(di).data.forEach((bar, i) => {
          ctx.save()
          ctx.fillStyle = '#334155'
          ctx.font = 'bold 11px Archivo, sans-serif'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'middle'
          ctx.fillText(fmt(dataset.data[i]), chart.width - 6, bar.y)
          ctx.restore()
        })
      })
    },
  }
}

// ─── CHART ───────────────────────────────────────────────────

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8 }

function ChartVariacion() {
  const data = {
    labels: VARIACION_PARTIDOS.map(d => d.partido),
    datasets: [{
      data: VARIACION_PARTIDOS.map(d => d.pct),
      backgroundColor: VARIACION_PARTIDOS.map(d => (d.pct >= 0 ? SUBE : CAE)),
      borderRadius: 2,
      barPercentage: 0.72,
    }],
  }
  return (
    <ChartCard
      title="Variación del empleo asalariado privado por partido, dic. 2023 - dic. 2025"
      hallazgo="Gráfico de barras horizontales: Exaltación de la Cruz encabeza las subas con +11,62% y Ensenada la caída con −18,85%; entre los partidos de variación extrema, las bajas de Ensenada, Zárate y Berisso superan en magnitud a todas las subas."
      tabla={{
        columnas: ['Partido', 'Variación %'],
        filas: VARIACION_PARTIDOS.map(d => [d.partido, fmtPct(d.pct)]),
      }}
      ficha={[
        ['Fuente', 'OEDE, Ministerio de Capital Humano, sobre SIPA y ARCA'],
        ['Período', 'diciembre de 2023 y diciembre de 2025'],
        ['Universo', 'partidos de mayor y menor variación, sobre los 40 del GBA'],
        ['Unidad', '% de variación de puestos de trabajo registrados'],
      ]}
      legend={[
        { label: 'Sumó empleo privado', color: SUBE },
        { label: 'Perdió empleo privado', color: CAE },
      ]}
      height={400}
    >
      <Bar
        data={data}
        plugins={[makeRankLabels(fmtPct)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 58 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtPct(ctx.raw)}` } },
          },
          scales: {
            x: {
              min: -20, max: 13,
              ticks: { display: false },
              grid: { display: false },
              border: { display: false },
            },
            y: {
              ticks: { font: { size: 11 } },
              grid: { display: false },
              border: { display: false },
              /* Chart.js le da a la escala como máximo el 30% del canvas y en
                 pantallas chicas eso recorta "Exaltación de la Cruz". */
              afterFit(scale) {
                scale.width = Math.max(scale.width, 118)
              },
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">OEDE · SIPA y ARCA · Diciembre 2023 - diciembre 2025</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Empleo asalariado privado<br />
          en los partidos del GBA
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          Entre diciembre de 2023 y diciembre de 2025 el empleo asalariado privado registrado cayó{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>3,1%</strong> en los 40 partidos del GBA. Solo 7 partidos
          cerraron el bienio con más puestos que al comienzo. Los otros 33 perdieron empleo, con caídas que van de
          menos de un punto porcentual a casi diecinueve.
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
            { label: 'Fuente',        val: 'OEDE - Ministerio de Capital Humano' },
            { label: 'Universo',      val: '40 partidos del GBA · sector privado registrado' },
            { label: 'Período',       val: 'dic. 2023 vs. dic. 2025' },
            { label: 'Actualización', val: 'Agosto de 2026' },
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
          Pierde el cordón industrial y gana el segundo cordón
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          El bienio no repartió la pérdida en partes iguales. Los tres partidos que más empleo privado perdieron
          concentran industria naval, petroquímica y metalmecánica pesada, y los que más crecieron son municipios
          chicos del segundo cordón. En Ensenada la baja llegó a <strong>18,9%</strong>, casi uno de cada cinco
          puestos privados registrados. El promedio metropolitano describe poco: son economías locales que se
          mueven en direcciones opuestas.
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
        El universo del ranking son los <strong style={{ color: C.ink }}>40 partidos del GBA</strong>. CABA se informa
        como referencia de contexto y queda fuera de la comparación por no ser un municipio bonaerense. La variación
        se calcula entre diciembre de 2023 y diciembre de 2025, el mismo mes en los dos años, para neutralizar la
        estacionalidad: son 24 meses, el doble de la ventana interanual habitual. Se prioriza la variación porcentual
        sobre la absoluta porque la escala de empleo difiere fuertemente entre partidos, de menos de 2.500 puestos en
        General Las Heras a más de 120.000 en La Matanza.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        El dato se clasifica según el departamento donde la empresa declara que trabaja el personal, no según el
        domicilio de residencia de los trabajadores. La suma del empleo de los partidos{' '}
        <strong style={{ color: C.ink }}>no coincide necesariamente con el total provincial</strong>, conforme la nota
        metodológica de la fuente. Estas cifras describen la evolución del empleo registrado según esta serie y no
        permiten, por sí solas, atribuir la caída a un sector, una política o un evento: eso exigiría cruzarlas con
        datos de estructura productiva sectorial por partido.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeEmpleoPrivadoGBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* LA DISPERSIÓN — prosa y gráfico a lo ancho */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Siete partidos arriba, 33 abajo" />
        <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El Observatorio de Empleo y Dinámica Empresarial (OEDE), que depende de la Secretaría de Trabajo, Empleo y
          Seguridad Social del Ministerio de Capital Humano, publica una serie mensual de empleo asalariado privado
          registrado por partido para toda la región AMBA, construida con los registros del Sistema Integrado
          Previsional Argentino (SIPA) y el Sistema de Simplificación Registral (ARCA). Comparar diciembre contra
          diciembre neutraliza la estacionalidad. Una ventana de 24 meses muestra lo que el corte interanual de 12
          deja afuera.
        </p>
        <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          En esa ventana, 7 de los 40 partidos del GBA sumaron empleo privado y 33 perdieron. La retracción es más
          generalizada que en la comparación de un año. CABA, que la serie releva por separado, cayó 1,4% en el mismo
          período, menos de la mitad de lo que retrocedió el conjunto del conurbano.
        </p>
        <DownloadableViz
          title="Variación del empleo asalariado privado por partido, dic. 2023 - dic. 2025"
          fuente="OEDE, Ministerio de Capital Humano, sobre SIPA y ARCA"
        >
          <ChartVariacion />
        </DownloadableViz>
      </div>

      {/* DE PORCENTAJES A PUESTOS — tabla densa (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="San Isidro perdió 6.006 puestos y Ezeiza ganó 1.331" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El ranking porcentual y el ranking en puestos no coinciden. Una misma cantidad de puestos pesa distinto
            según dónde se pierda o se gane, y por eso los cinco partidos que más crecieron aparecen arriba con
            incrementos de entre 229 y 1.331 puestos: son mercados laborales chicos, donde un movimiento moderado se
            traduce en un porcentaje alto.
          </p>
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Partido', 'Dic. 2023', 'Dic. 2025', 'Variación (puestos)'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              {NIVELES_TABLA.map(bloque => (
                <tbody key={bloque.grupo}>
                  <tr>
                    <td colSpan={4} style={{ padding: '0.6rem 1rem 0.4rem', fontSize: '0.625rem', fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `1px solid ${C.rule}`, borderTop: `1px solid ${C.rule}` }}>
                      {bloque.grupo}
                    </td>
                  </tr>
                  {bloque.filas.map((r, i, arr) => (
                    <tr key={r.partido} style={{ borderBottom: i < arr.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.partido}</td>
                      <td className="tabular-nums" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.d2023}</td>
                      <td className="tabular-nums" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.d2025}</td>
                      <td
                        className="tabular-nums"
                        style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: r.abs, polaridad: 'mayor-es-mejor', texto: true }) }}
                      >
                        {r.abs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <FichaTecnica items={[
            ['Fuente', 'OEDE, Ministerio de Capital Humano, sobre SIPA y ARCA'],
            ['Período', 'diciembre de 2023 y diciembre de 2025'],
            ['Universo', 'los 5 partidos de mayor suba y los 5 de mayor caída porcentual'],
            ['Unidad', 'puestos de trabajo asalariados privados registrados'],
          ]} />
          <p className="text-base leading-relaxed mt-6" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Ezeiza es el de mayor volumen entre los que crecen, con 1.331 puestos más, asociados en buena medida a la
            actividad del Aeropuerto Internacional y su entorno logístico. Tres de Febrero, con una escala de empleo
            muy superior a la del resto del grupo, es el único partido del primer cordón que termina el bienio en
            positivo. Del lado de las caídas, San Isidro concentra la mayor pérdida absoluta de los cinco, 6.006
            puestos, aun con la baja porcentual más leve del grupo (−6,1%).
          </p>
        </div>
      </div>

      {/* LO QUE EL RANKING NO MUESTRA — párrafo, cifras y cierre analítico */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Marcos Paz crece 7% y sigue 19,6% abajo de 2019" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El ranking del bienio deja afuera de dónde viene cada partido. Marcos Paz es el segundo de mayor crecimiento
          porcentual, pero su empleo privado sigue por debajo del que registraba en diciembre de 2019. Crecer sobre un
          piso hundido devuelve porcentajes altos y pocos puestos.
        </p>
        <div className="mb-6" style={{ maxWidth: 320 }}>
          <CifraCard
            label="Marcos Paz, contra 2019"
            valor="3.520"
            unidad="puestos"
            variacion="−19,6%"
            polaridad="mayor-es-mejor"
            periodo="desde 4.378 en dic. 2019"
            fuente="OEDE, serie mensual por departamento"
          />
        </div>
        <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          En el norte del primer cordón la caída es persistente: San Fernando pierde 8,0% de su empleo privado
          registrado, San Isidro 6,1% y General San Martín 5,8%. Ninguno de los cinco partidos de mayor caída del
          bienio aparece entre los de mayor crecimiento, a diferencia de lo que ocurre en la comparación de un año.
          El deterioro de este grupo se parece más a un proceso estructural que a un movimiento de coyuntura.
        </p>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Para la discusión pública provincial el dato tiene un uso concreto. Los partidos que hoy pierden empleo
          privado son los que sostienen la matriz industrial del conurbano, y ahí se mueven juntas la recaudación
          municipal, la demanda de programas de empleo y la presión sobre los servicios locales. Un promedio
          metropolitano no habilita a leer la misma situación en Ensenada que en Ezeiza, y cualquier política de
          empleo que se diseñe para el GBA como bloque único va a pegarle a dos realidades distintas.
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
            Observatorio de Empleo y Dinámica Empresarial (OEDE), Dirección Nacional de Estudios y Estadísticas
            Laborales, Secretaría de Trabajo, Empleo y Seguridad Social, Ministerio de Capital Humano. Serie de empleo
            asalariado registrado por departamento, región AMBA, sector privado, puestos de trabajo, serie mensual,
            sobre la base del Sistema Integrado Previsional Argentino (SIPA) y el Sistema de Simplificación Registral
            (ARCA) · Elaboración propia DatosPBA · Agosto de 2026
          </p>
        </div>
      </div>
    </div>
  )
}
