/**
 * Semántica de variación e identidad de color de dato — fuente única.
 *
 * Regla del sistema de diseño: el color de una variación codifica VALORACIÓN
 * (mejoró / empeoró / neutro), nunca dirección (subió / bajó). Se deriva de
 * polaridad × signo(variación). Ningún componente decide este color por su
 * cuenta: siempre pasa por getColorVariacion().
 *
 * Polaridad de un indicador:
 *   'mayor-es-mejor'  — p. ej. tasa de empleo, exportaciones
 *   'menor-es-mejor'  — p. ej. desempleo, informalidad, deuda
 *   'neutro'          — sin dirección deseable (o variación no significativa)
 */

export const POLARIDADES = ['mayor-es-mejor', 'menor-es-mejor', 'neutro']

/* ── Paleta de dato (series de gráfico) ──────────────────────────────────
   Chart.js pinta sobre canvas y no resuelve variables CSS, así que estos hex
   duplican los tokens --data-1..4 de index.css. Si cambia uno, cambia el otro. */
export const DATA = {
  1: '#E11D74', // magenta — serie principal / PBA
  2: '#0D9488', // teal — serie de comparación / Nación
  3: '#22D3EE', // cyan — tercera serie (sobre blanco, usar borde DATA_BORDES[3])
  4: '#0F172A', // navy — total / agregado
}

/* Bordes para series que no llegan a 3:1 sobre superficie clara */
export const DATA_BORDES = {
  1: '#E11D74',
  2: '#0D9488',
  3: '#0E7490',
  4: '#0F172A',
}

export const DATA_SERIES = [DATA[1], DATA[2], DATA[3], DATA[4]]

/* Equivalentes hex de los tokens de valoración, para contextos canvas
   (Chart.js, descargas PNG) donde no hay variables CSS. */
export const VALORACION_HEX = {
  better:  { base: '#0D9488', text: '#0F766E', dark: '#2DD4BF' },
  worse:   { base: '#B4234C', text: '#B4234C', dark: '#FB7185' },
  neutral: { base: '#64748B', text: '#64748B', dark: '#94A3B8' },
}

/**
 * Signo de una variación numérica o textual.
 * Acepta números y strings es-AR: '+1,5 pp', '−4,2% vs. 2019', '0,0'.
 * Normaliza el signo menos Unicode (U+2212) y la coma decimal.
 * Devuelve 1, -1 o 0 (0 también si no hay número parseable).
 */
export function signoVariacion(variacion) {
  if (variacion == null) return 0
  if (typeof variacion === 'number') return Math.sign(variacion)
  const limpio = String(variacion)
    .replace(/−/g, '-')
    .replace(/[^0-9+\-.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const n = parseFloat(limpio)
  if (Number.isNaN(n)) return 0
  return Math.sign(n)
}

/**
 * Tono de valoración: 'better' | 'worse' | 'neutral'.
 * Variación nula, polaridad ausente o 'neutro' → 'neutral'.
 */
export function getTonoVariacion({ variacion, polaridad }) {
  const signo = signoVariacion(variacion)
  if (signo === 0 || !polaridad || polaridad === 'neutro') return 'neutral'
  if (polaridad === 'mayor-es-mejor') return signo > 0 ? 'better' : 'worse'
  if (polaridad === 'menor-es-mejor') return signo > 0 ? 'worse' : 'better'
  return 'neutral'
}

/**
 * Color CSS de una variación: 'var(--better)' | 'var(--worse)' | 'var(--neutral)'.
 *   dark:  true sobre bloques --c-ink (usa las variantes -dark)
 *   texto: true para texto <18px sobre fondo claro (usa las variantes -text, AA 4.5:1)
 */
export function getColorVariacion({ variacion, polaridad, dark = false, texto = false }) {
  const tono = getTonoVariacion({ variacion, polaridad })
  const sufijo = dark ? '-dark' : texto ? '-text' : ''
  return `var(--${tono}${sufijo})`
}

/**
 * Flecha de dirección. La dirección y la valoración son canales independientes:
 * la flecha dice hacia dónde se movió, el color dice si eso es bueno o malo,
 * y el texto ('+1,5 pp') siempre acompaña — la información nunca depende
 * solo del color.
 */
export function flechaVariacion(variacion) {
  const signo = signoVariacion(variacion)
  if (signo > 0) return '↑'
  if (signo < 0) return '↓'
  return ''
}

/* ── Escala continua de valoración ───────────────────────────────────────
   Para mapas y rankings que colorean por nivel (0 = peor … 1 = mejor).
   Interpola worse → neutral → better en RGB. Reemplaza a las rampas
   verde/rojo hardcodeadas. */
const RGB = {
  worse:   [180, 35, 76],
  neutral: [100, 116, 139],
  better:  [13, 148, 136],
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t)
}

export function colorEscalaValoracion(t) {
  const x = Math.max(0, Math.min(1, t))
  const [de, hasta, tt] = x < 0.5
    ? [RGB.worse, RGB.neutral, x * 2]
    : [RGB.neutral, RGB.better, (x - 0.5) * 2]
  const [r, g, b] = [0, 1, 2].map(i => lerp(de[i], hasta[i], tt))
  return `rgb(${r},${g},${b})`
}
