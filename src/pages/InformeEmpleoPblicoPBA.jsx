import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft, ExternalLink, Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
ChartJS.defaults.font.family = 'Poppins, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'

// ─── COLORES ─────────────────────────────────────────────────

const C = {
  bg:       '#f7f6f2',
  ink:      '#0a1628',
  inkMid:   '#475569',
  inkLight: '#94a3b8',
  rule:     'rgba(13,17,23,0.08)',
  hero:     '#0a1628',
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

const COMPARACION = [
  { label: 'Prov. de Buenos Aires', ratio: 30.2, region: 'PBA', hab: '17,6 M', ajustado: false },
  { label: 'Texas',                 ratio: 22.8, region: 'USA', hab: '30 M',   ajustado: true  },
  { label: 'Nueva York',            ratio: 22.4, region: 'USA', hab: '19,6 M', ajustado: true  },
  { label: 'Minas Gerais',          ratio: 19.7, region: 'BRA', hab: '20,5 M', ajustado: false },
  { label: 'Rio Grande do Sul',     ratio: 17.5, region: 'BRA', hab: '11,4 M', ajustado: false },
  { label: 'Florida',               ratio: 15.3, region: 'USA', hab: '22,6 M', ajustado: true  },
  { label: 'Bahia',                 ratio: 11.7, region: 'BRA', hab: '14,8 M', ajustado: false },
]

const HERO_STATS = [
  { n: '530.922', label: 'cargos en el Presupuesto provincial 2026',       color: '#93c5fd' },
  { n: '30,2',    label: 'empleados provinciales cada 1.000 habitantes',    color: '#fde68a' },
  { n: '~47',     label: 'cada 1.000 hab. sumando municipios bonaerenses',  color: '#fda4af' },
  { n: '+53%',    label: 'más que Minas Gerais, el comparador más robusto', color: '#6ee7b7' },
]

const CRITERIOS = [
  {
    top: B[500],
    label: 'Criterio 01',
    title: 'Escala poblacional similar',
    body: 'Solo se incluyeron jurisdicciones con entre 11 y 30 millones de habitantes, rango donde las economías de escala en la provisión de servicios estatales operan de forma comparable. Comparar con provincias argentinas chicas distorsiona el ratio: una de 200.000 habitantes necesita proporcionalmente más estado para prestar los mismos servicios básicos.',
  },
  {
    top: B[400],
    label: 'Criterio 02',
    title: 'Funciones estatales equivalentes',
    body: 'La jurisdicción debe tener a su cargo educación pública básica, policía propia, red hospitalaria pública y administración general. Son los rubros que explican la mayor parte del empleo público provincial. Sin esta condición, la comparación carece de validez metodológica.',
  },
  {
    top: B[300],
    label: 'Criterio 03',
    title: 'Datos verificables en fuentes primarias',
    body: 'Solo se usan censos de gobierno, auditorías estatales y reportes de presupuesto oficiales. Donde esa verificación primaria no fue posible, se lo aclara explícitamente. No se utilizan estimaciones periodísticas ni proyecciones sin respaldo oficial.',
  },
]

const IMPLICANCIAS = [
  {
    icon: '📊', color: B[600], variant: 'blue',
    title: 'La brecha es estructural, no ideológica', tag: 'Estructural',
    body: 'Texas -agenda de estado mínimo, baja regulación- y Nueva York -el estado más intervencionista de EE.UU.- tienen ratios casi idénticos: 22,8 y 22,4 empleados cada 1.000 hab. respectivamente. Buenos Aires los supera en más de un 30%. La diferencia no depende de la orientación política del gobierno: es un problema de estructura.',
  },
  {
    icon: '💰', color: B[500], variant: 'blue',
    title: '185.000 cargos de diferencia con Minas Gerais', tag: 'Fiscal',
    body: 'Si PBA operara con el ratio de Minas Gerais -el comparador más robusto y estructuralmente más similar- tendría aproximadamente 185.000 cargos menos que los actualmente presupuestados. Ese es el tamaño de la sobre-dotación relativa cuando se controla por funciones y escala poblacional.',
  },
  {
    icon: '📉', color: '#d97706', variant: 'amber',
    title: 'Más empleados, peores resultados', tag: 'Productividad',
    body: 'El caso de Florida es el más ilustrativo: su PBI per cápita es aproximadamente cuatro veces superior al de PBA, y sus servicios públicos -educación, infraestructura, salud- tienen indicadores objetivos comparables o superiores. El Estado bonaerense tiene más empleados en proporción a su población y produce peores resultados medibles.',
  },
  {
    icon: '🔍', color: '#dc2626', variant: 'red',
    title: 'El número consolidado amplía la brecha', tag: 'Metodológico',
    body: 'Los 30,2 empleados provinciales cada 1.000 habitantes no incluyen el empleo municipal bonaerense. Con los municipios, el número consolidado sube a alrededor de 47 cada 1.000 (Fundación Ecosur / Bolsa de Comercio de Córdoba, 2024). Ningún comparador de la serie se acerca a ese nivel cuando se agrega el nivel sub-provincial de gobierno.',
  },
]

const BRASIL_CHART = [
  { label: 'Prov. de Buenos Aires', ratio: 30.2, pba: true  },
  { label: 'Minas Gerais',          ratio: 19.7, pba: false },
  { label: 'Rio Grande do Sul',     ratio: 17.5, pba: false },
  { label: 'Bahia',                 ratio: 11.7, pba: false },
]

const EEUU_LABELS = ['Florida', 'Nueva York', 'Texas']
const EEUU_RAW    = [9.6,  11.4, 11.4]
const EEUU_ADJ    = [15.3, 22.4, 22.8]

const CARGOS_EQUIV = [
  { label: 'PBA actual',                    cargos: 530922, color: B[600] },
  { label: 'Con ratio Texas (22,8)',         cargos: 401280, color: B[300] },
  { label: 'Con ratio Nueva York (22,4)',    cargos: 394240, color: B[300] },
  { label: 'Con ratio Minas Gerais (19,7)', cargos: 346720, color: '#94a3b8' },
  { label: 'Con ratio Río Gr. do Sul (17,5)', cargos: 308000, color: '#94a3b8' },
  { label: 'Con ratio Florida (15,3)',       cargos: 269280, color: B[300] },
  { label: 'Con ratio Bahia (11,7)',         cargos: 205920, color: '#94a3b8' },
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
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: B[400], marginBottom: '0.2rem' }}>{num}</p>
      <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.875rem)', fontWeight: 700, color: C.ink, lineHeight: 1.05, letterSpacing: '-0.015em' }}>{title}</h2>
    </div>
  )
}

