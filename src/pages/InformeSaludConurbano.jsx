import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft, ExternalLink, Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import {
  Chart as ChartJS,
  ArcElement,
  DoughnutController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(
  ArcElement, DoughnutController, CategoryScale, LinearScale, BarElement, Tooltip, Legend
)

ChartJS.defaults.font.family = 'Poppins, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'

// chrome / layout
const C = {
  bg:       'var(--c-bg)',
  ink:      'var(--c-ink)',
  inkMid:   'var(--c-ink-mid)',
  inkLight: 'var(--c-ink-light)',
  rule:     'var(--c-rule)',
  card:     'var(--c-surface)',
  hero:     '#0a1628',
  accent:   '#3d65b2',
}

// data palette - sobria, alineada con los otros informes
const D = {
  good:      '#0f766e',   // teal-700 - bien gestionado
  goodSoft:  '#6ee7b7',   // emerald-300 (mate)
  goodBg:    '#d1fae5',
  bad:       '#9f1239',   // rose-800 - mal gestionado (sobrio)
  badSoft:   '#fda4af',   // rose-300 (mate)
  badBg:     '#fee2e2',
  warn:      '#b45309',   // amber-700
  warnBg:    '#fef3c7',
  info:      '#1e3a8a',   // blue-900 (sobrio)
  purple:    '#5b21b6',
  rose:      '#9f1239',
  neutral:   '#475569',
}

// ───── DATA ────────────────────────────────────────────────────
// Source: PEC - Programa de Estudios del Conurbano (CSV crudo)
const RAW = [
  { name: 'Almirante Brown',     pop: 583209,  est: 52, conCob: 354650, sinCob: 228559, obraSocial: 340102, planEstatal: 14548 },
  { name: 'Avellaneda',          pop: 366117,  est: 57, conCob: 263343, sinCob: 102774, obraSocial: 254751, planEstatal:  8592 },
  { name: 'Berazategui',         pop: 358328,  est: 49, conCob: 229138, sinCob: 129190, obraSocial: 220299, planEstatal:  8839 },
  { name: 'Esteban Echeverría',  pop: 337880,  est: 39, conCob: 197806, sinCob: 140074, obraSocial: 188493, planEstatal:  9313 },
  { name: 'Ezeiza',              pop: 198620,  est: 32, conCob: 116949, sinCob:  81671, obraSocial: 110475, planEstatal:  6474 },
  { name: 'Florencio Varela',    pop: 488103,  est: 59, conCob: 252121, sinCob: 235982, obraSocial: 237275, planEstatal: 14846 },
  { name: 'Gral. San Martín',    pop: 444503,  est: 45, conCob: 304625, sinCob: 139878, obraSocial: 294230, planEstatal: 10395 },
  { name: 'Hurlingham',          pop: 185361,  est: 17, conCob: 126249, sinCob:  59112, obraSocial: 122415, planEstatal:  3834 },
  { name: 'Ituzaingó',           pop: 177983,  est: 25, conCob: 131134, sinCob:  46849, obraSocial: 127955, planEstatal:  3179 },
  { name: 'José C. Paz',         pop: 326527,  est: 44, conCob: 174136, sinCob: 152391, obraSocial: 164783, planEstatal:  9353 },
  { name: 'La Matanza',          pop: 1837168, est: 90, conCob: 990785, sinCob: 846383, obraSocial: 936082, planEstatal: 54703 },
  { name: 'Lanús',               pop: 460081,  est: 61, conCob: 330862, sinCob: 129219, obraSocial: 319009, planEstatal: 11853 },
  { name: 'Lomas de Zamora',     pop: 685644,  est: 70, conCob: 425001, sinCob: 260643, obraSocial: 405869, planEstatal: 19132 },
  { name: 'Malvinas Argentinas', pop: 349401,  est: 52, conCob: 207984, sinCob: 141417, obraSocial: 199426, planEstatal:  8558 },
  { name: 'Merlo',               pop: 581484,  est: 44, conCob: 311186, sinCob: 270298, obraSocial: 298071, planEstatal: 13115 },
  { name: 'Moreno',              pop: 575758,  est: 60, conCob: 286497, sinCob: 289261, obraSocial: 271164, planEstatal: 15333 },
  { name: 'Morón',               pop: 329517,  est: 31, conCob: 255603, sinCob:  73914, obraSocial: 250260, planEstatal:  5343 },
  { name: 'Quilmes',             pop: 631774,  est: 71, conCob: 405778, sinCob: 225996, obraSocial: 389244, planEstatal: 16534 },
  { name: 'San Fernando',        pop: 171099,  est: 34, conCob: 118187, sinCob:  52912, obraSocial: 113605, planEstatal:  4582 },
  { name: 'San Isidro',          pop: 295978,  est: 27, conCob: 238818, sinCob:  57160, obraSocial: 232490, planEstatal:  6328 },
  { name: 'San Miguel',          pop: 327650,  est: 33, conCob: 210725, sinCob: 116925, obraSocial: 202598, planEstatal:  8127 },
  { name: 'Tigre',               pop: 446291,  est: 37, conCob: 307228, sinCob: 139063, obraSocial: 295839, planEstatal: 11389 },
  { name: 'Tres de Febrero',     pop: 362319,  est: 27, conCob: 263779, sinCob:  98540, obraSocial: 256381, planEstatal:  7398 },
  { name: 'Vicente López',       pop: 280541,  est: 32, conCob: 242565, sinCob:  37976, obraSocial: 238072, planEstatal:  4493 },
]

// "Dependientes del sistema público" = sin cobertura formal (no_tiene_cobertura_salud).
// Se usa la columna directa del CSV: la población que NO declara obra social, prepaga,
// PAMI ni programa estatal. Es la métrica más estricta y la que usa el doughnut.
const MUNIS = RAW.map(m => {
  const depPublico = m.sinCob
  const carga = depPublico / m.est
  const estPer10k = (m.est / m.pop) * 10000
  const pctDepPublico = (depPublico / m.pop) * 100
  return { ...m, depPublico, carga, estPer10k, pctDepPublico }
})

const TOT = {
  pop: 10801336,
  est: 1088,
  conCob: 6745149,
  sinCob: 4056187,
  obraSocial: 6468888,
  planEstatal: 276261,
}
TOT.depPublico = TOT.sinCob
const AVG_CARGA = TOT.depPublico / TOT.est // ≈ 3.728
const PCT_DEP_PUBLICO = (TOT.depPublico / TOT.pop) * 100 // ≈ 37.6

const SORTED = [...MUNIS].sort((a, b) => a.carga - b.carga)
const BEST = SORTED.slice(0, 5)
const WORST = SORTED.slice(-5).reverse()

const SORTED_PRE = [...MUNIS].sort((a, b) => a.carga - b.carga)
const BRECHA = SORTED_PRE[SORTED_PRE.length - 1].carga / SORTED_PRE[0].carga

// HERO stats - se calculan dinámicamente desde los datos
const HERO_STATS = [
  { n: '4,1 M',                                          label: 'personas sin cobertura formal en el conurbano',           color: '#fda4af' },
  { n: TOT.est.toLocaleString('es-AR'),                  label: 'establecimientos públicos en los 24 partidos',           color: '#93c5fd' },
  { n: Math.round(AVG_CARGA).toLocaleString('es-AR'),    label: 'personas por establecimiento - promedio conurbano',      color: '#fcd34d' },
  { n: BRECHA.toFixed(1).replace('.', ',') + '×',        label: 'brecha entre el mejor y el peor partido',                color: '#6ee7b7' },
]

// ───── animation ───────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

// ───── DOWNLOAD HELPER ─────────────────────────────────────────
// Estilo idéntico a VizCard de DataPBA: título + fuente arriba, footer azul abajo.
const DL_PADDING = 60
const DL_FOOTER_H = 56
const DL_MIN_W = 1200
const FUENTE_DEFAULT = 'PEC - Programa de Estudios del Conurbano'

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
  const captured = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })
  const upscale = Math.max(1, DL_MIN_W / captured.width)
  const innerW = Math.round(captured.width * upscale)
  const innerH = Math.round(captured.height * upscale)
  const titleH = fuente ? 96 : 72
  const W = innerW
  const H = innerH + titleH + DL_FOOTER_H

  const out = document.createElement('canvas')
  out.width = W
  out.height = H
  const ctx = out.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Title
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

