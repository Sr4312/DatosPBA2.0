import { useRef, useState, useEffect, useMemo } from 'react'
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

const C = {
  bg:       '#f7f6f2',
  ink:      '#0a1628',
  inkMid:   '#475569',
  inkLight: '#94a3b8',
  rule:     'rgba(13,17,23,0.09)',
  card:     '#ffffff',
  hero:     '#0a1628',
  accent:   '#dc2626',
}

// ─── DATOS ───────────────────────────────────────────────────

const HERO_STATS = [
  { n: '808',  label: 'víctimas de homicidios consumados · PBA 2025',        color: '#fca5a5' },
  { n: '4,6',  label: 'tasa provincial de homicidios cada 100.000 hab.',     color: '#93c5fd' },
  { n: '56%',  label: 'de los homicidios cometidos con armas de fuego',      color: '#fcd34d' },
  { n: '20%',  label: 'de las IPPs de homicidio concentradas en La Matanza', color: '#6ee7b7' },
]

const RANKING_TASA = [
  { nombre: 'La Matanza',               tasa: 8.02 },
  { nombre: 'Moreno - Gral. Rodríguez', tasa: 7.66 },
  { nombre: 'Lomas de Zamora',          tasa: 5.92 },
  { nombre: 'San Martín',               tasa: 5.57 },
]

const RANKING_ABS = [
  { nombre: 'La Matanza',      hom: 147 },
  { nombre: 'Lomas de Zamora', hom: 106 },
  { nombre: 'San Martín',      hom: 103 },
  { nombre: 'Quilmes',         hom: 68  },
]

const COMPARACION = [
  { label: 'La Matanza',   val: 8.02, highlight: true  },
  { label: 'PBA',          val: 4.6,  highlight: false },
  { label: 'CABA',         val: 2.5,  highlight: false },
  { label: 'Interior PBA', val: 2.42, highlight: false },
]

const MOVILES = [
  'Conflictos interpersonales',
  'Robos violentos',
  'Violencia urbana',
  'Narcotráfico / economías ilegales',
  'Violencia intrafamiliar',
]

