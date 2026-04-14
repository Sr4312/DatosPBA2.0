import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

/* ── Data (Ministerio de Economía – Subsecretaría Coord. Fiscal Prov., mar. 2025) ── */
const TASA_VIAL = {
  'marcos paz':                  { tipo: 'pct', valor: 0.80 },
  'escobar':                     { tipo: 'pct', valor: 0.90 },
  'tigre':                       { tipo: 'pct', valor: 0.90 },
  'las heras':                   { tipo: 'pct', valor: 1.00 },
  'hurlingham':                  { tipo: 'pct', valor: 1.44 },
  'la matanza':                  { tipo: 'pct', valor: 1.50 },
  'almirante brown':             { tipo: 'pct', valor: 2.00 },
  'avellaneda':                  { tipo: 'pct', valor: 2.00 },
  'berazategui':                 { tipo: 'pct', valor: 2.00 },
  'ezeiza':                      { tipo: 'pct', valor: 2.00 },
  'florencio varela':            { tipo: 'pct', valor: 2.00 },
  'ituzaingo':                   { tipo: 'pct', valor: 2.00 },
  'lanus':                       { tipo: 'pct', valor: 2.00 },
  'lomas de zamora':             { tipo: 'pct', valor: 2.00 },
  'lujan':                       { tipo: 'pct', valor: 2.00 },
  'pehuajo':                     { tipo: 'pct', valor: 2.00 },
  'presidente peron':            { tipo: 'pct', valor: 2.00 },
  'presidente juan domingo peron': { tipo: 'pct', valor: 2.00 },
  'quilmes':                     { tipo: 'pct', valor: 2.00 },
  'azul':                        { tipo: 'pct', valor: 2.50 },
  'moreno':                      { tipo: 'pct', valor: 2.50 },
  'pilar':                       { tipo: 'pct', valor: 2.50 },
  'general pueyrredon':          { tipo: 'pct', valor: 3.00 },
  'general pueyrredón':          { tipo: 'pct', valor: 3.00 },
  'pinamar':                     { tipo: 'pct', valor: 3.00, nota: 'Eliminada tras temporada estival 2025-2026' },
  'malvinas argentinas':         { tipo: 'pesos', label: '$2,75–$3,50/l' },
  'campana':                     { tipo: 'pesos', label: '$4–$8/l' },
  'san fernando':                { tipo: 'pesos', label: '$7,92/l' },
  'junin':                       { tipo: 'pesos', label: '$8,30–$11/l' },
  'general rodriguez':           { tipo: 'pesos', label: '$10/l' },
  'jose c. paz':                 { tipo: 'pesos', label: '$30/l' },
  'jose clemente paz':           { tipo: 'pesos', label: '$30/l' },
}

