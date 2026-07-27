---
name: design-system-datospba
description: Sistema de diseño de datospba.com. Úsalo siempre que se cree, modifique o revise cualquier componente, página, gráfico o pieza visual del sitio Datos PBA, o cuando se pregunte por colores, tipografía, espaciado, semántica de indicadores o componentes del sitio. Es la fuente de verdad: ante cualquier duda de estilo, se consulta acá antes de decidir.
---

# Sistema de diseño — Datos PBA

Datos PBA es una publicación de periodismo de datos sobre la Provincia de Buenos Aires.
No es un producto SaaS ni un blog.

**Dirección:** *instrumento de medición*. El sitio se ve como el aparato que produce el
dato, no como el artículo que lo comenta. La personalidad la aporta el número y su ficha
técnica, no la decoración.

**Signature del sitio:** la ficha técnica expuesta. Fuente, período, universo, unidad y
—cuando corresponda— coeficiente de variación son elementos de diseño visibles, no letra
chica. Es lo que distingue a Datos PBA de un dashboard cualquiera.

---

## 1. Tipografía

Dos familias. Nada de geométricas (Poppins, Outfit, Gilroy, Montserrat, Rubik): mala
legibilidad en párrafo largo, numerales no tabulares, y son la firma de plantilla.

| Rol | Familia | Notas |
|---|---|---|
| Display / titulares | Grotesca neutra densa: **Archivo**, **Public Sans** o **Geist** | Self-hosted vía `@fontsource`. Nunca CDN de Google Fonts. |
| Cuerpo | La misma familia en peso 400 | La unidad tipográfica es parte de la dirección |
| Dato / tabular | Misma familia con `font-variant-numeric: tabular-nums` | **Obligatorio en toda cifra**, sin excepción |

Regla dura: **toda cifra lleva `tabular-nums`.** Si una columna de tabla no alinea, es un bug.

### Escala

| Token | Tamaño / interlínea | Uso |
|---|---|---|
| `display` | 44 / 1.05, peso 700, tracking −0.02em | Titular de informe. Uno por página. |
| `headline` | 28 / 1.15, peso 700 | Título de sección |
| `subhead` | 20 / 1.35, peso 600 | Bajada, subtítulo |
| `body` | 17 / 1.6, peso 400 | Párrafo. Máx. 68ch. |
| `data-xl` | 40 / 1, peso 700, tabular | Cifra principal |
| `data-md` | 24 / 1, peso 600, tabular | Cifra en tabla o card |
| `caption` | 13 / 1.4, peso 400 | Fuente, nota al pie, unidad |
| `label` | 11 / 1, peso 600, uppercase, tracking 0.06em | Etiqueta de campo. **Uso restringido** (ver §5) |

Sentence case en todo, salvo `label`. Nunca Title Case en castellano.

---

## 2. Color

Dos paletas separadas que **no se mezclan**: una de interfaz y una de dato.

### Interfaz

```
--ink        #0F172A   texto principal, fondos de bloque oscuro
--ink-2      #3F4A5A   texto secundario (contraste 8.1:1 sobre blanco)
--ink-3      #64748B   caption, unidad, metadata — solo ≥13px
--rule       #E2E5EA   bordes y reglas de 1px
--surface    #FFFFFF   fondo base
--surface-2  #F7F8FA   fondo de bloque diferenciado
--focus      #2563EB   anillo de foco y links. Solo interacción.
```

`--focus` es el único azul de interfaz y **no se usa para datos**.

### Dato

Alineada con las piezas que Datos PBA publica en redes, para que el sitio y Twitter se
reconozcan como lo mismo.

```
--data-1  #E11D74   magenta   serie principal / PBA
--data-2  #0D9488   teal      serie de comparación / Nación
--data-3  #22D3EE   cyan      tercera serie
--data-4  #0F172A   navy      total / agregado
```

### Semántica de variación — regla crítica

El color codifica **valoración**, nunca dirección.

```
--better   #0D9488   el indicador se movió hacia donde es deseable
--worse    #B4234C   el indicador se movió hacia donde es indeseable
--neutral  #64748B   sin dirección deseable, o variación no significativa
```

Cada indicador **debe declarar su polaridad** en el modelo de datos:

```js
{
  id: 'desempleo-gba',
  valor: 8.6,
  variacion: 1.5,
  unidad: 'pp',
  polaridad: 'menor-es-mejor',   // 'mayor-es-mejor' | 'menor-es-mejor' | 'neutro'
  fuente: 'INDEC — EPH',
  periodo: '4º trim. 2025',
  actualizado: '2026-03'
}
```

El color se **deriva** de `polaridad × signo(variacion)`. Nunca se hardcodea.
Desempleo que sube va en `--worse`. Informalidad que sube va en `--worse`. Un año que
pasa no va en ningún color.

Nunca N cifras en N colores distintos por decoración. Si tres KPI no tienen valoración
distinta, van los tres del mismo color.

La flecha (`↑`/`↓`) indica dirección; el color indica valoración. Son dos canales
independientes y ninguno reemplaza al otro. Además de flecha y color, siempre hay texto
("+1,5 pp"): la información nunca depende solo del color.

