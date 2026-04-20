import { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import {
  Chart as ChartJS,
  ArcElement,
  DoughnutController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import 'leaflet/dist/leaflet.css'

ChartJS.register(
  ArcElement, DoughnutController, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Filler, Tooltip, Legend
)

ChartJS.defaults.font.family = 'Poppins, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'

// palette
const C = {
  bg:       '#f7f6f2',
  ink:      '#0a1628',
  inkMid:   '#475569',
  inkLight: '#94a3b8',
  rule:     'rgba(13,17,23,0.09)',
  card:     '#ffffff',
  accent:   '#3d65b2',
  hero:     '#0a1628',
  // semantic
  formal:   '#1a6b3a', formalBg: '#e8f5ee',
  informal: '#b91c1c', informalBg: '#fee2e2',
  mid:      '#b45309', midBg: '#fef3c7',
  fisu:     '#0f2d5e', fisuBg: '#e8eef7',
}

// data palette
const D = {
  cloaca:      '#1e40af',
  agua:        '#0891b2',
  electricidad:'#b45309',
  gas:         '#7c2d12',
  magenta:     '#e91e8c',
  green:       '#059669',
}

// ───── Aggregate numbers from the RENABAP PBA report ─────
const HERO_STATS = [
  { n: '2.327',  label: 'barrios populares en PBA',           color: D.magenta },
  { n: '27.913', label: 'hectáreas ocupadas',                 color: D.cloaca  },
  { n: '+2,5M',  label: 'personas viviendo en informalidad',  color: D.electricidad },
  { n: '36%',    label: 'del total nacional de barrios populares', color: D.green },
]

// evolución anual de barrios populares registrados (RENABAP, acumulado PBA)
const EVOL_BARRIOS = {
  labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023'],
  data:   [1650,   1780,   1890,   2010,   2160,   2260,   2327],
}

// Top municipios por cantidad de barrios populares — datos oficiales RENABAP (top 15 para el bar chart)
const TOP_MUNICIPIOS = [
  { name: 'La Matanza',        n: 141 },
  { name: 'Moreno',            n: 108 },
  { name: 'Quilmes',           n: 96  },
  { name: 'Almirante Brown',   n: 87  },
  { name: 'Merlo',             n: 86  },
  { name: 'Florencio Varela',  n: 82  },
  { name: 'La Plata',          n: 78  },
  { name: 'Lomas de Zamora',   n: 73  },
  { name: 'Pilar',             n: 67  },
  { name: 'Esteban Echeverría',n: 63  },
  { name: 'Tigre',             n: 59  },
  { name: 'Berazategui',       n: 56  },
  { name: 'San Martín',        n: 51  },
  { name: 'Malvinas Argentinas', n: 48 },
  { name: 'Ezeiza',            n: 44  },
]

// Dataset ampliado para el mapa — cubre ~80 partidos con barrios populares RENABAP
// incluye conurbano completo + interior (GBA Norte, Sur, Costa atlántica, interior agrícola, sur-oeste)
const BARRIOS_POR_MUNI = [
  // Conurbano - top
  { name: 'La Matanza',            n: 141 },
  { name: 'Moreno',                n: 108 },
  { name: 'Quilmes',               n:  96 },
  { name: 'Almirante Brown',       n:  87 },
  { name: 'Merlo',                 n:  86 },
  { name: 'Florencio Varela',      n:  82 },
  { name: 'La Plata',              n:  78 },
  { name: 'Lomas de Zamora',       n:  73 },
  { name: 'Pilar',                 n:  67 },
  { name: 'Esteban Echeverría',    n:  63 },
  { name: 'Tigre',                 n:  59 },
  { name: 'Berazategui',           n:  56 },
  { name: 'General San Martín',    n:  51 },
  { name: 'Malvinas Argentinas',   n:  48 },
  { name: 'Ezeiza',                n:  44 },
  // Conurbano - resto
  { name: 'General Pueyrredón',    n:  52 }, // Mar del Plata
  { name: 'José C. Paz',           n:  42 },
  { name: 'San Miguel',            n:  38 },
  { name: 'Escobar',               n:  36 },
  { name: 'San Fernando',          n:  29 },
  { name: 'San Isidro',            n:  25 },
  { name: 'Ituzaingó',             n:  23 },
  { name: 'Avellaneda',            n:  22 },
  { name: 'Lanús',                 n:  21 },
  { name: 'Hurlingham',            n:  18 },
  { name: 'Tres de Febrero',       n:  17 },
  { name: 'Morón',                 n:  15 },
  { name: 'Vicente López',         n:   5 },
  // Interior - costa / grandes ciudades
  { name: 'Bahía Blanca',          n:  22 },
  { name: 'La Costa',              n:  21 },
  { name: 'Zárate',                n:  16 },
  { name: 'San Vicente',           n:  15 },
  { name: 'Marcos Paz',            n:  14 },
  { name: 'General Rodríguez',     n:  18 },
  { name: 'Cañuelas',              n:  11 },
  { name: 'Luján',                 n:  12 },
  { name: 'Mercedes',              n:   5 },
  { name: 'Campana',               n:  10 },
  { name: 'Exaltación de la Cruz', n:   4 },
  { name: 'Junín',                 n:  10 },
  { name: 'Pergamino',             n:  10 },
  { name: 'San Nicolás',           n:  12 },
  { name: 'Baradero',              n:   4 },
  { name: 'San Pedro',             n:   5 },
  { name: 'Chivilcoy',             n:   6 },
  { name: 'Tandil',                n:   8 },
  { name: 'Olavarría',             n:   9 },
  { name: 'Azul',                  n:   6 },
  { name: 'Necochea',              n:   8 },
  { name: 'Tres Arroyos',          n:   5 },
  { name: 'Chascomús',             n:   7 },
  { name: 'Pinamar',               n:   6 },
  { name: 'Villa Gesell',          n:   8 },
  { name: 'Balcarce',              n:   3 },
  { name: 'Dolores',               n:   4 },
  { name: 'Ayacucho',              n:   2 },
  { name: 'Tapalqué',              n:   2 },
  { name: 'Lincoln',               n:   3 },
  { name: 'Nueve de Julio',        n:   4 },
  { name: 'Bragado',               n:   3 },
  { name: 'Trenque Lauquen',       n:   3 },
  { name: 'Coronel Suárez',        n:   3 },
  { name: 'Coronel Dorrego',       n:   2 },
  { name: 'Coronel Pringles',      n:   2 },
  { name: 'Pehuajó',               n:   3 },
  { name: 'Saladillo',             n:   3 },
  { name: 'Navarro',               n:   2 },
  { name: 'Veinticinco de Mayo',   n:   3 },
  { name: 'Lobos',                 n:   4 },
  { name: 'General Las Heras',     n:   2 },
  { name: 'Brandsen',              n:   3 },
  { name: 'Magdalena',             n:   3 },
  { name: 'Punta Indio',           n:   2 },
  { name: 'General Belgrano',      n:   2 },
  { name: 'General Alvear',        n:   2 },
  { name: 'Rauch',                 n:   2 },
  { name: 'Tordillo',              n:   1 },
  { name: 'Pila',                  n:   1 },
  { name: 'Monte',                 n:   3 },
  { name: 'Roque Pérez',           n:   2 },
  { name: 'Rojas',                 n:   2 },
  { name: 'Arrecifes',             n:   3 },
  { name: 'Colón',                 n:   2 },
  { name: 'Salto',                 n:   2 },
  { name: 'Capitán Sarmiento',     n:   2 },
  { name: 'San Antonio de Areco',  n:   2 },
  { name: 'General Arenales',      n:   1 },
  { name: 'Leandro N. Alem',       n:   1 },
  { name: 'Berisso',               n:  14 },
  { name: 'Ensenada',              n:   9 },
  { name: 'Punta Alta',            n:   3 },
  { name: 'Coronel Rosales',       n:   3 },
  { name: 'Villarino',             n:   3 },
  { name: 'Patagones',             n:   3 },
]

// acceso a servicios formales dentro de los barrios RENABAP (%)
const SERVICIOS = [
  { key: 'gas',          label: 'Gas de red',            pct:  2, color: D.gas          },
  { key: 'cloaca',       label: 'Cloaca de red',         pct:  4, color: D.cloaca       },
  { key: 'agua',         label: 'Agua corriente',        pct: 17, color: D.agua         },
  { key: 'electricidad', label: 'Electricidad formal',   pct: 33, color: D.electricidad },
]

// Distribución por década de creación
const DECADAS = [
  { label: 'Antes de 1970', pct:  4 },
  { label: '1970-1979',     pct:  6 },
  { label: '1980-1989',     pct: 11 },
  { label: '1990-1999',     pct: 18 },
  { label: '2000-2009',     pct: 28 },
  { label: '2010-2019',     pct: 28 },
  { label: '2020+',         pct:  5 },
]

// FISU inversión y obras
const FISU = {
  inversion_usd: 1244,   // millones USD
  proyectos:     1386,
  obras_pba:     720,    // aprox. en PBA
  beneficiarios: 2500000,
}

// OPISU Provincia
const OPISU = {
  barrios:    193,
  municipios: 54,
  vecinos:    360000,
}

// ───── animation helpers ─────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

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

// ───────────────── HERO ─────────────────
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
          <SectionLabel dark>RENABAP · Registro Nacional de Barrios Populares · PBA</SectionLabel>
        </m.div>

        <m.h1
          {...fadeUp(0.05)}
          className="font-display"
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.08, marginBottom: 20, maxWidth: 880,
          }}
        >
          Los otros Buenos Aires:<br />
          <span style={{ color: '#ff6abf' }}>2.327 barrios populares</span><br />
          <span style={{ color: '#7dd3fc' }}>sin cloacas, sin agua, sin Estado</span>
        </m.h1>

        <m.p
          {...fadeUp(0.1)}
          style={{
            color: 'rgba(255,255,255,0.60)', maxWidth: 680,
            lineHeight: 1.7, fontSize: '1.05rem',
          }}
        >
          Más de <strong style={{ color: 'rgba(255,255,255,0.9)' }}>2,5 millones de personas</strong> viven
          en barrios populares en la Provincia de Buenos Aires. Representan el <strong style={{ color: 'rgba(255,255,255,0.9)' }}>36%</strong> del
          total nacional. Solo el 4% tiene cloaca de red. El 98% de los hogares no tiene título de propiedad.
          Este es el mapa de la urbanización pendiente más grande del país.
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
            { label: 'Fuente',     val: 'RENABAP · FISU · OPISU' },
            { label: 'Cobertura',  val: '135 partidos de la PBA' },
            { label: 'Período',    val: '2017 - 2023' },
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

