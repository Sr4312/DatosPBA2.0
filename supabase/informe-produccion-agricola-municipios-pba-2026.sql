-- Registro del informe "Producción agrícola en la Provincia de Buenos Aires"
-- (top 15 municipios productores por cultivo) en la tabla `informes` de Supabase.
-- Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- `municipios` lleva los que encabezan algún ranking de cultivo: son los que
-- tiene sentido que matcheen en el buscador por municipio.

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'produccion-agricola-municipios-pba-2026',
  'Producción agrícola en la Provincia de Buenos Aires',
  'Quince campañas de soja, maíz, trigo, cebada, girasol, avena y sorgo en los 135 municipios bonaerenses, ordenadas por producción acumulada. Los cultivos de verano mandan en el noroeste y los de invierno en el sudeste, un patrón que no se movió en todo el período.',
  'Agosto 2026',
  '2026-08-15',
  'Agro',
  $$["General Villegas","Tres Arroyos","Coronel Dorrego","Necochea","Tornquist","Adolfo Alsina","Pergamino","Lobería","Trenque Lauquen","Guaminí"]$$::jsonb,
  $$["General Villegas encabeza los dos grandes cultivos de verano: 11,2 millones de toneladas de soja (4,78% provincial) y 10,8 millones de maíz (5,68%)","Tres Arroyos lidera el trigo con 6,4 millones de toneladas acumuladas, el 5,49% del total provincial","Coronel Dorrego concentra el 26,1% del trigo candeal bonaerense en un solo municipio: solo 58 de los 135 partidos registran producción de candeal","La soja de segunda ocupación tiene otra geografía que la de primera: la lideran Lobería, Necochea y Tandil, partidos del sudeste con rotación trigo-soja","El girasol es el cultivo más concentrado sobre ventana completa: su top 15 explica el 60,96% de la producción provincial, contra 42,77% en trigo","La cebada se mide sobre 10 campañas y no 15: la fuente dejó de publicar la apertura cervecera/forrajera desde 2016/17"]$$::jsonb,
  '/informes/produccion-agricola-municipios-pba-2026',
  NULL,
  true,
  $$["Ministerio de Economía de la Nación, Secretaría de Agricultura, Ganadería y Pesca, Dirección Nacional de Agricultura, Dirección de Estimaciones Agrícolas. Estimaciones agrícolas, serie histórica por campaña y municipio, campañas 1969/70 a 2025/26","Catálogo de Datos Abiertos de la Provincia de Buenos Aires (catalogo.datos.gba.gob.ar), actualización de la fuente: 2 de julio de 2026","Indec, Censo Nacional 2010, para la normalización de los nombres de municipio","Elaboración propia DatosPBA sobre la base de la Dirección de Estimaciones Agrícolas (2026)"]$$::jsonb
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
