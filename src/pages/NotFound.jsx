import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
      <div className="max-w-read border-t-2 border-[#0F172A] pt-6">
        <p className="text-label font-semibold uppercase tracking-wider text-slate-500 mb-2">Error 404</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight mb-4">
          Esta página no existe
        </h1>
        <p className="text-base text-slate-600 leading-relaxed mb-6">
          La dirección puede estar mal escrita o el contenido pudo haberse movido.
          Si llegaste acá desde un link de este sitio, avisanos a contacto@datospba.com.
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <Link to="/" className="text-sm font-semibold text-[#0F172A] underline underline-offset-4">
            Ir a la portada
          </Link>
          <Link to="/informes" className="text-sm font-semibold text-[#0F172A] underline underline-offset-4">
            Ver los informes
          </Link>
        </div>
      </div>
    </div>
  )
}
