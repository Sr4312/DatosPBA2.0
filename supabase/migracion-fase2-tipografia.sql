-- ============================================================
-- Fase 2 — Tipografía: migración para la BASE VIVA
-- Pegar y ejecutar en el SQL Editor de Supabase (idempotente).
--
-- El sitio pasó de Poppins a Archivo (self-hosted). Los
-- chart_options guardados en `visualizaciones` referencian la
-- familia por nombre y pisan el default de Chart.js, así que hay
-- que actualizarlos en los datos.
-- ============================================================

UPDATE visualizaciones
SET chart_options = replace(chart_options::text, '"family":"Poppins"', '"family":"Archivo"')::jsonb
WHERE chart_options::text LIKE '%Poppins%';

UPDATE visualizaciones
SET chart_data = replace(chart_data::text, '"family":"Poppins"', '"family":"Archivo"')::jsonb
WHERE chart_data::text LIKE '%Poppins%';

-- Diagnóstico: no debería devolver filas
SELECT id, titulo FROM visualizaciones
WHERE chart_options::text LIKE '%Poppins%' OR chart_data::text LIKE '%Poppins%';
