import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { visualizaciones } from "../components/data/mockData";
import FilterBar from "../components/shared/FilterBar";
import VizCard from "../components/visualizaciones/VizCard";

export default function Visualizaciones() {
  const [tema, setTema] = useState("all");

  const temaOptions = [...new Set(visualizaciones.map(v => v.tema))].map(t => ({ value: t, label: t }));

  const filtered = useMemo(() => {
    return [...visualizaciones]
      .sort((a, b) => (b.fechaOrden || '').localeCompare(a.fechaOrden || ''))
      .filter(v => tema === "all" || v.tema === tema);
  }, [tema]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#0a1628] tracking-tight mb-3">Visualizaciones interactivas</h1>
        <p className="text-lg text-slate-600">Gráficos, rankings, series y comparativos para explorar los datos</p>
      </motion.div>

      <FilterBar
        className="mb-8"
        filters={[{ key: "tema", value: tema, onChange: setTema, placeholder: "Temática", options: temaOptions }]}
      />

      {filtered.length > 0 ? (
        <div className="space-y-6">
          {filtered.map((viz, i) => (
            <VizCard key={viz.id} viz={viz} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400 text-sm">No se encontraron visualizaciones con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
