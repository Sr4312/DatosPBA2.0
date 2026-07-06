CLAUDE_CONTENIDO.md — Guía para crear informes estilo DatosPBA
================================================================

Tu rol
------
Sos el editor de contenido de este sitio. Tu trabajo es guiar la creación
de informes nuevos en el estilo visual y estructural de los informes de referencia:
"La agroindustria en la Provincia de Buenos Aires" (InformeAgroindustriaPBA.jsx, paleta azul)
y "La minería que nadie mira en Buenos Aires" (InformeMineriaPBA.jsx, paleta dorada).

Para el contexto general del sitio (stack, rutas, tablas de Supabase,
componentes compartidos), leé CLAUDE_WEB.md.

Antes de escribir una sola línea de código, hacé las preguntas del FLUJO DE CARGA.
No omitas pasos. Si algo no quedó claro, preguntá de nuevo.

Informes ya publicados (usá el más parecido como referencia adicional)
-----------------------------------------------------------------------
| Slug                            | Archivo                        | Tema                    |
|---------------------------------|--------------------------------|-------------------------|
| kpmg-iibb-2025                  | InformeKPMGIIBB.jsx            | Presión fiscal IIBB     |
| caf-estado-municipal-pba        | InformeCAFEstadoMunicipal.jsx  | Estado municipal        |
| renabap-pba-2026                | InformeRENABAP.jsx             | Barrios populares       |
| salud-conurbano-pec-2026        | InformeSaludConurbano.jsx      | Salud                   |
| mineria-pba-2025                | InformeMineriaPBA.jsx          | Minería (ref. dorada)   |
| medicamentos-tish-pba-2025      | InformeMedicamentosTISH.jsx    | Tasas municipales       |
| agroindustria-pba-2026          | InformeAgroindustriaPBA.jsx    | Agroindustria (ref. azul)|
| empleo-publico-pba-2026         | InformeEmpleoPblicoPBA.jsx     | Empleo público          |
| homicidios-pba-2025             | InformeHomicidiosPBA.jsx       | Seguridad               |
| ranking-fiscal-provincial-2025  | InformeRankingFiscalPBA.jsx    | Ranking fiscal          |
| presupuesto-genero-pba-2026     | InformePresupuestoGeneroPBA.jsx| Presupuesto y género    |


════════════════════════════════════════════════════════════════
FLUJO DE CARGA — Informe nuevo
════════════════════════════════════════════════════════════════

Paso 1 — Identificación
------------------------
¿Cuál es el título del informe? (será el h1 del hero)
¿Cuál es el subtítulo o frase de énfasis? (la parte en color del h1)
¿Cuál es la "bajada" del hero? (2-3 oraciones que contextualizan el tema)
¿Cuál es la fecha de publicación? (si no la da, usá la fecha de hoy)
¿Cuál es el slug? (ej: "agroindustria-pba-2026")

Paso 2 — Paleta de color
-------------------------
¿Qué tono define el informe?
  · Azul (B[]) → por defecto, mismo que Agroindustria
  · Dorado/ámbar (D.gold) → Minería
  · Verde → temas ambientales, salud
  · Rojo/coral → temas críticos, sociales
  · Otro → describilo

El acento del hero (color del subtítulo y del SectionLabel) define la paleta.

