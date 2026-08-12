import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA, DATA_BORDES } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)
ChartJS.defaults.font.family = 'Archivo, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'

// ─── COLORES ─────────────────────────────────────────────────

const C = {
  bg:       'var(--c-bg)',
  ink:      'var(--c-ink)',
  inkMid:   'var(--c-ink-mid)',
  inkLight: 'var(--c-ink-light)',
  rule:     'var(--c-rule)',
  hero:     '#0F172A',
  accent:   '#3d65b2',
}

// ─── DATOS ───────────────────────────────────────────────────

/* Composición del total de cargos por universo institucional. Las categorías
   de organismos son las que distingue el propio Mapa del Estado; los valores
   salen de sumar el anexo por institución. */
const UNIVERSOS = [
  { label: 'Jurisdicciones',              valor: 2194, color: DATA[4], borde: DATA_BORDES[4] },
  { label: 'Organismos descentralizados', valor: 573,  color: DATA[1], borde: DATA_BORDES[1] },
  { label: 'Organismos de la Constitución', valor: 538, color: DATA[2], borde: DATA_BORDES[2] },
  { label: 'Administración Central',      valor: 48,   color: DATA[3], borde: DATA_BORDES[3] },
]

/* Las 12 instituciones con más cargos directivos, ordenadas de mayor a menor. */
const RANKING = [
  { inst: 'Ministerio de Seguridad',                 tipo: 'Jurisdicción', cargos: 352 },
  { inst: 'Ministerio de Justicia y DDHH',           tipo: 'Jurisdicción', cargos: 293 },
  { inst: 'Dir. Gral. de Cultura y Educación',       tipo: 'Organismo',    cargos: 225 },
  { inst: 'Honorable Tribunal de Cuentas',           tipo: 'Organismo',    cargos: 185 },
  { inst: 'Min. de Infraestructura y Serv. Públicos', tipo: 'Jurisdicción', cargos: 179 },
  { inst: 'Ministerio de Salud',                     tipo: 'Jurisdicción', cargos: 149 },
  { inst: 'Min. de Desarrollo de la Comunidad',      tipo: 'Jurisdicción', cargos: 136 },
  { inst: 'Ministerio de Gobierno',                  tipo: 'Jurisdicción', cargos: 134 },
  { inst: 'Min. de Hábitat y Desarrollo Urbano',     tipo: 'Jurisdicción', cargos: 126 },
  { inst: 'Min. de Producción, Ciencia e Innov.',    tipo: 'Jurisdicción', cargos: 116 },
  { inst: 'Ministerio de Trabajo',                   tipo: 'Jurisdicción', cargos: 103 },
  { inst: 'Ministerio de Transporte',                tipo: 'Jurisdicción', cargos: 102 },
]

/* Del total de cargos a las personas que los ocupan. Los porcentajes de las dos
   últimas filas se calculan sobre bases distintas y por eso van explicitados. */
const PERSONAS = [
  { ind: 'Cargos directivos relevados',                base: '3.353', pct: '100%' },
  { ind: 'Cargos con autoridad identificada por nombre', base: '2.478', pct: '73,9% de los cargos' },
  { ind: 'Cargos sin autoridad identificada',          base: '875',   pct: '26,1% de los cargos' },
  { ind: 'Personas distintas identificadas',           base: '2.173', pct: '-' },
  { ind: 'Personas que ocupan más de un cargo',        base: '298',   pct: '13,7% de las personas' },
  { ind: 'Designaciones que reúnen esas personas',     base: '603',   pct: '24,3% de los cargos con nombre' },
]

/* Denominaciones estructurales identificables por el nombre de la unidad. No es
   una clasificación jerárquica oficial: la fuente no publica rango. */
const DENOMINACIONES = [
  { deno: 'Dirección Provincial',      cantidad: 497,  pct: '14,8%' },
  { deno: 'Coordinación',              cantidad: 154,  pct: '4,6%'  },
  { deno: 'Subsecretaría',             cantidad: 135,  pct: '4,0%'  },
  { deno: 'Dirección General',         cantidad: 104,  pct: '3,1%'  },
  { deno: 'Presidencia (organismos)',  cantidad: 24,   pct: '0,7%'  },
  { deno: 'Secretaría General',        cantidad: 7,    pct: '0,2%'  },
]

