import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FilterBar({ search, onSearchChange, filters = [], className }) {
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {onSearchChange !== undefined && (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/20 focus:border-brand-400"
          />
        </div>
      )}
      {filters.map(f => (
        <select
          key={f.key}
          value={f.value}
          onChange={e => f.onChange(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-400/20 focus:border-brand-400"
        >
          <option value="all">{f.placeholder}</option>
          {f.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  )
}