// Wrapper que agrega un botón de descarga sobre cualquier visualización.
function DownloadableViz({ title, fuente = FUENTE_DEFAULT, children }) {
  const ref = useRef(null)
  const btnRef = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    if (!ref.current || busy) return
    setBusy(true)
    if (btnRef.current) btnRef.current.style.visibility = 'hidden'
    try {
      await downloadVizContainer(ref.current, title, fuente)
    } catch (e) { console.error(e) }
    if (btnRef.current) btnRef.current.style.visibility = ''
    setBusy(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={btnRef} style={{
        display: 'flex', justifyContent: 'flex-end', marginBottom: 8,
      }}>
        <button
          onClick={handleDownload}
          disabled={busy}
          title="Descargar PNG con marca DatosPBA"
          style={{
            background: '#fff',
            border: `1px solid ${C.rule}`,
            borderRadius: 8,
            padding: '6px 10px',
            cursor: busy ? 'wait' : 'pointer',
            color: C.inkMid,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.72rem', fontWeight: 600,
            transition: 'color 0.15s, border-color 0.15s',
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

const fmt = n => Math.round(n).toLocaleString('es-AR')

// ───────────────── HERO ──────────────────────────────────────
function Hero() {
  return (
    <div className="bg-pattern-dark" style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <Link
          to="/informes"
          className="inline-flex items-center gap-1.5 text-sm no-underline mb-10"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <m.div {...fadeUp(0)}>
          <SectionLabel dark>PEC · Programa de Estudios del Conurbano · Salud pública</SectionLabel>
        </m.div>

        <m.h1
          {...fadeUp(0.05)}
          className="font-display"
          style={{
            fontSize: 'clamp(2rem, 4.6vw, 3.2rem)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.12, marginBottom: 20, maxWidth: 820,
          }}
        >
          La salud que se gestiona<br />
          <span style={{ color: D.goodSoft }}>y la que se desborda:</span><br />
          <span style={{ color: D.badSoft }}>1.088 establecimientos para 4,1 M de personas</span>
        </m.h1>

        <m.p
          {...fadeUp(0.1)}
          style={{
            color: 'rgba(255,255,255,0.60)', maxWidth: 720,
            lineHeight: 1.7, fontSize: '1.05rem',
          }}
        >
          En los 24 partidos del conurbano bonaerense viven{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>10,8 millones de personas</strong>.
          De ellas, <strong style={{ color: 'rgba(255,255,255,0.9)' }}>4,1 millones</strong> no tienen obra social,
          prepaga ni PAMI: dependen exclusivamente del sistema público de salud. Para atenderlas existen{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>1.088 establecimientos públicos</strong>. Pero la
          distribución no responde a la demanda: hay partidos con un establecimiento cada 1.200 personas y otros con uno cada 9.400.
        </m.p>

        <m.div
          {...fadeUp(0.15)}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
        >
          {HERO_STATS.map((s, i) => (
            <m.div
              key={i}
              {...fadeUp(0.1 * i + 0.2)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 16,
              }}
              className="p-5"
            >
              <div className="font-display text-4xl font-bold mb-1" style={{ color: s.color }}>{s.n}</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.45 }}>{s.label}</p>
            </m.div>
          ))}
        </m.div>

        <m.div
          {...fadeUp(0.3)}
          style={{
            display: 'flex', gap: 32, marginTop: 28,
            paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Fuente',     val: 'PEC - Programa de Estudios del Conurbano' },
            { label: 'Cobertura',  val: '24 partidos del Gran Buenos Aires' },
            { label: 'Período',    val: 'Censo 2022 + relevamiento PEC 2025' },
            { label: 'Actualizado',val: 'Abril 2026' },
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

// ───────────────── COBERTURA DOUGHNUT ────────────────────────
function CoberturaDonut() {
  const sinCobPct = (TOT.sinCob / TOT.pop) * 100
  const obraSocialPct = (TOT.obraSocial / TOT.pop) * 100
  const planEstatalPct = (TOT.planEstatal / TOT.pop) * 100

  const data = {
    labels: ['Obra social / Prepaga / PAMI', 'Sin cobertura formal', 'Programas estatales'],
    datasets: [{
      data: [TOT.obraSocial, TOT.sinCob, TOT.planEstatal],
      backgroundColor: [D.info, D.bad, D.warn],
      borderColor: '#fff',
      borderWidth: 3,
    }],
  }
  const opts = {
    responsive: true, maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
        padding: 12, cornerRadius: 8,
        callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw/TOT.pop)*100).toFixed(1)}%)` },
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <m.div {...fadeUp(0.05)} className="relative mx-auto" style={{ width: 250, height: 250 }}>
        <Doughnut data={data} options={opts} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display text-4xl font-bold" style={{ color: D.bad }}>{PCT_DEP_PUBLICO.toFixed(1).replace('.', ',')}%</span>
          <span style={{ fontSize: '0.72rem', color: C.inkMid, marginTop: 4, textAlign: 'center' }}>
            sin cobertura<br/>formal de salud
          </span>
        </div>
      </m.div>

      <m.div {...fadeUp(0.15)} className="space-y-4">
        {[
          { color: D.info, label: 'Obra social, prepaga o PAMI', val: TOT.obraSocial, pct: obraSocialPct, desc: 'Acceso vía sector privado o PAMI. No depende de la red pública para la atención corriente.' },
          { color: D.bad,  label: 'Sin cobertura formal',        val: TOT.sinCob,     pct: sinCobPct,    desc: 'No declara obra social, prepaga ni programa. Toda su atención sale de hospitales y centros públicos municipales / provinciales.' },
          { color: D.warn, label: 'Programas o planes estatales',val: TOT.planEstatal,pct: planEstatalPct,desc: 'PROFE, Incluir Salud, Cobertura Universal de Salud y similares. Operan sobre la red pública.' },
        ].map((row, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${row.color}`, paddingLeft: 14, paddingTop: 4, paddingBottom: 4 }}>
            <div className="flex items-baseline justify-between gap-3">
              <span style={{ color: C.ink, fontWeight: 600, fontSize: '0.92rem' }}>{row.label}</span>
              <span className="font-display" style={{ color: row.color, fontSize: '1.5rem', fontWeight: 700 }}>{row.pct.toFixed(1)}%</span>
            </div>
            <p style={{ color: C.inkMid, fontSize: '0.78rem', marginTop: 4, lineHeight: 1.5 }}>{row.desc}</p>
            <p style={{ color: C.inkLight, fontSize: '0.7rem', marginTop: 2 }}>{fmt(row.val)} personas</p>
          </div>
        ))}
      </m.div>
    </div>
  )
}

