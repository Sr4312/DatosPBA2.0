-- Registro del informe "Exportaciones de la Provincia de Buenos Aires"
-- (datos de junio de 2026) en la tabla `informes` de Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- Es un informe de serie mensual: si más adelante se publica el dato de julio,
-- va como un `id` nuevo (exportaciones-pba-julio-2026), no pisando este.
--
-- `municipios` lleva solo el total provincial: la fuente no desagrega por partido.

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'exportaciones-pba-junio-2026',
  'Exportaciones de la Provincia de Buenos Aires',
  'En junio de 2026 la Provincia exportó 2.709 millones de dólares, 3,1% más que un año atrás, y acumuló 15.748 millones en el primer semestre, 8,6% por encima de 2025. Combustibles y Energía traccionó el mes; Productos Primarios, el semestre.',
  'Agosto 2026',
  '2026-08-13',
  'Economía',
  '["Provincia de Buenos Aires"]'::jsonb,
  $$["La Provincia exportó 2.709 millones de dólares en junio de 2026, el segundo mejor junio de los últimos cinco años","El primer semestre sumó 15.748 millones de dólares, 8,6% más que en 2025, pero la Nación creció 24,4% en el mismo período","Combustibles y Energía fue el rubro más dinámico del mes: creció 57,5% interanual y ya explica el 14,3% de la canasta exportadora","Las Manufacturas de Origen Agropecuario cayeron 15,1% en junio y 16,1% en el semestre, y perdieron casi siete puntos de estructura","El MERCOSUR concentró el 29,3% de las exportaciones del semestre, con Brasil explicando el 64,7% de las ventas a países limítrofes"]$$::jsonb,
  '/informes/exportaciones-pba-junio-2026',
  NULL,
  true,
  $$["Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires. Exportaciones de la Provincia de Buenos Aires, datos de junio de 2026, publicado en agosto de 2026","Instituto Nacional de Estadística y Censos (INDEC), datos preliminares de comercio exterior","Ministerio de Economía de Brasil, para los datos de importaciones brasileñas citados en el informe original","Elaboración propia DatosPBA sobre la base de la Dirección Provincial de Estadística (2026)"]$$::jsonb
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
