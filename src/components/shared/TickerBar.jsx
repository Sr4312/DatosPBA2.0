import Cifra from './Cifra'

/* Franja de indicadores clave: grilla fija, sin desplazamiento automático.
   Cada indicador publica su valor, variación (coloreada por polaridad),
   período y fuente. Muestra los 4 reportes más recientes. */
export default function TickerBar({ reportes }) {
  if (!reportes.length) return null
  const visibles = reportes.slice(0, 4)
  return (
    <div className="bg-white border-b" style={{ borderColor: 'var(--rule)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {visibles.map((r, i) => (
            <div
              key={r.id ?? i}
              className={`py-4 pr-5 ${i > 0 ? 'lg:border-l lg:pl-5' : ''} ${i % 2 === 1 ? 'border-l pl-5 lg:border-l' : ''}`}
              style={{ borderColor: 'var(--rule)' }}
            >
              <Cifra
                size="sm"
                label={r.titulo}
                valor={r.dato}
                variacion={r.variacion}
                polaridad={r.polaridad ?? 'neutro'}
                periodo={r.fecha}
                fuente={r.fuente}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
