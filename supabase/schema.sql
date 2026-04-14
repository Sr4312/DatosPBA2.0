-- ============================================================
-- DatosPBA – Schema + Seed
-- Pegar y ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ── Tablas ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS informes (
  id               text PRIMARY KEY,
  titulo           text NOT NULL,
  bajada           text,
  fecha            text,
  fecha_orden      date,
  tema             text,
  municipios       jsonb DEFAULT '[]',
  cuerpo           jsonb DEFAULT '[]',
  insights         jsonb DEFAULT '[]',
  url              text,
  imagen           text,
  custom           boolean DEFAULT false,
  fuentes          jsonb DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS datasets (
  id                   text PRIMARY KEY,
  nombre               text NOT NULL,
  descripcion          text,
  formato              text,
  cobertura            text,
  variables            integer,
  registros            integer,
  fecha_actualizacion  text,
  fecha_orden          date,
  preview              jsonb
);

CREATE TABLE IF NOT EXISTS hilos (
  id          text PRIMARY KEY,
  titulo      text NOT NULL,
  resumen     text,
  fecha       text,
  fecha_orden date,
  tema        text,
  plataforma  text,
  tags        jsonb DEFAULT '[]',
  url         text,
  imagen      text
);

CREATE TABLE IF NOT EXISTS reportes_rapidos (
  id          text PRIMARY KEY,
  titulo      text NOT NULL,
  dato        text,
  descripcion text,
  fecha       text,
  fecha_orden date,
  tendencia   text,
  variacion   text
);

CREATE TABLE IF NOT EXISTS visualizaciones (
  id           text PRIMARY KEY,
  titulo       text NOT NULL,
  tema         text,
  tipo         text,
  fuente       text,
  fecha        text,
  fecha_orden  date,
  informe_url  text,
  chart_data   jsonb,
  chart_options jsonb,
  table_data   jsonb
);

-- ── RLS: permitir lectura pública ───────────────────────────

ALTER TABLE informes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE hilos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_rapidos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizaciones   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON informes         FOR SELECT USING (true);
CREATE POLICY "public read" ON datasets         FOR SELECT USING (true);
CREATE POLICY "public read" ON hilos            FOR SELECT USING (true);
CREATE POLICY "public read" ON reportes_rapidos FOR SELECT USING (true);
CREATE POLICY "public read" ON visualizaciones  FOR SELECT USING (true);

-- ── Seed: informes ──────────────────────────────────────────

INSERT INTO informes VALUES (
  'caf-estado-municipal-pba',
  'Dos Buenos Aires: el estado que trabaja y el estado que pesa',
  'El Atlas de CAF revela una brecha de hasta 9 veces en empleo público entre municipios bonaerenses. Vicente López (4,4%) y Tres de Febrero (4,8%) frente a Alberti (38%) y Chaves (36,5%). Más estado no es mejor estado.',
  '7 abr. 2026', '2026-04-07', 'Fiscal',
  '["Vicente López","Tres de Febrero","Berazategui","Almirante Brown","Ayacucho","Chaves","Alberti"]',
  $$["El Atlas de Gobiernos Locales de CAF permite, por primera vez, comparar de forma sistemática el tamaño del Estado municipal en la Provincia de Buenos Aires. El indicador clave: el porcentaje de la fuerza laboral de cada municipio que trabaja en la administración pública local.","Los datos revelan dos modelos radicalmente distintos dentro de la misma provincia. En Vicente López, solo el 4,4% de los empleados trabaja en el estado municipal; en Tres de Febrero, el 4,8%. En el otro extremo, Alberti alcanza el 38%, Chaves el 36,5% y Ayacucho el 35,7%.","La correlación es directa: más empleo en la administración pública implica mayor carga tributaria sobre los vecinos y menor espacio para el sector privado. El modelo de Estado es una decisión política, pero sus consecuencias fiscales las pagan los ciudadanos."]$$::jsonb,
  $$["Brecha de 9x: Vicente López 4,4% vs. Alberti 38% de empleo en administración pública.","Los municipios con estado liviano muestran mayor dinamismo del sector privado.","La Provincia de Buenos Aires alberga los dos extremos del modelo de gobierno local argentino."]$$::jsonb,
  '/informes/caf-estado-municipal-pba', null, true
);

INSERT INTO informes VALUES (
  'kpmg-iibb-2025',
  'El peso fiscal que encarece cada precio: IIBB, provincias y el consumidor que paga la cuenta',
  'El Ingresos Brutos consolida su liderazgo como el impuesto que más encarece los precios en la Argentina. El 84% de las empresas acumula saldos a favor inmovilizados y el 91% de la opinión pública confirma que el gravamen lo paga el consumidor final.',
  '7 abr. 2026', '2026-04-07', 'Fiscal',
  '[]',
  $$["En la edición 2025 de la encuesta de KPMG a empresas medianas y grandes, el Impuesto sobre los Ingresos Brutos volvió a dominar el podio de los gravámenes que más encarecen los precios, superando el 60% de las menciones por primera vez. La brecha respecto a los demás impuestos es elocuente y persistente en el tiempo.","Si una empresa pudiera diferenciar sus precios por provincia según la carga fiscal, la Provincia de Buenos Aires encabezaría el ranking de jurisdicciones más gravosas, posición que mantiene en todas las ediciones de la encuesta. Misiones, CABA, Córdoba y Tucumán completan el podio, con alternancia frecuente de Santa Fe.","El 84% de los consultados posee saldos a favor de impuestos provinciales - un 2% más que el año anterior y un 4% más que en 2023. La multiplicidad de regímenes de recaudación, muchas veces duplicados entre transacciones y acreditaciones bancarias, ha generalizado una inmovilización financiera que es altamente perjudicial y hasta confiscatoria para las empresas privadas.","En una consulta abierta realizada en LinkedIn, el 91% de la opinión pública confirmó que el Ingresos Brutos no lo paga la empresa: se traslada acumulativamente al consumidor final. Es un impuesto en cascada que encarece todo, castiga el trabajo y complica la producción."]$$::jsonb,
  $$["IIBB suma el 61% de las menciones al impuesto que más encarece precios, vs. 54% el año anterior.","Provincia de Buenos Aires: #1 en voracidad fiscal en todas las ediciones de la encuesta.","84% de las empresas acumula saldos a favor de IIBB provincial - inmovilización financiera generalizada.","91% de la opinión pública confirma que el IIBB se traslada al consumidor final."]$$::jsonb,
  '/informes/kpmg-iibb-2025', null, true
);

INSERT INTO informes VALUES (
  'uipba-presion-tributaria-2024',
  'Buenos Aires castiga al que produce: la presión tributaria más alta entre las grandes provincias',
  'Un informe de la Unión Industrial de la Provincia de Buenos Aires muestra que la carga fiscal bonaerense supera a Córdoba y Santa Fe en casi todos los sectores. El efecto cascada del Ingresos Brutos lo explica.',
  '7 abr. 2026', '2026-04-07', 'Fiscal',
  '[]',
  $$["La presión tributaria teórica mide la recaudación en relación al Valor Agregado Bruto generado por cada sector. Cuando ese ratio es alto, el fisco se queda con una porción desproporcionada del valor creado. El informe de la UIPBA construyó este indicador para Buenos Aires, Santa Fe y Córdoba en 2024, y el resultado es contundente: Buenos Aires encabeza con un promedio de 10,3%, contra 9,0% de Córdoba y 8,7% de Santa Fe.","La diferencia no es marginal. En la industria manufacturera, la presión en PBA (4,7%) prácticamente duplica a la de Santa Fe (3,6%) y Córdoba (3,5%). En el sector eléctrico y de gas (EGA), la brecha es aún más pronunciada: PBA carga 10,1% contra 6,7% en ambas vecinas. En intermediación financiera, PBA llega a 24,6% versus 14,3% de Córdoba, una diferencia de más de 10 puntos porcentuales.","El principal responsable de esta carga diferencial es el Ingresos Brutos. A diferencia del IVA -que es un impuesto al valor agregado y no se acumula en la cadena-, el IIBB grava cada transacción en cada eslabón del proceso productivo. Este efecto cascada hace que el mismo bien tribute múltiples veces antes de llegar al consumidor final, generando una presión que se multiplica con la longitud del proceso.","Más IIBB no solo significa más costo para la empresa: significa precios más altos para los consumidores, menor competitividad exportadora y una señal nítida de que producir en Buenos Aires es más caro que hacerlo en las provincias vecinas. El dato no es ideológico: es una medición objetiva de cuánto le extrae el fisco a cada peso de valor que genera la economía bonaerense. Menos IIBB, más libertad y más trabajo."]$$::jsonb,
  $$["PBA tiene la mayor presión tributaria promedio: 10,3% vs. 9,0% de Córdoba y 8,7% de Santa Fe.","En industria, PBA cobra 4,7%: 34% más que Córdoba (3,5%) y 31% más que Santa Fe (3,6%).","En EGA (electricidad, gas y agua), PBA duplica a sus vecinas: 10,1% vs. 6,7%.","El efecto cascada del IIBB es el principal driver: grava cada eslabón de la cadena productiva."]$$::jsonb,
  '/informes/uipba-presion-tributaria-2024', null, false
);

INSERT INTO informes VALUES (
  'exportaciones-pba-2025',
  'Buenos Aires exportó USD 31.684 millones en 2025: 1 de cada 3 dólares del país sale de la Provincia',
  'Las exportaciones bonaerenses crecieron 7,3% interanual, impulsadas por la industria y el agro, consolidando a la Provincia como el principal motor del comercio exterior argentino.',
  '7 abr. 2026', '2026-04-07', 'Economía',
  '[]',
  $$["En un año donde las exportaciones argentinas crecieron 9,3%, la Provincia de Buenos Aires volvió a demostrar que su economía es el ancla del comercio exterior del país. Con USD 31.684 millones exportados durante 2025, la Provincia consolidó su posición como el principal exportador del territorio nacional, representando el 36,4% del total: prácticamente 1 de cada 3 dólares que Argentina vende al mundo proviene de suelo bonaerense.","El resultado positivo no responde a un sector único, sino a la confluencia de dos grandes motores. Las Manufacturas de Origen Industrial (MOI) encabezaron la tabla con USD 11.664 millones (+1,6%), donde el material de transporte terrestre aportó USD 6.801 millones, reflejando la solidez del entramado industrial bonaerense. Las Manufacturas de Origen Agropecuario (MOA) alcanzaron los USD 9.867 millones (+4,5%), y los Productos Primarios (PP) treparon a USD 6.920 millones con un salto de 24,9%. El dato más llamativo del año: semillas y frutos oleaginosos creció 117,1% interanual.","El 30,4% de las exportaciones bonaerenses tuvieron como destino el Mercosur. Brasil absorbió la mayor parte con USD 7.780 millones, confirmando la integración regional como eje estructural del comercio exterior de la Provincia.","La serie histórica 2015-2025 muestra que, tras el pico de 2022, las exportaciones de la Provincia encontraron un nuevo piso más alto. El rebote de 2025 consolida una tendencia de recuperación sostenida que supera los niveles prepandemia. Cuando la Provincia crece, crece la Argentina."]$$::jsonb,
  $$["USD 31.684 millones exportados en 2025: un incremento de 7,3% respecto a 2024.","La Provincia representa el 36,4% de las exportaciones nacionales: 1 de cada 3 dólares.","Las MOI lideraron con USD 11.664 M; el material de transporte terrestre sumó USD 6.801 M.","Semillas y frutos oleaginosos registró un salto de 117,1% interanual."]$$::jsonb,
  '/informes/exportaciones-pba-2025', null, false
);

-- ── Seed: datasets ──────────────────────────────────────────

INSERT INTO datasets VALUES (
  'eph-pba',
  'EPH - Mercado laboral PBA',
  'Tasas de empleo, desempleo y actividad por aglomerado urbano de la Provincia de Buenos Aires.',
  'CSV', 'Conurbano y grandes ciudades', 24, 48320, 'Dic. 2025', '2025-12-01',
  '{"columns":["Aglomerado","Año","Trim.","T. empleo","T. desempleo","T. actividad"],"rows":[["GBA",2025,3,"42.1 %","11.1 %","47.3 %"],["La Matanza",2025,3,"38.4 %","12.3 %","43.8 %"],["Quilmes",2025,3,"40.1 %","9.8 %","44.5 %"],["Lomas de Zamora",2025,3,"39.6 %","11.2 %","44.6 %"],["Gral. San Martín",2025,3,"41.2 %","10.5 %","46.0 %"],["Lanús",2025,3,"41.8 %","9.1 %","45.9 %"],["Florencio Varela",2025,3,"37.2 %","14.2 %","43.3 %"]]}'::jsonb
);

INSERT INTO datasets VALUES (
  'presupuesto-municipios',
  'Presupuesto ejecutado - Municipios PBA',
  'Ejecución presupuestaria mensual de los 135 municipios de la Provincia de Buenos Aires.',
  'XLSX', '135 municipios', 18, 12150, 'Nov. 2025', '2025-11-01',
  '{"columns":["Municipio","Año","Mes","Finalidad","Créd. orig.","Ejecutado","% ejec."],"rows":[["La Plata",2025,"Ene","Educación","$2.450 M","$2.318 M","94.6 %"],["La Plata",2025,"Ene","Salud","$1.820 M","$1.674 M","92.0 %"],["La Matanza",2025,"Ene","Educación","$3.120 M","$2.987 M","95.7 %"],["La Matanza",2025,"Ene","Infraestructura","$980 M","$841 M","85.8 %"],["Quilmes",2025,"Ene","Seguridad","$640 M","$618 M","96.6 %"],["Morón",2025,"Ene","Educación","$1.180 M","$1.102 M","93.4 %"],["Tigre",2025,"Ene","Salud","$890 M","$814 M","91.5 %"]]}'::jsonb
);

INSERT INTO datasets VALUES (
  'cobertura-salud',
  'Cobertura de salud por partido',
  'Población sin cobertura de salud (solo pública) por partido según EPH y Censo 2022.',
  'CSV', '135 partidos', 12, 8900, 'Oct. 2025', '2025-10-01',
  '{"columns":["Partido","Población","Con obra social","Solo pública","% solo pública"],"rows":[["Florencio Varela","493.782","305.128","188.654","38.1 %"],["Presidente Perón","89.311","53.578","35.733","36.4 %"],["Merlo","728.524","473.340","255.184","34.9 %"],["Ezeiza","243.075","161.081","81.994","33.7 %"],["Berazategui","358.784","243.218","115.566","32.1 %"],["Malvinas Argentinas","350.490","239.334","111.156","31.8 %"],["José C. Paz","327.038","224.826","102.212","31.2 %"]]}'::jsonb
);

INSERT INTO datasets VALUES (
  'deuda-municipal',
  'Deuda pública municipal - PBA',
  'Stock de deuda pública de los municipios bonaerenses con desagregación por acreedor.',
  'JSON', '135 municipios', 9, 3240, 'Sep. 2025', '2025-09-01',
  '{"columns":["Municipio","Acreedor","Instrumento","Stock ($)","Per cápita ($)","% ingr."],"rows":[["Mar del Plata","Provincia PBA","Préstamo","$18.400 M","$27.600","42.0 %"],["La Matanza","Banca privada","Obligación","$14.200 M","$7.700","29.1 %"],["Quilmes","Provincia PBA","Préstamo","$9.800 M","$15.500","31.4 %"],["Lanús","Nación","Préstamo","$8.300 M","$14.100","27.8 %"],["Lomas de Zamora","Provincia PBA","Préstamo","$7.600 M","$11.000","24.3 %"],["La Plata","Banca privada","Obligación","$6.900 M","$8.900","18.6 %"],["Moreno","Provincia PBA","Préstamo","$5.400 M","$9.300","22.1 %"]]}'::jsonb
);

INSERT INTO datasets VALUES (
  'matricula-educativa',
  'Matrícula educativa - Nivel inicial y primario',
  'Matrícula por establecimiento, nivel, sector y localidad para la PBA.',
  'CSV', 'PBA completa', 31, 124800, 'Mar. 2025', '2025-03-01',
  '{"columns":["CUE","Establecimiento","Nivel","Sector","Partido","Matríc. 2024","Var. vs 2019"],"rows":[["060001","E.P. N° 1 Sarmiento","Primario","Estatal","La Plata","412","−3.7 %"],["060002","Jardín N° 901","Inicial","Estatal","La Plata","178","−1.1 %"],["060045","Colegio San José","Primario","Privado","La Plata","534","+0.8 %"],["180312","E.P. N° 12","Primario","Estatal","Florencio Varela","389","−6.2 %"],["180415","Jardín N° 914","Inicial","Estatal","Florencio Varela","152","−4.8 %"],["260789","E.P. N° 23 San Martín","Primario","Estatal","Quilmes","467","−5.1 %"],["260801","Instituto Sagrado Corazón","Primario","Privado","Quilmes","598","+1.2 %"]]}'::jsonb
);

-- ── Seed: hilos ─────────────────────────────────────────────

INSERT INTO hilos VALUES (
  'h-exportaciones-pba-2025',
  '1 de cada 3 dólares que Argentina exporta sale de la Provincia de Buenos Aires',
  'En 2025, PBA exportó USD 31.684 millones (+7,3%). Las MOI lideraron con USD 11.664 M, semillas oleaginosas creció 117,1% y el 30,4% fue al Mercosur. Industria y agro empujando juntos.',
  '7 abr. 2026', '2026-04-07', 'Economía', 'Twitter/X',
  '["exportaciones","PBA","economía","INDEC"]',
  'https://x.com/DatosPBA/status/2041517166105710730?s=20', null
);

-- ── Seed: reportes_rapidos ──────────────────────────────────

INSERT INTO reportes_rapidos VALUES (
  'rr-desempleo-q3',
  'Desempleo GBA - 4to trim. 2025',
  '8,6%',
  'Tasa de desocupación del Gran Buenos Aires en el cuarto trimestre de 2025, 1,5 pp por encima del mismo período de 2024. Los Partidos del GBA registraron 9,5%.',
  'Mar. 2026', '2026-03-18', 'sube', '+1,5 pp'
);

INSERT INTO reportes_rapidos VALUES (
  'rr-informalidad',
  'Empleo informal - Conurbano',
  '42,3%',
  'Porcentaje de trabajadores informales en el Conurbano Bonaerense según EPH T3 2025. Sin mejora significativa respecto a 2019.',
  'Nov. 2025', '2025-11-01', 'sube', '+1,2 pp'
);

INSERT INTO reportes_rapidos VALUES (
  'rr-gasto-seguridad',
  'Gasto en seguridad - Presupuesto 2026',
  '+28%',
  'Variación real del gasto en seguridad en el presupuesto provincial 2026 respecto al ejecutado 2025.',
  'Nov. 2025', '2025-11-01', 'sube', '+28% real'
);

INSERT INTO reportes_rapidos VALUES (
  'rr-cobertura-salud',
  'Sin cobertura de salud - Tercer cordón',
  '29,4%',
  'Proporción de residentes del tercer cordón del Conurbano que dependen exclusivamente del sistema de salud público.',
  'Oct. 2025', '2025-10-01', 'sube', '+1,8 pp'
);

INSERT INTO reportes_rapidos VALUES (
  'rr-matricula-secundario',
  'Caída de matrícula secundaria',
  '−4,2%',
  'Variación de la matrícula en el nivel secundario bonaerense entre 2019 y 2024. El tercer cordón concentra el 70% de la caída.',
  'Sep. 2025', '2025-09-01', 'baja', '−4,2% vs. 2019'
);

INSERT INTO reportes_rapidos VALUES (
  'rr-deuda-municipal',
  'Deuda municipal per cápita promedio',
  '$48.200',
  'Stock promedio de deuda pública per cápita de los 135 municipios bonaerenses a precios de octubre 2025.',
  'Sep. 2025', '2025-09-01', 'sube', '+$4.200'
);

-- ── Seed: visualizaciones ───────────────────────────────────

INSERT INTO visualizaciones VALUES (
  'v-representacion-diputados',
  'Representación en Cámara de Diputados - Ley 22.847 vs. propuesta 180.000 hab./dip.',
  'Instituciones y gobernanza', 'tabla',
  'INDEC Censo 2022',
  'Mar. 2026', '2026-03-01', null,
  null, null,
  '{"summary":[{"label":"Cifra actual Ley 22.847 (1983)","value":"161.000"},{"label":"Propuesta Ley Ómnibus","value":"180.000","highlight":true},{"label":"Total diputados actual","value":"257"}],"highlight":{"label":"LA GRAN PERJUDICADA: PROVINCIA DE BUENOS AIRES","stats":[{"label":"Diputados actuales","value":"70"},{"label":"Ideal con 180.000 hab/dip","value":"98","color":"blue"},{"label":"Bancas que le faltan","value":"−28","color":"red"},{"label":"Hab./dip. actual","value":"250.986"},{"label":"Distorsión","value":"+39,4%","note":"más hab. por banca"}]},"columns":["Provincia","Hab. Censo 2022","Dip. actuales","Hab./dip. actual","Ideal (180k)","Distorsión"],"rows":[{"provincia":"Buenos Aires","hab":17569053,"dip":70,"habDip":250986,"ideal":98,"distVal":39.4},{"provincia":"Córdoba","hab":3978984,"dip":18,"habDip":221055,"ideal":22,"distVal":22.8},{"provincia":"Santa Fe","hab":3544908,"dip":19,"habDip":186574,"ideal":20,"distVal":3.7},{"provincia":"CABA","hab":3120612,"dip":25,"habDip":124824,"ideal":17,"distVal":-30.7},{"provincia":"Mendoza","hab":2014533,"dip":10,"habDip":201453,"ideal":11,"distVal":11.9},{"provincia":"Tucumán","hab":1703186,"dip":9,"habDip":189243,"ideal":9,"distVal":5.1},{"provincia":"Salta","hab":1440672,"dip":7,"habDip":205810,"ideal":8,"distVal":14.3},{"provincia":"Entre Ríos","hab":1426426,"dip":9,"habDip":158492,"ideal":8,"distVal":-11.9},{"provincia":"Misiones","hab":1280960,"dip":7,"habDip":182994,"ideal":7,"distVal":1.7},{"provincia":"Corrientes","hab":1197553,"dip":7,"habDip":171079,"ideal":7,"distVal":-5.0},{"provincia":"Chaco","hab":1142963,"dip":7,"habDip":163280,"ideal":6,"distVal":-9.3},{"provincia":"Santiago del Est.","hab":1054028,"dip":7,"habDip":150575,"ideal":6,"distVal":-16.3},{"provincia":"San Juan","hab":818234,"dip":6,"habDip":136372,"ideal":5,"distVal":-24.2},{"provincia":"Jujuy","hab":797955,"dip":5,"habDip":159591,"ideal":4,"distVal":-11.3},{"provincia":"Río Negro","hab":762067,"dip":6,"habDip":127011,"ideal":4,"distVal":-29.4},{"provincia":"Neuquén","hab":726590,"dip":5,"habDip":145318,"ideal":4,"distVal":-19.3},{"provincia":"Formosa","hab":606041,"dip":5,"habDip":121208,"ideal":3,"distVal":-32.7},{"provincia":"Chubut","hab":603120,"dip":5,"habDip":120624,"ideal":3,"distVal":-33.0},{"provincia":"San Luis","hab":540905,"dip":5,"habDip":108181,"ideal":3,"distVal":-39.9},{"provincia":"Catamarca","hab":429556,"dip":5,"habDip":85911,"ideal":2,"distVal":-52.3},{"provincia":"La Rioja","hab":384607,"dip":5,"habDip":76921,"ideal":2,"distVal":-57.3},{"provincia":"La Pampa","hab":366022,"dip":5,"habDip":73204,"ideal":2,"distVal":-59.3},{"provincia":"Santa Cruz","hab":333473,"dip":5,"habDip":66695,"ideal":2,"distVal":-62.9},{"provincia":"Tierra del Fuego","hab":190641,"dip":5,"habDip":38128,"ideal":1,"distVal":-78.8}],"total":{"hab":46033089,"dip":257,"habDip":179194,"ideal":254},"footer":"* Fórmula ideal: floor(hab/180.000) + 1 si fracción ≥ 90.000, mínimo 1. Sin piso ni bonus. Distorsión = (hab/dip.actual − 180.000) / 180.000 × 100. Positivo = subrepresentada, negativo = sobrerrepresentada. Fuente: INDEC Censo 2022."}'::jsonb
);

INSERT INTO visualizaciones VALUES (
  'v-desempleo-conurbano',
  'Tasa de desempleo por partido del Conurbano - 3er trim. 2025 (%)',
  'Economía', 'bar',
  'EPH - INDEC',
  'Nov. 2025', '2025-11-15', '/informes/desempleo-conurbano-2025',
  '{"labels":["La Matanza","Quilmes","Lomas de Zamora","Gral. San Martín","Lanús","Florencio Varela","Almirante Brown","Berazategui"],"datasets":[{"label":"Tasa de desempleo (%)","data":[12.3,9.8,11.2,10.5,9.1,14.2,10.8,11.9],"backgroundColor":["#1ab8b8bb","#0e7878bb","#b91c1cbb","#b45309bb","#7c3aedbb","#0d9488bb","#c2410cbb","#0369a1bb"],"borderColor":["#1ab8b8","#0e7878","#b91c1c","#b45309","#7c3aed","#0d9488","#c2410c","#0369a1"],"borderWidth":1,"borderRadius":4}]}'::jsonb,
  null, null
);

INSERT INTO visualizaciones VALUES (
  'v-evolucion-desempleo',
  'Evolución de la tasa de desempleo - GBA (2020–2025)',
  'Economía', 'line',
  'EPH - INDEC',
  'Nov. 2025', '2025-11-08', '/informes/desempleo-conurbano-2025',
  '{"labels":["T2''20","T3''20","T4''20","T1''21","T2''21","T3''21","T4''21","T1''22","T2''22","T3''22","T4''22","T1''23","T2''23","T3''23","T4''23","T3''25"],"datasets":[{"label":"Desempleo GBA (%)","data":[14.5,12.1,10.8,11.4,10.9,10.2,9.8,9.5,9.1,8.8,8.5,8.9,9.2,9.6,9.0,11.1],"borderColor":"#1ab8b8","backgroundColor":"#1ab8b822","tension":0.35,"fill":true,"pointRadius":3}]}'::jsonb,
  null, null
);

INSERT INTO visualizaciones VALUES (
  'v-gasto-funcional',
  'Composición del gasto provincial por función - Presupuesto 2026 (%)',
  'Economía', 'bar',
  'Ministerio de Economía PBA',
  'Nov. 2025', '2025-11-01', '/informes/presupuesto-pba-2026',
  '{"labels":["Educación","Salud","Seguridad","Infraestructura","Deuda","Otros"],"datasets":[{"label":"Participación (%)","data":[29.1,14.8,18.3,9.4,8.4,20.0],"backgroundColor":["#1ab8b8bb","#0e7878bb","#b91c1cbb","#b45309bb","#7c3aedbb","#0d9488bb"],"borderColor":["#1ab8b8","#0e7878","#b91c1c","#b45309","#7c3aed","#0d9488"],"borderWidth":1,"borderRadius":4}]}'::jsonb,
  null, null
);

INSERT INTO visualizaciones VALUES (
  'v-cobertura-salud-partido',
  'Población sin cobertura de salud - Top 10 partidos con mayor déficit (%)',
  'Pobreza y desigualdad', 'bar',
  'Censo 2022 - INDEC',
  'Oct. 2025', '2025-10-20', '/informes/cobertura-salud-2022',
  '{"labels":["Florencio Varela","Pte. Perón","Merlo","Ezeiza","Berazategui","Malvinas Argentinas","José C. Paz","Moreno","La Matanza","Quilmes"],"datasets":[{"label":"Sin cobertura (%)","data":[38.1,36.4,34.9,33.7,32.1,31.8,31.2,30.9,29.8,28.4],"backgroundColor":"#b91c1cbb","borderColor":"#b91c1c","borderWidth":1,"borderRadius":4}]}'::jsonb,
  null, null
);

INSERT INTO visualizaciones VALUES (
  'v-exportaciones-pba-historico',
  'Provincia de Buenos Aires, exportaciones totales (2015–2025)',
  'Economía', 'bar',
  'INDEC - Dirección Nacional de Estadísticas del Sector Externo y Cuentas Internacionales',
  'Abr. 2026', '2026-04-07', '/informes/exportaciones-pba-2025',
  '{"labels":["2015","2016","2017","2018","2019","2020","2021","2022","2023*","2024*","2025*"],"datasets":[{"type":"bar","label":"Anual","data":[19100,18000,19200,21500,22500,19700,28000,33000,26500,29500,31684],"backgroundColor":"#1ab8b8bb","borderColor":"#1ab8b8","borderWidth":1,"borderRadius":4,"order":2},{"type":"line","label":"Primer semestre","data":[10000,9500,10500,10600,10700,10100,15500,16000,12000,14500,15000],"borderColor":"#0a1628","backgroundColor":"#0a1628","pointBackgroundColor":"#0a1628","pointRadius":4,"tension":0.3,"order":1}]}'::jsonb,
  '{"plugins":{"legend":{"display":true,"position":"bottom","labels":{"font":{"family":"Poppins","size":11},"color":"#64748b","boxWidth":12}}},"scales":{"x":{"ticks":{"font":{"family":"Poppins","size":11},"color":"#64748b"},"grid":{"color":"rgba(0,0,0,0.04)"},"title":{"display":true,"text":"Año","font":{"family":"Poppins","size":11},"color":"#94a3b8"}},"y":{"ticks":{"font":{"family":"Poppins","size":11},"color":"#64748b"},"grid":{"color":"rgba(0,0,0,0.04)"},"title":{"display":true,"text":"Millones de USD","font":{"family":"Poppins","size":11},"color":"#94a3b8"}}}}'::jsonb,
  null
);

INSERT INTO visualizaciones VALUES (
  'v-presion-tributaria-promedio',
  'Presión tributaria promedio (Recaudación / VAB) - PBA, Santa Fe y Córdoba. Año 2024',
  'Fiscal', 'bar',
  'UIPBA - en base a INDEC y Leyes impositivas locales',
  'Abr. 2026', '2026-04-07', '/informes/uipba-presion-tributaria-2024',
  '{"labels":["Buenos Aires","Santa Fe","Córdoba"],"datasets":[{"label":"Presión tributaria promedio (%)","data":[10.3,8.7,9.0],"backgroundColor":["#0369a1bb","#0d9488bb","#b45309bb"],"borderColor":["#0369a1","#0d9488","#b45309"],"borderWidth":1,"borderRadius":6}]}'::jsonb,
  '{"y_tick_format":"percent","scales":{"y":{"min":0,"max":13,"ticks":{"font":{"family":"Poppins","size":11},"color":"#64748b"},"grid":{"color":"rgba(0,0,0,0.04)"},"title":{"display":true,"text":"% sobre VAB","font":{"family":"Poppins","size":11},"color":"#94a3b8"}},"x":{"ticks":{"font":{"family":"Poppins","size":11},"color":"#64748b"},"grid":{"color":"rgba(0,0,0,0.04)"}}}}'::jsonb,
  null
);

INSERT INTO visualizaciones VALUES (
  'v-presion-tributaria-sectores',
  'Presión tributaria por sector (Recaudación / VAB) - PBA, Santa Fe y Córdoba. Año 2024',
  'Fiscal', 'bar',
  'UIPBA - en base a INDEC y Leyes impositivas locales',
  'Abr. 2026', '2026-04-07', '/informes/uipba-presion-tributaria-2024',
  '{"labels":["Industria","EGA","Construcción","Transporte","Serv. empresariales","Serv. personales","Interm. financiera"],"datasets":[{"label":"Buenos Aires","data":[4.7,10.1,4.8,9.6,9.8,18.4,24.6],"backgroundColor":"#0369a1bb","borderColor":"#0369a1","borderWidth":1,"borderRadius":4},{"label":"Santa Fe","data":[3.6,6.7,3.8,8.2,12.5,15.2,22.0],"backgroundColor":"#0d9488bb","borderColor":"#0d9488","borderWidth":1,"borderRadius":4},{"label":"Córdoba","data":[3.5,6.7,4.8,10.1,11.4,14.1,14.3],"backgroundColor":"#b45309bb","borderColor":"#b45309","borderWidth":1,"borderRadius":4}]}'::jsonb,
  '{"y_tick_format":"percent","plugins":{"legend":{"display":true,"position":"bottom","labels":{"font":{"family":"Poppins","size":11},"color":"#64748b","boxWidth":12}}},"scales":{"x":{"ticks":{"font":{"family":"Poppins","size":11},"color":"#64748b"},"grid":{"color":"rgba(0,0,0,0.04)"}},"y":{"ticks":{"font":{"family":"Poppins","size":11},"color":"#64748b"},"grid":{"color":"rgba(0,0,0,0.04)"},"title":{"display":true,"text":"% sobre VAB","font":{"family":"Poppins","size":11},"color":"#94a3b8"}}}}'::jsonb,
  null
);

-- ── Informe: IARAF Transferencias Provincias 2024-2026 ──────

INSERT INTO informes VALUES (
  'iaraf-transferencias-provincias-2024-2026',
  'Buenos Aires: la provincia que más perdió en la redistribución nacional',
  'Desde enero de 2024 hasta febrero de 2026, Buenos Aires acumuló una pérdida de $14,1 billones en transferencias nacionales respecto al promedio de 2023. Tres cuartas partes de esa caída provienen de recortes discrecionales, no de dinámica tributaria.',
  'Abr. 2026', '2026-04-14', 'Fiscal',
  '[]',
  $$["Para medir el impacto del ajuste fiscal nacional sobre las provincias, el IARAF tomó el promedio mensual de transferencias de 2023 como línea de base y calculó, mes a mes, la diferencia acumulada entre ese nivel de referencia y lo que cada jurisdicción efectivamente recibió entre enero de 2024 y febrero de 2026. El resultado, expresado en pesos constantes de febrero de 2026 para eliminar el efecto inflación, permite una comparación objetiva entre provincias. La \"pérdida\" no implica que la provincia haya tenido dinero y lo haya perdido: es cuánto menos recibió respecto al ritmo previo.","Los números no dejan lugar a dudas: la Provincia de Buenos Aires absorbió el impacto más grande con una pérdida acumulada de $14,117 billones. La distancia con el segundo lugar es abismal. Santa Fe registró $2,531 billones y Córdoba $2,115 billones. En términos relativos, PBA perdió casi el doble que Santa Fe y Córdoba combinadas, y casi seis veces más que Santa Fe sola.","La pérdida bonaerense no responde a un único factor. Se descompone en dos canales distintos: $10,5 billones corresponden a transferencias no automáticas —obra pública, programas sociales, subsidios y otros giros discrecionales que el gobierno nacional decidió recortar— y $3,6 billones a transferencias automáticas —principalmente coparticipación federal y leyes especiales—, que cayeron como consecuencia de la dinámica recaudatoria. La restitución de certificados de exclusión de percepción aduanera en marzo de 2025 redujo la recaudación de IVA, y las rebajas en Ganancias y Bienes Personales impactaron directamente en los fondos coparticipables. En definitiva, tres cuartas partes del impacto provienen de una decisión política.","El contraste con CABA es significativo. La Ciudad Autónoma fue la única jurisdicción que terminó con saldo positivo en el período: recibió $549.855 millones más que su promedio de 2023, equivalente a $179.340 por habitante a su favor versus una pérdida de $808.913 por habitante en PBA. Mientras el resto del país resignó recursos, CABA consolidó su posición como beneficiaria neta de la redistribución nacional.","Los datos del IARAF iluminan una tensión estructural que persiste en el federalismo fiscal argentino: la Provincia de Buenos Aires, que concentra el 38% de la población nacional, no solo enfrenta la mayor pérdida absoluta sino también una de las pérdidas per cápita más altas. El ajuste tiene nombre y dirección. Entender su composición —qué parte es decisión política y qué parte es dinámica tributaria— es el primer paso para debatirlo con datos."]$$::jsonb,
  $$["Buenos Aires acumuló $14,1 billones menos en transferencias nacionales entre enero 2024 y febrero 2026: casi 6 veces más que Santa Fe ($2,5 billones), la segunda más afectada.","El 75% de la pérdida bonaerense ($10,5 billones) proviene de transferencias no automáticas: recortes discrecionales en obra pública, programas sociales y subsidios.","El 25% restante ($3,6 billones) refleja la caída en coparticipación y leyes especiales, impulsada por rebajas impositivas en Ganancias y Bienes Personales.","CABA fue la única jurisdicción con saldo positivo: recibió $549.855 millones más que su promedio de 2023, equivalente a $179.340 por habitante a su favor."]$$::jsonb,
  '/informes/iaraf-transferencias-provincias-2024-2026', null, true
);

INSERT INTO visualizaciones VALUES (
  'v-transferencias-provincias-iaraf',
  'Pérdida acumulada en transferencias nacionales por provincia (ene. 2024 – feb. 2026)',
  'Fiscal', 'bar',
  'IARAF en base a Ministerio de Economía e INDEC',
  'Abr. 2026', '2026-04-14', '/informes/iaraf-transferencias-provincias-2024-2026',
  '{"labels":["Buenos Aires","Santa Fe","Córdoba","Chaco","Entre Ríos","La Rioja","Tucumán","S. del Estero","Formosa","Misiones","Mendoza","Salta","Corrientes","San Juan","Catamarca","Río Negro","Neuquén","Jujuy","San Luis","Santa Cruz","La Pampa","T. del Fuego","Chubut","CABA"],"datasets":[{"label":"Diferencia vs. promedio 2023 (millones de $ const. feb. 2026)","data":[-14117989,-2531725,-2115919,-1608224,-1325468,-1250699,-1231074,-1229834,-1117156,-1018861,-994854,-964099,-886545,-754337,-708667,-660323,-611615,-618830,-609001,-558877,-553584,-381861,-279612,549855],"backgroundColor":["#b91c1cbb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#1ab8b8bb","#0d9488bb"],"borderColor":["#b91c1c","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#1ab8b8","#0d9488"],"borderWidth":1,"borderRadius":4}]}'::jsonb,
  '{"scales":{"x":{"ticks":{"font":{"family":"Poppins","size":9},"color":"#64748b","maxRotation":45},"grid":{"color":"rgba(0,0,0,0.04)"}},"y":{"ticks":{"font":{"family":"Poppins","size":11},"color":"#64748b"},"grid":{"color":"rgba(0,0,0,0.04)"},"title":{"display":true,"text":"Millones de $ const. feb. 2026","font":{"family":"Poppins","size":11},"color":"#94a3b8"}}}}'::jsonb,
  null
);

-- ── Informe: Tasa Vial Municipios PBA 2025 ──────────────────

INSERT INTO informes VALUES (
  'tasa-vial-municipios-pba-2025',
  'La nafta también paga tributo municipal: quién cobra más por la tasa vial en PBA',
  'En la Provincia de Buenos Aires, cada municipio fija libremente la Tasa de Mantenimiento Vial sobre cada litro de combustible expendido. El rango va de 0,8% a 3%, y algunos distritos directamente cobran en pesos por litro. Una dispersión fiscal que impacta de forma desigual a conductores en partidos vecinos.',
  'Abr. 2026', '2026-04-14', 'Fiscal',
  '["General Pueyrredón","Moreno","Pilar","Avellaneda","Berazategui","Lomas de Zamora","La Matanza","Tigre","José C. Paz","Pinamar"]',
  $$["La Tasa de Mantenimiento Vial es un tributo municipal que se aplica sobre cada litro de combustible expendido en las estaciones de servicio del partido. A diferencia de los impuestos al combustible de alcance nacional, este gravamen es de diseño y recaudación enteramente municipal: cada distrito fija su alícuota por ordenanza tarifaria, sin techo ni piso impuesto por la Provincia. El resultado es una atomización fiscal que afecta de forma desigual a conductores que viven en partidos vecinos.","El relevamiento realizado por la Subsecretaría de Coordinación Fiscal Provincial del Ministerio de Economía de la Nación (con datos de 2025) muestra un rango de alícuotas que va de 0,8% (Marcos Paz) a 3% (General Pueyrredón). En el Conurbano, la distribución está concentrada: la mayoría de los municipios del sur del GBA (Avellaneda, Berazategui, Ezeiza, Florencio Varela, Lanús, Lomas de Zamora) aplica exactamente el 2%, mientras que Moreno y Pilar llegan al 2,5%. Tigre y Escobar se ubican en el extremo más bajo del Gran Buenos Aires, con 0,9%.","El caso de General Pueyrredón es el más emblemático. Con el 3% aplicado a todos los tipos de combustible sin distinción, Mar del Plata combina su condición de ciudad turística con uno de los tributos municipales más altos de la Provincia. Pinamar había igualado esa alícuota, pero eliminó su tasa vial tras el cierre de la temporada estival 2025-2026, convirtiéndose en el único distrito del relevamiento que aplicó y luego derogó el tributo en el período analizado. El contraste subraya el carácter marcadamente estacional que puede tener este gravamen en municipios con alta concentración de visitantes.","Una heterodoxia tarifaria aparece en al menos seis municipios que optaron por fijar el tributo en pesos por litro en lugar de un porcentaje. José C. Paz cobra $30 por litro; General Rodríguez, $10; Junín, entre $6 y $11 según el tipo de combustible; San Fernando $7,92; Campana, entre $4 y $8. Esta modalidad desindexada puede parecer baja cuando se fija la ordenanza, pero su carga real depende de cuándo se actualizó: si el precio del combustible sube y la ordenanza no se toca, el peso efectivo cae.","La dispersión de la tasa vial entre municipios bonaerenses no es solo un dato fiscal: es un síntoma de la heterogeneidad del federalismo local en PBA. Dos conductores separados por un límite municipal pueden pagar alícuotas que difieren en más del doble. El argumento de la tasa (financiar el mantenimiento vial) no justifica por sí solo esas diferencias, especialmente cuando la calidad de la red de caminos locales no siempre guarda relación con la presión tributaria ejercida. El dato invita a comparar no solo cuánto se cobra, sino para qué se usa."]$$::jsonb,
  $$["General Pueyrredón (Mar del Plata) lidera con 3% por litro: la alícuota más alta entre los municipios relevados. Pinamar, que igualaba ese registro durante el verano, eliminó su tasa vial tras el cierre de la temporada estival 2025-2026.","La dispersión entre municipios va de 0,8% (Marcos Paz) a 3% (Mar del Plata): casi 4 veces de diferencia entre el mínimo y el máximo.","En el Conurbano, el rango es 0,9% (Escobar, Tigre) a 2,5% (Moreno, Pilar); la mayoría del sur del GBA converge en 2%.","Al menos 6 municipios —entre ellos José C. Paz ($30/litro) y General Rodríguez ($10/litro)— fijan el tributo en pesos fijos, no en porcentaje, con una carga real que varía según el precio del combustible."]$$::jsonb,
  '/informes/tasa-vial-municipios-pba-2025', null, true
);

ALTER TABLE informes ADD COLUMN IF NOT EXISTS fuentes jsonb DEFAULT '[]'::jsonb;

UPDATE informes SET fuentes = '["Ministerio de Economía de la Nación, Secretaría de Hacienda — Tasa de Mantenimiento Vial 2025 (datos relevados de sitios web oficiales de municipios al 31 de marzo de 2025)","Subsecretaría de Coordinación Fiscal Provincial — Elaboración propia en base a Ordenanzas Fiscal y Tarifaria municipales, ejercicio 2025"]'::jsonb
WHERE id = 'tasa-vial-municipios-pba-2025';

INSERT INTO visualizaciones VALUES (
  'v-tasa-vial-top6-pba',
  'Top 6 municipios con mayor tasa vial sobre combustible — PBA 2025 (%)',
  'Fiscal', 'bar',
  'Ministerio de Economía de la Nación - Subsecretaría de Coordinación Fiscal Provincial',
  'Abr. 2026', '2026-04-14', '/informes/tasa-vial-municipios-pba-2025',
  '{"labels":["Gral. Pueyrredón","Azul","Moreno","Pilar","Almirante Brown","Avellaneda"],"datasets":[{"label":"Tasa vial sobre nafta (% por litro)","data":[3.0,2.5,2.5,2.5,2.0,2.0],"backgroundColor":["#b91c1cbb","#b45309bb","#b45309bb","#b45309bb","#1ab8b8bb","#1ab8b8bb"],"borderColor":["#b91c1c","#b45309","#b45309","#b45309","#1ab8b8","#1ab8b8"],"borderWidth":1,"borderRadius":6}]}'::jsonb,
  '{"y_tick_format":"percent","scales":{"y":{"min":0,"max":3.5,"ticks":{"font":{"family":"Poppins","size":11},"color":"#64748b"},"grid":{"color":"rgba(0,0,0,0.04)"},"title":{"display":true,"text":"% por litro expendido","font":{"family":"Poppins","size":11},"color":"#94a3b8"}},"x":{"ticks":{"font":{"family":"Poppins","size":11},"color":"#64748b"},"grid":{"color":"rgba(0,0,0,0.04)"}}}}'::jsonb,
  null
);
