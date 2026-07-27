---
name: generador-informe
description: >
  Activa cuando el usuario quiera crear un informe nuevo para Datos PBA en el
  estilo visual de InformeMercadoTrabajoGBA.jsx. También cuando el usuario diga
  "haceme un informe", "armá una nota" o "quiero publicar esto en Datos PBA" y
  haya datos de base. No activar si no hay contenido de base.
---

# Generador de Informes — Datos PBA

## Rol

Sos un analista político especializado en la Provincia de Buenos Aires. Cuando se
activa este skill, leés el material provisto, lo encuadrás políticamente y construís
un informe JSX listo para publicar, con el diseño del informe de referencia.

---

## Diseño de referencia

El informe de referencia es **`src/pages/InformeMercadoTrabajoGBA.jsx`**. Todo informe
nuevo replica su estructura y sus componentes.

La fuente de verdad del sistema de diseño es el skill **`design-system-datospba`**
(`.claude/skills/design-system-datospba/skill.md`). Ante cualquier duda de color,
tipografía o densidad que este documento no resuelva, manda ese skill. Antes de
dar un informe por terminado, pasalo por **`anti-slop-audit`**.

Los informes anteriores a julio de 2026 (`InformeAgroindustriaPBA.jsx`,
`InformeEmpleoPblicoPBA.jsx`) todavía conservan restos del diseño viejo —
componentes `MC`, `Tag`, secciones numeradas. **No los uses como referencia.**

---

## Tokens: no inventar colores

Los colores salen de `src/index.css` (variables CSS) y de `src/lib/variacion.js`
(equivalentes hex para Chart.js, que pinta sobre canvas y no resuelve variables).

**Interfaz** — se usan como `var(--c-bg)`, `var(--c-ink)`, etc.:

| Token | Uso |
|---|---|
| `--c-bg` / `--surface` | fondo de página (blanco) |
| `--surface-2` | fondo de bloque diferenciado (nota metodológica) |
| `--c-ink` | texto principal y títulos (`#0F172A`) |
| `--c-ink-mid` | cuerpo de texto |
| `--c-ink-light` | metadata, etiquetas de ficha |
| `--c-rule` | bordes y reglas de 1px |

El hero usa `#0F172A` sólido como fondo.

**No hay color de acento por tema.** El azul, el dorado o el verde según el tema
del informe eran del diseño viejo: se eliminaron. Un solo sistema de color para
todos los informes.

**Series de gráfico** — importar de `@/lib/variacion`:

```js
import { DATA, DATA_BORDES } from '@/lib/variacion'
// DATA[1] #E11D74 magenta — serie principal / PBA
// DATA[2] #0D9488 teal    — serie de comparación / Nación
// DATA[3] #22D3EE cyan    — tercera serie (sobre blanco pedir borde DATA_BORDES[3])
// DATA[4] #0F172A navy    — total / agregado
```

**Tipografía**: Archivo, self-hosted vía `@fontsource`. Ya está aplicada
globalmente: no declarar `font-family` en el informe salvo en los `font` de
Chart.js, donde va `'Archivo, sans-serif'`. Toda cifra lleva `tabular-nums`.

---

## Semántica de color: la regla que no se negocia

**El color de una variación codifica valoración —mejoró o empeoró—, nunca
dirección —subió o bajó.** Una suba del empleo y una baja del desempleo se
pintan igual, porque las dos son buenas noticias.

Por eso ningún color de variación se escribe a mano. Cada cifra declara la
**polaridad** de su indicador y el color lo deriva el sistema:

- `'mayor-es-mejor'` — empleo, exportaciones, obra pública, inversión
- `'menor-es-mejor'` — desempleo, informalidad, deuda, presión tributaria
- `'neutro'` — sin dirección deseable clara: composiciones, totales de
  referencia, poblaciones. **Ante la duda, neutro.**

En JSX la polaridad se pasa como prop a `<Cifra>`. En una tabla, el color de la
celda de variación sale de `getColorVariacion({ variacion, polaridad, texto: true })`.
Nunca de un hex escrito a mano.

La variación siempre muestra **flecha + color + texto**: tres canales, ninguno
depende solo del color. Eso ya lo resuelve `<Cifra>`.

---

## Estructura de la página

Un informe tiene esta secuencia. **La tesis va arriba, la evidencia después.**

**1. Hero (fondo `#0F172A`)**
Link "Volver a informes". Un único eyebrow con la ficha de la fuente
(`INDEC · EPH · Primer trimestre 2026`) — es el único eyebrow permitido en toda
la página. Título en blanco, sin palabra ni línea en color. Bajada de 2–3
oraciones. Grid de 4 `<Cifra dark size="xl">` con label, valor, variación,
polaridad y período. Fila inferior de metadata: fuente, universo, período,
actualización.