const FACTORES = [
  'Enorme densidad poblacional',
  'Fuerte desigualdad social',
  'Fragmentación urbana',
  'Alta presencia de narcotráfico',
  'Economías ilegales arraigadas',
  'Gran extensión territorial',
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

function DownloadableViz({ title, fuente = 'Ministerio Público · PBA', children }) {
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

function MC({ label, value, unit, accent = false }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.rule}`,
      borderLeft: `3px solid ${accent ? C.accent : C.inkLight}`,
      borderRadius: 12,
      padding: '18px 20px',
    }}>
      <p style={{
        fontSize: '0.72rem', fontWeight: 700, color: C.inkMid,
        textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
      }}>
        {label}
      </p>
      <div
        className="font-display"
        style={{ fontSize: '2.2rem', fontWeight: 700, color: accent ? C.accent : C.ink, lineHeight: 1 }}
      >
        {value}
      </div>
      {unit && <p style={{ fontSize: '0.76rem', color: C.inkMid, marginTop: 4 }}>{unit}</p>}
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
          <SectionLabel dark color="rgba(252,165,165,0.8)">
            Ministerio Público · IPP · Provincia de Buenos Aires
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
          Homicidios dolosos<br />
          <span style={{ color: '#fca5a5' }}>en la Provincia de Buenos Aires</span>
        </m.h1>

        <m.p
          {...fadeUp(0.1)}
          style={{
            color: 'rgba(255,255,255,0.60)', maxWidth: 720,
            lineHeight: 1.7, fontSize: '1.05rem',
          }}
        >
          Las estadísticas del Ministerio Público bonaerense revelan que la violencia letal
          se concentra fuertemente en el conurbano. Dentro de ese mapa,{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>La Matanza</strong>{' '}
          emerge como el caso mas crítico de toda la provincia: tasa mas alta, mayor volumen
          absoluto y casi un quinto de todas las causas de homicidio.
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
            { label: 'Fuente principal', val: 'Ministerio Público de la PBA' },
            { label: 'Sistema',          val: 'IPP - Investigaciones Penales Preparatorias' },
            { label: 'Complemento',      val: 'SNIC 2000-2024' },
            { label: 'Actualizado',      val: 'Mayo 2026' },
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

// ─── SECCIÓN 1: PANORAMA PROVINCIAL ─────────────────────────

function BrechaChart() {
  const data = {
    labels: [
      ['Conurbano, La Plata', 'y Mar del Plata'],
      ['Promedio', 'provincial'],
      ['Interior', 'bonaerense'],
    ],
    datasets: [{
      label: 'Tasa de homicidios /100k',
      data: [5.48, 4.6, 2.42],
      backgroundColor: [C.accent, '#64748b', '#94a3b8'],
      borderRadius: 6,
      borderSkipped: false,
      maxBarThickness: 64,
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
        callbacks: { label: ctx => ` ${ctx.parsed.y} homicidios /100k hab.` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { weight: 600 } },
      },
      y: {
        beginAtZero: true,
        max: 7,
        title: { display: true, text: 'Tasa /100.000 habitantes', color: C.inkMid, font: { weight: 600 } },
        grid: { color: C.rule },
      },
    },
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ height: 300 }}>
        <Bar data={data} options={opts} />
      </div>
      <p className="text-[11px] mt-3 px-1" style={{ color: C.inkLight }}>
        Fuente: Ministerio Público de la Provincia de Buenos Aires - Estadísticas 2025.
      </p>
    </div>
  )
}

// ─── SECCIÓN 3: DEPARTAMENTOS CRÍTICOS ───────────────────────

function RankingTasaChart() {
  const data = {
    labels: RANKING_TASA.map(d => d.nombre),
    datasets: [{
      label: 'Tasa /100k',
      data: RANKING_TASA.map(d => d.tasa),
      backgroundColor: RANKING_TASA.map((_, i) => i === 0 ? C.accent : '#94a3b8'),
      borderRadius: 5,
      borderSkipped: false,
      maxBarThickness: 28,
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
        callbacks: { label: ctx => ` ${ctx.parsed.x} /100k hab.` },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 10,
        title: { display: true, text: 'Tasa /100.000 hab.', color: C.inkMid, font: { weight: 600 } },
        grid: { color: C.rule },
      },
      y: { grid: { display: false }, ticks: { font: { weight: 600 } } },
    },
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: C.ink, marginBottom: 12 }}>
        Por tasa de homicidios dolosos
      </p>
      <div style={{ height: 220 }}>
        <Bar data={data} options={opts} />
      </div>
    </div>
  )
}

function RankingAbsChart() {
  const data = {
    labels: RANKING_ABS.map(d => d.nombre),
    datasets: [{
      label: 'Homicidios consumados',
      data: RANKING_ABS.map(d => d.hom),
      backgroundColor: RANKING_ABS.map((_, i) => i === 0 ? C.accent : '#94a3b8'),
      borderRadius: 5,
      borderSkipped: false,
      maxBarThickness: 28,
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
        callbacks: { label: ctx => ` ${ctx.parsed.x} homicidios consumados` },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Cantidad absoluta', color: C.inkMid, font: { weight: 600 } },
        grid: { color: C.rule },
      },
      y: { grid: { display: false }, ticks: { font: { weight: 600 } } },
    },
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: C.ink, marginBottom: 12 }}>
        Por cantidad absoluta de homicidios
      </p>
      <div style={{ height: 220 }}>
        <Bar data={data} options={opts} />
      </div>
    </div>
  )
}

// ─── SECCIÓN 4: FOCO LA MATANZA ──────────────────────────────

function MatanzaComparacionChart() {
  const data = {
    labels: COMPARACION.map(d => d.label),
    datasets: [{
      label: 'Tasa de homicidios /100k',
      data: COMPARACION.map(d => d.val),
      backgroundColor: COMPARACION.map(d => d.highlight ? C.accent : '#94a3b8'),
      borderRadius: 6,
      borderSkipped: false,
      maxBarThickness: 56,
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
        callbacks: { label: ctx => ` ${ctx.parsed.y} homicidios /100k hab.` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { weight: 600 } } },
      y: {
        beginAtZero: true,
        max: 10,
        title: { display: true, text: 'Tasa /100.000 habitantes', color: C.inkMid, font: { weight: 600 } },
        grid: { color: C.rule },
      },
    },
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ height: 280 }}>
        <Bar data={data} options={opts} />
      </div>
      <p className="text-[11px] mt-3 px-1" style={{ color: C.inkLight }}>
        La Matanza vs. promedios de referencia. Fuente: Ministerio Público PBA / SNIC 2024.
      </p>
    </div>
  )
}

// ─── SECCIÓN 5: VÍCTIMAS ─────────────────────────────────────

const VICTIMAS_CARDS = [
  {
    stat: '123',
    label: 'homicidios en contexto de robo',
    desc: 'Del total provincial, 22 ocurrieron en La Matanza. Entre las víctimas, trabajadores y vecinos sorprendidos por asaltantes en la vía pública.',
    sub: 'Incluye el caso de Rita Mabel Suárez, docente, 47 años',
    color: C.accent,
    bg: '#fef2f2',
  },
  {
    stat: '175',
    label: 'menores imputados en causas de homicidio',
    desc: '20 de esos casos corresponden al Departamento Judicial La Matanza. La participación de menores en violencia letal es otro foco de alerta.',
    sub: 'Caso Dilan Joel Insfrán, 17 años, González Catán',
    color: '#1e3a8a',
    bg: '#eff6ff',
  },
]

// ─── NOTA METODOLÓGICA ────────────────────────────────────────

function NotaMetodologica() {
  return (
    <m.div
      {...fadeUp(0)}
      style={{
        background: '#fef3c7',
        border: '1px solid rgba(180,83,9,0.18)',
        borderLeft: '3px solid #b45309',
        borderRadius: 12,
        padding: '18px 20px',
      }}
    >
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
        Nota sobre los datos
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        El informe consolidado del Ministerio Público registra{' '}
        <strong style={{ color: C.ink }}>848 víctimas</strong> en su publicación oficial;
        el reporte de La Nación del 23/05/2026, basado en el mismo sistema IPP, cita{' '}
        <strong style={{ color: C.ink }}>808 homicidios</strong>, posiblemente por un corte
        temporal diferente dentro del año 2025. Este informe utiliza la cifra de 808 del
        reporte mas reciente disponible. La tasa de homicidios de La Matanza (8,02 /100k)
        es consistente en ambas fuentes.
      </p>
    </m.div>
  )
}

// ─── MAPA CHOROPLETH ─────────────────────────────────────────

const TASA_POR_MUNI = {
  'la matanza':         8.02,
  'moreno':             7.66,
  'general rodriguez':  7.66,
  'lomas de zamora':    5.92,
  'general san martin': 5.57,
  'san martin':         5.57,
  'quilmes':            4.50,
}

function HomicidiosMap() {
  const mapRef     = useRef(null)
  const mapInstRef = useRef(null)
  const [loading, setLoading] = useState(true)

  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

  const lookup = useMemo(() => {
    const m = {}
    for (const [k, v] of Object.entries(TASA_POR_MUNI)) m[k] = v
    return m
  }, [])

  function getTasa(name) {
    if (!name) return null
    return lookup[norm(name)] ?? null
  }

  function fillFor(t) {
    if (t === null) return '#e2e8f0'
    if (t >= 7.5) return '#7f1d1d'
    if (t >= 6)   return '#b91c1c'
    if (t >= 5)   return '#dc2626'
    if (t >= 3.5) return '#f87171'
    return '#fecaca'
  }

  function styleFor(name, state) {
    const t = getTasa(name)
    if (t === null) return { fillColor: '#e2e8f0', fillOpacity: 0.35, color: '#94a3b8', weight: 0.4, opacity: 0.5 }
    const fo = state === 'selected' ? 0.92 : state === 'hover' ? 0.82 : 0.70
    return { fillColor: fillFor(t), fillOpacity: fo, color: '#450a0a', weight: state !== 'default' ? 1.5 : 0.6, opacity: 0.85 }
  }

  useEffect(() => {
    let mounted = true
    let map = null

    async function init() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      if (!mounted || !mapRef.current) return

      const bounds = L.latLngBounds(L.latLng(-43.5, -65.5), L.latLng(-32.5, -55.5))
      map = L.map(mapRef.current, {
        center: [-36.5, -60], zoom: 6, minZoom: 5, maxZoom: 9,
        maxBounds: bounds, maxBoundsViscosity: 1.0,
        zoomControl: true, attributionControl: false,
      })
      mapInstRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 15, opacity: 0.45,
      }).addTo(map)

      const IGN_URL =
        'https://wfs.ign.gob.ar/geoserver/ign/ows?service=WFS&version=2.0.0&request=GetFeature' +
        '&typeName=ign:departamento&CQL_FILTER=provincia_id%3D%2706%27' +
        '&outputFormat=application/json&srsName=EPSG:4326'
      const FALLBACK_URL = 'https://raw.githubusercontent.com/agburgos83/partidosBA/main/partidos.geojson'

      let geojson
      try {
        const res = await fetch(IGN_URL)
        if (!res.ok) throw new Error()
        geojson = await res.json()
      } catch {
        const res = await fetch(FALLBACK_URL)
        geojson = await res.json()
      }
      if (!mounted) return

      L.geoJSON(geojson, {
        style: f => styleFor(f.properties.nombre || f.properties.nam || '', 'default'),
        onEachFeature(feature, layer) {
          const name = feature.properties.nombre || feature.properties.nam || ''
          const t = getTasa(name)
          const label = t !== null ? `${name}: ${t} hom./100k hab.` : name
          layer.bindTooltip(label, { sticky: true, direction: 'auto' })
          layer._name = name
          layer.on('mouseover', e => e.target.setStyle(styleFor(e.target._name, 'hover')))
          layer.on('mouseout',  e => e.target.setStyle(styleFor(e.target._name, 'default')))
        },
      }).addTo(map)

      if (mounted) setLoading(false)
    }

    init().catch(console.error)
    return () => {
      mounted = false
      if (map) map.remove()
    }
  }, [])

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.rule}` }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: C.ink, marginBottom: 4 }}>
          Tasa de homicidios por municipio (datos disponibles)
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '≥ 7,5', color: '#7f1d1d' },
            { label: '6 - 7,5', color: '#b91c1c' },
            { label: '5 - 6', color: '#dc2626' },
            { label: '3,5 - 5', color: '#f87171' },
            { label: '< 3,5', color: '#fecaca' },
            { label: 'Sin dato', color: '#e2e8f0' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: C.inkMid }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color, border: '1px solid rgba(0,0,0,0.1)' }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: '#f8fafc' }}>
            <p style={{ fontSize: '0.8rem', color: C.inkLight }}>Cargando mapa…</p>
          </div>
        )}
        <div ref={mapRef} style={{ height: 420, width: '100%' }} />
      </div>
      <p style={{ padding: '8px 20px 12px', fontSize: '0.68rem', color: C.inkLight }}>
        Fuente: Ministerio Público PBA 2025. Los municipios sin dato corresponden a departamentos judiciales sin desagregación disponible.
      </p>
    </div>
  )
}

