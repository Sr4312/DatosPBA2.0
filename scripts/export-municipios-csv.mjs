import { MUNICIPIOS_DATA } from '../src/lib/municipiosData.js';
import { writeFileSync } from 'node:fs';

const cols = [
  'codigo','nombre','poblacion','superficie_km2','densidad_pobl','urbano',
  'analfabetismo','fin_secundaria_inmediata','fin_secundaria_adultos',
  'participacion_mujeres','agua_mejorada','saneamiento_mejorado','electricidad',
  'desempleo_adulto','desempleo_joven','tics_internet','tics_celular','hogares'
];

const esc = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows = [cols.join(',')];
for (const m of MUNICIPIOS_DATA) rows.push(cols.map(c => esc(m[c])).join(','));

writeFileSync('public/downloads/municipios_pba_densidad.csv', rows.join('\n'), 'utf8');
console.log(`Wrote ${MUNICIPIOS_DATA.length} rows`);