**2. Tesis (fondo claro, inmediatamente después del hero)**
Bloque con regla superior de 2px. Un `h2` con **titular propio y específico**
—no "El argumento", "La conclusión" ni "En síntesis"— y el párrafo con la tesis
del informe. La cifra clave va en `<strong>`, sin color.

**3. Cuerpo de secciones (sin numerar)**
Encabezado `SH` con el título y regla inferior de 2px. **Sin números 01, 02, 03**
y sin eyebrow por sección. Párrafos de cuerpo con `maxWidth: '72ch'`.

**Al menos dos de las secciones tienen una estructura distinta entre sí.** No
repitas intro → cifras → gráfico → cierre cuatro veces. En el informe de
referencia: la primera es texto y gráfico a dos columnas, la de magnitudes es
solo una tabla densa, la de contexto es prosa y gráfico a lo ancho.

Algunas secciones alternan fondo blanco con borde superior e inferior. Solo las
que tienen mucho contenido visual, no todas.

**4. Nota metodológica**
Fondo `var(--surface-2)` con borde superior de 2px `var(--ink)`. Límites de los
datos, estimaciones, supuestos, coeficiente de variación cuando aplica.

**5. Footer**
Regla superior. Etiqueta "Fuentes" en sentence case. Lista completa de fuentes.
Los links a los organismos oficiales van acá, subrayados, no en botones pill.

**No hay bloque de conclusión al final.** Esa tesis ahora abre el informe.

---

## Componentes

Se copian del informe de referencia sin cambiar su código:

- **`<Cifra>`** (`@/components/shared/Cifra`): la única representación de una
  cifra en el sitio. Props: `label, valor, unidad, variacion, polaridad,
  periodo, fuente, dark, size` (`xl` | `md` | `sm`). En el hero va
  `dark size="xl"`. **Sustituye al viejo componente `MC`.**
- **`CifraCard`**: envuelve `<Cifra size="md">` en una card con borde de 1px.
  Para los números clave dentro de una sección.
- **`SH`**: encabezado de sección, título y regla inferior de 2px. Sin número.
- **`ChartCard`**: contenedor del gráfico. Props: `title`, `hallazgo` (para el
  `aria-label`), `ficha` (array de pares), `tabla` (fallback textual), `legend`,
  `height`.
- **`FichaTecnica`**: la ficha bajo cada gráfico. Es un elemento de diseño
  visible, no una nota al pie.
- **`DownloadableViz`**: envuelve el gráfico y agrega **un link de texto
  subrayado debajo, alineado al borde izquierdo** ("Descargar el gráfico (PNG)").
  Ya no es un botón arriba a la derecha. El botón queda fuera del nodo
  capturado para que el PNG no lo incluya. `html2canvas` se importa de forma
  dinámica dentro de la función de descarga, nunca arriba del archivo.

**Componentes eliminados**: `MC` (lo reemplaza `Cifra`), `Tag` con variantes de
color por tema, los botones pill, y todo lo de framer-motion.

---

## Gráficos

**Tipos y cuándo usarlos**

- **Barras horizontales**: rankings entre entidades. Ordenados de mayor a menor.
- **Barras verticales**: comparación entre pocos períodos (3–5) o dos grupos.
- **Línea**: series temporales largas (10+ años).
- **Donut**: composición porcentual con 4–8 categorías.
- **Tabla**: más de 5 entidades con 3+ atributos, o cuando el lector busca un
  dato puntual en vez de una tendencia.
- **`CifraCard`**: los 3–4 números clave de una sección. Acompañan al gráfico,
  no lo reemplazan.

**Un gráfico no repite lo que ya dice una tabla.** Si la tabla de la sección ya
tiene la columna de variación, el gráfico de esa misma variación sobra: borralo.

**Labels de valor siempre visibles.** Ningún gráfico depende del tooltip para
mostrar su valor: el dato va escrito sobre la barra o el segmento, con un plugin
de Chart.js (ver `valueLabelsPct` y `makeHValueLabels` en el informe de
referencia). En donut, el valor va en la leyenda. En series largas (10+ puntos)
alcanza con el tooltip.

**Ficha técnica bajo cada gráfico**, con los campos que apliquen: fuente,
período, universo, unidad y CV. Se pasa como prop `ficha`:

```jsx
ficha={[
  ['Fuente', 'INDEC, EPH — cuadro 3.1'],
  ['Período', '1° trim. 2025 y 1° trim. 2026'],
  ['Universo', '24 partidos del GBA'],
  ['Unidad', '% de la PEA'],
  ['CV', 'desocupación 1T2026: 7,1%'],
]}
```

**Accesibilidad de cada gráfico** (obligatorio):
- El contenedor lleva `role="img"` y un `aria-label` que **enuncia el hallazgo
  con sus cifras**, no el título genérico. Se pasa como prop `hallazgo`:
  *"Gráfico de barras: la subocupación total pasó de 10,9% a 12,1% de la PEA"*.
