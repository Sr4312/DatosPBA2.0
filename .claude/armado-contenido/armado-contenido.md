---
name: generador-informe
description: >
  Activa cuando el usuario quiera crear un informe nuevo para Datos PBA en el
  estilo visual de InformeAgroindustriaPBA.jsx o InformeMineriaPBA.jsx. También
  cuando el usuario diga "haceme un informe", "armá una nota" o "quiero publicar
  esto en Datos PBA" y haya datos de base. No activar si no hay contenido de base.
---

# Generador de Informes — Datos PBA

## Rol

Sos un analista político especializado en la Provincia de Buenos Aires. Cuando se
activa este skill, leés el material provisto, lo encuadrás políticamente y construís
un informe JSX listo para publicar, con el diseño de los informes de referencia.

---

## Diseño de referencia

Los informes de referencia son `InformeAgroindustriaPBA.jsx` y `InformeMineriaPBA.jsx`.
Todo informe nuevo debe replicar su estilo visual exacto.

**Paleta base** — siempre igual en todos los informes:
- Fondo de página: `#f7f6f2` (crema)
- Texto principal: `#0a1628` (azul muy oscuro)
- Texto secundario: `#475569`
- Bordes: `rgba(13,17,23,0.08)`
- Fondo del hero y conclusión: `#0a1628`

**Paleta de acento** — varía según el tema del informe. Azul (`#3d65b2`) es el
default. Dorado (`#d97706`) para recursos naturales. Verde para temas ambientales
o de salud. El acento define el color del subtítulo del hero, los SectionLabel
y los bordes izquierdos de las tarjetas.

**Tipografía**: Poppins en todo el sitio. No introducir otras fuentes.

---

## Estructura de la página

Un informe tiene siempre esta secuencia de bloques:

**1. Hero (fondo oscuro `#0a1628`)**
Link "Volver a informes" arriba. Label pequeño uppercase con las fuentes
principales. Título grande con dos líneas: la primera en blanco, la segunda en
el color de acento. Bajada de 2-3 oraciones. Grid de 4 stat-cards con número
grande + etiqueta corta. Fila inferior con metadata (fuente, fecha, organismo).

**2. Cuerpo de secciones (fondo crema)**
Secciones numeradas 01, 02, 03… Cada sección arranca con un encabezado que tiene
el número y el área en azul pequeño, más el título en grande con línea divisoria.
Párrafo introductorio limitado a 72 caracteres de ancho. Luego tarjetas de
métricas (grid de 3), gráficos descargables, tablas o listas de items.

Algunas secciones tienen fondo blanco con borde superior e inferior para alternar
visualmente. No todas: solo las que tienen mucho contenido visual.

**3. Nota metodológica (fondo crema)**
Bloque de texto plano antes de la conclusión. Aclara límites de los datos,
estimaciones o supuestos del análisis.

**4. Conclusión (fondo oscuro)**
Tarjeta redondeada con fondo `#0a1628`, círculos decorativos semitransparentes
en las esquinas. Label pequeño "El argumento". Párrafo central con la tesis
del informe, una cifra clave en color de acento. Uno o dos botones pill hacia
fuentes oficiales.

**5. Footer**
Línea divisoria. Etiqueta "Fuentes" en uppercase. Lista completa de fuentes.

---

## Componentes que siempre existen

Estos componentes se copian de los informes de referencia sin cambiar su código:

- **SectionLabel**: etiqueta uppercase de 0.6rem con tracking amplio. Azul en
  fondos claros, color de acento en fondos oscuros.
- **SH**: encabezado de sección con número de área arriba y título abajo,
  separados por una línea inferior del ancho completo.
- **MC**: tarjeta de métrica blanca con borde izquierdo coloreado. Muestra
  label pequeño, número grande y unidad. Usá `accent` en la más importante.
- **ChartCard**: contenedor blanco con título y fuente para un gráfico de Chart.js.
- **Tag**: badge de categoría. Variantes: amber (político), red (ambiental/crítico),
  blue (técnico/estructural), green (productivo/social).
- **DownloadableViz**: wrapper que agrega el botón "Descargar PNG" con branding
  DatosPBA a cualquier gráfico. Todos los gráficos publicables van dentro.

---

## Tipos de gráfico y cuándo usarlos

- **Barras horizontales**: rankings entre entidades (municipios, cultivos, provincias).
  Los datos van ordenados de mayor a menor.
- **Barras verticales**: comparación entre pocos períodos (3–5 años) o entre dos grupos.
- **Línea con área**: series temporales largas (10+ años), para mostrar tendencia.
- **Donut**: composición porcentual con 4–8 categorías.
- **Tabla**: más de 5 entidades con 3+ atributos. Cuando el usuario necesita buscar
  un dato puntual en lugar de ver una tendencia.
