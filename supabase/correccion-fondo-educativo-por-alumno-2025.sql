-- Cambio de base del informe "El Fondo Educativo en los municipios
-- bonaerenses": pasa de medir por habitante a medir por alumno del sistema
-- estatal. Correr en el SQL Editor de Supabase.
--
-- La ruta y el id no cambian, así que los enlaces publicados siguen andando:
-- se actualizan título, bajada, insights, municipios y fuentes.
--
-- El denominador es la matrícula estatal 2025 de la DGCyE (inicial, primario y
-- secundario), que se suma como fuente nueva. La población del Censo 2022 queda
-- citada porque la tabla comparativa del informe conserva la columna por
-- habitante.

UPDATE informes SET
  titulo = 'El Fondo Educativo en los municipios bonaerenses, medido por alumno',
  bajada = 'El Fondo de Financiamiento Educativo se reparte entre los 135 municipios con criterios propios, distintos a los de la coparticipación. Medirlo por alumno del sistema estatal, y no por habitante, cambia el fondo de la tabla y muestra qué variable ordena el reparto.',
  municipios = '["Provincia de Buenos Aires","24 partidos del GBA","Puán","General Rodríguez","Vicente López"]'::jsonb,
  insights = $$["Por alumno estatal, Puán recibió $733.196 de Fondo Educativo en 2025 y General Rodríguez, $110.256","Los quince municipios con más Fondo Educativo por alumno son del interior, pero los quince últimos son ocho del GBA y siete de afuera","Los 27 municipios con menos alumnos estatales reciben $433.960 por alumno y los 27 más grandes, $141.126","El GBA reúne el 58,1% de la matrícula estatal de la provincia y recibió el 49,3% del Fondo Educativo","Vicente López pasa del puesto 135 al 65 al medir por alumno estatal: dos tercios de su matrícula está en escuelas privadas"]$$::jsonb,
  fuentes = $$["Ministerio de Economía de la Provincia de Buenos Aires, Dirección Provincial de Coordinación Municipal. Transferencias de Fondos a los Municipios, columna Fondo de Financ. Educativo, acumulado enero-diciembre 2025","Dirección General de Cultura y Educación de la Provincia de Buenos Aires, Dirección de Información y Estadística. Matrícula por año de estudio, relevamiento inicial 2025, niveles inicial, primario y secundario por distrito y sector","Dirección Provincial de Estadística, Ministerio de Economía de la Provincia de Buenos Aires. Población total por municipio, Censo Nacional de Población, Hogares y Viviendas 2022","DatosPBA (2026). La coparticipación municipal bonaerense, medida por habitante","Elaboración propia DatosPBA sobre la base del Ministerio de Economía de la Provincia de Buenos Aires y la DGCyE (2026)"]$$::jsonb
WHERE id = 'fondo-educativo-municipios-pba-2025';

-- Control: tiene que devolver una fila con el título nuevo.
SELECT id, titulo, jsonb_array_length(insights) AS insights, jsonb_array_length(fuentes) AS fuentes
FROM informes WHERE id = 'fondo-educativo-municipios-pba-2025';
