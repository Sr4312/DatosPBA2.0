-- Registro del informe "Delito en la Provincia de Buenos Aires, 2025"
-- en la tabla `informes` de Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'delito-snic-pba-2025',
  'Delito en la Provincia de Buenos Aires, 2025',
  'El Conurbano tiene el 62% de la población y concentra el 77% de los homicidios. Con los datos oficiales del SNIC, partido por partido, el informe muestra dónde se sostiene la violencia letal y qué comparaciones siguen siendo válidas después del cambio de registro de 2025.',
  'Septiembre 2026',
  '2026-09-28',
  'Seguridad',
  '["Conurbano","Almirante Brown","Avellaneda","Berazategui","Esteban Echeverría","Ezeiza","Florencio Varela","General San Martín","Hurlingham","Ituzaingó","José C. Paz","La Matanza","Lanús","Lomas de Zamora","Malvinas Argentinas","Merlo","Moreno","Morón","Quilmes","San Fernando","San Isidro","San Miguel","Tigre","Tres de Febrero","Vicente López","Provincia de Buenos Aires"]'::jsonb,
  $$["Los homicidios bajan 16,4% en el interior bonaerense y apenas 1,6% en el Conurbano","La tasa de homicidios del Conurbano duplica la del resto de la provincia","General San Martín, Moreno, José C. Paz y La Matanza superan los 8 homicidios cada 100.000 habitantes","La Matanza aporta 149 de las 597 víctimas de homicidio del Conurbano","Tres categorías del SNIC pierden más del 90% de sus registros tras el cambio de carga de la Provincia","Las muertes viales son tres veces más frecuentes en el interior que en el Conurbano"]$$::jsonb,
  '/informes/delito-snic-pba-2025',
  NULL,
  true,
  $$["Ministerio de Seguridad Nacional, Dirección Nacional de Estadística Criminal. Informe SNIC-SAT 2025, Provincia de Buenos Aires, publicado en septiembre de 2026","INDEC, proyecciones de población basadas en el Censo 2022","Límites de partidos: repositorio departamentos_argentina","Elaboración propia DatosPBA sobre la base del SNIC (2026)"]$$::jsonb
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
