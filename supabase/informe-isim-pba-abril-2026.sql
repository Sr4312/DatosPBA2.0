-- Registro del informe "La industria manufacturera bonaerense en abril de 2026"
-- en la tabla `informes` de Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- Es la edición de abril de la serie mensual del ISIM-PBA. La de marzo ya está
-- cargada como 'industria-manufacturera-pba-2026' y NO se pisa: son ediciones
-- distintas. Ojo: esa edición publicó marzo con +13,2% y la fuente lo revisó
-- después a +13,5%, así que su bajada y sus insights quedaron desactualizados.
--
-- El tema 'Industria' ya existe en la tabla (lo usa el informe de marzo).
-- Verificar igual antes de correr:
--   SELECT DISTINCT tema FROM informes ORDER BY 1;

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'isim-pba-abril-2026',
  'La industria manufacturera bonaerense en abril de 2026',
  'El ISIM-PBA es el único indicador mensual de producción industrial propio de la Provincia. Su apertura por bloque permite ver si el crecimiento es general o depende de un puñado de rubros.',
  'Agosto 2026',
  '2026-08-11',
  'Industria',
  '["Provincia de Buenos Aires"]'::jsonb,
  $$["La industria manufacturera bonaerense creció 2,5% interanual en abril, tras el 13,5% de marzo","Productos químicos aportó 4,66 puntos porcentuales y explicó el 66% de todo el aporte positivo del mes","Sin Productos químicos, los otros diez bloques restaron 2,2 puntos y el indicador habría cerrado en baja","Seis de los once bloques industriales cayeron en abril; en marzo habían caído dos","Solo Refinación de petróleo y Productos químicos producen hoy más que en 2012"]$$::jsonb,
  '/informes/isim-pba-abril-2026',
  NULL,
  true,
  $$["Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires. Indicador Sintético de la Industria Manufacturera de la provincia de Buenos Aires (ISIM-PBA), datos a abril de 2026, publicado en julio de 2026","Elaboración propia DatosPBA sobre la base del ISIM-PBA (2026)"]$$::jsonb
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
