import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import Cifra from '@/components/shared/Cifra'
import { DATA, getColorVariacion, getTonoVariacion, VALORACION_HEX } from '@/lib/variacion'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
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

/* Variación del empleo privado registrado por región, en las dos ventanas de
   comparación del informe. */
const REGIONES = [
  { label: ['AMBA', '(40 partidos)'],                 seis:  5.3, bienio: -3.1 },
  { label: ['Resto de la provincia', '(95 partidos)'], seis:  9.3, bienio: -0.8 },
]

/* Los cinco de mayor y los cinco de menor variación en cada ventana, con sus
   niveles absolutos. Ordenados de mayor a menor variación porcentual. */
const EXTREMOS_SEIS = [
  { partido: 'Navarro',        desde: 1453,  hasta: 1930,  pct:  32.8 },
  { partido: 'Punta Indio',    desde: 471,   hasta: 609,   pct:  29.3 },
  { partido: 'Ezeiza',         desde: 26312, hasta: 33037, pct:  25.6 },
  { partido: 'San Vicente',    desde: 3675,  hasta: 4598,  pct:  25.1 },
  { partido: 'Pila',           desde: 228,   hasta: 283,   pct:  24.1 },
  { partido: 'Berisso',        desde: 6098,  hasta: 5770,  pct:  -5.4 },
  { partido: 'Coronel Suárez', desde: 4693,  hasta: 4386,  pct:  -6.5 },
  { partido: 'Olavarría',      desde: 17458, hasta: 15866, pct:  -9.1 },
  { partido: 'Benito Juárez',  desde: 2452,  hasta: 2031,  pct: -17.2 },
  { partido: 'Marcos Paz',     desde: 4378,  hasta: 3520,  pct: -19.6 },
]

const EXTREMOS_BIENIO = [
  { partido: 'Exaltación de la Cruz', desde: 3871,  hasta: 4321,  pct:  11.6 },
  { partido: 'Tordillo',              desde: 155,   hasta: 167,   pct:   7.7 },
  { partido: 'Marcos Paz',            desde: 3291,  hasta: 3520,  pct:   7.0 },
  { partido: 'Punta Indio',           desde: 570,   hasta: 609,   pct:   6.8 },
  { partido: 'General Alvear',        desde: 758,   hasta: 804,   pct:   6.1 },
  { partido: 'Las Flores',            desde: 2160,  hasta: 1857,  pct: -14.0 },
  { partido: 'Guaminí',               desde: 1255,  hasta: 1066,  pct: -15.1 },
  { partido: 'Pila',                  desde: 337,   hasta: 283,   pct: -16.0 },
  { partido: 'Ensenada',              desde: 12757, hasta: 10352, pct: -18.9 },
  { partido: 'Villarino',             desde: 2995,  hasta: 2387,  pct: -20.3 },
]

/* Los 15 municipios con mayor empleo privado registrado en diciembre de 2025. */
const MAYORES = [
  { partido: 'General Pueyrredón', region: 'Resto', puestos: 123767, seis:  11.4, bienio:  1.0 },
  { partido: 'La Matanza',         region: 'AMBA',  puestos: 121158, seis:   3.3, bienio: -1.9 },
  { partido: 'Vicente López',      region: 'AMBA',  puestos: 116952, seis:   3.4, bienio:  0.5 },
  { partido: 'San Isidro',         region: 'AMBA',  puestos:  93071, seis:  -1.7, bienio: -6.1 },
  { partido: 'La Plata',           region: 'AMBA',  puestos:  90183, seis:   1.6, bienio: -3.1 },
  { partido: 'Tigre',              region: 'AMBA',  puestos:  81613, seis:  13.8, bienio: -1.4 },
  { partido: 'General San Martín', region: 'AMBA',  puestos:  70868, seis:  -1.8, bienio: -5.8 },
  { partido: 'Quilmes',            region: 'AMBA',  puestos:  65763, seis:   1.5, bienio: -2.5 },
  { partido: 'Pilar',              region: 'AMBA',  puestos:  61897, seis:  13.3, bienio: -5.3 },
  { partido: 'Bahía Blanca',       region: 'Resto', puestos:  60537, seis:  11.2, bienio:  0.5 },
  { partido: 'Tres de Febrero',    region: 'AMBA',  puestos:  57609, seis:  10.0, bienio:  1.3 },
  { partido: 'Lomas de Zamora',    region: 'AMBA',  puestos:  56552, seis:  -1.8, bienio: -4.0 },
  { partido: 'Avellaneda',         region: 'AMBA',  puestos:  55243, seis:  -0.5, bienio: -5.4 },
  { partido: 'Lanús',              region: 'AMBA',  puestos:  50266, seis:   0.4, bienio: -5.7 },
  { partido: 'Morón',              region: 'AMBA',  puestos:  48885, seis:  -4.2, bienio: -3.7 },
]

