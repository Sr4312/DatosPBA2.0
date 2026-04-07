import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft, ExternalLink } from 'lucide-react'

// ─── palette ────────────────────────────────────────────────
const C = {
  paper:    '#f4f1eb',
  ink:      '#0d1117',
  inkMid:   '#3d4555',
  inkLight: '#8a93a8',
  lean:     '#1a6b3a',   // deep green - efficient state
  leanBg:   '#e8f5ee',
  heavy:    '#0f2d5e',   // deep navy - bloated state
  heavyBg:  '#e8eef7',
  mid:      '#b45309',   // amber - middle ground
  midBg:    '#fef3c7',
  rule:     'rgba(13,17,23,0.12)',
  accent:   '#1565C0',
}

// ─── dataset ────────────────────────────────────────────────
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
const ZONE_COLOR = { lean: C.lean, mid: C.mid, heavy: C.heavy }
const ZONE_BG    = { lean: C.leanBg, mid: C.midBg, heavy: C.heavyBg }
const ZONE_LABEL = { lean: 'Estado liviano', mid: 'Estado intermedio', heavy: 'Estado pesado' }

// ─── helpers ────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

function Chip({ zona }) {
  return (
    <span style={{
      background: ZONE_BG[zona],
      color: ZONE_COLOR[zona],
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.06em',
      padding: '2px 8px',
      borderRadius: 999,
      textTransform: 'uppercase',
    }}>
      {ZONE_LABEL[zona]}
    </span>
  )
}

// ─── Spectrum dot plot ───────────────────────────────────────
function SpectrumChart() {
  const sorted = [...MUNICIPIOS].sort((a, b) => a.pct - b.pct)

  return (
    <m.div {...fadeUp(0.1)} style={{ position: 'relative', paddingBottom: 48 }}>
      {/* zone backgrounds */}
      <div style={{ position: 'relative', height: 120 }}>
        {/* lean zone */}
        <div style={{
          position: 'absolute', left: 0, width: `${(10 / MAX) * 100}%`,
          top: 0, bottom: 0, background: C.leanBg, borderRadius: '8px 0 0 8px',
        }} />
        {/* mid zone */}
        <div style={{
          position: 'absolute', left: `${(10 / MAX) * 100}%`, width: `${(20 / MAX) * 100}%`,
          top: 0, bottom: 0, background: '#fffbf0',
        }} />
        {/* heavy zone */}
        <div style={{
          position: 'absolute', left: `${(30 / MAX) * 100}%`, right: 0,
          top: 0, bottom: 0, background: C.heavyBg, borderRadius: '0 8px 8px 0',
        }} />

        {/* axis line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '50%',
          height: 2, background: C.rule,
        }} />

        {/* tick marks */}
        {[0, 10, 20, 30, 40].map(t => (
          <div key={t} style={{
            position: 'absolute', left: `${(t / MAX) * 100}%`,
            top: '50%', transform: 'translate(-50%, -50%)',
          }}>
            <div style={{ width: 1, height: 10, background: C.inkLight, margin: '0 auto' }} />
          </div>
        ))}

        {/* dots */}
        {sorted.map((muni, i) => {
          const left = `${(muni.pct / MAX) * 100}%`
          const isTop = i % 2 === 0
          return (
            <m.div
              key={muni.name}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 * i + 0.3, type: 'spring', stiffness: 300 }}
              style={{
                position: 'absolute',
                left,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              }}
            >
              {/* label above/below */}
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
              {/* dot */}
              <div style={{
                width: 14, height: 14,
                borderRadius: '50%',
                background: ZONE_COLOR[muni.zona],
                border: `2px solid ${C.paper}`,
                boxShadow: `0 0 0 1px ${ZONE_COLOR[muni.zona]}`,
              }} />
              {/* stem */}
              <div style={{
                position: 'absolute',
                left: '50%', transform: 'translateX(-50%)',
                width: 1, height: 14,
                background: ZONE_COLOR[muni.zona] + '60',
                bottom: isTop ? 14 : 'auto',
                top: isTop ? 'auto' : 14,
              }} />
            </m.div>
          )
        })}
      </div>

      {/* x-axis labels */}
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

      {/* zone labels */}
      <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
        {['lean', 'mid', 'heavy'].map(z => (
          <div key={z} className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ZONE_COLOR[z] }} />
            <span style={{ fontSize: '0.72rem', color: C.inkMid }}>{ZONE_LABEL[z]}</span>
          </div>
        ))}
      </div>
    </m.div>
  )
}