// ───────────────── BARÓMETRO DE CARGA SANITARIA (custom SVG) ─────────────
// Diverging dot plot - cada partido como punto sobre un eje horizontal,
// con una línea que lo conecta al promedio del conurbano. Color por desvío.
function BarometroCarga() {
  const W = 900, H = 640
  const padL = 150, padR = 90, padT = 64, padB = 38
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const maxCarga = 11000
  const xScale = v => padL + (v / maxCarga) * innerW
  const rowH = innerH / SORTED.length

  // Colors based on deviation
  const colorFor = c => {
    const dev = (c - AVG_CARGA) / AVG_CARGA
    if (dev <= -0.4) return D.good
    if (dev <= -0.15) return D.goodSoft
    if (dev <= 0.15) return D.neutral
    if (dev <= 0.40) return D.warn
    return D.bad
  }

  const ticks = [0, 2000, 4000, 6000, 8000, 10000]

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: 16, overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
        {/* grid + ticks */}
        {ticks.map(t => (
          <g key={t}>
            <line x1={xScale(t)} y1={padT} x2={xScale(t)} y2={H - padB}
                  stroke={C.rule} strokeWidth={1} strokeDasharray={t === 0 ? 'none' : '2 4'} />
            <text x={xScale(t)} y={H - padB + 22} textAnchor="middle"
                  fontSize="11" fill={C.inkLight} fontFamily="Poppins, sans-serif">
              {fmt(t)}
            </text>
          </g>
        ))}

        {/* zone bands */}
        <rect x={padL} y={padT} width={xScale(AVG_CARGA) - padL} height={innerH}
              fill={D.goodBg} opacity={0.35} />
        <rect x={xScale(AVG_CARGA)} y={padT} width={padL + innerW - xScale(AVG_CARGA)} height={innerH}
              fill={D.badBg} opacity={0.30} />

        {/* avg reference */}
        <line x1={xScale(AVG_CARGA)} y1={padT - 6} x2={xScale(AVG_CARGA)} y2={H - padB + 4}
              stroke={D.warn} strokeWidth={2} strokeDasharray="5 4" />

        {/* HEADER ROW: zone labels + promedio badge - alineados arriba del rect */}
        <text x={padL + 10} y={padT - 16} fontSize="9.5" fill={D.good}
              fontFamily="Poppins, sans-serif" fontWeight="700" letterSpacing="0.8">
          GESTIONA MEJOR
        </text>
        <text x={padL + 10} y={padT - 4} fontSize="8.5" fill={D.good}
              fontFamily="Poppins, sans-serif" opacity={0.75}>
          menos carga por establecimiento
        </text>

        <rect x={xScale(AVG_CARGA) - 55} y={padT - 26} width={110} height={20}
              fill={D.warn} rx={4} />
        <text x={xScale(AVG_CARGA)} y={padT - 11} textAnchor="middle"
              fontSize="11" fill="#fff" fontWeight="700" fontFamily="Poppins, sans-serif">
          PROMEDIO {fmt(AVG_CARGA)}
        </text>

        <text x={padL + innerW - 10} y={padT - 16} fontSize="9.5" fill={D.bad}
              fontFamily="Poppins, sans-serif" fontWeight="700" letterSpacing="0.8" textAnchor="end">
          GESTIONA PEOR
        </text>
        <text x={padL + innerW - 10} y={padT - 4} fontSize="8.5" fill={D.bad}
              fontFamily="Poppins, sans-serif" opacity={0.75} textAnchor="end">
          más carga por establecimiento
        </text>

        {/* axis title */}
        <text x={padL + innerW / 2} y={H - 4} textAnchor="middle"
              fontSize="11" fill={C.inkMid} fontFamily="Poppins, sans-serif" fontWeight="600">
          personas dependientes del sistema público por establecimiento
        </text>

        {/* rows */}
        {SORTED.map((mu, i) => {
          const y = padT + i * rowH + rowH / 2
          const x = xScale(mu.carga)
          const xAvg = xScale(AVG_CARGA)
          const c = colorFor(mu.carga)
          const isWorse = mu.carga > AVG_CARGA
          return (
            <g key={mu.name}>
              {/* label */}
              <text x={padL - 12} y={y + 4} textAnchor="end"
                    fontSize="11.5" fontFamily="Poppins, sans-serif"
                    fill={C.inkMid} fontWeight="500">
                {mu.name}
              </text>
              {/* connector */}
              <line x1={xAvg} y1={y} x2={x} y2={y}
                    stroke={c} strokeWidth={2} opacity={0.55} />
              {/* dot */}
              <circle cx={x} cy={y} r={6.5} fill={c} stroke="#fff" strokeWidth={1.5} />
              {/* value */}
              <text x={x + (isWorse ? 11 : -11)} y={y + 3.5}
                    textAnchor={isWorse ? 'start' : 'end'}
                    fontSize="11" fill={c} fontWeight="700"
                    fontFamily="Poppins, sans-serif">
                {fmt(mu.carga)}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="flex flex-wrap gap-4 mt-2 px-2 text-[11px]" style={{ color: C.inkMid }}>
        <div className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, borderRadius: '50%', background: D.good, display: 'inline-block' }} /> Carga muy baja (&lt; 60% del promedio)</div>
        <div className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, borderRadius: '50%', background: D.goodSoft, display: 'inline-block' }} /> Carga baja</div>
        <div className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, borderRadius: '50%', background: D.neutral, display: 'inline-block' }} /> Cerca del promedio</div>
        <div className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, borderRadius: '50%', background: D.warn, display: 'inline-block' }} /> Carga alta</div>
        <div className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, borderRadius: '50%', background: D.bad, display: 'inline-block' }} /> Carga muy alta (&gt; 40% sobre promedio)</div>
      </div>
    </div>
  )
}

