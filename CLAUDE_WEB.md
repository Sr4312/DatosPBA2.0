CLAUDE_WEB.md - Mapa general del sitio DatosPBA
================================================

Qué es
------
DatosPBA (https://www.datospba.com) es un sitio de análisis político y datos
abiertos sobre la Provincia de Buenos Aires: informes en profundidad, hilos
para redes, reportes rápidos y un mapa municipal interactivo.
Lema: "Análisis basado en evidencia".

Este archivo describe QUÉ existe y CÓMO está armado el sitio.
Para crear un informe nuevo, la guía es el skill armado-contenido
(.claude/armado-contenido/armado-contenido.md). El sistema de diseño vive en
.claude/skills/design-system-datospba/skill.md.


Stack
-----
· React 18 + Vite 5 - SPA sin SSR. Deploy automático en Vercel (push a main).
· react-router-dom 6 - todas las rutas en src/App.jsx, páginas con lazy().
· Tailwind CSS 3 - tokens de color en src/index.css (--ink, --rule, --data-1..4).
  Tipografía: Archivo, self-hosted vía @fontsource (la clase `font-display`
  también resuelve a Archivo; no usar serifs).
· Chart.js 4 + react-chartjs-2 - todos los gráficos.
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
  shared/                   Cifra (única representación de una cifra),
                            InformeVisual (banda visual de la card de informe),
                            EntryCard, FilterBar, HiloCard, ReporteCard, TickerBar
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
Cada informe es UN archivo JSX autocontenido en src/pages/ (define sus
componentes UI, datos y gráficos adentro; no comparten componentes entre sí,
por diseño, salvo Cifra). Los informes anteriores a julio de 2026 conservan
restos del diseño viejo (componentes MC, Tag, secciones numeradas, paletas de
acento por tema): no usarlos como referencia.

La lista completa y ordenada vive en src/lib/informesRegistry.js, que es la
fuente de verdad en build time para el sitemap, el RSS y las meta OG. Para no
duplicar ese registro, acá va solo el recuento y las referencias de estilo:

· 27 informes registrados, del 2026-04-07 al 2026-09-08.
· Temas en uso: Agro, Economía, Estado, Fiscal, Hábitat, Industria,
  Presupuesto, Producción, Salud, Seguridad, Trabajo.
· Referencia de estilo vigente: InformeMercadoTrabajoGBA.jsx (la que nombra
  el skill) y, para un ranking de municipios, InformeStockBovinoMunicipiosPBA.jsx
  o InformeProduccionAgricolaPBA.jsx.


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
