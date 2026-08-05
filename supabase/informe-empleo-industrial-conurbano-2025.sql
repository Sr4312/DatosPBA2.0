-- Registro del informe "Empleo industrial en los municipios del Conurbano"
-- en la tabla `informes` de Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- Antes de correrlo: verificar que el tema 'Trabajo' ya exista en la tabla
--   SELECT DISTINCT tema FROM informes ORDER BY 1;
-- y usar el valor existente si el empleo está categorizado con otro nombre.

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'empleo-industrial-conurbano-2025',
  'Empleo industrial en los municipios del Conurbano',
  'La recuperación del empleo industrial existe, pero está concentrada en municipios de baja densidad fabril. Los distritos que sostienen casi la mitad de los puestos del Conurbano todavía no la alcanzaron.',
  'Agosto 2026',
  '2026-08-05',
  'Trabajo',
  '["La Matanza","General San Martín","Tigre","Vicente López","Tres de Febrero","Ezeiza","Moreno","Malvinas Argentinas","José C. Paz","San Fernando","Lomas de Zamora","Merlo"]'::jsonb,
  $$["El Conurbano tenía 339.110 puestos industriales formales en junio de 2025, 2,3% menos que en enero de 2019","Los ocho municipios que ganaron empleo industrial en el último año reúnen el 23,2% de los puestos del Conurbano","Tres de Febrero es el único de los cinco polos principales que creció en las tres ventanas que publica la fuente","San Fernando perdió 12,06% de su empleo industrial en doce meses y 17,0% desde 2019"]$$::jsonb,
  '/informes/empleo-industrial-conurbano-2025',
  NULL,
  true,
  $$["Gutiérrez Cabello, A. (2026). Informe sobre el empleo industrial del Conurbano Bonaerense. Documentos de Economía Regional y Sectorial, n° 99, ISSN 2618-494X. CERE - Centro de Economía Regional, Escuela de Economía y Negocios, Universidad Nacional de San Martín","Sistema Integrado Previsional Argentino (SIPA), Secretaría de Trabajo, Empleo y Seguridad Social de la Nación","INDEC (2023). Censo Nacional de Población, Hogares y Viviendas 2022"]$$::jsonb
);
