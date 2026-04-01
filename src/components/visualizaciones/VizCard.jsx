import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler,
)

const CHART_COMPONENTS = { bar: Bar, line: Line }

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      ticks: { font: { family: 'Roboto', size: 11 }, color: '#64748b' },
      grid:  { color: 'rgba(0,0,0,0.04)' },
    },
    y: {
      ticks: { font: { family: 'Roboto', size: 11 }, color: '#64748b' },
      grid:  { color: 'rgba(0,0,0,0.04)' },
    },
  },
}

const PADDING = 60
const FOOTER_H = 56
const MIN_W = 1200

function drawFooter(ctx, y, w) {
  ctx.fillStyle = '#0a1628'
  ctx.fillRect(0, y, w, FOOTER_H)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.round(w * 0.018)}px Roboto, system-ui, sans-serif`
  ctx.fillText('Datos', PADDING, y + FOOTER_H * 0.65)
  ctx.fillStyle = '#60a5fa'
  ctx.fillText('PBA', PADDING + Math.round(w * 0.06), y + FOOTER_H * 0.65)
  ctx.fillStyle = '#94a3b8'
  ctx.font = `${Math.round(w * 0.013)}px Roboto, system-ui, sans-serif`
  ctx.fillText('datospba.com', w - PADDING - Math.round(w * 0.11), y + FOOTER_H * 0.65)
}

function drawBrandedCanvas(sourceCanvas, title, fuente) {
  // Scale source up to at least MIN_W, preserving its natural proportions
  const scale = Math.max(1, MIN_W / (sourceCanvas.width + PADDING * 2))
  const W = Math.round((sourceCanvas.width + PADDING * 2) * scale)
  const titleH = fuente ? 96 : 72
  const H = Math.round(sourceCanvas.height * scale) + titleH + FOOTER_H + 16

  const out = document.createElement('canvas')
  out.width = W
  out.height = H
  const ctx = out.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Title
  ctx.fillStyle = '#0a1628'
  ctx.font = `bold ${Math.round(W * 0.022)}px Roboto, system-ui, sans-serif`
  ctx.fillText(title, PADDING, Math.round(titleH * 0.52), W - PADDING * 2)

  if (fuente) {
    ctx.fillStyle = '#94a3b8'
    ctx.font = `${Math.round(W * 0.015)}px Roboto, system-ui, sans-serif`
    ctx.fillText(`Fuente: ${fuente}`, PADDING, Math.round(titleH * 0.82))
  }

  // Chart
  ctx.drawImage(
    sourceCanvas,
    PADDING, titleH,
    sourceCanvas.width * scale, sourceCanvas.height * scale
  )

  drawFooter(ctx, H - FOOTER_H, W)

  return out
}

function triggerDownload(canvas, filename) {
  const a = document.createElement('a')
  a.download = filename.replace(/[^a-zA-Z0-9\-_áéíóúñ ]/g, '').trim() + '.png'
  a.href = canvas.toDataURL('image/png')
  a.click()
}

function TableContent({ tableData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {tableData.summary.map((s, i) => (
          <div key={i} className="bg-slate-50 rounded-lg p-3 text-center">
            <div className={`text-xl font-bold ${s.highlight ? 'text-amber-600' : 'text-slate-900'}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="border border-red-200 bg-red-50/50 rounded-lg p-3">
        <p className="text-xs font-bold text-red-700 mb-2">{tableData.highlight.label}</p>
        <div className="grid grid-cols-5 gap-2">
          {tableData.highlight.stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className={`text-lg font-bold ${s.color === 'blue' ? 'text-brand-700' : s.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{s.value}</div>
              <div className="text-xs text-slate-500 leading-tight">{s.label}</div>
              {s.note && <div className="text-xs text-slate-400">{s.note}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {tableData.columns.map((col, i) => (
                <th key={i} className={`py-2 px-3 font-semibold text-slate-500 whitespace-nowrap ${i === 0 ? 'text-left' : 'text-right'}`}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, i) => (
              <tr key={i} className={`border-b border-slate-100 ${row.provincia === 'Buenos Aires' ? 'bg-brand-50/80' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                <td className="py-1.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                  {row.provincia}
                  {row.distVal > 0 && <span className="ml-1 text-brand-400 text-[10px]">subrep.</span>}
                  {row.distVal < 0 && <span className="ml-1 text-red-400 text-[10px]">sobrerrep.</span>}
                </td>
                <td className="py-1.5 px-3 text-right text-slate-600">{row.hab.toLocaleString('es-AR')}</td>
                <td className="py-1.5 px-3 text-right text-slate-700 font-medium">{row.dip}</td>
                <td className="py-1.5 px-3 text-right text-slate-600">{row.habDip.toLocaleString('es-AR')}</td>
                <td className="py-1.5 px-3 text-right font-semibold text-brand-700">{row.ideal}</td>
                <td className={`py-1.5 px-3 text-right font-semibold ${row.distVal > 0 ? 'text-brand-700' : 'text-red-600'}`}>
                  {row.distVal > 0 ? '+' : ''}{row.distVal.toFixed(1).replace('.', ',')}%
                </td>
              </tr>
            ))}
            <tr className="bg-slate-100 border-t-2 border-slate-300">
              <td className="py-2 px-3 font-semibold text-slate-800">Total / Promedio</td>
              <td className="py-2 px-3 text-right font-semibold text-slate-700">{tableData.total.hab.toLocaleString('es-AR')}</td>
              <td className="py-2 px-3 text-right font-semibold text-slate-700">{tableData.total.dip}</td>
              <td className="py-2 px-3 text-right font-semibold text-slate-700">{tableData.total.habDip.toLocaleString('es-AR')}</td>
              <td className="py-2 px-3 text-right font-semibold text-brand-700">{tableData.total.ideal}</td>
              <td className="py-2 px-3 text-right text-slate-500">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      {tableData.footer && <p className="text-[10px] text-slate-400 leading-snug">{tableData.footer}</p>}
    </div>
  )
}

