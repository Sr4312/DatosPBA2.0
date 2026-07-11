import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { MUNICIPIOS_DATA } from '@/lib/municipiosData'
import 'leaflet/dist/leaflet.css'

/* ── Concejales data ────────────────────────────────────────────────────── */
const CONCEJALES_RAW = [
  { municipio: 'General Pueyrredón',  concejales: 24, presupuesto: 7268781224, por_concejal: 302865884, pct_total: 1.98, por_habitante: 10896 },
  { municipio: 'Lomas de Zamora',     concejales: 24, presupuesto: 5951667942, por_concejal: 247986164, pct_total: 1.59, por_habitante: 8622  },
  { municipio: 'Tigre',               concejales: 24, presupuesto: 5905089478, por_concejal: 246045395, pct_total: 1.43, por_habitante: 13212 },
  { municipio: 'San Martín',          concejales: 24, presupuesto: 5538000000, por_concejal: 230750000, pct_total: 1.92, por_habitante: 12291 },
  { municipio: 'San Isidro',          concejales: 24, presupuesto: 5354210655, por_concejal: 223092111, pct_total: 2.00, por_habitante: 18011 },
  { municipio: 'Moreno',              concejales: 24, presupuesto: 5299731798, por_concejal: 220822158, pct_total: 1.61, por_habitante: 9191  },
  { municipio: 'La Matanza',          concejales: 24, presupuesto: 5239562383, por_concejal: 218315099, pct_total: 1.76, por_habitante: 2846  },
  { municipio: 'Vicente López',       concejales: 24, presupuesto: 4920032203, por_concejal: 205001342, pct_total: 1.65, por_habitante: 17430 },
  { municipio: 'Avellaneda',          concejales: 24, presupuesto: 4321775857, por_concejal: 180073994, pct_total: 1.56, por_habitante: 11758 },
  { municipio: 'La Plata',            concejales: 24, presupuesto: 3996257439, por_concejal: 166510727, pct_total: 1.32, por_habitante: 5200  },
  { municipio: 'Bahía Blanca',        concejales: 24, presupuesto: 3793142327, por_concejal: 158047597, pct_total: 1.69, por_habitante: 11270 },
  { municipio: 'Escobar',             concejales: 24, presupuesto: 3590787917, por_concejal: 149616163, pct_total: 1.66, por_habitante: 14002 },
  { municipio: 'Malvinas Argentinas', concejales: 24, presupuesto: 3550000000, por_concejal: 147916667, pct_total: 1.31, por_habitante: 10123 },
  { municipio: 'Quilmes',             concejales: 24, presupuesto: 3468913906, por_concejal: 144538079, pct_total: 1.33, por_habitante: 5477  },
  { municipio: 'Almirante Brown',     concejales: 24, presupuesto: 3215060000, por_concejal: 133960833, pct_total: 1.35, por_habitante: 5497  },
  { municipio: 'Tres de Febrero',     concejales: 24, presupuesto: 2384395484, por_concejal: 99349812,  pct_total: 1.96, por_habitante: 6547  },
  { municipio: 'José Clemente Paz',   concejales: 24, presupuesto: 2730000000, por_concejal: 113750000, pct_total: 1.89, por_habitante: 8349  },
  { municipio: 'Lanús',               concejales: 24, presupuesto: 2112134332, por_concejal: 113005597, pct_total: 1.46, por_habitante: 5880  },
  { municipio: 'Florencio Varela',    concejales: 24, presupuesto: 1877888982, por_concejal: 78245374,  pct_total: 1.73, por_habitante: 3783  },
  { municipio: 'San Miguel',          concejales: 24, presupuesto: 1895749944, por_concejal: 78989581,  pct_total: 1.04, por_habitante: 5765  },
  { municipio: 'Berazategui',         concejales: 24, presupuesto: 1638114921, por_concejal: 68254788,  pct_total: 1.60, por_habitante: 4567  },
  { municipio: 'Morón',               concejales: 24, presupuesto: 1272287898, por_concejal: 53011996,  pct_total: 1.34, por_habitante: 3842  },
  { municipio: 'General Rodríguez',   concejales: 20, presupuesto: 2311000000, por_concejal: 115550000, pct_total: 2.66, por_habitante: 16106 },
  { municipio: 'Luján',               concejales: 20, presupuesto: 1713576000, por_concejal: 85678800,  pct_total: 1.96, por_habitante: 15437 },
  { municipio: 'Tandil',              concejales: 20, presupuesto: 1608910349, por_concejal: 80445517,  pct_total: 1.61, por_habitante: 11052 },
  { municipio: 'Berisso',             concejales: 20, presupuesto: 1495441711, por_concejal: 74772086,  pct_total: 2.58, por_habitante: 14817 },
  { municipio: 'Necochea',            concejales: 20, presupuesto: 1232144548, por_concejal: 61607227,  pct_total: 1.56, por_habitante: 12067 },
  { municipio: 'Ituzaingó',           concejales: 20, presupuesto: 1157010458, por_concejal: 57850523,  pct_total: 1.77, por_habitante: 6420  },
  { municipio: 'Olavarría',           concejales: 20, presupuesto: 1103050000, por_concejal: 55152500,  pct_total: 1.07, por_habitante: 8772  },
  { municipio: 'San Nicolás',         concejales: 20, presupuesto: 742741567,  por_concejal: 37137078,  pct_total: 0.76, por_habitante: 4426  },
  { municipio: 'Junín',               concejales: 20, presupuesto: 580007769,  por_concejal: 29000388,  pct_total: 1.21, por_habitante: 5588  },
  { municipio: 'Maipú',               concejales: 12, presupuesto: 880515000,  por_concejal: 73376250,  pct_total: 1.09, por_habitante: 4013  },
]

