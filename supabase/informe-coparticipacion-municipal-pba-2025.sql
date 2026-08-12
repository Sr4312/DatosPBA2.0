-- Registro del informe "La coparticipación municipal bonaerense, medida por
-- habitante" (acumulado enero-diciembre 2025) en la tabla `informes` de
-- Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- Antes de correrlo: verificar que el tema 'Fiscal' ya exista en la tabla
--   SELECT DISTINCT tema FROM informes ORDER BY 1;
--
-- `municipios` lleva el alcance provincial y los dos municipios de los extremos
-- del ranking, que son los que el informe nombra en el hero.

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'coparticipacion-municipal-pba-2025',
  'La coparticipación municipal bonaerense, medida por habitante',
  'La coparticipación es la primera restricción fiscal de cualquier intendencia bonaerense y se reparte por coeficientes que no se actualizan con la población. Ver el acumulado 2025 por habitante muestra cuánto puede gastar cada municipio por vecino antes de tocar sus propias tasas.',
  'Agosto 2026',
  '2026-08-12',
  'Fiscal',
  '["Provincia de Buenos Aires","24 partidos del GBA","Puán","Tres de Febrero"]'::jsonb,
  $$["Puán recibió 12,9 veces más coparticipación por habitante que Tres de Febrero durante 2025","Los 24 partidos del GBA reúnen el 61,9% de la población provincial y recibieron el 46,4% de los fondos","Los quince municipios mejor posicionados por habitante tienen menos de 19.000 habitantes","El interior bonaerense cobró $289.590 por habitante, 88% más que el promedio ponderado del conurbano","La Provincia repartió $3,60 billones de coparticipación bruta entre sus 135 municipios en 2025"]$$::jsonb,
  '/informes/coparticipacion-municipal-pba-2025',
  NULL,
  true,
  $$["Ministerio de Economía de la Provincia de Buenos Aires, Dirección Provincial de Coordinación Municipal. Transferencias de Fondos a los Municipios, columna Coparticipación Bruta, acumulado enero-diciembre 2025","Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires. Población total por municipio, Censo Nacional de Población, Hogares y Viviendas 2022","Ley provincial 10.559 y sus modificatorias, régimen de coparticipación municipal","Elaboración propia DatosPBA sobre la base del Ministerio de Economía de la Provincia de Buenos Aires (2026)"]$$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  titulo      = EXCLUDED.titulo,
  bajada      = EXCLUDED.bajada,
  fecha       = EXCLUDED.fecha,
  fecha_orden = EXCLUDED.fecha_orden,
  tema        = EXCLUDED.tema,
  municipios  = EXCLUDED.municipios,
  insights    = EXCLUDED.insights,
  url         = EXCLUDED.url,
  custom      = EXCLUDED.custom,
  fuentes     = EXCLUDED.fuentes;
