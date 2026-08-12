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

/* Fondo de Financiamiento Educativo acumulado enero-diciembre 2025 y población
   del Censo 2022. `fondo` va en millones de pesos; `perCapita`, en pesos por
   habitante. */
const TOP15 = [
  { pos: 1,  muni: 'Pila',                   pob: 4642,  fondo: 752,   perCapita: 161960 },
  { pos: 2,  muni: 'General Guido',          pob: 3174,  fondo: 508,   perCapita: 159918 },
  { pos: 3,  muni: 'General Lavalle',        pob: 4870,  fondo: 677,   perCapita: 138969 },
  { pos: 4,  muni: 'Tordillo',               pob: 2542,  fondo: 303,   perCapita: 119093 },
  { pos: 5,  muni: 'Guaminí',                pob: 11801, fondo: 1277,  perCapita: 108234 },
  { pos: 6,  muni: 'General La Madrid',      pob: 11618, fondo: 1161,  perCapita: 99953  },
  { pos: 7,  muni: 'Tapalqué',               pob: 10783, fondo: 1073,  perCapita: 99509  },
  { pos: 8,  muni: 'Ayacucho',               pob: 21977, fondo: 1883,  perCapita: 85696  },
  { pos: 9,  muni: 'Laprida',                pob: 11646, fondo: 982,   perCapita: 84317  },
  { pos: 10, muni: 'Carlos Tejedor',         pob: 14079, fondo: 1169,  perCapita: 83047  },
  { pos: 11, muni: 'General Alvear',         pob: 13031, fondo: 1079,  perCapita: 82823  },
  { pos: 12, muni: 'Adolfo Gonzales Chaves', pob: 12914, fondo: 1061,  perCapita: 82162  },
  { pos: 13, muni: 'Lobería',                pob: 18243, fondo: 1488,  perCapita: 81541  },
  { pos: 14, muni: 'Villarino',              pob: 32717, fondo: 2645,  perCapita: 80838  },
  { pos: 15, muni: 'Adolfo Alsina',          pob: 17552, fondo: 1399,  perCapita: 79714  },
]

/* Los quince últimos son, sin excepción, partidos de los 24 del GBA. */
const BOTTOM15 = [
  { pos: 121, muni: 'Quilmes',              pob: 633391,  fondo: 12874, perCapita: 20326 },
  { pos: 122, muni: 'La Matanza',           pob: 1841247, fondo: 37289, perCapita: 20252 },
  { pos: 123, muni: 'Almirante Brown',      pob: 584827,  fondo: 11798, perCapita: 20174 },
  { pos: 124, muni: 'Hurlingham',           pob: 185641,  fondo: 3653,  perCapita: 19678 },
  { pos: 125, muni: 'Morón',                pob: 331183,  fondo: 6403,  perCapita: 19335 },
  { pos: 126, muni: 'San Fernando',         pob: 171616,  fondo: 3304,  perCapita: 19250 },
  { pos: 127, muni: 'Lanús',                pob: 461267,  fondo: 8713,  perCapita: 18890 },
  { pos: 128, muni: 'Tigre',                pob: 446949,  fondo: 8431,  perCapita: 18863 },
  { pos: 129, muni: 'San Miguel',           pob: 328835,  fondo: 6167,  perCapita: 18754 },
  { pos: 130, muni: 'Malvinas Argentinas',  pob: 350674,  fondo: 6374,  perCapita: 18176 },
  { pos: 131, muni: 'Ituzaingó',            pob: 180232,  fondo: 3068,  perCapita: 17023 },
  { pos: 132, muni: 'General San Martín',   pob: 450575,  fondo: 7528,  perCapita: 16707 },
  { pos: 133, muni: 'Tres de Febrero',      pob: 364176,  fondo: 5911,  perCapita: 16232 },
  { pos: 134, muni: 'San Isidro',           pob: 297282,  fondo: 4311,  perCapita: 14500 },
  { pos: 135, muni: 'Vicente López',        pob: 282281,  fondo: 3762,  perCapita: 13328 },
]

const GRUPOS = [
  { grupo: 'GBA (24 partidos)',           pobPct: 61.9, fondosPct: 49.3 },
  { grupo: 'Resto de la Provincia (111)', pobPct: 38.1, fondosPct: 50.7 },
]