function normName(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function getTasa(name) {
  const n = normName(name)
  return TASA_VIAL[n] ?? null
}

/* Color scale: yellow (#fef3c7) → orange → dark red (#7f1d1d) */
function pctFill(valor) {
  const t = (valor - 0.8) / (3.0 - 0.8)
  const h = Math.round(45 * (1 - t))
  const s = Math.round(97 - 24 * t)
  const l = Math.round(55 - 14 * t)
  return `hsl(${h},${s}%,${l}%)`
}

function getStyle(tasa, state) {
  const w = state !== 'default' ? 1.5 : 0.6
  if (!tasa) {
    return { fillColor: '#cbd5e1', fillOpacity: 0.3, color: '#94a3b8', weight: 0.4, opacity: 0.6 }
  }
  if (tasa.tipo === 'pesos') {
    const fo = state === 'selected' ? 0.80 : state === 'hover' ? 0.65 : 0.45
    return { fillColor: '#0d9488', fillOpacity: fo, color: '#0f766e', weight: w, opacity: 0.9 }
  }
  const base = 0.30 + ((tasa.valor - 0.8) / 2.2) * 0.50
  const fo = state === 'selected' ? 0.90 : state === 'hover' ? Math.min(base + 0.20, 0.90) : base
  return { fillColor: pctFill(tasa.valor), fillOpacity: fo, color: '#7f1d1d', weight: w, opacity: 0.8 }
}

function formatTasa(tasa) {
  if (!tasa) return 'Sin datos'
  if (tasa.tipo === 'pesos') return tasa.label
  return `${tasa.valor.toFixed(2).replace('.', ',')}%`
}

export default function TasaVialMap() {
  const mapRef     = useRef(null)
  const mapInstRef = useRef(null)
  const selRef     = useRef(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let mounted = true
    let map = null

    async function init() {
      const L = (await import('leaflet')).default
      if (!mounted || !mapRef.current) return

      const bounds = L.latLngBounds(L.latLng(-43.5, -65.5), L.latLng(-32.5, -55.5))
      map = L.map(mapRef.current, {
        center: [-37.5, -61], zoom: 6, minZoom: 5, maxZoom: 9,
        maxBounds: bounds, maxBoundsViscosity: 1.0,
        zoomControl: true, attributionControl: false,
      })
      mapInstRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { maxZoom: 15, opacity: 0.55 }).addTo(map)

      const IGN_URL =
        'https://wfs.ign.gob.ar/geoserver/ign/ows?service=WFS&version=2.0.0&request=GetFeature' +
        '&typeName=ign:departamento&CQL_FILTER=provincia_id%3D%2706%27' +
        '&outputFormat=application/json&srsName=EPSG:4326'
      const FALLBACK_URL = 'https://raw.githubusercontent.com/agburgos83/partidosBA/main/partidos.geojson'

      let geojson
      try {
        const res = await fetch(IGN_URL)
        if (!res.ok) throw new Error()
        geojson = await res.json()
      } catch {
        const res = await fetch(FALLBACK_URL)
        geojson = await res.json()
      }
      if (!mounted) return

      L.geoJSON(geojson, {
        style: feature => {
          const name = feature.properties.nombre || feature.properties.nam || ''
          return getStyle(getTasa(name), 'default')
        },
        onEachFeature(feature, layer) {
          const name = feature.properties.nombre || feature.properties.nam || ''
          const tasa = getTasa(name)
          const label = tasa ? `${name}: ${formatTasa(tasa)}` : name
          layer.bindTooltip(label, { sticky: true, direction: 'auto', className: 'muni-tooltip' })
          layer._tasa = tasa
          layer._name = name

          layer.on('mouseover', e => {
            if (e.target === selRef.current) return
            e.target.setStyle(getStyle(e.target._tasa, 'hover'))
          })
          layer.on('mouseout', e => {
            if (e.target === selRef.current) return
            e.target.setStyle(getStyle(e.target._tasa, 'default'))
          })
          layer.on('click', () => {
            if (selRef.current && selRef.current !== layer) {
              selRef.current.setStyle(getStyle(selRef.current._tasa, 'default'))
            }
            layer.setStyle(getStyle(layer._tasa, 'selected'))
            selRef.current = layer
            setSelected({ nombre: name, tasa })
          })
        },
      }).addTo(map)

      if (mounted) setLoading(false)
    }

    init().catch(() => { if (mounted) setLoading(false) })
    return () => { mounted = false; if (map) map.remove() }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Map */}
        <div className="relative flex-1 min-w-0 rounded-2xl overflow-hidden border border-slate-200/60 bg-white" style={{ height: 460 }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <span className="text-xs text-slate-400">Cargando mapa…</span>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Panel */}
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-slate-200/60 flex flex-col" style={{ minHeight: 300 }}>
          {selected ? (
            <div className="p-5 flex flex-col gap-4 flex-1">
              <div>
                <p className="text-lg font-bold text-[#0a1628] leading-tight">{selected.nombre}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Tasa de Mantenimiento Vial</p>
              </div>
              {selected.tasa ? (
                <>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className={`text-3xl font-bold leading-none ${selected.tasa.tipo === 'pesos' ? 'text-teal-700' : 'text-red-700'}`}>
                      {formatTasa(selected.tasa)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">
                      {selected.tasa.tipo === 'pct' ? 'por litro expendido' : 'fijo por litro (pesos)'}
                    </p>
                  </div>
                  {selected.tasa.nota && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-snug">
                      {selected.tasa.nota}
                    </p>
                  )}
                  {selected.tasa.tipo === 'pesos' && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Este municipio cobra la tasa en pesos fijos por litro, no como porcentaje. La carga real varía con el precio del combustible.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400">Sin datos para este municipio en el relevamiento 2025.</p>
              )}
              <div className="mt-auto pt-3 border-t border-slate-100">
                <Link to="/informes/tasa-vial-municipios-pba-2025" className="text-xs font-medium text-brand-600 hover:text-brand-700 no-underline">
                  Ver informe completo →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-6">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">Seleccioná un municipio</p>
              <p className="text-xs text-slate-400 leading-relaxed">Hacé clic sobre el mapa para ver la tasa vial del partido.</p>
              {/* Legend */}
              <div className="w-full mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(to right, hsl(45,97%,55%), hsl(22,88%,51%), hsl(0,73%,41%))' }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0,8%</span><span>1,5%</span><span>2,5%</span><span>3,0%</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-3 rounded-sm shrink-0" style={{ background: '#0d9488', opacity: 0.7 }} />
                  <span className="text-[10px] text-slate-400">Tasa en pesos fijos/litro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 rounded-sm shrink-0" style={{ background: '#cbd5e1', opacity: 0.7 }} />
                  <span className="text-[10px] text-slate-400">Sin datos (relevamiento 2025)</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <p className="text-[10px] text-slate-400 mt-3 leading-snug">
        Fuente: Ministerio de Economía de la Nación — Subsecretaría de Coordinación Fiscal Provincial. Datos relevados al 31/03/2025.
        Solo se muestran los municipios incluidos en el relevamiento oficial (29 de 135).
      </p>
    </div>
  )
}
