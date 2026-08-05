---
name: graficos-datospba
description: >
  Convierte cualquier gráfico, tabla o dataset al sistema visual de Datos PBA
  (datospba.com). Úsalo cuando el usuario pase una imagen de un gráfico, una
  tabla o datos sueltos y pida "pasalo al estilo Datos PBA", "armame el
  gráfico", "hacé una pieza para publicar" o similar. Para armar un informe
  completo va el skill generador-informe, no este.
---

# Gráficos — Datos PBA

Un gráfico de Datos PBA se ve como el instrumento que produjo el dato, no como la
ilustración que lo acompaña. La personalidad la aporta el número y su ficha técnica,
no la decoración.

La fuente de verdad del estilo es el skill **`design-system-datospba`**. Este
documento resuelve el caso particular de los gráficos; ante cualquier duda que no
cubra, manda ese skill.

---

## Antes de dibujar: dónde va la pieza

Dos destinos, dos implementaciones. Preguntá si no está claro.

| Destino | Librería | Envoltorio |
|---|---|---|
| Una página del sitio (informe, sección, reporte rápido) | **Chart.js + react-chartjs-2** | `ChartCard` + `DownloadableViz` del informe de referencia |
| Pieza suelta para redes o para mostrar fuera del repo | Chart.js, o Recharts si el entorno no tiene otra cosa | El bloque autocontenido de §7 |

Recharts **no es dependencia del proyecto**: nada que se escriba con Recharts entra
a `src/`. El informe de referencia es `src/pages/InformeMercadoTrabajoGBA.jsx` y de
ahí se copian los componentes sin reescribirlos.

---

## 1. Color

### Series

Solo estos cuatro, en este orden. Se importan de `@/lib/variacion`, no se escriben
a mano:

```js
import { DATA, DATA_BORDES } from '@/lib/variacion'
// DATA[1] #E11D74 magenta — serie principal / PBA
// DATA[2] #0D9488 teal    — serie de comparación / Nación
// DATA[3] #22D3EE cyan    — tercera serie (sobre blanco, borde DATA_BORDES[3] = #0E7490)
// DATA[4] #0F172A navy    — total / agregado
```

Neutros para lo que no es serie:

```
--rule     #E2E5EA   grillas, bordes de 1px
--ink-3    #64748B   caption, unidad, ficha, categorías sin protagonismo
--ink-2    #3F4A5A   labels de valor
--ink      #0F172A   texto principal, fondo de bloque oscuro
```

No hay naranja, ni indigo, ni ámbar, ni gris "de barra". Si necesitás una quinta
categoría, el gráfico tiene demasiadas categorías: agrupá o pasá a tabla.

### Cuándo el color significa algo

El color **codifica valoración, nunca dirección ni ranking**.

- **Ranking**: la barra destacada va en `DATA[1]`, el resto en `--ink-3`. Colorear
  el top con magenta y el bottom con teal está **prohibido**: sugiere que los
  primeros son buenos y los últimos malos aunque nadie lo haya declarado.
- **Comparación de dos grupos o dos períodos**: `DATA[2]` para el anterior o de
  referencia, `DATA[1]` para el más reciente o el que es objeto del informe.
- **Variación de un indicador** (flechas, celdas de tabla, cifras): el color sale de
  `getColorVariacion({ variacion, polaridad, texto: true })`. Cada indicador declara
  su polaridad — `mayor-es-mejor`, `menor-es-mejor`, `neutro` — y ante la duda,
  neutro. Ningún hex de valoración se escribe a mano.
- Sin valoración declarada, todas las barras van del mismo color. N cifras en N
  colores distintos es decoración.

### Interfaz

`--focus #2563EB` es el único azul de interfaz y no se usa nunca para datos.

---

## 2. Tipografía

**Archivo**, self-hosted vía `@fontsource`. Nunca CDN de Google Fonts, nunca Inter,
nunca una geométrica (Poppins, Outfit, Montserrat: numerales no tabulares y firma de
plantilla).

En el sitio ya está aplicada globalmente: no declares `font-family` salvo en los
`font` de Chart.js, donde va `'Archivo, sans-serif'`.

```js
ChartJS.defaults.font.family = 'Archivo, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'
```

| Elemento | Tamaño / peso | Color |
|---|---|---|
| Título del gráfico | 12px / 600 | `#334155` |
| Leyenda | 11px / 500 | `#64748B` |
| Ticks de eje | 10–12px / 400 | `#475569` |
| Label de valor sobre la barra | 11px / 700 | `#334155` |
| Etiqueta de campo de la ficha | 10px / 400, uppercase, tracking 0.08em | `--ink-3` |
| Valor de campo de la ficha | 11.5px / 600 | `--ink-2` |

**Toda cifra lleva `tabular-nums`.** En HTML, con la clase `tabular-nums`; en canvas
sale por defecto de la familia. Si una columna de tabla no alinea, es un bug.

Sentence case en títulos y labels. Números en formato es-AR: coma decimal, punto de
miles (`toLocaleString('es-AR')`). Nunca em dash (—) en títulos, fichas ni fuentes:
guion simple.

