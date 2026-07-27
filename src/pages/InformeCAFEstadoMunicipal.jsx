import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { colorEscalaValoracion } from '@/lib/variacion'

// palette - chrome/layout colors
const C = {
  bg:       'var(--c-bg)',
  ink:      'var(--c-ink)',
  inkMid:   'var(--c-ink-mid)',
  inkLight: 'var(--c-ink-light)',
  rule:     'var(--c-rule)',
  accent:   '#3d65b2',
}

const MUNICIPIOS = [
  { name: 'Vicente López',    pct: 4.4,  zona: 'lean',  handle: '@VivamosVL' },
  { name: 'Tres de Febrero',  pct: 4.8,  zona: 'lean',  handle: '@Municipalidad3F' },
  { name: 'Berazategui',      pct: 19.6, zona: 'mid',   handle: null },
  { name: 'Almirante Brown',  pct: 24.9, zona: 'mid',   handle: null },
  { name: 'Ayacucho',         pct: 35.7, zona: 'heavy', handle: null },
  { name: 'Chaves',           pct: 36.5, zona: 'heavy', handle: null },
  { name: 'Alberti',          pct: 38.0, zona: 'heavy', handle: null },
]

const MAX = 42

/* Rampa de valoración por nivel de empleo público municipal: el informe
   asume menos = mejor, así que t alto = valor bajo. Las tres zonas son
   cortes discretos sobre la escala worse → neutral → better; ningún
   color de zona se elige a mano. */
const ZONE_T = { lean: 1, mid: 0.5, heavy: 0 }
const conAlfa = (rgb, a) => rgb.replace('rgb(', 'rgba(').replace(')', `,${a})`)
const ZONE_COLOR = {
  lean:  colorEscalaValoracion(ZONE_T.lean),
  mid:   colorEscalaValoracion(ZONE_T.mid),
  heavy: colorEscalaValoracion(ZONE_T.heavy),
}
const ZONE_BG = {
  lean:  conAlfa(ZONE_COLOR.lean, 0.1),
  mid:   conAlfa(ZONE_COLOR.mid, 0.1),
  heavy: conAlfa(ZONE_COLOR.heavy, 0.1),
}
const ZONE_LABEL = { lean: 'Estado liviano', mid: 'Estado intermedio', heavy: 'Estado pesado' }

function Chip({ zona }) {
  return (
    <span style={{
      background: ZONE_BG[zona],
      color: ZONE_COLOR[zona],
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.06em',
      padding: '2px 8px',
      borderRadius: 2,
      textTransform: 'uppercase',
    }}>
      {ZONE_LABEL[zona]}
    </span>
  )
}