// ─── PÁGINA ───────────────────────────────────────────────────

export default function InformeHomicidiosPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.ink }}>

      <Hero />

      {/* SECCIÓN 1 - PANORAMA PROVINCIAL */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 1 · Panorama provincial</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              808 víctimas: la dimensión de la violencia letal bonaerense
            </h2>
            <p style={{ color: C.inkMid, maxWidth: '72ch' }} className="text-sm">
              La Provincia de Buenos Aires sigue siendo el principal nucleo de conflictividad
              penal del país. Mas de la mitad de los homicidios se cometen con armas de fuego
              y mas del 60% ocurre en la vía pública. El conurbano concentra la enorme mayoría
              de los casos.
            </p>
          </m.div>
          <m.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <MC label="Víctimas de homicidios consumados" value="808" unit="Provincia de Buenos Aires · 2025" accent />
            <MC label="Homicidios con arma de fuego" value="56%" unit="Del total de causas registradas" />
            <MC label="Ocurridos en vía pública" value="+60%" unit="Contexto de lugar mas frecuente" />
          </m.div>
          <m.div {...fadeUp(0.15)}>
            <div style={{
              background: C.bg,
              border: `1px solid ${C.rule}`,
              borderLeft: `3px solid ${C.accent}`,
              borderRadius: 12,
              padding: '20px 24px',
            }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
                Principales móviles identificados
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {MOVILES.map((movil, i) => (
                  <div key={i} style={{
                    background: '#fff',
                    border: `1px solid ${C.rule}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: '0.76rem',
                    color: C.ink,
                    fontWeight: 500,
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}>
                    {movil}
                  </div>
                ))}
              </div>
            </div>
          </m.div>
        </div>
      </div>

      {/* SECCIÓN 2 - BRECHA TERRITORIAL */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel>Sección 2 · Brecha territorial</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            El conurbano casi duplica al interior en homicidios
          </h2>
          <p style={{ color: C.inkMid, maxWidth: '72ch' }} className="text-sm">
            Las áreas metropolitanas (Conurbano, La Plata y Mar del Plata) registran una tasa de{' '}
            <strong style={{ color: C.ink }}>5,48 /100k</strong>, contra solo{' '}
            <strong style={{ color: C.ink }}>2,42</strong> en el interior provincial.
            La brecha refleja décadas de densificación urbana desigual y deficit estructural
            en seguridad.
          </p>
        </m.div>
        <m.div {...fadeUp(0.1)}>
          <DownloadableViz
            title="Tasa de homicidios dolosos por region - PBA 2025"
            fuente="Ministerio Público de la Provincia de Buenos Aires"
          >
            <BrechaChart />
          </DownloadableViz>
        </m.div>
      </div>

      {/* SECCIÓN 3 - DEPARTAMENTOS CRÍTICOS */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 3 · Departamentos críticos</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Los cuatro departamentos con mayor violencia letal
            </h2>
            <p style={{ color: C.inkMid, maxWidth: '72ch' }} className="text-sm">
              La Matanza encabeza tanto el ranking por tasa como el de volumen absoluto.
              Su tasa de{' '}
              <strong style={{ color: C.ink }}>8,02 /100k</strong> supera en mas de tres
              puntos al segundo departamento, y en{' '}
              <strong style={{ color: C.ink }}>44 homicidios</strong> al siguiente en
              cantidad absoluta.
            </p>
          </m.div>
          <m.div {...fadeUp(0.1)}>
            <DownloadableViz
              title="Ranking departamentos judiciales por tasa y volumen de homicidios dolosos - PBA 2025"
              fuente="Ministerio Público de la Provincia de Buenos Aires"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <RankingTasaChart />
                <RankingAbsChart />
              </div>
            </DownloadableViz>
          </m.div>
          <m.div {...fadeUp(0.15)} className="mt-6">
            <HomicidiosMap />
          </m.div>
        </div>
      </div>

      {/* SECCIÓN 4 - FOCO LA MATANZA */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel>Sección 4 · Foco La Matanza</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Un municipio que concentra la conflictividad de una región entera
          </h2>
          <p style={{ color: C.inkMid, maxWidth: '72ch' }} className="text-sm">
            El Departamento Judicial La Matanza comprende exclusivamente al municipio
            homónimo, con{' '}
            <strong style={{ color: C.ink }}>1.837.774 habitantes</strong>. Que un único
            territorio genere casi el 20% de todas las causas de homicidio provinciales
            no tiene precedente en el mapa judicial bonaerense.
          </p>
        </m.div>

        <m.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <MC label="Homicidios consumados" value="147" unit="Departamento Judicial La Matanza · 2025" accent />
          <MC label="Tasa de homicidios /100k" value="8,02" unit="La mas alta del AMBA y de toda la Provincia" />
          <MC label="Sobre San Martín (103 hom.)" value="+44" unit="Homicidios mas que el segundo departamento" />
        </m.div>

        <m.div {...fadeUp(0.15)}>
          <DownloadableViz
            title="La Matanza vs promedios de referencia - Tasa de homicidios dolosos 2025"
            fuente="Ministerio Público PBA / SNIC 2024"
          >
            <MatanzaComparacionChart />
          </DownloadableViz>
        </m.div>

        <m.div {...fadeUp(0.2)} className="mt-8">
          <div style={{
            background: '#fff',
            border: `1px solid ${C.rule}`,
            borderLeft: `3px solid ${C.accent}`,
            borderRadius: 12,
            padding: '20px 24px',
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
              Factores estructurales
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FACTORES.map((factor, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: C.ink }}>
                  <span style={{ color: C.accent, fontWeight: 700, flexShrink: 0 }}>-</span>
                  {factor}
                </div>
              ))}
            </div>
          </div>
        </m.div>
      </div>

      {/* SECCIÓN 5 - QUIÉNES SON LAS VÍCTIMAS */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 5 · Quiénes son las víctimas</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Robos, bandas y menores: el perfil de la violencia
            </h2>
            <p style={{ color: C.inkMid, maxWidth: '72ch' }} className="text-sm">
              Detrás de los números hay personas. En 2025, 123 homicidios en toda la provincia
              ocurrieron durante un robo; 76 se vincularon a narcotráfico o violencia de bandas.
              Los datos de menores imputados suman otro nivel de alerta.
            </p>
          </m.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {VICTIMAS_CARDS.map((d, i) => (
              <m.div
                key={d.stat}
                {...fadeUp(0.08 * i)}
                style={{
                  background: '#fff',
                  border: `1px solid ${C.rule}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                }}
              >
                <div style={{ height: 5, background: d.color }} />
                <div style={{ padding: '28px 28px 26px' }}>
                  <div style={{ background: d.bg, borderRadius: 14, padding: '20px 20px 18px', marginBottom: 18 }}>
                    <p style={{ fontSize: '0.7rem', color: d.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                      {d.label}
                    </p>
                    <div className="font-display" style={{ fontSize: '3.5rem', fontWeight: 700, color: d.color, lineHeight: 1 }}>
                      {d.stat}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 14 }}>
                    {d.desc}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: C.inkLight }}>{d.sub}</p>
                </div>
              </m.div>
            ))}
          </div>

          <m.div {...fadeUp(0.2)} className="mt-6">
            <div style={{ background: C.bg, border: `1px solid ${C.rule}`, borderRadius: 12, padding: '18px 20px' }}>
              <p style={{ fontSize: '0.8rem', color: C.inkMid, lineHeight: 1.7, maxWidth: '72ch' }}>
                <strong style={{ color: C.ink }}>76 casos</strong> vinculados a narcotráfico o
                bandas en toda la provincia. La expansión de economías ilegales -especialmente en
                los partidos del segundo y tercer cordón del conurbano- convierte a La Matanza en
                uno de los mayores desafíos de seguridad pública de la Argentina.
              </p>
            </div>
          </m.div>
        </div>
      </div>

      {/* NOTA METODOLÓGICA */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <NotaMetodologica />
      </div>

      {/* CONCLUSIÓN */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
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
              El argumento
            </p>
            <p style={{
              color: '#fff', fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
              lineHeight: 1.6, fontWeight: 500, maxWidth: 800,
            }}>
              La violencia letal no se distribuye de manera uniforme en la Provincia de
              Buenos Aires. Hay un municipio -La Matanza- que concentra{' '}
              <span style={{ color: '#fca5a5', fontWeight: 700 }}>casi el 20% de todos
              los homicidios provinciales</span>, con la tasa mas alta del AMBA y mas del
              triple de la que registra el interior bonaerense.{' '}
              <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                Sin una estrategia territorial específica para La Matanza, cualquier política
                de seguridad provincial llega incompleta.
              </span>
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://www.mpba.gov.ar"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none',
                  borderRadius: 999, padding: '10px 20px',
                  fontSize: '0.82rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                Ministerio Público PBA <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.argentina.gob.ar/seguridad/estadisticascriminales"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
                  borderRadius: 999, padding: '10px 20px',
                  fontSize: '0.82rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                SNIC - Estadísticas Criminales <ExternalLink className="w-3.5 h-3.5" />
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
              Ministerio Público de la Provincia de Buenos Aires (2025) · SNIC 2000-2024 · La Nación (23/05/2026) · Elaboración propia DatosPBA · 2026
            </p>
          </div>
          <Link to="/informes" className="text-sm no-underline font-medium" style={{ color: C.inkLight }}>
            - Ver todos los informes
          </Link>
        </div>
      </div>

    </div>
  )
}