---

## 3. Superficie

- Fondo del área del gráfico: **blanco**. El off-white `--surface-2` queda para la
  nota metodológica.
- Contenedor: `border: 1px solid var(--c-rule)`, `borderRadius: 2`.
- **Sin sombras.** Ninguna, en ningún elemento. La separación es por borde o por
  cambio de fondo sólido.
- Sin gradientes, sin glow, sin bordes redondeados más allá de 2px — incluidas las
  puntas de las barras y el `cornerRadius` del tooltip.
- Sin card dentro de card: si el gráfico ya está en `ChartCard`, la leyenda y la
  ficha no llevan fondo ni borde propio.
- Badges flotantes con fondo tinte y borde de color (`#FEF2F2` + borde magenta y
  demás) están **prohibidos**. Si un grupo necesita nombre, va como texto plano en
  `--ink-3` al lado del eje, o como título de sección.

---

## 4. Ejes, grillas y labels

- **Eje Y siempre desde cero** en barras. Si se trunca, se declara en la ficha
  técnica ("Eje truncado en X").
- Grillas horizontales de 1px en `rgba(13,17,23,0.08)`. **Sin grillas verticales**
  (`x: { grid: { display: false } }`). Sin borde alrededor del área de trazado.
- Leyenda propia arriba a la izquierda, solo con 2+ series, en 11px `--ink-3`, con
  `aria-hidden="true"` (la información ya está en el `aria-label` y en la tabla).
  La leyenda nativa de Chart.js va apagada: `plugins: { legend: { display: false } }`.
- **Labels de valor o eje Y, no los dos.** En piezas de una sola serie y en todo lo
  que va a redes: sacá el eje Y y dejá el valor escrito sobre cada barra o segmento.
  En comparaciones de varias series donde la escala importa, dejá el eje Y y los
  labels solo si son ≤4 barras. Ningún gráfico depende del tooltip para mostrar su
  valor; en donut el valor va en la leyenda, y en series de 10+ puntos alcanza con
  el tooltip.
- Márgenes: en barras horizontales, ancho suficiente para los nombres de partidos
  sin cortar (mínimo 130px, algunos del GBA son largos).
- Línea de referencia: solo cuando marca un umbral real — promedio, meta, año de un
  cambio metodológico. 1px punteada en `--rule`, etiquetada en `--ink-3`. Nunca roja:
  el rojo es color de valoración. No se usa para separar decorativamente grupos de un
  ranking.
- Tooltip: fondo `#0F172A`, título blanco, cuerpo `#cbd5e1`, padding 12, radius 2.

---

## 5. Ficha técnica — el elemento firma

**Todo gráfico lleva ficha técnica.** No es letra chica: es lo que distingue a Datos
PBA de un dashboard cualquiera. Va debajo del gráfico, con regla superior de 1px, con
los campos que apliquen:

```jsx
ficha={[
  ['Fuente',  'INDEC, EPH - cuadro 3.1'],
  ['Período', '1° trim. 2025 y 1° trim. 2026'],
  ['Universo','24 partidos del GBA'],
  ['Unidad',  '% de la PEA'],
  ['CV',      'desocupación 1T2026: 7,1%'],
]}
```

Si el material de origen no dice de dónde salen los datos, **preguntá antes de
dibujar**. No se inventa una fuente ni se pone "elaboración propia" para tapar el
hueco.

---

## 6. Accesibilidad (obligatorio, no opcional)

- El contenedor del gráfico lleva `role="img"` y un `aria-label` que **enuncia el
  hallazgo con sus cifras**, no la estructura: *"Gráfico de barras: la subocupación
  total pasó de 10,9% a 12,1% de la PEA entre 1T2025 y 1T2026"*. En `ChartCard` se
  pasa como prop `hallazgo`.
- Los gráficos principales llevan la prop `tabla`, que `ChartCard` renderiza en un
  `<details>` ("Ver los datos del gráfico en tabla").
- Contraste: 3:1 mínimo para elementos gráficos, 4.5:1 para texto. `DATA[3]` cyan
  sobre blanco no llega: si se usa en relleno, lleva `DATA_BORDES[3]` como borde.
- La información nunca depende solo del color: flecha, color y texto son tres
  canales.
- Sin animaciones de entrada. Las transiciones de estado (hover, tooltip) van de
  120–150ms y respetan `prefers-reduced-motion`.

---

## 7. Estructura de la pieza

### En el sitio

```jsx
<DownloadableViz title="Título del gráfico" fuente="INDEC, EPH">
  <ChartCard
    title="Tasa de desocupación por área geográfica - 1° trim. 2026"
    hallazgo="Gráfico de barras horizontales: la desocupación del GBA (9,7%) duplica la de CABA (4,8%)."
    tabla={{ columnas: [...], filas: [...] }}
    ficha={[...]}
    legend={[{ label: '1° trim. 2025', color: DATA[2] }, { label: '1° trim. 2026', color: DATA[1] }]}
    height={230}
  >
    <Bar data={data} plugins={[valueLabelsPct]} options={{ /* §4 */ }} />
  </ChartCard>
</DownloadableViz>
```

