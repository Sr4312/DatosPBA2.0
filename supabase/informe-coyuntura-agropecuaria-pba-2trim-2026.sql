-- Registro del informe "Coyuntura agropecuaria bonaerense, segundo trimestre de 2026"
-- en la tabla `informes` de Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- `municipios` lleva solo el total provincial: la fuente no desagrega por partido.

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'coyuntura-agropecuaria-pba-2trim-2026',
  'Coyuntura agropecuaria bonaerense, segundo trimestre de 2026',
  'La Provincia hace más de la mitad de la faena bovina del país. La retención de vientres y la suba de la hacienda que muestran estos datos llegan primero a sus frigoríficos y a la mesa de sus hogares, mientras granos y carnes exportan más dólares.',
  'Septiembre 2026',
  '2026-09-16',
  'Agro',
  '["Provincia de Buenos Aires"]'::jsonb,
  $$["Las exportaciones bonaerenses de cereales y oleaginosas suman 3.904,8 millones de dólares en el primer semestre, 26,9% más que en 2025","El consumo de carne vacuna cae 11,3% y queda por debajo del de carne aviar","La faena bovina provincial baja 9,7% y la porcina sube 10,6% en el segundo trimestre","El novillo corta trece trimestres de subas con un promedio de 4.216 pesos por kilo vivo","China compra el 42,9% de las oleaginosas y el 36,5% de la carne que exporta la Provincia","La intención de siembra de trigo 2026/27 cae 3,4% con los fertilizantes caros"]$$::jsonb,
  '/informes/coyuntura-agropecuaria-pba-2trim-2026',
  NULL,
  true,
  $$["Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires. Coyuntura Agropecuaria, II trimestre 2026, publicado en agosto de 2026","Secretaría de Agricultura, Ganadería y Pesca de la Nación, Estimaciones agrícolas e Indicadores del Sector Bovino","Bolsa de Cereales de Rosario; Bolsa de Cereales y Monitor de Comercio Agropecuario","INDEC, SENASA, CICCRA y Mercado Agroganadero","Elaboración propia DatosPBA sobre la base de la Dirección Provincial de Estadística (2026)"]$$::jsonb
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