/* Anexo completo: los 135 municipios, ordenados por variación de seis años.
   [partido, región, var. dic. 2019 - dic. 2025, var. dic. 2023 - dic. 2025] */
const ANEXO = [
  ['Navarro', 'Resto', 32.8, 3.0],
  ['Punta Indio', 'Resto', 29.3, 6.8],
  ['Ezeiza', 'AMBA', 25.6, 4.2],
  ['San Vicente', 'AMBA', 25.1, -0.1],
  ['Pila', 'Resto', 24.1, -16.0],
  ['Escobar', 'AMBA', 23.4, -2.5],
  ['Cañuelas', 'AMBA', 23.2, -4.4],
  ['General Lavalle', 'Resto', 22.2, -3.0],
  ['General Juan Madariaga', 'Resto', 21.6, -2.7],
  ['General Rodríguez', 'AMBA', 21.5, 1.8],
  ['Laprida', 'Resto', 21.4, 3.2],
  ['Guaminí', 'Resto', 21.0, -15.1],
  ['San Antonio de Areco', 'Resto', 20.7, 0.2],
  ['Moreno', 'AMBA', 20.3, -1.4],
  ['Exaltación de la Cruz', 'AMBA', 20.2, 11.6],
  ['General Alvear', 'Resto', 19.8, 6.1],
  ['Hipólito Yrigoyen', 'Resto', 19.5, 3.5],
  ['Pinamar', 'Resto', 19.1, -2.5],
  ['Malvinas Argentinas', 'AMBA', 18.5, -1.5],
  ['Berazategui', 'AMBA', 18.4, 0.8],
  ['General Alvarado', 'Resto', 18.3, 5.4],
  ['General La Madrid', 'Resto', 18.2, 5.1],
  ['General Belgrano', 'Resto', 17.4, 5.9],
  ['General Guido', 'Resto', 17.3, 4.9],
  ['Tres Lomas', 'Resto', 17.3, 4.7],
  ['Castelli', 'Resto', 16.8, 3.7],
  ['Coronel de Marina L. Rosales', 'Resto', 16.7, 2.4],
  ['Saladillo', 'Resto', 16.5, -0.3],
  ['Alberti', 'Resto', 16.3, 2.1],
  ['San Andrés de Giles', 'Resto', 16.2, 4.5],
  ['Adolfo Alsina', 'Resto', 16.2, 4.1],
  ['Suipacha', 'Resto', 16.1, 3.6],
  ['Roque Pérez', 'Resto', 15.9, -0.4],
  ['Esteban Echeverría', 'AMBA', 15.6, -2.2],
  ['Pellegrini', 'Resto', 15.4, 5.2],
  ['Bolívar', 'Resto', 15.1, 2.3],
  ['Tandil', 'Resto', 14.9, 1.2],
  ['Colón', 'Resto', 14.6, 4.6],
  ['Carmen de Areco', 'Resto', 14.2, 0.2],
  ['Trenque Lauquen', 'Resto', 14.1, 2.8],
  ['General Las Heras', 'AMBA', 13.9, -6.1],
  ['Tigre', 'AMBA', 13.8, -1.4],
  ['Mar Chiquita', 'Resto', 13.8, 0.7],
  ['Ramallo', 'Resto', 13.5, -2.6],
  ['Pilar', 'AMBA', 13.3, -5.3],
  ['Zárate', 'AMBA', 13.0, -11.2],
  ['Adolfo Gonzales Chaves', 'Resto', 13.0, -9.2],
  ['Carlos Tejedor', 'Resto', 12.8, -0.5],
  ['Dolores', 'Resto', 12.5, -2.1],
  ['Chivilcoy', 'Resto', 12.4, 0.0],
  ['Puán', 'Resto', 12.1, 0.1],
  ['Presidente Perón', 'AMBA', 12.0, -1.2],
  ['Rojas', 'Resto', 12.0, 3.3],
  ['Necochea', 'Resto', 11.5, 2.5],
  ['Chascomús', 'Resto', 11.4, -0.2],
  ['General Pueyrredón', 'Resto', 11.4, 1.0],
  ['Bahía Blanca', 'Resto', 11.2, 0.5],
  ['Chacabuco', 'Resto', 11.1, -0.2],
  ['9 de Julio', 'Resto', 10.7, -1.0],
  ['San Nicolás', 'Resto', 10.6, -3.6],
  ['Rauch', 'Resto', 10.6, 0.3],
  ['Hurlingham', 'AMBA', 10.6, -4.0],
  ['Monte', 'Resto', 10.5, -3.1],
  ['General Villegas', 'Resto', 10.1, 0.8],
  ['Tres de Febrero', 'AMBA', 10.0, 1.3],
  ['Luján', 'AMBA', 9.8, -2.6],
  ['Tapalqué', 'Resto', 9.5, -8.2],
  ['Salliqueló', 'Resto', 9.2, -2.5],
  ['Coronel Pringles', 'Resto', 9.2, 0.2],
  ['General Arenales', 'Resto', 9.1, 3.0],
  ['Ayacucho', 'Resto', 8.7, -1.4],
  ['Las Flores', 'Resto', 8.7, -14.0],
  ['Arrecifes', 'Resto', 8.6, 2.0],
  ['Salto', 'Resto', 8.6, -4.8],
  ['Magdalena', 'Resto', 8.5, 3.7],
  ['Tordillo', 'Resto', 8.4, 7.7],
  ['Coronel Dorrego', 'Resto', 8.0, 0.9],
  ['Villa Gesell', 'Resto', 7.7, -7.1],
  ['Rivadavia', 'Resto', 7.5, 1.3],
  ['Pergamino', 'Resto', 7.1, -0.1],
  ['Lobos', 'Resto', 7.1, -0.1],
  ['Mercedes', 'Resto', 7.0, -6.3],
  ['Balcarce', 'Resto', 6.9, -4.3],
  ['Junín', 'Resto', 6.9, -0.6],
  ['Brandsen', 'AMBA', 6.9, -3.6],
  ['Azul', 'Resto', 6.9, -1.3],
  ['Maipú', 'Resto', 6.9, 1.3],
  ['Lobería', 'Resto', 6.8, 0.5],
  ['Pehuajó', 'Resto', 6.7, 2.6],
  ['General Pinto', 'Resto', 6.7, -0.3],
  ['Almirante Brown', 'AMBA', 6.0, -2.9],
  ['Saavedra', 'Resto', 5.8, -0.5],
  ['San Cayetano', 'Resto', 5.2, -2.4],
  ['Patagones', 'Resto', 5.0, 3.6],
  ['Daireaux', 'Resto', 4.2, -1.3],
  ['Tornquist', 'Resto', 3.9, -5.3],
  ['Vicente López', 'AMBA', 3.4, 0.5],
  ['La Matanza', 'AMBA', 3.3, -1.9],
  ['La Costa', 'Resto', 3.3, -4.6],
  ['Lincoln', 'Resto', 3.2, -3.4],
  ['Leandro N. Alem', 'Resto', 2.9, 4.6],
  ['Lezama', 'Resto', 2.8, 3.1],
  ['Ituzaingó', 'AMBA', 2.7, -5.8],
  ['Monte Hermoso', 'Resto', 2.6, -13.2],
  ['Tres Arroyos', 'Resto', 2.0, -0.7],
  ['San Miguel', 'AMBA', 1.9, -1.2],
  ['Baradero', 'Resto', 1.9, -0.8],
  ['La Plata', 'AMBA', 1.6, -3.1],
  ['Quilmes', 'AMBA', 1.5, -2.5],
  ['Ensenada', 'AMBA', 1.2, -18.9],
  ['Villarino', 'Resto', 1.1, -20.3],
  ['General Viamonte', 'Resto', 1.0, -1.4],
  ['25 de Mayo', 'Resto', 0.7, -0.6],
  ['Florentino Ameghino', 'Resto', 0.7, -6.6],
  ['Lanús', 'AMBA', 0.4, -5.7],
  ['Carlos Casares', 'Resto', 0.3, -11.6],
  ['Campana', 'AMBA', 0.1, -2.0],
  ['Florencio Varela', 'AMBA', 0.1, -4.5],
  ['San Pedro', 'Resto', -0.3, -5.6],
  ['Avellaneda', 'AMBA', -0.5, -5.4],
  ['Bragado', 'Resto', -0.8, -6.4],
  ['San Isidro', 'AMBA', -1.7, -6.1],
  ['Merlo', 'AMBA', -1.8, -5.3],
  ['General San Martín', 'AMBA', -1.8, -5.8],
  ['Lomas de Zamora', 'AMBA', -1.8, -4.0],
  ['General Paz', 'Resto', -2.1, -4.2],
  ['Capitán Sarmiento', 'Resto', -2.5, -2.6],
  ['San Fernando', 'AMBA', -2.8, -8.0],
  ['José C. Paz', 'AMBA', -3.3, -5.2],
  ['Morón', 'AMBA', -4.2, -3.7],
  ['Berisso', 'AMBA', -5.4, -10.9],
  ['Coronel Suárez', 'Resto', -6.5, -13.4],
  ['Olavarría', 'Resto', -9.1, -6.3],
  ['Benito Juárez', 'Resto', -17.2, -2.2],
  ['Marcos Paz', 'AMBA', -19.6, 7.0],
]