La descarga es **un link de texto subrayado debajo del gráfico, alineado a su borde
izquierdo**, no un botón flotante a la derecha. `html2canvas` se importa dinámico
dentro de la función de descarga.

### Pieza suelta

Bloque autocontenido, mismos tokens:

```jsx
<div style={{
  fontFamily: 'Archivo, ui-sans-serif, system-ui, sans-serif',
  background: '#FFFFFF',
  maxWidth: 960,
  margin: '0 auto',
  border: '1px solid #E2E5EA',
  borderRadius: 2,
}}>
  <div style={{ padding: '28px 28px 20px' }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.015em' }}>
      {/* Título con el dato adentro, sentence case */}
    </h2>
    <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 20 }}>{bajada}</p>

    <div role="img" aria-label={hallazgo} style={{ height: 300 }}>{/* gráfico */}</div>

    {/* Ficha técnica: regla superior 1px + pares label/valor */}
  </div>

  {/* Firma */}
  <div style={{
    background: '#0F172A', padding: '12px 28px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }}>
    <span style={{ color: '#fff', fontSize: 16, letterSpacing: '-0.01em' }}>
      Datos<span style={{ fontWeight: 700 }}>PBA</span>
    </span>
    <span style={{ color: '#94A3B8', fontSize: 12 }}>datospba.com</span>
  </div>
</div>
```

La firma es **monocroma**: "Datos" en peso regular y "PBA" en bold, los dos en
blanco, igual que el wordmark del sitio. El contraste es de peso, no de color. El
cyan en "PBA" era del diseño viejo.

---

## 8. Tipos de gráfico y cuándo usarlos

- **Barras horizontales** — rankings entre entidades. Ordenados de mayor a menor.
  La entidad protagonista en `DATA[1]`, el resto en `--ink-3`.
- **Barras verticales** — comparación entre pocos períodos (3–5) o dos grupos.
- **Línea** — series temporales largas (10+ años). Línea en `DATA[1]`, sin área de
  relleno, sin puntos salvo en el valor que el texto nombra. La serie de comparación
  en `DATA[2]`.
- **Donut** — composición porcentual de 4 a 8 categorías, con el valor en la leyenda.
- **Dispersión** — correlación entre dos variables en los partidos. Los partidos que
  el texto nombra en `DATA[1]`, el resto en `--ink-3` con opacidad. Etiquetá solo los
  nombrados. Eje X logarítmico cuando la dispersión lo pide, declarándolo en la ficha.
- **Tabla** — más de 5 entidades con 3+ atributos, o cuando el lector busca un dato
  puntual y no una tendencia. Reglas de 1px, sin zebra striping, numerales tabulares
  alineados a la derecha, encabezado en `label`.

**Un gráfico no repite lo que ya dice una tabla.** Si la tabla de la sección ya tiene
la columna de variación, el gráfico de esa misma variación sobra: borralo.

---

## 9. Proceso cuando el usuario pasa un gráfico a convertir

1. **Leé el original**: tipo, datos, categorías, título, fuente, período, universo.
2. **Extraé todos los valores numéricos** visibles. Si alguno no se lee, preguntá en
   vez de estimarlo.
3. **Confirmá la fuente y el período.** Si el original no los trae, pedilos: sin eso
   no hay ficha técnica y sin ficha técnica no hay gráfico.
4. **Elegí el tipo** según §8, que no siempre es el del original. Si el original es
   una torta de 12 gajos, sale tabla o barras.
5. **Asigná colores** por la lógica de §1: qué es serie principal, qué es comparación,
   qué es neutro. Declará la polaridad de todo indicador con variación.
6. **Reescribí el título** en sentence case, con el dato adentro y sin em dash. Si el
   título podría encabezar cualquier gráfico del mismo tema, todavía no es un título.
7. **Armá la ficha técnica**, el `hallazgo` para el `aria-label` y la `tabla` de
   fallback.
8. **Revisá contra §10** antes de entregar.

---

## 10. Checklist antes de entregar

- [ ] Colores solo de `DATA[1..4]` y los neutros. Cero naranjas, indigos y ámbares.
- [ ] Ningún color de variación escrito a mano: todos derivados de la polaridad.
- [ ] Sin degradado de ranking magenta→teal.
- [ ] Archivo, no Inter. Toda cifra con `tabular-nums`.
- [ ] Sin sombras, sin gradientes, sin radius > 2px, sin badges de color.
- [ ] Eje Y desde cero, o truncado declarado en la ficha.
- [ ] Grillas horizontales de 1px, ninguna vertical, sin borde de gráfico.
- [ ] O eje Y o labels de valor, no los dos (salvo ≤4 barras).
- [ ] Ficha técnica completa con fuente y período reales.
- [ ] `role="img"` con `aria-label` que dice el hallazgo, y `<details>` con la tabla.
- [ ] Título en sentence case, con dato adentro, sin em dash.
- [ ] Firma monocroma, y en el sitio la descarga como link de texto abajo a la
      izquierda.
- [ ] Si va a `src/`: Chart.js, nunca Recharts.
