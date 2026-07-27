import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  Chart as ChartJS,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA, VALORACION_HEX, colorEscalaValoracion } from '@/lib/variacion'

ChartJS.register(ArcElement, DoughnutController, Tooltip, Legend)

// acentos decorativos (titular, gradientes) — las series de dato usan DATA de @/lib/variacion
const D = {
  magenta:   '#e91e8c',
  blue:      '#1565C0',
  cyan:      '#00BCD4',
  purple:    '#7B1FA2',
  lightblue: '#29B6F6',
}

// chrome/layout colors
const C = {
  bg:       'var(--c-bg)',
  ink:      'var(--c-ink)',
  inkMid:   'var(--c-ink-mid)',
  inkLight: 'var(--c-ink-light)',
  hero:     '#0F172A',
  accent:   '#3d65b2',
  rule:     'var(--c-rule)',
  card:     'var(--c-surface)',
}

/* Ranking de jurisdicciones: PBA es la serie principal (DATA[1]);
   el resto son términos de comparación y comparten DATA[2]. */
const PROVINCIAS = [
  { rank: 1, name: 'Prov. de Buenos Aires', color: DATA[1], pct: 100 },
  { rank: 2, name: 'Misiones',              color: DATA[2], pct: 82  },
  { rank: 3, name: 'CABA',                  color: DATA[2], pct: 68  },
  { rank: 4, name: 'Córdoba',               color: DATA[2], pct: 56  },
  { rank: 5, name: 'Tucumán',               color: DATA[2], pct: 44  },
]

/* Categorías de la encuesta: IIBB es la serie principal (DATA[1]); los demás
   impuestos nombrados siguen la paleta DATA y el bucket residual "Otros"
   usa el gris neutral del sistema. */
const IMPUESTOS = [
  { label: 'Ingresos Brutos',  pct: 61, color: DATA[1] },
  { label: 'Otros',            pct: 14, color: VALORACION_HEX.neutral.base },
  { label: 'IVA',              pct: 12, color: DATA[2] },
  { label: 'Ganancias',        pct:  8, color: DATA[3] },
  { label: 'Déb. y Créd.',     pct:  5, color: DATA[4] },
]

/* Rampa por nivel de valoración: los saldos a favor inmovilizados son
   'menor-es-mejor', así que t = 1 (mejor) es "sin saldo" y t = 0 (peor)
   el tramo de mayor inmovilización. */
