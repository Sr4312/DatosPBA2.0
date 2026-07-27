import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement,
  Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA, colorEscalaValoracion } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// ── Colores de layout ────────────────────────────────────────────
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

// ── Paleta de datos ──────────────────────────────────────────────

/* Colores categóricos por provincia: paleta DATA del sistema
   (Buenos Aires = serie principal DATA[1]). */
const PROV_COLORS = {
  'Buenos Aires': DATA[1],
  'Córdoba':      DATA[2],
  'Santa Fe':     DATA[3],
  'Mendoza':      DATA[4],
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

/* Escala de valoración por nivel para la carga acumulada:
   presión tributaria es 'menor-es-mejor' → t = 1 en el municipio de menor carga. */
const TOTAL_MIN = Math.min(...MUNICIPIOS.map(m => m.total))
const TOTAL_MAX = Math.max(...MUNICIPIOS.map(m => m.total))
const escalaTotal = total => (TOTAL_MAX - total) / (TOTAL_MAX - TOTAL_MIN)

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. Todas son niveles sin variación,
   con el contexto en `periodo`. */
const HERO_STATS = [
  { label: 'Presión tributaria total',            valor: '34,8%', periodo: 'sobre la cadena de medicamentos en Argentina' },
  { label: 'Carga TISH en Pilar',                 valor: '3,73%', periodo: 'la más alta entre todos los municipios analizados' },
  { label: 'Diferencia entre Pilar y B. Blanca',  valor: '×2,7',  periodo: 'mismo producto, distinta carga' },
  { label: 'IIBB provincial sobre medicamentos',  valor: '6,9 pp', periodo: 'en la Prov. de Buenos Aires' },
]

// ── Helpers ──────────────────────────────────────────────────────
const fmt = n => n.toFixed(2).replace('.', ',')


function SectionLabel({ children, dark = false }) {
  return (
    <p style={{ color: dark ? 'rgba(255,255,255,0.5)' : C.accent }}
      className={dark ? 'text-xs font-semibold tracking-[0.18em] uppercase mb-3' : 'text-sm font-semibold mb-3'}>
      {children}
    </p>
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


export default function InformeMedicamentosTISH() {
  const [activeProvince, setActiveProvince] = useState(null)

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
        labels: { font: { family: 'Archivo', size: 11 }, color: C.inkMid, boxWidth: 12, padding: 16 },
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
        footerColor: DATA[1],
        footerFont: { weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        stacked: true,
        max: 4.3,
        ticks: { callback: v => `${v}%`, font: { family: 'Archivo', size: 11 }, color: C.inkMid },
        grid: { color: 'rgba(13,17,23,0.06)' },
      },
      y: {
        stacked: true,
        ticks: { font: { family: 'Archivo', size: 11 }, color: C.inkMid },
        grid: { display: false },
      },
    },
  }

  const PROVINCES = ['Todas', 'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza']

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.ink }}>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <div style={{ background: C.hero }}>
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
          <Link to="/informes"
            className="inline-flex items-center gap-1.5 text-sm no-underline mb-10"
            style={{ color: 'rgba(255,255,255,0.62)' }}>
            <ArrowLeft className="w-4 h-4" /> Volver a informes
          </Link>

          <div>
            <SectionLabel dark>CEFIP-UNLP · CILFA · Mayo 2025</SectionLabel>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-white">
              El precio de vivir<br />
              <span>en el municipio equivocado</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 620 }}
              className="text-base sm:text-lg leading-relaxed">
              La Tasa de Inspección, Seguridad e Higiene grava los medicamentos de manera radicalmente
              distinta según el municipio. Pilar lidera con una presión del 3,73% sobre el precio
              final - casi el triple que Bahía Blanca. Mismo producto, reglas muy distintas.
            </p>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
            {HERO_STATS.map((s, i) => (
              <div key={i}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2 }}
                className="p-5">
                <Cifra dark size="xl" label={s.label} valor={s.valor} variacion={s.variacion} polaridad={s.polaridad} periodo={s.periodo} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESIS ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <div style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '1.25rem' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 2.6vw, 1.75rem)', fontWeight: 700, color: C.ink, lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: '0.75rem', maxWidth: 800 }}>
            La TISH opera como un impuesto encubierto sobre los medicamentos
          </h2>
          <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
            La TISH y tributos complementarios como la DIPE operan muchas veces como verdaderos
            impuestos sobre la actividad económica y no como tasas asociadas estrictamente a
            servicios municipales. El diseño fragmentado genera distorsiones en decisiones de
            inversión, localización y comercialización.
          </p>
        </div>
      </div>

      {/* ── GRÁFICO INTERACTIVO ───────────────────────────────── */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-6">
            <SectionLabel>Comparación interactiva</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Presión TISH acumulada por etapa de la cadena
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
              Alícuota sobre facturación como % del precio final de venta. Asume 1% para laboratorios.
              Filtrá por provincia para comparar entre jurisdicciones.
            </p>
          </div>

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
                    borderRadius: 2, padding: '5px 16px',
                    fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {p}
                </button>
              )
            })}
          </div>

          <div
            style={{ height: Math.max(280, filtered.length * 54) }}
            role="img"
            aria-label="Gráfico de barras apiladas: la presión TISH acumulada sobre medicamentos va del 3,73% del precio final en Pilar a 1,11% en Luján de Cuyo; Pilar casi triplica a Bahía Blanca (1,40%) y supera a Córdoba Capital (2,52%)">
            <Bar data={chartData} options={chartOptions} />
          </div>

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
        <div className="mb-8">
          <SectionLabel>Datos completos · Tabla 6</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            Presión tributaria municipal por municipio y etapa
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm">
            En porcentaje del precio final de venta. Informe CEFIP-UNLP, mayo 2025.
          </p>
        </div>

        <div
          className="overflow-x-auto rounded-xl"
          style={{ border: `1px solid ${C.rule}` }}>
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
                    {/* Rampa por nivel: valoración continua (menor carga = mejor), nunca color a mano */}
                    <span style={{
                      fontWeight: 700, fontFamily: 'monospace',
                      color: colorEscalaValoracion(escalaTotal(row.total)),
                      background: row.total >= 2
                        ? colorEscalaValoracion(escalaTotal(row.total)).replace('rgb(', 'rgba(').replace(')', ',0.08)')
                        : 'transparent',
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
        </div>
      </div>

      {/* ── CASO PILAR ─────────────────────────────────────────── */}
      <div style={{ background: C.hero, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-8">
            <SectionLabel dark>El caso paradigmático</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3 text-white">
              Pilar: tres tributos, una sola cadena de medicamentos
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm max-w-xl">
              El municipio aplica una estructura que combina TISH sobre facturación, montos fijos
              elevados y una tasa adicional (DIPE) calculada sobre tres variables simultáneas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { title: 'TISH sobre facturación', desc: 'La tasa se aplica sobre cada transacción a lo largo de la cadena, acumulándose en laboratorio, droguería y farmacia. Genera el 1,44% en droguerías y el 1,24% en farmacias.' },
              { title: 'Monto fijo anual > $2,4 M', desc: 'Independientemente del nivel de ingresos, el municipio cobra un monto fijo anual superior a $2,4 millones bajo el concepto de TISH.' },
              { title: 'DIPE - triple variable', desc: 'La "Tasa para el Desarrollo de la Infraestructura y Promoción del Empleo local" determina la carga combinando superficie del establecimiento, cantidad de empleados e ingresos brutos generados en el partido.' },
              { title: 'Módulos fiscales y complejidad', desc: 'Cada variable se transforma en índices y categorías que determinan módulos fiscales a pagar. El diseño "agrega un alto grado de complejidad y puede resultar en cargas significativas para contribuyentes de gran escala".' },
            ].map((s, i) => (
              <div key={i}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2 }}
                className="p-6">
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── PBA VS NACIÓN ──────────────────────────────────────── */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-8">
            <SectionLabel>Contexto provincial y nacional</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              PBA: 4% de IIBB provincial + hasta 3,73% de TISH municipal
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
              La carga municipal se acumula sobre la presión provincial. En Pilar, ambas suman
              una carga subnacional estimada superior al 7% del precio final.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            {[
              { label: 'IIBB provincial (PBA)',    valor: '4,0%',  periodo: 'Sobre medicamentos - por debajo de Córdoba, Chubut y Río Negro' },
              { label: 'TISH máxima (Pilar)',      valor: '3,73%', periodo: 'La más alta del país entre los municipios analizados en el informe' },
              { label: 'Carga combinada estimada', valor: '~7,7%', periodo: 'IIBB + TISH solo en Pilar - sin contar tributos nacionales' },
            ].map((s, i) => (
              <div key={i}>
                <CifraCard label={s.label} valor={s.valor} periodo={s.periodo} />
              </div>
            ))}
          </div>

          <div
            style={{ background: '#edf1f8', border: `1px solid #d0daf0`, borderRadius: 2 }}
            className="p-5">
            <p className="text-sm leading-relaxed" style={{ color: C.inkMid }}>
              <span style={{ color: C.ink, fontWeight: 700 }}>Heterogeneidad extrema: </span>
              empresas con exactamente la misma estructura operativa pueden enfrentar cargas fiscales
              muy distintas según el municipio donde estén radicadas. Pilar (3,73%) casi triplica
              a Bahía Blanca (1,40%) y supera ampliamente a Córdoba Capital (2,52%), Río Cuarto (2,22%)
              y Santa Fe Capital (1,91%).
            </p>
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: C.ink }}>Fuente</p>
            <p className="text-sm mt-1" style={{ color: C.inkMid }}>
              CEFIP-UNLP (Garriga, Puig, Rosales) - Análisis de la presión tributaria sobre medicamentos en Argentina · CILFA · Mayo 2025
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