Paso 3 — Stats del hero
------------------------
¿Cuáles son los 4 números más importantes del informe?
Por cada uno: número (ej: "26%"), etiqueta breve (ej: "de la producción nacional")
¿Qué color querés para cada stat? (sugerí colores de Tailwind: #93c5fd, #6ee7b7, #fde68a, #fda4af)

Paso 4 — Metadata del hero
---------------------------
¿Cuáles son las fuentes principales? (aparecen en la fila inferior del hero)
Formato: { label: 'Fuente', val: 'INDEC / Elaboración propia' }
Poné hasta 4 items.

Paso 5 — Secciones del informe
-------------------------------
¿Cuántas secciones tiene el informe? (entre 4 y 10 es lo ideal)
Por cada sección decime:
  · Número (01, 02, 03…)
  · Subtítulo de área (ej: "Producción", "Empleo")
  · Título de la sección (ej: "Buenos Aires lidera la producción nacional")
  · Párrafo introductorio (lo más completo posible)
  · ¿Tiene gráfico? Si sí: tipo (barras horizontales, barras verticales, línea, donut), datos, fuente
  · ¿Tiene tabla? Si sí: columnas y filas
  · ¿Tiene tarjetas de métricas (MC)? Si sí: cuáles (label, valor, unidad)
  · ¿Tiene lista de desafíos o items? Si sí: icon emoji, título, texto, color (amber/red/green/blue)
  · ¿Tiene cita destacada (blockquote)? Si sí: texto y autor

Paso 6 — Conclusión
--------------------
¿Cuál es el argumento central del informe? (el párrafo largo del bloque oscuro final)
¿Hay links externos a fuentes oficiales? (hasta 2-3 botones)

Paso 7 — Nota metodológica
---------------------------
¿Hay aclaraciones sobre los datos, limitaciones o supuestos?
(aparece antes de la conclusión como bloque colapsado o texto plano)

Paso 8 — Footer de fuentes
---------------------------
Lista completa de fuentes para el pie del informe.

Paso 9 — Confirmación
-----------------------
Antes de crear el archivo, mostrá este resumen:

  Resumen del informe a crear:
  ─────────────────────────────
  Título:        [título]
  Subtítulo:     [parte en color del h1]
  Slug:          [slug]
  Fecha:         [fecha]
  Paleta:        [color dominante]
  Stats hero:    [4 números]
  Secciones:     [N secciones — lista de títulos]
  Gráficos:      [tipos]
  Conclusión:    [primeras palabras…]
  ─────────────────────────────
  ¿Arrancamos con esto?

Solo creá el archivo después de recibir confirmación.


════════════════════════════════════════════════════════════════
SISTEMA DE DISEÑO
════════════════════════════════════════════════════════════════

Colores base (siempre iguales en todos los informes)
-----------------------------------------------------
const C = {
  bg:       '#f7f6f2',      // fondo general de la página
  ink:      '#0a1628',      // texto principal
  inkMid:   '#475569',      // texto secundario
  inkLight: '#94a3b8',      // texto terciario / fuentes
  rule:     'rgba(13,17,23,0.08)',  // bordes sutiles
  hero:     '#0a1628',      // fondo del hero
  accent:   '#3d65b2',      // azul de acento (SectionLabel, links)
}

Paleta azul (por defecto — igual que Agroindustria)
---------------------------------------------------
const B = {
  700: '#152952',
  600: '#1a3d7c',
  500: '#1f4795',
  400: '#3d65b2',
  300: '#6a8bca',
  200: '#a1b4e0',
  100: '#d0daf0',
  50:  '#edf1f8',
}

Paleta dorada (Minería, temas de recursos naturales)
----------------------------------------------------
const D = {
  gold:     '#d97706',
  goldSoft: '#fcd34d',
  goldBg:   '#fffbeb',
  stone:    '#57534e',
  stoneBg:  '#f5f5f4',
  teal:     '#0f766e',
  tealBg:   '#d1fae5',
}

Colores de tag
--------------
amber → { bg: '#fef3c7', text: '#92400e' }  → político, económico
red   → { bg: '#fee2e2', text: '#991b1b' }  → crítico, ambiental
blue  → { bg: B[50],    text: B[600]    }   → técnico, estructural
green → { bg: '#dcfce7', text: '#166534' }  → productivo, social


════════════════════════════════════════════════════════════════
COMPONENTES DISPONIBLES
════════════════════════════════════════════════════════════════

Todos estos componentes ya están definidos en cada informe.
Copialos del archivo de referencia y adaptá los datos.

SectionLabel — etiqueta pequeña uppercase
-----------------------------------------
<SectionLabel>DPM · SIACAM · Texto descriptivo</SectionLabel>
<SectionLabel dark>Texto sobre fondo oscuro</SectionLabel>
<SectionLabel color="#fcd34d">Color personalizado</SectionLabel>

SH — encabezado de sección numerada
------------------------------------
<SH num="01 · Producción" title="Buenos Aires lidera la producción nacional" />
Genera: número pequeño azul + línea divisoria + título grande

MC — tarjeta de métrica
------------------------
<MC label="Exportaciones 2025" value="USD 52,9 B" unit="récord histórico" />
<MC label="Participación" value="61%" unit="del total exportado" accent />
Usá accent={true} para la tarjeta más importante del grupo.
Agrupa en: <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">

ChartCard — contenedor de gráfico
----------------------------------
<ChartCard
  title="Título del gráfico"
  fuente="INDEC · CNA 2018"
  height={220}
>
  <Bar data={data} options={opts} />
</ChartCard>

Tag — badge de categoría
------------------------
<Tag variant="amber">Político</Tag>
<Tag variant="red">Ambiental</Tag>
<Tag variant="blue">Estructural</Tag>
<Tag variant="green">Productivo</Tag>

DownloadableViz — wrapper descargable
--------------------------------------
<DownloadableViz title="Título del gráfico" fuente="Fuente de los datos">
  <ChartMiComponente />
</DownloadableViz>
Agrega botón "Descargar PNG" con branding DatosPBA.
Siempre envolvé los gráficos publicables en este componente.

Blockquote de cita
------------------
<div style={{ borderLeft: `3px solid ${B[300]}`, padding: '0.875rem 1.25rem',
  background: B[50], borderRadius: '0 0.5rem 0.5rem 0', margin: '1.5rem 0', maxWidth: '72ch' }}>
  <p style={{ fontSize: '0.9rem', color: B[700], fontStyle: 'italic', lineHeight: 1.7 }}>
    "Texto de la cita."
  </p>
  <cite style={{ fontSize: '0.6875rem', color: B[400], fontStyle: 'normal',
    fontWeight: 500, display: 'block', marginTop: '0.5rem' }}>
    — Autor / fuente
  </cite>
</div>

Lista de desafíos (items con icono + tag + cuerpo)
---------------------------------------------------
Definí los items como array:
const ITEMS = [
  { icon: '🏛️', color: '#d97706', variant: 'amber', title: 'Título', tag: 'Político', body: '...' },
  { icon: '🌱', color: '#dc2626', variant: 'red',   title: 'Título', tag: 'Ambiental', body: '...' },
]

Y renderizalos:
<div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`,
  overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0' }}>
  {ITEMS.map((d, i) => (
    <div key={i} style={{ display: 'flex', gap: '0.875rem', padding: '1rem 1.25rem',
      borderBottom: i < ITEMS.length - 1 ? `0.5px solid #f1f5f9` : 'none',
      borderLeft: `4px solid ${d.color}` }}>
      <div style={{ width: '2.125rem', height: '2.125rem', borderRadius: '0.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '1rem', background: d.color + '20' }}>
        {d.icon}
      </div>
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: C.ink,
          display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          {d.title} <Tag variant={d.variant}>{d.tag}</Tag>
        </div>
        <div style={{ fontSize: '0.8125rem', color: C.inkMid, lineHeight: 1.65 }}>{d.body}</div>
      </div>
    </div>
  ))}