---

## 3. Espaciado y ritmo

Tres niveles, no uno. El ritmo plano (`py-16` en todo) es un tell.

```
--space-dense   32px   bloques de datos, tablas, listas
--space-normal  64px   entre secciones de un informe
--space-air     112px  cambios de nivel: fin de informe, cambio de tema
```

Anchos separados:

```
--w-read   68ch    párrafo
--w-data   1080px  gráficos, tablas
--w-full   1280px  bloques a sangre
```

**Densidad:** mínimo 4–5 unidades de información por pantalla. Un informe completo debe
entrar en 2–3 pantallas de scroll, no en 6.

---

## 4. Superficie

```
--radius     2px      default para todo
--radius-pill 999px   exclusivamente para el badge de tema. Nada más.
```

- Sombras: **ninguna**. Separación por borde `1px solid var(--rule)` o por cambio de
  fondo sólido.
- Sin gradientes, blobs, glows ni franjas diagonales.
- Sin geometría decorativa (círculos concéntricos, grillas de puntos).
- Sin card dentro de card: si el contenedor ya es superficie elevada, el hijo no lleva
  borde ni fondo propio.
- Bloques oscuros (`--ink`): permitidos para el hero del informe y el bloque de tesis.
  Máximo dos por página.

---

## 5. Componentes

### Permitidos

- **Ficha técnica** — fila de campos `label` + valor, separada por regla superior.
  Aparece bajo todo dato y bajo todo gráfico. Es el elemento firma.
- **Cifra** — `data-xl`/`data-md` + unidad + variación coloreada por polaridad + período.
- **Tabla de datos** — reglas de 1px, sin zebra striping, numerales tabulares alineados
  a la derecha, encabezado en `label`.
- **Gráfico** — ver §6.
- **Badge de tema** — único `radius-pill` del sistema, sin fondo, texto en `--ink-2`.
- **Nota metodológica** — bloque con regla superior gruesa (2px `--ink`) y fondo
  `--surface-2`. Sin borde de color, sin fondo crema, sin icono.

### Prohibidos

- Titular con palabra o línea final en color de acento.
- Eyebrow `MAYÚSCULAS · CON · PUNTOS`: máximo **uno** por página.
- Numeración `01 / 02 / 03` de secciones que no son una secuencia real.
- Trío de stats decorativo en hero.
- Card con borde izquierdo de color.
- Navbar flotante en píldora despegada del borde.
- Botón circular de scroll-to-top.
- Iconos decorativos junto a títulos.
- Punto pulsante "live" sobre contenido que no es en vivo.
- Empty state con icono en círculo.

---

## 6. Gráficos (Recharts)

- Series con `--data-1..4` en orden. Nunca con colores de interfaz.
- Eje Y **siempre desde cero** en barras. Si se trunca, se declara en la ficha técnica.
- Data labels **solo** cuando no hay eje Y, o cuando hay ≤4 barras. Nunca ambos.
- Gridlines: horizontales, 1px, `--rule`. Sin gridlines verticales. Sin borde de gráfico.
- Leyenda: solo si hay 2+ series. Arriba a la izquierda, `caption`.
- Fuente + período **dentro** del gráfico, abajo a la derecha, `caption` en `--ink-3`.
- Todo gráfico lleva:
  - `role="img"` con `aria-label` que enuncia el hallazgo, no la estructura
    ("La subocupación pasó de 10,9% a 12,1% entre 1T2025 y 1T2026"), y
  - un `<details>` con la tabla de datos como fallback textual.
- La acción de descarga va **debajo** del gráfico, alineada a su borde izquierdo, como
  link de texto. No como botón flotante a la derecha.

---

## 7. Movimiento

Solo transiciones de estado: hover, foco, apertura de filtros, tooltips. 120–150ms,
`ease-out`. Sin animaciones de entrada de layout, sin contadores animados, sin parallax.
Todo envuelto en `@media (prefers-reduced-motion: reduce)`.

---

## 8. Piso de calidad

Ningún componente se da por terminado sin:

- Contraste AA verificado (4.5:1 cuerpo, 3:1 texto grande y elementos gráficos).
- `:focus-visible` visible en todo elemento interactivo.
- Responsive hasta 360px.
- `prefers-reduced-motion` respetado.
- Toda cifra con fuente, período y unidad accesibles desde su propio contexto.
- Estructura de headings correcta (un solo `h1`, sin saltos de nivel).

---

## 9. Voz

Español rioplatense con voseo. Sentence case. Tono de redacción, no de marketing.

- Frases declarativas y verificables. Sin paralelismos de dos tiempos.
- Sin "todo en un solo lugar", "basado en evidencia" como tagline, "el dato que importa".
- Sin guion largo retórico como pausa dramática.
- Los estados vacíos dicen qué hacer y por qué. Los errores dicen qué pasó y cómo se
  arregla, sin disculparse.
- Un botón se llama igual en toda la secuencia: si dice "Descargar", el resultado dice
  "Descargado".