// ───────────────── CUADRANTE DE GESTIÓN (scatter SVG) ──────────────
// X = pob dependiente del público, Y = establecimientos.
// La línea diagonal representa la proporción óptima (promedio del conurbano).
// Por encima de la línea = bien gestionado (más establecimientos que el promedio para esa demanda).
// Por debajo = mal gestionado.
function CuadranteGestion() {
  const W = 880, H = 540
  const padL = 64, padR = 28, padT = 28, padB = 54
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const xMax = 1000000  // habitantes dependientes (La Matanza ≈ 901k)
  const yMax = 100      // establecimientos

  const xScale = v => padL + (v / xMax) * innerW
  const yScale = v => padT + innerH - (v / yMax) * innerH

  // Diagonal "óptimo" - y = x / AVG_CARGA
  // En xMax: y = xMax / AVG_CARGA = 1_000_000 / 3982 ≈ 251 (excede yMax)
  // Tomamos el punto donde la diagonal cruza yMax = 100
  const xWhereYmax = yMax * AVG_CARGA  // ≈ 398_200
  const diagX1 = xScale(0), diagY1 = yScale(0)
  const diagX2 = xScale(xWhereYmax), diagY2 = yScale(yMax)

  const [hovered, setHovered] = useState(null)

  // bubble radius based on poblacion total (scale to 4-22 range)
  const popMax = Math.max(...MUNIS.map(m => m.pop))
  const popMin = Math.min(...MUNIS.map(m => m.pop))
  const radius = pop => 5 + ((pop - popMin) / (popMax - popMin)) * 18

  const ticksX = [0, 200000, 400000, 600000, 800000, 1000000]
  const ticksY = [0, 20, 40, 60, 80, 100]

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: 16 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* zona BIEN gestionado (arriba de la diagonal) */}
        <polygon
          points={`${padL},${padT} ${diagX2},${diagY2} ${padL},${diagY2}`}
          fill={D.goodBg} opacity={0.45}
        />
        {/* zona MAL gestionado (debajo de la diagonal) */}
        <polygon
          points={`${diagX1},${diagY1} ${padL + innerW},${padT + innerH} ${diagX2},${diagY2} ${padL + innerW},${diagY2}`}
          fill={D.badBg} opacity={0.40}
        />

        {/* grid */}
        {ticksX.map(t => (
          <g key={`x-${t}`}>
            <line x1={xScale(t)} y1={padT} x2={xScale(t)} y2={H - padB}
                  stroke={C.rule} strokeWidth={1} strokeDasharray="2 4" />
            <text x={xScale(t)} y={H - padB + 16} textAnchor="middle"
                  fontSize="10.5" fill={C.inkLight} fontFamily="Poppins, sans-serif">
              {t === 0 ? '0' : (t/1000)+'k'}
            </text>
          </g>
        ))}
        {ticksY.map(t => (
          <g key={`y-${t}`}>
            <line x1={padL} y1={yScale(t)} x2={padL + innerW} y2={yScale(t)}
                  stroke={C.rule} strokeWidth={1} strokeDasharray="2 4" />
            <text x={padL - 8} y={yScale(t) + 4} textAnchor="end"
                  fontSize="10.5" fill={C.inkLight} fontFamily="Poppins, sans-serif">
              {t}
            </text>
          </g>
        ))}

        {/* axis box */}
        <rect x={padL} y={padT} width={innerW} height={innerH}
              fill="none" stroke={C.inkLight} strokeWidth={0.5} opacity={0.5} />

        {/* DIAGONAL ÓPTIMO */}
        <line x1={diagX1} y1={diagY1} x2={diagX2} y2={diagY2}
              stroke={D.warn} strokeWidth={2.2} strokeDasharray="6 4" />

        {/* zone labels - separados de la diagonal para evitar choques */}
        <text x={padL + innerW * 0.18} y={padT + 22} fontSize="9.5" fontWeight="700"
              fill={D.good} letterSpacing="0.6" fontFamily="Poppins, sans-serif" textAnchor="middle">
          ✓ MEJOR GESTIÓN
        </text>
        <text x={padL + innerW * 0.18} y={padT + 36} fontSize="8.5"
              fill={D.good} fontFamily="Poppins, sans-serif" textAnchor="middle" opacity="0.7">
          más oferta para la demanda
        </text>
        <text x={padL + innerW - 14} y={padT + innerH - 24} fontSize="9.5" fontWeight="700"
              fill={D.bad} letterSpacing="0.6" fontFamily="Poppins, sans-serif" textAnchor="end">
          ✗ PEOR GESTIÓN
        </text>
        <text x={padL + innerW - 14} y={padT + innerH - 10} fontSize="8.5"
              fill={D.bad} fontFamily="Poppins, sans-serif" textAnchor="end" opacity="0.7">
          demanda no atendida
        </text>

        {/* badge "promedio" - al lado del extremo superior de la diagonal, dentro del área */}
        <g>
          <rect x={diagX2 + 8} y={diagY2 + 4} width={120} height={20}
                fill={D.warn} rx={3} opacity={0.92} />
          <text x={diagX2 + 68} y={diagY2 + 18} textAnchor="middle"
                fontSize="9.5" fill="#fff" fontWeight="700"
                fontFamily="Poppins, sans-serif">
            promedio: {fmt(AVG_CARGA)} / est.
          </text>
        </g>

        {/* axis titles */}
        <text x={padL + innerW / 2} y={H - 8} textAnchor="middle"
              fontSize="11.5" fontWeight="600" fill={C.inkMid}
              fontFamily="Poppins, sans-serif">
          Habitantes dependientes del sistema público
        </text>
        <text x={18} y={padT + innerH / 2} textAnchor="middle"
              fontSize="11.5" fontWeight="600" fill={C.inkMid}
              fontFamily="Poppins, sans-serif"
              transform={`rotate(-90 18 ${padT + innerH / 2})`}>
          Establecimientos públicos de salud
        </text>

        {/* bubbles */}
        {MUNIS.map(mu => {
          const cx = xScale(mu.depPublico)
          const cy = yScale(mu.est)
          const r = radius(mu.pop)
          const isWorse = mu.carga > AVG_CARGA
          const fill = isWorse ? D.bad : D.good
          const isHov = hovered === mu.name
          return (
            <g key={mu.name}
               onMouseEnter={() => setHovered(mu.name)}
               onMouseLeave={() => setHovered(null)}
               style={{ cursor: 'pointer' }}>
              <circle cx={cx} cy={cy} r={r}
                      fill={fill} fillOpacity={isHov ? 0.55 : 0.30}
                      stroke={fill} strokeWidth={isHov ? 2.5 : 1.5} />
            </g>
          )
        })}

        {/* labels for outliers + hovered (solo los más extremos para evitar solapes) */}
        {MUNIS.map(mu => {
          const showAlways = mu.name === 'La Matanza' || mu.name === 'Vicente López'
            || mu.name === 'Merlo' || mu.name === 'Moreno'
          const isHov = hovered === mu.name
          if (!showAlways && !isHov) return null
          const cx = xScale(mu.depPublico)
          const cy = yScale(mu.est)
          const r = radius(mu.pop)
          return (
            <g key={mu.name + '-l'}>
              <text x={cx} y={cy - r - 6} textAnchor="middle"
                    fontSize="10" fontWeight="700" fill={C.ink}
                    fontFamily="Poppins, sans-serif"
                    style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}>
                {mu.name}
              </text>
            </g>
          )
        })}

        {/* hovered tooltip box */}
        {hovered && (() => {
          const mu = MUNIS.find(m => m.name === hovered)
          const tx = Math.min(xScale(mu.depPublico) + 14, padL + innerW - 220)
          const ty = Math.max(yScale(mu.est) - 60, padT + 8)
          return (
            <g>
              <rect x={tx} y={ty} width={210} height={64} rx={6}
                    fill={C.ink} opacity={0.95} />
              <text x={tx + 10} y={ty + 18} fontSize="11.5" fontWeight="700"
                    fill="#fff" fontFamily="Poppins, sans-serif">{mu.name}</text>
              <text x={tx + 10} y={ty + 34} fontSize="10" fill="#cbd5e1"
                    fontFamily="Poppins, sans-serif">
                {fmt(mu.depPublico)} dependientes · {mu.est} establec.
              </text>
              <text x={tx + 10} y={ty + 50} fontSize="10" fontWeight="600"
                    fill={mu.carga > AVG_CARGA ? D.badSoft : D.goodSoft}
                    fontFamily="Poppins, sans-serif">
                {fmt(mu.carga)} personas / establecimiento
              </text>
            </g>
          )
        })()}
      </svg>

      <p className="text-[11px] text-slate-400 mt-2 px-2 leading-snug">
        El tamaño de cada círculo es proporcional a la población total del partido. Pasá el mouse sobre cualquier burbuja para ver su detalle.
      </p>
    </div>
  )
}

