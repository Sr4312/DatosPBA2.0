import { cn } from '@/lib/utils'

/* Badge de tema: el único radius-pill del sistema. Sin fondo, texto en
   --ink-2, delimitado por borde de 1px. Las variantes previas colapsan
   en este único estilo. */
export function Badge({ className, variant, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      style={{ borderColor: 'var(--rule)', color: 'var(--ink-2)', background: 'transparent' }}
      {...props}
    />
  )
}
