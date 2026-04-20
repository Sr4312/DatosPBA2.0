-- ============================================================
-- Datos PBA — Informe RENABAP PBA 2026
-- Pegar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

INSERT INTO informes (id, titulo, bajada, fecha, fecha_orden, tema, municipios, insights, cuerpo, fuentes, url, imagen)
VALUES (
  'renabap-pba-2026',
  'Los otros Buenos Aires: 2.327 barrios populares sin cloacas, sin agua, sin Estado',
  'La Provincia de Buenos Aires concentra 2.327 barrios populares y más de 2,5 millones de personas en situación de informalidad urbana — el 36% del total nacional. Solo el 4% tiene cloaca de red y el 98% no tiene título de propiedad. El mapa de la urbanización pendiente más grande del país.',
  'Abril 2026',
  '2026-04-20',
  'Vivienda e informalidad',
  '["Provincia de Buenos Aires"]'::jsonb,
  '[
    "La PBA concentra el 36% del total nacional de barrios populares: 2.327 en 135 partidos, sobre 27.913 hectáreas ocupadas.",
    "Solo 5 partidos del conurbano -La Matanza, Moreno, Quilmes, Almirante Brown y Merlo- concentran un tercio de los barrios populares bonaerenses.",
    "El déficit de servicios formales es brutal: 4% con cloaca, 17% con agua corriente, 33% con electricidad formal y apenas 2% con gas de red.",
    "El 98% de los hogares no tiene título de propiedad: la informalidad dominial es casi total.",
    "En 2024 el FISU -la herramienta principal para cerrar la brecha- se desfinanció prácticamente por completo: −95% real de ejecución respecto a años anteriores.",
    "OPISU Provincia interviene en 193 barrios de 54 municipios, llegando a 360.000 vecinos, pero sin escala suficiente para cubrir los 2.327 barrios relevados."
  ]'::jsonb,
  '[]'::jsonb,
  '[
    "RENABAP — Registro Nacional de Barrios Populares. Ministerio de Desarrollo Social de la Nación. Actualización 2023.",
    "FISU — Fondo de Integración Socio-Urbana. Ejecución 2019-2024.",
    "OPISU — Organismo Provincial de Integración Social y Urbana. Provincia de Buenos Aires.",
    "Dataset renabap_pba_consolidado — Elaboración propia DatosPBA. Abril 2026."
  ]'::jsonb,
  '/informes/renabap-pba-2026',
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