// ───────────────── BALANZA EXTREMA (custom SVG) ──────────────
// Comparación visual entre el partido mejor gestionado y el peor.
function BalanzaExtrema() {
  const best = SORTED[0]      // Vicente López
  const worst = SORTED[SORTED.length - 1]  // La Matanza

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[
        { side: best, color: D.good, bg: D.goodBg, label: 'MEJOR GESTIÓN', position: 'mejor' },
        { side: worst, color: D.bad, bg: D.badBg, label: 'PEOR GESTIÓN',   position: 'peor' },
      ].map((b, i) => (
        <m.div
          key={b.side.name}
          {...fadeUp(0.08 * i)}
          style={{
            background: '#fff', border: `1px solid ${C.rule}`,
            borderRadius: 20, overflow: 'hidden',
          }}
        >
          <div style={{ height: 5, background: b.color }} />
          <div style={{ padding: '26px 26px 28px' }}>
            <div className="flex items-center gap-2 mb-1">
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: b.color }} />
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, color: b.color,
                textTransform: 'uppercase', letterSpacing: '0.12em',
              }}>{b.label}</span>
            </div>
            <h3 className="font-display" style={{ fontSize: '1.85rem', fontWeight: 700, color: C.ink, lineHeight: 1.1, marginBottom: 14 }}>
              {b.side.name}
            </h3>

            {/* la métrica clave */}
            <div style={{ background: b.bg, borderRadius: 14, padding: '18px 18px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: '0.7rem', color: b.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                personas dependientes / establecimiento
              </p>
              <div className="font-display" style={{ fontSize: '3.4rem', fontWeight: 700, color: b.color, lineHeight: 1 }}>
                {fmt(b.side.carga)}
              </div>
              <p style={{ fontSize: '0.78rem', color: C.inkMid, marginTop: 6, lineHeight: 1.5 }}>
                {b.position === 'mejor'
                  ? `${(AVG_CARGA / b.side.carga).toFixed(1)}× menos carga que el promedio del conurbano`
                  : `${(b.side.carga / AVG_CARGA).toFixed(1)}× más carga que el promedio del conurbano`}
              </p>
            </div>

            {/* visual: 1 doctor frente a sus pacientes */}
            <div className="mb-4">
              <p style={{ fontSize: '0.7rem', color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                proporción visual (1 establecimiento ➜ N personas)
              </p>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 2.5,
                background: '#f8fafc', borderRadius: 8, padding: 10, minHeight: 60,
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 4, background: b.color,
                  boxShadow: `0 0 0 2px ${b.color}33`,
                  flexShrink: 0,
                }} title="1 establecimiento" />
                {Array.from({ length: Math.min(Math.round(b.side.carga / 200), 60) }).map((_, j) => (
                  <div key={j} style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: b.color, opacity: 0.45,
                  }} />
                ))}
                {b.side.carga > 12000 && (
                  <span style={{ fontSize: '0.7rem', color: b.color, fontWeight: 600, alignSelf: 'center', marginLeft: 4 }}>
                    …
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.66rem', color: C.inkLight, marginTop: 4 }}>
                cada punto representa ~200 personas
              </p>
            </div>

            {/* breakdown */}
            <div className="space-y-2.5 pt-2" style={{ borderTop: `1px solid ${C.rule}` }}>
              <Row label="Población total"        val={fmt(b.side.pop)} />
              <Row label="Dependen del público"   val={`${fmt(b.side.depPublico)} (${b.side.pctDepPublico.toFixed(0)}%)`} />
              <Row label="Establecimientos públ." val={b.side.est} />
              <Row label="Establ. cada 10 mil hab." val={b.side.estPer10k.toFixed(2)} />
            </div>
          </div>
        </m.div>
      ))}
    </div>
  )
}

