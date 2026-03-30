import React from "react";
import { motion } from "framer-motion";
import { datasets } from "../components/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const sortedDatasets = [...datasets].sort((a, b) => (b.fechaOrden || '').localeCompare(a.fechaOrden || ''))

export default function Datos() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#0a1628] tracking-tight mb-3">Base de datos y descargas</h1>
        <p className="text-lg text-slate-600">Datasets abiertos para análisis independiente</p>
      </motion.div>

      {/* Cards para mobile */}
      <div className="sm:hidden space-y-4">
        {sortedDatasets.map((ds, i) => (
          <motion.div
            key={ds.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-200/60 p-5"
          >
            <h3 className="text-base font-semibold text-slate-900 mb-2">{ds.nombre}</h3>
            <p className="text-sm text-slate-500 mb-3">{ds.descripcion}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">{ds.formato}</Badge>
              <Badge variant="outline" className="text-xs">{ds.cobertura}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{ds.variables} variables · {ds.registros?.toLocaleString("es-AR")} registros</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ds.fechaActualizacion}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="gap-1.5 flex-1"><Download className="w-3 h-3" /> Descargar</Button>
              {ds.vizId && (
                <Link to={`/visualizaciones#${ds.vizId}`}>
                  <Button size="sm" variant="ghost" title="Visualizar datos"><BookOpen className="w-3 h-3" /></Button>
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabla para desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="hidden sm:block bg-white rounded-2xl border border-slate-200/60 overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dataset</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Formato</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cobertura</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registros</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actualización</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map(ds => (
              <TableRow key={ds.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{ds.nombre}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ds.descripcion}</p>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{ds.formato}</Badge></TableCell>
                <TableCell className="text-sm text-slate-500">{ds.cobertura}</TableCell>
                <TableCell className="text-sm text-slate-500">{ds.registros?.toLocaleString("es-AR")}</TableCell>
                <TableCell className="text-sm text-slate-500">{ds.fechaActualizacion}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button size="sm" variant="outline" className="gap-1.5 h-8"><Download className="w-3 h-3" /> Descargar</Button>
                    {ds.vizId && (
                      <Link to={`/visualizaciones#${ds.vizId}`}>
                        <Button size="sm" variant="ghost" className="h-8" title="Visualizar datos"><BookOpen className="w-3.5 h-3.5" /></Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
