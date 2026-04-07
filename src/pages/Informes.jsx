import { useState, useMemo } from 'react'
import { m } from 'framer-motion'
import { informes } from '@/components/data/mockData'
import EntryCard from '@/components/shared/EntryCard'
import FilterBar from '@/components/shared/FilterBar'

export default function Informes() {
  const [search, setSearch] = useState("");
  const [tema, setTema] = useState("all");

  const temaOptions = [...new Set(informes.map(i => i.tema))].map(t => ({ value: t, label: t }));

  const filtered = useMemo(() => {
    return [...informes]
      .sort((a, b) => (b.fechaOrden || '').localeCompare(a.fechaOrden || ''))
      .filter(i => {
        const matchSearch = !search || i.titulo.toLowerCase().includes(search.toLowerCase()) || i.bajada.toLowerCase().includes(search.toLowerCase());
        const matchTema = tema === "all" || i.tema === tema;
        return matchSearch && matchTema;
      });
  }, [search, tema]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="font-display text-4xl font-bold text-[#0a1628] tracking-tight mb-3">Informes</h1>
        <p className="text-lg text-slate-600">Análisis en profundidad sobre política, fiscalidad, producción y gestión municipal</p>
      </m.div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        className="mb-8"
        filters={[{ key: "tema", value: tema, onChange: setTema, placeholder: "Temática", options: temaOptions }]}
      />

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {filtered.map((inf, i) => (
            <EntryCard
              key={inf.id}
              titulo={inf.titulo}
              resumen={inf.bajada}
              fecha={inf.fecha}
              tema={inf.tema}
              municipio={inf.municipios?.join(", ")}
              insights={inf.insights}
              url={inf.url}
              imagen={inf.imagen}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400 text-sm">No se encontraron informes con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