/* Los dos instrumentos de transferencia, lado a lado. La columna de
   coparticipación sale del informe anterior de esta serie. */
const COMPARACION = [
  { concepto: 'Monto repartido en 2025',              copa: '$3.605.037 millones', ffe: '$444.611 millones' },
  { concepto: 'Por habitante, promedio provincial',   copa: '$205.720',            ffe: '$25.372' },
  { concepto: 'Participación del GBA en los fondos',  copa: '46,4%',               ffe: '49,3%' },
  { concepto: 'Por habitante, GBA',                   copa: '$154.122',            ffe: '$20.215' },
  { concepto: 'Por habitante, interior',              copa: '$289.590',            ffe: '$33.753' },
  { concepto: 'Diferencia a favor del interior',      copa: '88%',                 ffe: '67%' },
  { concepto: 'Partidos del GBA entre los 15 últimos', copa: '10 de 15',           ffe: '15 de 15' },
  { concepto: 'Brecha entre el primero y el último',  copa: '12,9 veces',          ffe: '12,2 veces' },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>. Un
   reparto de fondos no tiene dirección deseable propia: todas van en neutro. */
const HERO_STATS = [
  { label: 'Fondo Educativo repartido', valor: '$444.611', unidad: 'millones', polaridad: 'neutro', periodo: 'acumulado enero-diciembre 2025' },
  { label: 'Promedio provincial',       valor: '$25.372', polaridad: 'neutro', periodo: 'por habitante, 135 municipios' },
  { label: 'Brecha entre extremos',     valor: '12,2', unidad: 'veces', polaridad: 'neutro', periodo: 'Pila sobre Vicente López' },
  { label: 'Tamaño frente a la coparticipación', valor: '12,3%', polaridad: 'neutro', periodo: 'de lo repartido por coparticipación bruta' },
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

function ChartTop15() {
  const data = {
    labels: TOP15.map(d => d.muni),
    datasets: [{
      data: TOP15.map(d => Number((d.perCapita / 1000).toFixed(1))),
      backgroundColor: DATA[2],
      borderRadius: 4, barPercentage: 0.72,
    }],
  }
  return (
    <ChartCard
      title="Los 15 municipios con mayor Fondo Educativo por habitante - Acumulado 2025"
      hallazgo="Gráfico de barras horizontales: Pila encabeza el ranking con $161.960 de Fondo Educativo por habitante, seguida por General Guido con $159.918 y General Lavalle con $138.969; el decimoquinto, Adolfo Alsina, recibe $79.714. Los quince son municipios del interior."
      tabla={{
        columnas: ['Municipio', 'Población 2022', 'Fondo Educativo por habitante'],
        filas: TOP15.map(d => [d.muni, fmtNum(d.pob), fmtPesos(d.perCapita)]),
      }}
      ficha={[
        ['Fuente', 'Ministerio de Economía PBA y Dirección Provincial de Estadística'],
        ['Período', 'acumulado enero-diciembre 2025'],
        ['Universo', '135 municipios bonaerenses'],
        ['Unidad', 'miles de $ por habitante (Censo 2022)'],
      ]}
      height={400}
    >
      <Bar
        data={data}
        plugins={[makeHValueLabels(fmtMiles1)]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 44 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtMiles1(ctx.raw)} mil por habitante` } },
          },
          scales: {
            x: { max: 180, ticks: { callback: v => fmtNum(v) }, grid: { color: 'rgba(13,17,23,0.08)' }, title: { display: true, text: 'Miles de $ por habitante', font: { size: 10 } } },
            y: { ticks: { font: { size: 10 } }, grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartGrupos() {
  const data = {
    labels: ['Población (Censo 2022)', 'Fondo Educativo 2025'],
    datasets: [
      { label: 'GBA (24 partidos)', data: [GRUPOS[0].pobPct, GRUPOS[0].fondosPct], backgroundColor: DATA[1], borderRadius: 4, barPercentage: 0.6 },
      { label: 'Resto de la Provincia (111)', data: [GRUPOS[1].pobPct, GRUPOS[1].fondosPct], backgroundColor: DATA[2], borderRadius: 4, barPercentage: 0.6 },
    ],
  }
  return (
    <ChartCard
      title="Participación en la población y en el Fondo Educativo"
      hallazgo="Gráfico de barras: el GBA reúne el 61,9% de la población provincial y recibe el 49,3% del Fondo Educativo, mientras que los 111 municipios restantes tienen el 38,1% de la población y captan el 50,7% del fondo."
      tabla={{
        columnas: ['Grupo', '% de la población', '% del Fondo Educativo'],
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
            y: { max: 75, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(13,17,23,0.08)' } },
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">Ministerio de Economía PBA · Transferencias a municipios · Acumulado 2025</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          El Fondo Educativo municipal,<br />
          medido por habitante
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          El Fondo de Financiamiento Educativo repartió{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>$444.611 millones</strong> entre los 135
          municipios bonaerenses durante 2025. Pila cobró $161.960 por habitante y Vicente López, $13.328.
          Ningún partido del conurbano entra entre los quince primeros.
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
          El Fondo Educativo profundiza la brecha que ya mostraba la coparticipación
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          El Fondo Educativo no se distribuye por los coeficientes históricos de la coparticipación, y aun
          así ordena a los municipios en el mismo sentido, con una disparidad todavía más pronunciada:{' '}
          <strong>los quince primeros por habitante son del interior y los quince últimos son del
          conurbano</strong>, sin una sola excepción. La asimetría territorial del financiamiento municipal
          bonaerense no depende de un régimen en particular. Está en los dos instrumentos a la vez.
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
        El monto por habitante divide el acumulado enero-diciembre de 2025 por la población del{' '}
        <strong style={{ color: C.ink }}>Censo 2022</strong>. No hay proyección poblacional post-censal ni
        ajuste por inflación intra-anual. El indicador reparte el fondo entre toda la población del distrito,
        no entre su matrícula escolar: un municipio con estructura de edades más joven recibe menos pesos por
        alumno de los que sugiere su lugar en la tabla.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        La comparación con la coparticipación bruta toma las cifras del informe anterior de esta serie, con
        la misma fuente y el mismo período. La relación de 12,3% entre los dos fondos y la diferencia de
        $135.468 y $13.538 por habitante entre bloques son cálculos propios sobre esos dos conjuntos de
        datos.
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
        <SH title="Los siete primeros del ranking no llegan a 12.000 habitantes" />
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Pila encabeza la tabla con 4.642 habitantes y $752 millones cobrados en el año. Detrás aparecen
          General Guido, con 3.174 habitantes, y General Lavalle, con 4.870. Entre los quince primeros solo
          dos superan los 20.000 vecinos del Censo 2022: Ayacucho, con 21.977, y Villarino, con 32.717.
        </p>
        <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Los tres primeros puestos se despegan del resto. Pila y General Guido cobran alrededor de $160.000
          por habitante, un 50% más que el quinto de la tabla y más de seis veces el promedio provincial.
          Del cuarto lugar hacia abajo la caída es continua y sin saltos: Adolfo Alsina cierra los quince
          primeros con $79.714, menos de la mitad de lo que recibe Pila.
        </p>
        <DownloadableViz title="Los 15 municipios con mayor Fondo Educativo por habitante - 2025" fuente="Ministerio de Economía PBA y DPE, acumulado 2025">
          <ChartTop15 />
        </DownloadableViz>
      </div>

      {/* EL FONDO DE LA TABLA (fondo blanco alternado) — solo tabla densa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Los quince últimos son los quince, todos del conurbano" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Vicente López cierra el ranking con $13.328 por habitante y San Isidro lo antecede con $14.500.
            En este extremo no hay ninguna ciudad grande del interior, a diferencia de lo que pasa con la
            coparticipación. Adentro del conurbano, además, el tamaño deja de ordenar: Quilmes tiene 633.391
            habitantes y encabeza este grupo con $20.326, mientras Hurlingham, con 185.641, queda tres
            puestos más abajo.
          </p>
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['#', 'Municipio', 'Población 2022', 'Fondo Educativo 2025 (millones de $)', 'Por habitante'].map((h, i) => (
                    <th key={h} style={{ textAlign: i <= 1 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BOTTOM15.map((r, i, arr) => (
                  <tr key={r.muni} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkLight }}>{r.pos}</td>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.muni}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtNum(r.pob)}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtNum(r.fondo)}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600, textAlign: 'right' }}>{fmtPesos(r.perCapita)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FichaTecnica items={[
            ['Fuente', 'Ministerio de Economía PBA y Dirección Provincial de Estadística'],
            ['Período', 'acumulado enero-diciembre 2025'],
            ['Universo', 'puestos 121 a 135 de los 135 municipios, todos del GBA'],
            ['Unidad', 'millones de $ y $ por habitante'],
          ]} />
        </div>
      </div>

      {/* GBA VS RESTO */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="El GBA recibe el 49,3% del fondo con el 61,9% de la población" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Los 24 partidos del conurbano cobraron $219.317 millones y los 111 municipios del interior,
          $225.294 millones. El reparto entre bloques está casi partido al medio, sobre poblaciones que no lo
          están: 10.849.299 habitantes de un lado y 6.674.697 del otro. La diferencia por habitante entre un
          bloque y otro es de $13.538.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5" style={{ maxWidth: 760 }}>
          <CifraCard label="GBA, por habitante" valor="$20.215" polaridad="neutro" periodo="24 partidos, promedio ponderado" />
          <CifraCard label="Interior, por habitante" valor="$33.753" polaridad="neutro" periodo="111 municipios, promedio ponderado" />
          <CifraCard label="Diferencia entre bloques" valor="67%" polaridad="neutro" periodo="a favor del interior" />
        </div>
        <DownloadableViz title="Participación en la población y en el Fondo Educativo - 2025" fuente="Ministerio de Economía PBA y DPE, acumulado 2025">
          <ChartGrupos />
        </DownloadableViz>
      </div>

      {/* LOS DOS FONDOS, LADO A LADO (fondo blanco alternado) */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="La disparidad es más pronunciada que en la coparticipación" />
          <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '0 0 0.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['', 'Coparticipación bruta', 'Fondo Educativo'].map((h, i) => (
                    <th key={h || i} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARACION.map((r, i, arr) => (
                  <tr key={r.concepto} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.concepto}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.copa}</td>
                    <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600, textAlign: 'right' }}>{r.ffe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FichaTecnica items={[
            ['Fuente', 'Ministerio de Economía PBA y Dirección Provincial de Estadística'],
            ['Período', 'acumulado enero-diciembre 2025'],
            ['Universo', '135 municipios, dos instrumentos de transferencia'],
            ['Unidad', 'millones de $, $ por habitante y % del total'],
          ]} />
          <p className="text-base leading-relaxed mt-5 mb-3" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Puestos uno al lado del otro, los dos fondos cuentan la misma historia. El interior recibe 67%
            más por habitante en el fondo educativo, una brecha relativa mayor a la de la coparticipación
            bruta, donde captaba 88% más que el GBA en términos absolutos pero sobre una base de reparto
            distinta. El conurbano concentra el 61,9% de la población y no llega a la mitad de ninguno de
            los dos fondos.
          </p>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La diferencia más nítida está en los extremos del ranking. En la coparticipación, cinco ciudades
            grandes del interior comparten el fondo de la tabla con los partidos del conurbano. Acá no hay
            mezcla en ninguna de las dos puntas: quince municipios del interior arriba, quince partidos del
            GBA abajo. La asimetría territorial en el financiamiento municipal bonaerense no se limita a un
            solo instrumento de transferencia.
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
            Ministerio de Economía de la Provincia de Buenos Aires, Dirección Provincial de Coordinación
            Municipal. "Transferencias de Fondos a los Municipios", columna Fondo de Financ. Educativo,
            acumulado enero-diciembre 2025 · Dirección Provincial de Estadística, Ministerio de Economía de
            la Provincia de Buenos Aires. Población total por municipio, Censo Nacional de Población, Hogares
            y Viviendas 2022 · DatosPBA (2026), "La coparticipación municipal bonaerense, medida por
            habitante" · Elaboración propia DatosPBA · 2026
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
