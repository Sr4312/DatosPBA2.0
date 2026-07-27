-- ============================================================
-- Colores del sistema para las visualizaciones cargadas después
-- del seed (la migración de la fase 1 no las cubría).
-- Pegar y ejecutar en el SQL Editor de Supabase. Idempotente.
--
-- Criterio, el mismo de la fase 1:
--   · una sola medida sin dirección deseable  → un solo color
--   · una sola medida con polaridad clara     → rampa de valoración
--   · varias series                            → paleta de dato en orden
-- ============================================================

-- Cloaca: más acceso es mejor → rampa de valoración sobre el valor real
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,0,backgroundColor}', '["rgb(180,35,76)","rgb(178,37,78)","rgb(137,78,110)","rgb(133,83,113)","rgb(131,85,115)","rgb(126,90,119)","rgb(124,91,120)","rgb(121,95,122)","rgb(111,104,130)","rgb(110,106,131)","rgb(106,110,134)","rgb(105,111,135)","rgb(95,118,139)","rgb(92,119,139)","rgb(89,120,139)","rgb(56,132,137)","rgb(54,133,137)","rgb(51,134,137)","rgb(49,135,137)","rgb(46,136,137)","rgb(23,144,136)","rgb(21,145,136)","rgb(20,145,136)","rgb(13,148,136)"]')
WHERE id = 'v-censo22-cloaca-gba';

-- Agua: ídem
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,0,backgroundColor}', '["rgb(180,35,76)","rgb(179,36,77)","rgb(148,68,101)","rgb(121,95,123)","rgb(105,110,135)","rgb(102,114,138)","rgb(94,118,139)","rgb(82,123,138)","rgb(66,128,138)","rgb(48,135,137)","rgb(13,148,136)"]')
WHERE id = 'v-censo22-agua-gba';

-- Gas/electricidad para cocinar: ídem
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,0,backgroundColor}', '["rgb(180,35,76)","rgb(165,50,88)","rgb(152,63,98)","rgb(151,65,99)","rgb(127,89,118)","rgb(126,90,118)","rgb(120,95,123)","rgb(111,105,131)","rgb(109,107,132)","rgb(101,115,138)","rgb(99,116,139)","rgb(97,117,139)","rgb(95,118,139)","rgb(92,119,139)","rgb(74,126,138)","rgb(67,128,138)","rgb(60,131,138)","rgb(60,131,138)","rgb(57,132,138)","rgb(52,134,137)","rgb(32,141,137)","rgb(30,142,137)","rgb(24,144,136)","rgb(13,148,136)"]')
WHERE id = 'v-censo22-gas-gba';

-- Crecimiento demográfico: no hay dirección deseable (polaridad neutra),
-- así que el degradado no codificaba nada. Una medida → un color.
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,0,backgroundColor}', '"#E11D74"')
WHERE id = 'v-censo22-top-crecimiento';

-- Cloaca vs. crecimiento: dos series → serie principal y comparación
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,0,backgroundColor}', '"#E11D74"')
WHERE id = 'v-censo22-crecimiento-vs-cloaca';
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,1,backgroundColor}', '"#0D9488"')
WHERE id = 'v-censo22-crecimiento-vs-cloaca';

-- Cloaca vs. internet: dos series
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,0,backgroundColor}', '"#E11D74"')
WHERE id = 'v-censo22-servicios-crecimiento';
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,1,backgroundColor}', '"#0D9488"')
WHERE id = 'v-censo22-servicios-crecimiento';

-- Conectividad: tres series (el cyan lleva borde propio para contrastar sobre blanco)
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,0,backgroundColor}', '"#E11D74"')
WHERE id = 'v-censo22-conectividad';
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,1,backgroundColor}', '"#0D9488"')
WHERE id = 'v-censo22-conectividad';
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,2,backgroundColor}', '"#22D3EE"')
WHERE id = 'v-censo22-conectividad';
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,2,borderColor}', '"#0E7490"')
WHERE id = 'v-censo22-conectividad';
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,2,borderWidth}', '1')
WHERE id = 'v-censo22-conectividad';

-- ISIM-PBA (gráfico del hero): serie principal magenta, desestacionalizada teal
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,0,borderColor}', '"#E11D74"')
WHERE id = 'v-isim-serie-2026';
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,0,backgroundColor}', '"rgba(225,29,116,0.15)"')
WHERE id = 'v-isim-serie-2026';
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,1,borderColor}', '"#0D9488"')
WHERE id = 'v-isim-serie-2026';
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,1,backgroundColor}', '"rgba(13,148,136,0)"')
WHERE id = 'v-isim-serie-2026';

-- TISH por municipio: color por provincia (Buenos Aires / Córdoba),
-- igual que PROV_COLORS en el informe InformeMedicamentosTISH.jsx
UPDATE visualizaciones SET chart_data =
  jsonb_set(chart_data, '{datasets,0,backgroundColor}', '["#E11D74","#E11D74","#E11D74","#0D9488","#0D9488"]')
WHERE id = 'a5e8bfe9-3cf7-4a5b-bedc-fd0b65a614a2';

-- Diagnóstico: no debería devolver filas
SELECT id, titulo FROM visualizaciones
WHERE chart_data::text ~* '(ff2d55|ff4d6d|ff6b35|ffd60a|30d158|00c8a0|e91e8c|7B1FA2|60a5fa|fbbf24)';