function normName(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

const CONCEJALES_DATA = {}
CONCEJALES_RAW.forEach(d => { CONCEJALES_DATA[normName(d.municipio)] = d })

const CONC_MIN = Math.min(...CONCEJALES_RAW.map(d => d.por_habitante))
const CONC_MAX = Math.max(...CONCEJALES_RAW.map(d => d.por_habitante))

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
  Estricto: '#166534',
  Alto:     '#4d7c0f',
  Medio:    '#b45309',
  Bajo:     '#c2410c',
  Nulo:     '#991b1b',
}

function transparenciaFill(indice) {
  const t = Math.max(0, Math.min(1, indice / 100))
  const hue = Math.round(120 * t)
  return `hsl(${hue},70%,42%)`
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
const CADENA_CATEGORIAS = {
  MADUROS: {
    label: 'Maduros', vab: '15,8%', color: '#E8641E', largo: 'up', corto: 'down',
    desc: 'Buena trayectoria de largo plazo pero desaceleración en 2025. Municipios industriales o con base productiva diversificada, de menor volatilidad positiva reciente.',
  },
  LIDERES: {
    label: 'Líderes', vab: '14,3%', color: '#3F9C4A', largo: 'up', corto: 'up',
    desc: 'Crecimiento sólido en el largo plazo y recuperación fuerte en 2025. Perfil exportador agropecuario (maní, soja, trigo) y turístico.',
  },
  REZAGADOS: {
    label: 'Rezagados', vab: '52,2%', color: '#C0453A', largo: 'down', corto: 'down',
    desc: 'Bajo crecimiento en ambos planos. Concentra gran parte del Conurbano bonaerense y economías urbanas de gran tamaño, con inercia estructural y alta ponderación provincial.',
  },
  EMERGENTES: {
    label: 'Emergentes', vab: '17,8%', color: '#3F6FAE', largo: 'down', corto: 'up',
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

function tasaFill(valor) {
  const t = (valor - 0.8) / 2.2
  const h = Math.round(45 * (1 - t))
  const s = Math.round(97 - 24 * t)
  const l = Math.round(55 - 14 * t)
  return `hsl(${h},${s}%,${l}%)`
}

function tasaVialStyle(tasa, state) {
  const w = state !== 'default' ? 1.5 : 0.6
  if (!tasa) {
    return { fillColor: '#cbd5e1', fillOpacity: 0.25, color: '#94a3b8', weight: 0.4, opacity: 0.6 }
  }
  if (tasa.tipo === 'pesos') {
    const fo = state === 'selected' ? 0.82 : state === 'hover' ? 0.65 : 0.45
    return { fillColor: '#0d9488', fillOpacity: fo, color: '#0f766e', weight: w, opacity: 0.9 }
  }
  const base = 0.28 + ((tasa.valor - 0.8) / 2.2) * 0.52
  const fo = state === 'selected' ? 0.90 : state === 'hover' ? Math.min(base + 0.22, 0.92) : base
  return { fillColor: tasaFill(tasa.valor), fillOpacity: fo, color: '#7f1d1d', weight: w, opacity: 0.8 }
}

function concejalesStyle(porHabitante, state) {
  const t = (porHabitante - CONC_MIN) / (CONC_MAX - CONC_MIN)
  const fillOpacity = state === 'hover' ? 0.15 + t * 0.55 + 0.15 : 0.08 + t * 0.62
  return {
    fillColor: '#7b2d00',
    fillOpacity: Math.min(fillOpacity, 0.85),
    color: '#5c2000',
    weight: state === 'hover' ? 1.2 : 0.8,
    opacity: 0.8,
  }
}

const HIDDEN_STYLE = { fillOpacity: 0, color: 'transparent', weight: 0, opacity: 0 }

/* ── Theme configs ──────────────────────────────────────────────────────── */
const THEMES = {
  general: {
    default:  { fillColor: '#1f4795', fillOpacity: 0.15, color: '#1a3d7c', weight: 0.8, opacity: 0.7 },
    hover:    { fillColor: '#1f4795', fillOpacity: 0.38, color: '#1a3d7c', weight: 1.2, opacity: 1   },
    selected: { fillColor: '#0a1628', fillOpacity: 0.65, color: '#93c5fd', weight: 2,   opacity: 1   },
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
  concejales: {
    selected: { fillColor: '#5c2000', fillOpacity: 0.80, color: '#f97316', weight: 2, opacity: 1 },
  },
}

/* ── Temáticas ──────────────────────────────────────────────────────────── */
const TEMAS = [
  { id: 'general',    label: 'Información general' },
  { id: 'produccion', label: 'Índice de producción' },
  { id: 'economia',   label: 'Economía municipal' },
  { id: 'tasas',      label: 'Tasas municipales'   },
  { id: 'tasavial',   label: 'Tasa vial'           },
  { id: 'transparencia', label: 'Transparencia fiscal' },
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
  concejales: 'custom',
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
  const color  =
    ind.good === 'high'
      ? pct > 70 ? '#1a3d7c' : pct > 40 ? '#3d65b2' : '#94a3b8'
      : pct < 10 ? '#1a3d7c' : pct < 25 ? '#f59e0b' : '#ef4444'
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

/* ── Concejales legend ──────────────────────────────────────────────────── */
function ConcejalesLegend() {
  return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-[10px] text-slate-400">Menos gasto</span>
      <div className="flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(to right, rgba(123,45,0,0.1), rgba(123,45,0,0.85))' }} />
      <span className="text-[10px] text-slate-400">Más gasto</span>
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
      if (layer === selectedRef.current) {
        layer.setStyle(THEMES[t]?.selected || THEMES.general.selected)
        return
      }
      if (t === 'concejales') {
        const cd = layer._concejalesData
        layer.setStyle(cd ? concejalesStyle(cd.por_habitante, 'default') : HIDDEN_STYLE)
      } else if (t === 'tasavial') {
        layer.setStyle(tasaVialStyle(layer._tasaData, 'default'))
      } else if (t === 'transparencia') {
        layer.setStyle(transparenciaStyle(layer._transparenciaData, 'default'))
      } else if (t === 'economia') {
        layer.setStyle(cadenaStyle(layer._cadenaCat, 'default'))
      } else {
        layer.setStyle(THEMES[t]?.default || THEMES.general.default)
      }
    })
  }, [])

  useEffect(() => {
    temaRef.current = tema
    // clear selection on tab switch
    if (selectedRef.current) {
      const t = tema
      if (t === 'concejales') {
        const cd = selectedRef.current._concejalesData
        selectedRef.current.setStyle(cd ? concejalesStyle(cd.por_habitante, 'default') : HIDDEN_STYLE)
      } else if (t === 'tasavial') {
        selectedRef.current.setStyle(tasaVialStyle(selectedRef.current._tasaData, 'default'))
      } else if (t === 'transparencia') {
        selectedRef.current.setStyle(transparenciaStyle(selectedRef.current._transparenciaData, 'default'))
      } else if (t === 'economia') {
        selectedRef.current.setStyle(cadenaStyle(selectedRef.current._cadenaCat, 'default'))
      } else {
        selectedRef.current.setStyle(THEMES[t]?.default || THEMES.general.default)
      }
      selectedRef.current = null
    }
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

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { maxZoom: 15, opacity: 0.65 }).addTo(map)

        const IGN_URL =
          'https://wfs.ign.gob.ar/geoserver/ign/ows?service=WFS&version=2.0.0&request=GetFeature' +
          '&typeName=ign:departamento&CQL_FILTER=provincia_id%3D%2706%27' +
          '&outputFormat=application/json&srsName=EPSG:4326'
        const FALLBACK_URL = 'https://raw.githubusercontent.com/agburgos83/partidosBA/main/partidos.geojson'

        let geojson = null
        try {
          const res = await fetch(IGN_URL)
          if (!res.ok) throw new Error('IGN down')
          geojson = await res.json()
        } catch {
          const res = await fetch(FALLBACK_URL)
          geojson = await res.json()
        }
        if (!mounted) return

        const geoLayer = L.geoJSON(geojson, {
          style: () => ({ ...THEMES.general.default }),

          onEachFeature(feature, layer) {
            const p      = feature.properties
            const in1    = p.in1 || p.cde
            const name   = p.nombre || p.nam || ''
            const codigo = in1 ? in1ToCode(in1) : null

            layer._municipiosData    = codigo ? dataByCode[codigo] : null
            layer._concejalesData    = CONCEJALES_DATA[normName(name)] || null
            layer._tasaData          = getTasaVial(name)
            layer._transparenciaData = TRANSPARENCIA_DATA[normName(name)] || null
            layer._cadenaCat         = (codigo && CADENA_BY_CODE[codigo]) || CADENA_CAT[normName(name)] || null
            layer._featureName       = name

            layer.bindTooltip(name, { sticky: true, direction: 'auto', className: 'muni-tooltip' })

            layer.on('mouseover', e => {
              if (e.target === selectedRef.current) return
              const t = temaRef.current
              if (t === 'concejales') {
                const cd = e.target._concejalesData
                if (cd) e.target.setStyle(concejalesStyle(cd.por_habitante, 'hover'))
              } else if (t === 'tasavial') {
                e.target.setStyle(tasaVialStyle(e.target._tasaData, 'hover'))
              } else if (t === 'transparencia') {
                e.target.setStyle(transparenciaStyle(e.target._transparenciaData, 'hover'))
              } else if (t === 'economia') {
                e.target.setStyle(cadenaStyle(e.target._cadenaCat, 'hover'))
              } else {
                e.target.setStyle(THEMES[t]?.hover || THEMES.general.hover)
              }
            })

            layer.on('mouseout', e => {
              if (e.target === selectedRef.current) return
              const t = temaRef.current
              if (t === 'concejales') {
                const cd = e.target._concejalesData
                e.target.setStyle(cd ? concejalesStyle(cd.por_habitante, 'default') : HIDDEN_STYLE)
              } else if (t === 'tasavial') {
                e.target.setStyle(tasaVialStyle(e.target._tasaData, 'default'))
              } else if (t === 'transparencia') {
                e.target.setStyle(transparenciaStyle(e.target._transparenciaData, 'default'))
              } else if (t === 'economia') {
                e.target.setStyle(cadenaStyle(e.target._cadenaCat, 'default'))
              } else {
                e.target.setStyle(THEMES[t]?.default || THEMES.general.default)
              }
            })

            layer.on('click', () => {
              const t  = temaRef.current
              const cd = layer._concejalesData
              // In concejales mode, ignore clicks on hidden municipalities
              if (t === 'concejales' && !cd) return

              if (selectedRef.current && selectedRef.current !== layer) {
                const prev = selectedRef.current
                const prevCd = prev._concejalesData
                if (t === 'concejales') {
                  prev.setStyle(prevCd ? concejalesStyle(prevCd.por_habitante, 'default') : HIDDEN_STYLE)
                } else if (t === 'tasavial') {
                  prev.setStyle(tasaVialStyle(prev._tasaData, 'default'))
                } else if (t === 'transparencia') {
                  prev.setStyle(transparenciaStyle(prev._transparenciaData, 'default'))
                } else if (t === 'economia') {
                  prev.setStyle(cadenaStyle(prev._cadenaCat, 'default'))
                } else {
                  prev.setStyle(THEMES[t]?.default || THEMES.general.default)
                }
              }

              layer.setStyle(THEMES[t]?.selected || THEMES.general.selected)
              selectedRef.current = layer

              const muniData = layer._municipiosData
              setSelected({
                nombre: name,
                ...(muniData || {}),
                _concejales: cd || null,
                _tasa: layer._tasaData || null,
                _transparencia: layer._transparenciaData || null,
                _cadena: layer._cadenaCat || null,
                _noData: t !== 'tasavial' && t !== 'transparencia' && t !== 'economia' && !muniData && !cd,
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
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-6">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#3d65b2" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">Seleccioná un municipio</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {tema === 'concejales'
              ? 'Solo los municipios coloreados tienen datos. Hacé clic para ver el detalle.'
              : 'Hacé clic sobre cualquier partido del mapa para ver sus indicadores.'}
          </p>
        </div>
      )
    }

    if (selected._noData) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-6">
          <p className="text-base font-bold text-[#0a1628]">{selected.nombre}</p>
          <p className="text-xs text-slate-400">Sin datos disponibles para este partido.</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-bold text-[#0a1628] leading-tight">{selected.nombre}</h3>
          {tema !== 'concejales' && tema !== 'transparencia' && tema !== 'economia' && (
            <div className="flex flex-wrap gap-4 mt-3">
              {selected.poblacion && (
                <div>
                  <p className="text-xl font-bold text-brand-600 leading-none">{selected.poblacion.toLocaleString('es-AR')}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Habitantes</p>
                </div>
              )}
              {selected.hogares && (
                <div>
                  <p className="text-xl font-bold text-brand-600 leading-none">{selected.hogares.toLocaleString('es-AR')}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Hogares</p>
                </div>
              )}
              {selected.superficie_km2 != null && (
                <div>
                  <p className="text-xl font-bold text-brand-600 leading-none">{selected.superficie_km2.toLocaleString('es-AR')}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">km²</p>
                </div>
              )}
            </div>
          )}
          {tema === 'concejales' && selected._concejales && (
            <div className="flex flex-wrap gap-4 mt-3">
              <div>
                <p className="text-xl font-bold text-orange-600 leading-none">{selected._concejales.concejales}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Concejales</p>
              </div>
              <div>
                <p className="text-xl font-bold text-orange-600 leading-none">{selected._concejales.pct_total}%</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Del presupuesto</p>
              </div>
            </div>
          )}
          {tema === 'transparencia' && selected._transparencia && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div>
                <p className="text-2xl font-bold leading-none" style={{ color: transparenciaFill(selected._transparencia.indice) }}>
                  {selected._transparencia.indice}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Índice (0–100)</p>
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
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">del VAB provincial</p>
                </div>
              </div>
              {selected.poblacion && (
                <p className="text-xs text-slate-400 mt-2">{selected.poblacion.toLocaleString('es-AR')} habitantes</p>
              )}
            </div>
          )}
        </div>

        {/* Tema label */}
        <div className="px-5 pt-3 pb-1 shrink-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {TEMAS.find(t => t.id === tema)?.label}
          </p>
        </div>

        {/* Body */}
        {indicators === 'tasa' ? (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {selected._tasa ? (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className={`text-3xl font-bold leading-none ${selected._tasa.tipo === 'pesos' ? 'text-teal-700' : 'text-red-700'}`}>
                    {selected._tasa.tipo === 'pct'
                      ? `${selected._tasa.valor.toFixed(2).replace('.', ',')}%`
                      : selected._tasa.label}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">
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
              <p className="text-xs text-slate-400">Sin datos de tasa vial para este partido en el relevamiento 2025.</p>
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
              <p className="text-xs text-slate-400">Sin datos de transparencia fiscal para este partido.</p>
            )}
          </div>
        ) : indicators === 'economia' ? (
          /* Economía municipal detail */
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {selected._cadena ? (() => {
              const c = CADENA_CATEGORIAS[selected._cadena]
              const arrow = dir => (
                <span className="text-xs font-semibold flex items-center gap-1" style={{ color: dir === 'up' ? '#15803d' : '#b91c1c' }}>
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
                  <p className="text-[11px] text-slate-400 leading-snug border-t border-slate-100 pt-3">
                    Fuente: "Cadenas Productivas en los Municipios de la Provincia de Buenos Aires 2016/2025" — A. Lodola, Comisión de Asuntos Municipales, Senado PBA.
                  </p>
                </div>
              )
            })() : (
              <p className="text-xs text-slate-400">Sin datos de clasificación económica para este partido.</p>
            )}
          </div>
        ) : indicators === 'custom' ? (
          /* Concejales detail */
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {selected._concejales ? (() => {
              const cd = selected._concejales
              const rows = [
                { label: 'Presupuesto total concejo',  value: `$\u00A0${cd.presupuesto.toLocaleString('es-AR')}` },
                { label: 'Gasto por concejal',         value: `$\u00A0${cd.por_concejal.toLocaleString('es-AR')}` },
                { label: 'Gasto por habitante',        value: `$\u00A0${cd.por_habitante.toLocaleString('es-AR')}` },
                { label: '% sobre presupuesto total',  value: `${cd.pct_total}%` },
              ]
              const t = (cd.por_habitante - CONC_MIN) / (CONC_MAX - CONC_MIN)
              return (
                <div className="flex flex-col gap-4">
                  {rows.map(r => (
                    <div key={r.label}>
                      <p className="text-xs text-slate-400 mb-0.5">{r.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{r.value}</p>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-2">Gasto por habitante vs. provincia</p>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${t * 100}%`, background: 'linear-gradient(to right, rgba(123,45,0,0.4), rgba(123,45,0,0.9))' }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-slate-400">${CONC_MIN.toLocaleString('es-AR')}</span>
                      <span className="text-[10px] text-slate-400">${CONC_MAX.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
              )
            })() : (
              <p className="text-xs text-slate-400">Sin datos de concejales para este partido.</p>
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
          <div className="flex items-center border-b-2 border-[#0a1628] pb-3 mb-5">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0a1628] leading-none tracking-tight">
              Atlas Municipal
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {TEMAS.map(t => {
              const colors = {
                general:    tema === t.id ? 'bg-[#0a1628] text-white border-[#0a1628]'  : 'bg-white text-slate-500 border-slate-200 hover:border-[#1a3d7c] hover:text-[#1a3d7c]',
                produccion: tema === t.id ? 'bg-[#063d2f] text-white border-[#063d2f]'  : 'bg-white text-slate-500 border-slate-200 hover:border-[#0a5240] hover:text-[#0a5240]',
                economia:   tema === t.id ? 'bg-[#334155] text-white border-[#334155]'  : 'bg-white text-slate-500 border-slate-200 hover:border-[#475569] hover:text-[#475569]',
                tasas:      tema === t.id ? 'bg-[#4c1d95] text-white border-[#4c1d95]'  : 'bg-white text-slate-500 border-slate-200 hover:border-[#6d28d9] hover:text-[#6d28d9]',
                tasavial:   tema === t.id ? 'bg-[#991b1b] text-white border-[#991b1b]'  : 'bg-white text-slate-500 border-slate-200 hover:border-[#7f1d1d] hover:text-[#7f1d1d]',
                transparencia: tema === t.id ? 'bg-[#14532d] text-white border-[#14532d]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#15803d] hover:text-[#15803d]',
                concejales: tema === t.id ? 'bg-[#7b2d00] text-white border-[#7b2d00]'  : 'bg-white text-slate-500 border-slate-200 hover:border-[#5c2000] hover:text-[#5c2000]',
              }
              return (
                <button
                  key={t.id}
                  onClick={() => setTema(t.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${colors[t.id]}`}
                >
                  {t.label}
                  {t.id === 'tasas' && (
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider opacity-60">próx.</span>
                  )}
                </button>
              )
            })}
          </div>

          {(tema === 'general' || tema === 'produccion') && (
            <p className="text-[11px] text-slate-400 mt-2">
              Fuente: CAF - Banco de Desarrollo de América Latina y el Caribe
            </p>
          )}
          {tema === 'tasavial' && (
            <>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-shrink-0 w-20 h-2 rounded-full" style={{ background: 'linear-gradient(to right, hsl(45,97%,55%), hsl(22,88%,51%), hsl(0,73%,41%))' }} />
                  <span className="text-[10px] text-slate-400">0,8% → 3%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: '#0d9488', opacity: 0.7 }} />
                  <span className="text-[10px] text-slate-400">Pesos fijos/l</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm shrink-0 bg-slate-300 opacity-60" />
                  <span className="text-[10px] text-slate-400">Sin datos</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Fuente: Ministerio de Economía de la Nación - Subsecretaría de Coordinación Fiscal Provincial, mar. 2025
              </p>
            </>
          )}
          {tema === 'transparencia' && (
            <>
              <div className="flex items-center gap-1.5 mt-3">
                <div className="flex-shrink-0 w-20 h-2 rounded-full" style={{ background: 'linear-gradient(to right, hsl(0,70%,42%), hsl(60,70%,42%), hsl(120,70%,42%))' }} />
                <span className="text-[10px] text-slate-400">Índice 0 (Nulo) → 100 (Estricto)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
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
              <p className="text-[11px] text-slate-400 mt-1.5">
                Fuente: A. Lodola, "Cadenas Productivas en los Municipios de la PBA 2016/2025" - Comisión de Asuntos Municipales, Senado PBA
              </p>
            </>
          )}
          {tema === 'concejales' && (
            <>
              <ConcejalesLegend />
              <p className="text-[11px] text-slate-400 mt-2">
                Fuente: Fundación Libertad
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-5 min-h-[400px] lg:min-h-[520px]">

          {/* Map */}
          <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 min-h-[320px] sm:min-h-[500px]">
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

          {/* Panel */}
          <div className="lg:w-80 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <PanelContent />
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
