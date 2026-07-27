-- ============================================================
-- Fase 2 — Tipografía: migración para la BASE VIVA
-- Pegar y ejecutar en el SQL Editor de Supabase (idempotente).
--
-- El sitio pasó de Poppins a Archivo (self-hosted). Los
-- chart_options guardados en `visualizaciones` referencian la
-- familia por nombre y pisan el default de Chart.js, así que hay
-- que actualizarlos en los datos.
--
-- OJO — la primera versión de este script no hacía nada:
-- buscaba el literal '"family":"Poppins"', pero postgres imprime
-- el jsonb con un espacio después de los dos puntos
-- ('"family": "Poppins"'), así que el replace() nunca encontraba
-- el patrón y reescribía el mismo valor sin error. Ahora se
-- reemplaza solo el nombre entrecomillado, que es indiferente al
-- espaciado. Verificado contra la base viva: el único valor de
-- font.family almacenado es exactamente "Poppins".
-- ============================================================

UPDATE visualizaciones
SET chart_options = replace(chart_options::text, '"Poppins"', '"Archivo"')::jsonb
WHERE chart_options::text LIKE '%Poppins%';

UPDATE visualizaciones
SET chart_data = replace(chart_data::text, '"Poppins"', '"Archivo"')::jsonb
WHERE chart_data::text LIKE '%Poppins%';

-- Diagnóstico: no debería devolver filas
SELECT id, titulo FROM visualizaciones
WHERE chart_options::text LIKE '%Poppins%' OR chart_data::text LIKE '%Poppins%';
