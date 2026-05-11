import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft, Download } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement,
  Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import html2canvas from 'html2canvas'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// ── Colores de layout ────────────────────────────────────────────
const C = {
  bg:       '#f7f6f2',
  ink:      '#0a1628',
  inkMid:   '#475569',
  inkLight: '#94a3b8',
  rule:     'rgba(13,17,23,0.09)',
  card:     '#ffffff',
  hero:     '#0a1628',
  accent:   '#3d65b2',
}

// ── Paleta de datos ──────────────────────────────────────────────
const D = {
  red:   '#dc2626',   // Buenos Aires
  blue:  '#2563eb',   // Córdoba
  teal:  '#0891b2',   // Santa Fe
  amber: '#d97706',   // Mendoza
}

const PROV_COLORS = {
  'Buenos Aires': D.red,
  'Córdoba':      D.blue,
  'Santa Fe':     D.teal,
  'Mendoza':      D.amber,
}

const MUNICIPIOS = [
  { municipio: 'Pilar',            provincia: 'Buenos Aires', base: 'Facturación + monto fijo', drog: 1.441,  farm: 1.242, total: 3.728 },
  { municipio: 'La Plata',         provincia: 'Buenos Aires', base: 'Facturación',               drog: 1.000,  farm: 1.000, total: 3.030 },
  { municipio: 'Florencio Varela', provincia: 'Buenos Aires', base: 'Facturación',               drog: 0.832,  farm: 0.832, total: 2.688 },
  { municipio: 'Córdoba Capital',  provincia: 'Córdoba',      base: 'Facturación',               drog: 0.800,  farm: 0.700, total: 2.521 },
  { municipio: 'Río Cuarto',       provincia: 'Córdoba',      base: 'Facturación',               drog: 0.600,  farm: 0.600, total: 2.216 },
  { municipio: 'Santa Fe Capital', provincia: 'Santa Fe',     base: 'Facturación',               drog: 0.600,  farm: 0.300, total: 1.911 },
  { municipio: 'Rafaela',          provincia: 'Santa Fe',     base: 'Facturación',               drog: 0.560,  farm: 0.200, total: 1.769 },
  { municipio: 'Quilmes',          provincia: 'Buenos Aires', base: 'Facturación',               drog: 0.700,  farm: 0.000, total: 1.707 },
  { municipio: 'Bahía Blanca',     provincia: 'Buenos Aires', base: 'Facturación',               drog: 0.400,  farm: 0.000, total: 1.404 },
  { municipio: 'Luján de Cuyo',    provincia: 'Mendoza',      base: 'Monto fijo',                drog: 0.0096, farm: 0.096, total: 1.107 },
]

// ── Helpers ──────────────────────────────────────────────────────
const fmt = n => n.toFixed(2).replace('.', ',')

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
const dur = (d = 0.5, delay = 0) => ({ duration: d, delay })

function SectionLabel({ children, dark = false }) {
  return (
    <p style={{ color: dark ? 'rgba(255,255,255,0.5)' : C.accent }}
      className="text-xs font-semibold tracking-[0.18em] uppercase mb-3">
      {children}
    </p>
  )
}

function downloadCard(ref, filename, bg) {
  if (!ref.current) return
  html2canvas(ref.current, {
    scale: 3,
    useCORS: true,
    allowTaint: false,
    backgroundColor: bg,
    logging: false,
    removeContainer: true,
  }).then(canvas => {
    const a = document.createElement('a')
    a.download = filename
    a.href = canvas.toDataURL('image/png')
    a.click()
  })
}

// ── Botón de descarga compartido ────────────────────────────────
function DlBtn({ onClick }) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
      <Download style={{ width: 14, height: 14 }} /> Descargar
    </button>
  )
}

