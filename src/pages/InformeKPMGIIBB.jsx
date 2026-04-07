import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
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

ChartJS.register(ArcElement, DoughnutController, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// ─── palette ────────────────────────────────────────────────
const C = {
  magenta:   '#e91e8c',
  blue:      '#1565C0',
  cyan:      '#00BCD4',
  purple:    '#7B1FA2',
  lightblue: '#29B6F6',
  dark:      '#080b14',
  card:      '#0f1524',
  border:    'rgba(255,255,255,0.08)',
}

// ─── data ───────────────────────────────────────────────────
const PROVINCIAS = [
  { rank: 1, name: 'Prov. de Buenos Aires', color: C.magenta,   pct: 100 },
  { rank: 2, name: 'Misiones',              color: C.blue,      pct: 82  },
  { rank: 3, name: 'CABA',                  color: C.cyan,      pct: 68  },
  { rank: 4, name: 'Córdoba',               color: C.purple,    pct: 56  },
  { rank: 5, name: 'Tucumán',               color: C.lightblue, pct: 44  },
]

const IMPUESTOS = [
  { label: 'Ingresos Brutos',       pct: 61, color: C.magenta   },
  { label: 'Otros',                 pct: 14, color: C.cyan      },
  { label: 'IVA',                   pct: 12, color: C.blue      },
  { label: 'Ganancias',             pct:  8, color: C.purple    },
  { label: 'Déb. y Créd.',          pct:  5, color: C.lightblue },
]

const SALDOS = [
  { label: 'Sin saldo a favor', pct: 16, color: 'rgba(255,255,255,0.18)' },
  { label: '< $100 M',          pct: 30, color: C.lightblue              },
  { label: '$100 – $250 M',     pct: 15, color: C.cyan                   },
  { label: '$250 – $500 M',     pct: 16, color: C.blue                   },
  { label: '> $500 M',          pct: 23, color: C.magenta                },
]

const doughnutData = {
  labels: IMPUESTOS.map(i => i.label),
  datasets: [{
    data: IMPUESTOS.map(i => i.pct),
    backgroundColor: IMPUESTOS.map(i => i.color),
    borderColor: C.card,
    borderWidth: 3,
    hoverBorderWidth: 0,
  }],
}

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` },
      backgroundColor: '#1a2035',
      titleColor: '#fff',
      bodyColor: '#cbd5e1',
      padding: 10,
      cornerRadius: 8,
    },
  },
}

// ─── helpers ────────────────────────────────────────────────
const fadeUp = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
const dur = (d = 0.5, delay = 0) => ({ duration: d, delay })

// ─── sub-components ─────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p style={{ color: C.magenta }} className="text-xs font-semibold tracking-[0.18em] uppercase mb-3">
      {children}
    </p>
  )
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: '0 0 64px' }} />
}

// ─── main page ──────────────────────────────────────────────
export default function InformeKPMGIIBB() {
  return (
    <div style={{ background: C.dark, minHeight: '100vh', color: '#fff' }}>

      {/* ── back nav ── */}
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link
          to="/informes"
          className="inline-flex items-center gap-1.5 text-sm no-underline"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>
      </div>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-16">
        <m.div {...fadeUp} transition={dur(0.6)}>
          <SectionLabel>Encuesta KPMG · Empresas medianas y grandes · 2025</SectionLabel>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
            El peso fiscal que<br />
            <span style={{ color: C.magenta }}>encarece cada precio</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 620 }} className="text-base sm:text-lg leading-relaxed">
            El Impuesto sobre los Ingresos Brutos lidera por lejos los gravámenes
            que encarecen los precios en la Argentina. La encuesta de KPMG a empresas
            medianas y grandes confirma una arquitectura fiscal que castiga la producción
            y se traslada, en cascada, al consumidor final.
          </p>
        </m.div>

        {/* ── headline stats ── */}
        <m.div
          {...fadeUp} transition={dur(0.5, 0.2)}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
        >
          {[
            { n: '61%',  label: 'de las menciones al impuesto que más encarece precios', color: C.magenta },
            { n: '84%',  label: 'de las empresas tiene saldos a favor de IIBB provincial', color: C.cyan },
            { n: '91%',  label: 'de la opinión pública confirma que IIBB lo paga el consumidor', color: C.blue },
            { n: '#1',   label: 'Provincia de Buenos Aires - la jurisdicción más gravosa', color: C.purple },
          ].map((s, i) => (
            <m.div
              key={i}
              {...fadeUp} transition={dur(0.45, 0.1 * i + 0.3)}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}
              className="p-5"
            >
              <div className="font-display text-4xl font-bold mb-1" style={{ color: s.color }}>{s.n}</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.45 }}>{s.label}</p>
            </m.div>
          ))}
        </m.div>
      </div>

      {/* ══════════════ IMPUESTO QUE MÁS ENCARECE ══════════════ */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp} transition={dur(0.5)} className="mb-2">
            <SectionLabel>Pregunta #1 de la encuesta</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              ¿Qué impuesto encarece más los precios?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-sm mb-10 max-w-xl">
              El IIBB lidera con una brecha elocuente respecto a todos los demás gravámenes -
              este año superando el 60%, contra el 54% del año anterior.
            </p>
          </m.div>

          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* donut */}
            <m.div {...fadeUp} transition={dur(0.6, 0.15)} className="relative shrink-0" style={{ width: 260, height: 260 }}>
              <Doughnut data={doughnutData} options={doughnutOpts} />
              {/* center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display text-5xl font-bold" style={{ color: C.magenta }}>61%</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: 2 }}>Ing. Brutos</span>
              </div>
            </m.div>

            {/* legend bars */}
            <div className="flex-1 space-y-4 w-full">
              {IMPUESTOS.map((imp, i) => (
                <m.div key={imp.label} {...fadeUp} transition={dur(0.4, 0.1 * i + 0.2)}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {imp.label}
                    </span>
                    <span className="font-bold text-sm" style={{ color: imp.color }}>{imp.pct}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                    <m.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${imp.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 * i + 0.3, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 999, background: imp.color }}
                    />
                  </div>
                </m.div>
              ))}
            </div>
          </div>

          {/* insight */}
          <m.div
            {...fadeUp} transition={dur(0.5, 0.4)}
            style={{ background: `${C.magenta}18`, border: `1px solid ${C.magenta}44`, borderRadius: 12, marginTop: 40 }}
            className="p-5"
          >
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <span style={{ color: C.magenta, fontWeight: 700 }}>Conclusión de KPMG: </span>
              Es bastante improbable el éxito de una reforma fiscal pro empleo y producción sin una
              readecuación del IIBB y sin moderar la superposición de regímenes de recaudación provinciales.
            </p>
          </m.div>
        </div>
      </div>

      {/* ══════════════════ RANKING PROVINCIAS ══════════════════ */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp} transition={dur(0.5)} className="mb-10">
          <SectionLabel>Pregunta #4 de la encuesta</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            ¿Dónde debería vender más caro?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-sm max-w-xl">
            Si una empresa pudiera fijar precios por provincia según la carga fiscal,
            estas cinco jurisdicciones encabezarían el ranking de las más gravosas.
          </p>
        </m.div>

        <div className="space-y-5">
          {PROVINCIAS.map((p, i) => (
            <m.div
              key={p.rank}
              {...fadeUp} transition={dur(0.45, i * 0.08 + 0.1)}
              className="flex items-center gap-5"
            >
              {/* rank badge */}
              <div
                className="font-display font-bold text-2xl shrink-0"
                style={{ color: p.color, width: 36, textAlign: 'right' }}
              >
                #{p.rank}
              </div>

              {/* bar + name */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm" style={{ color: p.rank === 1 ? p.color : 'rgba(255,255,255,0.85)' }}>
                    {p.name}
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: p.rank === 1 ? 14 : 10, overflow: 'hidden' }}>
                  <m.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      background: p.rank === 1
                        ? `linear-gradient(90deg, ${C.magenta}, #ff6abf)`
                        : p.color,
                      boxShadow: p.rank === 1 ? `0 0 20px ${C.magenta}88` : 'none',
                    }}
                  />
                </div>
              </div>
            </m.div>
          ))}
        </div>

        <m.div
          {...fadeUp} transition={dur(0.5, 0.6)}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginTop: 40 }}
          className="p-5"
        >
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            La Provincia de Buenos Aires lidera en todas las ediciones de la encuesta. Misiones,
            Córdoba, Tucumán y la Ciudad de Buenos Aires conforman el grupo habitual de jurisdicciones
            percibidas como más gravosas, con alternancia frecuente de Santa Fe.
          </p>
        </m.div>
      </div>

      <Divider />

      {/* ══════════════════ SALDOS A FAVOR ══════════════════ */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp} transition={dur(0.5)} className="mb-10">
            <SectionLabel>Pregunta #6 de la encuesta</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              El dinero inmovilizado: saldos a favor de IIBB
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-sm max-w-xl">
              Solo el 16% de los consultados no posee saldos a favor del gravamen. El 84% restante
              acumula créditos inmovilizados de magnitudes diversas - un 2% más que el año pasado.
            </p>
          </m.div>

          {/* giant 84% */}
          <m.div {...fadeUp} transition={dur(0.6, 0.1)} className="flex flex-col sm:flex-row items-center gap-10 mb-12">
            <div className="text-center shrink-0">
              <div className="font-display font-bold" style={{ fontSize: 'clamp(5rem, 15vw, 9rem)', color: C.cyan, lineHeight: 1 }}>
                84%
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginTop: 8 }}>
                de las empresas tiene<br />saldos a favor de IIBB
              </p>
            </div>

            {/* breakdown donut-style: stacked progress */}
            <div className="flex-1 w-full space-y-4">
              {SALDOS.map((s, i) => (
                <m.div key={s.label} {...fadeUp} transition={dur(0.4, 0.08 * i + 0.25)}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.label}</span>
                    <span className="font-bold text-sm" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                    <m.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.pct * 2.5}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.08 * i + 0.3, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 999, background: s.color }}
                    />
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>

          {/* single-row visual stacked bar */}
          <m.div {...fadeUp} transition={dur(0.6, 0.3)}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Distribución total
            </p>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 28 }}>
              {SALDOS.map((s, i) => (
                <m.div
                  key={i}
                  initial={{ flex: 0 }}
                  whileInView={{ flex: s.pct }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: s.color, minWidth: 0 }}
                  title={`${s.label}: ${s.pct}%`}
                />
              ))}
            </div>
            <div style={{ display: 'flex', marginTop: 8, gap: 16, flexWrap: 'wrap' }}>
              {SALDOS.map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </m.div>

          <m.div
            {...fadeUp} transition={dur(0.5, 0.5)}
            style={{ background: `${C.cyan}12`, border: `1px solid ${C.cyan}33`, borderRadius: 12, marginTop: 32 }}
            className="p-5"
          >
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <span style={{ color: C.cyan, fontWeight: 700 }}>Inmovilización financiera. </span>
              La multiplicidad de regímenes de recaudación provinciales -muchos duplicados entre
              transacciones y acreditaciones bancarias- ha generalizado una situación que para muchas
              empresas constituye una de las principales problemáticas del régimen tributario argentino.
              Esta inmovilización es altamente perjudicial y hasta confiscatoria.
            </p>
          </m.div>
        </div>
      </div>

      {/* ════════════════════ 9% vs 91% ════════════════════ */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <m.div {...fadeUp} transition={dur(0.5)} className="mb-10">
          <SectionLabel>Pregunta #16 de la encuesta · Consulta abierta en LinkedIn</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            ¿Quién paga realmente el Ingresos Brutos?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-sm max-w-xl">
            KPMG consultó a la opinión pública abierta en redes sociales.
            La respuesta fue contundente.
          </p>
        </m.div>

        {/* dramatic 9/91 split */}
        <m.div {...fadeUp} transition={dur(0.6, 0.15)} className="relative overflow-hidden" style={{ borderRadius: 20, minHeight: 280 }}>
          <div style={{ display: 'flex', height: '100%', minHeight: 280 }}>
            {/* 9% */}
            <m.div
              initial={{ flex: 0 }}
              whileInView={{ flex: 9 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: `linear-gradient(135deg, #1a1f35, #0d1020)`,
                border: `1px solid ${C.border}`,
                borderRight: 'none',
                borderRadius: '20px 0 0 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '32px 16px',
                minWidth: 0,
              }}
            >
              <div className="font-display font-bold text-center" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>9%</div>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', textAlign: 'center', marginTop: 10, lineHeight: 1.4 }}>
                Solo afecta<br />a las empresas
              </p>
            </m.div>

            {/* 91% */}
            <m.div
              initial={{ flex: 0 }}
              whileInView={{ flex: 91 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: `linear-gradient(135deg, ${C.magenta}cc, #a0006a)`,
                borderRadius: '0 20px 20px 0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '32px 24px',
                minWidth: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* grid texture */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }} />
              <div className="relative z-10 text-center">
                <div className="font-display font-bold" style={{ fontSize: 'clamp(4rem, 14vw, 8rem)', color: '#fff', lineHeight: 1 }}>91%</div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', marginTop: 10, fontWeight: 600 }}>
                  Se traslada al consumidor
                </p>
              </div>
            </m.div>
          </div>
        </m.div>

        <m.div
          {...fadeUp} transition={dur(0.5, 0.4)}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginTop: 32 }}
          className="p-5"
        >
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            El Ingresos Brutos es un{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>impuesto en cascada</span>:
            se aplica en cada etapa de la cadena productiva, se acumula y se traslada íntegramente al
            precio final. No lo paga "la empresa" - lo pagás vos en cada consumo.
            Encarece todo, castiga el trabajo y complica la producción.
          </p>
        </m.div>
      </div>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <div style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Fuente
            </p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Encuesta KPMG sobre impuestos en empresas medianas y grandes · Argentina 2025
            </p>
          </div>
          <Link
            to="/informes"
            className="text-sm no-underline font-medium"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            ← Ver todos los informes
          </Link>
        </div>
      </div>

    </div>
  )
}