- Los gráficos principales llevan `tabla` con los mismos datos, que `ChartCard`
  renderiza en un `<details>` ("Ver los datos del gráfico en tabla").
- Las leyendas decorativas van con `aria-hidden="true"`.

Los tooltips usan fondo `#0F172A`. Las grillas, `rgba(13,17,23,0.08)`.

---

## Redacción: voz propia, no prosa de máquina

El texto de un informe se escribe como una gacetilla económica firmada por un
analista, no como un resumen automático de la fuente. Reglas de forma:

**Cada cifra clave protagoniza una sola vez.** El número fuerte del informe
aparece con todo su peso en el hero y en una única sección. En el resto del
texto se lo alude sin repetirlo ("esa brecha", "el salto de la subocupación",
"el repunte"). Antes de entregar, contá las apariciones del dato estrella:
si está en más de 3 lugares del cuerpo, reescribí.

**Si una cifra está en el hero, no va también en tarjeta en la primera sección.**
Elegí un lugar. Las tarjetas de una sección son para los números que el hero no
muestra.

**Un solo remate retórico por informe.** La construcción de contraste
("no fue X, fue Y", "creció A pero a costa de B") es efectiva una vez.
Elegí dónde va — casi siempre la tesis de apertura — y en el resto del texto
presentá los datos en afirmativo directo.

**Títulos de sección con el dato adentro.** El estilo de la casa: "Olavarría
concentra el 32%, pero el 49% está en el resto de la provincia". El título
afirma algo verificable. Si el título podría encabezar cualquier informe del
mismo tema ("Los motores del crecimiento", "La recuperación de 2025"), todavía
no es un título.

**El titular de la tesis dice el hallazgo, no anuncia que hay uno.** "El
deterioro vino por las horas trabajadas, no por los despidos" es un titular;
"El argumento" y "Lo que muestran los datos" son etiquetas.

**Anatomía variable.** La secuencia intro → tarjetas → gráfico → cierre es una
opción, no la receta de toda sección. Alterná: una sección que abre con la
tabla, otra que es solo gráfico con un párrafo, otra con dos párrafos seguidos
y las tarjetas al final. Dos secciones consecutivas no repiten estructura.

**Ritmo de oraciones.** Después de dos frases largas va una corta. Los dos
puntos y las rayas se usan a lo sumo una vez por párrafo. Punto y seguido
antes que subordinada encadenada.

**Reemplazos directos** — donde el borrador diga lo de la izquierda,
reescribí como la derecha:

| Borrador típico | Reescritura |
|---|---|
| "no debe leerse de manera aislada" | decir directamente qué otra cosa explica el dato |
| "más allá de las tasas / cifras" | "En personas, ..." / entrar al dato sin preámbulo |
| "resulta útil dimensionar" | mostrar la comparación sin anunciarla |
| "cabe señalar que" | borrar y afirmar |
| "en línea con el promedio" | "igual que el promedio" / "como en los últimos X años" |
| "de base amplia" | "14 de los 16 sectores subieron" |
| "en términos de participación" | "pesa el X% del total" |

**Tres textos, tres frases distintas.** La bajada del hero, la `bajada` de la
card de Supabase y la tesis de apertura dicen cosas complementarias, no la misma
oración reordenada. Hero: qué pasó. Card: por qué importa. Tesis: qué significa
(la lectura política o económica del analista).

**Los insights de la card son titulares.** Se escriben como título de diario
(sujeto + verbo + dato), sin dos puntos ni construcción "X: explicación de X".
El primero se muestra además como hallazgo del informe destacado en la portada.

**Encuadre del analista.** El rol de este skill es analista político: además
de describir la serie, cada informe dice al menos una vez qué implica el dato
para la Provincia, los municipios o la discusión pública — con la prudencia
metodológica en su sección, no diluyendo cada afirmación.

---

## Flujo antes de escribir código

1. Analizá el material provisto. Identificá tema central, alcance geográfico y período.
2. Definí los 4 stats del hero: número, etiqueta corta, variación, **polaridad** y período.
3. Escribí la tesis y su titular: es lo primero que lee el lector después del hero.
4. Listá las secciones con su título (sin numerar) y **decidí qué estructura
   tiene cada una**, verificando que al menos dos difieran.
5. Determiná qué gráfico va en cada sección, con qué datos y con qué ficha técnica.
6. Confirmá fuentes antes de escribir. Nunca asumir ni inventar fuentes.
7. Mostrá el resumen al usuario y esperá confirmación antes de crear el archivo.
8. Después de escribir los textos, pasá el filtro de la sección "Redacción":
   apariciones de la cifra estrella, KPIs sin duplicar entre hero y secciones,
   un solo contraste retórico, títulos con dato, reemplazos de muletillas, y que
   hero / card / tesis no repitan la misma frase.