function SpectrumChart() {
  const sorted = [...MUNICIPIOS].sort((a, b) => a.pct - b.pct)

  return (
    <div style={{ position: 'relative', paddingBottom: 48 }}>
      <div style={{ position: 'relative', height: 120 }}>
        <div style={{
          position: 'absolute', left: 0, width: `${(10 / MAX) * 100}%`,
          top: 0, bottom: 0, background: ZONE_BG.lean, borderRadius: '8px 0 0 8px',
        }} />
        <div style={{
          position: 'absolute', left: `${(10 / MAX) * 100}%`, width: `${(20 / MAX) * 100}%`,
          top: 0, bottom: 0, background: conAlfa(ZONE_COLOR.mid, 0.06),
        }} />
        <div style={{
          position: 'absolute', left: `${(30 / MAX) * 100}%`, right: 0,
          top: 0, bottom: 0, background: ZONE_BG.heavy, borderRadius: '0 8px 8px 0',
        }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '50%',
          height: 2, background: C.rule,
        }} />
        {[0, 10, 20, 30, 40].map(t => (
          <div key={t} style={{
            position: 'absolute', left: `${(t / MAX) * 100}%`,
            top: '50%', transform: 'translate(-50%, -50%)',
          }}>
            <div style={{ width: 1, height: 10, background: C.inkLight, margin: '0 auto' }} />
          </div>
        ))}
        {sorted.map((muni, i) => {
          const left = `${(muni.pct / MAX) * 100}%`
          const isTop = i % 2 === 0
          return (
            <div
              key={muni.name}
              style={{ position: 'absolute', left, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
            >
              <div style={{
                position: 'absolute',
                bottom: isTop ? 18 : 'auto',
                top: isTop ? 'auto' : 18,
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: ZONE_COLOR[muni.zona] }}>
                  {muni.pct}%
                </div>
                <div style={{ fontSize: '0.65rem', color: C.inkMid, marginTop: 1 }}>
                  {muni.name}
                </div>
              </div>
              <div style={{
                width: 14, height: 14,
                borderRadius: '50%',
                background: ZONE_COLOR[muni.zona],
                border: `2px solid ${C.bg}`,
                boxShadow: `0 0 0 1px ${ZONE_COLOR[muni.zona]}`,
              }} />
              <div style={{
                position: 'absolute',
                left: '50%', transform: 'translateX(-50%)',
                width: 1, height: 14,
                background: conAlfa(ZONE_COLOR[muni.zona], 0.38),
                bottom: isTop ? 14 : 'auto',
                top: isTop ? 'auto' : 14,
              }} />
            </div>
          )
        })}
      </div>
      <div style={{ position: 'relative', marginTop: 8 }}>
        {[0, 10, 20, 30, 40].map(t => (
          <span key={t} style={{
            position: 'absolute',
            left: `${(t / MAX) * 100}%`,
            transform: 'translateX(-50%)',
            fontSize: '0.68rem',
            color: C.inkLight,
          }}>
            {t}%
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
        {['lean', 'mid', 'heavy'].map(z => (
          <div key={z} className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ZONE_COLOR[z] }} />
            <span style={{ fontSize: '0.72rem', color: C.inkMid }}>{ZONE_LABEL[z]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MuniCard({ m: muni, delay = 0 }) {
  const col = ZONE_COLOR[muni.zona]
  const bg  = ZONE_BG[muni.zona]
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${C.rule}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <div style={{ height: 4, background: col }} />
      <div style={{ padding: '20px 22px' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div style={{ fontSize: '0.7rem', color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Empleo en adm. pública
            </div>
            <div className="font-display" style={{ fontSize: '2.4rem', fontWeight: 700, color: col, lineHeight: 1 }}>
              {muni.pct}%
            </div>
            <div style={{ fontWeight: 600, color: C.ink, marginTop: 6, fontSize: '0.9rem' }}>{muni.name}</div>
            {muni.handle && (
              <div style={{ fontSize: '0.72rem', color: C.inkLight, marginTop: 2 }}>{muni.handle}</div>
            )}
          </div>
          <Chip zona={muni.zona} />
        </div>
        <div style={{ marginTop: 16, background: bg, borderRadius: 2, height: 6, overflow: 'hidden' }}>
          <div
            whileInView={{ width: `${(muni.pct / MAX) * 100}%` }}
            style={{ height: '100%', background: col, borderRadius: 2 }}
          />
        </div>
        <div style={{ fontSize: '0.68rem', color: C.inkLight, marginTop: 6, textAlign: 'right' }}>
          de cada 100 empleados trabaja en el estado municipal
        </div>
      </div>
    </div>
  )
}

function Dumbbell() {
  const lean  = MUNICIPIOS[0]
  const heavy = MUNICIPIOS[6]
  const ratio = (heavy.pct / lean.pct).toFixed(1)

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${C.rule}`,
      borderRadius: 2,
      padding: '32px 36px',
    }}>
      <p style={{ fontSize: '0.72rem', color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 24 }}>
        El extremo de la brecha
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div className="font-display" style={{ fontSize: '3.5rem', fontWeight: 700, color: ZONE_COLOR.lean, lineHeight: 1 }}>
            {lean.pct}%
          </div>
          <div style={{ fontWeight: 600, color: C.ink, fontSize: '0.85rem', marginTop: 6 }}>{lean.name}</div>
          <Chip zona="lean" />
        </div>

        <div style={{ flex: 1, position: 'relative', height: 4, margin: '0 16px', marginTop: -12 }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${ZONE_COLOR.lean}, ${ZONE_COLOR.mid}, ${ZONE_COLOR.heavy})`, borderRadius: 2 }} />
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            background: C.ink, color: '#fff',
            borderRadius: 2, padding: '4px 12px',
            fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            {ratio}× más
          </div>
        </div>

        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div className="font-display" style={{ fontSize: '3.5rem', fontWeight: 700, color: ZONE_COLOR.heavy, lineHeight: 1 }}>
            {heavy.pct}%
          </div>
          <div style={{ fontWeight: 600, color: C.ink, fontSize: '0.85rem', marginTop: 6 }}>{heavy.name}</div>
          <Chip zona="heavy" />
        </div>
      </div>

      <p style={{ marginTop: 28, fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, borderTop: `1px solid ${C.rule}`, paddingTop: 20 }}>
        En Alberti, <strong>casi 4 de cada 10 empleados</strong> trabaja en la administración pública municipal.
        En Vicente López, menos de 1 de cada 20. La misma Provincia de Buenos Aires. Dos mundos fiscales completamente distintos.
      </p>
    </div>
  )
}

export default function InformeCAFEstadoMunicipal() {
  const lean  = MUNICIPIOS.filter(m => m.zona === 'lean')
  const mid   = MUNICIPIOS.filter(m => m.zona === 'mid')
  const heavy = MUNICIPIOS.filter(m => m.zona === 'heavy')

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>

      {/* HERO OSCURO */}
      <div
       
        style={{ background: '#0F172A' }}
      >
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
          <Link
            to="/informes"
            className="inline-flex items-center gap-1.5 text-sm no-underline mb-10"
            style={{ color: 'rgba(255,255,255,0.62)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Volver a informes
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 32, height: 2, background: C.accent }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Atlas CAF · Gobiernos Locales · Buenos Aires
              </span>
            </div>
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2.4rem, 6vw, 4rem)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: 20,
              maxWidth: 780,
            }}
          >
            Dos Buenos Aires:<br />
            <span>el estado que trabaja</span>{' '}
            y <span>el estado que pesa</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 620, lineHeight: 1.7, fontSize: '1.02rem' }}>
            El Atlas de CAF revela una brecha de hasta <strong style={{ color: 'rgba(255,255,255,0.9)' }}>9 veces</strong> en el porcentaje
            de empleo en administración pública entre municipios bonaerenses. Más estado no significa
            mejor estado: significa más carga tributaria y menos sector privado.
          </p>

          <div style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}>
            {[
              { label: 'Fuente', val: 'Atlas CAF Gobiernos Locales' },
              { label: 'Cobertura', val: 'Municipios de Buenos Aires' },
              { label: 'Indicador', val: '% empleo en adm. pública' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SPECTRUM */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              El espectro del empleo estatal municipal
            </h2>
            <p style={{ color: C.inkMid, fontSize: '0.88rem', maxWidth: 560 }}>
              Cada punto es un municipio, posicionado según el porcentaje de su fuerza laboral
              que trabaja en la administración pública.
            </p>
          </div>
          <SpectrumChart />
        </div>
      </div>

      {/* DUMBBELL */}
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
            La brecha que no debería existir
          </h2>
          <p style={{ color: C.inkMid, fontSize: '0.88rem', maxWidth: 560 }}>
            Dentro de la misma provincia, con las mismas reglas, coexisten modelos fiscales
            radicalmente distintos.
          </p>
        </div>
        <Dumbbell />
      </div>

      {/* CARDS GRID */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-14">

          {/* LEAN */}
          <div className="mb-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: ZONE_COLOR.lean }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: ZONE_COLOR.lean, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Modelo 1 - Estado liviano
              </span>
            </div>
            <p style={{ color: C.inkMid, fontSize: '0.85rem', maxWidth: 560 }}>
              Municipios donde el peso del empleo público es mínimo, permitiendo mayor dinamismo
              del sector privado y menor presión fiscal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
            {lean.map((muni, i) => <MuniCard key={muni.name} m={muni} delay={i * 0.08} />)}
          </div>

          {/* HEAVY */}
          <div className="mb-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: ZONE_COLOR.heavy }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: ZONE_COLOR.heavy, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Modelo 2 - Estado pesado
              </span>
            </div>
            <p style={{ color: C.inkMid, fontSize: '0.85rem', maxWidth: 560 }}>
              Municipios donde más de 1 de cada 3 empleados trabaja en la administración pública.
              Mayor carga tributaria, menor sector privado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {heavy.map((muni, i) => <MuniCard key={muni.name} m={muni} delay={i * 0.08} />)}
          </div>

          {/* INTERMEDIATE */}
          <div className="mt-14 mb-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: ZONE_COLOR.mid }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: ZONE_COLOR.mid, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Zona intermedia
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mid.map((muni, i) => <MuniCard key={muni.name} m={muni} delay={i * 0.08} />)}
          </div>
        </div>
      </div>

      {/* CONCLUSIÓN */}
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div
         
          style={{
            background: '#0F172A',
            borderRadius: 2,
            padding: '40px 44px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >

          <div className="relative z-10">
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>
              La conclusión
            </p>
            <p style={{ color: '#fff', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 680 }}>
              Más empleo en la administración pública no es un indicador de mejor servicio:
              es una señal de{' '}
              <span style={{ fontWeight: 700 }}>mayor carga tributaria</span>{' '}
              y menos espacio para el sector privado. El Atlas de CAF muestra que la elección
              del modelo de Estado es una decisión política - y sus consecuencias fiscales
              las pagan los vecinos.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://atlasgobiernoslocales.caf.com/es/jurisdicciones/ARG6"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: '#fff', textDecoration: 'underline', textUnderlineOffset: 4,
                  fontSize: '0.78rem', fontWeight: 600,
                }}
              >
                Ver Atlas CAF - Buenos Aires <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p style={{ fontSize: '0.78rem', color: C.inkLight }}>
            Fuente: Atlas de Gobiernos Locales · CAF - Banco de Desarrollo de América Latina · 2024
          </p>
          <Link to="/informes" className="text-sm no-underline" style={{ color: C.inkLight }}>
            ← Ver todos los informes
          </Link>
        </div>
      </div>

    </div>
  )
}