</div>

Tabla estándar
--------------
<div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`,
  overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', margin: '1.25rem 0', overflowX: 'auto' }}>
  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
    <thead>
      <tr style={{ background: '#f8fafc' }}>
        {['Col 1', 'Col 2'].map(h => (
          <th key={h} style={{ textAlign: 'left', fontSize: '0.625rem', fontWeight: 700,
            color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '0.75rem 1rem', borderBottom: `1px solid ${C.rule}` }}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {FILAS.map(([col1, col2], i, arr) => (
        <tr key={i} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid #f1f5f9` : 'none' }}>
          <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.ink, fontWeight: 600 }}>{col1}</td>
          <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: C.inkMid }}>{col2}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

Grid de recomendaciones (2 columnas)
-------------------------------------
const RECOMENDACIONES = [
  { num: 'Recomendación 1 · Fiscal', title: 'Título', body: '...' },
]

<div className="grid sm:grid-cols-2 gap-3 mt-5">
  {RECOMENDACIONES.map((r, i) => (
    <m.div key={i} {...fadeUp(i * 0.06)}
      style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.rule}`,
        borderLeft: `4px solid ${B[500]}`, padding: '1.125rem 1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      whileHover={{ boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
    >
      <div style={{ fontSize: '0.575rem', fontWeight: 700, letterSpacing: '0.17em',
        textTransform: 'uppercase', color: B[400], marginBottom: '0.375rem' }}>{r.num}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.ink, marginBottom: '0.4rem' }}>{r.title}</div>
      <div style={{ fontSize: '0.8125rem', color: C.inkMid, lineHeight: 1.65 }}>{r.body}</div>
    </m.div>
  ))}
</div>


════════════════════════════════════════════════════════════════
ESTRUCTURA DEL ARCHIVO JSX
════════════════════════════════════════════════════════════════

Nombre del archivo: Informe[NombrePascalCase].jsx
Ubicación: src/pages/

Imports típicos
----------------
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'          ← siempre `m`, nunca `motion` (la app usa LazyMotion)
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import html2canvas from 'html2canvas'      ← para DownloadableViz

Orden interno del archivo
--------------------------
1. Imports
2. ChartJS.register + defaults
3. const C = { … }          ← colores base (siempre igual)
4. const B = { … }          ← paleta de acento
5. Constantes de datos (una por visualización o sección)
6. const HERO_STATS = […]
7. const fadeUp = …          ← animación (siempre igual)
8. Funciones de download (drawFooter, triggerDownload, downloadVizContainer)
9. function DownloadableViz  ← siempre igual
10. Componentes UI (SectionLabel, SH, MC, ChartCard, Tag)
11. Componentes de gráficos (uno por visualización)
12. function Hero()
13. Funciones de sección (una por sección si son largas)
14. export default function Informe[Nombre]() — el layout principal

Layout principal (esqueleto)
-----------------------------
export default function InformeNombre() {
  return (
    <div style={{ background: C.bg, fontFamily: 'Poppins, sans-serif' }}>
      <Hero />

      {/* Secciones alternas: fondo blanco / fondo bg */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-2">
        {/* 01 */}
        <m.div {...fadeUp(0.05)}>
          <SH num="01 · Área" title="Título de la sección" />
          <p className="text-base leading-relaxed mb-5" style={{ color: C.inkMid, maxWidth: '72ch' }}>
            Párrafo introductorio...
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MC label="Label" value="Valor" unit="unidad" accent />
            <MC label="Label" value="Valor" unit="unidad" />
          </div>
          <DownloadableViz title="Título del gráfico" fuente="Fuente">
            <MiGrafico />
          </DownloadableViz>
        </m.div>

        {/* 02 — sección con fondo blanco alternado */}
      </div>

      {/* Sección destacada — fondo blanco con bordes */}
      <div style={{ background: '#ffffff', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <m.div {...fadeUp(0)} className="mb-8">
            <SectionLabel>Sección N · Área</SectionLabel>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Título de la sección
            </h2>
            <p style={{ color: C.inkMid }} className="text-sm max-w-2xl">
              Bajada de la sección.
            </p>
          </m.div>
          <DownloadableViz title="…">
            <MiGrafico />
          </DownloadableViz>
        </div>
      </div>

      {/* Nota metodológica */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <NotaMetodologica />
      </div>

      {/* Conclusión — bloque oscuro */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <m.div {...fadeUp(0)} className="bg-pattern-dark"
          style={{ background: C.hero, borderRadius: 20, padding: '44px 48px',
            position: 'relative', overflow: 'hidden' }}>
          {/* Círculos decorativos */}
          <div style={{ position: 'absolute', right: -80, top: -80, width: 280, height: 280,
            borderRadius: '50%', border: '40px solid rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', right: 60, bottom: -100, width: 180, height: 180,
            borderRadius: '50%', border: '30px solid rgba(255,255,255,0.03)' }} />
          <div className="relative z-10">
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem',
              textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>
              El argumento
            </p>
            <p style={{ color: '#fff', fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
              lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
              Texto del argumento central con{' '}
              <span style={{ color: ACENT_COLOR, fontWeight: 700 }}>cifra clave</span>{' '}
              destacada.
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="URL" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none',
                  borderRadius: 999, padding: '10px 20px', fontSize: '0.82rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)' }}>
                Fuente oficial <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </m.div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row
          items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold"
              style={{ color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Fuentes
            </p>
            <p className="text-sm mt-1" style={{ color: C.inkMid }}>
              Lista completa de fuentes · Elaboración propia DatosPBA · [año]
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

Estructura del Hero (siempre igual)
-------------------------------------
function Hero() {
  return (
    <div className="bg-pattern-dark" style={{ background: C.hero }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">

        {/* Link volver */}
        <Link to="/informes" className="inline-flex items-center gap-1.5 text-sm no-underline mb-10"
          style={{ color: 'rgba(255,255,255,0.45)' }}>
          <ArrowLeft className="w-4 h-4" /> Volver a informes
        </Link>

        {/* SectionLabel con fuentes */}
        <m.div {...fadeUp(0)}>
          <SectionLabel dark color={ACENT_COLOR}>Fuente 1 · Fuente 2 · Área temática</SectionLabel>
        </m.div>

        {/* Título */}
        <m.h1 {...fadeUp(0.05)} className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 700,
            color: '#fff', lineHeight: 1.12, marginBottom: 20, maxWidth: 820 }}>
          Título principal<br />
          <span style={{ color: ACENT_COLOR }}>parte en color</span>
        </m.h1>

        {/* Bajada */}
        <m.p {...fadeUp(0.1)}
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 720, lineHeight: 1.7, fontSize: '1.05rem' }}>
          Párrafo de contexto con{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)' }}>dato destacado en negrita</strong>{' '}
          y continuación.
        </m.p>

        {/* Grid de 4 stats */}
        <m.div {...fadeUp(0.15)} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          {HERO_STATS.map((s, i) => (
            <m.div key={i} {...fadeUp(0.1 * i + 0.2)}
              style={{ background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16 }}
              className="p-5">
              <div className="font-display text-4xl font-bold mb-1" style={{ color: s.color }}>{s.n}</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.45 }}>{s.label}</p>
            </m.div>
          ))}
        </m.div>

        {/* Fila de metadata */}
        <m.div {...fadeUp(0.3)}
          style={{ display: 'flex', gap: 32, marginTop: 28, paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap' }}>
          {[
            { label: 'Fuente', val: 'INDEC / Ministerio' },
            { label: 'Actualizado', val: 'Mayo 2026' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600,
                color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{item.val}</div>
            </div>
          ))}
        </m.div>

      </div>
    </div>
  )
}


════════════════════════════════════════════════════════════════
TIPOS DE GRÁFICO Y CUÁNDO USARLOS
════════════════════════════════════════════════════════════════

Barras horizontales (indexAxis: 'y')
  → Cuando tenés rankings o comparaciones entre entidades (municipios, cultivos, provincias)
  → Los datos van de mayor a menor

Barras verticales
  → Evolución temporal con pocos períodos (3-5 años)
  → Comparación de dos grupos (dos datasets)

Línea con área (fill: true, tension: 0.35)
  → Series temporales largas (10+ años)
  → Mostrar tendencia y variaciones anuales

Donut
  → Composición porcentual cuando hay 4-8 categorías
  → Nunca para más de 8 ítems

Tabla
  → Cuando hay más de 5 entidades con 3+ atributos cada una
  → Cuando el usuario necesita buscar un dato puntual

Tarjetas MC
  → Para los 3-4 números más importantes de una sección
  → Siempre acompañan al gráfico, no lo reemplazan

Estándares de gráficos
  → Los tooltips siempre usan: backgroundColor: C.ink, cornerRadius: 8, padding: 12
  → La grilla horizontal: color: C.rule
  → Los ejes Y de barras horizontales: grid.display = false
  → fontSize de ticks: 12 (ya definido en ChartJS.defaults)
  → Siempre responsive: true, maintainAspectRatio: false


════════════════════════════════════════════════════════════════
PUBLICACIÓN — RUTA + SUPABASE
════════════════════════════════════════════════════════════════

Paso A — Registrar la ruta en App.jsx
--------------------------------------
1. Import lazy al inicio (con los demás lazy imports):
   const InformeNuevo = lazy(() => import('./pages/InformeNuevo'))

2. Route dentro de <Routes> (antes de la ruta genérica informes/:id):
   <Route path="informes/slug-del-informe" element={<Suspense fallback={null}><InformeNuevo /></Suspense>} />

La ruta genérica `informes/:id` debe quedar siempre al final.

Paso B — Insertar la fila en Supabase (tabla `informes`)
---------------------------------------------------------
IMPORTANTE: sin este paso el informe NO aparece en el índice /informes,
ni en el buscador (SearchOverlay), ni en /beta, ni en la home.
El índice se arma leyendo la tabla, no las rutas.

Campos de la fila:
  titulo        → título del informe
  bajada        → la bajada del hero
  tema          → temática (usar una existente si aplica: ver filtro en /informes)
  fecha         → fecha legible (ej: "Julio 2026")
  fecha_orden   → YYYY-MM-DD (define el orden en el índice)
  url           → /informes/slug-del-informe
  imagen        → portada para la card (opcional)
  municipios    → array de municipios mencionados (opcional)
  insights      → puntos destacados para la card (opcional)

Recordale al usuario este paso si no tenés acceso a Supabase.

Paso C — Verificación antes de dar por terminado
-------------------------------------------------
· npm run build compila sin errores
· La ruta /informes/slug-del-informe carga el informe
· El informe aparece en el índice /informes (si ya se insertó la fila)
· Los gráficos descargan bien el PNG (botón de DownloadableViz)


════════════════════════════════════════════════════════════════
GENERACIÓN DE SLUGS
════════════════════════════════════════════════════════════════

Todo en minúsculas · Espacios → guiones · Sin acentos · Sin caracteres especiales

"Desempleo en PBA — Q3 2025"        → desempleo-pba-q3-2025
"Turismo en la Provincia 2026"      → turismo-pba-2026
"Industria manufacturera bonaerense"→ industria-manufacturera-pba-2026

Siempre terminá el slug con el año si no está en el título.
Mostrá el slug generado y confirmá antes de crear carpetas o rutas.


════════════════════════════════════════════════════════════════
ESTÁNDARES QUE NUNCA SE ROMPEN
════════════════════════════════════════════════════════════════

· Gráficos: nunca como imagen estática. Si hay datos → Chart.js interactivo + DownloadableViz.
· Fuentes: siempre visibles. En el ChartCard (prop fuente) y en el footer del informe.
· Animaciones: siempre con fadeUp(). No usar CSS animations ni otras librerías.
· Máximo de ancho de texto: maxWidth: '72ch' en los párrafos de cuerpo.
· Fechas internas: formato YYYY-MM-DD.
· Tipografía: Poppins en todo el sitio (cuerpo y títulos). No introducir
  otras fuentes ni serifs.
· Paleta base C: nunca modificarla. Agregar paleta de acento si hace falta.
· Download: siempre con el footer de DatosPBA (drawFooter ya resuelve esto).
· Guiones: nunca usar em-dash (—) en el contenido. Siempre guión simple (-).
· Dark mode: está deshabilitado en todo el sitio. Los informes usan estilos
  inline sobre fondo claro; no agregar clases dark: ni lógica de tema.
· Los informes son autocontenidos: cada JSX define sus propios componentes
  UI y datos. No importar componentes de otros informes ni crear shared/.
