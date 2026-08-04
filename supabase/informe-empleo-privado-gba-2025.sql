-- Registro del informe "Empleo asalariado privado en los partidos del GBA"
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
  'empleo-privado-gba-2025',
  'Empleo asalariado privado en los partidos del GBA',
  'Dentro de la misma región metropolitana conviven caídas de dos dígitos en los partidos con industria pesada y subas en municipios chicos del segundo cordón. El promedio metropolitano esconde esa dispersión.',
  'Agosto 2026',
  '2026-08-04',
  'Trabajo',
  '["Ensenada","Zárate","Berisso","San Fernando","San Isidro","General San Martín","Exaltación de la Cruz","Marcos Paz","Ezeiza","General Rodríguez","Tres de Febrero"]'::jsonb,
  $$["El empleo asalariado privado del GBA cayó 3,1% entre diciembre de 2023 y diciembre de 2025","Solo 7 de los 40 partidos del conurbano cerraron el bienio con más empleo privado que al comienzo","Ensenada perdió 18,9% de sus puestos privados registrados, la mayor caída de los 40 partidos","San Isidro concentró la mayor pérdida en puestos, 6.006 menos en dos años"]$$::jsonb,
  '/informes/empleo-privado-gba-2025',
  NULL,
  true,
  $$["Observatorio de Empleo y Dinámica Empresarial (OEDE), Dirección Nacional de Estudios y Estadísticas Laborales, Secretaría de Trabajo, Empleo y Seguridad Social, Ministerio de Capital Humano - Serie de empleo asalariado registrado por departamento, región AMBA, sector privado, puestos de trabajo, serie mensual","Sistema Integrado Previsional Argentino (SIPA) y Sistema de Simplificación Registral (ARCA)"]$$::jsonb
);
