import React, { useState, useMemo } from "react";
import { m } from "framer-motion";
import { hilos } from "../components/data/mockData";
import HiloCard from "../components/shared/HiloCard";
import FilterBar from "../components/shared/FilterBar";

export default function Hilos() {
  const [search, setSearch] = useState("");
  const [tema, setTema] = useState("all");

  const temaOptions = [...new Set(hilos.map(h => h.tema))].map(t => ({ value: t, label: t }));

  const filtered = useMemo(() => {
    return [...hilos]
      .sort((a, b) => (b.fechaOrden || '').localeCompare(a.fechaOrden || ''))
      .filter(h => {
        const matchSearch = !search || h.titulo.toLowerCase().includes(search.toLowerCase()) || h.resumen.toLowerCase().includes(search.toLowerCase());
        const matchTema = tema === "all" || h.tema === tema;
        return matchSearch && matchTema;
      });
  }, [search, tema]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#0a1628] tracking-tight mb-3">Hilos y publicaciones destacadas</h1>
        <p className="text-lg text-slate-600">Análisis en formato hilo para redes sociales</p>
      </m.div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        className="mb-8"
        filters={[{ key: "tema", value: tema, onChange: setTema, placeholder: "Temática", options: temaOptions }]}
      />

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((h, i) => (
            <HiloCard key={h.id} hilo={h} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400 text-sm">No se encontraron publicaciones con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