function Row({ label, val }) {
  return (
    <div className="flex items-baseline justify-between gap-3 pt-2.5">
      <span style={{ fontSize: '0.82rem', color: C.inkMid }}>{label}</span>
      <span className="font-display" style={{ fontSize: '1.05rem', color: C.ink, fontWeight: 600 }}>{val}</span>
    </div>
  )
}

// ───────────────── RANKING TOP 5 / BOTTOM 5 ─────────────────
function RankingPodios() {
  const Card = ({ title, list, color, bg, dir, label }) => (
    <m.div
      {...fadeUp()}
      style={{
        background: '#fff', border: `1px solid ${C.rule}`,
        borderRadius: 18, overflow: 'hidden',
      }}
    >
      <div style={{ height: 4, background: color }} />
      <div style={{ padding: '24px 24px 20px' }}>
        <div className="flex items-center gap-2 mb-2">
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {label}
          </span>
        </div>
        <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, color: C.ink, lineHeight: 1.2, marginBottom: 18 }}>
          {title}
        </h3>
        <div className="space-y-3">
          {list.map((mu, i) => {
            const num = dir === 'asc' ? i + 1 : i + 1
            const max = dir === 'asc' ? list[list.length - 1].carga : list[0].carga
            const min = dir === 'asc' ? list[0].carga : list[list.length - 1].carga
            const pct = ((mu.carga - min) / (max - min || 1)) * 80 + 20
            return (
              <m.div
                key={mu.name}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.06 * i }}
                style={{ borderBottom: i < list.length - 1 ? `1px solid ${C.rule}` : 'none', paddingBottom: 12 }}
              >
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-display" style={{ fontSize: '0.95rem', fontWeight: 700, color: C.inkLight, width: 18 }}>
                      {num}
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: C.ink, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {mu.name}
                    </span>
                  </div>
                  <span className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color, lineHeight: 1, flexShrink: 0 }}>
                    {fmt(mu.carga)}
                  </span>
                </div>
                <div style={{ background: bg, height: 6, borderRadius: 6, overflow: 'hidden' }}>
                  <m.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.06 * i + 0.1 }}
                    style={{ height: '100%', background: color, borderRadius: 6 }}
                  />
                </div>
                <div className="flex justify-between mt-1.5" style={{ fontSize: '0.7rem', color: C.inkLight }}>
                  <span>{fmt(mu.depPublico)} dependientes</span>
                  <span>{mu.est} establ.</span>
                </div>
              </m.div>
            )
          })}
        </div>
      </div>
    </m.div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Card
        title="Mejor gestión sanitaria"
        label="Top 5 - gestionan bien"
        list={BEST}
        color={D.good}
        bg={D.goodBg}
        dir="asc"
      />
      <Card
        title="Peor gestión sanitaria"
        label="Top 5 - gestionan mal"
        list={WORST}
        color={D.bad}
        bg={D.badBg}
        dir="desc"
      />
    </div>
  )
}

// ───────────────── DEPENDIENTES TOP BAR (Chart.js) ──────────────
function DependientesBar() {
  const sorted = [...MUNIS].sort((a, b) => b.depPublico - a.depPublico)
  const data = {
    labels: sorted.map(m => m.name),
    datasets: [{
      label: 'Personas sin cobertura formal de salud',
      data: sorted.map(m => m.depPublico),
      backgroundColor: sorted.map(m => m.carga > AVG_CARGA ? D.bad : D.good),
      borderRadius: 4,
      borderSkipped: false,
    }],
  }
  const opts = {
    indexAxis: 'y',
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
        callbacks: {
          label: ctx => ` ${fmt(ctx.parsed.x)} personas sin cobertura`,
          afterLabel: ctx => ` ${sorted[ctx.dataIndex].est} establecimientos`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Habitantes sin cobertura formal de salud', color: C.inkMid, font: { weight: 600, family: 'Poppins, sans-serif' } },
        grid: { color: C.rule },
        ticks: { font: { family: 'Poppins, sans-serif' }, callback: v => fmt(v) },
      },
      y: {
        title: { display: true, text: 'Partido del conurbano', color: C.inkMid, font: { weight: 600, family: 'Poppins, sans-serif' } },
        grid: { display: false },
        ticks: {
          autoSkip: false,
          font: { family: 'Poppins, sans-serif', size: 11 },
        },
      },
    },
  }
  return (
    <div style={{ height: 640 }}>
      <Bar data={data} options={opts} />
    </div>
  )
}