export default function InformeMedicamentosTISH() {
  const [activeProvince, setActiveProvince] = useState(null)
  const card1Ref = useRef(null)
  const card2Ref = useRef(null)
  const card3Ref = useRef(null)
  const card4Ref = useRef(null)

  const filtered = activeProvince
    ? MUNICIPIOS.filter(m => m.provincia === activeProvince)
    : MUNICIPIOS

  const chartData = {
    labels: filtered.map(m => m.municipio),
    datasets: [
      {
        label: 'Laboratorios (asumido)',
        data: filtered.map(() => 1.0),
        backgroundColor: 'rgba(100,116,139,0.3)',
        stack: 's',
      },
      {
        label: 'Droguerías',
        data: filtered.map(m => m.drog),
        backgroundColor: filtered.map(m => PROV_COLORS[m.provincia] + 'cc'),
        stack: 's',
      },
      {
        label: 'Farmacias',
        data: filtered.map(m => m.farm),
        backgroundColor: filtered.map(m => PROV_COLORS[m.provincia] + '66'),
        stack: 's',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'Poppins', size: 11 }, color: C.inkMid, boxWidth: 12, padding: 16 },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${fmt(Number(ctx.raw))}%`,
          footer: items => {
            if (!items.length) return ''
            const row = filtered[items[0].dataIndex]
            return row ? `Total acumulado: ${fmt(row.total)}%` : ''
          },
        },
        backgroundColor: C.ink,
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        footerColor: D.red,
        footerFont: { weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        stacked: true,
        max: 4.3,
        ticks: { callback: v => `${v}%`, font: { family: 'Poppins', size: 11 }, color: C.inkMid },
        grid: { color: 'rgba(13,17,23,0.06)' },
      },
      y: {
        stacked: true,
        ticks: { font: { family: 'Poppins', size: 11 }, color: C.inkMid },
        grid: { display: false },
      },
    },
  }

  const PROVINCES = ['Todas', 'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza']

  // ── Estilos compartidos de tarjetas Twitter ──────────────────
  const cardBase = {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 14,
    lineHeight: 1.5,
  }
  const darkCard = {
    ...cardBase,
    background: '#0c1a2e',
    borderRadius: 20,
    padding: 36,
    color: '#fff',
  }
  const lightCard = {
    ...cardBase,
    background: '#ffffff',
    borderRadius: 20,
    padding: 36,
    color: C.ink,
  }
  const topBar = (a, b) => ({
    height: 4,
    borderRadius: '20px 20px 0 0',
    background: `linear-gradient(90deg, ${a}, ${b})`,
    marginBottom: 24,
    marginTop: -36,
    marginLeft: -36,
    marginRight: -36,
  })
  const tag = color => ({
    color,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    marginBottom: 12,
  })
  const footer = (color = C.inkLight) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    marginTop: 16,
    borderTop: `1px solid rgba(0,0,0,0.08)`,
    fontSize: 10,
    color,
  })
  const darkFooter = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    marginTop: 16,
    borderTop: '1px solid rgba(255,255,255,0.1)',
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.ink }}>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <div className="bg-pattern-dark" style={{ background: C.hero }}>
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
          <Link to="/informes"
            className="inline-flex items-center gap-1.5 text-sm no-underline mb-10"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            <ArrowLeft className="w-4 h-4" /> Volver a informes
          </Link>

          <m.div {...fadeUp} transition={dur(0.6)}>
            <SectionLabel dark>CEFIP-UNLP · CILFA · Mayo 2025</SectionLabel>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-white">
              El precio de vivir<br />
              <span style={{ color: D.red }}>en el municipio equivocado</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 620 }}
              className="text-base sm:text-lg leading-relaxed">
              La Tasa de Inspección, Seguridad e Higiene grava los medicamentos de manera radicalmente
              distinta según el municipio. Pilar lidera con una presión del 3,73% sobre el precio
              final — casi el triple que Bahía Blanca. Mismo producto, reglas muy distintas.
            </p>
          </m.div>

          <m.div {...fadeUp} transition={dur(0.5, 0.2)}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
            {[
              { n: '34,8%', label: 'Presión tributaria total sobre la cadena de medicamentos en Argentina', color: D.red },
              { n: '3,73%', label: 'Carga TISH en Pilar — la más alta entre todos los municipios analizados', color: D.teal },
              { n: '×2,7',  label: 'Diferencia entre Pilar y Bahía Blanca — mismo producto, distinta carga', color: '#f59e0b' },
              { n: '6,9 pp',label: 'Puntos de IIBB provincial sobre medicamentos en la Prov. de Buenos Aires', color: C.accent },
            ].map((s, i) => (
              <m.div key={i} {...fadeUp} transition={dur(0.45, 0.1 * i + 0.3)}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16 }}
                className="p-5">
                <div className="font-display text-3xl sm:text-4xl font-bold mb-1" style={{ color: s.color }}>{s.n}</div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.45 }}>{s.label}</p>
              </m.div>
            ))}
          </m.div>
        </div>
      </div>

      {/* ── GRÁFICO INTERACTIVO ───────────────────────────────── */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp} transition={dur(0.5)} className="mb-6">
            <SectionLabel>Comparación interactiva</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Presión TISH acumulada por etapa de la cadena
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
              Alícuota sobre facturación como % del precio final de venta. Asume 1% para laboratorios.
              Filtrá por provincia para comparar entre jurisdicciones.
            </p>
          </m.div>

          <div className="flex flex-wrap gap-2 mb-8">
            {PROVINCES.map(p => {
              const active = p === 'Todas' ? !activeProvince : activeProvince === p
              return (
                <button key={p}
                  onClick={() => setActiveProvince(p === 'Todas' ? null : p)}
                  style={{
                    background: active ? C.ink : 'transparent',
                    color: active ? '#fff' : C.inkMid,
                    border: `1.5px solid ${active ? C.ink : 'rgba(13,17,23,0.15)'}`,
                    borderRadius: 999, padding: '5px 16px',
                    fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {p}
                </button>
              )
            })}
          </div>

          <m.div {...fadeUp} transition={dur(0.6, 0.1)}
            style={{ height: Math.max(280, filtered.length * 54) }}>
            <Bar data={chartData} options={chartOptions} />
          </m.div>

          <div className="flex flex-wrap gap-5 mt-6">
            {Object.entries(PROV_COLORS).map(([prov, color]) => (
              <div key={prov} className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                <span style={{ fontSize: '0.72rem', color: C.inkMid }}>{prov}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABLA COMPLETA ──────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp} transition={dur(0.5)} className="mb-8">
          <SectionLabel>Datos completos · Tabla 6</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Presión tributaria municipal por municipio y etapa
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm">
            En porcentaje del precio final de venta. Informe CEFIP-UNLP, mayo 2025.
          </p>
        </m.div>

        <m.div {...fadeUp} transition={dur(0.5, 0.1)}
          className="overflow-x-auto rounded-xl"
          style={{ border: `1px solid ${C.rule}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: C.card, fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: C.ink }}>
                {['Municipio', 'Provincia', 'Base de cálculo', 'Droguerías', 'Farmacias', 'Acumulada*'].map((h, i) => (
                  <th key={h} style={{
                    padding: '13px 16px',
                    textAlign: i >= 3 ? 'right' : 'left',
                    fontWeight: 600, color: '#fff',
                    fontSize: '0.8rem', letterSpacing: '0.03em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MUNICIPIOS.map((row, i) => (
                <tr key={row.municipio}
                  style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc', borderBottom: `1px solid ${C.rule}`, transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#edf1f8'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f8f9fc'}>
                  <td style={{ padding: '11px 16px', fontWeight: 600, color: C.ink }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: PROV_COLORS[row.provincia], flexShrink: 0 }} />
                      {row.municipio}
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', color: C.inkMid }}>{row.provincia}</td>
                  <td style={{ padding: '11px 16px', color: C.inkMid, fontSize: '0.8rem' }}>{row.base}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right', fontFamily: 'monospace', color: C.ink }}>{fmt(row.drog)}%</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right', fontFamily: 'monospace', color: C.ink }}>{fmt(row.farm)}%</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                    <span style={{
                      fontWeight: 700, fontFamily: 'monospace',
                      color: row.total >= 3 ? D.red : row.total >= 2 ? D.blue : C.ink,
                      background: row.total >= 3 ? '#fef2f2' : row.total >= 2 ? '#eff6ff' : 'transparent',
                      padding: row.total >= 2 ? '2px 8px' : undefined,
                      borderRadius: row.total >= 2 ? 6 : undefined,
                    }}>
                      {fmt(row.total)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '10px 16px', fontSize: '0.73rem', color: C.inkLight, background: '#f8f9fc', borderTop: `1px solid ${C.rule}` }}>
            * Alícuota final acumulada asumiendo 1% para laboratorios. Fuente: CEFIP-UNLP en base a legislación vigente, mayo 2025.
          </div>
        </m.div>
      </div>

      {/* ── CASO PILAR ─────────────────────────────────────────── */}
      <div className="bg-pattern-dark" style={{ background: C.hero, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp} transition={dur(0.5)} className="mb-8">
            <SectionLabel dark>El caso paradigmático</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3 text-white">
              Pilar: tres tributos, una sola cadena de medicamentos
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm max-w-xl">
              El municipio aplica una estructura que combina TISH sobre facturación, montos fijos
              elevados y una tasa adicional (DIPE) calculada sobre tres variables simultáneas.
            </p>
          </m.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: '📊', title: 'TISH sobre facturación', desc: 'La tasa se aplica sobre cada transacción a lo largo de la cadena, acumulándose en laboratorio, droguería y farmacia. Genera el 1,44% en droguerías y el 1,24% en farmacias.' },
              { icon: '🔒', title: 'Monto fijo anual > $2,4 M', desc: 'Independientemente del nivel de ingresos, el municipio cobra un monto fijo anual superior a $2,4 millones bajo el concepto de TISH.' },
              { icon: '⚙️', title: 'DIPE — triple variable', desc: 'La "Tasa para el Desarrollo de la Infraestructura y Promoción del Empleo local" determina la carga combinando superficie del establecimiento, cantidad de empleados e ingresos brutos generados en el partido.' },
              { icon: '📈', title: 'Módulos fiscales y complejidad', desc: 'Cada variable se transforma en índices y categorías que determinan módulos fiscales a pagar. El diseño "agrega un alto grado de complejidad y puede resultar en cargas significativas para contribuyentes de gran escala".' },
            ].map((s, i) => (
              <m.div key={i} {...fadeUp} transition={dur(0.45, 0.1 * i + 0.15)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16 }}
                className="p-6">
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem', lineHeight: 1.65 }}>{s.desc}</p>
              </m.div>
            ))}
          </div>

          <m.div {...fadeUp} transition={dur(0.5, 0.5)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, marginTop: 24 }}
            className="p-5">
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <span style={{ color: D.red, fontWeight: 700 }}>Conclusión del informe: </span>
              La TISH y tributos complementarios como la DIPE operan muchas veces como verdaderos
              impuestos sobre la actividad económica y no como tasas asociadas estrictamente a
              servicios municipales. El diseño fragmentado genera distorsiones en decisiones de
              inversión, localización y comercialización.
            </p>
          </m.div>
        </div>
      </div>

      {/* ── PBA VS NACIÓN ──────────────────────────────────────── */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp} transition={dur(0.5)} className="mb-8">
            <SectionLabel>Contexto provincial y nacional</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              PBA: 4% de IIBB provincial + hasta 3,73% de TISH municipal
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
              La carga municipal se acumula sobre la presión provincial. En Pilar, ambas suman
              una carga subnacional estimada superior al 7% del precio final.
            </p>
          </m.div>

          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            {[
              { label: 'IIBB provincial (PBA)', value: '4,0%', sub: 'Sobre medicamentos — por debajo de Córdoba, Chubut y Río Negro', color: D.red },
              { label: 'TISH máxima (Pilar)',   value: '3,73%', sub: 'La más alta del país entre los municipios analizados en el informe', color: D.blue },
              { label: 'Carga combinada estimada', value: '~7,7%', sub: 'IIBB + TISH solo en Pilar — sin contar tributos nacionales', color: C.accent },
            ].map((s, i) => (
              <m.div key={i} {...fadeUp} transition={dur(0.45, 0.08 * i)}
                style={{ background: '#f8f9fc', border: `1px solid ${C.rule}`, borderLeft: `4px solid ${s.color}`, borderRadius: 12 }}
                className="p-5">
                <div className="font-display text-3xl font-bold mb-2" style={{ color: s.color }}>{s.value}</div>
                <p className="text-sm font-semibold mb-1" style={{ color: C.ink }}>{s.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: C.inkMid }}>{s.sub}</p>
              </m.div>
            ))}
          </div>

          <m.div {...fadeUp} transition={dur(0.5, 0.3)}
            style={{ background: '#edf1f8', border: `1px solid #d0daf0`, borderRadius: 12 }}
            className="p-5">
            <p className="text-sm leading-relaxed" style={{ color: C.inkMid }}>
              <span style={{ color: C.accent, fontWeight: 700 }}>Heterogeneidad extrema: </span>
              empresas con exactamente la misma estructura operativa pueden enfrentar cargas fiscales
              muy distintas según el municipio donde estén radicadas. Pilar (3,73%) casi triplica
              a Bahía Blanca (1,40%) y supera ampliamente a Córdoba Capital (2,52%), Río Cuarto (2,22%)
              y Santa Fe Capital (1,91%).
            </p>
          </m.div>
        </div>
      </div>

      {/* ── TARJETAS PARA REDES ────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp} transition={dur(0.5)} className="mb-10">
          <SectionLabel>Para compartir en Twitter / X</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Tarjetas para redes sociales
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm">
            Cuatro visualizaciones listas para publicar. Hacé clic en "Descargar" para guardar en PNG de alta resolución.
          </p>
        </m.div>

        <div className="grid sm:grid-cols-2 gap-8">

          {/* ── Card 1: El Pilar fiscal ─────────────────────────── */}
          <m.div {...fadeUp} transition={dur(0.45, 0.05)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: C.inkMid }}>El Pilar fiscal</span>
              <DlBtn onClick={() => downloadCard(card1Ref, 'datospba-pilar-fiscal.png', '#0c1a2e')} />
            </div>
            <div ref={card1Ref} style={{ ...darkCard, overflow: 'hidden', position: 'relative' }}>
              {/* barra superior */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${D.red}, #f87171)` }} />
              <div style={{ paddingTop: 8 }}>
                <p style={tag(D.red)}>Presión tributaria local · Medicamentos · Argentina 2025</p>
                <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>3,73%</div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.55, marginBottom: 22 }}>
                  La carga TISH más alta sobre medicamentos en Argentina.<br />
                  <strong style={{ color: '#fff' }}>Pilar, Provincia de Buenos Aires.</strong>
                </p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  {[
                    { label: 'Droguerías',    v: '1,44%' },
                    { label: 'Farmacias',     v: '1,24%' },
                    { label: 'Laboratorios*', v: '1,00%' },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ color: D.red, fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{s.v}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={darkFooter}>
                  <span>Fuente: CEFIP-UNLP / CILFA · Mayo 2025</span>
                  <span style={{ color: D.red, fontWeight: 700, fontSize: 12 }}>@datospba</span>
                </div>
              </div>
            </div>
          </m.div>

          {/* ── Card 2: Ranking ─────────────────────────────────── */}
          <m.div {...fadeUp} transition={dur(0.45, 0.1)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: C.inkMid }}>Ranking municipal</span>
              <DlBtn onClick={() => downloadCard(card2Ref, 'datospba-ranking-tish.png', '#ffffff')} />
            </div>
            <div ref={card2Ref} style={{ ...lightCard, paddingTop: 40, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${D.red}, ${D.blue})` }} />
              <p style={tag(C.accent)}>Ranking TISH · Medicamentos 2025</p>
              <p style={{ color: C.ink, fontSize: 17, fontWeight: 700, marginBottom: 22, lineHeight: 1.3 }}>
                Los 5 municipios con mayor presión<br />tributaria local sobre medicamentos
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {MUNICIPIOS.slice(0, 5).map((row, i) => (
                  <div key={row.municipio}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: PROV_COLORS[row.provincia], fontWeight: 800, fontSize: 15, width: 22, textAlign: 'right' }}>#{i + 1}</span>
                        <div>
                          <span style={{ color: C.ink, fontWeight: 600, fontSize: 13 }}>{row.municipio}</span>
                          <span style={{ color: C.inkLight, fontSize: 11, marginLeft: 6 }}>{row.provincia}</span>
                        </div>
                      </div>
                      <span style={{ color: PROV_COLORS[row.provincia], fontWeight: 700, fontSize: 14 }}>{fmt(row.total)}%</span>
                    </div>
                    <div style={{ height: i === 0 ? 10 : 7, borderRadius: 999, background: 'rgba(13,17,23,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(row.total / 3.728) * 100}%`, borderRadius: 999, background: PROV_COLORS[row.provincia] }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={footer(C.inkLight)}>
                <span>Fuente: CEFIP-UNLP / CILFA · Mayo 2025</span>
                <span style={{ color: C.accent, fontWeight: 700, fontSize: 12 }}>@datospba</span>
              </div>
            </div>
          </m.div>

          {/* ── Card 3: Presión total ────────────────────────────── */}
          <m.div {...fadeUp} transition={dur(0.45, 0.15)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: C.inkMid }}>Presión tributaria total</span>
              <DlBtn onClick={() => downloadCard(card3Ref, 'datospba-presion-total.png', '#0c1a2e')} />
            </div>
            <div ref={card3Ref} style={{ ...darkCard }}>
              <p style={tag(D.teal)}>Carga total sobre la cadena · Argentina 2025</p>
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 22, lineHeight: 1.3 }}>
                ¿Cuánto tributan los medicamentos<br />en Argentina?
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1 }}>34,8%</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.5 }}>del precio final<br />de venta</div>
              </div>
              <div style={{ height: 14, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', marginBottom: 10 }}>
                {[
                  { flex: 76.4, color: D.red },
                  { flex: 19.8, color: D.teal },
                  { flex: 3.7,  color: '#f59e0b' },
                ].map((s, i) => (
                  <div key={i} style={{ flex: s.flex, background: s.color }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
                {[
                  { pct: '26,6%', label: 'Nacionales',   color: D.red },
                  { pct: '6,9%',  label: 'Provinciales', color: D.teal },
                  { pct: '1,3%',  label: 'Municipales',  color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1 }}>
                    <div style={{ color: s.color, fontWeight: 700, fontSize: 17 }}>{s.pct}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                En PBA, la TISH de Pilar (3,73%) casi triplica la de Bahía Blanca (1,40%). Mismo producto, distinto municipio.
              </div>
              <div style={darkFooter}>
                <span>Fuente: CEFIP-UNLP / CILFA · Mayo 2025</span>
                <span style={{ color: D.teal, fontWeight: 700, fontSize: 12 }}>@datospba</span>
              </div>
            </div>
          </m.div>

          {/* ── Card 4: Heterogeneidad PBA ──────────────────────── */}
          <m.div {...fadeUp} transition={dur(0.45, 0.2)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: C.inkMid }}>Heterogeneidad en PBA</span>
              <DlBtn onClick={() => downloadCard(card4Ref, 'datospba-heterogeneidad-pba.png', '#ffffff')} />
            </div>
            <div ref={card4Ref} style={{ ...lightCard, paddingTop: 40, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${D.red}, ${D.amber})` }} />
              <p style={tag(C.accent)}>Heterogeneidad fiscal · Buenos Aires</p>
              <p style={{ color: C.ink, fontSize: 17, fontWeight: 700, marginBottom: 18, lineHeight: 1.3 }}>
                Mismo producto, cargas muy distintas<br />según el municipio bonaerense
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                {[
                  { mun: 'Pilar',            pct: '3,73%', alpha: 'ff', note: 'Más caro' },
                  { mun: 'La Plata',         pct: '3,03%', alpha: 'bb', note: '' },
                  { mun: 'Florencio Varela', pct: '2,69%', alpha: '77', note: '' },
                  { mun: 'Bahía Blanca',     pct: '1,40%', alpha: '44', note: 'Más barato PBA' },
                ].map(s => (
                  <div key={s.mun} style={{ background: '#f7f6f2', borderRadius: 12, padding: '13px 15px', borderLeft: `4px solid ${D.red}${s.alpha}` }}>
                    <div style={{ color: `${D.red}${s.alpha}`, fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>{s.pct}</div>
                    <div style={{ color: C.ink, fontWeight: 600, fontSize: 12, marginTop: 3 }}>{s.mun}</div>
                    {s.note && <div style={{ color: C.inkLight, fontSize: 10, marginTop: 2 }}>{s.note}</div>}
                  </div>
                ))}
              </div>
              <div style={{ background: '#fef3c7', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                La TISH de Pilar multiplica ×2,7 la de Bahía Blanca. Misma empresa, mismo medicamento, municipio diferente.
              </div>
              <div style={footer(C.inkLight)}>
                <span>Fuente: CEFIP-UNLP / CILFA · Mayo 2025</span>
                <span style={{ color: C.accent, fontWeight: 700, fontSize: 12 }}>@datospba</span>
              </div>
            </div>
          </m.div>

        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold" style={{ color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Fuente</p>
            <p className="text-sm mt-1" style={{ color: C.inkMid }}>
              CEFIP-UNLP (Garriga, Puig, Rosales) — Análisis de la presión tributaria sobre medicamentos en Argentina · CILFA · Mayo 2025
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
