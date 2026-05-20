import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { BarChart2, Database, FileText, MapPin, Users, Target, Eye, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const STAT_META = [
  { icon: FileText, label: 'Informes publicados',      color: 'bg-blue-50 text-blue-700' },
  { icon: Database, label: 'Datasets abiertos',         color: 'bg-indigo-50 text-indigo-700' },
  { icon: MapPin,   label: 'Municipios analizados',     color: 'bg-slate-50 text-slate-700' },
  { icon: Users,    label: 'Bonaerenses representados', color: 'bg-sky-50 text-sky-700' },
]

const PILARES = [
  {
    icon: Eye,
    title: 'Transparencia',
    desc: 'Publicamos fuentes, metodologías y datos brutos. Nada está oculto: cada número es verificable y cada conclusión es reproducible.',
  },
  {
    icon: Target,
    title: 'Precisión',
    desc: 'Usamos microdatos oficiales - EPH, Censo 2022, presupuesto ejecutado - procesados con criterios estadísticos rigurosos.',
  },
  {
    icon: TrendingUp,
    title: 'Relevancia',
    desc: 'Nos enfocamos en los temas que afectan la vida cotidiana de los bonaerenses: empleo, salud, educación, gasto público y seguridad.',
  },
]

const TEMAS = [
  { label: 'Economía y empleo',     pct: 88 },
  { label: 'Salud pública',         pct: 72 },
  { label: 'Educación',             pct: 65 },
  { label: 'Gasto público',         pct: 80 },
  { label: 'Infraestructura',       pct: 54 },
  { label: 'Desarrollo municipal',  pct: 70 },
]

const COBERTURA = [
  { region: 'GBA Norte',    partidos: 18, color: '#1f4795' },
  { region: 'GBA Sur',      partidos: 21, color: '#3d65b2' },
  { region: 'GBA Oeste',    partidos: 12, color: '#5b82ce' },
  { region: 'Interior PBA', partidos: 84, color: '#94a3b8' },
]
const total = COBERTURA.reduce((s, r) => s + r.partidos, 0)

function BarSimple({ label, pct }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-[#0a1628]">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <m.div
          className="h-full rounded-full bg-[#1f4795]"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function QuienesSomos() {
  const [stats, setStats] = useState([
    { ...STAT_META[0], value: '…' },
    { ...STAT_META[1], value: '…' },
    { ...STAT_META[2], value: '135' },
    { ...STAT_META[3], value: '17M+' },
  ])

  useEffect(() => {
    Promise.all([
      supabase.from('informes').select('id', { count: 'exact', head: true }),
      supabase.from('datasets').select('id', { count: 'exact', head: true }),
    ]).then(([{ count: inf }, { count: dat }]) => {
      setStats([
        { ...STAT_META[0], value: inf ? `${inf}` : '-' },
        { ...STAT_META[1], value: dat ? `${dat}` : '-' },
        { ...STAT_META[2], value: '135' },
        { ...STAT_META[3], value: '17M+' },
      ])
    })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

      {/* Hero */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0a1628] tracking-tight mb-5 leading-tight">
          Análisis político y datos abiertos<br className="hidden sm:block" />
          <span className="text-brand-600"> para Buenos Aires</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
          DatosPBA es un repositorio independiente de análisis basado en evidencia sobre la
          Provincia de Buenos Aires. Procesamos datos públicos para hacer accesible lo que
          las estadísticas oficiales dejan sin explicar.
        </p>
      </m.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
        {stats.map((s, i) => (
          <m.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col gap-3"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0a1628] leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">{s.label}</p>
            </div>
          </m.div>
        ))}
      </div>

      {/* Misión */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-start">
        <m.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="border-b-2 border-[#0a1628] pb-3 mb-6">
            <h2 className="font-display text-3xl font-bold text-[#0a1628] tracking-tight">Nuestra misión</h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              La Provincia de Buenos Aires concentra el 38% de la población argentina y genera
              más de un tercio del PBI nacional, pero la información sobre sus municipios,
              presupuestos y condiciones sociales está dispersa en formatos inaccesibles.
            </p>
            <p>
              DatosPBA nació para cambiar eso. Tomamos microdatos del INDEC, presupuestos
              ejecutados de la Dirección Provincial de Presupuesto, cifras del Censo 2022 y otras
              fuentes oficiales, y los transformamos en análisis claros, visualizaciones interactivas
              y datasets listos para usar.
            </p>
            <p>
              Creemos que el acceso a la información es la base de cualquier debate público
              serio. Por eso todo lo que publicamos es abierto, descargable y reutilizable.
            </p>
          </div>
        </m.div>

        {/* Pilares */}
        <m.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          {PILARES.map((p, i) => (
            <m.div
              key={p.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="bg-white rounded-xl border border-slate-200/60 p-5 flex gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-brand-700" />
              </div>
              <div>
                <p className="font-semibold text-[#0a1628] mb-1">{p.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            </m.div>
          ))}
        </m.div>
      </div>

      {/* Visualizaciones: cobertura temática + geográfica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">

        {/* Cobertura temática */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-7"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-[#0a1628]">Cobertura temática</h3>
          </div>
          <p className="text-xs text-slate-400 mb-5">% de municipios con al menos un análisis publicado por tema</p>
          <div className="flex flex-col gap-4">
            {TEMAS.map(t => <BarSimple key={t.label} label={t.label} pct={t.pct} />)}
          </div>
        </m.div>

        {/* Distribución geográfica */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-7"
        >
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-[#0a1628]">Distribución geográfica</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">Partidos analizados por región</p>

          {/* Donut SVG */}
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <DonutChart data={COBERTURA} total={total} />
            <div className="flex flex-col gap-3 flex-1 w-full">
              {COBERTURA.map(r => (
                <div key={r.region} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="text-sm text-slate-600">{r.region}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#0a1628]">{r.partidos} partidos</span>
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-2">Total: {total} partidos · Fuente: IGN 2024</p>
            </div>
          </div>
        </m.div>
      </div>

      {/* Qué hacemos */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-[#0a1628] rounded-2xl p-8 sm:p-12 text-white"
      >
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 tracking-tight">¿Qué producimos?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
          <div>
            <p className="text-brand-300 font-semibold text-sm uppercase tracking-widest mb-3">Informes</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Análisis largos con metodología detallada, contexto histórico y conclusiones accionables
              sobre política fiscal, social y laboral bonaerense.
            </p>
          </div>
          <div>
            <p className="text-brand-300 font-semibold text-sm uppercase tracking-widest mb-3">Reportes rápidos</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Datos puntuales presentados en formato conciso: un número clave, su variación y lo que
              significa para la provincia.
            </p>
          </div>
          <div>
            <p className="text-brand-300 font-semibold text-sm uppercase tracking-widest mb-3">Datasets</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Archivos limpios y documentados para que investigadores, periodistas y ciudadanos
              puedan hacer sus propios análisis sin intermediarios.
            </p>
          </div>
        </div>
      </m.div>

    </div>
  )
}

/* ── Donut chart (pure SVG, no deps) ──────────────────────────────────────── */
function DonutChart({ data, total }) {
  const SIZE = 140
  const cx = SIZE / 2
  const cy = SIZE / 2
  const R  = 54
  const r  = 34

  let cumAngle = -Math.PI / 2
  const slices = data.map(d => {
    const angle = (d.partidos / total) * 2 * Math.PI
    const x1 = cx + R * Math.cos(cumAngle)
    const y1 = cy + R * Math.sin(cumAngle)
    const x2 = cx + R * Math.cos(cumAngle + angle)
    const y2 = cy + R * Math.sin(cumAngle + angle)
    const xi1 = cx + r * Math.cos(cumAngle)
    const yi1 = cy + r * Math.sin(cumAngle)
    const xi2 = cx + r * Math.cos(cumAngle + angle)
    const yi2 = cy + r * Math.sin(cumAngle + angle)
    const large = angle > Math.PI ? 1 : 0
    const path = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${r} ${r} 0 ${large} 0 ${xi1} ${yi1} Z`
    cumAngle += angle
    return { ...d, path }
  })

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
      {slices.map(s => (
        <path key={s.region} d={s.path} fill={s.color} stroke="white" strokeWidth="1.5" />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0a1628">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#94a3b8">partidos</text>
    </svg>
  )
}
