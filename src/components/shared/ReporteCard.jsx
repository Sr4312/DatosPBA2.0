import Cifra from './Cifra'

export default function ReporteCard({ reporte }) {
  return (
    <div
      className="bg-white border px-5 py-4 flex items-center gap-4"
      style={{ borderColor: 'var(--rule)' }}
    >
      <div className="shrink-0 w-32">
        <Cifra
          size="sm"
          valor={reporte.dato}
          variacion={reporte.variacion}
          polaridad={reporte.polaridad ?? 'neutro'}
        />
      </div>

      <div className="flex-1 min-w-0 border-l pl-4" style={{ borderColor: 'var(--rule)' }}>
        <p className="text-sm font-semibold text-slate-900 leading-snug truncate">{reporte.titulo}</p>
        {reporte.descripcion && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{reporte.descripcion}</p>
        )}
      </div>

      <span className="text-caption text-slate-500 shrink-0 hidden sm:block">{reporte.fecha}</span>
    </div>
  )
}
