import { useState, useEffect, useRef, useMemo } from 'react'
import { MUNICIPIOS_DATA } from '@/lib/municipiosData'
import 'leaflet/dist/leaflet.css'

const INDICATORS = [
  { key: 'urbano',                   label: 'Urbanización',           good: 'high' },
  { key: 'electricidad',             label: 'Electricidad',           good: 'high' },
  { key: 'agua_mejorada',            label: 'Agua mejorada',          good: 'high' },
  { key: 'saneamiento_mejorado',     label: 'Saneamiento',            good: 'high' },
  { key: 'fin_secundaria_adultos',   label: 'Secundaria (adultos)',   good: 'high' },
  { key: 'fin_secundaria_inmediata', label: 'Secundaria (inmediata)', good: 'high' },
  { key: 'participacion_mujeres',    label: 'Participación mujeres',  good: 'high' },
  { key: 'tics_celular',             label: 'Acceso celular',         good: 'high' },
  { key: 'tics_internet',            label: 'Acceso internet',        good: 'high' },
  { key: 'analfabetismo',            label: 'Analfabetismo',          good: 'low'  },
  { key: 'desempleo_adulto',         label: 'Desempleo adulto',       good: 'low'  },
  { key: 'desempleo_joven',          label: 'Desempleo joven',        good: 'low'  },
]

// in1 "06441" → MUNICIPIOS_DATA codigo "ARG064410441"
function in1ToCode(in1) {
  const tail = in1.slice(2)                                 // "06441" → "441"
  const id4  = parseInt(tail).toString().padStart(4, '0')  // "441" → "0441"
  return `ARG06${tail}${id4}`                              // "ARG064410441"
}