// ─── municipality card ──────────────────────────────────────
function MuniCard({ m: muni, delay = 0 }) {
  const col = ZONE_COLOR[muni.zona]
  const bg  = ZONE_BG[muni.zona]
  return (
    <m.div
      {...fadeUp(delay)}
      style={{
        background: '#fff',
        border: `1px solid ${C.rule}`,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* color band */}
      <div style={{ height: 4, background: col }} />
      <div style={{ padding: '20px 22px' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div style={{ fontSize: '0.7rem', color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Empleo en adm. pública
            </div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.4rem', fontWeight: 700, color: col, lineHeight: 1 }}>
              {muni.pct}%
            </div>
            <div style={{ fontWeight: 600, color: C.ink, marginTop: 6, fontSize: '0.9rem' }}>{muni.name}</div>
            {muni.handle && (
              <div style={{ fontSize: '0.72rem', color: C.inkLight, marginTop: 2 }}>{muni.handle}</div>
            )}
          </div>
          <Chip zona={muni.zona} />
        </div>
        {/* bar */}
        <div style={{ marginTop: 16, background: bg, borderRadius: 999, height: 6, overflow: 'hidden' }}>
          <m.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(muni.pct / MAX) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: delay + 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: '100%', background: col, borderRadius: 999 }}
          />
        </div>
        <div style={{ fontSize: '0.68rem', color: C.inkLight, marginTop: 6, textAlign: 'right' }}>
          de cada 100 empleados trabaja en el estado municipal
        </div>
      </div>
    </m.div>
  )
}

// ─── dumbbell comparison ────────────────────────────────────
function Dumbbell() {
  const lean  = MUNICIPIOS[0]  // Vicente López 4.4%
  const heavy = MUNICIPIOS[6]  // Alberti 38%
  const ratio = (heavy.pct / lean.pct).toFixed(1)

  return (
    <m.div {...fadeUp(0.1)} style={{
      background: '#fff',
      border: `1px solid ${C.rule}`,
      borderRadius: 20,
      padding: '32px 36px',
    }}>
      <p style={{ fontSize: '0.72rem', color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 24 }}>
        El extremo de la brecha
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {/* lean side */}
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '3.5rem', fontWeight: 700, color: C.lean, lineHeight: 1 }}>
            {lean.pct}%
          </div>
          <div style={{ fontWeight: 600, color: C.ink, fontSize: '0.85rem', marginTop: 6 }}>{lean.name}</div>
          <Chip zona="lean" />
        </div>

        {/* dumbbell bar */}
        <div style={{ flex: 1, position: 'relative', height: 4, margin: '0 16px', marginTop: -12 }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${C.lean}, ${C.heavy})`, borderRadius: 999 }} />
          {/* ratio badge */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            background: C.ink, color: '#fff',
            borderRadius: 999, padding: '4px 12px',
            fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            {ratio}× más
          </div>
        </div>

        {/* heavy side */}
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '3.5rem', fontWeight: 700, color: C.heavy, lineHeight: 1 }}>
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
    </m.div>
  )
}

// ─── main page ──────────────────────────────────────────────
export default function InformeCAFEstadoMunicipal() {
  const lean  = MUNICIPIOS.filter(m => m.zona === 'lean')
  const mid   = MUNICIPIOS.filter(m => m.zona === 'mid')
  const heavy = MUNICIPIOS.filter(m => m.zona === 'heavy')

  return (
    <div style={{ background: C.paper, minHeight: '100vh' }}>

      {/* ── back nav ── */}
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link
          to="/informes"
          className="inline-flex items-center gap-1.5 text-sm no-underline"
          style={{ color: C.inkLight }}
        >
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>
      </div>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-14">

        {/* eyebrow */}
        <m.div {...fadeUp(0)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 32, height: 2, background: C.accent }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Atlas CAF · Gobiernos Locales · Buenos Aires
            </span>
          </div>
        </m.div>

        <m.h1
          {...fadeUp(0.05)}
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 700,
            color: C.ink,
            lineHeight: 1.1,
            marginBottom: 20,
            maxWidth: 780,
          }}
        >
          Dos Buenos Aires:<br />
          <span style={{ color: C.lean }}>el estado que trabaja</span>{' '}
          y <span style={{ color: C.heavy }}>el estado que pesa</span>
        </m.h1>

        <m.p {...fadeUp(0.1)} style={{ color: C.inkMid, maxWidth: 620, lineHeight: 1.7, fontSize: '1.02rem' }}>
          El Atlas de CAF revela una brecha de hasta <strong>9 veces</strong> en el porcentaje
          de empleo en administración pública entre municipios bonaerenses. Más estado no significa
          mejor estado: significa más carga tributaria y menos sector privado.
        </m.p>

        {/* meta */}
        <m.div {...fadeUp(0.15)} style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Fuente', val: 'Atlas CAF Gobiernos Locales' },
            { label: 'Cobertura', val: 'Municipios de Buenos Aires' },
            { label: 'Indicador', val: '% empleo en adm. pública' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.68rem', color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: C.ink, marginTop: 2 }}>{item.val}</div>
            </div>
          ))}
        </m.div>
      </div>

      {/* ══════════════════ SPECTRUM ══════════════════ */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <m.div {...fadeUp(0)} className="mb-8">
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', fontWeight: 700, color: C.ink, marginBottom: 8 }}>
              El espectro del empleo estatal municipal
            </h2>
            <p style={{ color: C.inkMid, fontSize: '0.88rem', maxWidth: 560 }}>
              Cada punto es un municipio, posicionado según el porcentaje de su fuerza laboral
              que trabaja en la administración pública.
            </p>
          </m.div>

          <SpectrumChart />
        </div>
      </div>

      {/* ══════════════════ DUMBBELL ══════════════════ */}
      <div className="max-w-5xl mx-auto px-6 py-14">
        <m.div {...fadeUp(0)} className="mb-8">
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', fontWeight: 700, color: C.ink, marginBottom: 8 }}>
            La brecha que no debería existir
          </h2>
          <p style={{ color: C.inkMid, fontSize: '0.88rem', maxWidth: 560 }}>
            Dentro de la misma provincia, con las mismas reglas, coexisten modelos fiscales
            radicalmente distintos.
          </p>
        </m.div>

        <Dumbbell />
      </div>

      {/* ══════════════════ CARDS GRID ══════════════════ */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-14">

          {/* LEAN */}
          <m.div {...fadeUp(0)} className="mb-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.lean }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.lean, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Modelo 1 - Estado liviano
              </span>
            </div>
            <p style={{ color: C.inkMid, fontSize: '0.85rem', maxWidth: 560 }}>
              Municipios donde el peso del empleo público es mínimo, permitiendo mayor dinamismo
              del sector privado y menor presión fiscal.
            </p>
          </m.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
            {lean.map((muni, i) => <MuniCard key={muni.name} m={muni} delay={i * 0.08} />)}
          </div>

          {/* HEAVY */}
          <m.div {...fadeUp(0)} className="mb-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.heavy }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.heavy, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Modelo 2 - Estado pesado
              </span>
            </div>
            <p style={{ color: C.inkMid, fontSize: '0.85rem', maxWidth: 560 }}>
              Municipios donde más de 1 de cada 3 empleados trabaja en la administración pública.
              Mayor carga tributaria, menor sector privado.
            </p>
          </m.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {heavy.map((muni, i) => <MuniCard key={muni.name} m={muni} delay={i * 0.08} />)}
          </div>

          {/* INTERMEDIATE */}
          <m.div {...fadeUp(0)} className="mt-14 mb-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.mid }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.mid, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Zona intermedia
              </span>
            </div>
          </m.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mid.map((muni, i) => <MuniCard key={muni.name} m={muni} delay={i * 0.08} />)}
          </div>
        </div>
      </div>

      {/* ══════════════════ INSIGHT BLOCK ══════════════════ */}
      <div className="max-w-5xl mx-auto px-6 py-14">
        <m.div
          {...fadeUp(0)}
          style={{
            background: C.ink,
            borderRadius: 20,
            padding: '40px 44px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* geometric accent */}
          <div style={{
            position: 'absolute', right: -60, top: -60,
            width: 240, height: 240, borderRadius: '50%',
            border: `40px solid rgba(255,255,255,0.04)`,
          }} />
          <div style={{
            position: 'absolute', right: 40, bottom: -80,
            width: 160, height: 160, borderRadius: '50%',
            border: `30px solid rgba(255,255,255,0.03)`,
          }} />

          <div className="relative z-10">
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>
              La conclusión
            </p>
            <p style={{ color: '#fff', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 680 }}>
              Más empleo en la administración pública no es un indicador de mejor servicio:
              es una señal de{' '}
              <span style={{ color: '#7dd3fc', fontWeight: 700 }}>mayor carga tributaria</span>{' '}
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
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff', textDecoration: 'none',
                  borderRadius: 999, padding: '8px 18px',
                  fontSize: '0.78rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                Ver Atlas CAF - Buenos Aires <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </m.div>
      </div>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
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
