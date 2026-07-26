import { getColorVariacion, flechaVariacion, signoVariacion } from '@/lib/variacion'

/**
 * Única representación de una cifra en el sitio: valor + unidad + variación
 * (coloreada por polaridad, nunca por dirección) + período + fuente.
 * Se usa en el ticker, el hero de informe, las cards de sección y las tablas.
 *
 * La variación siempre muestra flecha + color + texto: tres canales, ninguno
 * depende solo del color.
 */

/* Escala del sistema: data-xl (40/1, 700) para cifra principal,
   data-md (24/1, 600) para cifra en card o tabla, caption (13) para meta. */
const SIZES = {
  xl: {
    valor: 'text-data-xl',
    unidad: 'text-base font-semibold',
    label: 'text-label',
    meta: 'text-caption',
  },
  md: {
    valor: 'text-data-md',
    unidad: 'text-sm font-semibold',
    label: 'text-label',
    meta: 'text-caption',
  },
  sm: {
    valor: 'text-base font-bold',
    unidad: 'text-xs font-semibold',
    label: 'text-label',
    meta: 'text-caption',
  },
}

export default function Cifra({
  label,
  valor,
  unidad,
  variacion,
  polaridad = 'neutro',
  periodo,
  fuente,
  dark = false,
  size = 'md',
  className = '',
}) {
  const s = SIZES[size] ?? SIZES.md
  const colorValor = dark ? '#ffffff' : 'var(--c-ink)'
  const colorLabel = dark ? 'rgba(255,255,255,0.55)' : 'var(--c-ink-mid)'
  const colorMeta = dark ? 'rgba(255,255,255,0.55)' : 'var(--c-ink-mid)'
  const colorVariacion = getColorVariacion({ variacion, polaridad, dark, texto: !dark })
  const flecha = flechaVariacion(variacion)
  const sinCambio = variacion != null && signoVariacion(variacion) === 0

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <span
          className={`${s.label} font-semibold uppercase tracking-wider leading-snug mb-1`}
          style={{ color: colorLabel }}
        >
          {label}
        </span>
      )}

      <span className="flex items-baseline gap-1.5">
        <span className={`${s.valor} tabular-nums leading-none`} style={{ color: colorValor }}>
          {valor}
        </span>
        {unidad && (
          <span className={`${s.unidad} leading-none`} style={{ color: colorMeta }}>
            {unidad}
          </span>
        )}
      </span>

      {(variacion != null || periodo) && (
        <span className={`${s.meta} mt-1 leading-snug flex items-baseline gap-1.5 flex-wrap`}>
          {variacion != null && (
            <span className="font-semibold tabular-nums" style={{ color: colorVariacion }}>
              {flecha && <span aria-hidden="true">{flecha} </span>}
              {sinCambio && !flecha ? '= ' : ''}
              {variacion}
            </span>
          )}
          {periodo && <span style={{ color: colorMeta }}>{periodo}</span>}
        </span>
      )}

      {fuente && (
        <span className={`${s.meta} mt-0.5 leading-snug`} style={{ color: colorMeta }}>
          {fuente}
        </span>
      )}
    </div>
  )
}
