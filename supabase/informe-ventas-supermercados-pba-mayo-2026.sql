-- Registro del informe "Ventas en supermercados de la Provincia de Buenos Aires"
-- (datos de mayo de 2026) en la tabla `informes` de Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- Antes de correrlo: verificar que el tema 'Economía' ya exista en la tabla
--   SELECT DISTINCT tema FROM informes ORDER BY 1;
--
-- Es un informe de serie mensual: si más adelante se publica el dato de junio,
-- va como un `id` nuevo (ventas-supermercados-pba-junio-2026), no pisando este.
--
-- `municipios` lleva las dos regiones del recorte, no los partidos: la fuente
-- no desagrega por municipio.

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'ventas-supermercados-pba-mayo-2026',
  'Ventas en supermercados de la Provincia de Buenos Aires',
  'La Encuesta de supermercados es el indicador de consumo masivo que se publica con más frecuencia y con apertura entre el conurbano y el interior. Sirve para ver, mes a mes, cuánto de la facturación es volumen y cuánto es precio.',
  'Agosto 2026',
  '2026-08-11',
  'Economía',
  '["Provincia de Buenos Aires","24 partidos del GBA"]'::jsonb,
  $$["Los supermercados bonaerenses vendieron 3,4% menos en volumen en mayo de 2026 pese a facturar 25,0% más","Los 24 partidos del GBA no anotan una suba real de ventas desde mayo de 2025","El resto de la Provincia creció 2,3% en volumen y cortó cuatro meses de caídas","El conurbano explica el 92% de la caída del volumen provincial acumulada en el año","La Provincia perdió un punto de participación en el volumen vendido del país en doce meses"]$$::jsonb,
  '/informes/ventas-supermercados-pba-mayo-2026',
  NULL,
  true,
  $$["Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires. Ventas en Supermercados de la Provincia de Buenos Aires, datos de mayo de 2026, publicado en julio de 2026","Encuesta de supermercados, Instituto Nacional de Estadística y Censos (INDEC)","Índice de Precios al Consumidor (IPC) del INDEC, utilizado como deflactor de las series a precios constantes con base diciembre de 2016","Elaboración propia DatosPBA sobre la base de la Dirección Provincial de Estadística (2026)"]$$::jsonb
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