/* La valoración de cada cifra se declara acá y el color lo deriva <Cifra>:
   nunca se asigna un color a mano. */
const HERO_STATS = [
  { label: 'Empleo privado registrado', valor: '2.013.084', unidad: 'puestos', polaridad: 'neutro', periodo: 'en los 135 municipios, dic. 2025' },
  { label: 'Variación en seis años',    valor: '+6,3%',  variacion: '+6,3%', polaridad: 'mayor-es-mejor', periodo: 'dic. 2019 - dic. 2025' },
  { label: 'Variación en el bienio',    valor: '−2,5%',  variacion: '−2,5%', polaridad: 'mayor-es-mejor', periodo: 'dic. 2023 - dic. 2025' },
  { label: 'Municipios que perdieron empleo', valor: '84', unidad: 'de 135', polaridad: 'neutro', periodo: 'en el bienio; eran 17 en seis años' },
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

const fmtPct = v =>
  `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`

const fmtNum = v => v.toLocaleString('es-AR')

/* Los ticks del eje no llevan signo "+", pero sí el menos tipográfico, para no
   mezclar guion y U+2212 dentro del mismo gráfico. */
const fmtEje = v => `${v < 0 ? '−' : ''}${Math.abs(v)}%`

const fmtAbs = v => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('es-AR')}`

// ─── VALUE LABELS PLUGINS ────────────────────────────────────

/* Barras verticales con signo: la etiqueta va arriba de las positivas y debajo
   de las negativas, sobre varias series. */
const valueLabelsSigned = {
  id: 'valueLabelsSigned',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, di) => {
      chart.getDatasetMeta(di).data.forEach((bar, i) => {
        const v = dataset.data[i]
        ctx.save()
        ctx.fillStyle = '#334155'
        ctx.font = 'bold 11px Archivo, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = v < 0 ? 'top' : 'bottom'
        ctx.fillText(fmtPct(v), bar.x, v < 0 ? bar.y + 5 : bar.y - 5)
        ctx.restore()
      })
    })
  },
}

/* Barras horizontales con signo: la etiqueta queda afuera de la punta de la
   barra. El tono lo deriva el helper de valoración, no un color a mano. */
function makeHSignedLabels(id) {
  return {
    id,
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.getDatasetMeta(0).data.forEach((bar, i) => {
        const v = chart.data.datasets[0].data[i]
        ctx.save()
        ctx.fillStyle = getTonoVariacion({ variacion: v, polaridad: 'mayor-es-mejor' }) === 'worse'
          ? VALORACION_HEX.worse.text
          : '#334155'
        ctx.font = 'bold 11px Archivo, sans-serif'
        ctx.textBaseline = 'middle'
        ctx.textAlign = v < 0 ? 'right' : 'left'
        ctx.fillText(fmtPct(v), v < 0 ? bar.x - 6 : bar.x + 6, bar.y)
        ctx.restore()
      })
    },
  }
}

const labelsSeis   = makeHSignedLabels('labelsSeis')
const labelsBienio = makeHSignedLabels('labelsBienio')

// ─── CHART COMPONENTS ────────────────────────────────────────

const tooltipBase = { backgroundColor: '#0F172A', titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 8 }

function ChartRegiones() {
  const data = {
    labels: REGIONES.map(d => d.label),
    datasets: [
      { label: 'Dic. 2019 - dic. 2025', data: REGIONES.map(d => d.seis),   backgroundColor: DATA[2], borderRadius: 4, barPercentage: 0.6 },
      { label: 'Dic. 2023 - dic. 2025', data: REGIONES.map(d => d.bienio), backgroundColor: DATA[1], borderRadius: 4, barPercentage: 0.6 },
    ],
  }
  return (
    <ChartCard
      title="Variación del empleo privado registrado por región"
      hallazgo="Gráfico de barras: en seis años el resto de la provincia creció 9,3% contra 5,3% del AMBA, pero en el último bienio el AMBA cayó 3,1% y el resto de la provincia 0,8%."
      tabla={{
        columnas: ['Región', 'Dic. 2019 - dic. 2025', 'Dic. 2023 - dic. 2025'],
        filas: [
          ['AMBA (40 partidos)', fmtPct(5.3), fmtPct(-3.1)],
          ['Resto de la provincia (95 partidos)', fmtPct(9.3), fmtPct(-0.8)],
        ],
      }}
      ficha={[
        ['Fuente', 'OEDE - SIPA y ARCA'],
        ['Período', 'dic. 2019 - dic. 2025 y dic. 2023 - dic. 2025'],
        ['Universo', '135 municipios bonaerenses'],
        ['Unidad', 'variación % del empleo asalariado privado registrado'],
      ]}
      legend={[{ label: 'Seis años', color: DATA[2] }, { label: 'Último bienio', color: DATA[1] }]}
      height={250}
    >
      <Bar
        data={data}
        plugins={[valueLabelsSigned]}
        options={{
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 20, bottom: 8 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${fmtPct(ctx.raw)}` } },
          },
          scales: {
            y: { suggestedMin: -6, suggestedMax: 12, ticks: { callback: fmtEje }, grid: { color: 'rgba(13,17,23,0.08)' } },
            x: { ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

function ChartExtremos({ datos, titulo, hallazgo, columnasTabla, periodoFicha, plugin, min, max }) {
  const data = {
    labels: datos.map(d => d.partido),
    datasets: [{
      data: datos.map(d => d.pct),
      /* Valoración por polaridad × signo: el empleo es 'mayor-es-mejor' y el
         tono lo deriva el helper, nunca un verde o un rojo elegido a mano. */
      backgroundColor: datos.map(d =>
        VALORACION_HEX[getTonoVariacion({ variacion: d.pct, polaridad: 'mayor-es-mejor' })].base
      ),
      borderRadius: 4, barPercentage: 0.72,
    }],
  }
  return (
    <ChartCard
      title={titulo}
      hallazgo={hallazgo}
      tabla={{
        columnas: columnasTabla,
        filas: datos.map(d => [d.partido, fmtNum(d.desde), fmtNum(d.hasta), fmtAbs(d.hasta - d.desde), fmtPct(d.pct)]),
      }}
      ficha={[
        ['Fuente', 'OEDE - SIPA y ARCA'],
        ['Período', periodoFicha],
        ['Universo', 'los 5 de mayor y los 5 de menor variación entre 135 municipios'],
        ['Unidad', 'variación % del empleo asalariado privado registrado'],
      ]}
      height={330}
    >
      <Bar
        data={data}
        plugins={[plugin]}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { left: 42, right: 48 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipBase, callbacks: { label: ctx => `  ${fmtPct(ctx.raw)}` } },
          },
          scales: {
            x: { suggestedMin: min, suggestedMax: max, ticks: { callback: fmtEje }, grid: { color: 'rgba(13,17,23,0.08)' } },
            y: { grid: { display: false }, ticks: { font: { size: 11 } } },
          },
        }}
      />
    </ChartCard>
  )
}

