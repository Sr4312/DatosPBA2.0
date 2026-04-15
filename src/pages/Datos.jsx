import { m } from 'framer-motion'
import { Download } from 'lucide-react'


export default function Datos() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#0a1628] tracking-tight mb-3">Base de datos y descargas</h1>
        <p className="text-lg text-slate-600">Datasets abiertos para análisis independiente</p>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
          <Download className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-[0.2em] mb-3">Próximamente</p>
        <h2 className="text-2xl font-bold text-[#0a1628] mb-3">Datasets en preparación</h2>
        <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
          Estamos preparando los datasets para su descarga. Pronto vas a poder acceder a los datos abiertos de forma directa desde acá.
        </p>
      </m.div>
    </div>
  )
}
