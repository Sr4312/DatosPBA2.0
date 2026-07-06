CLAUDE_WEB.md - Mapa general del sitio DatosPBA
================================================

Qué es
------
DatosPBA (https://www.datospba.com) es un sitio de análisis político y datos
abiertos sobre la Provincia de Buenos Aires: informes en profundidad, hilos
para redes, reportes rápidos y un mapa municipal interactivo.
Lema: "Análisis basado en evidencia".

Este archivo describe QUÉ existe y CÓMO está armado el sitio.
Para crear un informe nuevo, la guía es CLAUDE_CONTENIDO.md.


Stack
-----
· React 18 + Vite 5 - SPA sin SSR. Deploy automático en Vercel (push a main).
· react-router-dom 6 - todas las rutas en src/App.jsx, páginas con lazy().
· Tailwind CSS 3 - paleta `brand` (azules). Tipografía: Poppins en todo el
  sitio (la clase `font-display` también resuelve a Poppins; no usar serifs).
· Chart.js 4 + react-chartjs-2 - todos los gráficos.
· framer-motion - animaciones vía LazyMotion; siempre importar `m`, no `motion`.
· Leaflet - mapa municipal (MedidorMunicipal).
· Supabase - contenido dinámico (ver sección Datos). Cliente en src/lib/supabase.js,
  credenciales en env: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
· html2canvas - descarga PNG de gráficos con branding.
· lucide-react - íconos.
· @vercel/analytics - montado en main.jsx.


Estructura de src/
------------------
main.jsx                    entry: App + Analytics
App.jsx                     router: acá se registran TODAS las rutas
index.css                   estilos globales (bg-pattern-dark, ticker-track, etc.)
context/ThemeContext.jsx    tema claro/oscuro - DESHABILITADO, fuerza light
components/
  Layout.jsx                header sticky + nav + buscador + footer (envuelve todo)
  SearchOverlay.jsx         búsqueda global (lee 4 tablas de Supabase)
  ScrollToTop.jsx           scroll al top en cada cambio de ruta
  MedidorMunicipal.jsx      mapa Leaflet de los 135 municipios; temas:
                            concejales, tasa vial, transparencia fiscal
                            (datos hardcodeados dentro del componente)
  shared/                   EntryCard, FilterBar, HiloCard, ReporteCard, TickerBar
  ui/badge.jsx              badge genérico
  visualizaciones/VizCard.jsx  card de visualización (usada por InformeDetalle)
lib/
  supabase.js               cliente Supabase
  municipiosData.js         geometrías y datos de municipios para el mapa
  utils.js                  helpers
pages/                      una página por ruta (ver tabla siguiente)


Rutas y páginas
---------------
| Ruta                  | Archivo             | Qué muestra                                      |
|-----------------------|---------------------|--------------------------------------------------|
| /                     | Home.jsx            | Landing: ticker de reportes, mapa municipal, últimas publicaciones e informes |
| /informes             | Informes.jsx        | Índice de informes (tabla `informes` de Supabase, filtro por tema + búsqueda) |
| /informes/<slug>      | Informe*.jsx        | Informes estáticos autocontenidos (ver tabla)    |
| /informes/:id         | InformeDetalle.jsx  | Fallback dinámico: informe desde Supabase + visualizaciones relacionadas |
| /datos                | Datos.jsx           | Placeholder "Próximamente" (datasets en preparación) |
| /hilos                | Hilos.jsx           | Hilos/publicaciones de X (tabla `hilos`)         |
| /reportes             | ReportesRapidos.jsx | Reportes rápidos + TickerBar (tabla `reportes_rapidos`) |
| /beta                 | Beta.jsx            | Buscador unificado de todo el contenido (4 tablas) |
| /quienes-somos        | QuienesSomos.jsx    | Página institucional                             |

Nav del header (Layout.jsx): Informes · Publicaciones (/hilos) ·
¿Quiénes somos? · Datasets (/datos) · Beta.


Informes publicados (páginas estáticas)
----------------------------------------
Cada informe es UN archivo JSX autocontenido en src/pages/ (define su paleta,
componentes UI, datos y gráficos adentro; no comparten componentes entre sí,
por diseño: se copia del informe de referencia y se adapta).

| Slug                            | Archivo                         | Tema                     |
|---------------------------------|---------------------------------|--------------------------|
| kpmg-iibb-2025                  | InformeKPMGIIBB.jsx             | Presión fiscal IIBB      |
| caf-estado-municipal-pba        | InformeCAFEstadoMunicipal.jsx   | Estado municipal (CAF)   |
| renabap-pba-2026                | InformeRENABAP.jsx              | Barrios populares        |
| salud-conurbano-pec-2026        | InformeSaludConurbano.jsx       | Salud en el conurbano    |
| mineria-pba-2025                | InformeMineriaPBA.jsx           | Minería (ref. paleta dorada) |
| medicamentos-tish-pba-2025      | InformeMedicamentosTISH.jsx     | Tasa TISH y medicamentos |
| agroindustria-pba-2026          | InformeAgroindustriaPBA.jsx     | Agroindustria (ref. paleta azul) |
| empleo-publico-pba-2026         | InformeEmpleoPblicoPBA.jsx      | Empleo público           |
| homicidios-pba-2025             | InformeHomicidiosPBA.jsx        | Homicidios / seguridad   |
| ranking-fiscal-provincial-2025  | InformeRankingFiscalPBA.jsx     | Ranking fiscal provincial|
| presupuesto-genero-pba-2026     | InformePresupuestoGeneroPBA.jsx | Presupuesto y género     |


Datos: Supabase
---------------
Tablas y quién las consume:

`informes`          → Informes.jsx (índice), InformeDetalle.jsx, SearchOverlay, Beta, Home.
                      Campos: id, titulo, bajada, tema, fecha, fecha_orden, url,
                      imagen, municipios[], insights.
`hilos`             → Hilos.jsx, Home (ticker de publicaciones), SearchOverlay, Beta.
                      Campos: titulo, resumen, tema, fecha, fecha_orden, url, imagen.
`reportes_rapidos`  → ReportesRapidos.jsx, TickerBar, SearchOverlay, Beta.
                      Campos: titulo, dato, descripcion, tema, fecha, fecha_orden.
`datasets`          → SearchOverlay, Beta (aún sin página propia; /datos es placeholder).
                      Campos: nombre, descripcion, tema, formato, fecha_actualizacion.
`visualizaciones`   → InformeDetalle.jsx (relacionadas por campo informe_url).

CLAVE: un informe estático nuevo NO aparece en /informes ni en el buscador
hasta insertar su fila en la tabla `informes` con url = /informes/<slug>.
El índice se arma desde la tabla, no desde las rutas.


Decisiones vigentes (no revertir sin pedido explícito)
-------------------------------------------------------
· Dark mode DESHABILITADO en todo el sitio (jun 2026): ThemeContext fuerza
  light y limpia la preferencia guardada. Las clases dark: siguen en el
  código pero nunca se activan. No agregar toggle ni nuevas clases dark:.
· Sin LinkedIn (eliminado may 2026). Contacto: X (@datospba) y
  contacto@datospba.com.
· Em-dashes (—) prohibidos en el contenido: usar guión simple (-).
· /datos queda como placeholder hasta que los datasets estén listos.


Build y deploy
--------------
· Dev:    npm run dev
· Build:  npm run build   (verificar que compile antes de pushear)
· Deploy: push a main → Vercel deploya automático a www.datospba.com
· vercel.json: rewrite de todas las rutas a index.html (SPA)
· public/: logos (logo-bars.svg, logo-icon.svg), fonts/, images/, downloads/
