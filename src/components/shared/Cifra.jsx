import { getColorVariacion, flechaVariacion, signoVariacion } from '@/lib/variacion'

/**
 * Única representación de una cifra en el sitio: valor + unidad + variación
 * (coloreada por polaridad, nunca por dirección) + período + fuente.
 * Se usa en el ticker, el hero de informe, las cards de sección y las tablas.
 *
 * La variación siempre muestra flecha + color + texto: tres canales, ninguno
 * depende solo del color.
 */

const SIZES = {
  xl: {
    valor: 'text-4xl font-bold',
    unidad: 'text-base font-semibold',
    label: 'text-[11px]',
    meta: 'text-xs',
  },
  md: {
    valor: 'text-3xl font-bold',
    unidad: 'text-sm font-semibold',
    label: 'text-[10px]',
    meta: 'text-xs',
  },
  sm: {
    valor: 'text-base font-bold',
    unidad: 'text-xs font-semibold',
    label: 'text-[10px]',
    meta: 'text-[11px]',
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