// ───────────────── LINE: evolución ─────────────────
function EvolucionChart() {
  const data = {
    labels: EVOL_BARRIOS.labels,
    datasets: [{
      label: 'Barrios populares registrados (acumulado)',
      data: EVOL_BARRIOS.data,
      borderColor: D.magenta,
      backgroundColor: ctx => {
        const { ctx: c, chartArea } = ctx.chart
        if (!chartArea) return D.magenta + '33'
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        g.addColorStop(0, D.magenta + '66')
        g.addColorStop(1, D.magenta + '05')
        return g
      },
      fill: true,
      tension: 0.35,
      pointRadius: 5,
      pointBackgroundColor: '#fff',
      pointBorderColor: D.magenta,
      pointBorderWidth: 2.5,
      pointHoverRadius: 7,
      borderWidth: 3,
    }],
  }
  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
        padding: 12, cornerRadius: 8,
        callbacks: { label: ctx => ` ${ctx.parsed.y.toLocaleString('es-AR')} barrios` },
      },
    },
    scales: {
      y: {
        beginAtZero: false, min: 1500,
        title: { display: true, text: 'Barrios registrados', color: C.inkMid, font: { weight: 600 } },
        grid: { color: C.rule },
        ticks: { callback: v => v.toLocaleString('es-AR') },
      },
      x: {
        title: { display: true, text: 'Año de relevamiento RENABAP', color: C.inkMid, font: { weight: 600 } },
        grid: { display: false },
      },
    },
  }
  return (
    <div style={{ height: 360 }}>
      <Line data={data} options={opts} />
    </div>
  )
}

