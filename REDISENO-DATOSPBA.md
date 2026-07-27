# Rediseño Datos PBA — brief para Claude Code

Sos el diseñador de producto y desarrollador frontend a cargo del rediseño de
**datospba.com**, una publicación independiente de periodismo de datos sobre la
Provincia de Buenos Aires.

Stack: React + Vite + React Router + Tailwind + shadcn/ui + framer-motion +
lucide-react + Recharts + Leaflet. El contenido vive en
`src/components/data/mockData.js`.

## Skills

Antes de empezar, leé y aplicá durante todo el trabajo:

- `design-system-datospba` — es la **fuente de verdad**. Ante cualquier duda de color,
  tipografía, espaciado, componente o voz, se consulta ahí antes de decidir.
- `anti-slop-audit` — es el **filtro**. Se corre sobre cada componente antes de darlo
  por terminado y sobre el diff completo antes de cada merge.
- `frontend-design` (público de Anthropic) — usalo para el método: plan de tokens
  primero, crítica del plan contra el brief, y recién después código.

Si un skill y este documento se contradicen, gana este documento y avisame la
contradicción.

---

## Diagnóstico de partida

El sitio está bien construido: los informes tienen nota metodológica, coeficiente de
variación, fuente por gráfico y tabla de datos. Ese rigor **no se toca ni se pierde en
ningún momento del rediseño** — al contrario, el objetivo es hacerlo visible.

Los problemas son de superficie y de semántica.

### Errores de rigor (prioridad máxima)

1. **El ticker del home muestra flechas verdes hacia arriba para desempleo (8,6% +1,5 pp)
   y empleo informal (42,3% +1,2 pp).** El sitio está celebrando que suba el desempleo.
   El color codifica dirección en vez de valoración.
2. **Los 4 KPI del hero de informe están en 4 colores distintos sin criterio** (azul,
   amarillo, cyan, verde). El verde le tocó a la tasa de actividad, que **cayó** de 48,5%
   a 48,0%.
3. **Dos sistemas de color para lo mismo:** cifras multicolor en el hero, cifras
   monocromas en las secciones.
4. **La paleta del sitio (azul) no coincide con la de las piezas que Datos PBA publica en
   Twitter** (magenta `#E11D74`, teal `#0D9488`, cyan `#22D3EE`).
5. **Los mismos 4 números del hero se repiten como cards en la sección 01.**
6. **El bloque "EL ARGUMENTO" está al final del informe.** La conclusión enterrada.
7. **El navbar flotante tapa contenido al scrollear** (falta `scroll-margin-top`).
8. **La sección "Informes" del home aparece vacía** al cargar. Verificar si es bug de
   lazy loading o de datos.

### Tells de IA a eliminar

