import { Link } from 'react-router-dom'

export default function Datos() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-[#0F172A] tracking-tight mb-3">Base de datos y descargas</h1>
        <p className="text-lg text-slate-600">Datasets abiertos para análisis independiente</p>
      </div>

      <div className="border-t-2 border-[#0F172A] pt-6 max-w-read">
        <h2 className="text-subhead text-[#0F172A] mb-2">Los datasets todavía no están disponibles</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Estamos documentando los archivos antes de publicarlos: cada dataset va a incluir
          diccionario de variables, cobertura y fecha de actualización. Mientras tanto, los
          datos de cada informe se pueden descargar desde sus gráficos.
        </p>
        <Link
          to="/informes"
          className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700 no-underline"
        >
          Ir a los informes →
        </Link>
      </div>
    </div>
  )
}
