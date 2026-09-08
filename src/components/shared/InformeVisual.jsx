import { DATA } from '@/lib/variacion'

/* Banda visual de la tarjeta de informe: cifra principal, mini gráfico sin
   ejes ni leyenda (salvo dos series) y ficha técnica (fuente · período).
   La ficha de datos de cada informe vive en src/lib/informesVisuales.js.

   Tres formas: 'barras-h' (ranking), 'barras' (comparación corta) y
   'linea' (serie temporal). El elemento protagonista va en DATA[1]; el
   resto, en --ink-3. Dos series: DATA[1] y DATA[2]. */

const NEUTRO = 'var(--ink-3)'
const ALTO_BANDA = 184

const fmtChico = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })
const fmtEntero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })
const fmtMillones = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 2 })

function formatValor(v) {
  const a = Math.abs(v)
  const f = a >= 1e6 ? fmtMillones : a >= 100 ? fmtEntero : fmtChico
  return f.format(v).replace('-', '−')
}

function colorBarra(i, destacado) {
  if (destacado == null) return DATA[1]
  return i === destacado ? DATA[1] : NEUTRO
}

function BarrasH({ etiquetas, series, destacado }) {
  const valores = series[0].valores
  const max = Math.max(...valores.map(Math.abs), 0) || 1
  return (
    <div className="flex flex-col justify-center gap-1.5 h-full">
      {etiquetas.map((et, i) => (
        <div key={i} className="flex items-center gap-2 text-xs leading-none" style={{ color: 'var(--c-ink-mid)' }}>
          <span className="w-24 shrink-0 truncate">{et}</span>
          <span className="flex-1 h-2.5 relative">
            <span
              className="absolute inset-y-0 left-0"
              style={{ width: `${(Math.abs(valores[i]) / max) * 100}%`, background: colorBarra(i, destacado) }}
            />
          </span>
          <span className="w-14 shrink-0 text-right tabular-nums">{formatValor(valores[i])}</span>
        </div>
      ))}
    </div>
  )
}

function Barras({ etiquetas, series, destacado }) {
  const todos = series.flatMap(s => s.valores)
  const lo = Math.min(0, ...todos)
  const hi = Math.max(0, ...todos)
  const rango = hi - lo || 1
  const y = v => ((hi - v) / rango) * 100
  const cero = y(0)
  const n = etiquetas.length
  const k = series.length
  const slot = 100 / n
  const hueco = slot * 0.3
  const ancho = (slot - hueco) / k

  return (
    <div className="flex flex-col h-full">
      <svg className="flex-1 w-full min-h-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        {series.map((s, si) =>
          s.valores.map((v, i) => {
            const x = i * slot + hueco / 2 + si * ancho
            const top = Math.min(y(v), cero)
            const h = Math.abs(y(v) - cero)
            const color = k > 1 ? DATA[si + 1] : colorBarra(i, destacado)
            return <rect key={`${si}-${i}`} x={x} y={top} width={ancho} height={Math.max(h, 0.6)} fill={color} />
          })
        )}
        <line x1="0" x2="100" y1={cero} y2={cero} stroke={NEUTRO} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex mt-1.5 text-[11px] leading-none" style={{ color: 'var(--c-ink-mid)' }}>
        {etiquetas.map((et, i) => (
          <span key={i} className="flex-1 text-center truncate">{et}</span>
        ))}
      </div>
    </div>
  )
}

function Linea({ etiquetas, series }) {
  const todos = series.flatMap(s => s.valores)
  const lo = Math.min(...todos)
  const hi = Math.max(...todos)
  const margen = (hi - lo || 1) * 0.12
  const yMin = lo >= 0 && lo < hi / 2 ? 0 : lo - margen
  const yMax = hi + margen
  const y = v => ((yMax - v) / (yMax - yMin || 1)) * 100
  const n = etiquetas.length
  const x = i => (n > 1 ? (i / (n - 1)) * 100 : 50)

  const visibles = n <= 6
    ? etiquetas.map((et, i) => [et, i])
    : [[etiquetas[0], 0], [etiquetas[Math.floor((n - 1) / 2)], Math.floor((n - 1) / 2)], [etiquetas[n - 1], n - 1]]

  return (
    <div className="flex flex-col h-full">
      <svg className="flex-1 w-full min-h-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        {yMin <= 0 && yMax >= 0 && (
          <line x1="0" x2="100" y1={y(0)} y2={y(0)} stroke={NEUTRO} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        )}
        {series.map((s, si) => {
          const color = DATA[si + 1]
          const d = s.valores.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(v)}`).join(' ')
          const ult = s.valores.length - 1
          return (
            <g key={si}>
              <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={`M${x(ult)} ${y(s.valores[ult])} l0 0`} stroke={color} strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </g>
          )
        })}
      </svg>
      <div className="relative mt-1.5 h-[11px] text-[11px] leading-none" style={{ color: 'var(--c-ink-mid)' }}>
        {visibles.map(([et, i]) => {
          const px = x(i)
          const transform = px === 0 ? 'none' : px === 100 ? 'translateX(-100%)' : 'translateX(-50%)'
          return (
            <span key={i} className="absolute top-0 whitespace-nowrap" style={{ left: `${px}%`, transform }}>{et}</span>
          )
        })}
      </div>
    </div>
  )
}

const FORMAS = { 'barras-h': BarrasH, barras: Barras, linea: Linea }

export default function InformeVisual({ visual }) {
  if (!visual) return null
  const { cifra, unidad, periodo, fuente, hallazgo, tipo, series } = visual
  const Forma = FORMAS[tipo] ?? Barras
  const dosSeries = series.length > 1

  return (
    <div
      role="img"
      aria-label={hallazgo}
      className="px-6 pt-5 pb-4 border-b flex flex-col"
      style={{ background: 'var(--c-surface-2)', borderColor: 'var(--c-rule)', height: ALTO_BANDA }}
    >
      <p className="flex items-baseline gap-1.5 min-w-0" aria-hidden="true">
        <span className="text-data-md tabular-nums" style={{ color: 'var(--c-ink)' }}>{cifra}</span>
        <span className="text-xs truncate" style={{ color: 'var(--c-ink-mid)' }}>{unidad}</span>
      </p>

      <div className="flex-1 min-h-0 mt-3" aria-hidden="true">
        <Forma {...visual} />
      </div>

      <div className="flex items-center justify-between gap-3 mt-2 text-[11px] leading-none" style={{ color: 'var(--c-ink-mid)' }} aria-hidden="true">
        <p className="flex items-center gap-3 min-w-0">
          {dosSeries && series.map((s, i) => (
            <span key={i} className="flex items-center gap-1 truncate">
              <span className="inline-block w-2 h-2 shrink-0" style={{ background: DATA[i + 1] }} />
              {s.nombre}
            </span>
          ))}
        </p>
        <p className="shrink-0">{fuente} · {periodo}</p>
      </div>
    </div>
  )
}
