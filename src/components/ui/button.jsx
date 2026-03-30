import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  default:   'bg-brand-600 text-white hover:bg-brand-700',
  outline:   'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
}
const sizes = {
  default: 'h-10 px-4 py-2 text-sm',
  sm:      'h-8 px-3 text-xs',
  lg:      'h-11 px-6 text-base',
  icon:    'h-9 w-9 p-0',
}

const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:opacity-50 cursor-pointer',
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  />
))
Button.displayName = 'Button'
export { Button }
