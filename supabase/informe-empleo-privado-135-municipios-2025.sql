-- Registro del informe "El empleo privado en los 135 municipios bonaerenses"
-- en la tabla `informes` de Supabase. Correr en el SQL Editor.
--
-- La ruta (`url`) coincide con la de src/App.jsx y con el `path` de
-- src/lib/informesRegistry.js. `custom` va en true porque el informe tiene
-- página JSX propia.
--
-- Antes de correrlo: verificar que el tema 'Trabajo' ya exista en la tabla
--   SELECT DISTINCT tema FROM informes ORDER BY 1;
-- y usar el valor existente si el empleo está categorizado con otro nombre.
--
-- `municipios` lleva los partidos que protagonizan el texto, no los 135 del
-- universo: la columna alimenta el filtro por municipio de la portada y
-- cargarla entera lo volvería inútil.

INSERT INTO informes (
  id, titulo, bajada, fecha, fecha_orden, tema,
  municipios, insights, url, imagen, custom, fuentes
) VALUES (
  'empleo-privado-135-municipios-2025',
  'El empleo privado en los 135 municipios bonaerenses',
  'El OEDE permite reconstruir el empleo registrado partido por partido. Es la fuente que muestra, sobre el universo provincial completo, cuáles crecen y cuáles se vacían.',
  'Agosto 2026',
  '2026-08-07',
  'Trabajo',
  '["General Pueyrredón","La Matanza","Vicente López","San Isidro","La Plata","Tigre","Pilar","Bahía Blanca","Ezeiza","Navarro","Punta Indio","San Vicente","Pila","Marcos Paz","Benito Juárez","Olavarría","Villarino","Ensenada","Exaltación de la Cruz","Guaminí"]'::jsonb,
  $$["84 de los 135 municipios bonaerenses perdieron empleo privado entre diciembre de 2023 y diciembre de 2025","El empleo privado provincial tocó su máximo en enero de 2024 con 2.072.151 puestos y cerró 2025 un 2,8% abajo","El conurbano concentra el 73,2% del empleo privado registrado y cayó 3,1% en el último bienio","General Pueyrredón desplazó a La Matanza como el municipio con más empleo privado de la Provincia","Marcos Paz encabeza las caídas de seis años y está tercero entre los que más crecieron en el bienio"]$$::jsonb,
  '/informes/empleo-privado-135-municipios-2025',
  NULL,
  true,
  $$["Observatorio de Empleo y Dinámica Empresarial (OEDE), Dirección Nacional de Estudios y Estadísticas Laborales, Secretaría de Trabajo, Empleo y Seguridad Social, Ministerio de Capital Humano. Series de empleo asalariado registrado por departamento, regiones AMBA y Centro, sector privado, puestos de trabajo, serie mensual","Sistema Integrado Previsional Argentino (SIPA) y Sistema de Simplificación Registral (ARCA)","Elaboración propia DatosPBA sobre la base del OEDE (2026)"]$$::jsonb
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