// ─── TABLAS ──────────────────────────────────────────────────

function TablaMayores() {
  const head = ['Partido', 'Región', 'Dic. 2025 (puestos)', 'Var. seis años', 'Var. bienio']
  return (
    <div style={{ background: '#fff', borderRadius: 2, border: `1px solid ${C.rule}`, overflow: 'hidden', margin: '1.25rem 0 0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {head.map((h, i) => (
              <th key={h} style={{ textAlign: i < 2 ? 'left' : 'right', fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MAYORES.map((m, i, arr) => (
            <tr key={m.partido} style={{ borderBottom: i < arr.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}>
              <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{m.partido}</td>
              <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{m.region}</td>
              <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: C.inkMid, textAlign: 'right' }}>{fmtNum(m.puestos)}</td>
              <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: m.seis, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(m.seis)}</td>
              <td className="tabular-nums" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: m.bienio, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(m.bienio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaAnexo() {
  const head = ['Partido', 'Región', 'Var. seis años', 'Var. bienio']
  return (
    <details style={{ margin: '1.25rem 0 0' }}>
      <summary style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink, cursor: 'pointer', padding: '0.75rem 0' }}>
        Ver los 135 municipios ordenados por variación de seis años
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
            {ANEXO.map(([partido, region, seis, bienio], i) => (
              <tr key={partido} style={{ borderBottom: i < ANEXO.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.ink, fontWeight: 600 }}>{partido}</td>
                <td style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', color: C.inkMid }}>{region}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: seis, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(seis)}</td>
                <td className="tabular-nums" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, textAlign: 'right', color: getColorVariacion({ variacion: bienio, polaridad: 'mayor-es-mejor', texto: true }) }}>{fmtPct(bienio)}</td>
              </tr>
            ))}
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

        <SectionLabel dark color="rgba(255,255,255,0.62)">OEDE · SIPA y ARCA · Enero 2019 - diciembre 2025</SectionLabel>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}
        >
          El empleo privado en los<br />
          135 municipios bonaerenses
        </h1>

        <p
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          El empleo asalariado privado de la Provincia tocó su techo en enero de 2024 y desde entonces
          retrocedió sin pausa. En diciembre de 2025 quedó{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>2,8% por debajo de aquel máximo</strong>, con 84
          de los 135 municipios perdiendo puestos en los últimos dos años.
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
            { label: 'Fuente',        val: 'OEDE - Ministerio de Capital Humano' },
            { label: 'Universo',      val: '135 municipios · 40 del GBA y 95 del interior' },
            { label: 'Período',       val: 'Ene. 2019 - dic. 2025' },
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
          La caída pesa más en el conurbano y se extiende más en el interior
        </h2>
        <p style={{ color: C.inkMid, fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
          El agregado provincial lo manda el conurbano, que concentra el 73,2% del empleo privado y cayó
          3,1% en el bienio. Pero contados de a uno, los municipios que pierden empleo están sobre todo
          en el interior: <strong>84 de 135</strong> retrocedieron desde diciembre de 2023, cuando en la
          ventana larga habían crecido 118. El diagnóstico cambia según la escala que se elija, y con él
          el destinatario de cualquier política de empleo.
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
        El OEDE publica sus series por región, no por provincia. Los 40 partidos del GBA salen de la tabla
        de la región AMBA y los 95 partidos del interior se aislaron de la región Centro, que también
        incluye departamentos de Córdoba, Santa Fe, Entre Ríos y La Pampa. CABA figura en la tabla del
        AMBA y queda fuera de este informe por no ser un municipio bonaerense. El dato se imputa al
        distrito donde la empresa <strong style={{ color: C.ink }}>declara que trabaja el personal</strong>, no
        al domicilio del trabajador, y la suma de los 135 municipios no coincide necesariamente con el
        total provincial que publican otras fuentes oficiales.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6, marginBottom: 8 }}>
        La escala de los municipios va de menos de 200 puestos a más de 120.000, por eso las comparaciones
        se hacen en variación porcentual. En los partidos chicos esa elección tiene un costo: Pila entra
        entre los cinco de mayor crecimiento de seis años con 55 puestos y entre los cinco de mayor caída
        del bienio con 54 puestos menos. Las variaciones porcentuales de municipios de pocos cientos de
        puestos no son comparables con las del conurbano.
      </p>
      <p style={{ fontSize: '0.82rem', color: C.inkMid, lineHeight: 1.6 }}>
        En diciembre de 2025, <strong style={{ color: C.ink }}>17 municipios</strong> seguían por debajo de su
        nivel de empleo de diciembre de 2019. La serie describe el empleo registrado según esta fuente y no
        permite, por sí sola, atribuir la evolución a un sector, una política o un evento: eso exigiría
        cruzarla con la estructura productiva de cada partido.
      </p>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────

export default function InformeEmpleoPrivado135Municipios() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Hero />

      <Tesis />

      {/* EL CICLO COMPLETO — prosa y cifras, sin gráfico */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="El máximo de la serie fue enero de 2024 y la Provincia no volvió a alcanzarlo" />
        <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          La serie del OEDE recorre un ciclo entero en siete años. Cae durante 2019 y 2020, con el golpe
          más seco entre enero y mayo de 2020. Se recupera de forma sostenida desde 2021 y acelera a partir
          de 2022 hasta el pico de enero de 2024. Y retrocede desde entonces, con un repunte breve a
          comienzos de 2025 que no alcanzó a compensar lo que vino después.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <CifraCard label="Máximo de la serie" valor="2.072.151" unidad="puestos" polaridad="neutro" periodo="enero de 2024" />
          <CifraCard label="Distancia hasta ese máximo" valor="−2,8%" variacion="−2,8%" polaridad="mayor-es-mejor" periodo="dic. 2025 vs. ene. 2024" />
          <CifraCard label="Derrumbe del arranque de la pandemia" valor="−6,4%" variacion="−6,4%" polaridad="mayor-es-mejor" periodo="entre enero y mayo de 2020" />
        </div>
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El nivel de diciembre de 2025 queda por debajo del techo de 2024 y por encima del piso de 2019.
          Las dos ventanas que usa este informe entran a ese recorrido por puntos distintos. La de seis
          años abarca el ciclo entero, incluida la recuperación. La de dos años arranca ya pasado el pico
          y solo mide la retracción.
        </p>
      </div>

      {/* AMBA VS. RESTO — dos columnas, texto y gráfico */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="El conurbano concentra el 73,2% del empleo privado registrado" />
          <div className="grid lg:grid-cols-2 gap-x-10 items-start">
            <div>
              <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
                Los 40 partidos del GBA reunían en diciembre de 2025 casi tres cuartas partes del empleo
                asalariado privado de la Provincia, contra el 26,8% de los 95 municipios restantes. Ese peso
                bajó apenas desde diciembre de 2019, cuando el AMBA explicaba el 74,0% del total.
              </p>
              <p className="text-base leading-relaxed mb-4" style={{ color: C.inkMid }}>
                La dinámica se invierte según qué ventana se mire. En seis años el interior creció 9,3% y el
                conurbano 5,3%. En el bienio reciente el conurbano cayó 3,1% y el interior 0,8%.
              </p>
              <p className="text-base leading-relaxed" style={{ color: C.inkMid }}>
                Buena parte de la ventaja del interior en el período largo se construyó en los años de
                recuperación pospandemia. Como el AMBA pesa tres de cada cuatro puestos, su retroceso
                reciente define el resultado provincial aunque su caída porcentual no sea la más profunda
                del mapa.
              </p>
            </div>
            <DownloadableViz title="Variación del empleo privado registrado: AMBA y resto de la provincia" fuente="OEDE - SIPA y ARCA">
              <ChartRegiones />
            </DownloadableViz>
          </div>
        </div>
      </div>

      {/* LOS EXTREMOS — gráfico, prosa, gráfico */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Cuatro de los cinco de mayor crecimiento suman menos de 1.000 puestos" />
        <DownloadableViz title="Mayor y menor crecimiento del empleo privado, dic. 2019 - dic. 2025" fuente="OEDE - SIPA y ARCA">
          <ChartExtremos
            datos={EXTREMOS_SEIS}
            titulo="Los 5 partidos de mayor y menor crecimiento del empleo, dic. 2019 - dic. 2025"
            hallazgo="Gráfico de barras horizontales: en seis años Navarro creció 32,8% y Punta Indio 29,3%, mientras Marcos Paz cayó 19,6% y Benito Juárez 17,2%."
            columnasTabla={['Partido', 'Dic. 2019', 'Dic. 2025', 'Var. abs.', 'Var. %']}
            periodoFicha="dic. 2019 - dic. 2025"
            plugin={labelsSeis}
            min={-25}
            max={38}
          />
        </DownloadableViz>
        <p className="text-base leading-relaxed mt-6 mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Navarro sumó 477 puestos, Punta Indio 138, San Vicente 923 y Pila 55. Ezeiza es la excepción de
          escala del grupo: creció 6.725 puestos en seis años, uno de los mayores incrementos absolutos del
          interior del GBA, asociado en buena medida a la logística del Aeropuerto Internacional. Del otro
          lado, Benito Juárez y Olavarría son partidos del centro-sur con peso agropecuario y de minería no
          metalífera. Cambiar la ventana a los dos últimos años reordena por completo la lista, y varios
          nombres cruzan de un extremo al otro.
        </p>
        <DownloadableViz title="Mayor y menor crecimiento del empleo privado, dic. 2023 - dic. 2025" fuente="OEDE - SIPA y ARCA">
          <ChartExtremos
            datos={EXTREMOS_BIENIO}
            titulo="Los 5 partidos de mayor y menor crecimiento del empleo, dic. 2023 - dic. 2025"
            hallazgo="Gráfico de barras horizontales: en el bienio Exaltación de la Cruz creció 11,6% y Marcos Paz 7,0%, mientras Villarino cayó 20,3% y Ensenada 18,9%."
            columnasTabla={['Partido', 'Dic. 2023', 'Dic. 2025', 'Var. abs.', 'Var. %']}
            periodoFicha="dic. 2023 - dic. 2025"
            plugin={labelsBienio}
            min={-25}
            max={16}
          />
        </DownloadableViz>
        <p className="text-base leading-relaxed mt-6" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          Marcos Paz encabeza las caídas de seis años y aparece tercero entre los que más crecieron en el
          bienio. Pila y Guaminí hacen el recorrido inverso. Villarino y Ensenada, en cambio, concentran la
          actividad en un puñado de grandes empleadores industriales y portuarios, y el movimiento de uno
          solo arrastra el total del partido.
        </p>
      </div>

      {/* LOS QUINCE MAYORES — prosa, tabla, cierre */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <SH title="General Pueyrredón desplazó a La Matanza como el mayor empleador privado" />
          <p className="text-base leading-relaxed mb-2" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Como el peso de cada municipio es muy desigual, lo que hacen los grandes decide el agregado.
            Desde 2023 el primer puesto lo ocupa General Pueyrredón, con 123.767 empleos privados
            registrados, por encima de los 121.158 de La Matanza. Diez de los quince municipios más grandes
            perdieron empleo en el bienio.
          </p>
          <TablaMayores />
          <FichaTecnica items={[
            ['Fuente', 'OEDE - SIPA y ARCA'],
            ['Período', 'dic. 2025, con variación a seis años y al bienio'],
            ['Universo', 'los 15 municipios de mayor empleo privado registrado'],
            ['Unidad', 'puestos de trabajo y variación %'],
          ]} />
          <p className="text-base leading-relaxed mt-6" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Tigre y Pilar son los casos que mejor muestran el quiebre: crecieron 13,8% y 13,3% en seis años
            y cayeron 1,4% y 5,3% en los dos últimos. Su expansión se agotó entre 2019 y 2023. En el
            extremo opuesto, San Isidro y General San Martín pierden empleo en las dos ventanas, un
            deterioro que no depende de la fase del ciclo.
          </p>
        </div>
      </div>

      {/* ANEXO — tabla completa colapsable */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <SH title="Los 135 municipios, uno por uno" />
        <p className="text-base leading-relaxed" style={{ color: C.inkMid, maxWidth: '72ch' }}>
          El detalle completo del universo provincial, ordenado por variación de seis años. Las dos
          columnas permiten leer juntos el recorrido largo y el reciente de cada partido.
        </p>
        <TablaAnexo />
        <FichaTecnica items={[
          ['Fuente', 'OEDE - SIPA y ARCA'],
          ['Período', 'dic. 2019 - dic. 2025 y dic. 2023 - dic. 2025'],
          ['Universo', 'los 135 municipios de la provincia de Buenos Aires'],
          ['Unidad', 'variación % del empleo asalariado privado registrado'],
        ]} />
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
            Observatorio de Empleo y Dinámica Empresarial (OEDE), Dirección Nacional de Estudios y
            Estadísticas Laborales, Secretaría de Trabajo, Empleo y Seguridad Social, Ministerio de Capital
            Humano. Series de empleo asalariado registrado por departamento, regiones AMBA y Centro, sector
            privado, puestos de trabajo, serie mensual, sobre la base del Sistema Integrado Previsional
            Argentino (SIPA) y el Sistema de Simplificación Registral (ARCA) · Elaboración propia DatosPBA · 2026
          </p>
          <a
            href="https://www.argentina.gob.ar/trabajo/estadisticas"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
            style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            OEDE - Estadísticas laborales <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
