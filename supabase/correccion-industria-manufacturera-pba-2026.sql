-- Corrección del informe ya publicado "La industria manufacturera bonaerense"
-- (edición de marzo de 2026), id 'industria-manufacturera-pba-2026'.
-- Correr en el SQL Editor.
--
-- Motivo: en su edición de abril de 2026 la Dirección Provincial de Estadística
-- revisó las estimaciones de los meses anteriores. La variación interanual de
-- marzo pasó de 13,2% a 13,5%, el índice de 94,7 a 95,0 puntos, la variación
-- mensual desestacionalizada de 5,9% a 6,3% y el acumulado del trimestre de
-- 3,5% a 3,7%. La página JSX ya quedó actualizada.
--
-- Se corrigen además dos afirmaciones que no cerraban con los propios datos del
-- informe: los bloques por debajo del nivel 2012 son 9 de 11 (no 7), y Químicos
-- más Máquinas explican dos tercios de la variación agregada (no de la
-- incidencia positiva total, que es el 59%).
--
-- Es un UPDATE, no un INSERT: la fila ya existe y hay que conservar su id.
-- Verificar antes que devuelva exactamente una fila:
--   SELECT id, titulo FROM informes WHERE id = 'industria-manufacturera-pba-2026';

UPDATE informes SET
  titulo   = 'La industria manufacturera bonaerense rebotó 13,5% en marzo',
  bajada   = 'El ISIM-PBA marcó en marzo su mayor suba interanual reciente para ese mes, con nueve de once bloques en alza. El salto se apoya en una base de comparación baja y en dos rubros.',
  insights = $$["La industria manufacturera bonaerense creció 13,5% interanual en marzo de 2026, según el dato revisado","Nueve de los once bloques industriales crecieron, tras cuatro meses consecutivos de caídas interanuales","Productos químicos y Máquinas y equipos explican dos tercios de la variación agregada del mes","Nueve de los once bloques siguen produciendo menos que en 2012, el año base del indicador","El acumulado del primer trimestre cerró 3,7% por encima de igual período de 2025"]$$::jsonb
WHERE id = 'industria-manufacturera-pba-2026';
