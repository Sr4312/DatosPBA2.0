import { Link } from 'react-router-dom'
import { VALORACION_HEX } from '@/lib/variacion'

const SECCIONES = [
  {
    id: 'fuentes',
    titulo: 'De dónde salen los datos',
    cuerpo: [
      'Trabajamos exclusivamente con fuentes citables: microdatos y cuadros del INDEC (EPH, Censo 2022), estadísticas provinciales (Dirección Provincial de Estadística, ministerios), presupuestos ejecutados, organismos públicos nacionales y provinciales, e informes sectoriales de instituciones identificadas (CAF, ASAP, FADA, KPMG, universidades).',
      'Cada gráfico publica su ficha técnica: fuente, período, universo y unidad. Cuando un dato es una estimación de terceros o tiene cobertura parcial, lo decimos en el propio informe.',
    ],
  },
  {
    id: 'color',
    titulo: 'Qué significa el color de una cifra',
    cuerpo: [
      'El color nunca indica si un número subió o bajó: indica si ese movimiento es una buena o una mala noticia para el indicador. Una suba del empleo y una baja de la desocupación se pintan igual, porque ambas son mejoras.',
      'Para eso cada indicador declara su polaridad — si un valor mayor es mejor, peor o neutro — y el color se deriva de la polaridad y del signo de la variación. Los indicadores sin dirección deseable clara (composiciones, totales de referencia) quedan en gris neutro.',
      'Además del color, toda variación lleva flecha y texto: ningún significado depende solo del color.',
    ],
  },
  {
    id: 'precision',
    titulo: 'Precisión estadística',
    cuerpo: [
      'Cuando trabajamos con encuestas por muestreo (como la EPH) reportamos el coeficiente de variación de las estimaciones centrales y aplicamos el criterio del INDEC: las estimaciones con CV mayor al 16% se tratan con cautela y se señalan como tales.',
      'No atribuimos causalidad cuando los datos no la permiten. Si un movimiento admite más de una lectura, publicamos las lecturas posibles, no la más conveniente.',
    ],
  },
  {
    id: 'correcciones',
    titulo: 'Errores y correcciones',
    cuerpo: [
      'Si encontrás un error en una cifra, una fuente o un cálculo, escribinos a contacto@datospba.com. Las correcciones se aplican sobre el informe publicado y se dejan asentadas en el propio texto.',
    ],
  },
]

export default function Metodologia() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12 max-w-read">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0F172A] tracking-tight mb-5 leading-tight">
          Metodología
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Cómo elegimos las fuentes, cómo procesamos los datos y qué reglas siguen
          las cifras que publicamos.
        </p>
      </div>

      <div className="max-w-read border-t-2 border-[#0F172A]">
        {SECCIONES.map(s => (
          <section key={s.id} id={s.id} className="py-8 border-b" style={{ borderColor: 'var(--rule)' }}>
            <h2 className="text-subhead font-bold text-[#0F172A] mb-3">{s.titulo}</h2>
            {s.cuerpo.map((p, i) => (
              <p key={i} className="text-base text-slate-600 leading-relaxed mb-3 last:mb-0">{p}</p>
            ))}

            {s.id === 'color' && (
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { color: VALORACION_HEX.better.text, texto: 'Mejora del indicador, según su polaridad' },
                  { color: VALORACION_HEX.worse.text, texto: 'Deterioro del indicador, según su polaridad' },
                  { color: VALORACION_HEX.neutral.text, texto: 'Sin dirección deseable definida' },
                ].map(item => (
                  <div key={item.texto} className="flex items-center gap-3">
                    <span className="w-3 h-3 shrink-0" style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <span className="text-sm text-slate-600">{item.texto}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <p className="max-w-read text-sm text-slate-500 mt-8">
        La nota metodológica de cada informe amplía estos criterios para su caso puntual.{' '}
        <Link to="/informes" className="font-semibold text-[#0F172A] underline underline-offset-4">
          Ver los informes →
        </Link>
      </p>
    </div>
  )
}
