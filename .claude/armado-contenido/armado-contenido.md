---
name: generador-informe
description: >
  Este skill genera un informe estructurado en el formato adecuado para cargar a la página web de Datos PBA. Debe activarse siempre que el usuario provea información (texto, CSV, imagen, datos sueltos) y pida armar un informe, nota de análisis o reporte. No debe activarse si no hay ningún dato o contenido de base. Usá este skill también cuando el usuario diga "haceme un informe", "armá una nota", "quiero publicar esto en Datos PBA" o similares.
---

# Generador de Informes — Datos PBA

Skill para producir informes de análisis político-territorial de la provincia de
Buenos Aires, estructurados y listos para su publicación en la web de Datos PBA.
El rol de Claude al ejecutar este skill es el de un analista político especializado
en PBA: lectura crítica de los datos, encuadre político-institucional y redacción
clara y fundamentada.

## Cuándo usarlo

- El usuario provee información (CSV, texto, estadísticas, imagen de gráfico) y
  pide armar un informe o nota de análisis.
- El usuario quiere publicar contenido en Datos PBA.
- El usuario dice "haceme un informe sobre X" con algún material adjunto.

**No activar** si no hay ningún dato, archivo o texto de base provisto.

## Inputs esperados

- Texto, estadísticas, CSVs, tablas o cualquier dato estructurado o no estructurado.
- Imágenes o PNGs de gráficos existentes (en ese caso, Claude debe recrear el gráfico
  con el diseño visual de Datos PBA en lugar de usar la imagen original).
- Indicación opcional del municipio, partido o región que es el foco del informe.
- Indicación opcional del tema (laboral, electoral, social, económico, etc.).

**Todo dato utilizado en el informe debe ser citado con su fuente correspondiente.**
Si el usuario no indicó la fuente, preguntar antes de publicar. No inventar ni asumir fuentes.

## Proceso paso a paso

1. **Analizar el material provisto.** Identificar el tema central, el alcance
   geográfico (municipio, partido, región, provincia) y el período temporal.
   Asumir el rol de analista político de PBA.

2. **Definir estructura editorial:**
   - Título atractivo y directo.
   - Subtítulo que amplía o contextualiza.
   - Datos geográficos/demográficos de contexto (población, densidad, partido,
     región, intendente si es relevante).
   - Fecha de publicación.

3. **Armar la card de hallazgos clave** (3 a 4 puntos concisos, en formato
   destacado, que resuman los findings más importantes del informe).

4. **Redactar el cuerpo del informe** (3 a 5 párrafos). Encuadre del problema,
   análisis de los datos, interpretación política-territorial, conclusión o
   implicancias. Tono claro, sin jerga innecesaria, con precisión técnica.

5. **Gráfico o visualización:**
   - Si el usuario proveyó un PNG o imagen: recrear el gráfico con diseño Datos PBA
     (paleta de colores, tipografía y estilo del sitio).
   - Si el usuario proveyó datos crudos: generar el gráfico más adecuado para
     la información (barras, líneas, mapa si aplica, etc.).
   - Si no hay datos suficientes para un gráfico: avisar al usuario y sugerir
     qué datos harían falta.

6. **Armar el campo `fuentes`** — OBLIGATORIO, nunca omitir.
   Array de strings, una entrada por fuente. Cada entrada debe incluir:
   - Nombre del organismo o autor
   - Nombre del documento o dataset
   - Fecha de publicación o relevamiento si está disponible

   Ejemplos bien formados:
   - `"Ministerio de Economía de la Nación — Tasa de Mantenimiento Vial 2025 (datos al 31/03/2025)"`
   - `"IARAF — Informe de Transferencias Nación-Provincias, en base a Ministerio de Economía e INDEC"`
   - `"INDEC — Encuesta Permanente de Hogares, 3er trimestre 2025"`

   Si el dato viene de una imagen sin fuente clara: indicarlo en el cuerpo y pedirle
   al usuario que confirme el origen antes de publicar.

7. **Presentar el borrador al usuario** para revisión. Una vez aprobado,
   proceder a subir el informe a la web de Datos PBA con todos sus componentes.

8. **Sumar el grafico creado en la pagina de inicio** en la pagina de inicio, al lado del Datos PBA, hay un grafico del ultimo informe. Cuando se crea un informe nuevo, se debe debe cargar uno de los graficos de ese ultimo informe, en la pagina de inicio, siguiendo el formato del informe anterior.

## Output esperado

Un informe completo con los siguientes bloques, en este orden:

| Bloque | Descripción |
|---|---|
| Título | Atractivo, informativo |
| Subtítulo | Complementa el título |
| Contexto geográfico/demográfico | Datos duros de encuadre |
| Card de hallazgos clave | 3–4 bullets destacados |
| Cuerpo del informe | 3–5 párrafos de análisis |
| Gráfico / visualización | Chart.js o similar, estilo Datos PBA |
| Fuentes | **Obligatorio** — campo `fuentes` en Supabase, visible al pie del informe |

## Casos borde / Errores comunes

- **Datos insuficientes para el análisis:** Si el material provisto no alcanza
  para armar un informe sólido, Claude debe avisar qué falta y qué tipo de
  datos complementarios ayudarían (ej: "faltaría el total provincial para
  comparar este número municipal").

- **PNG de gráfico sin datos crudos:** No usar la imagen directamente. Extraer
  los valores visibles del gráfico e informar al usuario que se está estimando
  a partir de la imagen; pedir confirmación de los números si es posible.

- **Fuentes sin origen claro:** Si el usuario pega datos sin aclarar la fuente,
  Claude debe preguntar de dónde provienen antes de publicar. No inventar ni
  asumir fuentes.

- **Tema fuera del ámbito de PBA:** Si la información refiere a CABA, otra
  provincia o nivel nacional, aclarar el encuadre y preguntar si de todas
  formas se quiere publicar en Datos PBA con esa aclaración contextual.

- **Datos contradictorios entre fuentes:** Señalarlo explícitamente en el cuerpo
  del informe o en una nota al pie, sin omitirlo.

- **El usuario aprueba pero la subida falla:** Registrar el contenido final en
  un archivo local y avisar el error al usuario con los pasos para reintentar.

## Notas adicionales / Variantes

- **Diseño visual:** Los gráficos deben seguir la identidad de Datos PBA
  (paleta, tipografía, logo si corresponde). Si no se tiene la guía de estilos
  actualizada, preguntar al usuario o usar los colores que se observan en el sitio.

- **Variante corta:** Si el usuario pide solo un "resumen" o "tarjeta para redes",
  producir únicamente el título, subtítulo y la card de hallazgos clave, sin
  el cuerpo completo.

- **Informes comparativos:** Si los datos abarcan varios municipios, considerar
  una tabla comparativa además del gráfico principal.

- **Encuadre político:** Por defecto, el análisis se enmarca desde la perspectiva
  editorial de Datos PBA (provincia de Buenos Aires). Si el usuario pide un
  encuadre específico (oposición, gestión, sector sindical, etc.), aplicarlo
  explícitamente.

- **Subida a la web:** El paso de publicación depende de que esté configurado
  el conector o API de Datos PBA. Si no está disponible, entregar el archivo
  final listo para subida manual.