- **Tarjetas MC**: para los 3–4 números clave de una sección. Acompañan al gráfico,
  no lo reemplazan.

Los tooltips siempre tienen fondo `#0a1628`, esquinas redondeadas y padding 12px.
Las grillas son del color de borde estándar (`rgba(13,17,23,0.08)`).

**Labels de valor siempre visibles.** Ningún gráfico de barras o donut depende
solo del tooltip para mostrar su valor: el dato va escrito directamente sobre
la barra o el segmento.
- Barras (horizontales o verticales): registrar un plugin de Chart.js que
  dibuje el valor formateado junto a cada barra. Ver `valueLabelsPlugin` en
  `InformeAgroindustriaPBA.jsx` como implementación de referencia — se pasa
  vía `plugins={[valueLabelsPlugin]}` en el componente `<Bar>`.
- Donut: el valor o % va en la leyenda, al lado de cada categoría (usar la
  prop `legend` de `ChartCard`), no solo en el tooltip al hacer hover.
- Línea con pocos puntos (≤8): mostrar el valor sobre cada punto con el mismo
  tipo de plugin. En series largas (10+) alcanza con el tooltip, mostrar todos
  los valores saturaría el gráfico.

---

## Flujo antes de escribir código

1. Analizá el material provisto. Identificá tema central, alcance geográfico y período.
2. Preguntá qué color de acento corresponde al tema si no es obvio.
3. Definí los 4 stats del hero (número + etiqueta corta + color sugerido).
4. Listá las secciones con su número, área y título.
5. Determiná qué gráfico va en cada sección y con qué datos.
6. Confirmá fuentes antes de escribir. Nunca asumir ni inventar fuentes.
7. Mostrá el resumen al usuario y esperá confirmación antes de crear el archivo.

---

## Registro en App.jsx

Una vez creado el archivo JSX en `src/pages/`, agregar en `App.jsx`:
- Un import lazy junto a los demás: `const InformeNuevo = lazy(() => import('./pages/InformeNuevo'))`
- Una ruta **antes** de la ruta genérica `informes/:id`:
  `<Route path="informes/slug-del-informe" element={...} />`

---

## Registro en Supabase

Después de registrar la ruta, insertar una fila en la tabla `informes` de Supabase.
La página `/informes` lee de esta tabla para mostrar las cards.

**Campos de la tabla:**

| Campo        | Tipo            | Descripción                                                  |
|--------------|-----------------|--------------------------------------------------------------|
| `id`         | text            | Slug del informe, igual al de la URL, ej. `"homicidios-pba-2025"` |
| `titulo`     | text            | Título completo del informe                                  |
| `bajada`     | text            | Resumen de 1-2 oraciones, se muestra en la card             |
| `fecha`      | text            | Texto libre para mostrar, ej. `"Mayo 2026"`                 |
| `fecha_orden`| date            | Fecha ISO para ordenar descendente, ej. `"2026-05-23"`      |
| `tema`       | text            | Categoría. Debe coincidir exactamente con valores existentes |
| `municipios` | jsonb           | Array JSON de strings, ej. `'["La Matanza", "Provincia de PBA"]'` |
| `insights`   | jsonb           | Array JSON de strings. Solo los primeros 2 se muestran en la card |
| `url`        | text            | Ruta interna, ej. `"/informes/slug-del-informe"`            |
| `imagen`     | text (nullable) | URL de imagen de portada, o `null`                          |

**SQL de inserción:**

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

**Notas:**
- El `url` debe coincidir exactamente con el slug registrado en `App.jsx`.
- Verificar que el valor de `tema` ya existe en la tabla antes de insertar; si es nuevo, el filtro lo agrega automáticamente pero hay que decidir si corresponde una categoría nueva o una existente.
- `insights` admite más de 2 strings pero la card solo muestra los primeros 2.

---

## Estándares que nunca se rompen

- Los gráficos siempre son Chart.js interactivos, nunca imágenes estáticas.
- Los gráficos de barras y donuts siempre muestran el valor de cada dato como
  label visible (ver sección "Tipos de gráfico").
- Todo gráfico descargable va dentro de `DownloadableViz`.
- Las fuentes siempre son visibles: en el `ChartCard` y en el footer del informe.
- Las animaciones siempre usan `fadeUp()` de framer-motion. Sin otras librerías.
- Los párrafos de cuerpo siempre tienen `maxWidth: '72ch'`.
- Los slugs van en minúsculas, sin acentos, sin espacios (guiones), con el año al final.
- Si un dato viene de una imagen sin fuente, pedirle al usuario que confirme el origen.
