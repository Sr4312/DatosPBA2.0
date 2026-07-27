---
name: anti-slop-audit
description: Auditoría de "olor a IA" sobre UI web. Úsalo antes de commitear cualquier componente, página o rediseño, y cuando el usuario pida revisar si algo "parece generado por IA", "parece una plantilla", "parece landing de SaaS" o pida quitarle esa estética. También se activa al crear componentes nuevos, para evitar los patrones desde el arranque.
---

# Anti-slop audit

Auditoría de patrones que delatan diseño generado por IA o armado con plantilla.
No es una guía de estilo: es un filtro. Se corre **antes** de commitear.

## Cómo se usa

1. Recorré el diff (o el componente indicado) contra las 8 categorías de abajo.
2. Por cada hallazgo, anotá: archivo, línea, categoría, y el reemplazo propuesto.
3. Si un hallazgo tiene justificación real, dejalo y **escribí la justificación**.
   Un patrón de esta lista usado a conciencia y una vez no es slop; usado por default
   y en todas partes, sí.
4. Entregá el resultado como tabla. No apliques cambios sin confirmación salvo que
   el usuario haya dicho que avances solo.

---

## 1. Titulares

- [ ] **Última palabra o segunda línea del titular en color de acento.** El tell más
      reconocible que existe. Si el titular necesita que le marquen dónde está lo
      importante, el titular está mal escrito. **Reemplazo:** reescribir el titular.
- [ ] **Palabra clave en color dentro de un párrafo destacado.** Misma regla. El
      énfasis va por peso tipográfico, y con moderación.
- [ ] **Titular de dos tiempos con paralelismo:** "Datos que importan. Análisis que
      sirven." / "Menos ruido. Más evidencia." **Reemplazo:** una sola frase declarativa
      que diga algo verificable.
- [ ] **Gradiente aplicado a texto** (`bg-clip-text`).

## 2. Eyebrows, numeración y estructura decorativa

- [ ] **Eyebrow en mayúsculas con letterspacing y punto medio** (`SECCIÓN · TEMA · FECHA`).
      Permitido **una vez** por página, si carga información que no está en otro lado.
      Tres variantes del mismo gesto en una página = slop.
- [ ] **Numeración 01 / 02 / 03 de secciones.** Solo válida si el orden **es**
      información: un proceso, una cronología, un ranking. Si las secciones son temas
      intercambiables, la numeración miente. **Reemplazo:** quitarla.
- [ ] **Punto pulsante ("live dot")** al lado de una etiqueta que no describe nada en vivo.
- [ ] **Regla horizontal idéntica bajo cada título de sección.** Si está en todas, no
      separa nada. Dejarla solo donde hay cambio real de nivel.
- [ ] **Iconos decorativos** al lado de títulos o dentro de cards. Un icono se queda solo
      si comunica **estado** o **acción**. `TrendingUp` al lado de "Economía" no comunica.

## 3. El trío de stats

- [ ] **Tres o cuatro números grandes centrados en el hero.** Revisar uno por uno si es
      un dato o un relleno para completar la simetría. Un año ("2026 — ACTUALIZADO"), un
      conteo de contenido propio ("16 informes") o una cifra que ya está en el copy son
      rellenos.
- [ ] **El mismo número repetido en el hero y otra vez más abajo** en la misma página.
- [ ] **Números sin fuente ni fecha** visibles junto a ellos.

**Reemplazo:** menos números, cada uno con variación, período y fuente. Si no hay tres
datos que valgan, poné dos.

## 4. Color con o sin significado

Esta categoría es la más grave: los errores acá no son estéticos, son de rigor.

- [ ] **Verde = subió, rojo = bajó.** El color codifica **valoración**, no dirección.
      Desempleo que sube, inflación que sube, informalidad que sube: eso **no** es verde.
      Cada indicador necesita declarar explícitamente si más es mejor, peor o neutro.
- [ ] **Arcoíris decorativo:** N cifras en N colores distintos sin criterio.
- [ ] **Dos sistemas de color para lo mismo** en la misma página (ej: cifras de colores
      en el hero, todas monocromas en el cuerpo).