/* Anexo: las 48 jurisdicciones y organismos relevados, de mayor a menor. */
const ANEXO = [
  ['Ministerio de Seguridad', 'Jurisdicción', 352],
  ['Ministerio de Justicia y Derechos Humanos', 'Jurisdicción', 293],
  ['Dirección General de Cultura y Educación', 'Organismo', 225],
  ['Honorable Tribunal de Cuentas', 'Organismo', 185],
  ['Ministerio de Infraestructura y Servicios Públicos', 'Jurisdicción', 179],
  ['Ministerio de Salud', 'Jurisdicción', 149],
  ['Ministerio de Desarrollo de la Comunidad', 'Jurisdicción', 136],
  ['Ministerio de Gobierno', 'Jurisdicción', 134],
  ['Ministerio de Hábitat y Desarrollo Urbano', 'Jurisdicción', 126],
  ['Ministerio de Producción, Ciencia e Innovación Tecnológica', 'Jurisdicción', 116],
  ['Ministerio de Trabajo', 'Jurisdicción', 103],
  ['Ministerio de Transporte', 'Jurisdicción', 102],
  ['Secretaría General', 'Jurisdicción', 88],
  ['Ministerio de Ambiente', 'Jurisdicción', 78],
  ['Ministerio de Comunicación Pública', 'Jurisdicción', 71],
  ['Instituto Cultural de la Provincia de Buenos Aires', 'Organismo', 69],
  ['Contaduría General de la Provincia', 'Organismo', 68],
  ['Ministerio de Economía', 'Jurisdicción', 67],
  ['Ministerio de Mujeres y Diversidad', 'Jurisdicción', 62],
  ['Ministerio de Desarrollo Agrario', 'Jurisdicción', 61],
  ['Agencia de Recaudación de la Provincia de Buenos Aires (ARBA)', 'Organismo', 58],
  ['Instituto de Obra Médico Asistencial (IOMA)', 'Organismo', 58],
  ['Instituto de Previsión Social (IPS)', 'Organismo', 57],
  ['Jefatura de Asesores del Gobernador', 'Jurisdicción', 51],
  ['Patronato de Liberados Bonaerense', 'Organismo', 50],
  ['Asesoría General de Gobierno', 'Organismo', 48],
  ['Organismo Provincial de la Niñez y Adolescencia', 'Organismo', 48],
  ['Organismo Provincial de Integración Social y Urbana (OPISU)', 'Organismo', 39],
  ['Instituto Provincial de Lotería y Casinos', 'Organismo', 30],
  ['Tesorería General de la Provincia', 'Organismo', 29],
  ['Instituto de la Vivienda', 'Organismo', 23],
  ['Coordinación General Unidad Gobernador', 'Jurisdicción', 21],
  ['Instituto Universitario Policial Provincial "Juan Vucetich"', 'Organismo', 18],
  ['Autoridad del Agua (Presidencia)', 'Organismo', 17],
  ['Comisión de Investigaciones Científicas (CIC)', 'Organismo', 16],
  ['Corporación de Fomento del Valle del Río Colorado (CORFO)', 'Organismo', 16],
  ['Fiscalía de Estado', 'Organismo', 16],
  ['Junta Electoral', 'Organismo', 15],
  ['Dirección de Vialidad', 'Organismo', 14],
  ['Comité de Cuenca del Río Reconquista (COMIREC)', 'Organismo', 13],
  ['Organismo de Control de la Energía Eléctrica (OCEBA)', 'Organismo', 11],
  ['Comité de Cuenca del Río Luján (COMILU)', 'Organismo', 10],
  ['Ente Administrador del Astillero Río Santiago', 'Organismo', 10],
  ['Tribunal Fiscal de Apelación', 'Organismo', 8],
  ['Caja de Retiros, Jubilaciones y Pensiones (Directorio)', 'Organismo', 7],
  ['Unidad "Observatorio Político Electoral" (OPE)', 'Jurisdicción', 4],
  ['Comité de la Cuenca Hídrica Arroyo San Francisco - Las Piedras', 'Organismo', 1],
  ['Gobernación de la Provincia de Buenos Aires', 'Jurisdicción', 1],
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. Un relevamiento de stock sin serie previa no
   tiene variación que valorar, así que toda polaridad es neutra. */
const HERO_STATS = [
  { label: 'Cargos directivos',            valor: '3.353', unidad: 'cargos', polaridad: 'neutro', periodo: 'al 10 de agosto de 2026' },
  { label: 'Jurisdicciones y organismos',  valor: '48',    unidad: 'relevados', polaridad: 'neutro', periodo: '20 jurisdicciones y 28 organismos' },
  { label: 'Cargos con autoridad publicada', valor: '2.478', unidad: 'de 3.353', polaridad: 'neutro', periodo: '73,9% del total relevado' },
  { label: 'Personas con más de un cargo', valor: '298',   unidad: 'de 2.173', polaridad: 'neutro', periodo: 'reúnen 603 designaciones' },
]

// ─── DOWNLOAD ────────────────────────────────────────────────

const DL_PADDING  = 60
const DL_FOOTER_H = 56
const DL_MIN_W    = 1200

function drawFooter(ctx, y, w) {
  ctx.fillStyle = '#0F172A'
  ctx.fillRect(0, y, w, DL_FOOTER_H)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.round(w * 0.018)}px Archivo, Roboto, system-ui, sans-serif`
  ctx.fillText('Datos', DL_PADDING, y + DL_FOOTER_H * 0.65)
  ctx.fillStyle = '#60a5fa'
  ctx.fillText('PBA', DL_PADDING + Math.round(w * 0.06), y + DL_FOOTER_H * 0.65)
  ctx.fillStyle = '#94a3b8'
  ctx.font = `${Math.round(w * 0.013)}px Archivo, Roboto, system-ui, sans-serif`
  ctx.fillText('datospba.com', w - DL_PADDING - Math.round(w * 0.11), y + DL_FOOTER_H * 0.65)
}

function triggerDownload(canvas, filename) {
  const a = document.createElement('a')
  a.download = filename.replace(/[^a-zA-Z0-9\-_áéíóúñ ]/g, '').trim() + '.png'
  a.href = canvas.toDataURL('image/png')
  a.click()
}

async function downloadVizContainer(node, title, fuente) {
  const { default: html2canvas } = await import('html2canvas')
  // html2canvas no respeta el estado colapsado de <details>: pintaria la tabla
  // encima de la ficha tecnica. La excluimos de la captura.
  const captured = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    ignoreElements: el => el.tagName === 'DETAILS',
  })
  const upscale  = Math.max(1, DL_MIN_W / captured.width)
  const innerW   = Math.round(captured.width * upscale)
  const innerH   = Math.round(captured.height * upscale)
  const titleH   = fuente ? 96 : 72
  const W = innerW
  const H = innerH + titleH + DL_FOOTER_H
  const out = document.createElement('canvas')
  out.width = W; out.height = H
  const ctx = out.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#0F172A'
  ctx.font = `bold ${Math.round(W * 0.020)}px Archivo, Roboto, system-ui, sans-serif`
  ctx.fillText(title, DL_PADDING, Math.round(titleH * 0.52), W - DL_PADDING * 2)
  if (fuente) {
    ctx.fillStyle = '#94a3b8'
    ctx.font = `${Math.round(W * 0.014)}px Archivo, Roboto, system-ui, sans-serif`
    ctx.fillText(`Fuente: ${fuente}`, DL_PADDING, Math.round(titleH * 0.82))
  }
  ctx.drawImage(captured, 0, titleH, innerW, innerH)
  drawFooter(ctx, H - DL_FOOTER_H, W)
  triggerDownload(out, title)
}

/* La descarga es un link de texto debajo del gráfico, alineado a su borde
   izquierdo. El botón queda fuera del nodo capturado, así el PNG no lo incluye. */
function DownloadableViz({ title, fuente, children }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    if (!ref.current || busy) return
    setBusy(true)
    try { await downloadVizContainer(ref.current, title, fuente) }
    catch (e) { console.error(e) }
    setBusy(false)
  }

  return (
    <div>
      <div ref={ref} style={{ background: C.bg }}>
        {children}
      </div>
      <button
        onClick={handleDownload}
        disabled={busy}
        style={{
          background: 'none', border: 'none', padding: 0, marginTop: 8,
          fontSize: '0.75rem', fontWeight: 600, color: C.inkMid,
          textDecoration: 'underline', textUnderlineOffset: 3,
          cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit',
        }}
      >
        {busy ? 'Generando la imagen…' : 'Descargar el gráfico (PNG)'}
      </button>
    </div>
  )
}

// ─── COMPONENTES UI ──────────────────────────────────────────

function SectionLabel({ children, dark = false, color }) {
  return (
    <p
      style={{ color: color || (dark ? 'rgba(255,255,255,0.5)' : C.accent) }}
      className={dark ? 'text-xs font-semibold tracking-[0.18em] uppercase mb-3' : 'text-sm font-semibold mb-3'}
    >
      {children}
    </p>
  )
}

function SH({ title }) {
  return (
    <div style={{ borderBottom: `2px solid ${C.ink}`, paddingBottom: '0.75rem', marginBottom: '1.5rem', marginTop: '2.25rem' }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.875rem)', fontWeight: 700, color: C.ink, lineHeight: 1.05, letterSpacing: '-0.015em' }}>{title}</h2>
    </div>
  )
}

function CifraCard(props) {
  return (
    <div style={{
      background: '#fff', borderRadius: 2,
      border: `1px solid ${C.rule}`,
      padding: '1.125rem 1.125rem 1rem',
    }}>
      <Cifra size="md" {...props} />
    </div>
  )
}

/* Ficha técnica del gráfico: fuente, período, universo, unidad y CV cuando
   aplica, como elemento de diseño visible bajo cada visualización. */
function FichaTecnica({ items }) {
  return (
    <div style={{
      borderTop: `1px solid ${C.rule}`, marginTop: '0.75rem', paddingTop: '0.625rem',
      display: 'flex', flexWrap: 'wrap', gap: '0.375rem 1.75rem',
    }}>
      {items.map(([k, v]) => (
        <div key={k}>
          <span style={{ fontSize: '0.62rem', color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{k}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: C.inkMid }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function ChartCard({ title, hallazgo, ficha, tabla, legend, height = 220, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, padding: '1.25rem 1.25rem 0.875rem', margin: '1.25rem 0' }}>
      {title && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>{title}</p>}
      {legend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '0.625rem' }} aria-hidden="true">
          {legend.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              {l.label}
            </div>
          ))}
        </div>
      )}
      <div style={{ position: 'relative', height }} role="img" aria-label={hallazgo || title}>{children}</div>
      {tabla && (
        <details style={{ marginTop: '0.625rem' }}>
          <summary style={{ fontSize: '0.72rem', fontWeight: 600, color: C.inkMid, cursor: 'pointer' }}>
            Ver los datos del gráfico en tabla
          </summary>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
            <thead>
              <tr>
                {tabla.columnas.map((c, i) => (
                  <th key={c} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.68rem', color: C.inkMid, fontWeight: 700, padding: '0.3rem 0.5rem', borderBottom: `1px solid ${C.rule}` }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabla.filas.map((fila, i) => (
                <tr key={i}>
                  {fila.map((celda, j) => (
                    <td key={j} className="tabular-nums" style={{ textAlign: j === 0 ? 'left' : 'right', fontSize: '0.75rem', color: j === 0 ? C.ink : C.inkMid, padding: '0.3rem 0.5rem', borderBottom: `1px solid var(--surface-2)` }}>{celda}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
      {ficha && <FichaTecnica items={ficha} />}
    </div>
  )
}

// ─── FORMATO ─────────────────────────────────────────────────

const fmtNum = v => v.toLocaleString('es-AR')

const fmtPct = v =>
  `${v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`

const TOTAL_CARGOS = 3353

const share = v => fmtPct((v / TOTAL_CARGOS) * 100)

// ─── VALUE LABELS PLUGIN ─────────────────────────────────────

/* Barras horizontales: el valor va escrito a la derecha de cada barra, para que
   ningún dato dependa del tooltip. */
const hValueLabels = {
  id: 'hValueLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.getDatasetMeta(0).data.forEach((bar, i) => {
      ctx.save()
      ctx.fillStyle = '#334155'
      ctx.font = 'bold 11px Archivo, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(fmtNum(chart.data.datasets[0].data[i]), bar.x + 8, bar.y)
      ctx.restore()
    })
  },
}

// ─── CHART COMPONENTS ────────────────────────────────────────

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8 }

/* En pantallas chicas los nombres largos se parten en dos líneas: si no, el eje
   se queda con todo el ancho y las barras se reducen a un muñón. Se corta por
   el punto que deja la línea más larga lo más corta posible: partir por la
   mitad de los caracteres desbalancea cuando hay una palabra dominante
   ("Min. de" / "Infraestructura y Serv. Públicos"). */
function partirEtiqueta(texto, anchoCanvas) {
  if (anchoCanvas > 560 || texto.length <= 20) return texto
  const palabras = texto.split(' ')
  if (palabras.length < 2) return texto
  let mejor = null
  for (let i = 1; i < palabras.length; i++) {
    const lineas = [palabras.slice(0, i).join(' '), palabras.slice(i).join(' ')]
    const costo = Math.max(lineas[0].length, lineas[1].length)
    if (!mejor || costo < mejor.costo) mejor = { costo, lineas }
  }
  return mejor.lineas
}

/* Eje de categorías. Chart.js le da como máximo el 30% del canvas y ahí los
   nombres largos pierden letras; se le permite el ancho que necesita, pero sin
   pasar del 45% para que la barra siga siendo lo que se lee. */
function ejeCategorias(anchoDeseado) {
  return {
    grid: { display: false },
    border: { display: false },
    ticks: {
      font: { size: 11 },
      /* Con etiquetas de dos líneas Chart.js saltea categorías por falta de
         alto: acá ninguna puede faltar. */
      autoSkip: false,
      callback(value) {
        return partirEtiqueta(this.getLabelForValue(value), this.chart.width)
      },
    },
    afterFit(scale) {
      scale.width = Math.max(scale.width, Math.min(anchoDeseado, scale.chart.width * 0.45))
    },
  }
}

function ChartUniversos() {
  const data = {
    labels: UNIVERSOS.map(u => u.label),
    datasets: [{
      data: UNIVERSOS.map(u => u.valor),
      backgroundColor: UNIVERSOS.map(u => u.color),
      borderColor: UNIVERSOS.map(u => u.borde),
      borderWidth: 1,
    }],
  }
  return (
    <ChartCard
      title="Cargos directivos por universo institucional"
      hallazgo="Gráfico de anillo: las 20 jurisdicciones reúnen 2.194 cargos (65,4%), los organismos descentralizados 573 (17,1%), los organismos de la Constitución 538 (16,0%) y la Administración Central 48 (1,4%)."
      tabla={{
        columnas: ['Universo', 'Cargos', '% del total'],
        filas: UNIVERSOS.map(u => [u.label, fmtNum(u.valor), share(u.valor)]),
      }}
      ficha={[
        ['Fuente', 'Mapa del Estado - Provincia de Buenos Aires'],
        ['Período', 'al 10 de agosto de 2026'],
        ['Universo', '48 jurisdicciones y organismos del Poder Ejecutivo'],
        ['Unidad', 'unidades organizativas con cargo directivo'],
      ]}
      legend={UNIVERSOS.map(u => ({ label: `${u.label} - ${fmtNum(u.valor)} (${share(u.valor)})`, color: u.color }))}
      height={250}
    >
      <Doughnut
        data={data}
        options={{
          responsive: true, maintainAspectRatio: false, cutout: '58%',
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtNum(ctx.raw)} cargos (${share(ctx.raw)})` } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartRanking() {
  const data = {
    labels: RANKING.map(r => r.inst),
    datasets: [{
      data: RANKING.map(r => r.cargos),
      backgroundColor: RANKING.map(r => (r.tipo === 'Organismo' ? DATA[2] : DATA[4])),
      borderRadius: 4, barPercentage: 0.72,
    }],
  }
  return (
    <ChartCard
      title="Las 12 instituciones con más cargos directivos"
      hallazgo="Gráfico de barras horizontales: el Ministerio de Seguridad encabeza con 352 cargos, seguido por Justicia y Derechos Humanos con 293, la Dirección General de Cultura y Educación con 225 y el Honorable Tribunal de Cuentas con 185."
      tabla={{
        columnas: ['Institución', 'Tipo', 'Cargos', '% del total'],
        filas: RANKING.map(r => [r.inst, r.tipo, fmtNum(r.cargos), share(r.cargos)]),
      }}
      ficha={[
        ['Fuente', 'Mapa del Estado - Provincia de Buenos Aires'],
        ['Período', 'al 10 de agosto de 2026'],
        ['Universo', 'las 12 instituciones con más cargos, sobre 48 relevadas'],
        ['Unidad', 'unidades organizativas con cargo directivo'],
      ]}
      legend={[{ label: 'Jurisdicción', color: DATA[4] }, { label: 'Organismo', color: DATA[2] }]}
      height={380}
    >
      <Bar
        data={data}
        plugins={[hValueLabels]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 52 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtNum(ctx.raw)} cargos (${share(ctx.raw)})` } },
          },
          scales: {
            /* Cada barra lleva su cifra escrita al lado: el eje de valor sería
               el mismo dato dos veces y le come ancho al gráfico. */
            x: { min: 0, ticks: { display: false }, grid: { display: false }, border: { display: false } },
            y: ejeCategorias(210),
          },
        }}
      />
    </ChartCard>
  )
}

// ─── TABLAS ──────────────────────────────────────────────────

function TablaPersonas() {
  const head = ['Universo', 'Cantidad', 'Proporción']
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map((h, i) => (
              <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERSONAS.map((r, i, arr) => (
            <tr key={r.ind} style={{ borderBottom: i < arr.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}>
              <td style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{r.ind}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.base}</td>
              <td className="tabular-nums" style={{ padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{r.pct}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaDenominaciones() {
  const head = ['Denominación de la unidad', 'Cantidad', '% del total']
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map((h, i) => (
              <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DENOMINACIONES.map(d => (
            <tr key={d.deno} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
              <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{d.deno}</td>
              <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtNum(d.cantidad)}</td>
              <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{d.pct}</td>
            </tr>
          ))}
          <tr style={{ background: '#f8fafc' }}>
            <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700 }}>Otras denominaciones (direcciones, jefaturas, unidades)</td>
            <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700, textAlign: 'right' }}>2.432</td>
            <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 700, textAlign: 'right' }}>72,5%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function TablaAnexo() {
  const head = ['Institución', 'Tipo', 'Cargos']
  return (
    <details style={{ margin: '1.25rem 0 0' }}>
      <summary style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink, cursor: 'pointer', padding: '0.75rem 0' }}>
        Ver las 48 jurisdicciones y organismos, de mayor a menor cantidad de cargos
      </summary>
      <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'auto', maxHeight: 520, marginTop: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {head.map((h, i) => (
                <th key={h} style={{ position: 'sticky', top: 0, background: '#f8fafc', textAlign: i < 2 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.625rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ANEXO.map(([inst, tipo, cargos]) => (
              <tr key={inst} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                <td style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.ink, fontWeight: 600 }}>{inst}</td>
                <td style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.inkMid }}>{tipo}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.inkMid, textAlign: 'right' }}>{fmtNum(cargos)}</td>
              </tr>
            ))}
            <tr style={{ background: '#f8fafc' }}>
              <td style={{ padding: '0.55rem 1rem', fontSize: '0.78rem', color: C.ink, fontWeight: 700 }}>Total provincial</td>
              <td style={{ padding: '0.55rem 1rem' }} />
              <td className="tabular-nums" style={{ padding: '0.55rem 1rem', fontSize: '0.78rem', color: C.ink, fontWeight: 700, textAlign: 'right' }}>3.353</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  )
}

// ─── HERO ────────────────────────────────────────────────────

function Hero() {
  return (
    <div style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-12">
        <Link to="/informes" className="inline-flex items-center gap-1.5 text-sm no-underline mb-10" style={{ color: 'rgba(255,255,255,0.62)' }}>
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        <SectionLabel dark color="rgba(255,255,255,0.62)">Mapa del Estado · Poder Ejecutivo provincial · Agosto de 2026</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          Los cargos políticos y directivos<br />
          del Ejecutivo bonaerense
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          El relevamiento completo del organigrama que publica el Mapa del Estado provincial identifica{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>3.353 cargos directivos</strong> en el Poder
          Ejecutivo. Cuatro instituciones reúnen casi un tercio y el Ministerio de Seguridad, por sí solo,
          uno de cada diez.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
          {HERO_STATS.map((s, i) => (
            <div
              key={i}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2 }}
              className="p-5"
            >
              <Cifra dark size="xl" label={s.label} valor={s.valor} unidad={s.unidad} variacion={s.variacion} polaridad={s.polaridad} periodo={s.periodo} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}
        >
          {[
            { label: 'Fuente',        val: 'Mapa del Estado - Gobierno de la PBA' },
            { label: 'Universo',      val: '48 dependencias · 20 jurisdicciones y 28 organismos' },
            { label: 'Período',       val: 'Al 10 de agosto de 2026' },
            { label: 'Actualización', val: 'Agosto 2026' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── TESIS ───────────────────────────────────────────────────

/* La tesis va primero y la evidencia después: este bloque abre el informe
   inmediatamente después del hero. */
function Tesis() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-10">
      <div style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '1.25rem' }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 2.6vw, 1.75rem)', fontWeight: 700, color: C.ink, lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: '0.75rem', maxWidth: 800 }}>
          El Mapa del Estado alcanza para contar la estructura, no para seguir a quienes la conducen
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          La Provincia publica el organigrama completo de su Poder Ejecutivo y ese listado permite contar
          3.353 unidades con cargo directivo. Pero <strong>875 de ellas</strong>, una de cada cuatro, figuran
          sin autoridad identificada por nombre, y entre las que sí la tienen hay 298 personas que firman
          603 designaciones.
        </p>
      </div>
    </div>
  )
}

// ─── NOTA METODOLÓGICA ───────────────────────────────────────

function NotaMetodologica() {
  return (
    <div style={{
        background: 'var(--surface-2)',
        borderTop: '2px solid var(--ink)',
        padding: '18px 20px',
      }}
    >
      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
        Nota metodológica
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        El relevamiento cubre los 48 archivos de detalle publicados en las dos secciones del Mapa del Estado
        (jurisdicciones y organismos) al 10 de agosto de 2026, sin excepciones. Se contabiliza{' '}
        <strong style={{ color: C.ink }}>un cargo por cada unidad organizativa registrada</strong>, tenga o no
        autoridad individualizada por nombre. Un cargo no equivale a un puesto rentado ni a un agente de la
        planta: mide unidades del organigrama, no dotación de personal. Los otros dos poderes del Estado
        provincial y los 135 municipios quedan fuera de este universo.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        La distribución por género y el conteo de personas se calculan sobre los 2.478 cargos con autoridad
        identificada, el único subconjunto que la fuente permite cruzar. El género se infiere del nombre y
        apellido publicados, sin ninguna declaración de la persona: es una aproximación binaria que no
        registra identidades no binarias. Las 875 unidades sin autoridad publicada pueden estar vacantes, a
        cargo de un subrogante o simplemente sin el dato cargado, y la fuente no distingue entre esos casos.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        La agrupación por denominación es una clasificación editorial hecha sobre el nombre de cada unidad y{' '}
        <strong style={{ color: C.ink }}>no reproduce un escalafón oficial</strong>: el Mapa del Estado no
        publica el rango de cada cargo. Tampoco publica una serie histórica, así que este informe describe una
        foto y no una evolución. Cualquier comparación con relevamientos anteriores exige verificar que el
        criterio de conteo de unidades sea el mismo.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeCargosPoliticosPBA() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* LOS DOS UNIVERSOS — dos columnas, texto y gráfico */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Las 20 jurisdicciones reúnen dos de cada tres cargos directivos" />
        <div className="grid lg:grid-cols-2 gap-x-10 items-start">
          <div>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              El Mapa del Estado separa dos universos. Las jurisdicciones son la Gobernación, los 17
              ministerios, la Secretaría General, la Coordinación General Unidad Gobernador, la Jefatura de
              Asesores y el Observatorio Político Electoral: 20 dependencias que suman 2.194 cargos, el 65,4%
              del total. Los organismos son 28 y aportan los 1.159 restantes.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
              Dentro de los organismos hay tres familias de tamaño muy distinto. Los seis de la Constitución
              concentran 538 cargos, casi la mitad del subtotal, porque incluyen a la Dirección General de
              Cultura y Educación y al Honorable Tribunal de Cuentas. Los descentralizados y autárquicos
              suman 573 entre veintiuno. La Administración Central es una sola dependencia, la Asesoría
              General de Gobierno, con 48.
            </p>
            <p className="text-base leading-relaxed" style={{ color: C.inkMid }}>
              La brecha entre los dos universos responde al alcance de cada uno. Una jurisdicción arrastra
              toda su cadena de subsecretarías y direcciones; un organismo tiene objeto acotado. La excepción
              son esos dos organismos constitucionales de escala ministerial, que por sí solos explican el
              35,4% de los cargos de todo el bloque de organismos.
            </p>
          </div>
          <DownloadableViz title="Cargos directivos por universo institucional" fuente="Mapa del Estado - Provincia de Buenos Aires">
            <ChartUniversos />
          </DownloadableViz>
        </div>
      </div>

      {/* EL RANKING — gráfico primero, después prosa y anexo */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Seguridad tiene 352 cargos, más que las veinte instituciones más chicas juntas" />
          <DownloadableViz title="Las 12 instituciones con más cargos directivos" fuente="Mapa del Estado - Provincia de Buenos Aires">
            <ChartRanking />
          </DownloadableViz>
          <p className="text-base leading-relaxed mt-6 mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Las veinte dependencias del final de la tabla, desde la Gobernación hasta el Instituto Provincial
            de Lotería y Casinos, reúnen 280 cargos entre todas. El Ministerio de Seguridad tiene 352. Sumado
            a Justicia y Derechos Humanos, el área de seguridad y política penitenciaria concentra 645 cargos:
            uno de cada cinco del Ejecutivo bonaerense, más que Salud, Trabajo, Economía, Ambiente y
            Desarrollo Agrario en conjunto.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <CifraCard label="Seguridad y Justicia" valor="645" unidad="cargos" polaridad="neutro" periodo="19,2% del total provincial" />
            <CifraCard label="Las cuatro mayores instituciones" valor="1.055" unidad="cargos" polaridad="neutro" periodo="31,5% del total provincial" />
            <CifraCard label="Las veinte más chicas" valor="280" unidad="cargos" polaridad="neutro" periodo="8,4% del total provincial" />
          </div>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            La pendiente cae rápido después del cuarto puesto. Dieciséis dependencias tienen 20 cargos o
            menos y la mayoría son comités de cuenca, entes binacionales o de infraestructura específica, con
            estructuras coherentes con su objeto. En el piso quedan la Gobernación y el Comité de la Cuenca
            Hídrica Arroyo San Francisco - Las Piedras, con un cargo cada uno.
          </p>
          <TablaAnexo />
          <FichaTecnica items={[
            ['Fuente', 'Mapa del Estado - Provincia de Buenos Aires'],
            ['Período', 'al 10 de agosto de 2026'],
            ['Universo', 'las 48 jurisdicciones y organismos del Poder Ejecutivo'],
            ['Unidad', 'unidades organizativas con cargo directivo'],
          ]} />
        </div>
      </div>

      {/* DE CARGOS A PERSONAS — prosa, tabla densa, cifras de género */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="De 3.353 cargos a 2.173 personas" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El conteo de unidades y el de personas no coinciden, y la distancia entre ambos se abre por dos
          lados. Por arriba, un cuarto de las unidades no publica a su titular. Por abajo, las que sí lo
          publican repiten nombres: 2.478 designaciones corresponden a 2.173 personas distintas.
        </p>
        <TablaPersonas />
        <FichaTecnica items={[
          ['Fuente', 'Mapa del Estado - Provincia de Buenos Aires'],
          ['Período', 'al 10 de agosto de 2026'],
          ['Universo', '48 jurisdicciones y organismos del Poder Ejecutivo'],
          ['Unidad', 'cargos, personas y designaciones'],
        ]} />
        <p className="text-base leading-relaxed mt-6 mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El 13,7% de las autoridades identificadas ocupa el 24,3% de las designaciones con nombre. La
          acumulación tiene explicaciones administrativas conocidas: una misma autoridad puede conducir más
          de una unidad o presidir varios cuerpos colegiados del mismo organismo. Pero su medida importa,
          porque de ella depende cuántas personas conducen efectivamente el Ejecutivo provincial. Entre las
          autoridades identificadas, la composición por género es la más pareja de las cifras del
          relevamiento: 178 varones más que mujeres sobre 2.478 cargos.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ maxWidth: 560 }}>
          <CifraCard label="Autoridades varones" valor="1.328" unidad="53,6%" polaridad="neutro" periodo="sobre cargos con nombre publicado" />
          <CifraCard label="Autoridades mujeres" valor="1.150" unidad="46,4%" polaridad="neutro" periodo="sobre cargos con nombre publicado" />
        </div>
      </div>

      {/* DENOMINACIONES — tabla y después prosa */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="Siete de cada diez unidades no llevan una denominación jerárquica reconocible" />
          <TablaDenominaciones />
          <FichaTecnica items={[
            ['Fuente', 'Mapa del Estado - Provincia de Buenos Aires'],
            ['Período', 'al 10 de agosto de 2026'],
            ['Universo', 'las 3.353 unidades organizativas relevadas'],
            ['Unidad', 'clasificación editorial según el nombre de cada unidad'],
          ]} />
          <p className="text-base leading-relaxed mt-6 mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Las denominaciones estándar de la administración bonaerense cubren apenas 921 unidades. Las 2.432
            restantes llevan nombres que no encajan en ninguna categoría estructural: direcciones simples,
            jefaturas, unidades funcionales, delegaciones y designaciones específicas de cada organismo. Sin
            un escalafón publicado, el nombre de la unidad es el único indicio de su rango.
          </p>
          <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Entre lo que sí es identificable, la proporción respeta la forma esperable: 135 subsecretarías,
            497 direcciones provinciales y 104 direcciones generales, unas 3,7 direcciones provinciales por
            subsecretaría. Ese es el esqueleto visible del Ejecutivo. El resto del organigrama existe, se
            publica y se cuenta, pero no se puede ordenar por nivel con la información disponible.
          </p>
        </div>
      </div>

      {/* NOTA METODOLÓGICA */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <NotaMetodologica />
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-sm font-semibold" style={{ color: C.ink }}>
            Fuentes
          </p>
          <p className="text-sm mt-1" style={{ color: C.inkMid }}>
            Gobierno de la Provincia de Buenos Aires. Mapa del Estado, sección Jurisdicciones, consultada el
            10 de agosto de 2026 · Mapa del Estado, sección Organismos, consultada el 10 de agosto de 2026 ·
            Planillas de detalle por jurisdicción y organismo (48 archivos), exportadas el 10 de agosto de
            2026 · Elaboración propia DatosPBA · 2026
          </p>
          <a
            href="https://mapadelestado.gba.gob.ar/jurisdicciones"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Mapa del Estado - Jurisdicciones <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <br />
          <a
            href="https://mapadelestado.gba.gob.ar/organismos"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-2"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Mapa del Estado - Organismos <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
