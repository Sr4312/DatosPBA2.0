/* Ficha visual de cada informe para la tarjeta del listado (/informes).
   La dibuja src/components/shared/InformeVisual.jsx. Clave: la `url` del
   informe en Supabase (coincide con `path` en informesRegistry.js).

   Los valores se copian de las constantes de datos de la página JSX del
   informe; si cambia el dato en la página, cambia acá.

   Campos:
     cifra      string ya formateada es-AR (coma decimal, punto de miles, menos U+2212)
     unidad     corta, sentence case
     periodo    período de la cifra
     fuente     fuente corta
     hallazgo   una oración declarativa: es el aria-label del visual
     tipo       'barras-h' (ranking, 5 filas) | 'barras' (2-8 columnas) | 'linea' (6-24 puntos)
     etiquetas  categorías o períodos, cortos
     series     [{ nombre, valores }] — una serie, o dos si el informe compara
     destacado  índice de la barra protagonista, o null (todas del mismo color)

   Al publicar un informe nuevo, agregá su ficha acá. Sin ficha, la tarjeta
   se muestra sin banda visual. */

export const INFORMES_VISUALES = {
  '/informes/stock-bovino-municipios-pba-2024': {
    cifra: '19,4',
    unidad: 'millones de cabezas',
    periodo: 'dic. 2024',
    fuente: 'Existencias bovinas por partido',
    hallazgo: 'Ayacucho, Olavarría, Azul y Benito Juárez ocupan los mismos cuatro puestos desde 2017 y la Provincia perdió 1,1 millones de cabezas en siete años',
    tipo: 'barras-h',
    etiquetas: ['Ayacucho', 'Olavarría', 'Azul', 'Benito Juárez', 'G. La Madrid'],
    series: [{ nombre: 'Stock', valores: [823119, 702846, 590088, 479189, 445757] }],
    destacado: 0,
  },

  '/informes/exportaciones-pba-junio-2026': {
    cifra: '2.709',
    unidad: 'millones de dólares',
    periodo: 'jun. 2026',
    fuente: 'DPE - INDEC',
    hallazgo: 'Las exportaciones bonaerenses de junio de 2026 crecieron 3,1% interanual y fueron el segundo mejor junio de los últimos cinco, solo por debajo de 2022',
    tipo: 'barras',
    etiquetas: ['2022', '2023', '2024', '2025', '2026'],
    series: [{ nombre: 'Junio', valores: [2961, 2089, 2450, 2627, 2709] }],
    destacado: 4,
  },

  '/informes/fondo-educativo-municipios-pba-2025': {
    cifra: '444.611',
    unidad: 'millones de pesos',
    periodo: '2025',
    fuente: 'Min. Economía PBA',
    hallazgo: 'Puán recibió $733.196 de Fondo Educativo por alumno estatal en 2025 y General Rodríguez $110.256, una brecha de 6,6 veces',
    tipo: 'barras-h',
    etiquetas: ['Puán', 'General Guido', 'Pila', 'General Alvear', 'Rauch'],
    series: [{ nombre: 'Por alumno', valores: [733196, 705954, 696774, 570434, 544076] }],
    destacado: 0,
  },

  '/informes/coparticipacion-municipal-pba-2025': {
    cifra: '3,60',
    unidad: 'billones de pesos',
    periodo: '2025',
    fuente: 'Min. Economía PBA',
    hallazgo: 'Puán recibió $1.280.240 de coparticipación por habitante en 2025 y Tres de Febrero $99.225, una brecha de 12,9 veces',
    tipo: 'barras-h',
    etiquetas: ['Puán', 'Pila', 'San Cayetano', 'G. La Madrid', 'Tornquist'],
    series: [{ nombre: 'Por habitante', valores: [1280240, 1245532, 1150854, 1126659, 1090858] }],
    destacado: 0,
  },

  '/informes/isim-pba-abril-2026': {
    cifra: '+2,5',
    unidad: '% i.a.',
    periodo: 'abr. 2026',
    fuente: 'DPE - ISIM-PBA',
    hallazgo: 'La producción industrial bonaerense creció 2,5% interanual en abril de 2026, después del 13,5% de marzo, con seis de los once bloques en caída',
    tipo: 'linea',
    etiquetas: ['abr 25', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic', 'ene 26', 'feb', 'mar', 'abr 26'],
    series: [{ nombre: 'Var. interanual', valores: [8.4, 3.1, 8.7, 1.1, 1.2, 2.9, 0.4, -10.2, -3.5, -1.3, -1.2, 13.5, 2.5] }],
    destacado: null,
  },

  '/informes/ventas-supermercados-pba-mayo-2026': {
    cifra: '−3,4',
    unidad: '% i.a. en volumen',
    periodo: 'may. 2026',
    fuente: 'DPE - INDEC',
    hallazgo: 'En mayo de 2026 los supermercados bonaerenses facturaron 25,0% más que un año atrás y vendieron 3,4% menos en volumen',
    tipo: 'linea',
    etiquetas: ['may 25', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic', 'ene 26', 'feb', 'mar', 'abr', 'may 26'],
    series: [
      { nombre: 'Volumen', valores: [4.2, -3.0, -1.8, -1.0, -4.9, -1.8, -6.4, -2.3, -5.0, -7.1, -10.2, -7.4, -3.4] },
      { nombre: 'Facturación', valores: [40.0, 28.9, 28.6, 26.7, 21.9, 25.3, 19.8, 24.0, 22.6, 21.1, 16.7, 19.1, 25.0] },
    ],
    destacado: null,
  },

  '/informes/cargos-politicos-pba-2026': {
    cifra: '3.353',
    unidad: 'cargos directivos',
    periodo: 'ago. 2026',
    fuente: 'Mapa del Estado',
    hallazgo: 'El Ministerio de Seguridad reúne 352 de los 3.353 cargos directivos del Ejecutivo bonaerense, uno de cada diez',
    tipo: 'barras-h',
    etiquetas: ['M. Seguridad', 'M. Justicia', 'DGCyE', 'Trib. Cuentas', 'M. Infraestr.'],
    series: [{ nombre: 'Cargos', valores: [352, 293, 225, 185, 179] }],
    destacado: 0,
  },

  '/informes/empleo-privado-135-municipios-2025': {
    cifra: '2,01',
    unidad: 'millones de puestos, variación % por zona',
    periodo: 'dic. 2025',
    fuente: 'OEDE',
    hallazgo: 'El empleo privado registrado quedó 2,8% por debajo del máximo de enero de 2024 y 84 de los 135 municipios perdieron puestos en el último bienio',
    tipo: 'barras',
    etiquetas: ['AMBA', 'Resto de la Provincia'],
    series: [
      { nombre: 'Último bienio', valores: [-3.1, -0.8] },
      { nombre: 'Desde 2019', valores: [5.3, 9.3] },
    ],
    destacado: null,
  },

  '/informes/empleo-industrial-conurbano-2025': {
    cifra: '339.110',
    unidad: 'puestos industriales',
    periodo: 'jun. 2025',
    fuente: 'SIPA vía UNSAM',
    hallazgo: 'Cinco municipios concentran el 47,5% del empleo industrial del Conurbano y cuatro de ellos siguen perdiendo puestos',
    tipo: 'barras-h',
    etiquetas: ['La Matanza', 'G. San Martín', 'Tigre', 'Vicente López', 'T. de Febrero'],
    series: [{ nombre: 'Puestos', valores: [39533, 35983, 29506, 29254, 26672] }],
    destacado: 0,
  },

  '/informes/empleo-privado-gba-2025': {
    cifra: '−3,1',
    unidad: '% en dos años',
    periodo: 'dic. 2023 - dic. 2025',
    fuente: 'OEDE',
    hallazgo: '33 de los 40 partidos del GBA perdieron empleo privado registrado en el bienio y Ensenada cayó 18,9%',
    tipo: 'barras-h',
    etiquetas: ['Ensenada', 'Zárate', 'Berisso', 'San Fernando', 'San Isidro'],
    series: [{ nombre: 'Variación %', valores: [-18.85, -11.18, -10.86, -7.95, -6.06] }],
    destacado: 0,
  },

  '/informes/planta-ocupada-provincial-2024': {
    cifra: '657.328',
    unidad: 'agentes',
    periodo: '2024',
    fuente: 'DNAP',
    hallazgo: 'La planta ocupada del Estado bonaerense creció 53,4% entre 2000 y 2024, con contracciones en 2001-2002 y 2015-2019',
    tipo: 'barras',
    etiquetas: ['2000', '2007', '2011', '2015', '2019', '2024'],
    series: [{ nombre: 'Planta ocupada', valores: [428408, 521807, 638440, 677362, 624685, 657328] }],
    destacado: 5,
  },

  '/informes/pbg-pba-2025': {
    cifra: '+4,2',
    unidad: '% i.a. real',
    periodo: '2025',
    fuente: 'DPE PBA',
    hallazgo: 'El PBG bonaerense creció 4,2% real en 2025 tras dos años de caída, con 14 de los 16 sectores en alza',
    tipo: 'barras',
    etiquetas: ['2020', '2021', '2022', '2023', '2024', '2025'],
    series: [{ nombre: 'Variación i.a.', valores: [-9.8, 11.8, 7.4, -0.9, -3.6, 4.2] }],
    destacado: 5,
  },

  '/informes/mercado-trabajo-gba-2026': {
    cifra: '9,7',
    unidad: '% de desocupación',
    periodo: '1T 2026',
    fuente: 'INDEC - EPH',
    hallazgo: 'La desocupación del GBA se mantuvo en 9,7%, el doble que CABA, mientras la subocupación horaria subió de 10,9% a 12,1%',
    tipo: 'barras',
    etiquetas: ['GBA', 'Total aglomerados', 'CABA'],
    series: [{ nombre: 'Desocupación', valores: [9.7, 7.8, 4.8] }],
    destacado: 0,
  },

  '/informes/industria-manufacturera-pba-2026': {
    cifra: '+13,5',
    unidad: '% i.a.',
    periodo: 'mar. 2026',
    fuente: 'DPE - ISIM-PBA',
    hallazgo: 'El ISIM-PBA rebotó 13,5% interanual en marzo de 2026 tras un primer bimestre en baja, apoyado en Productos químicos y Máquinas y equipos',
    tipo: 'linea',
    etiquetas: ['mar 25', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic', 'ene 26', 'feb', 'mar 26'],
    series: [
      { nombre: 'Original', valores: [83.7, 89.6, 90.5, 85.9, 91.4, 92.9, 92.3, 93.8, 83.7, 86.4, 82.0, 80.5, 95.0] },
      { nombre: 'Desestacionalizado', valores: [85.0, 89.7, 89.4, 87.7, 86.7, 91.0, 88.1, 88.0, 83.1, 86.6, 90.7, 88.7, 94.3] },
    ],
    destacado: null,
  },

  '/informes/indice-fada-pba-2026': {
    cifra: '59,0',
    unidad: '% de la renta agrícola',
    periodo: 'jun. 2026',
    fuente: 'FADA',
    hallazgo: 'El Estado se queda con el 59% de la renta agrícola bonaerense, por debajo del promedio nacional de 61,9%',
    tipo: 'barras-h',
    etiquetas: ['Entre Ríos', 'Prom. nacional', 'Córdoba', 'Buenos Aires', 'La Pampa'],
    series: [{ nombre: 'Índice FADA', valores: [65.5, 61.9, 60.2, 59.0, 58.9] }],
    destacado: 3,
  },

  '/informes/presupuesto-genero-pba-2026': {
    cifra: '0,82',
    unidad: '% del presupuesto con foco real en género',
    periodo: '2026',
    fuente: 'Presupuesto PBA 2026',
    hallazgo: 'Solo el 0,82% del presupuesto provincial se focaliza efectivamente en brechas de género, frente al 4,2% presentado como tal',
    tipo: 'barras',
    etiquetas: ['Presentado como género', 'Focalizado en brechas'],
    series: [{ nombre: '% del presupuesto', valores: [4.2, 0.82] }],
    destacado: 1,
  },

  '/informes/ranking-fiscal-provincial-2025': {
    cifra: '−0,1',
    unidad: '% del PBI, resultado primario provincial',
    periodo: '2025',
    fuente: 'Empiria',
    hallazgo: 'Las provincias pasaron de un superávit primario de 0,4% del PBI en 2024 a un déficit de 0,1% en 2025, mientras la Nación registra superávit',
    tipo: 'barras',
    etiquetas: ['2024', '2025'],
    series: [
      { nombre: 'Provincias', valores: [0.4, -0.1] },
      { nombre: 'Nación', valores: [2.0, 1.7] },
    ],
    destacado: null,
  },

  '/informes/homicidios-pba-2025': {
    cifra: '8,02',
    unidad: 'homicidios cada 100.000 hab. en La Matanza',
    periodo: '2025',
    fuente: 'Ministerio Público PBA',
    hallazgo: 'La Matanza tiene la tasa de homicidios más alta de la Provincia, 8,02 cada 100.000 habitantes, casi el doble del promedio provincial',
    tipo: 'barras-h',
    etiquetas: ['La Matanza', 'Provincia', 'CABA', 'Interior PBA'],
    series: [{ nombre: 'Tasa cada 100.000 hab.', valores: [8.02, 4.6, 2.5, 2.42] }],
    destacado: 0,
  },

  '/informes/empleo-publico-pba-2026': {
    cifra: '30,2',
    unidad: 'empleados públicos cada 1.000 hab.',
    periodo: 'Presupuesto 2026',
    fuente: 'Presupuesto PBA 2026',
    hallazgo: 'Buenos Aires tiene entre un 30% y un 160% más de empleados públicos por habitante que jurisdicciones comparables de Brasil y Estados Unidos',
    tipo: 'barras-h',
    etiquetas: ['Buenos Aires', 'Texas', 'Nueva York', 'Minas Gerais', 'R. G. do Sul'],
    series: [{ nombre: 'Empleados cada 1.000 hab.', valores: [30.2, 22.8, 22.4, 19.7, 17.5] }],
    destacado: 0,
  },

  '/informes/mineria-pba-2025': {
    cifra: '50',
    unidad: 'millones de toneladas por año',
    periodo: 'abr. 2025',
    fuente: 'DPM - SIACAM',
    hallazgo: 'Buenos Aires es la primera productora de áridos y minerales no metalíferos del país, con 50 millones de toneladas por año',
    tipo: 'barras-h',
    etiquetas: ['Buenos Aires', 'Córdoba', 'Santa Fe', 'San Juan', 'Mendoza'],
    series: [{ nombre: 'Millones de toneladas', valores: [50, 48, 14, 10, 7] }],
    destacado: 0,
  },

  '/informes/medicamentos-tish-pba-2025': {
    cifra: '3,73',
    unidad: '% del precio del medicamento es TISH en Pilar',
    periodo: 'may. 2025',
    fuente: 'CEFIP - UNLP',
    hallazgo: 'La carga de tasas municipales acumulada sobre medicamentos llega al 3,73% del precio final en Pilar, casi el triple que en Bahía Blanca',
    tipo: 'barras-h',
    etiquetas: ['Pilar', 'La Plata', 'F. Varela', 'Córdoba Cap.', 'Río Cuarto'],
    series: [{ nombre: 'TISH acumulada', valores: [3.728, 3.03, 2.688, 2.521, 2.216] }],
    destacado: 0,
  },

  '/informes/agroindustria-pba-2026': {
    cifra: '26',
    unidad: '% de la producción agroindustrial del país',
    periodo: '2025',
    fuente: 'FADA',
    hallazgo: 'Buenos Aires concentra el 26% de la producción agroindustrial nacional y más del 90% de la cebada del país',
    tipo: 'barras-h',
    etiquetas: ['Cebada', 'Girasol', 'Trigo', 'Soja', 'Maíz'],
    series: [{ nombre: 'Participación de PBA', valores: [93.1, 56, 49.5, 33.1, 28.9] }],
    destacado: null,
  },

  '/informes/salud-conurbano-pec-2026': {
    cifra: '4,1',
    unidad: 'millones sin cobertura formal de salud',
    periodo: 'Censo 2022',
    fuente: 'PEC',
    hallazgo: 'La Matanza concentra 846.383 personas sin cobertura formal de salud, más del doble que Moreno, el segundo partido',
    tipo: 'barras-h',
    etiquetas: ['La Matanza', 'Moreno', 'Merlo', 'L. de Zamora', 'F. Varela'],
    series: [{ nombre: 'Sin cobertura', valores: [846383, 289261, 270298, 260643, 235982] }],
    destacado: 0,
  },

  '/informes/renabap-pba-2026': {
    cifra: '2.327',
    unidad: 'barrios populares',
    periodo: '2023',
    fuente: 'RENABAP',
    hallazgo: 'Los barrios populares registrados en la Provincia pasaron de 1.650 en 2017 a 2.327 en 2023, un 41% más',
    tipo: 'linea',
    etiquetas: ['2017', '2018', '2019', '2020', '2021', '2022', '2023'],
    series: [{ nombre: 'Barrios', valores: [1650, 1780, 1890, 2010, 2160, 2260, 2327] }],
    destacado: null,
  },

  '/informes/caf-estado-municipal-pba': {
    cifra: '38,0',
    unidad: '% del empleo de Alberti es municipal',
    periodo: '2024',
    fuente: 'Atlas CAF',
    hallazgo: 'En Alberti casi cuatro de cada diez empleados trabajan en el Estado municipal; en Vicente López, menos de uno de cada veinte',
    tipo: 'barras',
    etiquetas: ['Alberti', 'Chaves', 'Ayacucho', '3 de Febrero', 'V. López'],
    series: [{ nombre: 'Empleo municipal', valores: [38.0, 36.5, 35.7, 4.8, 4.4] }],
    destacado: 0,
  },

  '/informes/kpmg-iibb-2025': {
    cifra: '61',
    unidad: '% de las empresas señala a Ingresos Brutos',
    periodo: '2025',
    fuente: 'KPMG',
    hallazgo: 'El 61% de las empresas señala a Ingresos Brutos como el impuesto que más encarece los precios, 7 puntos más que en 2024',
    tipo: 'barras',
    etiquetas: ['IIBB', 'Otros', 'IVA', 'Ganancias', 'Débitos y créditos'],
    series: [{ nombre: 'Menciones', valores: [61, 14, 12, 8, 5] }],
    destacado: 0,
  },
}
