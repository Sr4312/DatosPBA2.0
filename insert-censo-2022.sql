-- ============================================================
-- Datos PBA — Informe Censo PBA 2022
-- Pegar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- 1. VISUALIZACIONES
-- ============================================================

INSERT INTO visualizaciones (id, titulo, tipo, fuente, informe_url, fecha, tema, chart_data, chart_options)
VALUES (
  'v-censo22-cloaca-gba',
  'Acceso a red cloacal en el GBA — 24 partidos',
  'bar',
  'INDEC, CNPHV 2022',
  '/informes/censo-pba-2022',
  'Abril 2026',
  'Censo',
  '{
    "labels": ["José C. Paz","Malvinas Argentinas","Moreno","Tigre","Ezeiza","Ituzaingó","Merlo","Almirante Brown","Florencio Varela","Lomas de Zamora","San Miguel","Esteban Echeverría","Hurlingham","Lanús","La Matanza","Gral. San Martín","Berazategui","Quilmes","Morón","Avellaneda","San Fernando","Tres de Febrero","San Isidro","Vicente López"],
    "datasets": [{
      "label": "% hogares con cloaca de red pública",
      "data": [8.1,9.3,32.2,34.9,35.7,38.7,39.5,41.4,46.8,47.8,49.7,50.4,56.1,57.5,58.8,76.1,77.1,78.9,79.5,81.1,93.1,94.2,94.6,98.4],
      "backgroundColor": ["#ff2d55","#ff2d55","#ff4d6d","#ff4d6d","#ff4d6d","#ff4d6d","#ff4d6d","#ff6b35","#ff6b35","#ff6b35","#ff6b35","#ff6b35","#ff6b35","#ff6b35","#ff6b35","#ffd60a","#ffd60a","#ffd60a","#ffd60a","#30d158","#00c8a0","#00c8a0","#00c8a0","#00c8a0"],
      "borderRadius": 3,
      "borderSkipped": false
    }]
  }'::jsonb,
  '{
    "indexAxis": "y",
    "plugins": {"legend": {"display": false}},
    "scales": {
      "x": {"min": 0, "max": 100},
      "y": {"grid": {"display": false}}
    },
    "x_tick_format": "percent"
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  chart_data = EXCLUDED.chart_data,
  chart_options = EXCLUDED.chart_options;

INSERT INTO visualizaciones (id, titulo, tipo, fuente, informe_url, fecha, tema, chart_data, chart_options)
VALUES (
  'v-censo22-agua-gba',
  'Crisis del agua en el GBA: partidos con menos del 75% de agua de red pública',
  'bar',
  'INDEC, CNPHV 2022',
  '/informes/censo-pba-2022',
  'Abril 2026',
  'Censo',
  '{
    "labels": ["Malvinas Argentinas","José C. Paz","Ituzaingó","Moreno","Merlo","San Miguel","Hurlingham","Ezeiza","Almirante Brown","Esteban Echeverría","Tigre"],
    "datasets": [{
      "label": "% hogares con agua de red pública",
      "data": [14.1,14.5,25.9,35.8,41.4,42.8,45.3,49.4,54.8,61.0,72.7],
      "backgroundColor": ["#ff2d55","#ff2d55","#ff2d55","#ff6b35","#ff6b35","#ff6b35","#ff6b35","#ff6b35","#ffd60a","#ffd60a","#ffd60a"],
      "borderRadius": 3,
      "borderSkipped": false
    }]
  }'::jsonb,
  '{
    "indexAxis": "y",
    "plugins": {"legend": {"display": false}},
    "scales": {
      "x": {"min": 0, "max": 100},
      "y": {"grid": {"display": false}}
    },
    "x_tick_format": "percent"
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  chart_data = EXCLUDED.chart_data,
  chart_options = EXCLUDED.chart_options;

INSERT INTO visualizaciones (id, titulo, tipo, fuente, informe_url, fecha, tema, chart_data, chart_options)
VALUES (
  'v-censo22-top-crecimiento',
  'Municipios con mayor crecimiento demográfico 2010–2022',
  'bar',
  'INDEC, CNPHV 2022',
  '/informes/censo-pba-2022',
  'Abril 2026',
  'Censo',
  '{
    "labels": ["San Vicente","Gral. Rodríguez","Mar Chiquita","Pinamar","La Costa","Tordillo","Cañuelas","Exalt. de la Cruz","Pilar","Gral. Lavalle"],
    "datasets": [{
      "label": "Crecimiento poblacional 2010–2022 (%)",
      "data": [65.1,63.7,55.6,53.3,44.6,44.1,36.2,34.7,32.0,31.6],
      "backgroundColor": ["#ff2d55","#ff2d55","#ff4d6d","#ff4d6d","#ff6b35","#ff6b35","#ffd60a","#ffd60a","#ffd60a","#ffd60a"],
      "borderRadius": 4,
      "borderSkipped": false
    }]
  }'::jsonb,
  '{
    "indexAxis": "y",
    "plugins": {"legend": {"display": false}},
    "scales": {
      "x": {"title": {"display": false}},
      "y": {"grid": {"display": false}}
    },
    "x_tick_format": "percent"
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  chart_data = EXCLUDED.chart_data,
  chart_options = EXCLUDED.chart_options;

