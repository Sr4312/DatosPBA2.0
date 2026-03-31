import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { reportesRapidos } from "../components/data/mockData";
import ReporteCard from "../components/shared/ReporteCard";

function TickerBar({ reportes }) {
  const doubled = [...reportes, ...reportes, ...reportes, ...reportes];
  return (
    <div className="bg-white border-b border-slate-200 overflow-hidden">
      <div className="flex ticker-track" style={{ width: "max-content" }}>
        {doubled.map((r, i) => {
          const isUp = r.tendencia === "sube";
          const isDown = r.tendencia === "baja";
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 border-r border-slate-100 shrink-0"
            >
              <div
                className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                  isUp ? "bg-green-50" : isDown ? "bg-red-50" : "bg-slate-50"
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : isDown ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <Minus className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">
                    {r.titulo}
                  </span>
                  <span className="text-[10px] text-slate-400">{r.fecha}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0a1628]">{r.dato}</span>
                  {r.variacion && (
                    <span
                      className={`text-xs font-medium ${
                        isUp
                          ? "text-green-600"
                          : isDown
                          ? "text-red-500"
                          : "text-slate-400"
                      }`}
                    >
                      {r.variacion}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReportesRapidos() {
  const sorted = useMemo(
    () =>
      [...reportesRapidos].sort((a, b) =>
        (b.fechaOrden || "").localeCompare(a.fechaOrden || "")
      ),
    []
  );

  return (
    <div>
      <TickerBar reportes={sorted} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-[#0a1628] tracking-tight mb-3">
            Reportes rápidos
          </h1>
          <p className="text-lg text-slate-600">
            Datos puntuales, comparativas y hallazgos concisos
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {sorted.map((r, i) => (
            <ReporteCard key={r.id} reporte={r} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