- Última palabra / segunda línea del titular en color de acento ("La provincia, contada
  con **datos**." / "Mercado de trabajo en **los partidos del GBA**" / "**76.000 personas
  más**"). Es el tell de primer orden y está sistematizado en tres lugares.
- Tipografía geométrica (Poppins / Outfit / Gilroy o similar) en display y cuerpo.
  Numerales no tabulares: las columnas de las tablas no alinean.
- Trío de stats del hero `135 / 17M+ / 2026`. "2026 — ACTUALIZADO" no es un dato.
- Eyebrows `MAYÚSCULAS · CON · PUNTOS` en cuatro variantes distintas por página.
- Numeración `01 / 02 / 03 / 04` sobre secciones que son temas, no una secuencia.
- Plantilla de sección repetida idéntica cuatro veces: eyebrow → título → regla negra →
  párrafo → cards → botón "Descargar PNG" huérfano → gráfico en card blanca.
- Cards `rounded-2xl` con sombra y borde izquierdo de color, sobre fondo crema, con más
  cards adentro.
- Navbar flotante en píldora despegada del borde, con sombra y radio grande.
- Botón circular de scroll-to-top.
- Círculos concéntricos decorativos en el card "EL ARGUMENTO".
- Píldoras en cinco componentes distintos (nav, tabs, badge "PRÓX.", botón de fuente).
- Empty state "Seleccioná un municipio" con icono en círculo, ocupando media pantalla.
- Callout crema con borde naranja para la nota metodológica.
- Gradientes diagonales de fondo en la mitad inferior del home.
- Densidad bajísima: el informe entrega ~8 cifras en 6 pantallas de scroll.

---

## Dirección

**Instrumento de medición.** El sitio se ve como el aparato que produce el dato, no como
el artículo que lo comenta.

**Signature:** la ficha técnica expuesta. Fuente, período, universo, unidad y coeficiente
de variación son elementos de diseño visibles. El contenido ya los tiene; falta que sean
lo que se ve.

**Explícitamente NO:** ni landing de SaaS, ni el default de "fondo crema + serif de alto
contraste + acento terracota", ni el default de "broadsheet con hairlines y columnas de
diario". Los tres son estéticas de IA por default.

---

## Fases

Después de cada fase: corré el build, corré `anti-slop-audit` sobre el diff, y mostrame un
resumen de qué cambió, qué quedó pendiente y qué decisiones tomaste. **Esperá mi OK antes
de la fase siguiente.**

### Fase 0 — Auditoría (no toques código)

Recorré el repo y generá `AUDIT.md` con:

1. Todos los usos de framer-motion: archivo, línea, tipo de animación.
2. Todos los gradientes, sombras y blurs.
3. Todos los `rounded-*` agrupados por frecuencia.
4. Todos los colores realmente en uso, con su rol (interfaz vs. dato) y su contraste
   sobre el fondo donde aparecen.
5. Todos los iconos de lucide, clasificados en decorativo / funcional.
6. Toda la copy del sitio transcripta literal (hero, secciones, CTAs, empty states,
   errores, footer).
7. Espaciados verticales de sección.
8. Esquema de datos de `mockData.js`: cómo está tipado un informe, una visualización y un
   indicador del ticker.
9. Dónde se definen los meta tags y si existe prerender/SSR.
10. Por qué la sección "Informes" del home aparece vacía.

Cerrá con: qué puntos del diagnóstico se confirman, cuáles no existen, y cuáles
encontraste vos que no están en esta lista.

### Fase 1 — Semántica de color (el arreglo de rigor)

Esta fase va primero porque es la que corrige errores, no estética.

1. Agregá `polaridad` (`'mayor-es-mejor' | 'menor-es-mejor' | 'neutro'`) al modelo de
   cada indicador en `mockData.js`. Completala para todos los indicadores existentes.
2. Creá un helper único `getColorVariacion({ variacion, polaridad })` que devuelva
   `--better | --worse | --neutral`. **Ningún componente decide el color por su cuenta.**
3. Reemplazá todos los verdes/rojos hardcodeados por el helper.
4. Unificá el sistema de cifras: un solo componente `<Cifra>` con valor, unidad,
   variación, período y fuente. Usalo en el ticker, en el hero de informe, en las cards
   de sección y en las tablas.
5. Migrá los colores de serie de gráficos a `--data-1..4` (magenta / teal / cyan / navy),
   para unificar con las piezas de Twitter.
6. Verificá que ninguna información dependa solo del color: flecha + color + texto.

### Fase 2 — Tokens y tipografía

1. Instalá la familia de titulares vía `@fontsource` (self-hosted, nunca CDN de Google).
   Grotesca neutra: Archivo, Public Sans o Geist. Proponeme cuál y por qué antes de
   instalar.
2. Implementá la escala tipográfica del skill con nombres semánticos.
3. `font-variant-numeric: tabular-nums` en toda cifra. Verificá que las tablas alineen.
4. Reemplazá la paleta actual por los tokens del skill. Texto secundario a contraste ≥4.5:1.
5. Radio por default a 2px. `rounded-full` solo en el badge de tema.
6. Eliminá las sombras del sistema. Separación por borde 1px o fondo sólido.
7. Tres niveles de espaciado vertical y anchos separados para lectura y para datos.

### Fase 3 — Desmontaje

1. Eliminá **todas** las animaciones de entrada de layout de framer-motion. Dejá solo
   transiciones de estado a 120–150ms. Envolvé en `prefers-reduced-motion`. Si
   framer-motion queda sin uso, sacá la dependencia.
2. Eliminá gradientes, blobs, franjas diagonales y los círculos concéntricos decorativos.
3. Eliminá el botón circular de scroll-to-top.
4. Reemplazá el navbar flotante en píldora por una barra sticky a sangre, con borde
   inferior de 1px y sin sombra. Agregá `scroll-margin-top` a todos los anclajes.
5. Eliminá los iconos decorativos. Los que queden deben comunicar estado o acción.
6. Eliminá el trío de stats del hero del home.
7. Eliminá la numeración `01 / 02 / 03 / 04` de las secciones de informe.
8. Dejá **un solo** eyebrow por página. En el informe, que sea el que carga la ficha
   (`INDEC · EPH · 1º trim. 2026`); en el home, ninguno.
9. Convertí la nota metodológica de callout crema/naranja a bloque con regla superior de
   2px y fondo `--surface-2`.
10. Reescribí la copy según §9 del skill. Empezá por: el titular del home, la tagline del
    header, el empty state del Atlas y el footer. Sin palabra final en color, sin
    paralelismos, sin "basado en evidencia" como tagline.

### Fase 4 — Jerarquía y densidad

**Informe:**

1. Mové el bloque "EL ARGUMENTO" arriba, inmediatamente después de la bajada. Renombralo
   a algo que no sea una etiqueta genérica. La tesis va primero, la evidencia después.
2. Eliminá la repetición: si los 4 KPI están en el hero, no van otra vez en la sección 01.
   Decidí en cuál de los dos lugares viven y sacalos del otro.
3. Rompé la plantilla de sección repetida. Al menos dos de las cuatro secciones deben
   tener una estructura distinta (ej: una a dos columnas texto/gráfico, una solo tabla
   densa, una a sangre completa).
4. Movés la acción de descarga debajo del gráfico, alineada a su borde izquierdo, como
   link de texto.
5. Sumá la ficha técnica bajo cada gráfico (fuente, período, universo, unidad, CV si
   aplica) como elemento de diseño visible.
6. Objetivo de densidad: el informe completo en 2–3 pantallas de scroll, no 6.

**Home:**

7. Reemplazá el trío de stats por la franja de indicadores reales, ya corregida en la
   Fase 1, con fuente y período visibles.
8. El ticker: hoy muestra 3 ítems cortados en los bordes. Convertilo en una grilla fija
   de indicadores clave, sin scroll automático, con su ficha.
9. Portada asimétrica en "Informes": un informe destacado con su visualización real y la
   cifra principal del hallazgo, y el resto como lista densa con regla de 1px (fecha,
   tema, título, bajada de una línea, cifra principal).
10. Arreglá el bug de la sección "Informes" vacía.
11. Reescribí el empty state del Atlas: sin icono en círculo, ocupando poco espacio,
    diciendo qué se obtiene al hacer clic. Considerá mostrar el ranking provincial del
    indicador seleccionado como estado por defecto en vez de un vacío.

### Fase 5 — Infraestructura

1. Prerender estático de todas las rutas (`vite-plugin-ssg` o equivalente) para que cada
   `/informes/:id` entregue HTML real. Hoy WhatsApp, Twitter y LinkedIn muestran el mismo
   OG genérico para todos los informes.
2. Meta tags y OG por informe: título, descripción y `og:image` propios. Si el informe
   tiene un PNG de visualización, usalo como `og:image`.
3. `sitemap.xml` y feed RSS generados en build time desde `mockData.js`.
4. Code splitting por ruta. Carga diferida de Recharts y de Leaflet.
5. Accesibilidad: `:focus-visible` en todo elemento interactivo, `role="img"` +
   `aria-label` con el hallazgo en cada gráfico, `<details>` con tabla de datos como
   fallback textual, estructura de headings correcta.
6. Página `/metodologia`, página 404 y estados vacíos escritos a mano.

---

## Reglas

- **No rompas** la estructura de `mockData.js` (podés extenderla) ni las URLs de
  `/informes/:id`.
- **No pierdas** ningún contenido metodológico existente: nota metodológica, coeficiente
  de variación, fuentes, tablas de datos. Si algo se mueve, decime a dónde.
- Ramas por fase, un commit por cambio conceptual, mensajes descriptivos.
- No agregues dependencias sin justificarlo.
- Si una decisión de diseño tiene dos caminos razonables, **preguntame** en lugar de
  elegir por default.
- Si algo de este brief no aplica porque el código real es distinto de lo que asumí,
  decímelo en vez de forzarlo.

## Criterios de aceptación

- [ ] Ningún color de variación se decide sin consultar la polaridad del indicador.
- [ ] Ningún titular tiene una palabra o línea en color de acento.
- [ ] Toda cifra usa numerales tabulares y tiene fuente y período accesibles.
- [ ] Contraste AA verificado en toda la paleta final.
- [ ] Sin animaciones de entrada de layout. `prefers-reduced-motion` respetado.
- [ ] Un solo eyebrow por página. Cero numeración decorativa de secciones.
- [ ] El informe entra en 2–3 pantallas de scroll.
- [ ] Cada `/informes/:id` entrega HTML con OG propio.
- [ ] `anti-slop-audit` sobre el sitio completo devuelve cero hallazgos de severidad alta.
