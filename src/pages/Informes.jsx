import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import EntryCard from '@/components/shared/EntryCard'
import FilterBar from '@/components/shared/FilterBar'

export default function Informes() {
  const [informes, setInformes] = useState([])
  const [estado, setEstado] = useState('cargando') // 'cargando' | 'ok' | 'error'
  const [search, setSearch] = useState('')
  const [tema, setTema] = useState('all')

  useEffect(() => {
    supabase.from('informes').select('*').order('fecha_orden', { ascending: false })
      .then(({ data, error }) => {
        setInformes(data || [])
        setEstado(error ? 'error' : 'ok')
      })
      .catch(() => setEstado('error'))
  }, [])

  const temaOptions = [...new Set(informes.map(i => i.tema))].map(t => ({ value: t, label: t }))

  const filtered = useMemo(() => {
    return informes.filter(i => {
      const matchSearch = !search || i.titulo.toLowerCase().includes(search.toLowerCase()) || i.bajada.toLowerCase().includes(search.toLowerCase())
      const matchTema = tema === 'all' || i.tema === tema
      return matchSearch && matchTema
    })
  }, [informes, search, tema])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-[#0F172A] dark:text-slate-100 tracking-tight mb-3">Informes</h1>
        <p className="text-lg text-slate-600 dark:text-slate-500">Análisis en profundidad sobre política, fiscalidad, producción y gestión municipal</p>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        className="mb-8"
        filters={[{ key: 'tema', value: tema, onChange: setTema, placeholder: 'Temática', options: temaOptions }]}
      />

      {estado === 'cargando' && (
        <p className="text-sm text-slate-500 py-12">Cargando informes…</p>
      )}

      {estado === 'error' && (
        <p className="text-sm text-slate-500 py-12">
          No se pudieron cargar los informes. Recargá la página o volvé a intentar en unos minutos.
        </p>
      )}

      {estado === 'ok' && (filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {filtered.map((inf, i) => (
            <EntryCard
              key={inf.id}
              titulo={inf.titulo}
              resumen={inf.bajada}
              fecha={inf.fecha}
              tema={inf.tema}
              municipio={inf.municipios?.join(', ')}
              insights={inf.insights}
              url={inf.url}
              imagen={inf.imagen}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <p className="text-slate-500 text-sm">
            {informes.length === 0
              ? 'Todavía no hay informes publicados.'
              : 'Ningún informe coincide con la búsqueda o el filtro elegido.'}
          </p>
        </div>
      ))}
    </div>
  )
}
