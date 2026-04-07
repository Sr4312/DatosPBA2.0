---
name: generador-tweet
description: >
  Este skill genera un tweet o hilo de X listo para publicar desde la cuenta
  de Datos PBA. Debe activarse cuando el usuario provea datos, texto o un
  informe ya redactado y pida armar un tweet, posteo o hilo para redes.
  También se activa si el usuario dice "pasame esto a tweet", "haceme un hilo",
  "armá el posteo para X" o similares. No activar si no hay ningún dato o
  contenido de base provisto.
---
 
# Generador de Tweets / Hilos — Datos PBA
 
Skill para producir tweets simples o hilos de X (Twitter) a partir de datos,
informes o análisis político-territorial de la provincia de Buenos Aires, en el
tono y estilo editorial de Datos PBA.
 
## Cuándo usarlo
 
- El usuario tiene datos, un informe ya redactado o estadísticas sueltas y quiere
  convertirlos en un posteo para X.
- El usuario quiere publicar contenido breve con un gráfico en la cuenta de Datos PBA.
- El usuario dice "haceme el tweet de este informe", "pasalo a hilo", etc.
 
**No activar** si no hay ningún dato, archivo, texto o informe de base provisto.
 
## Inputs esperados
 
- Texto, estadísticas, CSVs o informe ya redactado (puede venir del skill
  `generador-informe`).
- Indicación opcional del municipio, partido o región foco del posteo.
- Indicación opcional del formato deseado: tweet único o hilo.
 
Si no se indica formato, Claude debe evaluar la cantidad de información y
sugerir el más adecuado (ver criterio en la sección de proceso).
 
## Proceso paso a paso
 
1. **Analizar el material provisto.** Identificar el dato o hallazgo más
   potente — el que justifica el posteo. En un tweet, solo hay espacio para
   una idea principal.
 
2. **Decidir formato:**
   - **Tweet único:** cuando hay un solo hallazgo central y el contexto es
     inmediato (1 gráfico + 1 párrafo corto ≤ 280 caracteres + fuente).
   - **Hilo:** cuando hay 2 o más hallazgos que se complementan, o cuando el
     contexto necesario para entender el dato requiere más de un tweet
     (recomendado: 3 a 6 tweets, máximo 8).
 
3. **Redactar el copy:**
   - **Tweet único:** una oración de gancho + el dato clave + fuente abreviada
     (ej: "Fuente: INDEC EPH Q4 2025"). Total ≤ 280 caracteres.
   - **Hilo:**
     - Tweet 1 (gancho): pregunta, afirmación fuerte o dato sorprendente.
       Debe funcionar solo, sin leer el resto.
     - Tweets 2–N (desarrollo): un hallazgo o argumento por tweet. Cada uno
       autónomo pero conectado al anterior.
     - Tweet final: conclusión, implicancia política o llamado a la acción
       (visitar el informe completo, seguir la cuenta, etc.).
   - Tono: directo, sin jerga, con precisión técnica. Evitar adjetivos vacíos.
     Se puede usar 1 emoji por tweet si suma claridad (📊 🗺️ 📉), nunca
     como relleno.
 
4. **Generar el gráfico:**
   - Siempre incluir una visualización. Es la pieza central del posteo.
   - Seguir el diseño visual de Datos PBA (paleta, tipografía, logo si corresponde).
   - En un tweet único: 1 gráfico que sintetice el hallazgo principal.
   - En un hilo: 1 gráfico por tweet si los datos lo justifican; mínimo 1
     gráfico en el tweet de gancho.
   - Si no hay datos suficientes para un gráfico: avisar y pedir los datos
     faltantes. No postear sin visualización.
 
5. **Agregar la fuente** al pie del gráfico o al final del copy del tweet
   (nombre del organismo + período). No omitir nunca.
 
6. **Presentar el borrador al usuario** para revisión antes de publicar.
 
## Output esperado
 
### Formato tweet único
 
```
📊 [Oración gancho con el dato clave]
 
[Contexto mínimo necesario — 1 línea]
 
Fuente: [Organismo, período]
```
+ 1 gráfico adjunto en estilo Datos PBA.
 
---
 
### Formato hilo
 
```
🧵 [Tweet 1 — Gancho. Debe funcionar solo.]
 
—
 
[Tweet 2 — Hallazgo 1 + dato]
 
—
 
[Tweet 3 — Hallazgo 2 o contexto]
 
—
 
[Tweet N — Conclusión / CTA]
📎 Informe completo: [link si aplica]
```
+ 1 gráfico mínimo (en tweet 1); gráficos adicionales en tweets subsiguientes
  si los datos lo justifican.
 
---
 
## Casos borde / Errores comunes
 
- **Datos sin fuente clara:** Preguntar de dónde provienen antes de armar el
  posteo. No asumir ni inventar fuentes.
 
- **Demasiada información para un tweet, poca para un hilo:** Sugerir el
  formato más adecuado y explicar por qué. Si el usuario insiste en tweet
  único con mucho contenido, priorizar el dato más potente y descartar el resto.
 
- **PNG de gráfico sin datos crudos:** Extraer valores visibles e informar al
  usuario que se está estimando; pedir confirmación antes de publicar.
 
- **Tema fuera del ámbito de PBA:** Aclarar el encuadre y preguntar si igual
  se quiere publicar con esa nota contextual.
 
- **El usuario ya tiene el informe del skill `generador-informe`:** Usar
  directamente los hallazgos clave y el gráfico ya producido; adaptar el copy
  al límite de caracteres sin regenerar el análisis desde cero.
 
## Notas adicionales / Variantes
 
- **Variante "tarjeta para redes":** Si el usuario pide solo una imagen sin
  copy (para reusar en Instagram o WhatsApp), producir únicamente el gráfico
  con título integrado en la imagen, sin redactar tweet.
 
- **Encuadre político:** Por defecto, el tono es el editorial de Datos PBA.
  Si el usuario pide un ángulo específico, aplicarlo explícitamente.
 
- **Longitud de hilo:** No superar 8 tweets. Si el contenido es más extenso,
  recomendar publicar el informe completo y hacer un hilo resumen de 4–5 tweets
  que lleve al link.
 
- **Caracteres:** Contar siempre los caracteres del copy (incluyendo espacios y
  emojis). Recordar que X descuenta caracteres por links adjuntos (~23 chars).