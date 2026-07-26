-- ============================================================
-- Fase 1 — Semántica de color: migración para la BASE VIVA
-- Pegar y ejecutar en el SQL Editor de Supabase.
-- Es idempotente: se puede correr más de una vez sin romper nada.
--
-- Qué hace:
--   1. Agrega `polaridad` a reportes_rapidos y la completa para los
--      indicadores conocidos. El frontend deriva el color de la
--      variación de polaridad × signo; sin polaridad cae en neutro.
--   2. Recolorea las series de `visualizaciones` a la paleta del
--      sistema: #E11D74 magenta (serie principal), #0D9488 teal
--      (comparación), #22D3EE cyan (tercera, borde #0E7490),
--      #0F172A navy (total), #B4234C (peor), #64748B (neutro).
--   3. Deja consultas de diagnóstico para detectar filas que este
--      script no cubrió (la base viva puede tener más filas que el
--      seed de schema.sql).
-- ============================================================

-- ── 1. Polaridad en reportes_rapidos ────────────────────────

ALTER TABLE reportes_rapidos
  ADD COLUMN IF NOT EXISTS polaridad text DEFAULT 'neutro';

-- Desempleo que sube = peor
UPDATE reportes_rapidos SET polaridad = 'menor-es-mejor' WHERE id = 'rr-desempleo-q3';
-- Informalidad que sube = peor
UPDATE reportes_rapidos SET polaridad = 'menor-es-mejor' WHERE id = 'rr-informalidad';
-- Gasto en seguridad: prioridad presupuestaria, sin dirección deseable objetiva
UPDATE reportes_rapidos SET polaridad = 'neutro' WHERE id = 'rr-gasto-seguridad';
-- Población sin cobertura de salud que sube = peor
UPDATE reportes_rapidos SET polaridad = 'menor-es-mejor' WHERE id = 'rr-cobertura-salud';
-- Matrícula secundaria que cae = peor (el indicador es la matrícula)
UPDATE reportes_rapidos SET polaridad = 'mayor-es-mejor' WHERE id = 'rr-matricula-secundario';
-- Deuda per cápita que sube = peor
UPDATE reportes_rapidos SET polaridad = 'menor-es-mejor' WHERE id = 'rr-deuda-municipal';

-- ── 2. Series de visualizaciones a la paleta del sistema ────

-- Desempleo por partido: una sola medida → un solo color (era arcoíris de 8)
UPDATE visualizaciones SET chart_data =
  jsonb_set(jsonb_set(chart_data,
    '{datasets,0,backgroundColor}', '"#E11D74bb"'),
    '{datasets,0,borderColor}',     '"#E11D74"')
WHERE id = 'v-desempleo-conurbano';

-- Evolución del desempleo (línea)
UPDATE visualizaciones SET chart_data =
  replace(replace(chart_data::text,
    '#1ab8b822', '#E11D7422'),
    '#1ab8b8',   '#E11D74')::jsonb
WHERE id = 'v-evolucion-desempleo';

-- Composición del gasto: una sola medida → un solo color (era arcoíris de 6)
UPDATE visualizaciones SET chart_data =
  jsonb_set(jsonb_set(chart_data,
    '{datasets,0,backgroundColor}', '"#E11D74bb"'),
    '{datasets,0,borderColor}',     '"#E11D74"')
WHERE id = 'v-gasto-funcional';

-- Sin cobertura de salud por partido
UPDATE visualizaciones SET chart_data =
  replace(replace(chart_data::text,
    '#b91c1cbb', '#E11D74bb'),
    '#b91c1c',   '#E11D74')::jsonb
WHERE id = 'v-cobertura-salud-partido';

-- Exportaciones PBA histórico: barra principal magenta, línea 1er semestre navy
UPDATE visualizaciones SET chart_data =
  replace(replace(replace(chart_data::text,
    '#1ab8b8bb', '#E11D74bb'),
    '#1ab8b8',   '#E11D74'),
    '#0a1628',   '#0F172A')::jsonb
WHERE id = 'v-exportaciones-pba-historico';

-- Presión tributaria promedio: PBA principal, Santa Fe y Córdoba comparación
UPDATE visualizaciones SET chart_data =
  jsonb_set(jsonb_set(chart_data,
    '{datasets,0,backgroundColor}', '["#E11D74bb","#0D9488bb","#22D3EEbb"]'),
    '{datasets,0,borderColor}',     '["#E11D74","#0D9488","#0E7490"]')
