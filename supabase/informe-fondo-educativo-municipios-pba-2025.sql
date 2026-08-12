-- Registro del informe "El Fondo Educativo en los municipios bonaerenses,
-- medido por habitante" (acumulado enero-diciembre 2025) en la tabla `informes`
-- de Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- Antes de correrlo: verificar que el tema 'Fiscal' ya exista en la tabla
--   SELECT DISTINCT tema FROM informes ORDER BY 1;
--
-- Es el segundo informe de la serie de transferencias provinciales a
-- municipios. El primero es 'coparticipacion-municipal-pba-2025', al que esta
-- página enlaza en el footer: conviene que ya esté cargado.

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'fondo-educativo-municipios-pba-2025',
  'El Fondo Educativo en los municipios bonaerenses, medido por habitante',
  'El Fondo de Financiamiento Educativo es el segundo instrumento de transferencia de la Provincia a sus municipios y se reparte con criterios propios, distintos a los de la coparticipación. Medirlo por habitante permite ver si esos criterios corrigen o repiten la asimetría territorial del régimen histórico.',
  'Agosto 2026',
  '2026-08-12',
  'Fiscal',
  '["Provincia de Buenos Aires","24 partidos del GBA","Pila","Vicente López"]'::jsonb,
  $$["Los quince municipios con más Fondo Educativo por habitante son del interior y los quince últimos son del conurbano","Pila recibió 12,2 veces más Fondo Educativo por habitante que Vicente López durante 2025","El GBA reúne el 61,9% de la población provincial y recibió el 49,3% del Fondo Educativo","El interior bonaerense cobró $33.753 por habitante, 67% más que el promedio ponderado del conurbano","El Fondo Educativo equivale al 12,3% de lo que la Provincia repartió por coparticipación bruta en 2025"]$$::jsonb,
  '/informes/fondo-educativo-municipios-pba-2025',
  NULL,
  true,
  $$["Ministerio de Economía de la Provincia de Buenos Aires, Dirección Provincial de Coordinación Municipal. Transferencias de Fondos a los Municipios, columna Fondo de Financ. Educativo, acumulado enero-diciembre 2025","Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires. Población total por municipio, Censo Nacional de Población, Hogares y Viviendas 2022","DatosPBA (2026). La coparticipación municipal bonaerense, medida por habitante","Elaboración propia DatosPBA sobre la base del Ministerio de Economía de la Provincia de Buenos Aires (2026)"]$$::jsonb
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
