import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Download } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA } from '@/lib/variacion'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler
)

ChartJS.defaults.font.family = 'Archivo, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'

const C = {
  bg:       'var(--c-bg)',
  ink:      'var(--c-ink)',
  inkMid:   'var(--c-ink-mid)',
  inkLight: 'var(--c-ink-light)',
  rule:     'var(--c-rule)',
  card:     'var(--c-surface)',
  hero:     '#0F172A',
  accent:   '#3d65b2',
}

const D = {
  gold:     '#d97706',
  goldSoft: '#fcd34d',
  goldBg:   '#fffbeb',
  stone:    '#57534e',
  stoneBg:  '#f5f5f4',
  tealBg:   '#d1fae5',
  slate:    '#1e3a8a',
  warn:     '#b45309',
  warnBg:   '#fef3c7',
}

// ─── DATOS ───────────────────────────────────────────────────

const PROD_PROVINCIAS = [
  { provincia: 'Buenos Aires', mtn: 50,  robusta: true },
  { provincia: 'Córdoba',      mtn: 48,  robusta: true },
  { provincia: 'Santa Fe',     mtn: 14,  robusta: false },
  { provincia: 'San Juan',     mtn: 10,  robusta: false },
  { provincia: 'Mendoza',      mtn: 7,   robusta: false },
]

const EMPLEO_MUNIS = [
  { nombre: 'Olavarría',         pct: 32 },
  { nombre: 'Tandil',            pct: 6  },
  { nombre: 'Gral. Pueyrredón',  pct: 6  },
  { nombre: 'Villarino',         pct: 5  },
  { nombre: 'Resto de PBA',      pct: 51 },
]

// PBG explotación minas y canteras - millones de pesos 2004
// Fuente: DIPEC (estimaciones visuales del gráfico publicado)
const PBG_AÑOS  = ['2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024']
const PBG_VALS  = [380, 393, 398, 408, 418, 430, 445, 462, 488, 490, 518, 562, 553, 592, 584, 545, 468, 548, 692, 823, 618]
const PBG_PROV  = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,false]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. Todas son niveles sin variación:
   el contexto va en `periodo`. */
const HERO_STATS = [
  { valor: '50 M',  periodo: 'toneladas de minerales extraídas por año' },
  { valor: '4.419', periodo: 'trabajadores registrados (SIACAM, abr. 2025)' },
  { valor: '53',    periodo: 'municipios con actividad minera (de 135)' },
  { valor: '+130',  periodo: 'años de industria minera en la provincia' },
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
  const upscale = Math.max(1, DL_MIN_W / captured.width)
  const innerW  = Math.round(captured.width * upscale)
  const innerH  = Math.round(captured.height * upscale)
  const titleH  = fuente ? 96 : 72
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

// ─── HERO ────────────────────────────────────────────────────

function Hero() {
  return (
    <div style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <Link
          to="/informes"
          className="inline-flex items-center gap-1.5 text-sm no-underline mb-10"
          style={{ color: 'rgba(255,255,255,0.62)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <div>
          <SectionLabel dark color="rgba(255,255,255,0.62)">DPM · SIACAM · Minería bonaerense</SectionLabel>
        </div>

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(2rem, 4.6vw, 3.2rem)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.12, marginBottom: 20, maxWidth: 820,
          }}
        >
          La minería que nadie mira<br />
          <span>en Buenos Aires</span>
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,0.60)', maxWidth: 720,
            lineHeight: 1.7, fontSize: '1.05rem',
          }}
        >
          Cuando se habla de minería en Argentina, el relato apunta siempre a la cordillera.
          Pero hay una historia que se cuenta poco, y que sucede en el corazón de la provincia
          más importante del país.{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>50 millones de toneladas</strong>{' '}
          de minerales se extraen cada año en Buenos Aires. Sin esos materiales no hay rutas,
          no hay hormigón, no hay cemento para hospitales ni escuelas.
        </p>

        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
        >
          {HERO_STATS.map((s, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 2,
              }}
              className="p-5"
            >
              <Cifra dark size="xl" label={s.label} valor={s.valor} variacion={s.variacion} polaridad={s.polaridad} periodo={s.periodo} />
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex', gap: 32, marginTop: 28,
            paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Fuente',      val: 'Dirección Provincial de Minería (DPM)' },
            { label: 'Empleo',      val: 'SIACAM - abril 2025' },
            { label: 'Cemento',     val: 'AFCP - Asociación de Fabricantes de Cemento Portland' },
            { label: 'Actualizado', val: 'Mayo 2025' },
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
          La minería bonaerense mueve 50 millones de toneladas al año sin política sectorial
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          Todos hablan de la minería en la cordillera y nadie habla de la minería en Buenos Aires.
          Mientras el gobierno provincial ignora un sector que produce{' '}
          <strong>50 millones de toneladas al año</strong>{' '}
          y da trabajo a miles de familias en el interior bonaerense,
          la política sectorial está ausente.{' '}
          Menos trabas, más inversión, más producción.
        </p>
      </div>
    </div>
  )
}

