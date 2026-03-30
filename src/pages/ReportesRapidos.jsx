import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { reportesRapidos } from "../components/data/mockData";
import FilterBar from "../components/shared/FilterBar";
import ReporteCard from "../components/shared/ReporteCard";

export default function ReportesRapidos() {
  const [search, setSearch] = useState("");
  const [tema, setTema] = useState("all");

  const temaOptions = [...new Set(reportesRapidos.map(r => r.tema))].map(t => ({ value: t, label: t }));

  const filtered = useMemo(() => {
    return [...reportesRapidos]
      .sort((a, b) => (b.fechaOrden || '').localeCompare(a.fechaOrden || ''))
      .filter(r => {
        const matchSearch = !search || r.titulo.toLowerCase().includes(search.toLowerCase());
        const matchTema = tema === "all" || r.tema === tema;
        return matchSearch && matchTema;
      });
  }, [search, tema]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#0a1628] tracking-tight mb-3">Reportes rápidos</h1>
        <p className="text-lg text-slate-600">Datos puntuales, comparativas y hallazgos concisos</p>
      </motion.div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        className="mb-8"
        filters={[{ key: "tema", value: tema, onChange: setTema, placeholder: "Temática", options: temaOptions }]}
      />

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r, i) => (
            <ReporteCard key={r.id} reporte={r} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400 text-sm">No se encontraron reportes con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