const SALDOS = [
  { label: 'Sin saldo a favor', pct: 16, color: colorEscalaValoracion(1)    },
  { label: '< $100 M',          pct: 30, color: colorEscalaValoracion(0.75) },
  { label: '$100 - $250 M',     pct: 15, color: colorEscalaValoracion(0.5)  },
  { label: '$250 - $500 M',     pct: 16, color: colorEscalaValoracion(0.25) },
  { label: '> $500 M',          pct: 23, color: colorEscalaValoracion(0)    },
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. */
const HERO_STATS = [
  { label: 'Menciones a IIBB como el impuesto que más encarece precios', valor: '61%', variacion: '+7 pp', polaridad: 'menor-es-mejor', periodo: 'vs. 54% en 2024' },
  { label: 'Empresas con saldos a favor de IIBB provincial', valor: '84%', variacion: '+2 pp', polaridad: 'menor-es-mejor', periodo: 'vs. 2024' },
  { label: 'Opinión pública: IIBB lo paga el consumidor', valor: '91%', periodo: 'consulta abierta en LinkedIn' },
  { label: 'La jurisdicción más gravosa', valor: '#1', periodo: 'Provincia de Buenos Aires' },
]

const doughnutData = {
  labels: IMPUESTOS.map(i => i.label),
  datasets: [{
    data: IMPUESTOS.map(i => i.pct),
    backgroundColor: IMPUESTOS.map(i => i.color),
    borderColor: '#ffffff',
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
      backgroundColor: '#0F172A',
      titleColor: '#fff',
      bodyColor: '#cbd5e1',
      padding: 10,
      cornerRadius: 8,
    },
  },
}


function SectionLabel({ children, dark = false }) {
  return (
    <p
      style={{ color: dark ? 'rgba(255,255,255,0.5)' : C.accent }}
      className={dark ? 'text-xs font-semibold tracking-[0.18em] uppercase mb-3' : 'text-sm font-semibold mb-3'}
    >
      {children}
    </p>
  )
}

export default function InformeKPMGIIBB() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.ink }}>

      {/* HERO OSCURO */}
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
            <SectionLabel dark>Encuesta KPMG · Empresas medianas y grandes · 2025</SectionLabel>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-white">
              El peso fiscal que<br />
              <span>encarece cada precio</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 620 }} className="text-base sm:text-lg leading-relaxed">
              El Impuesto sobre los Ingresos Brutos lidera por lejos los gravámenes
              que encarecen los precios en la Argentina. La encuesta de KPMG a empresas
              medianas y grandes confirma una arquitectura fiscal que castiga la producción
              y se traslada, en cascada, al consumidor final.
            </p>
          </div>

          {/* headline stats */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
          >
            {HERO_STATS.map((s, i) => (
              <div
                key={i}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2 }}
                className="p-5"
              >
                <Cifra dark size="xl" label={s.label} valor={s.valor} variacion={s.variacion} polaridad={s.polaridad} periodo={s.periodo} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IMPUESTO QUE MÁS ENCARECE */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-2">
            <SectionLabel>Pregunta #1 de la encuesta</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              ¿Qué impuesto encarece más los precios?
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm mb-10 max-w-xl">
              El IIBB lidera con una brecha elocuente respecto a todos los demás gravámenes -
              este año superando el 60%, contra el 54% del año anterior.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* donut */}
            <div className="relative shrink-0" style={{ width: 260, height: 260 }}>
              <Doughnut data={doughnutData} options={doughnutOpts} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display text-5xl font-bold" style={{ color: DATA[1] }}>61%</span>
                <span style={{ color: C.inkLight, fontSize: '0.72rem', marginTop: 2 }}>Ing. Brutos</span>
              </div>
            </div>

            {/* legend bars */}
            <div className="flex-1 space-y-4 w-full">
              {IMPUESTOS.map((imp, i) => (
                <div key={imp.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium" style={{ color: C.ink }}>{imp.label}</span>
                    <span className="font-bold text-sm" style={{ color: imp.color }}>{imp.pct}%</span>
                  </div>
                  <div style={{ background: 'rgba(13,17,23,0.08)', borderRadius: 2, height: 8, overflow: 'hidden' }}>
                    <div
                      style={{ width: `${imp.pct}%`, height: '100%', borderRadius: 2, background: imp.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{ background: '#edf1f8', border: `1px solid #d0daf0`, borderRadius: 2, marginTop: 40 }}
            className="p-5"
          >
            <p className="text-sm leading-relaxed" style={{ color: C.inkMid }}>
              <span style={{ color: C.ink, fontWeight: 700 }}>Conclusión de KPMG: </span>
              Es bastante improbable el éxito de una reforma fiscal pro empleo y producción sin una
              readecuación del IIBB y sin moderar la superposición de regímenes de recaudación provinciales.
            </p>
          </div>
        </div>
      </div>

      {/* RANKING PROVINCIAS */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <SectionLabel>Pregunta #4 de la encuesta</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            ¿Dónde debería vender más caro?
          </h2>
          <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
            Si una empresa pudiera fijar precios por provincia según la carga fiscal,
            estas cinco jurisdicciones encabezarían el ranking de las más gravosas.
          </p>
        </div>

        <div className="space-y-5">
          {PROVINCIAS.map((p, i) => (
            <div
              key={p.rank}
              className="flex items-center gap-5"
            >
              <div
                className="font-display font-bold text-2xl shrink-0"
                style={{ color: p.color, width: 36, textAlign: 'right' }}
              >
                #{p.rank}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm" style={{ color: p.rank === 1 ? p.color : C.ink }}>
                    {p.name}
                  </span>
                </div>
                <div style={{ background: 'rgba(13,17,23,0.07)', borderRadius: 2, height: p.rank === 1 ? 14 : 10, overflow: 'hidden' }}>
                  <div
                    style={{ width: `${p.pct}%`,
                      height: '100%',
                      borderRadius: 2,
                      background: p.rank === 1
                        ? D.magenta
                        : p.color,
                      
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{ background: C.card, border: `1px solid ${C.rule}`, borderRadius: 2, marginTop: 40 }}
          className="p-5"
        >
          <p className="text-sm leading-relaxed" style={{ color: C.inkMid }}>
            La Provincia de Buenos Aires lidera en todas las ediciones de la encuesta. Misiones,
            Córdoba, Tucumán y la Ciudad de Buenos Aires conforman el grupo habitual de jurisdicciones
            percibidas como más gravosas, con alternancia frecuente de Santa Fe.
          </p>
        </div>
      </div>

      {/* SALDOS A FAVOR - sección oscura */}
      <div style={{ background: C.hero, borderTop: `1px solid rgba(255,255,255,0.06)`, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10">
            <SectionLabel dark>Pregunta #6 de la encuesta</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-white">
              El dinero inmovilizado: saldos a favor de IIBB
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.62)' }} className="text-sm max-w-xl">
              Solo el 16% de los consultados no posee saldos a favor del gravamen. El 84% restante
              acumula créditos inmovilizados de magnitudes diversas - un 2% más que el año pasado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-10 mb-12">
            <div className="text-center shrink-0">
              <div className="font-display font-bold" style={{ fontSize: 'clamp(5rem, 15vw, 9rem)', color: '#fff', lineHeight: 1 }}>
                84%
              </div>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.8rem', marginTop: 8 }}>
                de las empresas tiene<br />saldos a favor de IIBB
              </p>
            </div>

            <div className="flex-1 w-full space-y-4">
              {SALDOS.map((s, i) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.label}</span>
                    <span className="font-bold text-sm" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 2, height: 8, overflow: 'hidden' }}>
                    <div
                      style={{ width: `${s.pct * 2.5}%`, height: '100%', borderRadius: 2, background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Distribución total
            </p>
            <div style={{ display: 'flex', borderRadius: 2, overflow: 'hidden', height: 28 }}>
              {SALDOS.map((s, i) => (
                <div
                  key={i}
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
          </div>

          <div
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 2, marginTop: 32 }}
            className="p-5"
          >
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <span style={{ fontWeight: 700 }}>Inmovilización financiera. </span>
              La multiplicidad de regímenes de recaudación provinciales -muchos duplicados entre
              transacciones y acreditaciones bancarias- ha generalizado una situación que para muchas
              empresas constituye una de las principales problemáticas del régimen tributario argentino.
              Esta inmovilización es altamente perjudicial y hasta confiscatoria.
            </p>
          </div>
        </div>
      </div>

      {/* 9% vs 91% */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10">
            <SectionLabel>Pregunta #16 de la encuesta · Consulta abierta en LinkedIn</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              ¿Quién paga realmente el Ingresos Brutos?
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-xl">
              KPMG consultó a la opinión pública abierta en redes sociales.
              La respuesta fue contundente.
            </p>
          </div>

          <div className="relative overflow-hidden" style={{ borderRadius: 2, minHeight: 280 }}>
            <div style={{ display: 'flex', height: '100%', minHeight: 280 }}>
              {/* 9% */}
              <div
                style={{
                  background: '#0F172A',
                  border: `1px solid rgba(255,255,255,0.12)`,
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
              </div>

              {/* 91% */}
              <div
                style={{
                  background: D.magenta,
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
              </div>
            </div>
          </div>

          <div
            style={{ background: '#edf1f8', border: `1px solid #d0daf0`, borderRadius: 2, marginTop: 32 }}
            className="p-5"
          >
            <p className="text-sm leading-relaxed" style={{ color: C.inkMid }}>
              El Ingresos Brutos es un{' '}
              <span style={{ color: C.ink, fontWeight: 600 }}>impuesto en cascada</span>:
              se aplica en cada etapa de la cadena productiva, se acumula y se traslada íntegramente al
              precio final. No lo paga "la empresa" - lo pagás vos en cada consumo.
              Encarece todo, castiga el trabajo y complica la producción.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: C.ink }}>
              Fuente
            </p>
            <p className="text-sm mt-1" style={{ color: C.inkMid }}>
              Encuesta KPMG sobre impuestos en empresas medianas y grandes · Argentina 2025
            </p>
          </div>
          <Link
            to="/informes"
            className="text-sm no-underline font-medium"
            style={{ color: C.inkLight }}
          >
            ← Ver todos los informes
          </Link>
        </div>
      </div>

    </div>
  )
}
