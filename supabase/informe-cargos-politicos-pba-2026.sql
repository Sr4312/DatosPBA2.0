-- Registro del informe "Los cargos políticos y directivos del Ejecutivo bonaerense"
-- en la tabla `informes` de Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- Antes de correrlo: verificar que el tema 'Estado' ya exista en la tabla
--   SELECT DISTINCT tema FROM informes ORDER BY 1;
-- y usar el valor existente si la administración pública está categorizada con
-- otro nombre.
--
-- `municipios` lleva 'Provincia de Buenos Aires': el universo del informe es el
-- Poder Ejecutivo provincial, no una lista de partidos.

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'cargos-politicos-pba-2026',
  'Los cargos políticos y directivos del Ejecutivo bonaerense',
  'El Mapa del Estado es el organigrama más detallado que la Provincia publica de su propio Poder Ejecutivo. Sirve para dimensionar la estructura, y muestra hasta dónde llega el dato sobre quiénes la conducen.',
  'Agosto 2026',
  '2026-08-11',
  'Estado',
  '["Provincia de Buenos Aires"]'::jsonb,
  $$["El Poder Ejecutivo bonaerense tiene 3.353 cargos directivos repartidos en 48 jurisdicciones y organismos","El Ministerio de Seguridad concentra 352 cargos, más que las veinte instituciones más chicas juntas","875 unidades organizativas figuran sin autoridad identificada por nombre en la fuente oficial","298 personas ocupan más de un cargo y reúnen 603 de las designaciones relevadas","Entre las autoridades identificadas hay 1.328 varones y 1.150 mujeres"]$$::jsonb,
  '/informes/cargos-politicos-pba-2026',
  NULL,
  true,
  $$["Gobierno de la Provincia de Buenos Aires. Mapa del Estado, sección Jurisdicciones (mapadelestado.gba.gob.ar/jurisdicciones), consultada el 10 de agosto de 2026","Gobierno de la Provincia de Buenos Aires. Mapa del Estado, sección Organismos (mapadelestado.gba.gob.ar/organismos), consultada el 10 de agosto de 2026","Mapa del Estado. Planillas de detalle por jurisdicción y organismo (48 archivos), exportadas el 10 de agosto de 2026","Elaboración propia DatosPBA sobre la base del Mapa del Estado (2026)"]$$::jsonb
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