export default function VizCard({ viz, index = 0 }) {
  const ChartComponent = CHART_COMPONENTS[viz.tipo] ?? Bar
  const chartRef = useRef(null)
  const cardRef = useRef(null)
  const actionsRef = useRef(null)

  async function handleDownload() {
    const filename = viz.titulo || 'visualizacion'

    if (viz.tipo === 'tabla') {
      actionsRef.current.style.visibility = 'hidden'
      const captured = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      // Keep natural proportions, scale up to at least MIN_W
      const upscale = Math.max(1, MIN_W / captured.width)
      const W = Math.round(captured.width * upscale)
      const H = Math.round(captured.height * upscale) + FOOTER_H

      const out = document.createElement('canvas')
      out.width = W
      out.height = H
      const ctx = out.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)
      ctx.drawImage(captured, 0, 0, W, H - FOOTER_H)
      drawFooter(ctx, H - FOOTER_H, W)
      actionsRef.current.style.visibility = ''
      triggerDownload(out, filename)
    } else {
      const chartCanvas = chartRef.current?.canvas
      if (!chartCanvas) return
      const out = drawBrandedCanvas(chartCanvas, viz.titulo, viz.fuente)
      triggerDownload(out, filename)
    }
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      id={viz.id}
      className="bg-white rounded-xl border border-slate-200/60 p-6"
    >
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">{viz.titulo}</h3>
          {viz.fuente && (
            <p className="text-xs text-slate-400 mt-0.5">Fuente: {viz.fuente}</p>
          )}
        </div>
        <div ref={actionsRef} className="flex items-center gap-2 shrink-0">
          {viz.tema && <Badge variant="secondary">{viz.tema}</Badge>}
          <button
            onClick={handleDownload}
            title="Descargar PNG para Twitter"
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viz.tipo === 'tabla' ? (
        <TableContent tableData={viz.tableData} />
      ) : (
        <div className="h-64">
          <ChartComponent ref={chartRef} data={viz.chartData} options={BASE_OPTIONS} />
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        {viz.informeUrl ? (
          <Link
            to={viz.informeUrl}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 no-underline"
          >
            Ver informe →
          </Link>
        ) : <span />}
        {viz.fecha && <p className="text-xs text-slate-400">{viz.fecha}</p>}
      </div>
    </motion.div>
  )
}