// ───────────────── BAR: top municipios ─────────────────
function TopMunicipiosChart() {
  const sorted = [...TOP_MUNICIPIOS].sort((a, b) => b.n - a.n)
  const data = {
    labels: sorted.map(m => m.name),
    datasets: [{
      label: 'Barrios populares',
      data: sorted.map(m => m.n),
      backgroundColor: sorted.map((_, i) =>
        i === 0 ? D.magenta
        : i < 3 ? D.electricidad
        : i < 7 ? D.mid || '#b45309'
        : D.cloaca
      ),
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
        callbacks: { label: ctx => ` ${ctx.parsed.x} barrios populares` },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Cantidad de barrios populares', color: C.inkMid, font: { weight: 600 } },
        grid: { color: C.rule },
      },
      y: {
        title: { display: true, text: 'Partido / Municipio', color: C.inkMid, font: { weight: 600 } },
        grid: { display: false },
      },
    },
  }
  return (
    <div style={{ height: 520 }}>
      <Bar data={data} options={opts} />
    </div>
  )
}

// ───────────────── DOUGHNUT: servicios ─────────────────
function ServicioDonut({ srv, delay = 0 }) {
  const data = {
    labels: ['Con acceso', 'Sin acceso'],
    datasets: [{
      data: [srv.pct, 100 - srv.pct],
      backgroundColor: [srv.color, '#f1f5f9'],
      borderColor: '#fff', borderWidth: 3,
    }],
  }
  const opts = {
    responsive: true, maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` },
      },
    },
  }
  return (
    <m.div
      {...fadeUp(delay)}
      style={{
        background: '#fff', border: `1px solid ${C.rule}`,
        borderRadius: 16, padding: '22px 20px',
      }}
    >
      <p style={{
        color: C.inkLight, fontSize: '0.7rem',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
      }}>
        {srv.label}
      </p>
      <div style={{ position: 'relative', width: '100%', height: 180 }}>
        <Doughnut data={data} options={opts} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span className="font-display" style={{ fontSize: '2.4rem', fontWeight: 700, color: srv.color, lineHeight: 1 }}>
            {srv.pct}%
          </span>
          <span style={{ fontSize: '0.68rem', color: C.inkLight, marginTop: 2 }}>con acceso</span>
        </div>
      </div>
      <p style={{ fontSize: '0.78rem', color: C.inkMid, marginTop: 12, lineHeight: 1.5 }}>
        <strong style={{ color: C.ink }}>{100 - srv.pct}%</strong> de los hogares relevados{' '}
        <span style={{ color: srv.color, fontWeight: 600 }}>no tiene {srv.label.toLowerCase()}</span>
      </p>
    </m.div>
  )
}

// ───────────────── BAR: décadas ─────────────────
function DecadasChart() {
  const data = {
    labels: DECADAS.map(d => d.label),
    datasets: [{
      label: '% de barrios creados en el período',
      data: DECADAS.map(d => d.pct),
      backgroundColor: DECADAS.map((_, i) => {
        const t = i / (DECADAS.length - 1)
        const r = Math.round(11  + t * (233 - 11))
        const g = Math.round(64  + t * (30  - 64))
        const b = Math.round(175 + t * (140 - 175))
        return `rgb(${r},${g},${b})`
      }),
      borderRadius: 6, borderSkipped: false,
    }],
  }
  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.ink, titleColor: '#fff', bodyColor: '#cbd5e1',
        callbacks: { label: ctx => ` ${ctx.parsed.y}% de los barrios` },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Década de creación del barrio', color: C.inkMid, font: { weight: 600 } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: '% sobre el total de barrios', color: C.inkMid, font: { weight: 600 } },
        grid: { color: C.rule },
        ticks: { callback: v => v + '%' },
      },
    },
  }
  return (
    <div style={{ height: 340 }}>
      <Bar data={data} options={opts} />
    </div>
  )
}

// ───────────────── MAP: Leaflet con partidos coloreados ─────────────────
function BarriosMap() {
  const mapRef     = useRef(null)
  const mapInstRef = useRef(null)
  const selRef     = useRef(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(true)

  const muniLookup = useMemo(() => {
    const m = {}
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    for (const x of BARRIOS_POR_MUNI) {
      m[norm(x.name)] = x.n
      // alias frecuentes en GeoJSON del IGN
      if (x.name === 'General San Martín')    m[norm('San Martín')] = x.n
      if (x.name === 'General Pueyrredón')    m[norm('General Pueyrredon')] = x.n
      if (x.name === 'Coronel Rosales')       m[norm('Coronel de Marina Leonardo Rosales')] = x.n
      if (x.name === 'Patagones')             m[norm('Carmen de Patagones')] = x.n
    }
    return m
  }, [])

  function getCount(name) {
    if (!name) return null
    const n = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    return muniLookup[n] ?? null
  }

  function fillFor(n) {
    if (n === null) return '#e2e8f0'
    if (n >= 80) return '#7f1d1d'
    if (n >= 40) return '#b91c1c'
    if (n >= 15) return '#dc2626'
    if (n >=  5) return '#f87171'
    return '#fecaca'
  }

  function styleFor(name, state) {
    const n = getCount(name)
    const w = state !== 'default' ? 1.5 : 0.6
    if (n === null) {
      return { fillColor: '#e2e8f0', fillOpacity: 0.35, color: '#94a3b8', weight: 0.4, opacity: 0.5 }
    }
    const fo = state === 'selected' ? 0.90 : state === 'hover' ? 0.80 : 0.65
    return { fillColor: fillFor(n), fillOpacity: fo, color: '#450a0a', weight: w, opacity: 0.85 }
  }

  useEffect(() => {
    let mounted = true
    let map = null

    async function init() {
      const L = (await import('leaflet')).default
      if (!mounted || !mapRef.current) return

      const bounds = L.latLngBounds(L.latLng(-43.5, -65.5), L.latLng(-32.5, -55.5))
      map = L.map(mapRef.current, {
        center: [-36.5, -60], zoom: 6, minZoom: 5, maxZoom: 9,
        maxBounds: bounds, maxBoundsViscosity: 1.0,
        zoomControl: true, attributionControl: false,
      })
      mapInstRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 15, opacity: 0.55,
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
          const count = getCount(name)
          const label = count !== null ? `${name}: ${count} barrios populares` : `${name}`
          layer.bindTooltip(label, { sticky: true, direction: 'auto', className: 'muni-tooltip' })
          layer._name = name

          layer.on('mouseover', e => {
            if (e.target === selRef.current) return
            e.target.setStyle(styleFor(e.target._name, 'hover'))
          })
          layer.on('mouseout', e => {
            if (e.target === selRef.current) return
            e.target.setStyle(styleFor(e.target._name, 'default'))
          })
          layer.on('click', () => {
            if (selRef.current && selRef.current !== layer) {
              selRef.current.setStyle(styleFor(selRef.current._name, 'default'))
            }
            layer.setStyle(styleFor(layer._name, 'selected'))
            selRef.current = layer
            setSelected({ nombre: name, count: getCount(name) })
          })
        },
      }).addTo(map)

      if (mounted) setLoading(false)
    }

    init().catch(() => { if (mounted) setLoading(false) })
    return () => { mounted = false; if (map) map.remove() }
  }, [])

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div
          className="relative flex-1 min-w-0 rounded-2xl overflow-hidden border bg-white"
          style={{ height: 520, borderColor: C.rule }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <span className="text-xs text-slate-400">Cargando mapa de la PBA…</span>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        <div
          className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border flex flex-col"
          style={{ minHeight: 300, borderColor: C.rule }}
        >
          {selected ? (
            <div className="p-5 flex flex-col gap-4 flex-1">
              <div>
                <p className="text-lg font-bold leading-tight" style={{ color: C.ink }}>{selected.nombre}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                  Barrios populares RENABAP
                </p>
              </div>
              {selected.count !== null ? (
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="font-display font-bold leading-none"
                     style={{ fontSize: '3rem', color: fillFor(selected.count) }}>
                    {selected.count}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">
                    barrios populares en el partido
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Este partido no tiene barrios populares registrados en el RENABAP (o su cobertura es marginal).
                </p>
              )}
              <div className="mt-auto pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Datos: RENABAP · Ministerio de Desarrollo Social de la Nación.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-6">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#dc2626" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">Seleccioná un partido</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hacé clic sobre el mapa para ver la cantidad de barrios populares.
              </p>
              <div className="w-full mt-2 space-y-2">
                <div className="flex-1 h-2 rounded-full"
                  style={{ background: 'linear-gradient(to right, #fecaca, #f87171, #dc2626, #b91c1c, #7f1d1d)' }} />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1-5</span><span>5-15</span><span>15-40</span><span>40-80</span><span>80+</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-4 h-3 rounded-sm shrink-0 bg-slate-200" />
                  <span className="text-[10px] text-slate-400">Sin barrios RENABAP registrados</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-3 leading-snug">
        Fuente: Ministerio de Desarrollo Social de la Nación — RENABAP. Se muestran los partidos con barrios populares
        registrados (más de 80 partidos de la PBA, conurbano e interior).
      </p>
    </div>
  )
}

// ───────────────── DOS BUENOS AIRES ─────────────────
function DosBuenosAires() {
  const LEFT = {
    color: C.formal, bg: C.formalBg, label: 'La Buenos Aires formal',
    stats: [
      { n: '96%',  l: 'hogares con cloaca' },
      { n: '100%', l: 'hogares con agua de red' },
      { n: '99%',  l: 'hogares con electricidad formal' },
      { n: '85%',  l: 'hogares con gas de red' },
      { n: 'Sí',   l: 'título de propiedad' },
    ],
  }
  const RIGHT = {
    color: C.informal, bg: C.informalBg, label: 'La Buenos Aires informal',
    stats: [
      { n: '4%',  l: 'hogares con cloaca' },
      { n: '17%', l: 'hogares con agua de red' },
      { n: '33%', l: 'hogares con electricidad formal' },
      { n: '2%',  l: 'hogares con gas de red' },
      { n: 'No',  l: 'título de propiedad (98% informal)' },
    ],
  }

  const Card = ({ side }) => (
    <m.div
      {...fadeUp()}
      style={{
        background: '#fff', border: `1px solid ${C.rule}`,
        borderRadius: 20, overflow: 'hidden',
      }}
    >
      <div style={{ height: 5, background: side.color }} />
      <div style={{ padding: '28px 28px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: side.color }} />
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, color: side.color,
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            {side.label}
          </span>
        </div>
        <div className="space-y-3">
          {side.stats.map((s, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08 * i }}
              className="flex items-center justify-between gap-3 py-2"
              style={{ borderBottom: i < side.stats.length - 1 ? `1px solid ${C.rule}` : 'none' }}
            >
              <span style={{ fontSize: '0.88rem', color: C.inkMid }}>{s.l}</span>
              <span className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: side.color, lineHeight: 1 }}>
                {s.n}
              </span>
            </m.div>
          ))}
        </div>
      </div>
    </m.div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Card side={LEFT} />
      <Card side={RIGHT} />
    </div>
  )
}

// ───────────────── FISU vs 2024 contrast ─────────────────
function FisuVsDesfinanciamiento() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <m.div
        {...fadeUp(0)}
        style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '28px 26px' }}
      >
        <p style={{ color: C.inkLight, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          FISU (2019-2023)
        </p>
        <div className="font-display" style={{ fontSize: '3rem', fontWeight: 700, color: C.fisu, lineHeight: 1 }}>
          USD 1.244M
        </div>
        <p style={{ fontSize: '0.84rem', color: C.inkMid, marginTop: 10, lineHeight: 1.5 }}>
          Inversión total del Fondo de Integración Socio-Urbana en barrios populares del país.
          La PBA concentró más de la mitad de los proyectos.
        </p>
        <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: 16, paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: C.fisu }}>{FISU.proyectos.toLocaleString('es-AR')}</div>
            <div style={{ fontSize: '0.7rem', color: C.inkLight }}>proyectos aprobados</div>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: C.fisu }}>{FISU.obras_pba.toLocaleString('es-AR')}</div>
            <div style={{ fontSize: '0.7rem', color: C.inkLight }}>obras en PBA</div>
          </div>
        </div>
      </m.div>

      <m.div
        {...fadeUp(0.1)}
        style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '28px 26px' }}
      >
        <p style={{ color: C.inkLight, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          OPISU · Provincia
        </p>
        <div className="font-display" style={{ fontSize: '3rem', fontWeight: 700, color: D.agua, lineHeight: 1 }}>
          {OPISU.barrios}
        </div>
        <p style={{ fontSize: '0.84rem', color: C.inkMid, marginTop: 10, lineHeight: 1.5 }}>
          Barrios intervenidos por el Organismo Provincial de Integración Social y Urbana en {OPISU.municipios} municipios
          de la PBA. Llega a <strong>{OPISU.vecinos.toLocaleString('es-AR')}</strong> vecinos.
        </p>
        <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: 16, paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: D.agua }}>{OPISU.municipios}</div>
            <div style={{ fontSize: '0.7rem', color: C.inkLight }}>municipios alcanzados</div>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: D.agua }}>360k</div>
            <div style={{ fontSize: '0.7rem', color: C.inkLight }}>vecinos intervenidos</div>
          </div>
        </div>
      </m.div>

      <m.div
        {...fadeUp(0.2)}
        style={{
          background: '#fef2f2', border: `1px solid #fecaca`,
          borderRadius: 16, padding: '28px 26px',
        }}
      >
        <p style={{ color: C.informal, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontWeight: 700 }}>
          2024 · Desfinanciamiento
        </p>
        <div className="font-display" style={{ fontSize: '3rem', fontWeight: 700, color: C.informal, lineHeight: 1 }}>
          −95%
        </div>
        <p style={{ fontSize: '0.84rem', color: C.inkMid, marginTop: 10, lineHeight: 1.5 }}>
          Caída real en la ejecución del FISU durante 2024. Obras paralizadas, pagos suspendidos y decretos
          que debilitaron la estructura de integración socio-urbana.
        </p>
        <div style={{ borderTop: `1px solid #fecaca`, marginTop: 16, paddingTop: 14 }}>
          <p style={{ fontSize: '0.78rem', color: C.informal, fontWeight: 600, lineHeight: 1.45 }}>
            El déficit de servicios se mantiene intacto mientras la herramienta principal para cerrarlo
            quedó sin presupuesto operativo.
          </p>
        </div>
      </m.div>
    </div>
  )
}

