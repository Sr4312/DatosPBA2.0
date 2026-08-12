/* Registro estático de los informes con página propia (flag `custom` en la DB).
   Es la fuente de verdad en build time para: meta/OG por informe, sitemap.xml,
   feed RSS y el título del documento en navegación SPA.

   Al publicar un informe nuevo con página JSX propia, agregá su entrada acá
   (la ruta debe coincidir con la de src/App.jsx). Los informes no-custom se
   renderizan vía /informes/:id desde Supabase y no se listan acá. */

export const SITE_URL = 'https://www.datospba.com'
export const SITE_NAME = 'DatosPBA'
export const SITE_DESC =
  'Publicación independiente sobre la Provincia de Buenos Aires. Cada cifra publica su fuente, su período y su metodología.'

export const INFORMES = [
  {
    path: '/informes/fondo-educativo-municipios-pba-2025',
    titulo: 'El Fondo Educativo en los municipios bonaerenses, medido por habitante',
    descripcion:
      'La Provincia repartió $444.611 millones de Fondo Educativo en 2025. Los quince municipios que más reciben por habitante son del interior y los quince que menos reciben son del conurbano.',
    tema: 'Fiscal',
    fecha: '2026-08-12',
  },
  {
    path: '/informes/coparticipacion-municipal-pba-2025',
    titulo: 'La coparticipación municipal bonaerense, medida por habitante',
    descripcion:
      'La Provincia repartió $3,60 billones entre sus 135 municipios en 2025. Puán recibió $1.280.240 por habitante y Tres de Febrero $99.225, con el mismo régimen de coeficientes.',
    tema: 'Fiscal',
    fecha: '2026-08-12',
  },
  {
    path: '/informes/isim-pba-abril-2026',
    titulo: 'La industria manufacturera bonaerense en abril de 2026',
    descripcion:
      'El ISIM-PBA creció 2,5% interanual en abril, tras el 13,5% de marzo. Productos químicos aportó 4,66 puntos: sin ese bloque el indicador habría cerrado en baja.',
    tema: 'Industria',
    fecha: '2026-08-11',
  },
  {
    path: '/informes/ventas-supermercados-pba-mayo-2026',
    titulo: 'Ventas en supermercados de la Provincia de Buenos Aires',
    descripcion:
      'En mayo de 2026 los supermercados bonaerenses facturaron 25,0% más que un año atrás y vendieron 3,4% menos en volumen. El resto de la Provincia creció 2,3% y el conurbano cayó 6,0%.',
    tema: 'Economía',
    fecha: '2026-08-11',
  },
  {
    path: '/informes/cargos-politicos-pba-2026',
    titulo: 'Los cargos políticos y directivos del Ejecutivo bonaerense',
    descripcion:
      'El Mapa del Estado provincial permite contar 3.353 cargos directivos en 48 jurisdicciones y organismos. El Ministerio de Seguridad tiene 352 y una de cada cuatro unidades no publica quién la conduce.',
    tema: 'Estado',
    fecha: '2026-08-11',
  },
  {
    path: '/informes/empleo-privado-135-municipios-2025',
    titulo: 'El empleo privado en los 135 municipios bonaerenses',
    descripcion:
      'El empleo asalariado privado de la Provincia cerró 2025 en 2.013.084 puestos, 2,8% debajo del máximo de enero de 2024. En el último bienio 84 de los 135 municipios perdieron puestos.',
    tema: 'Trabajo',
    fecha: '2026-08-07',
  },
  {
    path: '/informes/empleo-industrial-conurbano-2025',
    titulo: 'Empleo industrial en los municipios del Conurbano',
    descripcion:
      'El Conurbano tenía 339.110 puestos industriales formales en junio de 2025, 2,3% menos que en 2019. Ocho municipios ganaron empleo en el último año, pero reúnen apenas el 23% de los puestos.',
    tema: 'Trabajo',
    fecha: '2026-08-05',
  },
  {
    path: '/informes/empleo-privado-gba-2025',
    titulo: 'Empleo asalariado privado en los partidos del GBA',
    descripcion:
      'El empleo privado registrado cayó 3,1% en los 40 partidos del GBA entre diciembre de 2023 y diciembre de 2025. Solo 7 partidos sumaron puestos; Ensenada perdió 18,9%.',
    tema: 'Trabajo',
    fecha: '2026-08-04',
  },
  {
    path: '/informes/planta-ocupada-provincial-2024',
    titulo: 'La planta ocupada del Estado bonaerense, de 2000 a 2024',
    descripcion:
      'El sector público provincial pasó de 428.408 a 657.328 agentes en veinticuatro años. Creció menos que Córdoba y, medido por habitante, emplea menos que Mendoza y Santa Fe.',
    tema: 'Estado',
    fecha: '2026-07-28',
  },
  {
    path: '/informes/pbg-pba-2025',
    titulo: 'Producto Bruto Geográfico de la Provincia de Buenos Aires',
    descripcion:
      'La economía bonaerense creció 4,2% a precios constantes en 2025, el segundo mejor registro de la serie 2004-2025, tras dos años consecutivos de caída.',
    tema: 'Economía',
    fecha: '2026-07-22',
  },
  {
    path: '/informes/mercado-trabajo-gba-2026',
    titulo: 'Mercado de trabajo en los partidos del GBA',
    descripcion:
      'La desocupación del conurbano se mantuvo en 9,7% en el primer trimestre de 2026, pero con menos actividad, menos empleo y un salto de la subocupación horaria.',
    tema: 'Trabajo',
    fecha: '2026-07-22',
  },
  {
    path: '/informes/industria-manufacturera-pba-2026',
    titulo: 'La industria manufacturera bonaerense rebotó 13,5% en marzo',
    descripcion:
      'El ISIM-PBA marcó en marzo su mayor suba interanual reciente para ese mes. Nueve de once bloques crecieron, sobre una base de comparación baja.',
    tema: 'Industria',
    fecha: '2026-07-21',
  },
  {
    path: '/informes/indice-fada-pba-2026',
    titulo: 'El Estado se queda con el 59% de la renta agrícola bonaerense',
    descripcion:
      'Según el Índice FADA de junio de 2026, casi el 90% de los impuestos que pesan sobre una hectárea agrícola bonaerense los recauda la Nación.',
    tema: 'Agro',
    fecha: '2026-07-14',
  },
  {
    path: '/informes/presupuesto-genero-pba-2026',
    titulo: 'El maquillaje contable del Presupuesto de Género',
    descripcion:
      'La Provincia presenta un Presupuesto con Perspectiva de Género de $1,79 billones, pero solo el 0,82% del presupuesto corresponde a políticas focalizadas.',
    tema: 'Presupuesto',
    fecha: '2026-06-29',
  },
  {
    path: '/informes/ranking-fiscal-provincial-2025',
    titulo: 'El regreso del déficit subnacional',
    descripcion:
      'Por primera vez en 25 años la Nación registra superávit mientras el conjunto de las provincias presenta déficit. Dónde queda Buenos Aires en el ranking fiscal.',
    tema: 'Fiscal',
    fecha: '2026-06-23',
  },
  {
    path: '/informes/homicidios-pba-2025',
    titulo: 'Homicidios dolosos en la Provincia de Buenos Aires',
    descripcion:
      'Las estadísticas del Ministerio Público muestran que la violencia letal se concentra en el conurbano, con La Matanza como el caso más crítico de la provincia.',
    tema: 'Seguridad',
    fecha: '2026-05-23',
  },
  {
    path: '/informes/empleo-publico-pba-2026',
    titulo: 'El empleo público bonaerense en perspectiva internacional',
    descripcion:
      'Cuántos empleados públicos tiene la Provincia comparada con jurisdicciones de escala similar, con funciones equivalentes y datos verificables en fuentes primarias.',
    tema: 'Estado',
    fecha: '2026-05-20',
  },
  {
    path: '/informes/mineria-pba-2025',
    titulo: 'La minería que nadie mira en Buenos Aires',
    descripcion:
      'Buenos Aires mueve 50 millones de toneladas de minerales por año -la mitad del cemento nacional- sin política sectorial ni visibilidad pública.',
    tema: 'Producción',
    fecha: '2026-05-11',
  },
  {
    path: '/informes/medicamentos-tish-pba-2025',
    titulo: 'El precio de vivir en el municipio equivocado',
    descripcion:
      'La TISH grava los medicamentos de manera radicalmente distinta según el municipio: Pilar lidera con 3,73% sobre el precio final, casi el triple que Bahía Blanca.',
    tema: 'Fiscal',
    fecha: '2026-05-11',
  },
  {
    path: '/informes/agroindustria-pba-2026',
    titulo: 'La agroindustria en la Provincia de Buenos Aires',
    descripcion:
      'Buenos Aires concentra el 26% de la producción agroindustrial nacional y el 35% de las exportaciones del país: peso productivo, desafíos y políticas.',
    tema: 'Agro',
    fecha: '2026-05-11',
  },
  {
    path: '/informes/salud-conurbano-pec-2026',
    titulo: 'La salud que se gestiona y la que se desborda',
    descripcion:
      'En el conurbano, 4,1 millones de personas dependen exclusivamente del sistema público de salud: 1.088 establecimientos para atenderlas, con cargas muy desiguales.',
    tema: 'Salud',
    fecha: '2026-04-30',
  },
  {
    path: '/informes/renabap-pba-2026',
    titulo: 'Los otros Buenos Aires: 2.327 barrios populares',
    descripcion:
      'Más de 2,5 millones de personas viven en barrios populares bonaerenses. Solo el 4% tiene cloaca de red y el 98% de los hogares no tiene título de propiedad.',
    tema: 'Hábitat',
    fecha: '2026-04-20',
  },
  {
    path: '/informes/caf-estado-municipal-pba',
    titulo: 'Dos Buenos Aires: el estado que trabaja y el estado que pesa',
    descripcion:
      'El Atlas de CAF revela una brecha de hasta 9 veces en el porcentaje de empleo en administración pública entre municipios bonaerenses.',
    tema: 'Estado',
    fecha: '2026-04-07',
  },
  {
    path: '/informes/kpmg-iibb-2025',
    titulo: 'El peso fiscal que encarece cada precio',
    descripcion:
      'El Impuesto sobre los Ingresos Brutos lidera los gravámenes que encarecen los precios en la Argentina, según la encuesta de KPMG a empresas medianas y grandes.',
    tema: 'Fiscal',
    fecha: '2026-04-07',
  },
]

/* Rutas estáticas del sitio (para sitemap y títulos de documento). */
export const RUTAS_ESTATICAS = [
  { path: '/', titulo: 'DatosPBA - Información sobre la Provincia de Buenos Aires' },
  { path: '/informes', titulo: 'Informes - DatosPBA' },
  { path: '/hilos', titulo: 'Publicaciones - DatosPBA' },
  { path: '/reportes', titulo: 'Reportes rápidos - DatosPBA' },
  { path: '/datos', titulo: 'Base de datos y descargas - DatosPBA' },
  { path: '/quienes-somos', titulo: 'Qué es DatosPBA - DatosPBA' },
  { path: '/metodologia', titulo: 'Metodología - DatosPBA' },
  { path: '/beta', titulo: 'Buscador - DatosPBA' },
]
