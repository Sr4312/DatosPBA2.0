# AUDIT.md — Fase 0, auditoría de datospba.com

Fecha: 2026-07-26. Solo lectura: no se tocó código.
Referencias como `archivo:línea` sobre el estado actual de `main` (commit `9be6f40`).

---

## 0. El brief asume una arquitectura que no es la del repo

Antes de los 10 puntos, tres discrepancias estructurales que cambian cómo se ejecutan las
fases siguientes:

1. **No existe `src/components/data/mockData.js`.** El contenido vive en dos lugares:
   - **Supabase** (tablas `informes`, `hilos`, `reportes_rapidos`, `visualizaciones`,
     `datasets`; ver [supabase/schema.sql](supabase/schema.sql)). El ticker, el home, las
     páginas de listado y el buscador leen de ahí en runtime. Ojo: `schema.sql` es
     seed/documentación — la base viva puede diferir (hay informes en producción que no
     están en el seed).
   - **16 páginas de informe hardcodeadas** como componentes JSX
     (`src/pages/Informe*.jsx`), cada una con sus datos inline (`const TASAS_PRINCIPALES = [...]`,
     `HERO_STATS`, etc.) y su propia copia de los componentes `MC`, `ChartCard`, `SH`,
     `DownloadableViz`, `fadeUp`. La tabla `informes` tiene un flag `custom` que marca
     estos casos; `/informes/:id` ([InformeDetalle.jsx](src/pages/InformeDetalle.jsx)) solo
     renderiza los no-custom.

   **Implicancia para Fase 1:** "agregar `polaridad` a mockData.js" se traduce en
   (a) una columna nueva en la tabla `reportes_rapidos` de la base viva, y
   (b) declarar polaridad en los datos inline de cada página de informe custom.

2. **Los gráficos son Chart.js (react-chartjs-2), no Recharts.** Los colores de serie
   viven tanto en código (`B[200]`/`B[500]` en los informes custom) como en **datos**: los
   `chart_data` de Supabase traen `backgroundColor` hardcodeado por fila
   (schema.sql:358 — un arcoíris de 8 colores para 8 partidos). Migrar a `--data-1..4`
   implica tocar también los JSON de la base.

