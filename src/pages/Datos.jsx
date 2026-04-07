import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { datasets } from '../components/data/mockData'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, BarChart2, Calendar, X } from 'lucide-react'

const sortedDatasets = [...datasets].sort((a, b) => (b.fechaOrden || '').localeCompare(a.fechaOrden || ''))

function PreviewModal({ ds, onClose }) {
  if (!ds) return null
  const { preview } = ds

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Vista previa del dataset</p>
            <h2 className="text-lg font-bold text-[#0a1628] leading-tight">{ds.nombre}</h2>
            <p className="text-xs text-slate-400 mt-1">Mostrando las primeras {preview.rows.length} filas · {ds.registros?.toLocaleString('es-AR')} registros totales</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
              <tr>
                {preview.columns.map(col => (
                  <th key={col} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 text-slate-700 whitespace-nowrap border-b border-slate-100 last:border-0">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50">
          <p className="text-xs text-slate-400">{ds.formato} · {ds.variables} variables · Actualizado {ds.fechaActualizacion}</p>
          <Button size="sm" variant="outline" className="gap-1.5 h-8 shrink-0">
            <Download className="w-3 h-3" /> Descargar completo
          </Button>
        </div>
      </m.div>
    </div>
  )
}

export default function Datos() {
  const [preview, setPreview] = useState(null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#0a1628] tracking-tight mb-3">Base de datos y descargas</h1>
        <p className="text-lg text-slate-600">Datasets abiertos para análisis independiente</p>
      </m.div>

      {/* Cards para mobile */}
      <div className="sm:hidden space-y-4">
        {sortedDatasets.map((ds, i) => (
          <m.div
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
              <span>{ds.variables} variables · {ds.registros?.toLocaleString('es-AR')} registros</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ds.fechaActualizacion}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="gap-1.5 flex-1"><Download className="w-3 h-3" /> Descargar</Button>
              {ds.preview && (
                <Button size="sm" variant="ghost" onClick={() => setPreview(ds)} title="Visualizar datos">
                  <BarChart2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </m.div>
        ))}
      </div>

      {/* Tabla para desktop */}
      <m.div
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
            {sortedDatasets.map(ds => (
              <TableRow key={ds.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{ds.nombre}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ds.descripcion}</p>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{ds.formato}</Badge></TableCell>
                <TableCell className="text-sm text-slate-500">{ds.cobertura}</TableCell>
                <TableCell className="text-sm text-slate-500">{ds.registros?.toLocaleString('es-AR')}</TableCell>
                <TableCell className="text-sm text-slate-500">{ds.fechaActualizacion}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button size="sm" variant="outline" className="gap-1.5 h-8"><Download className="w-3 h-3" /> Descargar</Button>
                    {ds.preview && (
                      <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={() => setPreview(ds)}>
                        <BarChart2 className="w-3.5 h-3.5" /> Visualizar datos
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </m.div>

      <AnimatePresence>
        {preview && <PreviewModal ds={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </div>
  )
}
