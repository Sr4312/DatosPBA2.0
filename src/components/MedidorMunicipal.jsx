import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { MUNICIPIOS_DATA } from '@/lib/municipiosData'
import { ELLOS_GASTAN_2026 } from '@/lib/ellosGastan2026'
import { getColorVariacion, colorEscalaValoracion, flechaVariacion } from '@/lib/variacion'
import 'leaflet/dist/leaflet.css'
import partidosGeojsonUrl from '@/assets/partidos.geojson?url'

/* ── Ellos gastan 2026 (Fundación Libertad): gasto municipal y Concejo ─── */
function normName(str) {
  return str.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

const EG_BY_CODE = {}
ELLOS_GASTAN_2026.forEach(d => { EG_BY_CODE[d.codigo] = d })

/* Cortes por quintil: cada color agrupa un quinto de los partidos con dato.
   Se redondean a miles para que la leyenda y el mapa usen el mismo número. */
function quintiles(values) {
  const v = [...values].sort((a, b) => a - b)
  return [0.2, 0.4, 0.6, 0.8].map(q => Math.round(v[Math.floor(q * v.length)] / 1000) * 1000)
}

const CORTES_GASTO = quintiles(ELLOS_GASTAN_2026.filter(d => d.gasto_vecino_mes != null).map(d => d.gasto_vecino_mes))
const CORTES_HCD   = quintiles(ELLOS_GASTAN_2026.filter(d => d.hcd_hab != null).map(d => d.hcd_hab))

/* Rampa secuencial de --data-1: el gasto no tiene dirección deseable, así que
   no se pinta con la escala de valoración. */
const RAMPA_DATO = ['#FCE4EF', '#F5A9CB', '#EC6AA3', '#E11D74', '#9D1150']

function claseCorte(valor, cortes) {
  const i = cortes.findIndex(c => valor < c)
  return i === -1 ? cortes.length : i
}

function secuencialStyle(valor, cortes, state) {
  const w = state !== 'default' ? 1.5 : 0.6
  if (valor == null) {
    return { fillColor: '#cbd5e1', fillOpacity: 0.25, color: '#94a3b8', weight: 0.4, opacity: 0.6 }
  }
  const fo = state === 'hover' ? 0.95 : 0.85
  return { fillColor: RAMPA_DATO[claseCorte(valor, cortes)], fillOpacity: fo, color: '#1e293b', weight: w, opacity: 0.75 }
}

/* ── Tasa Vial data ─────────────────────────────────────────────────────── */
const TASA_VIAL_RAW = {
  'marcos paz':                    { tipo: 'pct', valor: 0.80 },
  'escobar':                       { tipo: 'pct', valor: 0.90 },
  'tigre':                         { tipo: 'pct', valor: 0.90 },
  'las heras':                     { tipo: 'pct', valor: 1.00 },
  'hurlingham':                    { tipo: 'pct', valor: 1.44 },
  'la matanza':                    { tipo: 'pct', valor: 1.50 },
  'almirante brown':               { tipo: 'pct', valor: 2.00 },
  'avellaneda':                    { tipo: 'pct', valor: 2.00 },
  'berazategui':                   { tipo: 'pct', valor: 2.00 },
  'ezeiza':                        { tipo: 'pct', valor: 2.00 },
  'florencio varela':              { tipo: 'pct', valor: 2.00 },
  'ituzaingo':                     { tipo: 'pct', valor: 2.00 },
  'lanus':                         { tipo: 'pct', valor: 2.00 },
  'lomas de zamora':               { tipo: 'pct', valor: 2.00 },
  'lujan':                         { tipo: 'pct', valor: 2.00 },
  'pehuajo':                       { tipo: 'pct', valor: 2.00 },
  'presidente peron':              { tipo: 'pct', valor: 2.00 },
  'presidente juan domingo peron': { tipo: 'pct', valor: 2.00 },
  'quilmes':                       { tipo: 'pct', valor: 2.00 },
  'azul':                          { tipo: 'pct', valor: 2.50 },
  'moreno':                        { tipo: 'pct', valor: 2.50 },
  'pilar':                         { tipo: 'pct', valor: 2.50 },
  'general pueyrredon':            { tipo: 'pct', valor: 3.00 },
  'pinamar':                       { tipo: 'pct', valor: 3.00, nota: 'Eliminada tras temporada estival 2025-2026' },
  'malvinas argentinas':           { tipo: 'pesos', label: '$2,75–$3,50/l' },
  'campana':                       { tipo: 'pesos', label: '$4–$8/l' },
  'san fernando':                  { tipo: 'pesos', label: '$7,92/l' },
  'junin':                         { tipo: 'pesos', label: '$8,30–$11/l' },
  'general rodriguez':             { tipo: 'pesos', label: '$10/l' },
  'jose c. paz':                   { tipo: 'pesos', label: '$30/l' },
  'jose clemente paz':             { tipo: 'pesos', label: '$30/l' },
}

function getTasaVial(name) {
  return TASA_VIAL_RAW[normName(name)] ?? null
}

/* ── Transparencia Fiscal Municipal data (ASAP, Filial PBA) ────────────── */
function buildTransparencia(rows) {
  return rows.map(([municipio, cumplimiento, transparencia, presupuesto, sitEcFciera, ejecTrimestral, gastosFinFunc, deuda]) => ({
    municipio, cumplimiento, transparencia, presupuesto, sitEcFciera, ejecTrimestral, gastosFinFunc, deuda,
    indice: transparencia + presupuesto + sitEcFciera + ejecTrimestral + gastosFinFunc + deuda,
  }))
}

const TRANSPARENCIA_RAW = buildTransparencia([
  ['Adolfo Alsina', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Adolfo Gonzales Chaves', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Alberti', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Ayacucho', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Balcarce', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Benito Juárez', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Berisso', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Bolívar', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Bragado', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Capitán Sarmiento', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Carlos Casares', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Carlos Tejedor', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Chascomús', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Chivilcoy', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Coronel Dorrego', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Coronel Pringles', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Coronel Suárez', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Florentino Ameghino', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['General Alvarado', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['General Alvear', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['General Belgrano', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['General La Madrid', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['General Madariaga', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['General Pinto', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['General Pueyrredón', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['General San Martín', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['General Viamonte', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['General Villegas', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Hipólito Yrigoyen', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Junín', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['La Matanza', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['La Plata', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Lanús', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Laprida', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Lincoln', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Lobería', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Lobos', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Luján', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Magdalena', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Malvinas Argentinas', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Mercedes', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Monte Hermoso', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Moreno', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Necochea', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Pergamino', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Pinamar', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Puan', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Rauch', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Rivadavia', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Rojas', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Saavedra', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Saladillo', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Salto', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['San Andrés de Giles', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['San Cayetano', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['San Isidro', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['San Miguel', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['San Miguel del Monte', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['San Pedro', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Tandil', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Trenque Lauquen', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Tres Arroyos', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Tres de Febrero', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Villarino', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Zárate', 'Estricto', 5, 30, 35, 10, 10, 10],
  ['Brandsen', 'Alto', 5, 30, 35, 10, 10, 5],
  ['Azul', 'Alto', 5, 30, 35, 10, 10, 3],
  ['Arrecifes', 'Alto', 5, 30, 35, 0, 10, 10],
  ['Coronel de Marina Leonardo Rosales', 'Alto', 5, 30, 35, 5, 3, 3],
  ['Colón', 'Alto', 5, 30, 15, 10, 10, 10],
  ['Almirante Brown', 'Medio', 5, 0, 35, 10, 10, 10],
  ['Carmen de Areco', 'Medio', 5, 30, 25, 5, 5, 0],
  ['Chacabuco', 'Medio', 5, 30, 35, 0, 0, 0],
  ['General Guido', 'Medio', 5, 0, 35, 10, 10, 10],
  ['Tapalqué', 'Medio', 5, 0, 35, 10, 10, 10],
  ['Bahía Blanca', 'Medio', 5, 30, 25, 0, 0, 5],
  ['Avellaneda', 'Medio', 5, 30, 25, 0, 0, 0],
  ['Berazategui', 'Medio', 5, 30, 25, 0, 0, 0],
  ['Las Flores', 'Medio', 5, 20, 35, 0, 0, 0],
  ['Pila', 'Medio', 5, 30, 25, 0, 0, 0],
  ['Tornquist', 'Medio', 5, 30, 25, 0, 0, 0],
  ['Baradero', 'Medio', 5, 0, 35, 0, 10, 0],
  ['Daireaux', 'Medio', 5, 0, 25, 0, 10, 10],
  ['Olavarría', 'Medio', 5, 0, 25, 5, 5, 5],
  ['Pellegrini', 'Medio', 5, 0, 25, 5, 5, 5],
  ['Vicente López', 'Medio', 5, 0, 25, 5, 5, 5],
  ['Nueve de Julio', 'Medio', 5, 0, 25, 3, 5, 5],
  ['Patagones', 'Medio', 5, 0, 25, 10, 0, 0],
  ['Exaltación de la Cruz', 'Bajo', 5, 0, 25, 5, 0, 0],
  ['San Antonio de Areco', 'Bajo', 5, 0, 25, 5, 0, 0],
  ['Dolores', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Ensenada', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Escobar', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Ezeiza', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Florencio Varela', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['General Las Heras', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['General Lavalle', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['General Rodríguez', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Ituzaingó', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['José C. Paz', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Maipú', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Morón', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Navarro', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Pehuajó', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Quilmes', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Ramallo', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Roque Pérez', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Salliqueló', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['San Fernando', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['San Vicente', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Suipacha', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Tres Lomas', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Veinticinco de Mayo', 'Bajo', 5, 0, 25, 0, 0, 0],
  ['Pilar', 'Bajo', 5, 0, 0, 10, 0, 0],
  ['Campana', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['General Arenales', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['General Paz', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['Hurlingham', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['Leandro N. Alem', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['Lezama', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['Mar Chiquita', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['Merlo', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['Punta Indio', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['Tigre', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['Tordillo', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['Villa Gesell', 'Nulo', 5, 0, 0, 0, 0, 0],
  ['Cañuelas', 'Nulo', 0, 0, 0, 0, 0, 0],
  ['Castelli', 'Nulo', 0, 0, 0, 0, 0, 0],
  ['Esteban Echeverría', 'Nulo', 0, 0, 0, 0, 0, 0],
  ['Guaminí', 'Nulo', 0, 0, 0, 0, 0, 0],
  ['La Costa', 'Nulo', 0, 0, 0, 0, 0, 0],
  ['Lomas de Zamora', 'Nulo', 0, 0, 0, 0, 0, 0],
  ['Marcos Paz', 'Nulo', 0, 0, 0, 0, 0, 0],
  ['Presidente Perón', 'Nulo', 0, 0, 0, 0, 0, 0],
  ['San Nicolás', 'Nulo', 0, 0, 0, 0, 0, 0],
])

const TRANSPARENCIA_DATA = {}
TRANSPARENCIA_RAW.forEach(d => { TRANSPARENCIA_DATA[normName(d.municipio)] = d })

const CUMPLIMIENTO_COLORS = {
  Estricto: colorEscalaValoracion(1),
  Alto:     colorEscalaValoracion(0.75),
  Medio:    colorEscalaValoracion(0.5),
  Bajo:     colorEscalaValoracion(0.25),
  Nulo:     colorEscalaValoracion(0),
}

function transparenciaFill(indice) {
  return colorEscalaValoracion(indice / 100)
}

function transparenciaStyle(data, state) {
  const w = state !== 'default' ? 1.5 : 0.6
  if (!data) {
    return { fillColor: '#cbd5e1', fillOpacity: 0.25, color: '#94a3b8', weight: 0.4, opacity: 0.6 }
  }
  const fo = state === 'selected' ? 0.88 : state === 'hover' ? 0.78 : 0.62
  return { fillColor: transparenciaFill(data.indice), fillOpacity: fo, color: '#1e293b', weight: w, opacity: 0.75 }
}

/* ── Economía municipal — Cadenas Productivas (Lodola, Senado PBA) ────────── */
/* Colores de categoría tomados del sistema: valoración para los extremos
   (líderes/rezagados) y paleta de dato para las categorías mixtas. */
const CADENA_CATEGORIAS = {
  MADUROS: {
    label: 'Maduros', vab: '15,8%', color: '#0F172A', largo: 'up', corto: 'down',
    desc: 'Buena trayectoria de largo plazo pero desaceleración en 2025. Municipios industriales o con base productiva diversificada, de menor volatilidad positiva reciente.',
  },
  LIDERES: {
    label: 'Líderes', vab: '14,3%', color: '#0D9488', largo: 'up', corto: 'up',
    desc: 'Crecimiento sólido en el largo plazo y recuperación fuerte en 2025. Perfil exportador agropecuario (maní, soja, trigo) y turístico.',
  },
  REZAGADOS: {
    label: 'Rezagados', vab: '52,2%', color: '#B4234C', largo: 'down', corto: 'down',
    desc: 'Bajo crecimiento en ambos planos. Concentra gran parte del Conurbano bonaerense y economías urbanas de gran tamaño, con inercia estructural y alta ponderación provincial.',
  },
  EMERGENTES: {
    label: 'Emergentes', vab: '17,8%', color: '#22D3EE', largo: 'down', corto: 'up',
    desc: 'Crecimiento 2025 por encima de la mediana pero trayectoria de largo plazo rezagada. Predomina el rebote cíclico sobre el dinamismo estructural.',
  },
}

const CADENA_MUNICIPIOS = {
  MADUROS: [
    'Chascomús', 'Dolores', 'Malvinas Argentinas', 'Florencio Varela', 'Salto', 'Tigre',
    'Magdalena', 'Laprida', 'Cañuelas', 'Alberti', 'Carlos Casares', 'San Antonio de Areco',
    'Roque Pérez', 'Monte', 'Saladillo', 'Hipólito Yrigoyen', 'Escobar', 'Maipú', 'Bragado',
    'General Paz', 'Pilar', 'Bolívar', 'General Alvear', 'Pergamino', 'Brandsen', 'Adolfo Alsina',
    'Baradero', 'Ramallo', 'Zárate', 'Las Flores',
  ],
  LIDERES: [
    'Carlos Tejedor', 'Rivadavia', 'Florentino Ameghino', 'Monte Hermoso', 'Villa Gesell',
    'Pehuajó', 'La Costa', 'Pinamar', 'General Pinto', 'General Villegas', 'Marcos Paz',
    '9 de Julio', 'Tordillo', 'Tornquist', 'Punta Indio', 'General Juan Madariaga', 'San Vicente',
    'San Andrés de Giles', 'General Viamonte', 'General Arenales', 'Exaltación de la Cruz',
    'General Belgrano', 'Coronel de Marina Leonardo Rosales', 'Berazategui', 'Leandro N. Alem',
    'Junín', 'Ezeiza', 'Presidente Perón', 'Esteban Echeverría', 'Chacabuco', 'Ayacucho',
    'Carmen de Areco', 'Pila', 'Mar Chiquita', 'Rauch', 'Balcarce', 'Moreno', 'Rojas',
  ],
  REZAGADOS: [
    'Avellaneda', 'San Miguel', 'Almirante Brown', 'Bahía Blanca', 'Lobos', 'General Rodríguez',
    'Morón', 'Villarino', 'La Matanza', 'General San Martín', 'Lomas de Zamora', 'La Plata',
    'Lanús', 'Merlo', 'Luján', 'San Nicolás', 'Azul', 'San Isidro', 'Quilmes', 'General Lavalle',
    'San Fernando', 'Olavarría', 'Tres Arroyos', 'Mercedes', 'Colón', 'Campana', 'San Pedro',
    'Suipacha', 'José C. Paz', 'Berisso', 'Capitán Sarmiento', 'General Las Heras', 'Benito Juárez',
    'Salliqueló', 'San Cayetano', 'Daireaux', 'Coronel Suárez',
  ],
  EMERGENTES: [
    'Lezama', 'Guaminí', 'Coronel Dorrego', 'Patagones', 'Puán', 'Trenque Lauquen',
    'General Alvarado', 'Ensenada', 'General Pueyrredón', 'General Guido', 'Castelli',
    'General La Madrid', 'Saavedra', 'Tres Lomas', 'Pellegrini', 'Necochea', 'Tapalqué',
    'Arrecifes', 'Coronel Pringles', 'Navarro', 'Tres de Febrero', 'Lincoln', '25 de Mayo',
    'Lobería', 'Adolfo Gonzales Chaves', 'Vicente López', 'Chivilcoy', 'Ituzaingó', 'Hurlingham',
    'Tandil',
  ],
}

const CADENA_CAT = {}
Object.entries(CADENA_MUNICIPIOS).forEach(([cat, arr]) => {
  arr.forEach(n => { CADENA_CAT[normName(n)] = cat })
})

// Match by código (like the general theme) so every partido colors; name as fallback.
const CADENA_BY_CODE = {}
MUNICIPIOS_DATA.forEach(d => {
  const cat = CADENA_CAT[normName(d.nombre)]
  if (cat) CADENA_BY_CODE[d.codigo] = cat
})

// ponytail: dev sanity — every partido must land in exactly one categoría (catches name typos)
if (import.meta.env?.DEV) {
  const missing = MUNICIPIOS_DATA
    .filter(d => d.nombre !== 'Buenos Aires' && !CADENA_CAT[normName(d.nombre)])
    .map(d => d.nombre)
  if (missing.length) console.warn('[Economía municipal] partidos sin categoría:', missing)
}

function cadenaStyle(cat, state) {
  const w = state !== 'default' ? 1.5 : 0.6
  if (!cat) {
    return { fillColor: '#cbd5e1', fillOpacity: 0.25, color: '#94a3b8', weight: 0.4, opacity: 0.6 }
  }
  const fo = state === 'selected' ? 0.9 : state === 'hover' ? 0.8 : 0.62
  return { fillColor: CADENA_CATEGORIAS[cat].color, fillOpacity: fo, color: '#1e293b', weight: w, opacity: 0.8 }
}

/* Tasa más alta = peor para el contribuyente: escala de valoración invertida */
function tasaFill(valor) {
  const t = (valor - 0.8) / 2.2
  return colorEscalaValoracion(1 - t)
}

function tasaVialStyle(tasa, state) {
  const w = state !== 'default' ? 1.5 : 0.6
  if (!tasa) {
    return { fillColor: '#cbd5e1', fillOpacity: 0.25, color: '#94a3b8', weight: 0.4, opacity: 0.6 }
  }
  if (tasa.tipo === 'pesos') {
    /* categoría aparte (monto fijo, no alícuota): navy de la paleta de dato */
    const fo = state === 'selected' ? 0.82 : state === 'hover' ? 0.65 : 0.45
    return { fillColor: '#0F172A', fillOpacity: fo, color: '#0F172A', weight: w, opacity: 0.9 }
  }
  const base = 0.28 + ((tasa.valor - 0.8) / 2.2) * 0.52
  const fo = state === 'selected' ? 0.90 : state === 'hover' ? Math.min(base + 0.22, 0.92) : base
  return { fillColor: tasaFill(tasa.valor), fillOpacity: fo, color: '#1e293b', weight: w, opacity: 0.8 }
}


/* ── Theme configs ──────────────────────────────────────────────────────── */
const THEMES = {
  general: {
    default:  { fillColor: '#1f4795', fillOpacity: 0.15, color: '#1a3d7c', weight: 0.8, opacity: 0.7 },
    hover:    { fillColor: '#1f4795', fillOpacity: 0.38, color: '#1a3d7c', weight: 1.2, opacity: 1   },
    selected: { fillColor: '#0F172A', fillOpacity: 0.65, color: '#93c5fd', weight: 2,   opacity: 1   },
  },
  produccion: {
    default:  { fillColor: '#0e6e55', fillOpacity: 0.15, color: '#0a5240', weight: 0.8, opacity: 0.7 },
    hover:    { fillColor: '#0e6e55', fillOpacity: 0.38, color: '#0a5240', weight: 1.2, opacity: 1   },
    selected: { fillColor: '#063d2f', fillOpacity: 0.65, color: '#6ee7b7', weight: 2,   opacity: 1   },
  },
  tasas: {
    default:  { fillColor: '#7c3aed', fillOpacity: 0.15, color: '#6d28d9', weight: 0.8, opacity: 0.7 },
    hover:    { fillColor: '#7c3aed', fillOpacity: 0.38, color: '#6d28d9', weight: 1.2, opacity: 1   },
    selected: { fillColor: '#4c1d95', fillOpacity: 0.65, color: '#c4b5fd', weight: 2,   opacity: 1   },
  },
}

/* Estilo de un partido según la temática activa y su estado */
function styleFor(layer, t, state) {
  if (state === 'selected') return THEMES[t]?.selected || THEMES.general.selected
  if (t === 'gasto')         return secuencialStyle(layer._egData?.gasto_vecino_mes, CORTES_GASTO, state)
  if (t === 'concejales')    return secuencialStyle(layer._egData?.hcd_hab, CORTES_HCD, state)
  if (t === 'tasavial')      return tasaVialStyle(layer._tasaData, state)
  if (t === 'transparencia') return transparenciaStyle(layer._transparenciaData, state)
  if (t === 'economia')      return cadenaStyle(layer._cadenaCat, state)
  return THEMES[t]?.[state] || THEMES.general[state]
}

/* ── Temáticas ──────────────────────────────────────────────────────────── */
const TEMAS = [
  { id: 'general',    label: 'Información general' },
  { id: 'produccion', label: 'Índice de producción' },
  { id: 'economia',   label: 'Economía municipal' },
  { id: 'tasas',      label: 'Tasas municipales'   },
  { id: 'tasavial',   label: 'Tasa vial'           },
  { id: 'transparencia', label: 'Transparencia fiscal' },
  { id: 'gasto',      label: 'Gasto por vecino'    },
  { id: 'concejales', label: 'Gasto concejales'    },
]

/* ── Indicators per theme ───────────────────────────────────────────────── */
const INDICATORS = {
  general: [
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
  ],
  produccion: [
    { key: '_empleo_adulto',  label: 'Tasa de empleo adulto',        good: 'high', derive: d => d.desempleo_adulto != null ? 1 - d.desempleo_adulto : null },
    { key: '_empleo_joven',   label: 'Tasa de empleo joven',         good: 'high', derive: d => d.desempleo_joven  != null ? 1 - d.desempleo_joven  : null },
    { key: 'fin_secundaria_adultos', label: 'Capital humano (secundaria)', good: 'high' },
    { key: 'tics_internet',   label: 'Conectividad productiva',      good: 'high' },
    { key: 'tics_celular',    label: 'Penetración móvil',            good: 'high' },
    { key: 'urbano',          label: 'Urbanización',                 good: 'high' },
    { key: 'participacion_mujeres', label: 'Participación laboral fem.', good: 'high' },
  ],
  tasas: null,
  tasavial: 'tasa',
  transparencia: 'transparencia',
  economia: 'economia',
  gasto: 'gasto',
  concejales: 'custom',
}

/* El geojson de partidos etiqueta a Chascomús y a Lezama con el mismo código,
   06217, que no es el de ninguno de los dos: Lezama se separó de Chascomús en
   2009 y tiene código INDEC propio. Sin esta corrección ninguno de los dos
   cruza contra MUNICIPIOS_DATA y los dos quedan sin datos en el mapa. */
const IN1_CORREGIDO = {
  'Chascomús': '06218',
  'Lezama':    '06466',
}

// in1 "06441" → MUNICIPIOS_DATA codigo "ARG064410441"
function in1ToCode(in1) {
  const tail = in1.slice(2)
  const id4  = parseInt(tail).toString().padStart(4, '0')
  return `ARG06${tail}${id4}`
}

function IndicatorBar({ ind, data }) {
  const value = ind.derive ? ind.derive(data) : data[ind.key]
  if (value == null) return null
  const pct    = value * 100
  const barPct = Math.min(pct, 100)
  /* nivel → valoración según la dirección deseable del indicador */
  const color  =
    ind.good === 'high'
      ? colorEscalaValoracion(pct > 70 ? 1 : pct > 40 ? 0.5 : 0)
      : colorEscalaValoracion(pct < 10 ? 1 : pct < 25 ? 0.5 : 0)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">{ind.label}</span>
        <span className="text-xs font-semibold text-slate-900">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barPct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

/* ── Ranking provincial por temática (estado por defecto del panel) ─────── */

const NAME_BY_NORM = {}
MUNICIPIOS_DATA.forEach(d => { NAME_BY_NORM[normName(d.nombre)] = d.nombre })

function displayName(key) {
  return NAME_BY_NORM[key] ?? key.replace(/\b\p{L}/gu, c => c.toUpperCase())
}

const fmtPct1 = v => (v * 100).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
const fmtPesos = v => `$ ${Math.round(v).toLocaleString('es-AR')}`
const fmtMillones = v => `$ ${v.toLocaleString('es-AR', { maximumFractionDigits: 1 })} millones`
const fmtVar = v => `${v > 0 ? '+' : ''}${v.toLocaleString('es-AR')}%`
const fmtMiles = v => (v / 1000).toLocaleString('es-AR')

const topEG = (key, n) => ELLOS_GASTAN_2026
  .filter(d => d[key] != null)
  .sort((a, b) => b[key] - a[key])
  .slice(0, n)

/* Puesto de un partido en la provincia (1 = valor más alto) */
function puestoEG(key, valor) {
  const conDato = ELLOS_GASTAN_2026.filter(d => d[key] != null)
  return { puesto: conDato.filter(d => d[key] > valor).length + 1, total: conDato.length }
}

const RANKINGS = {
  general: {
    titulo: 'Los 10 partidos más poblados',
    fuente: 'INDEC, Censo 2022',
    rows: [...MUNICIPIOS_DATA]
      .filter(d => d.poblacion != null && d.nombre !== 'Buenos Aires')
      .sort((a, b) => b.poblacion - a.poblacion)
      .slice(0, 10)
      .map(d => ({ nombre: d.nombre, valor: d.poblacion.toLocaleString('es-AR') })),
  },
  produccion: {
    titulo: 'Mayor tasa de empleo adulto',
    fuente: 'CAF, en base a Censo 2022',
    rows: [...MUNICIPIOS_DATA]
      .filter(d => d.desempleo_adulto != null)
      .sort((a, b) => a.desempleo_adulto - b.desempleo_adulto)
      .slice(0, 10)
      .map(d => ({ nombre: d.nombre, valor: fmtPct1(1 - d.desempleo_adulto) })),
  },
  tasavial: {
    titulo: 'Alícuotas más altas por litro',
    fuente: 'Ministerio de Economía de la Nación, mar. 2025',
    rows: Object.entries(TASA_VIAL_RAW)
      .filter(([k, v]) => v.tipo === 'pct' && k !== 'presidente juan domingo peron')
      .sort((a, b) => b[1].valor - a[1].valor)
      .slice(0, 10)
      .map(([k, v]) => ({ nombre: displayName(k), valor: v.valor.toFixed(2).replace('.', ',') + '%' })),
  },
  transparencia: {
    titulo: 'Mejor índice de transparencia',
    fuente: 'ASAP, Filial PBA',
    rows: [...TRANSPARENCIA_RAW]
      .sort((a, b) => b.indice - a.indice)
      .slice(0, 10)
      .map(d => ({ nombre: d.municipio, valor: `${d.indice}/100` })),
  },
  gasto: {
    titulo: 'Mayor gasto mensual por vecino',
    fuente: 'Fundación Libertad, "Ellos gastan" 2026, y Censo 2022',
    rows: topEG('gasto_vecino_mes', 10).map(d => ({ nombre: d.nombre, valor: fmtPesos(d.gasto_vecino_mes) })),
  },
  concejales: {
    titulo: 'Mayor costo del Concejo por habitante',
    fuente: 'Fundación Libertad, "Ellos gastan" 2026, y Censo 2022',
    rows: topEG('hcd_hab', 5).map(d => ({ nombre: d.nombre, valor: `${fmtPesos(d.hcd_hab)}/año` })),
    extra: {
      titulo: 'Mayor aumento del presupuesto 2026',
      rows: topEG('aumento_hcd', 5).map(d => ({ nombre: d.nombre, valor: fmtVar(d.aumento_hcd) })),
    },
  },
}

function RankingLista({ titulo, rows }) {
  return (
    <>
      <p className="text-label font-semibold uppercase tracking-wider text-slate-500 mb-3">
        {titulo}
      </p>
      <ol className="flex flex-col">
        {rows.map((r, i) => (
          <li key={r.nombre} className="flex items-baseline gap-2.5 py-1.5 border-b" style={{ borderColor: 'var(--rule)' }}>
            <span className="text-xs text-slate-400 tabular-nums w-4 shrink-0 text-right">{i + 1}</span>
            <span className="text-xs text-slate-700 flex-1 min-w-0 truncate">{r.nombre}</span>
            <span className="text-xs font-semibold text-slate-900 tabular-nums">{r.valor}</span>
          </li>
        ))}
      </ol>
    </>
  )
}

function RankingDefault({ tema }) {
  if (tema === 'economia') {
    return (
      <div className="p-5 border-t-2 border-[#0F172A] flex-1 overflow-y-auto">
        <p className="text-label font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Partidos por categoría productiva
        </p>
        <div className="flex flex-col">
          {Object.entries(CADENA_CATEGORIAS).map(([key, c]) => (
            <div key={key} className="flex items-baseline justify-between gap-3 py-2 border-b" style={{ borderColor: 'var(--rule)' }}>
              <span className="text-xs text-slate-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: c.color }} />
                {c.label}
              </span>
              <span className="text-xs font-semibold text-slate-900 tabular-nums">
                {CADENA_MUNICIPIOS[key].length} partidos · {c.vab} del VAB
              </span>
            </div>
          ))}
        </div>
        <p className="text-caption text-slate-500 mt-3">
          Hacé clic en un partido del mapa para ver su trayectoria de corto y largo plazo.
        </p>
      </div>
    )
  }

  const ranking = RANKINGS[tema]
  if (!ranking) {
    return (
      <div className="p-5 border-t-2 border-[#0F172A]">
        <p className="text-sm text-slate-700 leading-relaxed">
          Los datos de tasas municipales se publican próximamente.
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 border-t-2 border-[#0F172A] flex-1 overflow-y-auto">
      <RankingLista titulo={ranking.titulo} rows={ranking.rows} />
      {ranking.extra && (
        <div className="mt-5">
          <RankingLista titulo={ranking.extra.titulo} rows={ranking.extra.rows} />
        </div>
      )}
      <p className="text-caption text-slate-500 mt-3">
        Fuente: {ranking.fuente}. Hacé clic en un partido del mapa para ver su detalle.
      </p>
    </div>
  )
}

/* ── Leyenda por quintiles (gasto por vecino, costo del Concejo) ────────── */
function LeyendaCortes({ cortes, unidad }) {
  const tramos = RAMPA_DATO.map((color, i) => ({
    color,
    label: i === 0 ? `< ${fmtMiles(cortes[0])}`
      : i === cortes.length ? `≥ ${fmtMiles(cortes[i - 1])}`
      : `${fmtMiles(cortes[i - 1])}–${fmtMiles(cortes[i])}`,
  }))
  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-start gap-x-1 gap-y-2">
        {tramos.map(t => (
          <div key={t.color} className="flex flex-col gap-1 w-16">
            <span className="h-2.5 w-full" style={{ backgroundColor: t.color }} />
            <span className="text-[10px] text-slate-500 tabular-nums">{t.label}</span>
          </div>
        ))}
        <div className="flex flex-col gap-1 w-16">
          <span className="h-2.5 w-full bg-slate-300 opacity-60" />
          <span className="text-[10px] text-slate-500">Sin datos</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 mt-1">{unidad}. Cada color reúne un quinto de los partidos con dato.</p>
    </div>
  )
}

/* Cifra principal del partido en el encabezado del panel, con su puesto */
function CifraCabecera({ valor, unidad, puesto, total }) {
  return (
    <div className="mt-3">
      <p className="text-2xl font-bold text-[#0F172A] leading-none tabular-nums">{valor}</p>
      <p className="text-xs text-slate-500 mt-1.5">
        {unidad} · <span className="tabular-nums">puesto {puesto} de {total}</span>
      </p>
    </div>
  )
}

function FilaDato({ label, valor, color }) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-2.5 border-b" style={{ borderColor: 'var(--rule)' }}>
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900 tabular-nums text-right whitespace-nowrap" style={color ? { color } : undefined}>{valor}</span>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function AtlasMunicipal() {
  const mapRef      = useRef(null)
  const mapInstRef  = useRef(null)
  const selectedRef = useRef(null)
  const geoLayerRef = useRef(null)
  const temaRef     = useRef('general')

  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [tema,     setTema]     = useState('general')

  const dataByCode = useMemo(() => {
    const m = {}
    MUNICIPIOS_DATA.forEach(d => { m[d.codigo] = d })
    return m
  }, [])

  /* Restyle all layers when tema changes */
  const updateStyles = useCallback(() => {
    if (!geoLayerRef.current) return
    const t = temaRef.current
    geoLayerRef.current.eachLayer(layer => {
      layer.setStyle(styleFor(layer, t, layer === selectedRef.current ? 'selected' : 'default'))
    })
  }, [])

  useEffect(() => {
    temaRef.current = tema
    // clear selection on tab switch
    selectedRef.current = null
    setSelected(null)
    updateStyles()
  }, [tema, updateStyles])

  useEffect(() => {
    let mounted = true
    let map     = null

    async function init() {
      try {
        const L = (await import('leaflet')).default
        if (!mounted || !mapRef.current) return

        const bounds = L.latLngBounds(L.latLng(-43.5, -65.5), L.latLng(-32.5, -55.5))
        map = L.map(mapRef.current, {
          center: [-37.5, -61], zoom: 6, minZoom: 6, maxZoom: 9,
          maxBounds: bounds, maxBoundsViscosity: 1.0,
          zoomControl: true, attributionControl: false,
        })
        mapInstRef.current = map

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 15, opacity: 0.65, attribution: '&copy; OpenStreetMap' }).addTo(map)

        /* La geometría entra por el pipeline de assets de Vite (?url): sale del
           build con hash de contenido, así que vercel.json la puede cachear como
           inmutable y un cambio del dato invalida la URL solo. Antes se pedía al
           WFS del IGN, dado de baja, con caída a un repo personal de GitHub. */
        const res = await fetch(partidosGeojsonUrl)
        if (!res.ok) throw new Error(`partidos.geojson: HTTP ${res.status}`)
        const geojson = await res.json()
        if (!mounted) return

        const geoLayer = L.geoJSON(geojson, {
          style: () => ({ ...THEMES.general.default }),

          onEachFeature(feature, layer) {
            const p      = feature.properties
            const name   = p.nombre || p.nam || ''
            const in1    = IN1_CORREGIDO[name] || p.in1 || p.cde
            const codigo = in1 ? in1ToCode(in1) : null

            layer._municipiosData    = codigo ? dataByCode[codigo] : null
            layer._egData            = (codigo && EG_BY_CODE[codigo]) || null
            layer._tasaData          = getTasaVial(name)
            layer._transparenciaData = TRANSPARENCIA_DATA[normName(name)] || null
            layer._cadenaCat         = (codigo && CADENA_BY_CODE[codigo]) || CADENA_CAT[normName(name)] || null
            layer._featureName       = name

            layer.bindTooltip(name, { sticky: true, direction: 'auto', className: 'muni-tooltip' })

            layer.on('mouseover', e => {
              if (e.target === selectedRef.current) return
              e.target.setStyle(styleFor(e.target, temaRef.current, 'hover'))
            })

            layer.on('mouseout', e => {
              if (e.target === selectedRef.current) return
              e.target.setStyle(styleFor(e.target, temaRef.current, 'default'))
            })

            layer.on('click', () => {
              const t = temaRef.current
              // 'tasas' is a "próx." placeholder with no panel data — clicking would crash on indicators.map(null)
              if (t === 'tasas') return

              const prev = selectedRef.current
              selectedRef.current = layer
              if (prev && prev !== layer) prev.setStyle(styleFor(prev, t, 'default'))
              layer.setStyle(styleFor(layer, t, 'selected'))

              const muniData = layer._municipiosData
              setSelected({
                nombre: name,
                ...(muniData || {}),
                _eg: layer._egData,
                _tasa: layer._tasaData || null,
                _transparencia: layer._transparenciaData || null,
                _cadena: layer._cadenaCat || null,
                _noData: (t === 'general' || t === 'produccion') && !muniData,
              })
            })
          },
        }).addTo(map)

        geoLayerRef.current = geoLayer
        setLoading(false)
      } catch {
        if (mounted) setError(true)
      }
    }

    init()
    return () => { mounted = false; if (map) map.remove() }
  }, [dataByCode])

  const indicators = INDICATORS[tema]

  /* Panel content */
  function PanelContent() {
    if (!selected) {
      return <RankingDefault tema={tema} />
    }

    if (selected._noData) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-6">
          <p className="text-base font-bold text-[#0F172A]">{selected.nombre}</p>
          <p className="text-xs text-slate-500">Sin datos disponibles para este partido.</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-bold text-[#0F172A] leading-tight">{selected.nombre}</h3>
          {tema !== 'concejales' && tema !== 'gasto' && tema !== 'transparencia' && tema !== 'economia' && (
            <div className="flex flex-wrap gap-4 mt-3">
              {selected.poblacion && (
                <div>
                  <p className="text-xl font-bold text-brand-600 leading-none">{selected.poblacion.toLocaleString('es-AR')}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Habitantes</p>
                </div>
              )}
              {selected.hogares && (
                <div>
                  <p className="text-xl font-bold text-brand-600 leading-none">{selected.hogares.toLocaleString('es-AR')}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Hogares</p>
                </div>
              )}
              {selected.superficie_km2 != null && (
                <div>
                  <p className="text-xl font-bold text-brand-600 leading-none">{selected.superficie_km2.toLocaleString('es-AR')}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">km²</p>
                </div>
              )}
            </div>
          )}
          {tema === 'gasto' && selected._eg?.gasto_vecino_mes != null && (
            <CifraCabecera
              valor={fmtPesos(selected._eg.gasto_vecino_mes)}
              unidad="por vecino, por mes"
              {...puestoEG('gasto_vecino_mes', selected._eg.gasto_vecino_mes)}
            />
          )}
          {tema === 'concejales' && selected._eg && (
            <CifraCabecera
              valor={fmtPesos(selected._eg.hcd_hab)}
              unidad="por habitante, por año"
              {...puestoEG('hcd_hab', selected._eg.hcd_hab)}
            />
          )}
          {tema === 'transparencia' && selected._transparencia && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div>
                <p className="text-2xl font-bold leading-none" style={{ color: transparenciaFill(selected._transparencia.indice) }}>
                  {selected._transparencia.indice}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Índice (0–100)</p>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: CUMPLIMIENTO_COLORS[selected._transparencia.cumplimiento] }}
              >
                {selected._transparencia.cumplimiento}
              </span>
            </div>
          )}
          {tema === 'economia' && selected._cadena && (
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: CADENA_CATEGORIAS[selected._cadena].color }}
                >
                  {CADENA_CATEGORIAS[selected._cadena].label}
                </span>
                <div>
                  <p className="text-lg font-bold text-slate-900 leading-none">{CADENA_CATEGORIAS[selected._cadena].vab}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">del VAB provincial</p>
                </div>
              </div>
              {selected.poblacion && (
                <p className="text-xs text-slate-500 mt-2">{selected.poblacion.toLocaleString('es-AR')} habitantes</p>
              )}
            </div>
          )}
        </div>

        {/* Tema label */}
        <div className="px-5 pt-3 pb-1 shrink-0">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            {TEMAS.find(t => t.id === tema)?.label}
          </p>
        </div>

        {/* Body */}
        {indicators === 'tasa' ? (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {selected._tasa ? (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p
                    className="text-3xl font-bold leading-none tabular-nums"
                    style={{ color: selected._tasa.tipo === 'pesos' ? 'var(--c-ink)' : 'var(--worse-text)' }}
                  >
                    {selected._tasa.tipo === 'pct'
                      ? `${selected._tasa.valor.toFixed(2).replace('.', ',')}%`
                      : selected._tasa.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">
                    {selected._tasa.tipo === 'pct' ? 'por litro expendido' : 'fijo por litro (pesos)'}
                  </p>
                </div>
                {selected._tasa.nota && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-snug">
                    {selected._tasa.nota}
                  </p>
                )}
                {selected._tasa.tipo === 'pesos' && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tasa fija en pesos por litro. Su carga real varía según el precio del combustible.
                  </p>
                )}
                <div className="pt-3 border-t border-slate-100">
                  <a href="/informes/tasa-vial-municipios-pba-2025" className="text-xs font-medium text-brand-600 hover:text-brand-700 no-underline">
                    Ver informe completo →
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Sin datos de tasa vial para este partido en el relevamiento 2025.</p>
            )}
          </div>
        ) : indicators === 'transparencia' ? (
          /* Transparencia fiscal detail */
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {selected._transparencia ? (() => {
              const d = selected._transparencia
              const rows = [
                { label: 'Transparencia',                 value: d.transparencia,  max: 5  },
                { label: 'Presupuesto',                   value: d.presupuesto,    max: 30 },
                { label: 'Situación económica financiera', value: d.sitEcFciera,    max: 35 },
                { label: 'Ejecución trimestral',           value: d.ejecTrimestral, max: 10 },
                { label: 'Gastos en función financiera',   value: d.gastosFinFunc,  max: 10 },
                { label: 'Deuda',                          value: d.deuda,          max: 10 },
              ]
              return (
                <div className="flex flex-col gap-3">
                  {rows.map(r => (
                    <div key={r.label} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">{r.label}</span>
                        <span className="text-xs font-semibold text-slate-900">{r.value}/{r.max}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(r.value / r.max) * 100}%`, backgroundColor: transparenciaFill((r.value / r.max) * 100) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )
            })() : (
              <p className="text-xs text-slate-500">Sin datos de transparencia fiscal para este partido.</p>
            )}
          </div>
        ) : indicators === 'economia' ? (
          /* Economía municipal detail */
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {selected._cadena ? (() => {
              const c = CADENA_CATEGORIAS[selected._cadena]
              const arrow = dir => (
                <span
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: getColorVariacion({ variacion: dir === 'up' ? 1 : -1, polaridad: 'mayor-es-mejor', texto: true }) }}
                >
                  {dir === 'up' ? '↑ Por encima del promedio' : '↓ Por debajo del promedio'}
                </span>
              )
              return (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">Largo plazo (2016-2025)</span>
                      {arrow(c.largo)}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">Corto plazo (2025)</span>
                      {arrow(c.corto)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{c.desc}</p>
                  <p className="text-[11px] text-slate-500 leading-snug border-t border-slate-100 pt-3">
                    Fuente: "Cadenas Productivas en los Municipios de la Provincia de Buenos Aires 2016/2025" - A. Lodola, Comisión de Asuntos Municipales, Senado PBA.
                  </p>
                </div>
              )
            })() : (
              <p className="text-xs text-slate-500">Sin datos de clasificación económica para este partido.</p>
            )}
          </div>
        ) : indicators === 'gasto' ? (
          /* Gasto por vecino detail */
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {selected._eg?.gasto_total != null ? (() => {
              const d = selected._eg
              return (
                <div className="flex flex-col">
                  <FilaDato label="Gasto total 2026" valor={fmtMillones(d.gasto_total)} />
                  <FilaDato label="Población (Censo 2022)" valor={selected.poblacion?.toLocaleString('es-AR') ?? 's/d'} />
                  {d.personal_pct != null && (
                    <div className="py-2.5 border-b" style={{ borderColor: 'var(--rule)' }}>
                      <div className="flex justify-between items-baseline gap-3">
                        <span className="text-xs text-slate-500">Gasto en personal</span>
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">{d.personal_pct}% del total</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 mt-1.5 overflow-hidden">
                        <div className="h-full" style={{ width: `${d.personal_pct}%`, backgroundColor: 'var(--data-4, #0F172A)' }} />
                      </div>
                    </div>
                  )}
                  <FilaDato label="Documento de la ficha" valor={d.tipo_fuente ?? 's/d'} />
                  <p className="text-[11px] text-slate-500 leading-snug pt-3">
                    Gasto total dividido por la población del Censo 2022 y por 12 meses. Fuente: Fundación Libertad, "Ellos gastan" 2026.
                  </p>
                </div>
              )
            })() : (
              <p className="text-xs text-slate-500">
                {selected._eg
                  ? 'Este partido no tiene ficha de gasto en "Ellos gastan" 2026: solo figuran los datos de su Concejo Deliberante.'
                  : 'Este partido no figura en el relevamiento "Ellos gastan" 2026.'}
              </p>
            )}
          </div>
        ) : indicators === 'custom' ? (
          /* Concejales detail */
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {selected._eg ? (() => {
              const d = selected._eg
              return (
                <div className="flex flex-col">
                  <FilaDato label="Presupuesto del Concejo 2026" valor={fmtMillones(d.hcd)} />
                  {d.aumento_hcd != null && (
                    <FilaDato
                      label="Variación contra 2025"
                      valor={`${flechaVariacion(d.aumento_hcd)} ${fmtVar(d.aumento_hcd)}`}
                      color={getColorVariacion({ variacion: d.aumento_hcd, polaridad: 'neutro', texto: true })}
                    />
                  )}
                  <FilaDato label="Concejales" valor={d.concejales} />
                  <FilaDato label="Costo mensual por concejal" valor={fmtMillones(d.costo_concejal_mes)} />
                  {d.hcd_pct_gasto != null && (
                    <FilaDato label="Peso en el gasto municipal" valor={`${d.hcd_pct_gasto.toLocaleString('es-AR')}%`} />
                  )}
                  <p className="text-[11px] text-slate-500 leading-snug pt-3">
                    Por habitante: presupuesto del Concejo dividido por la población del Censo 2022. El costo por concejal incluye todo el presupuesto del cuerpo, no solo dietas. Fuente: Fundación Libertad, "Ellos gastan" 2026.
                  </p>
                </div>
              )
            })() : (
              <p className="text-xs text-slate-500">Este partido no figura en el relevamiento "Ellos gastan" 2026.</p>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3">
            {indicators.map(ind => <IndicatorBar key={ind.key} ind={ind} data={selected} />)}
          </div>
        )}
      </div>
    )
  }

  return (
    <section className="mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header + tabs */}
        <div className="mb-6">
          <div className="flex items-center border-b-2 border-[#0F172A] pb-3 mb-5">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] leading-none tracking-tight">
              Atlas Municipal
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {TEMAS.map(t => (
              <button
                key={t.id}
                onClick={() => setTema(t.id)}
                aria-pressed={tema === t.id}
                className={`px-4 py-1.5 text-sm font-medium transition-colors border ${
                  tema === t.id
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-white text-slate-500 hover:text-[#0F172A] hover:border-slate-400'
                }`}
                style={tema === t.id ? undefined : { borderColor: 'var(--rule)' }}
              >
                {t.label}
                {t.id === 'tasas' && (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider opacity-60">próx.</span>
                )}
              </button>
            ))}
          </div>

          {(tema === 'general' || tema === 'produccion') && (
            <p className="text-[11px] text-slate-500 mt-2">
              Fuente: CAF - Banco de Desarrollo de América Latina y el Caribe
            </p>
          )}
          {tema === 'tasavial' && (
            <>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-shrink-0 w-20 h-2 rounded-full" style={{ background: `linear-gradient(to right, ${colorEscalaValoracion(1)}, ${colorEscalaValoracion(0.5)}, ${colorEscalaValoracion(0)})` }} />
                  <span className="text-[10px] text-slate-500">0,8% → 3%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: '#0F172A', opacity: 0.7 }} />
                  <span className="text-[10px] text-slate-500">Pesos fijos/l</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm shrink-0 bg-slate-300 opacity-60" />
                  <span className="text-[10px] text-slate-500">Sin datos</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Fuente: Ministerio de Economía de la Nación - Subsecretaría de Coordinación Fiscal Provincial, mar. 2025
              </p>
            </>
          )}
          {tema === 'transparencia' && (
            <>
              <div className="flex items-center gap-1.5 mt-3">
                <div className="flex-shrink-0 w-20 h-2 rounded-full" style={{ background: `linear-gradient(to right, ${colorEscalaValoracion(0)}, ${colorEscalaValoracion(0.5)}, ${colorEscalaValoracion(1)})` }} />
                <span className="text-[10px] text-slate-500">Índice 0 (Nulo) → 100 (Estricto)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Fuente: ASAP - Asociación Argentina de Presupuesto y Administración Financiera Pública, Filial Provincia de Buenos Aires
              </p>
            </>
          )}
          {tema === 'economia' && (
            <>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                {Object.values(CADENA_CATEGORIAS).map(c => (
                  <div key={c.label} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-[10px] text-slate-500">{c.label} · {c.vab}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Fuente: A. Lodola, "Cadenas Productivas en los Municipios de la PBA 2016/2025" - Comisión de Asuntos Municipales, Senado PBA
              </p>
            </>
          )}
          {tema === 'gasto' && (
            <>
              <LeyendaCortes cortes={CORTES_GASTO} unidad="Gasto municipal mensual por vecino, en miles de pesos" />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Fuente: Fundación Libertad, "Ellos gastan" 2026 (fichas municipales), y población del Censo 2022. Presupuesto 2026.
              </p>
            </>
          )}
          {tema === 'concejales' && (
            <>
              <LeyendaCortes cortes={CORTES_HCD} unidad="Presupuesto del Concejo Deliberante por habitante, en miles de pesos al año" />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Fuente: Fundación Libertad, "Ellos gastan" 2026, y población del Censo 2022. Presupuesto 2026.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-5 min-h-[400px] lg:min-h-[520px]">

          {/* Map */}
          <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 min-h-[320px] sm:min-h-[500px]">
            {loading && !error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                <span className="text-sm text-slate-500">Cargando mapa...</span>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <span className="text-sm text-slate-500">No se pudo cargar el mapa.</span>
              </div>
            )}
            <div ref={mapRef} className="w-full h-full min-h-[320px] sm:min-h-[500px]" />
          </div>

          {/* Panel */}
          <div className="lg:w-80 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <PanelContent />
          </div>

        </div>
      </div>

      <style>{`
        .muni-tooltip {
          background: #0F172A;
          border: none;
          border-radius: 2px;
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