INSERT INTO visualizaciones (id, titulo, tipo, fuente, informe_url, fecha, tema, chart_data, chart_options)
VALUES (
  'v-censo22-servicios-crecimiento',
  'Los que más crecieron: cloaca e internet en los 8 partidos de mayor expansión',
  'bar',
  'INDEC, CNPHV 2022',
  '/informes/censo-pba-2022',
  'Abril 2026',
  'Censo',
  '{
    "labels": ["San Vicente","Gral. Rodríguez","Mar Chiquita","Pinamar","La Costa","Tordillo","Cañuelas","Exalt. de la Cruz"],
    "datasets": [
      {
        "label": "Cloaca (%)",
        "data": [43.7,24.2,30.9,36.5,69.2,30.7,27.6,45.5],
        "backgroundColor": "rgba(255,45,85,0.8)",
        "borderRadius": 3,
        "borderSkipped": false
      },
      {
        "label": "Internet (%)",
        "data": [72.6,67.1,71.9,89.2,76.3,69.6,76.9,74.6],
        "backgroundColor": "rgba(0,200,160,0.75)",
        "borderRadius": 3,
        "borderSkipped": false
      }
    ]
  }'::jsonb,
  '{
    "plugins": {"legend": {"display": true, "labels": {"boxWidth": 12}}},
    "scales": {
      "x": {"grid": {"display": false}},
      "y": {"min": 0, "max": 100}
    },
    "y_tick_format": "percent"
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  chart_data = EXCLUDED.chart_data,
  chart_options = EXCLUDED.chart_options;

INSERT INTO visualizaciones (id, titulo, tipo, fuente, informe_url, fecha, tema, chart_data, chart_options)
VALUES (
  'v-censo22-conectividad',
  'Brecha digital: internet, celular con internet y computadora por partido',
  'bar',
  'INDEC, CNPHV 2022',
  '/informes/censo-pba-2022',
  'Abril 2026',
  'Censo',
  '{
    "labels": ["Vicente López","San Isidro","Pinamar","Morón","Gral. Guido","Rauch","Gral. Paz","Gral. Pinto"],
    "datasets": [
      {
        "label": "Internet (%)",
        "data": [91.9,89.4,89.2,89.1,68.3,64.4,68.0,63.7],
        "backgroundColor": "rgba(0,200,160,0.85)",
        "borderRadius": 2,
        "borderSkipped": false
      },
      {
        "label": "Celular internet (%)",
        "data": [94.1,93.3,93.8,93.1,85.1,82.6,83.8,85.4],
        "backgroundColor": "rgba(0,200,160,0.35)",
        "borderRadius": 2,
        "borderSkipped": false
      },
      {
        "label": "Computadora (%)",
        "data": [82.2,77.5,65.0,70.8,48.2,52.7,48.1,49.6],
        "backgroundColor": "rgba(255,214,10,0.65)",
        "borderRadius": 2,
        "borderSkipped": false
      }
    ]
  }'::jsonb,
  '{
    "plugins": {"legend": {"display": true, "labels": {"boxWidth": 12}}},
    "scales": {
      "x": {"grid": {"display": false}},
      "y": {"min": 30, "max": 100}
    },
    "y_tick_format": "percent"
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  chart_data = EXCLUDED.chart_data,
  chart_options = EXCLUDED.chart_options;

-- 2. INFORME
-- ============================================================