// ───────────────── TABLA COMPLETA ──────────────────────────────
function TablaCompleta() {
  const [sortBy, setSortBy] = useState('carga')
  const [sortDir, setSortDir] = useState('desc')

  const ordered = useMemo(() => {
    const list = [...MUNIS].sort((a, b) => {
      const va = a[sortBy], vb = b[sortBy]
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      return sortDir === 'asc' ? va - vb : vb - va
    })
    return list
  }, [sortBy, sortDir])

  const cycle = key => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir(key === 'name' ? 'asc' : 'desc') }
  }

  const Th = ({ k, label, align = 'left' }) => (
    <th
      onClick={() => cycle(k)}
      style={{
        textAlign: align, padding: '11px 12px', fontWeight: 700,
        fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em',
        color: sortBy === k ? C.accent : C.inkMid, cursor: 'pointer',
        borderBottom: `1px solid ${C.rule}`, whiteSpace: 'nowrap',
        userSelect: 'none', background: '#fafaf7',
      }}
    >
      {label}
      {sortBy === k && <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  )

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr>
              <Th k="name"        label="Partido" />
              <Th k="pop"         label="Población" align="right" />
              <Th k="est"         label="Establ." align="right" />
              <Th k="depPublico"  label="Dep. público" align="right" />
              <Th k="pctDepPublico" label="% pob. dep." align="right" />
              <Th k="carga"       label="Carga × Est." align="right" />
              <Th k="estPer10k"   label="Est. × 10k hab." align="right" />
            </tr>
          </thead>
          <tbody>
            {ordered.map(mu => {
              const isWorse = mu.carga > AVG_CARGA
              return (
                <tr key={mu.name} style={{ borderBottom: `1px solid ${C.rule}` }}>
                  <td style={{ padding: '11px 12px', fontWeight: 600, color: C.ink, fontSize: '0.85rem' }}>
                    <span style={{
                      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                      background: isWorse ? D.bad : D.good, marginRight: 8,
                    }} />
                    {mu.name}
                  </td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.inkMid, fontSize: '0.85rem' }}>{fmt(mu.pop)}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.inkMid, fontSize: '0.85rem' }}>{mu.est}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.inkMid, fontSize: '0.85rem' }}>{fmt(mu.depPublico)}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.inkMid, fontSize: '0.85rem' }}>{mu.pctDepPublico.toFixed(1)}%</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: isWorse ? D.bad : D.good, fontWeight: 700, fontSize: '0.9rem' }}>
                    {fmt(mu.carga)}
                  </td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.inkMid, fontSize: '0.85rem' }}>{mu.estPer10k.toFixed(2)}</td>
                </tr>
              )
            })}
            {/* total row */}
            <tr style={{ background: '#fafaf7' }}>
              <td style={{ padding: '11px 12px', fontWeight: 700, color: C.ink, fontSize: '0.85rem' }}>Conurbano (24)</td>
              <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.ink, fontWeight: 700, fontSize: '0.85rem' }}>{fmt(TOT.pop)}</td>
              <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.ink, fontWeight: 700, fontSize: '0.85rem' }}>{TOT.est}</td>
              <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.ink, fontWeight: 700, fontSize: '0.85rem' }}>{fmt(TOT.depPublico)}</td>
              <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.ink, fontWeight: 700, fontSize: '0.85rem' }}>
                {((TOT.depPublico / TOT.pop) * 100).toFixed(1)}%
              </td>
              <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: D.warn, fontWeight: 700, fontSize: '0.9rem' }}>
                {fmt(AVG_CARGA)}
              </td>
              <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.ink, fontWeight: 700, fontSize: '0.85rem' }}>
                {((TOT.est / TOT.pop) * 10000).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ───────────────── PAGE ──────────────────────────────────────
export default function InformeSaludConurbano() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.ink }}>

      <Hero />

      {/* SECCIÓN 1 - COBERTURA */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-10">
            <SectionLabel>Sección 1 · Quién depende del sistema público</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Casi 4 de cada 10 bonaerenses depende del sistema público
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
              El 37,6% del conurbano no declara obra social, prepaga ni PAMI: depende exclusivamente
              de los hospitales y centros de salud públicos. Un 2,6% adicional accede vía programas
              estatales (Incluir Salud, CUS, PROFE) que también operan sobre la red pública.
            </p>
          </m.div>
          <DownloadableViz title="Cobertura de salud - Conurbano bonaerense">
            <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
              <CoberturaDonut />
            </div>
          </DownloadableViz>
        </div>
      </div>

      {/* SECCIÓN 2 - DEPENDIENTES POR PARTIDO */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel>Sección 2 · Demanda territorial</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            La demanda no se reparte por igual
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
            Cantidad absoluta de habitantes sin cobertura formal en cada partido - los que dependen
            exclusivamente de la red pública. La Matanza concentra por sí sola el 21% de la demanda
            del conurbano: más de 846.000 personas.
          </p>
        </m.div>
        <m.div {...fadeUp(0.1)}>
          <DownloadableViz title="Habitantes dependientes del sistema público - por partido del conurbano">
            <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
              <DependientesBar />
            </div>
          </DownloadableViz>
        </m.div>
      </div>

      {/* SECCIÓN 3 - BARÓMETRO DE CARGA */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8 max-w-5xl mx-auto">
            <SectionLabel>Sección 3 · El indicador clave</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Barómetro de carga sanitaria
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
              Cuántas personas sin cobertura formal existen por cada establecimiento de salud público.
              Es la métrica que combina demanda y oferta. Cuanto más alto el número,
              más estirado está el sistema. La línea naranja marca el promedio del conurbano ({fmt(AVG_CARGA)}).
            </p>
          </m.div>
          <m.div {...fadeUp(0.1)}>
            <DownloadableViz title="Barómetro de carga sanitaria - personas dependientes del sistema público por establecimiento">
              <BarometroCarga />
            </DownloadableViz>
          </m.div>
        </div>
      </div>

      {/* SECCIÓN 4 - CUADRANTE DE GESTIÓN */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel>Sección 4 · Mapa de gestión</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Cuántos establecimientos para cuánta demanda
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
            Cada partido es una burbuja: el eje horizontal mide habitantes sin cobertura formal y el vertical
            cantidad de establecimientos públicos. La diagonal naranja representa la proporción promedio
            del conurbano. Las burbujas que están <strong style={{ color: D.good }}>arriba de la línea</strong> tienen
            más oferta de la esperada para su demanda. Las que están <strong style={{ color: D.bad }}>debajo</strong> tienen menos.
          </p>
        </m.div>
        <m.div {...fadeUp(0.1)}>
          <DownloadableViz title="Cuadrante de gestión sanitaria - establecimientos vs. demanda por partido">
            <CuadranteGestion />
          </DownloadableViz>
        </m.div>
      </div>

      {/* SECCIÓN 5 - BALANZA EXTREMA */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 5 · Los dos extremos</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Vicente López vs. La Matanza
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
              Dos partidos vecinos, en la misma provincia, con la misma constitución y los mismos derechos
              sanitarios. Pero un establecimiento público en La Matanza atiende a{' '}
              <strong style={{ color: D.bad }}>{BRECHA.toFixed(1).replace('.', ',')} veces más personas</strong> que uno en Vicente López.
            </p>
          </m.div>
          <DownloadableViz title="Vicente López vs. La Matanza - los dos extremos de la gestión sanitaria">
            <BalanzaExtrema />
          </DownloadableViz>
        </div>
      </div>

      {/* SECCIÓN 6 - RANKINGS */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel>Sección 6 · Top 5 mejor y peor gestionados</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Quiénes lideran y quiénes se quedaron atrás
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
            Ranking ordenado por carga sanitaria (personas dependientes del sistema público por establecimiento).
            Cifras absolutas: cuanto más bajo, mejor. Cuanto más alto, peor.
          </p>
        </m.div>
        <DownloadableViz title="Top 5 mejor y peor gestionados - carga sanitaria por establecimiento">
          <RankingPodios />
        </DownloadableViz>
      </div>

      {/* SECCIÓN 7 - TABLA */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 7 · Tabla detallada</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Los 24 partidos del conurbano
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
              Hacé clic en cualquier columna para reordenar. La columna <strong>Carga × Est.</strong> es el indicador
              clave de gestión: personas dependientes del sistema público por cada establecimiento de salud.
            </p>
          </m.div>
          <m.div {...fadeUp(0.1)}>
            <DownloadableViz title="Salud pública en el conurbano - los 24 partidos del GBA">
              <TablaCompleta />
            </DownloadableViz>
          </m.div>
        </div>
      </div>

      {/* SECCIÓN 8 - HIPÓTESIS Y LECTURA */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel>Sección 8 · Hipótesis y lectura</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Tres patrones que explican la brecha
          </h2>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              n: '01',
              title: 'La oferta pública no escala con la demanda',
              body: 'La Matanza concentra el 21% de la demanda pública del conurbano y solo el 8% de los establecimientos. La cantidad de centros de salud parece responder a la geografía histórica, no a la presión demográfica actual.',
              color: D.bad,
            },
            {
              n: '02',
              title: 'Distribución regresiva del sistema público',
              body: 'Los partidos con más cobertura privada (Vicente López, San Isidro, Avellaneda) son los que tienen mejor ratio público. Donde menos se necesita la red pública, mejor está dimensionada. Donde más se necesita, peor.',
              color: D.warn,
            },
            {
              n: '03',
              title: 'El sur del conurbano es la zona crítica',
              body: 'La Matanza, Merlo, Moreno, Almirante Brown y Florencio Varela - todos en el primer y segundo cordón sur/oeste - concentran los peores ratios. Son también los partidos con mayor crecimiento poblacional de las últimas décadas.',
              color: D.info,
            },
          ].map((h, i) => (
            <m.div
              key={h.n}
              {...fadeUp(0.08 * i)}
              style={{
                background: '#fff', border: `1px solid ${C.rule}`,
                borderRadius: 16, padding: '24px 24px 22px',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-display" style={{ fontSize: '1.6rem', color: h.color, fontWeight: 700, lineHeight: 1 }}>{h.n}</span>
                <div style={{ flex: 1, height: 1, background: h.color, opacity: 0.3 }} />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: C.ink, marginBottom: 10, lineHeight: 1.25 }}>
                {h.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: C.inkMid, lineHeight: 1.55 }}>{h.body}</p>
            </m.div>
          ))}
        </div>
      </div>

      {/* CONCLUSIÓN */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div
          {...fadeUp(0)}
          className="bg-pattern-dark"
          style={{
            background: C.hero, borderRadius: 20,
            padding: '44px 48px', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', right: -80, top: -80,
            width: 280, height: 280, borderRadius: '50%',
            border: '40px solid rgba(255,255,255,0.04)',
          }} />
          <div style={{
            position: 'absolute', right: 60, bottom: -100,
            width: 180, height: 180, borderRadius: '50%',
            border: '30px solid rgba(255,255,255,0.03)',
          }} />

          <div className="relative z-10">
            <p style={{
              color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem',
              textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16,
            }}>
              La conclusión
            </p>
            <p style={{
              color: '#fff', fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
              lineHeight: 1.6, fontWeight: 500, maxWidth: 800,
            }}>
              El conurbano bonaerense no tiene un problema de cobertura: tiene un problema de{' '}
              <span style={{ color: D.goodSoft, fontWeight: 700 }}>distribución</span>.
              Los <strong style={{ color: '#fff' }}>1.088 establecimientos públicos</strong> existen, pero su asignación territorial
              está descoordinada con la demanda real. La Matanza necesita atender 846.000 personas con 90 centros;
              Vicente López, 38.000 con 32. La salud pública del conurbano está{' '}
              <span style={{ color: D.badSoft, fontWeight: 700 }}>sobrecargada donde más se la necesita</span>{' '}
              y holgada donde la demanda es menor. Cerrar la brecha no requiere inventar un sistema:
              requiere redistribuir, ampliar y planificar el que ya existe.
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://pec.ungs.edu.ar/"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none',
                  borderRadius: 999, padding: '10px 20px',
                  fontSize: '0.82rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                PEC - Programa de Estudios del Conurbano <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </m.div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold" style={{ color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Fuentes
            </p>
            <p className="text-sm mt-1" style={{ color: C.inkMid }}>
              PEC - Programa de Estudios del Conurbano · Censo Nacional 2022 · Elaboración propia DatosPBA · 2026
            </p>
          </div>
          <Link to="/informes" className="text-sm no-underline font-medium" style={{ color: C.inkLight }}>
            ← Ver todos los informes
          </Link>
        </div>
      </div>

    </div>
  )
}
