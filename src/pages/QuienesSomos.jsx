import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Cifra from '@/components/shared/Cifra'

const PILARES = [
  {
    title: 'Transparencia',
    desc: 'Publicamos fuentes, metodologías y datos brutos. Cada número es verificable y cada conclusión es reproducible.',
  },
  {
    title: 'Precisión',
    desc: 'Usamos microdatos oficiales —EPH, Censo 2022, presupuesto ejecutado— procesados con criterios estadísticos explícitos.',
  },
  {
    title: 'Relevancia',
    desc: 'Trabajamos los temas que afectan la vida cotidiana de los bonaerenses: empleo, salud, educación, gasto público y seguridad.',
  },
]

export default function QuienesSomos() {
  const [conteos, setConteos] = useState({ informes: null, datasets: null })

  useEffect(() => {
    Promise.all([
      supabase.from('informes').select('id', { count: 'exact', head: true }),
      supabase.from('datasets').select('id', { count: 'exact', head: true }),
    ]).then(([{ count: inf }, { count: dat }]) => {
      setConteos({ informes: inf, datasets: dat })
    })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

      {/* Hero */}
      <div className="mb-16 max-w-read">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0F172A] tracking-tight mb-5 leading-tight">
          Qué es DatosPBA
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          DatosPBA es una publicación independiente de periodismo de datos sobre la
          Provincia de Buenos Aires. Procesamos datos públicos para hacer accesible
          lo que las estadísticas oficiales dejan sin explicar.
        </p>
      </div>

      {/* Cifras reales del sitio */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-20 border-t-2 border-[#0F172A] pt-6">
        <Cifra
          label="Informes publicados"
          valor={conteos.informes != null ? String(conteos.informes) : '—'}
          fuente="Publicados en este sitio"
        />
        <Cifra
          label="Datasets documentados"
          valor={conteos.datasets != null ? String(conteos.datasets) : '—'}
          fuente="En preparación para descarga"
        />
        <Cifra label="Municipios" valor="135" fuente="División política de la PBA" />
        <Cifra label="Habitantes" valor="17,6 M" fuente="INDEC, Censo 2022" />
      </div>

      {/* Misión */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-start">
        <div>
          <div className="border-b-2 border-[#0F172A] pb-3 mb-6">
            <h2 className="font-display text-headline text-[#0F172A] tracking-tight">Nuestra misión</h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed max-w-read">
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
        </div>

        {/* Pilares */}
        <div className="flex flex-col gap-4">
          {PILARES.map(p => (
            <div key={p.title} className="border-t pt-4" style={{ borderColor: 'var(--rule)' }}>
              <p className="font-semibold text-[#0F172A] mb-1">{p.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Qué producimos */}
      <div className="bg-[#0F172A] p-8 sm:p-12 text-white">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 tracking-tight">¿Qué producimos?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
          <div>
            <p className="text-slate-300 font-semibold text-sm mb-3">Informes</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Análisis largos con metodología detallada, contexto histórico y conclusiones
              sobre política fiscal, social y laboral bonaerense.
            </p>
          </div>
          <div>
            <p className="text-slate-300 font-semibold text-sm mb-3">Reportes rápidos</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Un número clave, su variación, su período y su fuente, en formato conciso.
            </p>
          </div>
          <div>
            <p className="text-slate-300 font-semibold text-sm mb-3">Datasets</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Archivos limpios y documentados para que investigadores, periodistas y
              ciudadanos hagan sus propios análisis sin intermediarios.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