- [ ] **Acento de marca usado para UI y para datos indistintamente.** Separar: colores de
      dato (series de gráfico) vs. colores de interfaz (links, foco, estados).
- [ ] **Paleta que no coincide con la de las piezas que la marca publica en redes.**
- [ ] **Contraste por debajo de 4.5:1** en texto de cuerpo, 3:1 en texto grande y en
      elementos gráficos portadores de información.
- [ ] **Información codificada solo por color**, sin etiqueta, forma o posición redundante.

## 5. Superficie: cards, radios, sombras, gradientes

- [ ] **`rounded-2xl` / `rounded-3xl` como default.** Un radio grande es una decisión,
      no un punto de partida.
- [ ] **Card dentro de card.** Si el fondo ya es una superficie elevada, la de adentro no
      necesita borde + sombra + radio otra vez.
- [ ] **Sombras de Tailwind por default** (`shadow-sm/md/lg`) como único recurso de
      separación. **Reemplazo:** borde de 1px o cambio de fondo sólido.
- [ ] **Borde izquierdo de color en cards** como recurso decorativo repetido.
- [ ] **Gradientes de fondo sutiles**, blobs blureados, franjas diagonales, glows.
- [ ] **Geometría decorativa:** círculos concéntricos, grillas de puntos, líneas
      diagonales en esquinas de cards.
- [ ] **Píldoras en todos lados:** nav, tabs, badges, botones, chips, todos con
      `rounded-full`. Cinco componentes con la misma forma = ninguno se distingue.
- [ ] **Callout crema/celeste con borde de color** estilo sitio de documentación, usado
      en una publicación editorial.

## 6. Cromos flotantes

- [ ] **Navbar flotante en píldora despegada del borde superior**, con sombra y radio
      grande. Y si existe, verificar que tenga `scroll-margin-top` en los anclajes y que
      no tape contenido al scrollear.
- [ ] **Botón circular de scroll-to-top** flotante abajo a la derecha.
- [ ] **Badges "NUEVO" / "BETA" / "PRÓX."** con fondo de color.
- [ ] **Botón de acción huérfano** alineado a la derecha sin relación visual con el
      bloque que actúa sobre él (ej: "Descargar PNG" flotando arriba del gráfico).

## 7. Movimiento

- [ ] **Fade-up de entrada en cada bloque** (`initial={{opacity:0,y:20}}`). Si entra todo
      igual, nada tiene peso. **Reemplazo:** eliminar del layout; dejar solo transiciones
      de estado de 120–150ms.
- [ ] **Animaciones sin `prefers-reduced-motion`.**
- [ ] **Contadores animados** subiendo hasta la cifra final.
- [ ] **Parallax** o reveals encadenados al scroll.

## 8. Copy y estados

- [ ] **Frases de dos tiempos con paralelismo.**
- [ ] **"Todo en un solo lugar" / "sin ruido" / "basado en evidencia" como tagline vacía.**
- [ ] **Guion largo retórico** usado como pausa dramática.
- [ ] **Title Case** en botones y títulos en castellano. Va sentence case.
- [ ] **Empty state con icono dentro de un círculo** y una frase genérica. Un estado vacío
      es una invitación a actuar: decí qué hacer y por qué vale la pena.
- [ ] **Errores que se disculpan** o que no dicen qué pasó ni cómo se arregla.
- [ ] **Etiquetas que nombran el sistema y no lo que la persona controla.**

---

## Densidad (transversal)

Contá cuántos datos entrega la página por pantalla de scroll. Para un sitio de datos,
si hay menos de 4–5 unidades de información por pantalla, el problema no es ninguno de
los puntos anteriores: es que sobra aire y falta contenido a la vista. Comprimir antes de
seguir puliendo.

## Formato de salida

```
| # | Archivo:línea | Categoría | Hallazgo | Reemplazo propuesto | Severidad |
```

Severidad: **alta** (error semántico, accesibilidad, o tell de primer orden como el
titular en color), **media** (patrón repetido sin justificación), **baja** (detalle).
Cerrá con un conteo por categoría y con las 3 correcciones de mayor impacto.
