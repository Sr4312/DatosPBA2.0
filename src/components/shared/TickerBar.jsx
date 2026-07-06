import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function TickerBar({ reportes }) {
  if (!reportes.length) return null
  const doubled = [...reportes, ...reportes, ...reportes, ...reportes]
  return (
    <div className="bg-white border-b border-slate-200 overflow-hidden">
      <div className="flex ticker-track" style={{ width: 'max-content' }}>
        {doubled.map((r, i) => {
          const isUp   = r.tendencia === 'sube'
          const isDown = r.tendencia === 'baja'
          return (
            <div key={i} className="flex items-center gap-3 px-5 py-3 border-r border-slate-100 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUp ? 'bg-green-50' : isDown ? 'bg-red-50' : 'bg-slate-50'}`}>
                {isUp   ? <TrendingUp   className="w-4 h-4 text-green-600" />
                : isDown ? <TrendingDown className="w-4 h-4 text-red-500" />
                :          <Minus        className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{r.titulo}</span>
                  <span className="text-[10px] text-slate-400">{r.fecha}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0a1628]">{r.dato}</span>
                  {r.variacion && (
                    <span className={`text-xs font-medium ${isUp ? 'text-green-600' : isDown ? 'text-red-500' : 'text-slate-400'}`}>
                      {r.variacion}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
