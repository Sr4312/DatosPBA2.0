/* Registro estático de los informes con página propia (flag `custom` en la DB).
   Es la fuente de verdad en build time para: meta/OG por informe, sitemap.xml,
   feed RSS y el título del documento en navegación SPA.

   Al publicar un informe nuevo con página JSX propia, agregá su entrada acá
   (la ruta debe coincidir con la de src/App.jsx). Los informes no-custom se
   renderizan vía /informes/:id desde Supabase y no se listan acá. */

export const SITE_URL = 'https://www.datospba.com'
export const SITE_NAME = 'DatosPBA'
export const SITE_DESC =
  'Publicación independiente de periodismo de datos sobre la Provincia de Buenos Aires. Cada cifra publica su fuente, su período y su metodología.'

export const INFORMES = [
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
    titulo: 'La industria manufacturera bonaerense rebotó 13,2% en marzo',
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
      'Buenos Aires mueve 50 millones de toneladas de minerales por año —la mitad del cemento nacional— sin política sectorial ni visibilidad pública.',
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
  { path: '/', titulo: 'DatosPBA — Periodismo de datos sobre la provincia de Buenos Aires' },
  { path: '/informes', titulo: 'Informes — DatosPBA' },
  { path: '/hilos', titulo: 'Publicaciones — DatosPBA' },
  { path: '/reportes', titulo: 'Reportes rápidos — DatosPBA' },
  { path: '/datos', titulo: 'Base de datos y descargas — DatosPBA' },
  { path: '/quienes-somos', titulo: 'Qué es DatosPBA — DatosPBA' },
  { path: '/metodologia', titulo: 'Metodología — DatosPBA' },
  { path: '/beta', titulo: 'Buscador — DatosPBA' },
]