// ─── SECCIÓN 1: PRODUCCIÓN POR PROVINCIA ─────────────────────

function ProduccionChart() {
  const data = {
    labels: PROD_PROVINCIAS.map(p => p.provincia),
    datasets: [{
      label: 'Millones de toneladas anuales',
      data: PROD_PROVINCIAS.map(p => p.mtn),
      backgroundColor: PROD_PROVINCIAS.map(p =>
        p.provincia === 'Buenos Aires' ? DATA[1] : p.robusta ? '#94a3b8' : '#cbd5e1'
      ),
      borderRadius: 5,
      borderSkipped: false,
    }],
  }

  const opts = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
        padding: 12, cornerRadius: 8,
        callbacks: {
          label: ctx => ` ${ctx.parsed.x} Mtn${!PROD_PROVINCIAS[ctx.dataIndex].robusta ? ' (estimado)' : ''}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 60,
        title: { display: true, text: 'Millones de toneladas anuales', color: C.inkMid, font: { weight: 600 } },
        grid: { color: 'rgba(13,17,23,0.09)' },
        ticks: { callback: v => `${v} Mtn` },
      },
      y: {
        grid: { display: false },
        ticks: { font: { weight: 600 } },
      },
    },
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 2, padding: '22px 24px' }}>
      <div style={{ height: 280 }} role="img" aria-label="Gráfico de barras horizontales: Buenos Aires lidera la producción de áridos y minerales no metalíferos con 50 millones de toneladas anuales, seguida por Córdoba (48), Santa Fe (14), San Juan (10) y Mendoza (7)">
        <Bar data={data} options={opts} />
      </div>
      <p className="text-[11px] mt-3 px-1" style={{ color: C.inkLight }}>
        * Los datos de Santa Fe, San Juan y Mendoza son estimaciones. Buenos Aires y Córdoba son los más robustos. Fuente: DPM / informes sectoriales.
      </p>
    </div>
  )
}

// ─── SECCIÓN 2: PBG HISTÓRICO ─────────────────────────────────

function PBGHistorico() {
  const data = {
    labels: PBG_AÑOS,
    datasets: [{
      label: 'VAB explotación minas y canteras (mill. $ 2004)',
      data: PBG_VALS,
      borderColor: DATA[1],
      backgroundColor: 'rgba(225,29,116,0.08)',
      pointBackgroundColor: PBG_VALS.map((_, i) => PBG_PROV[i] ? 'rgba(225,29,116,0.5)' : DATA[1]),
      pointRadius: PBG_VALS.map((_, i) => PBG_PROV[i] ? 4 : 5),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 2.5,
      tension: 0.35,
      fill: true,
    }],
  }

  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
        padding: 12, cornerRadius: 8,
        callbacks: {
          label: ctx => ` ${ctx.parsed.y.toLocaleString('es-AR')} mill. $ (2004)`,
          afterLabel: ctx => PBG_PROV[ctx.dataIndex] ? ' Dato preliminar' : '',
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(13,17,23,0.09)' },
        ticks: { maxRotation: 45, font: { size: 11 } },
      },
      y: {
        beginAtZero: false,
        min: 300,
        title: { display: true, text: 'Millones de pesos (valores 2004)', color: C.inkMid, font: { weight: 600 } },
        grid: { color: 'rgba(13,17,23,0.09)' },
        ticks: { callback: v => `$${v}M` },
      },
    },
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 2, padding: '22px 24px' }}>
      <div style={{ height: 340 }} role="img" aria-label="Gráfico de líneas: el valor agregado de minas y canteras en PBA creció de 380 millones de pesos constantes de 2004 en ese año a un pico de 823 millones en 2023, con caída a 468 en 2020 por COVID y 618 millones en 2024">
        <Line data={data} options={opts} />
      </div>
      <div className="flex items-center gap-6 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: C.inkMid }}>
          <span style={{ width: 24, height: 3, background: DATA[1], borderRadius: 2, display: 'inline-block' }} />
          Valores en pesos constantes 2004
        </div>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: C.inkLight }}>
          <span style={{ width: 8, height: 8, background: 'rgba(225,29,116,0.4)', borderRadius: '50%', display: 'inline-block' }} />
          Datos preliminares (*)
        </div>
        <div className="ml-auto text-[11px]" style={{ color: C.inkLight }}>
          Fuente: DIPEC - Dirección Provincial de Estadística
        </div>
      </div>
    </div>
  )
}

// ─── SECCIÓN 3: EMPLEO MUNICIPAL (SVG) ────────────────────────

function EmpleoMunicipal() {
  const W = 760, H = 320
  const padL = 160, padR = 120, padT = 28, padB = 32
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const rowH = innerH / EMPLEO_MUNIS.length

  const maxPct = 55
  const xScale = v => padL + (v / maxPct) * innerW

  const colorFor = (nombre) => {
    if (nombre === 'Olavarría')   return DATA[1]
    if (nombre === 'Resto de PBA') return DATA[4]
    return '#94a3b8'
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 2, padding: 16, overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 560, height: 'auto', display: 'block' }}>
        {/* Grid lines */}
        {[0, 10, 20, 30, 40, 50].map(t => (
          <g key={t}>
            <line x1={xScale(t)} y1={padT} x2={xScale(t)} y2={H - padB}
                  stroke={C.rule} strokeWidth={1} strokeDasharray={t === 0 ? 'none' : '2 4'} />
            <text x={xScale(t)} y={H - padB + 18} textAnchor="middle"
                  fontSize="11" fill={C.inkLight} fontFamily="Archivo, sans-serif">
              {t}%
            </text>
          </g>
        ))}

        {/* Axis title */}
        <text x={padL + innerW / 2} y={H - 4} textAnchor="middle"
              fontSize="11" fill={C.inkMid} fontFamily="Archivo, sans-serif" fontWeight="600">
          % del empleo minero provincial
        </text>

        {/* Rows */}
        {EMPLEO_MUNIS.map((m, i) => {
          const y = padT + i * rowH + rowH / 2
          const barW = xScale(m.pct) - padL
          const color = colorFor(m.nombre)
          return (
            <g key={m.nombre}>
              {/* Label */}
              <text x={padL - 12} y={y + 4} textAnchor="end"
                    fontSize="12.5" fontFamily="Archivo, sans-serif"
                    fill={C.ink} fontWeight={m.nombre === 'Olavarría' ? '700' : '500'}>
                {m.nombre}
              </text>
              {/* Bar background */}
              <rect x={padL} y={y - rowH * 0.28} width={innerW} height={rowH * 0.55}
                    fill={color + '10'} rx={4} />
              {/* Bar fill */}
              <rect x={padL} y={y - rowH * 0.28} width={barW} height={rowH * 0.55}
                    fill={color} rx={4} fillOpacity={0.85} />
              {/* Value */}
              <text x={xScale(m.pct) + 10} y={y + 4} textAnchor="start"
                    fontSize="13" fill={color} fontWeight="700"
                    fontFamily="Archivo, sans-serif">
                {m.pct}%
              </text>
            </g>
          )
        })}

        {/* Callout: 49% fuera de Olavarría */}
        <rect x={padL + innerW - 10} y={padT + 2} width={padR - 4} height={34}
              fill={DATA[4] + '15'} rx={6} />
        <text x={padL + innerW + (padR - 4) / 2 - 8} y={padT + 14} textAnchor="middle"
              fontSize="9" fill={DATA[4]} fontWeight="700" fontFamily="Archivo, sans-serif">
          49% fuera
        </text>
        <text x={padL + innerW + (padR - 4) / 2 - 8} y={padT + 26} textAnchor="middle"
              fontSize="9" fill={DATA[4]} fontFamily="Archivo, sans-serif">
          de Olavarría
        </text>
      </svg>
      <p className="text-[11px] mt-2 px-2" style={{ color: C.inkLight }}>
        Fuente: SIACAM / publicación académica UNPaz. Mide empleo registrado en minería extractiva.
      </p>
    </div>
  )
}

// ─── SECCIÓN 4: LOS MATERIALES ────────────────────────────────

const MINERALES = [
  {
    nombre: 'Calizas',
    uso: 'Cemento, cal industrial, agro',
    desc: 'Base del cemento Portland que se produce en Olavarría. El 50% del cemento nacional depende de las canteras calcáreas del centro bonaerense.',
    color: D.gold,
    bg: D.goldBg,
    n: '01',
  },
  {
    nombre: 'Granito',
    uso: 'Construcción, revestimientos',
    desc: 'El 80% del granito nacional proviene de la provincia. Azul, Tandil y Olavarría concentran las principales canteras de piedra granítica.',
    color: D.stone,
    bg: D.stoneBg,
    n: '02',
  },
  {
    nombre: 'Áridos',
    uso: 'Rutas, hormigón, construcción',
    desc: 'Arenas y gravas para la obra pública. Sin áridos bonaerenses no hay autopistas, ni losas, ni edificios en el AMBA.',
    color: C.accent,
    bg: '#eff6ff',
    n: '03',
  },
  {
    nombre: 'Arcillas y dolomitas',
    uso: 'Cerámica, industria química',
    desc: 'Materias primas para la industria cerámica, refractarios y usos industriales. Distribuidas en múltiples distritos del interior provincial.',
    color: DATA[2],
    bg: D.tealBg,
    n: '04',
  },
]

function Materiales() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {MINERALES.map((min, i) => (
        <div
          key={min.nombre}
          style={{
            background: '#fff', border: `1px solid ${C.rule}`,
            borderRadius: 2, padding: '24px 24px 22px', overflow: 'hidden',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="font-display" style={{ fontSize: '1.6rem', color: min.color, fontWeight: 700, lineHeight: 1 }}>{min.n}</span>
            <div style={{ flex: 1, height: 1, background: min.color, opacity: 0.25 }} />
          </div>
          <div style={{ display: 'inline-block', background: min.bg, borderRadius: 6, padding: '3px 10px', marginBottom: 10 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: min.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {min.uso}
            </span>
          </div>
          <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: C.ink, marginBottom: 8, lineHeight: 1.1 }}>
            {min.nombre}
          </h3>
          <p style={{ fontSize: '0.85rem', color: C.inkMid, lineHeight: 1.55 }}>{min.desc}</p>
        </div>
      ))}
    </div>
  )
}

// ─── SECCIÓN 5: DOS DATOS CLAVE ───────────────────────────────

function DatosDestacados() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[
        {
          stat: '50%',
          label: 'del cemento nacional',
          desc: 'Sale de Olavarría. La planta de Loma Negra y el polo cementero del centro bonaerense abastece la mitad de la demanda argentina.',
          fuente: 'AFCP - Asociación de Fabricantes de Cemento Portland',
          color: D.gold,
          bg: D.goldBg,
        },
        {
          stat: '80%',
          label: 'del granito nacional',
          desc: 'Es bonaerense. La piedra granítica de Tandil, Azul y Olavarría domina el mercado nacional de revestimientos y construcción.',
          fuente: 'Dirección Provincial de Minería (DPM)',
          color: C.accent,
          bg: '#eff6ff',
        },
      ].map((d, i) => (
        <div
          key={d.stat}
          style={{
            background: '#fff', border: `1px solid ${C.rule}`,
            borderRadius: 2, overflow: 'hidden',
          }}
        >
          <div style={{ height: 5, background: d.color }} />
          <div style={{ padding: '28px 28px 26px' }}>
            <div style={{ background: d.bg, borderRadius: 2, padding: '20px 20px 18px', marginBottom: 18 }}>
              <p style={{ fontSize: '0.7rem', color: d.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                {d.label}
              </p>
              <div className="font-display" style={{ fontSize: '4rem', fontWeight: 700, color: d.color, lineHeight: 1 }}>
                {d.stat}
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 14 }}>
              {d.desc}
            </p>
            <p style={{ fontSize: '0.7rem', color: C.inkLight }}>{d.fuente}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── NOTA METODOLÓGICA ────────────────────────────────────────

function NotaMetodologica() {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        borderTop: '2px solid var(--ink)',
        padding: '18px 20px',
      }}
    >
      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
        Nota sobre los datos
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        El dato de <strong style={{ color: C.ink }}>4.419 trabajadores</strong> del SIACAM mide empleo registrado en minería extractiva (abril 2025) y es el número más confiable disponible.
        La cifra de "1.500 directos y 4.500 indirectos" que circula en medios corresponde a fuentes anteriores a 2020.
        Los datos de producción de Santa Fe, San Juan y Mendoza son estimaciones; los de Buenos Aires y Córdoba son los más robustos.
        Antes de usar estas cifras en comunicación pública, confirmar el dato de 50 Mtn con la DPM.
      </p>
    </div>
  )
}

// ─── PÁGINA ───────────────────────────────────────────────────

export default function InformeMineriaPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.ink }}>

      <Hero />

      <Tesis />

      {/* SECCIÓN 1 - PRODUCCIÓN POR PROVINCIA */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10">
            <SectionLabel>Sección 1 · Producción nacional comparada</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Buenos Aires, la primera productora de áridos del país
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
              Con ~50 millones de toneladas anuales, la provincia lidera la extracción de áridos y minerales
              no metalíferos a nivel nacional, superando levemente a Córdoba. A diferencia de la minería
              cordillerana, esta producción abastece directamente la obra pública y la construcción cotidiana.
            </p>
          </div>
          <div>
            <DownloadableViz title="Producción de áridos y minerales no metalíferos por provincia">
              <ProduccionChart />
            </DownloadableViz>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2 - PBG HISTÓRICO */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-8">
          <SectionLabel>Sección 2 · Evolución económica del sector</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Veinte años de crecimiento con un pico histórico en 2023
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
            El Valor Agregado Bruto de explotación de minas y canteras en la provincia creció de forma
            sostenida entre 2004 y 2023, alcanzando un máximo histórico de{' '}
            <strong style={{ color: C.ink }}>$823 millones</strong> (pesos constantes 2004).
            La caída de 2020 por COVID fue revertida en dos años.
          </p>
        </div>
        <div>
          <DownloadableViz title="PBG Buenos Aires - Explotación de minas y canteras 2004-2024" fuente="DIPEC - Dirección Provincial de Estadística">
            <PBGHistorico />
          </DownloadableViz>
        </div>
      </div>

      {/* SECCIÓN 3 - DATOS DESTACADOS */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-8">
            <SectionLabel>Sección 3 · Los números que definen el sector</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              La mitad del cemento y el 80% del granito del país
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
              La minería bonaerense no produce lujo ni exportaciones: produce los materiales que sostienen
              la infraestructura nacional. Dos cifras lo resumen mejor que cualquier discurso.
            </p>
          </div>
          <DownloadableViz title="Participación de Buenos Aires en la producción nacional de cemento y granito">
            <DatosDestacados />
          </DownloadableViz>
        </div>
      </div>

      {/* SECCIÓN 4 - EMPLEO TERRITORIAL */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-8">
          <SectionLabel>Sección 4 · Distribución territorial del empleo</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Olavarría concentra el 32%, pero el 49% está en el resto de la provincia
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
            El polo cementero-granítico de Olavarría es el corazón del sector, pero la minería bonaerense
            está distribuida en 53 municipios. Tandil, Gral. Pueyrredón y Villarino también tienen
            presencia significativa.
          </p>
        </div>
        <div>
          <DownloadableViz title="Distribución del empleo minero por municipio - Provincia de Buenos Aires">
            <EmpleoMunicipal />
          </DownloadableViz>
        </div>
      </div>

      {/* SECCIÓN 5 - LOS MATERIALES */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-8">
            <SectionLabel>Sección 5 · Qué se extrae</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Los materiales que construyen el país
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
              Buenos Aires no tiene oro ni litio. Tiene algo más cotidiano y más necesario:
              los insumos básicos de la construcción y la industria nacional.
            </p>
          </div>
          <Materiales />
        </div>
      </div>

      {/* NOTA METODOLÓGICA */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <NotaMetodologica />
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: C.ink }}>
              Fuentes
            </p>
            <p className="text-sm mt-1" style={{ color: C.inkMid }}>
              DPM - Dirección Provincial de Minería · SIACAM (abr. 2025) · AFCP · DIPEC · UNPaz (2022) · Elaboración propia DatosPBA · 2025
            </p>
            <div className="flex items-center gap-5 mt-2 flex-wrap">
              <a
                href="https://www.gba.gob.ar/mineria"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                Dirección Provincial de Minería <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://segemar.gov.ar"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                SEGEMAR <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <Link to="/informes" className="text-sm no-underline font-medium" style={{ color: C.inkLight }}>
            ← Ver todos los informes
          </Link>
        </div>
      </div>

    </div>
  )
}
