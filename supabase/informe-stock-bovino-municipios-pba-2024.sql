-- Registro del informe "Los quince municipios con más ganado bovino de la
-- Provincia" (existencias a diciembre de 2024) en la tabla `informes` de
-- Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- Antes de correrlo: verificar que el tema 'Agro' ya exista en la tabla
--   SELECT DISTINCT tema FROM informes ORDER BY 1;

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'stock-bovino-municipios-pba-2024',
  'Los quince municipios con más ganado bovino de la Provincia',
  'El rodeo bonaerense se concentra en el centro y el sudeste y su cúpula no se movió en siete años, pero el total provincial se achica desde 2018. Para los municipios ganaderos, que cobran tasas ligadas al movimiento de hacienda, la contracción es también un dato fiscal.',
  'Septiembre 2026',
  '2026-09-08',
  'Agro',
  '["Provincia de Buenos Aires","Ayacucho","Olavarría","Azul","General Villegas","Villarino"]'::jsonb,
  $$["Ayacucho, Olavarría, Azul y Benito Juárez ocupan los mismos cuatro puestos desde 2017","La Provincia perdió 1,1 millones de cabezas entre diciembre de 2017 y diciembre de 2024","General Villegas subió nueve puestos en el ranking y Villarino perdió un quinto de su stock","Diez de los quince municipios líderes tienen menos hacienda que en 2017","Los quince primeros partidos reúnen el 35,5% del rodeo provincial, la misma proporción que hace siete años"]$$::jsonb,
  '/informes/stock-bovino-municipios-pba-2024',
  NULL,
  true,
  $$["Stock ganadero bovino por municipio, Provincia de Buenos Aires. Existencias a diciembre de cada año, serie diciembre 2017 - diciembre 2024, 135 partidos","Elaboración propia DatosPBA (2026)"]$$::jsonb
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
