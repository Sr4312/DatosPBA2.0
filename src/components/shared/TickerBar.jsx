import Cifra from './Cifra'

export default function TickerBar({ reportes }) {
  if (!reportes.length) return null
  const doubled = [...reportes, ...reportes, ...reportes, ...reportes]
  return (
    <div className="bg-white border-b border-slate-200 overflow-hidden">
      <div className="flex ticker-track" style={{ width: 'max-content' }}>
        {doubled.map((r, i) => (
          <div
            key={i}
            className="px-5 py-2.5 border-r border-slate-100 shrink-0"
            aria-hidden={i >= reportes.length || undefined}
          >
            <Cifra
              size="sm"
              label={r.titulo}
              valor={r.dato}
              variacion={r.variacion}
              polaridad={r.polaridad ?? 'neutro'}
              periodo={r.fecha}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