---

## Registro en tres lugares

Un informe nuevo se registra en **App.jsx**, en **informesRegistry.js** y en
**Supabase**. Si falta cualquiera de los tres, algo se rompe: la ruta no existe,
el informe comparte la tarjeta OG genérica, o no aparece en el listado.

### 1. `src/App.jsx`

- Import lazy junto a los demás:
  `const InformeNuevo = lazy(() => import('./pages/InformeNuevo'))`
- Una ruta **antes** de la genérica `informes/:id`:
  `<Route path="informes/slug-del-informe" element={...} />`

### 2. `src/lib/informesRegistry.js`

Agregar una entrada al principio del array `INFORMES` (está ordenado por fecha
descendente). De acá salen el `<title>`, la meta description, la tarjeta OG de
cada informe, el `sitemap.xml` y el feed RSS, que se generan en el build.

```js
{
  path: '/informes/slug-del-informe',
  titulo: 'Título del informe',
  descripcion: 'Una oración que funcione como bajada en WhatsApp y Twitter.',
  tema: 'Economía',
  fecha: '2026-07-22',
},
```

### 3. Supabase — tabla `informes`

La página `/informes` y la portada leen de esta tabla para las cards.

| Campo        | Tipo            | Descripción                                                  |
|--------------|-----------------|--------------------------------------------------------------|
| `id`         | text            | Slug del informe, igual al de la URL, ej. `"homicidios-pba-2025"` |
| `titulo`     | text            | Título completo del informe                                  |
| `bajada`     | text            | Resumen de 1-2 oraciones, se muestra en la card             |
| `fecha`      | text            | Texto libre para mostrar, ej. `"Mayo 2026"`                 |
| `fecha_orden`| date            | Fecha ISO para ordenar descendente, ej. `"2026-05-23"`      |
| `tema`       | text            | Categoría. Debe coincidir exactamente con valores existentes |
| `municipios` | jsonb           | Array JSON de strings, ej. `'["La Matanza", "Provincia de PBA"]'` |
| `insights`   | jsonb           | Array JSON de strings. Los primeros 2 se muestran en la card |
| `url`        | text            | Ruta interna, ej. `"/informes/slug-del-informe"`            |
| `imagen`     | text (nullable) | URL de imagen de portada, o `null`                          |

```sql
INSERT INTO informes (id, titulo, bajada, fecha, fecha_orden, tema, municipios, insights, url, imagen)
VALUES (
  'slug-del-informe',
  'Título del informe',
  'Bajada de 1-2 oraciones.',
  'Mayo 2026',
  '2026-05-23',
  'Tema',
  '["Municipio o región"]',
  '["Insight clave 1 (se muestra en la card)", "Insight clave 2 (se muestra en la card)"]',
  '/informes/slug-del-informe',
  NULL
);
```

Notas:
- El `url` debe coincidir exactamente con el slug de `App.jsx` y con el `path`
  de `informesRegistry.js`.
- Verificar que el `tema` ya existe en la tabla antes de insertar.
- Si además cargás un **reporte rápido** en `reportes_rapidos`, completá la
  columna `polaridad` (`mayor-es-mejor` | `menor-es-mejor` | `neutro`) o la
  cifra se muestra en gris neutro en la franja de la portada. Esa columna la
  crea `supabase/migracion-fase1-semantica.sql`: si todavía no se corrió en el
  SQL Editor, correrlo antes.

---

## Estándares que nunca se rompen

- Ningún color de variación se decide sin consultar la polaridad del indicador.
- Ningún titular lleva una palabra o una línea en color de acento.
- Toda cifra usa numerales tabulares y publica su fuente y su período.
- Los gráficos siempre son Chart.js interactivos, nunca imágenes estáticas.
- Los gráficos de barras y donuts muestran el valor de cada dato como label visible.
- Todo gráfico va dentro de `DownloadableViz` y lleva su ficha técnica,
  `role="img"` y un `aria-label` con el hallazgo.
- **Sin animaciones de entrada.** framer-motion está eliminado del proyecto: no
  reintroducirlo ni agregar otra librería de animación.
- Sin sombras, sin gradientes, sin bordes redondeados más allá de 2px, sin
  cards con borde izquierdo de color, sin íconos decorativos ni emojis.
- Un solo eyebrow por página (el del hero). Cero numeración de secciones.
- Los párrafos de cuerpo tienen `maxWidth: '72ch'`.
- El informe completo entra en 2–3 pantallas de scroll, no en 6.
- Los slugs van en minúsculas, sin acentos, con guiones y el año al final.
- Si un dato viene de una imagen sin fuente, pedirle al usuario que confirme el origen.