INSERT INTO informes (id, titulo, bajada, fecha, fecha_orden, tema, municipios, insights, cuerpo, fuentes, url, imagen)
VALUES (
  'censo-pba-2022',
  'Dos Buenos Aires: la brecha que el mapa no muestra',
  'El Censo 2022 midió los 135 partidos de la Provincia de Buenos Aires y encontró una provincia partida al medio. En infraestructura básica, la distancia entre el mejor y el peor municipio del GBA supera los 90 puntos porcentuales. En conectividad digital, la brecha es de 28.',
  'Abril 2026',
  '2026-04-16',
  'Censo',
  '["Provincia de Buenos Aires"]'::jsonb,
  '[
    "La brecha cloacal en el GBA es de 90 puntos: Vicente López llega al 98.4% y José C. Paz apenas al 8.1%, siendo municipios vecinos.",
    "Malvinas Argentinas tiene solo 14.1% de hogares con agua de red pública y 9.3% con cloaca, pero 82.2% con internet.",
    "Los cinco municipios con mayor crecimiento demográfico 2010–2022 tienen en promedio el 33% de cobertura cloacal.",
    "El celular con internet supera el 85% en 133 de los 135 partidos: democratización digital sin equivalente en servicios físicos.",
    "San Vicente creció un 65% en población entre 2010 y 2022, pero solo el 43.7% de sus hogares tiene cloacas."
  ]'::jsonb,
  '[
    "El Censo Nacional de Población, Hogares y Viviendas 2022 (CNPHV 2022) relevó por primera vez en doce años el estado de los 135 partidos de la Provincia de Buenos Aires. Los resultados provisionales publicados por INDEC en mayo de 2023 muestran una provincia que creció, se expandió hacia nuevos territorios y profundizó sus asimetrías internas.",
    {"viz": "v-censo22-cloaca-gba"},
    "El dato más dramático es la brecha cloacal en el Conurbano. Mientras Vicente López (98.4%) y San Isidro (94.6%) tienen coberturas propias de países desarrollados, José C. Paz (8.1%) y Malvinas Argentinas (9.3%) tienen niveles propios del interior profundo. Los separan, en algunos casos, apenas unos kilómetros de autopista.",
    "El agua potable de red pública presenta un déficit aún más extendido. En once de los veinticuatro partidos del GBA, menos del 75% de los hogares accede al agua corriente como fuente principal para beber y cocinar. En Malvinas Argentinas y José C. Paz, esa cifra no supera el 15%.",
    {"viz": "v-censo22-agua-gba"},
    "El crecimiento demográfico del período 2010–2022 tampoco siguió las líneas de la infraestructura. Los municipios que más crecieron son, en general, los que peor cobertura tienen. San Vicente lideró la expansión provincial con un 65.1% de aumento poblacional, pero solo el 43.7% de sus hogares tiene cloaca. General Rodríguez creció un 63.7% y llega al 24.2%. Cañuelas creció un 36.2% y tiene el 27.6%.",
    {"viz": "v-censo22-top-crecimiento"},
    "Al cruzar los datos de crecimiento con los de servicios, el patrón se vuelve más nítido. En los ocho municipios con mayor expansión demográfica, la cobertura cloacal promedia el 38.6%, mientras que el acceso a internet promedia el 75.8%. La brecha entre conectividad y saneamiento es un rasgo estructural de la urbanización periférica bonaerense.",
    {"viz": "v-censo22-servicios-crecimiento"},
    "El contraste más revelador del Censo 2022 es el de la conectividad digital. Mientras que la brecha en cloacas entre el mejor y el peor partido del GBA es de 90 puntos, la brecha en acceso a internet es de apenas 28 puntos. El celular con internet supera el 85% en 133 de los 135 partidos. La tecnología inalámbrica democratizó el acceso a la información de una manera que la infraestructura de cañerías nunca logró.",
    {"viz": "v-censo22-conectividad"},
    "El Censo 2022 ofrece el mapa más preciso de la desigualdad territorial en la provincia más poblada del país. El desafío de la próxima década no es saber dónde están las brechas —el relevamiento lo dejó claro— sino decidir si la inversión pública va a donde más se necesita o sigue el camino de menor resistencia."
  ]'::jsonb,
  '[
    "INDEC — Censo Nacional de Población, Hogares y Viviendas 2022 (CNPHV 2022). Resultados provisionales. Publicado mayo 2023.",
    "INDEC — Condiciones Habitacionales por partido, Provincia de Buenos Aires. Cuadros 3.1 a 3.135. CNPHV 2022.",
    "INDEC — Variación intercensal de población por partido 2010–2022. CNPHV 2022.",
    "INDEC — Densidad y superficie por partido, Provincia de Buenos Aires. CNPHV 2022."
  ]'::jsonb,
  '/informes/censo-pba-2022',
  null
)
ON CONFLICT (id) DO UPDATE SET
  titulo     = EXCLUDED.titulo,
  bajada     = EXCLUDED.bajada,
  fecha      = EXCLUDED.fecha,
  fecha_orden= EXCLUDED.fecha_orden,
  tema       = EXCLUDED.tema,
  municipios = EXCLUDED.municipios,
  insights   = EXCLUDED.insights,
  cuerpo     = EXCLUDED.cuerpo,
  fuentes    = EXCLUDED.fuentes,
  url        = EXCLUDED.url;