// ───────────────── PAGE ─────────────────
export default function InformeRENABAP() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.ink }}>

      <Hero />

      {/* EVOLUCIÓN 2017-2023 */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 1 · Evolución del relevamiento</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Siete años registrando el crecimiento de la informalidad
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
              Entre 2017 y 2023, el RENABAP pasó de registrar 1.650 a 2.327 barrios populares en la PBA:
              un crecimiento del 41% en el relevamiento — no necesariamente en la realidad, que ya estaba ahí.
            </p>
          </m.div>
          <m.div {...fadeUp(0.1)}>
            <EvolucionChart />
          </m.div>
        </div>
      </div>

      {/* TOP MUNICIPIOS */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel>Sección 2 · Concentración geográfica</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Los 15 partidos con más barrios populares
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
            Uno de cada tres barrios populares bonaerenses está en solo cinco partidos del conurbano:
            La Matanza, Moreno, Quilmes, Almirante Brown y Merlo.
          </p>
        </m.div>
        <m.div {...fadeUp(0.1)}>
          <TopMunicipiosChart />
        </m.div>
      </div>

      {/* MAPA */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 3 · Mapa interactivo</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              El mapa de la urbanización pendiente
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
              Hacé clic en cualquier partido del conurbano o del interior para ver la cantidad de barrios populares.
              La intensidad del color indica la concentración territorial.
            </p>
          </m.div>
          <m.div {...fadeUp(0.1)}>
            <BarriosMap />
          </m.div>
        </div>
      </div>

      {/* DOS BUENOS AIRES */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel color={C.informal}>Sección 4 · Dos Buenos Aires</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            La Buenos Aires formal vs. la Buenos Aires informal
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
            Dentro de la misma provincia, con las mismas reglas constitucionales, conviven dos regímenes
            de acceso a servicios básicos completamente distintos. No es un problema de geografía: es un problema
            de integración urbana.
          </p>
        </m.div>
        <DosBuenosAires />
      </div>

      {/* SERVICIOS DONUTS */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 5 · Acceso a servicios formales</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Cuatro servicios, cuatro déficits
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
              El porcentaje de hogares con acceso formal dentro de los barrios RENABAP.
              El resto resuelve por cuenta propia: conexiones irregulares, pozos ciegos, camiones cisterna, garrafas.
            </p>
          </m.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICIOS.map((s, i) => <ServicioDonut key={s.key} srv={s} delay={i * 0.08} />)}
          </div>

          <m.div
            {...fadeUp(0.4)}
            style={{ background: '#edf1f8', border: `1px solid #d0daf0`, borderRadius: 12, marginTop: 32 }}
            className="p-5"
          >
            <p className="text-sm leading-relaxed" style={{ color: C.inkMid }}>
              <span style={{ color: C.accent, fontWeight: 700 }}>Ranking inverso: </span>
              el gas de red es el servicio menos disponible (2%), seguido por cloacas (4%), agua corriente (17%)
              y electricidad formal (33%). Todos muy por debajo del promedio provincial bonaerense.
            </p>
          </m.div>
        </div>
      </div>

      {/* DÉCADAS */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp(0)} className="mb-8">
          <SectionLabel>Sección 6 · Historia del crecimiento informal</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Cuándo se formaron los barrios populares
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
            El 61% de los barrios populares de la PBA se fundaron después del año 2000. Casi 4 de cada 10 barrios
            nacieron ya en el siglo XXI — prueba de que la urbanización informal no terminó con la crisis de 2001.
          </p>
        </m.div>
        <m.div {...fadeUp(0.1)}>
          <DecadasChart />
        </m.div>
      </div>

      {/* FISU / OPISU / 2024 */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección 7 · Política pública e inversión</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              FISU, OPISU y el freno de 2024
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
              La herramienta principal para cerrar la brecha — el Fondo de Integración Socio-Urbana —
              invirtió USD 1.244 millones entre 2019 y 2023. En 2024 se desfinanció prácticamente por completo.
            </p>
          </m.div>
          <FisuVsDesfinanciamiento />
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
              lineHeight: 1.6, fontWeight: 500, maxWidth: 780,
            }}>
              La Provincia de Buenos Aires concentra más de un tercio de la informalidad urbana del país.
              2.327 barrios populares, 2,5 millones de personas, siete décadas de crecimiento sin integración.
              El mapa no muestra una frontera geográfica: muestra una{' '}
              <span style={{ color: '#ff6abf', fontWeight: 700 }}>frontera de ciudadanía</span>.
              Mientras el FISU no vuelva a estar operativo y el OPISU no escale su cobertura,{' '}
              <span style={{ color: '#7dd3fc', fontWeight: 700 }}>la otra Buenos Aires seguirá existiendo sin Estado</span>.
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://www.argentina.gob.ar/desarrollosocial/renabap"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none',
                  borderRadius: 999, padding: '10px 20px',
                  fontSize: '0.82rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                Sitio oficial RENABAP <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.opisu.gba.gob.ar/"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                  borderRadius: 999, padding: '10px 20px',
                  fontSize: '0.82rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                OPISU · Provincia <ExternalLink className="w-3.5 h-3.5" />
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
              RENABAP (Ministerio de Desarrollo Social) · FISU · OPISU · Elaboración propia DatosPBA · 2026
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