function IndicatorBar({ label, value, good }) {
  if (value == null) return null
  const pct    = value * 100
  const barPct = Math.min(pct, 100)
  const color  =
    good === 'high'
      ? pct > 70 ? '#1a3d7c' : pct > 40 ? '#3d65b2' : '#94a3b8'
      : pct < 10 ? '#1a3d7c' : pct < 25 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-semibold text-slate-900">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${barPct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

const STYLE_DEFAULT  = { fillColor: '#1f4795', fillOpacity: 0.15, color: '#1a3d7c', weight: 0.8,  opacity: 0.7 }
const STYLE_HOVER    = { fillColor: '#1f4795', fillOpacity: 0.35, color: '#1a3d7c', weight: 1.2,  opacity: 1   }
const STYLE_SELECTED = { fillColor: '#0a1628', fillOpacity: 0.65, color: '#93c5fd', weight: 2,    opacity: 1   }

export default function MedidorMunicipal() {
  const mapRef        = useRef(null)
  const mapInstRef    = useRef(null)
  const selectedRef   = useRef(null)
  const [selected,   setSelected]  = useState(null)
  const [loading,    setLoading]   = useState(true)
  const [error,      setError]     = useState(false)

  const dataByCode = useMemo(() => {
    const m = {}
    MUNICIPIOS_DATA.forEach(d => { m[d.codigo] = d })
    return m
  }, [])

  useEffect(() => {
    let mounted = true
    let map     = null

    async function init() {
      try {
        const L = (await import('leaflet')).default
        if (!mounted || !mapRef.current) return

        const bounds = L.latLngBounds(
          L.latLng(-43.5, -65.5),
          L.latLng(-32.5, -55.5)
        )

        map = L.map(mapRef.current, {
          center: [-37.5, -61],
          zoom: 6,
          minZoom: 6,
          maxZoom: 9,
          maxBounds: bounds,
          maxBoundsViscosity: 1.0,
          zoomControl: true,
          attributionControl: false,
        })
        mapInstRef.current = map

        // Minimal tile layer — clean backdrop for shapes
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
          { maxZoom: 15, opacity: 0.65 }
        ).addTo(map)

        const res = await fetch(
          'https://raw.githubusercontent.com/agburgos83/partidosBA/main/partidos.geojson'
        )
        const geojson = await res.json()
        if (!mounted) return

        L.geoJSON(geojson, {
          style: () => ({ ...STYLE_DEFAULT }),

          onEachFeature(feature, layer) {
            const in1    = feature.properties.cde
            const codigo = in1ToCode(in1)
            const data   = dataByCode[codigo]
            const name   = feature.properties.nam

            layer.bindTooltip(name, {
              sticky:    true,
              direction: 'auto',
              className: 'muni-tooltip',
            })

            layer.on('mouseover', e => {
              if (e.target !== selectedRef.current) e.target.setStyle(STYLE_HOVER)
            })

            layer.on('mouseout', e => {
              if (e.target !== selectedRef.current) e.target.setStyle(STYLE_DEFAULT)
            })

            layer.on('click', () => {
              if (selectedRef.current && selectedRef.current !== layer) {
                selectedRef.current.setStyle(STYLE_DEFAULT)
              }
              layer.setStyle(STYLE_SELECTED)
              selectedRef.current = layer
              setSelected(data ? { ...data, nombre: name } : { nombre: name, _noData: true })
            })
          },
        }).addTo(map)

        setLoading(false)
      } catch {
        if (mounted) setError(true)
      }
    }

    init()
    return () => {
      mounted = false
      if (map) map.remove()
    }
  }, [dataByCode])

  return (
    <section className="mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="mb-8 flex items-center border-b-2 border-[#0a1628] pb-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] leading-none tracking-tight">
            Medidor Municipal
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 min-h-[400px] lg:min-h-[520px]">

          {/* ── Map ────────────────────────────────────────────── */}
          <div
            className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 min-h-[320px] sm:min-h-[500px]"
          >
            {loading && !error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                <span className="text-sm text-slate-400">Cargando mapa...</span>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <span className="text-sm text-slate-400">No se pudo cargar el mapa.</span>
              </div>
            )}
            <div ref={mapRef} className="w-full h-full min-h-[320px] sm:min-h-[500px]" />
          </div>

          {/* ── Panel ──────────────────────────────────────────── */}
          <div className="lg:w-80 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">

            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-6">
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#3d65b2" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600">Seleccioná un municipio</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hacé clic sobre cualquier partido del mapa para ver sus indicadores.
                </p>
              </div>

            ) : selected._noData ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-6">
                <p className="text-base font-bold text-[#0a1628]">{selected.nombre}</p>
                <p className="text-xs text-slate-400">Sin datos disponibles para este partido.</p>
              </div>

            ) : (
              <div className="flex flex-col h-full overflow-hidden">

                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
                  <h3 className="text-lg font-bold text-[#0a1628] leading-tight">{selected.nombre}</h3>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div>
                      <p className="text-xl font-bold text-brand-600 leading-none">
                        {selected.poblacion?.toLocaleString('es-AR') ?? 'N/D'}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Habitantes</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-brand-600 leading-none">
                        {selected.hogares?.toLocaleString('es-AR') ?? 'N/D'}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Hogares</p>
                    </div>
                    {selected.superficie_km2 != null && (
                      <div>
                        <p className="text-xl font-bold text-brand-600 leading-none">
                          {selected.superficie_km2.toLocaleString('es-AR')}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">km²</p>
                      </div>
                    )}
                    {selected.densidad_pobl != null && (
                      <div>
                        <p className="text-xl font-bold text-brand-600 leading-none">
                          {selected.densidad_pobl < 10
                            ? selected.densidad_pobl.toFixed(1)
                            : Math.round(selected.densidad_pobl).toLocaleString('es-AR')}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">hab/km²</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Indicators */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                  {INDICATORS.map(ind => (
                    <IndicatorBar
                      key={ind.key}
                      label={ind.label}
                      value={selected[ind.key]}
                      good={ind.good}
                    />
                  ))}
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .muni-tooltip {
          background: #0a1628;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-size: 12px;
          font-family: inherit;
          padding: 4px 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .muni-tooltip::before { display: none; }
        .leaflet-tooltip-top.muni-tooltip::before { display: none; }
      `}</style>
    </section>
  )
}
