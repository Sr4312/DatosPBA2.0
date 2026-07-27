import { useEffect, useState } from 'react'
import Cifra from './Cifra'

/* Franja de indicadores clave del home, en desplazamiento continuo.
   Cada indicador publica su valor, su variación (coloreada por polaridad),
   su período y su fuente.

   El movimiento se pausa al pasar el mouse y al enfocar con teclado, y se
   apaga por completo con prefers-reduced-motion: en ese caso la franja cae
   a una grilla fija con los primeros indicadores. */

function usePrefiereMenosMovimiento() {
  const [reducir, setReducir] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducir(mq.matches)
    const alCambiar = e => setReducir(e.matches)
    mq.addEventListener('change', alCambiar)
    return () => mq.removeEventListener('change', alCambiar)
  }, [])
  return reducir
}

function Indicador({ reporte }) {
  return (
    <Cifra
      size="sm"
      label={reporte.titulo}
      valor={reporte.dato}
      variacion={reporte.variacion}
      polaridad={reporte.polaridad ?? 'neutro'}
      periodo={reporte.fecha}
      fuente={reporte.fuente}
    />
  )
}

export default function TickerBar({ reportes }) {
  const reducirMovimiento = usePrefiereMenosMovimiento()
  if (!reportes.length) return null

  /* Sin movimiento: grilla fija con los primeros cuatro. */
  if (reducirMovimiento) {
    return (
      <div className="bg-white border-b" style={{ borderColor: 'var(--rule)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {reportes.slice(0, 4).map((r, i) => (
              <div
                key={r.id ?? i}
                className={`py-4 pr-5 ${i > 0 ? 'lg:border-l lg:pl-5' : ''} ${i % 2 === 1 ? 'border-l pl-5 lg:border-l' : ''}`}
                style={{ borderColor: 'var(--rule)' }}
              >
                <Indicador reporte={r} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* Una "vuelta" repite la lista hasta cubrir pantallas anchas; se renderiza
     dos veces y la animación desplaza el 50%, así el bucle no tiene costura.
     La duración crece con la cantidad de ítems para que la velocidad de
     lectura sea siempre la misma. */
  const repeticiones = Math.max(2, Math.ceil(8 / reportes.length))
  const vuelta = Array.from({ length: repeticiones }, () => reportes).flat()
  const duracion = `${vuelta.length * 7}s`

  return (
    <div className="bg-white border-b overflow-hidden" style={{ borderColor: 'var(--rule)' }}>
      <div
        className="flex ticker-track"
        style={{ width: 'max-content', '--ticker-duracion': duracion }}
      >
        {[...vuelta, ...vuelta].map((r, i) => (
          <div
            key={i}
            className="w-60 shrink-0 px-5 py-4 border-r"
            style={{ borderColor: 'var(--rule)' }}
            /* Solo la primera pasada de la lista se anuncia: todo lo que
               sigue son copias para llenar la pantalla y cerrar el bucle. */
            aria-hidden={i >= reportes.length || undefined}
          >
            <Indicador reporte={r} />
          </div>
        ))}
      </div>
    </div>
  )
}