3. **No hay shadcn/ui** (solo un [badge.jsx](src/components/ui/badge.jsx) propio) y la
   tipografía real es **Poppins vía CDN de Google Fonts** ([index.html:37-39](index.html#L37-L39)).
   Curiosidad: `@fontsource/poppins` y `@fontsource/playfair-display` están instalados
   ([package.json:12-13](package.json#L12-L13)) y hay `.woff2` copiados en `public/fonts/`,
   pero **nada los referencia** — restos de un intento anterior de self-hosting. Fase 2
   puede reciclar ese camino.

Otros nombres: el "Atlas" del brief es [MedidorMunicipal.jsx](src/components/MedidorMunicipal.jsx)
(el componente se llama `AtlasMunicipal` y el h2 dice "Atlas Municipal"). En el home hay
**dos** tickers: [TickerBar](src/components/shared/TickerBar.jsx) (indicadores, arriba del
hero) y `PublicacionesTicker` (cards de tweets, [Home.jsx:39-87](src/pages/Home.jsx#L39-L87)).

---

## 1. Usos de framer-motion

`framer-motion` se importa en **27 archivos** ([App.jsx:3](src/App.jsx#L3) con
`LazyMotion domAnimation` + 26 con `import { m }`). Hay **~349 props de animación**
(`initial`/`animate`/`whileInView`/`fadeUp`). **Todas son animaciones de entrada de
layout**; no hay ninguna transición de estado hecha con framer-motion.

| Archivo | Usos | Tipo |
|---|---|---|
| InformeSaludConurbano.jsx | 31 | `fadeUp` helper (opacity 0→1, y 24→0, 0.55s, stagger) en cada bloque |
| InformeKPMGIIBB.jsx | 31 | ídem |
| InformeRENABAP.jsx | 29 | ídem |
| InformeHomicidiosPBA.jsx | 26 | ídem |
| InformeMineriaPBA.jsx | 21 | ídem |
| InformeEmpleoPblicoPBA.jsx | 20 | ídem |
| InformeCAFEstadoMunicipal.jsx | 20 | ídem |
| InformeAgroindustriaPBA.jsx | 19 | ídem |
| InformeRankingFiscalPBA.jsx | 19 | ídem |
| QuienesSomos.jsx | 18 | fade-up + `x:±20` + **barras que crecen** (`width: 0 → pct%`, QuienesSomos.jsx:56-62) |
| InformeIndustriaManufactureraPBA.jsx | 17 | fadeUp |
| InformeIndiceFADA.jsx | 16 | fadeUp |
| InformePresupuestoGeneroPBA.jsx | 16 | fadeUp |
| InformeMercadoTrabajoGBA.jsx | 15 | `fadeUp` definido en [InformeMercadoTrabajoGBA.jsx:87-92](src/pages/InformeMercadoTrabajoGBA.jsx#L87-L92) |
| InformePBGPBA.jsx | 15 | fadeUp |
| InformeMedicamentosTISH.jsx | 14 | fadeUp |
| Home.jsx | 6 | hero, panel de viz, FeaturedInformeCard |
| Datos.jsx / ReportesRapidos.jsx / Informes.jsx / Hilos.jsx / InformeDetalle.jsx | 1-3 c/u | fade-up del header de página |
| EntryCard / HiloCard / ReporteCard / VizCard | 2 c/u | fade-up con `delay: index * 0.05-0.08` (stagger en grillas) |

Animaciones fuera de framer-motion:
- Ticker CSS infinito de 50s ([index.css:55-66](src/index.css#L55-L66)), usado por los dos
  tickers. **Es la única animación envuelta en `prefers-reduced-motion`**
  ([index.css:68-75](src/index.css#L68-L75)).
- Navbar que muta a píldora con `transition-all duration-300` ([Layout.jsx:45-47](src/components/Layout.jsx#L45-L47)).
- Barras de indicadores del Atlas con `transition-all duration-500` (MedidorMunicipal.jsx:470, 865, 932).
- `scroll-behavior: smooth` global ([index.css:26-28](src/index.css#L26-L28)).

**Ningún uso de framer-motion respeta `prefers-reduced-motion`** (cero `useReducedMotion`
en el repo).

---

## 2. Gradientes, sombras y blurs

### Gradientes
| Dónde | Qué |
|---|---|
| [index.css:39](src/index.css#L39) | **Franjas diagonales azules** como SVG inline de fondo en `body` (8 polígonos, opacidad 0.028–0.048) — cubre todo el sitio en modo claro |
| [index.css:50-53](src/index.css#L50-L53) | `.bg-pattern-dark`: grilla de puntos con `radial-gradient` — usada en hero del home, hero de informe y bloque "El argumento" |
| [Home.jsx:43](src/pages/Home.jsx#L43) | `bg-gradient-to-b from-white/60 to-transparent` en sección Publicaciones |
| [Home.jsx:83](src/pages/Home.jsx#L83) | fade lateral `bg-gradient-to-l from-white` sobre el ticker de publicaciones |
| MedidorMunicipal.jsx:481, 932, 1001, 1021 | 4 `linear-gradient` en leyendas y barras del Atlas (uso semántico: escalas de color) |
| InformeKPMGIIBB.jsx:258, 393, 418, 432; InformeCAFEstadoMunicipal.jsx:235; InformeRENABAP.jsx:722 | gradientes decorativos inline en cards |

### Sombras
- Navbar: `shadow-sm` reposo / `shadow-lg` flotante ([Layout.jsx:46](src/components/Layout.jsx#L46)).
- Botón scroll-to-top: `shadow-lg hover:shadow-xl` ([Layout.jsx:203](src/components/Layout.jsx#L203)).
- Cards compartidas: `hover:shadow-md` en EntryCard:13, HiloCard:12, ReporteCard:41,
  FeaturedInformeCard (Home.jsx:155), BetaCard (Beta.jsx:25).
- Informes custom: `boxShadow: '0 1px 3px rgba(0,0,0,0.04)'` repetido en **~46 puntos**
  (cards `MC`, `ChartCard`, tablas — p. ej. InformeMercadoTrabajoGBA.jsx:218, 229, 615).
- Atlas: `shadow-sm` en mapa y panel (MedidorMunicipal.jsx:1057, 1072) + `box-shadow` en tooltip (1088).
- SearchOverlay: `shadow-2xl` (SearchOverlay.jsx:71).

### Blurs
- `backdrop-blur-md` en el navbar flotante ([Layout.jsx:46](src/components/Layout.jsx#L46)).
- `backdrop-blur-sm` en el overlay de búsqueda (SearchOverlay.jsx:68).

---

## 3. Radios, por frecuencia

Dos sistemas conviven: clases Tailwind (shell del sitio) y `borderRadius` inline (informes
custom). Conteo aproximado (el barrido inline se corta en 250 resultados: son **250+**):

| Radio | Frecuencia | Dónde |
|---|---|---|
| `rounded-full` / `borderRadius: 999` / `'50%'` | **~95** | píldoras de tabs del Atlas, badges de municipio, botones de link externo en "El argumento", scroll-to-top, iconos de tendencia en círculo, dots decorativos, círculos concéntricos |
| `borderRadius: 14–16` | **~85** | cards `MC` y `ChartCard` de todos los informes custom, KPI del hero de informe |
| `rounded-xl` (12px) / `borderRadius: 12` | **~45** | EntryCard, HiloCard, ReporteCard, VizCard, mapa y panel del Atlas, nota metodológica |
| `rounded-lg` (8px) / `borderRadius: 8` | **~35** | nav links, botones, inputs, botón "Descargar PNG" |
| `rounded-2xl` (16px) | **~12** | **navbar flotante** (Layout.jsx:46), cards de tweets (Home.jsx:55), stats de QuiénesSomos, hallazgos clave de InformeDetalle:75, empty de Datos:20 |
| `borderRadius: 20` | **~15** | bloque "El argumento" de cada informe |
| `borderRadius: 4–6` | **~40** | barras de Chart.js, swatches de leyenda |
| `rounded-md` | 1 | Badge (badge.jsx:13) |
| `rounded-sm` | ~6 | swatches de leyenda del Atlas |

No hay ningún token de radio: cada componente decide el suyo. Ocho valores distintos en uso.

---

## 4. Colores realmente en uso, rol y contraste

### Interfaz
| Color | Rol |
|---|---|
| `#0a1628` (ink) | texto principal, hero, footer, bloques oscuros |
| brand `#edf1f8 → #152952` ([tailwind.config.js:18-29](tailwind.config.js#L18-L29)) | acento azul: links, badges, eyebrows, nav activo, mapas |
| escala slate de Tailwind | texto secundario (`slate-500/600`), captions (`slate-400`), bordes (`slate-100/200`) |
| `#f7f6f2` (`--c-bg`) | fondo crema global ([index.css:7](src/index.css#L7)) |
| `#fffbeb` + `#d97706` | callout crema/naranja de la nota metodológica (InformeMercadoTrabajoGBA.jsx:509-516) |
| `purple-400/100/700` | "color de marca" de Publicaciones/hilos; `amber` para Reportes en buscador |

### Dato
| Color | Rol |
|---|---|
| `#93c5fd` azul, `#fde68a` amarillo, `#a5f3fc` cyan, `#6ee7b7` verde | **los 4 KPI del hero de informe, asignados por posición, sin criterio** ([InformeMercadoTrabajoGBA.jsx:78-83](src/pages/InformeMercadoTrabajoGBA.jsx#L78-L83)) — el verde le tocó a la tasa de actividad, que cayó |
| `B[200]`/`B[500]` (azules de marca) | series de los gráficos de informes custom — mezcla paleta de interfaz con paleta de dato |
| arcoíris `#1ab8b8bb`, `#b91c1c`, `#b45309`, `#7c3aed`, `#0d9488`, `#c2410c`, `#0369a1` | `chart_data.backgroundColor` **dentro de los JSON de Supabase** (schema.sql:358, 378) |
| `green-600`/`green-50`, `red-500`/`red-50` | **dirección, no valoración**: ticker (TickerBar.jsx:14-16, 27) y ReporteCard.jsx:5-33 |
| `#15803d`/`#b91c1c`, `CUMPLIMIENTO_COLORS`, rampas `hsl()` | semánticas ad-hoc del Atlas (MedidorMunicipal.jsx:239-251, 346-352, 883) |

**La paleta de Twitter (magenta `#E11D74`, teal `#0D9488`, cyan `#22D3EE`) no existe en el
sitio.** El único match es accidental: `#0d9488` para "pesos fijos/l" en tasa vial
(MedidorMunicipal.jsx:361).

### Contraste (WCAG, calculado)
| Par | Ratio | Veredicto |
|---|---|---|
| `#475569` cuerpo s/ blanco y s/ crema | 7.6 / 7.0 | ✔ AA |
| `#1a3d7c` links s/ blanco | 10.5 | ✔ |
| `#93c5fd` titular acento s/ `#0a1628` | 10.1 | ✔ (el problema es semántico, no de contraste) |
| `#64748b` slate-500 s/ blanco | 4.8 | ✔ justo |
| **`#94a3b8` slate-400 s/ blanco** | **2.6** | ✘ — y es el color de captions, fechas, unidades y fuentes en 10–13px por todo el sitio |
| **`#cbd5e1` slate-300 s/ blanco** | **1.5** | ✘ — fechas del footer de cards (Layout.jsx:140, ReporteCard.jsx:59) |
| **`green-600` s/ blanco** | **3.3** | ✘ para el texto de 12px de variación del ticker |
| **`red-500` s/ blanco** | **3.8** | ✘ ídem |
| `rgba(255,255,255,.45)` labels de KPI hero s/ ink | 4.5 | límite exacto, a 0.78rem |
| **`rgba(255,255,255,.35)`** labels de ficha del hero | **3.2** | ✘ a 0.68rem |
| **`#d97706` s/ `#fffbeb`** label "Nota metodológica" | **3.1** | ✘ a 0.72rem |

### Extra: dark mode muerto
Hay cientos de clases `dark:` en todo el sitio, pero el toggle fue deshabilitado: el
[ThemeContext.jsx:7-14](src/context/ThemeContext.jsx#L7-L14) fuerza modo claro y borra la
preferencia guardada. `Sun`/`Moon`/`toggle` se importan y no se usan (Layout.jsx:3, 21).
Además TickerBar y varios informes custom **no** tienen variantes dark → si se reactivara,
quedaría inconsistente. Decisión pendiente: eliminar el dark mode del código o soportarlo
de verdad (afecta Fases 2–3).

---

## 5. Iconos de lucide

| Icono | Dónde | Clasificación |
|---|---|---|
| `Menu`, `X`, `Search`, `ArrowLeft`, `ArrowUp`, `Download`, `ExternalLink` | navegación, buscador, volver, scroll-top, descargas | **Funcional** |
| `Sun`, `Moon` | Layout.jsx:3 | Importados, **sin uso** |
| `TrendingUp`, `TrendingDown`, `Minus` | TickerBar, ReporteCard | Funcional en intención (estado) pero **codifica dirección con color de valoración** — el icono está bien, el color no |
| `ChevronRight`, `ArrowRight` | "Leer informe", "Ver todos" | Affordance, aceptable |
| `Calendar`, `MapPin` | fechas y municipios en cards | **Decorativo**: repiten lo que el texto ya dice |
| `Mail`, `Twitter` | footer de contacto | Funcional (identifican el canal) |
| `BarChart2`, `Database`, `FileText`, `Users`, `Target`, `Eye`, `TrendingUp` | QuienesSomos.jsx:3 — junto a títulos de stats y "pilares" | **Decorativo puro**, el caso de libro del anti-slop §2 |
| `Download` en círculo | empty state de Datos.jsx:20-22 | Decorativo (icono en contenedor redondeado, media pantalla) |

---

## 6. Copy del sitio, literal

### Header ([Layout.jsx](src/components/Layout.jsx))
- Logo: "Datos**PBA**" + tagline: "Análisis basado en evidencia<br/>para la Provincia de Buenos Aires."
- Nav: "Informes · Publicaciones · ¿Quiénes somos? · Datasets · Beta"
- Botón: "Buscar" + kbd "Ctrl K"

### Home ([Home.jsx](src/pages/Home.jsx))
- Eyebrow: "DATOSPBA · PROVINCIA DE BUENOS AIRES"
- H1: "La provincia,<br/>contada con **datos**." (última palabra en `#3d65b2`… en realidad `text-brand-400`)
- Bajada: "Análisis e informes sobre política, economía y territorio bonaerense, basados en evidencia."
- Trío de stats: "135 / MUNICIPIOS", "17M+ / HABITANTES", "2026 / ACTUALIZADO" (el año es `new Date().getFullYear()`)
- Panel derecho: "● ÚLTIMO INFORME" (dot decorativo) → "Ver informe completo →"
- Secciones: "Informes / Ver todos →", "Publicaciones / Ver todos →", "DESTACADO", "Leer informe"

### Atlas ([MedidorMunicipal.jsx](src/components/MedidorMunicipal.jsx))
- H2: "Atlas Municipal". Tabs: "Información general · Índice de producción · Economía municipal · Tasas municipales **PRÓX.** · Tasa vial · Transparencia fiscal · Gasto concejales"
- Empty state (icono de mapa en círculo, media pantalla): "Seleccioná un municipio" / "Hacé clic sobre cualquier partido del mapa para ver sus indicadores." / (concejales) "Solo los municipios coloreados tienen datos. Hacé clic para ver el detalle."
- "Sin datos disponibles para este partido." / "Cargando mapa..." / "No se pudo cargar el mapa."

### Ticker ([TickerBar.jsx](src/components/shared/TickerBar.jsx) + seed de `reportes_rapidos`)
- "Desempleo GBA - 4to trim. 2025 / 8,6% / +1,5 pp" (verde ↑), "Empleo informal - Conurbano / 42,3% / +1,2 pp" (verde ↑), "Gasto en seguridad - Presupuesto 2026 / +28% real" (verde ↑), "Sin cobertura de salud - Tercer cordón / 29,4% / +1,8 pp" (verde ↑), "Caída de matrícula secundaria / −4,2% vs. 2019" (rojo ↓), "Deuda municipal per cápita promedio / $48.200 / +$4.200" (verde ↑)

### Páginas de listado
- Informes: "Informes" / "Análisis en profundidad sobre política, fiscalidad, producción y gestión municipal" / vacío: "No se encontraron informes con los filtros seleccionados."
- Hilos: "Hilos y publicaciones destacadas" / "Análisis en formato hilo para redes sociales" / vacío análogo
- Reportes: "Reportes rápidos" / "Datos puntuales, comparativas y hallazgos concisos"
- Datos: "Base de datos y descargas" / "Datasets abiertos para análisis independiente" / "PRÓXIMAMENTE" / "Datasets en preparación" / "Estamos preparando los datasets para su descarga. Pronto vas a poder acceder a los datos abiertos de forma directa desde acá." / "Mientras tanto, explorá los informes →"

### Buscador ([SearchOverlay.jsx](src/components/SearchOverlay.jsx))
- "Buscar en DatosPBA..." / "Sin resultados para "{query}"" / "Escribí al menos 2 caracteres para buscar"

### Beta ([Beta.jsx](src/pages/Beta.jsx))
- "BETA" / "Explorador de contenido" / **"Todo el contenido de DatosPBA en un solo lugar."** (frase prohibida literal del anti-slop §8) / "{n} resultados en..." / "No se encontraron resultados."

### ¿Quiénes somos? ([QuienesSomos.jsx](src/pages/QuienesSomos.jsx))
- H1: "Análisis político y datos abiertos<br/>**para Buenos Aires**" (segunda línea en acento)
- "DatosPBA es un repositorio independiente de análisis basado en evidencia sobre la Provincia de Buenos Aires. Procesamos datos públicos para hacer accesible lo que las estadísticas oficiales dejan sin explicar."
- Stats: "Informes publicados / Datasets abiertos / Municipios analizados (135) / Bonaerenses representados (17M+)"
- Pilares: "Transparencia / Precisión / Relevancia" (con iconos)
- "Nuestra misión" (3 párrafos) · "Cobertura temática" · "Distribución geográfica" · "¿Qué producimos?" ("Informes / Reportes rápidos / Datasets")

### Informe tipo ([InformeMercadoTrabajoGBA.jsx](src/pages/InformeMercadoTrabajoGBA.jsx))
- "← Volver a informes" / eyebrow "INDEC · EPH · PRIMER TRIMESTRE 2026"
- H1: "Mercado de trabajo en<br/>**los partidos del GBA**" (segunda línea en `#93c5fd`)
- Ficha del hero: "FUENTE / UNIVERSO / PERÍODO / ACTUALIZACIÓN" ← **esto ya es la signature buscada; existe y está bien resuelto en contenido**
- Secciones: "01 · PANORAMA GENERAL — Las tasas principales" / "02 · SUBOCUPACIÓN — El ajuste por horas" / "03 · MAGNITUDES ABSOLUTAS — De tasas a personas" / "04 · CONTEXTO — La brecha con CABA"
- Botón: "Descargar PNG" / estado busy: "generando…"
- "NOTA METODOLÓGICA" (callout crema/naranja)
- "EL ARGUMENTO": "La desocupación del conurbano no subió, pero el mercado de trabajo se deterioró igual: cayeron la actividad y el empleo, y **76.000 personas más** pasaron a trabajar menos horas de las que necesitan. El ajuste fue por horas, no por despidos — y la brecha con CABA sigue duplicando la desocupación." (con "76.000 personas más" en acento y guion largo retórico)
- Footer: "FUENTES" + citas completas

### Footer del sitio ([Layout.jsx:131-197](src/components/Layout.jsx#L131-L197))
- "Repositorio de análisis político y datos abiertos sobre la Provincia de Buenos Aires."
- "ANÁLISIS BASADO EN EVIDENCIA" (segunda aparición de la tagline)
- "CONTENIDO" (nav) / "CONTACTO" (contacto@datospba.com, @datospba)
- "© 2026 DatosPBA" / "PROVINCIA DE BUENOS AIRES"

### InformeDetalle (informes no-custom)
- "Informe no encontrado." / "← Volver a informes" / "HALLAZGOS CLAVE" / "Visualizaciones" / "Fuentes"

---

## 7. Espaciados verticales de sección

Un solo nivel de ritmo, con leves variaciones:

| Contexto | Valor |
|---|---|
| Home: wrapper de secciones | `py-16` (Home.jsx:349), cada sección `mb-16` |
| Home: hero | `py-10 sm:py-14` |
| Páginas de listado (Informes, Hilos, Datos, Reportes, QuiénesSomos) | `py-16` + header `mb-10` |
| QuiénesSomos: entre bloques | `mb-16` / `mb-20` |
| Layout: sección contacto | `mt-16` + `py-16`; footer `py-5` |
| Informe custom: hero | `pt-10 pb-16` |
| Informe custom: secciones | `pb-12` + `marginTop: 3rem` del `SH` (~48px reales entre secciones) |
| Informe custom: nota metodológica / conclusión | `py-10` / `pb-16` |

Es el "ritmo plano" que el skill marca como tell: prácticamente todo separa con 64px
(`py-16`) y no hay distinción denso/normal/aire. No existen los anchos separados
lectura/datos: el shell usa `max-w-7xl` y los informes `max-w-5xl` con párrafos limitados
a `72ch` inline.

---

## 8. Esquema de datos real

### Supabase (fuente: [supabase/schema.sql](supabase/schema.sql) — seed, puede divergir de la DB viva)

```
informes          { id (slug), titulo, bajada, fecha (texto es-AR), fecha_orden (date),
                    tema, municipios jsonb[], cuerpo jsonb[] (párrafos string | {viz: id}),
                    insights jsonb[], url ('/informes/<id>'), imagen, custom bool, fuentes jsonb[] }
reportes_rapidos  { id, titulo, dato (string ya formateado: '8,6%'), descripcion,
                    fecha, fecha_orden, tendencia ('sube'|'baja'|otro), variacion ('+1,5 pp') }
                  ← el indicador del ticker. NO tiene polaridad, unidad, fuente ni período
                    como campos: todo va embebido en strings.
visualizaciones   { id, titulo, tema, tipo ('bar'|'line'|'tabla'), fuente, fecha, fecha_orden,
                    informe_url, chart_data (estructura Chart.js CON colores hardcodeados),
                    chart_options, table_data }
hilos             { id, titulo, resumen, fecha, fecha_orden, tema, plataforma, tags, url, imagen }
datasets          { id, nombre, descripcion, formato, cobertura, variables, registros,
                    fecha_actualizacion, fecha_orden, preview jsonb }
```

Los componentes toleran `snake_case` y `camelCase` (`v.chart_data ?? v.chartData`,
VizCard.jsx:216-219) — herencia del mock previo.

### Informes custom (16 páginas JSX)
Cada página define arrays inline (`TASAS_PRINCIPALES`, `HERO_STATS`, `POBLACION_TABLA`…)
con shapes ad-hoc por informe, más copias locales de `C` (colores), `B` (paleta), `fadeUp`,
`SectionLabel`, `SH`, `MC`, `ChartCard`, `DownloadableViz`, `drawFooter`. La unificación en
`<Cifra>` (Fase 1) implica extraer estos componentes repetidos a `src/components/` — hoy
hay ~16 copias casi idénticas de cada uno.

---

## 9. Meta tags y prerender

- **Todo vive en [index.html](index.html)**: title, description, OG y Twitter card únicos y
  estáticos para todo el sitio. `og:image` global (`/og-image.png`). JSON-LD de Organization.
- **No hay SSR ni prerender**: Vite SPA pura + rewrite total a `index.html`
  ([vercel.json](vercel.json)). No hay `react-helmet` ni siquiera `document.title` por
  ruta: **todas las páginas comparten título y OG**, confirmando el punto 1 de Fase 5.
- No hay `sitemap.xml` ni RSS (solo verificación de Google en `public/`).
- Sí hay code splitting por ruta (`lazy()` en App.jsx) y `manualChunks` para
  framer-motion/chart/leaflet ([vite.config.js:20-26](vite.config.js#L20-L26)) — la Fase 5.4
  está parcialmente hecha; falta diferir Leaflet/Chart.js a nivel de interacción.

---

## 10. Por qué la sección "Informes" del home aparece vacía

No es un bug de lazy loading. Son tres causas apiladas en [Home.jsx:266-296](src/pages/Home.jsx#L266-L296):

1. **No hay estado de carga.** `informes` arranca `[]` y la sección se renderiza
   igual (header "Informes" + grilla vacía) mientras las 4 queries a Supabase resuelven.
   En una conexión normal son cientos de ms viendo la sección vacía; el hero tampoco
   muestra el panel de viz (`heroData` null) y el layout "salta" cuando llegan los datos.
2. **Los errores se silencian.** Supabase no rechaza la promesa: devuelve
   `{ data: null, error }`. El código hace `setInformes(inf || [])` sin mirar `error`
   → cualquier fallo de red/RLS/clave deja la sección vacía **permanentemente y sin
   mensaje**. Lo mismo en Informes.jsx, Hilos.jsx, ReportesRapidos.jsx, Beta, SearchOverlay.
3. **En local sin `.env` el sitio directamente no renderiza:** no hay `.env` en el repo y
   [supabase.js](src/lib/supabase.js) hace `createClient(undefined, undefined)`, que tira
   excepción al importar el módulo → páginas lazy en blanco (esto ya está documentado en
   la memoria del proyecto).

Arreglo en Fase 4: estado de carga explícito (skeleton o reserva de altura), manejo de
`error` con mensaje escrito a mano, y opcionalmente cachear la última respuesta.

---

## Cierre

### Puntos del diagnóstico confirmados (los 8 de rigor)

| # | Punto | Veredicto |
|---|---|---|
| 1 | Ticker verde para desempleo/informalidad que suben | **Confirmado** — TickerBar.jsx:14-27 colorea por `tendencia` (dirección); 5 de los 6 ítems del seed muestran verde en deterioros |
| 2 | 4 KPI del hero en 4 colores sin criterio, verde en la que cayó | **Confirmado** — InformeMercadoTrabajoGBA.jsx:78-83; el patrón se repite en los otros informes custom |
| 3 | Dos sistemas de color para cifras | **Confirmado** — hero multicolor vs. `MC` monocromo azul en secciones |
| 4 | Paleta no coincide con Twitter | **Confirmado** — magenta/teal/cyan no existen en el código |
| 5 | KPI repetidos hero + sección 01 | **Confirmado** — 9,7% / 48,0% / 43,4% / 12,1% aparecen en HERO_STATS y otra vez en las cards MC de las secciones 01-02 |
| 6 | "El argumento" al final | **Confirmado** — línea 671-728, después de la nota metodológica |
| 7 | Navbar tapa contenido / falta scroll-margin-top | **Confirmado a medias** — no existe ningún `scroll-margin` en el repo y el navbar es sticky; pero tampoco hay anclajes internos hoy (los `id` de VizCard son el único destino linkeable). Es deuda latente, no rotura visible |
| 8 | Sección "Informes" vacía | **Confirmado con causa** — ver §10: sin loading state + errores silenciados; no es lazy loading |

### Tells de IA del brief: todos confirmados
Palabra/línea final en acento sistematizada en 3+ lugares (Home h1, h1 de cada informe
custom, "El argumento", QuiénesSomos h1); Poppins geométrica sin numerales tabulares (los
únicos `tabular-nums` del repo son los 3 stats decorativos del hero, Home.jsx:325-333 — 
exactamente donde menos importan); trío 135/17M+/2026; eyebrows en 4+ variantes por página
(home: "DATOSPBA · PBA", "ÚLTIMO INFORME", "DESTACADO"; informe: ficha, "01 · …" ×4,
"NOTA METODOLÓGICA", "EL ARGUMENTO", "FUENTES"); numeración 01-04 decorativa; plantilla de
sección idéntica ×4 con botón "Descargar PNG" huérfano arriba a la derecha; cards
redondeadas con borde izquierdo de color (EntryCard, HiloCard, ReporteCard, BetaCard,
PublicacionesTicker) sobre fondo crema; navbar píldora; scroll-to-top circular; círculos
concéntricos en "El argumento" (×2 por informe, líneas 681-690 del GBA); píldoras en 7+
componentes; empty state con icono en círculo (Atlas y Datos); callout crema/naranja;
franjas diagonales de fondo (en el **body entero**, no solo la mitad inferior del home);
densidad: el informe GBA entrega sus ~10 cifras clave en ~6 pantallas.

### Lo que el brief asume y no existe
- `mockData.js` / Recharts / shadcn (ver §0).
- El navbar no está "flotante despegado del borde" en reposo: arranca como barra sticky
  normal y **se convierte** en píldora flotante al scrollear 60px (Layout.jsx:45-46).
- Anclajes internos que el navbar taparía: hoy casi no hay (§ arriba).

### Hallazgos propios, no listados en el brief
1. **Rigor / QuiénesSomos**: "Cobertura temática" (88%, 72%, 65%…) y "Distribución
   geográfica" (18/21/12/84 partidos "analizados") son datos hardcodeados sin fuente y
   con toda la pinta de ser inventados — con ~16 informes publicados es imposible que el
   88% de 135 municipios tenga análisis de economía. En un sitio cuyo diferencial es el
   rigor, es el hallazgo más grave fuera del ticker. (QuienesSomos.jsx:31-46)
2. **Dark mode muerto**: cientos de clases `dark:` + ThemeContext que lo fuerza apagado
   (§4). Decidir: borrar o soportar.
3. **Dependencias muertas**: `@fontsource/*` instaladas sin importar; woff2 huérfanos en
   `public/fonts/`; `Sun`/`Moon` sin uso.
4. **Accesibilidad de tickers**: los ítems se duplican ×4 para el loop CSS sin
   `aria-hidden` en las copias (TickerBar.jsx:5, Home.jsx:41) → un lector de pantalla lee
   todo cuatro veces; tampoco hay control de pausa (solo hover).
5. **Gráficos sin capa accesible**: ningún `role="img"`, `aria-label` ni tabla fallback
   (ya previsto en Fase 5.5, lo confirmo: hoy no existe nada).
6. **No hay página 404**: las rutas desconocidas fuera de `/informes/:id` no matchean
   ningún `Route` → página en blanco con header y footer. `/informes/:id` inexistente sí
   tiene mensaje ("Informe no encontrado").
7. **`InformeDetalle` devuelve `null` durante la carga** (InformeDetalle.jsx:26): pantalla
   en blanco entre click y datos.
8. **Los colores de serie viven en los datos**: migrar la paleta (Fase 1.5) exige editar
   los `chart_data` de la base viva, no solo código.
9. **`schema.sql` está desactualizado** respecto de la DB de producción (memoria del
   proyecto): antes de tocar `reportes_rapidos` en Fase 1 hay que relevar la tabla real.
10. **El buscador cachea el índice en módulo** (`cachedIndex`, SearchOverlay.jsx:6): si la
    primera carga falla, queda vacío hasta recargar la página.
11. **Duplicación estructural**: ~16 copias de `MC`/`ChartCard`/`SH`/`fadeUp`/`drawFooter`
    en las páginas de informe. Cualquier cambio de Fase 1-4 conviene hacerlo extrayendo
    componentes compartidos primero, o se multiplica ×16.
12. **`overflow-x: hidden` en body** (index.css:37): probablemente enmascara un overflow
    horizontal real; al desmontar gradientes/franjas revisar qué tapaba.