WHERE id = 'v-presion-tributaria-promedio';

-- Presión tributaria por sector: 3 series en orden de paleta
UPDATE visualizaciones SET chart_data =
  replace(replace(replace(replace(chart_data::text,
    '#0369a1bb', '#E11D74bb'),
    '#0369a1',   '#E11D74'),
    '#b45309bb', '#22D3EEbb'),
    '#b45309',   '#0E7490')::jsonb
WHERE id = 'v-presion-tributaria-sectores';

-- Transferencias IARAF: PBA (la peor) --worse, resto neutro, CABA (positiva) --better
UPDATE visualizaciones SET chart_data =
  replace(replace(replace(replace(chart_data::text,
    '#b91c1cbb', '#B4234Cbb'),
    '#b91c1c',   '#B4234C'),
    '#1ab8b8bb', '#64748Bbb'),
    '#1ab8b8',   '#64748B')::jsonb
WHERE id = 'v-transferencias-provincias-iaraf';

-- Sectores en retroceso: todas son caídas (peor) → un solo color de valoración
UPDATE visualizaciones SET chart_data =
  jsonb_set(jsonb_set(chart_data,
    '{datasets,0,backgroundColor}', '"#B4234Cbb"'),
    '{datasets,0,borderColor}',     '"#B4234C"')
WHERE id = 'v-sectores-retroceso-pba-2025';

-- Series mensuales 2024 vs 2025: 2024 = comparación (teal), 2025 = principal (magenta)
UPDATE visualizaciones SET chart_data =
  replace(replace(replace(replace(chart_data::text,
    'rgba(37,99,235,0.85)',  '#0D9488'),
    'rgba(37,99,235,0.12)',  'rgba(13,148,136,0.12)'),
    'rgba(153,27,27,0.85)',  '#E11D74'),
    'rgba(153,27,27,0.12)',  'rgba(225,29,116,0.12)')::jsonb
WHERE id IN ('v-neumaticos-pba-2024-2025', 'v-biodiesel-pba-2024-2025', 'v-autos-pba-2024-2025');

-- Tasa vial top 6: escala de valoración (3% peor → 2% medio)
UPDATE visualizaciones SET chart_data =
  jsonb_set(jsonb_set(chart_data,
    '{datasets,0,backgroundColor}',
    '["rgba(180,35,76,0.75)","rgba(144,72,105,0.75)","rgba(144,72,105,0.75)","rgba(144,72,105,0.75)","rgba(107,109,133,0.75)","rgba(107,109,133,0.75)"]'),
    '{datasets,0,borderColor}',
    '["rgb(180,35,76)","rgb(144,72,105)","rgb(144,72,105)","rgb(144,72,105)","rgb(107,109,133)","rgb(107,109,133)"]')
WHERE id = 'v-tasa-vial-top6-pba';

-- Carga sanitaria: peores 5 --worse, mejores 5 --better (ya era valorativo, ajusta tonos)
UPDATE visualizaciones SET chart_data =
  replace(replace(replace(replace(chart_data::text,
    '#fda4afdd', 'rgba(180,35,76,0.75)'),
    '#fda4af',   '#B4234C'),
    '#5eead4dd', 'rgba(13,148,136,0.75)'),
    '#5eead4',   '#0D9488')::jsonb
WHERE id = 'v-carga-sanitaria-conurbano-pec';

-- ── 3. Diagnóstico: qué quedó afuera ────────────────────────
-- (a) Reportes sin polaridad revisada: todo lo que siga en 'neutro'
--     por default hay que revisarlo a mano.
SELECT id, titulo, tendencia, variacion, polaridad
FROM reportes_rapidos
ORDER BY fecha_orden DESC;

-- (b) Visualizaciones que todavía usan colores fuera del sistema:
SELECT id, titulo
FROM visualizaciones
WHERE chart_data::text ~* '(1ab8b8|0369a1|b91c1c|b45309|7c3aed|c2410c|0e7878|22c55e|ef4444|fda4af|5eead4|153,27,27|37,99,235)'
ORDER BY fecha_orden DESC;