function MC({ label, value, unit, accent = false }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${C.rule}`,
      borderLeft: `4px solid ${accent ? B[600] : B[400]}`,
      padding: '1.125rem 1.125rem 1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: '0.625rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.875rem', fontWeight: 800, color: accent ? B[600] : C.ink, lineHeight: 1, marginBottom: '0.375rem' }}>{value}</div>
      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.4 }}>{unit}</div>
    </div>
  )
}

function Tag({ children, variant = 'blue' }) {
  const s = {
    amber: { background: '#fef3c7', color: '#92400e' },
    red:   { background: '#fee2e2', color: '#991b1b' },
    blue:  { background: B[50],     color: B[600]    },
    green: { background: '#dcfce7', color: '#166534' },
  }
  return (
    <span style={{ ...s[variant], display: 'inline-flex', alignItems: 'center', fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '0.3rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

// ─── GRÁFICO ─────────────────────────────────────────────────

function ChartComparacion() {
  const data = {
    labels: COMPARACION.map(d => d.label),
    datasets: [{
      data: COMPARACION.map(d => d.ratio),
      backgroundColor: COMPARACION.map(d =>
        d.region === 'PBA' ? B[600] :
        d.region === 'USA' ? B[400] : '#94a3b8'
      ),
      borderRadius: 4,
      barPercentage: 0.68,
    }],
  }
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
        {[
          { color: B[600],    label: 'Buenos Aires' },
          { color: B[400],    label: 'Estados Unidos (ajustado con K-12)' },
          { color: '#94a3b8', label: 'Brasil' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>
      <div style={{ height: 310 }}>
        <Bar
          data={data}
          options={{
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
                padding: 12, cornerRadius: 8,
                callbacks: {
                  label: ctx => {
                    const d = COMPARACION[ctx.dataIndex]
                    return ` ${ctx.parsed.x} emp./1.000 hab.${d.ajustado ? ' *' : ''}`
                  },
                },
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                max: 35,
                title: { display: true, text: 'Empleados estatales cada 1.000 habitantes', color: C.inkMid, font: { weight: 600 } },
                grid: { color: C.rule },
              },
              y: { grid: { display: false }, ticks: { font: { weight: 600 } } },
            },
          }}
        />
      </div>
      <p className="text-[11px] mt-3 px-1" style={{ color: C.inkLight, fontStyle: 'italic' }}>
        * EE.UU.: ajustado incorporando docentes K-12, que en ese país dependen de distritos locales y no del gobierno estadual.
        Fuente: Presupuesto PBA 2026 · Gobierno de Minas Gerais · SAEB Bahia · Gobierno RS (jun. 2024) ·
        Dept. de Administración de Florida (2021-22) · Empire Center NY (oct. 2024) · State Auditor's Office Texas, rep. 24-703 (feb. 2024).
      </p>
    </div>
  )
}

function ChartBrasil() {
  const data = {
    labels: BRASIL_CHART.map(d => d.label),
    datasets: [{
      data: BRASIL_CHART.map(d => d.ratio),
      backgroundColor: BRASIL_CHART.map(d => d.pba ? B[600] : '#94a3b8'),
      borderRadius: 4,
      barPercentage: 0.65,
    }],
  }
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ height: 220 }}>
        <Bar data={data} options={{
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
              padding: 12, cornerRadius: 8,
              callbacks: { label: ctx => ` ${ctx.parsed.x} empleados cada 1.000 hab.` },
            },
          },
          scales: {
            x: {
              beginAtZero: true, max: 35,
              title: { display: true, text: 'Empleados estaduales cada 1.000 habitantes', color: C.inkMid, font: { weight: 600 } },
              grid: { color: C.rule },
            },
            y: { grid: { display: false }, ticks: { font: { weight: 600 } } },
          },
        }} />
      </div>
      <p className="text-[11px] mt-3 px-1" style={{ color: C.inkLight, fontStyle: 'italic' }}>
        Fuente: Presupuesto PBA 2026 · Gobierno de Minas Gerais (transparencia.mg.gov.br) · SAEB Bahia · Gobierno RS, jun. 2024.
      </p>
    </div>
  )
}

function ChartEEUU() {
  const data = {
    labels: EEUU_LABELS,
    datasets: [
      {
        label: 'Sin docentes K-12',
        data: EEUU_RAW,
        backgroundColor: B[200],
        borderRadius: 4,
        barPercentage: 0.7,
      },
      {
        label: 'Ajustado con K-12',
        data: EEUU_ADJ,
        backgroundColor: B[400],
        borderRadius: 4,
        barPercentage: 0.7,
      },
    ],
  }
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
        {[
          { color: B[400], label: 'Ajustado con K-12' },
          { color: B[200], label: 'Solo gobierno estadual (sin K-12)' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>
      <div style={{ height: 240 }}>
        <Bar data={data} options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
              padding: 12, cornerRadius: 8,
              callbacks: { label: ctx => ` ${ctx.parsed.y} emp./1.000 hab. (${ctx.dataset.label})` },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { weight: 600 } } },
            y: {
              beginAtZero: true, max: 35,
              title: { display: true, text: 'Empleados estaduales cada 1.000 hab.', color: C.inkMid, font: { weight: 600 } },
              grid: { color: C.rule },
              ticks: { callback: v => v },
            },
          },
        }} />
      </div>
      <p className="text-[11px] mt-3 px-1" style={{ color: C.inkLight, fontStyle: 'italic' }}>
        Referencia: PBA = 30,2 emp./1.000 hab. - Fuente: Dept. de Administración de Florida (2021-22) · Empire Center NY (oct. 2024) · State Auditor's Office Texas, rep. 24-703 (feb. 2024).
      </p>
    </div>
  )
}

function ChartCargosEquivalentes() {
  const data = {
    labels: CARGOS_EQUIV.map(d => d.label),
    datasets: [{
      data: CARGOS_EQUIV.map(d => d.cargos),
      backgroundColor: CARGOS_EQUIV.map(d => d.color),
      borderRadius: 4,
      barPercentage: 0.65,
    }],
  }
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ height: 310 }}>
        <Bar data={data} options={{
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
              padding: 12, cornerRadius: 8,
              callbacks: { label: ctx => ` ${ctx.parsed.x.toLocaleString('es-AR')} cargos` },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'Cargos provinciales equivalentes (sobre 17,6 M hab.)', color: C.inkMid, font: { weight: 600 } },
              grid: { color: C.rule },
              ticks: { callback: v => v.toLocaleString('es-AR') },
            },
            y: { grid: { display: false }, ticks: { font: { weight: 600 } } },
          },
        }} />
      </div>
      <p className="text-[11px] mt-3 px-1" style={{ color: C.inkLight, fontStyle: 'italic' }}>
        Proyección sobre 17,6 millones de habitantes (PBA 2026). Elaboración propia DatosPBA en base a fuentes primarias de cada jurisdicción.
      </p>
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────

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
          <SectionLabel dark color="#93c5fd">
            Presupuesto PBA 2026 · Minas Gerais · Florida · Nueva York · Texas
          </SectionLabel>
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
          El empleo público bonaerense<br />
          <span style={{ color: '#93c5fd' }}>en perspectiva internacional</span>
        </m.h1>

        <m.p
          {...fadeUp(0.1)}
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          Comparar empleados públicos sin criterio metodológico es fácil de atacar políticamente.
          Este informe lo hace con rigor: solo jurisdicciones de escala similar, funciones equivalentes
          y datos verificables en fuentes primarias.{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>El resultado es consistente</strong>{' '}
          en todos los comparadores y en todas las orientaciones políticas: Buenos Aires tiene
          entre un 30% y un 160% más de empleados públicos por habitante que sus pares.
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
            { label: 'Fuente PBA',    val: 'Presupuesto Provincial 2026' },
            { label: 'Municipios',    val: 'Fundación Ecosur / Bolsa de Comercio de Córdoba (2024)' },
            { label: 'Comparadores', val: 'Fuentes primarias oficiales de cada jurisdicción' },
            { label: 'Actualizado',  val: 'Mayo 2026' },
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

// ─── EXPORT ──────────────────────────────────────────────────

export default function InformeEmpleoPblicoPBA() {
  return (
    <div style={{ background: C.bg, fontFamily: 'Poppins, sans-serif' }}>
      <Hero />

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-2">

        {/* 01 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="01 · Buenos Aires" title="530.922 cargos: los números de partida" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El Presupuesto 2026 de la Provincia de Buenos Aires fija 530.922 cargos en la
            administración central, organismos descentralizados e instituciones de previsión social.
            Con una población de aproximadamente 17,6 millones de habitantes -el 38% del total del
            país según el INDEC- eso arroja 30,2 empleados provinciales cada 1.000 habitantes.
            Si se suma el empleo municipal bonaerense, el número consolidado sube a alrededor de
            47 cada 1.000, de acuerdo con estimaciones de la Fundación Ecosur de la Bolsa de
            Comercio de Córdoba para 2024.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="Cargos presupuestados 2026" value="530.922" unit="adm. central + organismos + previsión social" accent />
            <MC label="Ratio provincial" value="30,2" unit="empleados provinciales cada 1.000 hab." />
            <MC label="Ratio consolidado" value="~47" unit="incluyendo empleo municipal bonaerense" />
          </div>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Para evaluar si esa cifra es alta, media o baja, el ejercicio correcto es comparar con
            jurisdicciones de escala similar. La comparación con provincias argentinas pequeñas
            carece de valor metodológico: una provincia de 200.000 habitantes necesita
            proporcionalmente mucho más estado por habitante que una de 17 millones para proveer
            los mismos servicios básicos.
          </p>
        </m.div>

        {/* 02 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="02 · Metodología" title="Tres condiciones para comparar bien" />
          <p className="text-base leading-relaxed mb-6" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            El ejercicio parte de una premisa clara: se seleccionan únicamente jurisdicciones que
            cumplan tres condiciones simultáneamente. Donde la verificación primaria no fue posible,
            se lo aclara de forma explícita.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {CRITERIOS.map((c, i) => (
              <m.div
                key={i}
                {...fadeUp(i * 0.07)}
                style={{
                  background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`,
                  borderTop: `4px solid ${c.top}`,
                  padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '0.575rem', fontWeight: 700, letterSpacing: '0.17em', textTransform: 'uppercase', color: B[400], marginBottom: '0.5rem' }}>{c.label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.ink, marginBottom: '0.5rem' }}>{c.title}</div>
                <div style={{ fontSize: '0.8125rem', color: C.inkMid, lineHeight: 1.65 }}>{c.body}</div>
              </m.div>
            ))}
          </div>
        </m.div>

        {/* 03 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="03 · Brasil" title="Los estados brasileños: el espejo más cercano" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Brasil es el comparador latinoamericano más relevante porque su federalismo distribuye
            funciones de manera casi idéntica al argentino: los estados tienen a su cargo la educación
            básica pública, la policía, la red hospitalaria y la administración general.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <MC label="Minas Gerais - 20,5 M hab." value="19,7" unit="emp./1.000 hab. - PBA tiene un 53% más" accent />
            <MC label="Rio Grande do Sul - 11,4 M hab." value="17,5" unit="emp./1.000 hab. - referencia regional de eficiencia" />
            <MC label="Bahia - 14,8 M hab." value="11,7" unit="emp./1.000 hab. - el más bajo de la serie brasileña" />
          </div>
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Minas Gerais es el comparador más robusto: segundo estado más poblado de Brasil, con
            ~404.000 funcionarios activos incluyendo más de 255.000 docentes y ~79.000 efectivos
            de seguridad pública. Su ratio de 19,7 implica que si PBA operara con esa proporción,
            tendría aproximadamente{' '}
            <strong style={{ color: C.ink }}>185.000 cargos menos</strong>{' '}
            que los actualmente presupuestados.
          </p>
          <div style={{ borderLeft: `3px solid ${B[300]}`, padding: '0.875rem 1.25rem', background: B[50], borderRadius: '0 0.5rem 0.5rem 0', margin: '1.5rem 0', maxWidth: '72ch' }}>
            <p style={{ fontSize: '0.9rem', color: B[700], fontStyle: 'italic', lineHeight: 1.7 }}>
              "Rio Grande do Sul aprobó en 2019 la Reforma RS, un programa de ajuste fiscal y
              modernización que incluyó racionalización del empleo público, señalado regionalmente
              como referencia de equilibrio presupuestario. Aun así, su ratio es de 17,5: muy
              por debajo del bonaerense."
            </p>
            <cite style={{ fontSize: '0.6875rem', color: B[400], fontStyle: 'normal', fontWeight: 500, display: 'block', marginTop: '0.5rem' }}>
              - Gobierno del Estado de Rio Grande do Sul, comunicado oficial, junio 2024
            </cite>
          </div>
          <DownloadableViz title="Empleados estaduales cada 1.000 habitantes - PBA y estados brasileños" fuente="Presupuesto PBA 2026 · Gobierno de Minas Gerais · SAEB Bahia · Gobierno RS (jun. 2024)">
            <ChartBrasil />
          </DownloadableViz>
        </m.div>

        {/* 04 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="04 · Estados Unidos" title="Florida, Nueva York y Texas: tres modelos, el mismo resultado" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Los estados norteamericanos requieren una aclaración metodológica: en EE.UU., la
            educación K-12 se financia desde distritos escolares locales, no desde el gobierno
            estadual. Para hacer la comparación justa, los números de Florida, Nueva York y Texas
            se ajustan incorporando el empleo docente equivalente. Incluso con ese ajuste, todos
            quedan por debajo de Buenos Aires.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="Florida - 22,6 M hab." value="15,3" unit="emp./1.000 hab. (ajustado con K-12)" />
            <MC label="Nueva York - 19,6 M hab." value="22,4" unit="emp./1.000 hab. (ajustado con K-12)" />
            <MC label="Texas - 30 M hab." value="22,8" unit="emp./1.000 hab. (ajustado con K-12)" />
          </div>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Lo más significativo es la convergencia entre Texas -agenda de estado mínimo, baja
            regulación- y Nueva York -el estado más intervencionista de EE.UU., con gasto social
            alto y fuerte presencia sindical. Ambos tienen ratios casi idénticos: 22,8 y 22,4
            respectivamente. Buenos Aires los supera en más del 30%. La brecha no depende de la
            orientación política del gobierno.
          </p>
          <DownloadableViz title="Impacto del ajuste K-12 en los ratios de empleo público de EE.UU." fuente="Dept. de Administración de Florida (2021-22) · Empire Center NY (oct. 2024) · State Auditor's Office Texas, rep. 24-703 (feb. 2024)">
            <ChartEEUU />
          </DownloadableViz>
        </m.div>

      </div>

      {/* 05 - CUADRO COMPLETO (fondo blanco) */}
      <div style={{ background: '#ffffff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 05 · El cuadro completo</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              PBA encabeza el ranking en todas las comparaciones
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
              Buenos Aires tiene el ratio más alto de toda la serie, independientemente de la región,
              el sistema político o el nivel de desarrollo de cada jurisdicción.
            </p>
          </m.div>

          <m.div {...fadeUp(0.1)}>
            <DownloadableViz
              title="Empleados estatales cada 1.000 habitantes - PBA vs. jurisdicciones de escala similar"
              fuente="Presupuesto PBA 2026 · Fuentes primarias oficiales de cada jurisdicción · Elaboración propia DatosPBA"
            >
              <ChartComparacion />
            </DownloadableViz>
          </m.div>

          <m.div {...fadeUp(0.15)} style={{ marginTop: '2rem' }}>
            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Jurisdicción', 'Población', 'Empleados / 1.000 hab.', '% respecto a PBA'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Provincia de Buenos Aires', '17,6 M', '30,2', '-'],
                    ['Minas Gerais',              '20,5 M', '19,7', '65% de PBA'],
                    ['Rio Grande do Sul',         '11,4 M', '17,5', '58% de PBA'],
                    ['Bahia',                     '14,8 M', '11,7', '39% de PBA'],
                    ['Florida *',                 '22,6 M', '15,3', '51% de PBA'],
                    ['Nueva York *',              '19,6 M', '22,4', '74% de PBA'],
                    ['Texas *',                   '30 M',   '22,8', '75% de PBA'],
                  ].map(([j, p, r, pct], i, arr) => (
                    <tr key={i} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none', background: i === 0 ? B[50] : 'transparent' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: i === 0 ? B[600] : C.ink, fontWeight: i === 0 ? 700 : 600 }}>{j}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{p}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: i === 0 ? B[600] : C.ink, fontWeight: i === 0 ? 700 : 400 }}>{r}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: '0.625rem', color: C.inkLight, padding: '0.5rem 1rem 0.75rem', fontStyle: 'italic' }}>
                * EE.UU.: ajustado incorporando docentes K-12, que en ese país dependen de distritos locales y no del gobierno estadual.
              </p>
            </div>
          </m.div>
        </div>
      </div>

      {/* 06 - DIAGNÓSTICO */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0.05)}>
          <SH num="06 · Diagnóstico" title="Qué dice y qué no dice este número" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La comparación no es un argumento a favor del ajuste indiscriminado. Es un diagnóstico
            de escala: Buenos Aires tiene más empleados públicos por habitante que jurisdicciones
            que prestan servicios equivalentes con mayor eficiencia. El debate político debe
            partir de ese dato, no ignorarlo.
          </p>
          <DownloadableViz title="¿Cuántos cargos tendría PBA con el ratio de cada jurisdicción?" fuente="Proyección sobre 17,6 M hab. · Elaboración propia DatosPBA">
            <ChartCargosEquivalentes />
          </DownloadableViz>
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0' }}>
            {IMPLICANCIAS.map((d, i) => (
              <div
                key={i}
                style={{ display: 'flex', gap: '0.875rem', padding: '1rem 1.25rem', borderBottom: i < IMPLICANCIAS.length - 1 ? `0.5px solid #f1f5f9` : 'none', borderLeft: `4px solid ${d.color}`, transition: 'background 0.12s' }}
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
        </m.div>
      </div>

      {/* NOTA METODOLÓGICA */}
      <div className="max-w-5xl mx-auto px-6 pb-6">
        <m.div {...fadeUp(0)} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`, padding: '1.25rem 1.5rem' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: B[400], marginBottom: '0.5rem' }}>Nota metodológica</p>
          <p style={{ fontSize: '0.8rem', color: C.inkMid, lineHeight: 1.7 }}>
            Los datos de EE.UU. se ajustan incorporando el empleo docente K-12, que en Argentina y Brasil
            corre por cuenta del gobierno provincial/estadual pero en EE.UU. depende de distritos escolares
            locales. Sin ese ajuste, los ratios norteamericanos serían significativamente más bajos
            (Florida 9,6; Nueva York 11,4; Texas 11,4), lo que ampliaría aún más la brecha con PBA.
            Los datos del ratio consolidado provincial + municipal (~47/1.000) corresponden a estimaciones
            de la Fundación Ecosur / Bolsa de Comercio de Córdoba para 2024 y no forman parte del cuadro
            comparativo principal, que solo considera el nivel de gobierno provincial/estadual.
          </p>
        </m.div>
      </div>

      {/* CONCLUSIÓN */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <m.div
          {...fadeUp(0)}
          className="bg-pattern-dark"
          style={{ background: C.hero, borderRadius: 20, padding: '44px 48px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', right: -80, top: -80, width: 280, height: 280, borderRadius: '50%', border: '40px solid rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', right: 60, bottom: -100, width: 180, height: 180, borderRadius: '50%', border: '30px solid rgba(255,255,255,0.03)' }} />
          <div className="relative z-10">
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>
              El argumento
            </p>
            <p style={{ color: '#fff', fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
              Texas y Nueva York tienen ideologías opuestas y el mismo ratio de empleo público por habitante.
              Buenos Aires supera a ambos.{' '}
              <span style={{ color: '#93c5fd', fontWeight: 700 }}>La brecha no es ideológica: es estructural.</span>{' '}
              <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                Minas Gerais administra más habitantes con funciones equivalentes y 185.000 empleados menos.
                Ese número es el punto de partida del debate, no el final.
              </span>
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://www.ec.gba.gov.ar"
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', borderRadius: 999, padding: '10px 20px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Ministerio de Economía PBA <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.transparencia.mg.gov.br"
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', borderRadius: 999, padding: '10px 20px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.10)' }}
              >
                Portal Minas Gerais <ExternalLink className="w-3.5 h-3.5" />
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
              Presupuesto PBA 2026 · Gobierno de Minas Gerais (transparencia.mg.gov.br) · SAEB Bahia ·
              Gobierno RS, comunicado jun. 2024 · Dept. de Administración de Florida (2021-22) ·
              Empire Center for Public Policy NY, oct. 2024 · State Auditor's Office Texas, rep. 24-703, feb. 2024 ·
              Fundación Ecosur / Bolsa de Comercio de Córdoba, 2024 · Elaboración propia DatosPBA · 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
