import { cn } from '@/lib/utils'

const variants = {
  default:   'bg-brand-600 text-white',
  secondary: 'bg-brand-50 text-brand-700 border border-brand-100',
  outline:   'border border-brand-200 text-brand-600 bg-transparent',
}

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
