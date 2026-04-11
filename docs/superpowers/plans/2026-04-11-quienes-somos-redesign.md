# QuienesSomos Redesign — Ajuste Fino Think Tank

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar elementos decorativos genéricos (iconos con fondos de colores) de la página QuienesSomos y reemplazarlos con jerarquía tipográfica, haciéndola lucir menos como una plantilla IA.

**Architecture:** Un solo archivo `src/pages/QuienesSomos.jsx` modificado. No hay lógica nueva ni componentes extra — solo cambios de JSX/Tailwind. El layout estructural (grid, columnas, animaciones) no se toca.

**Tech Stack:** React, Tailwind CSS, framer-motion (existente, sin cambios)

---

## Files

- Modify: `src/pages/QuienesSomos.jsx`

---

### Task 1: Limpiar imports de lucide-react y `STAT_META`

Los íconos de lucide-react dejan de usarse tras este rediseño. Hay que eliminarlos del import y del array `STAT_META`.

**Files:**
- Modify: `src/pages/QuienesSomos.jsx:1-11`

- [ ] **Step 1: Reemplazar el import de lucide-react**

En `src/pages/QuienesSomos.jsx`, línea 3, cambiar:

```js
import { BarChart2, Database, FileText, MapPin, Users, Target, Eye, TrendingUp } from 'lucide-react'
```

por — eliminar el import completo (ningún icono queda en uso):

```js
// (línea eliminada — ningún icono lucide-react queda en uso)
```

- [ ] **Step 2: Actualizar `STAT_META` — sacar la propiedad `icon` y `color`**

Reemplazar el array completo (líneas 6-11):

```js
const STAT_META = [
  { label: 'Informes publicados' },
  { label: 'Datasets abiertos' },
  { label: 'Municipios analizados' },
  { label: 'Bonaerenses representados' },
]
```

- [ ] **Step 3: Actualizar `makeStats` para que no propague propiedades eliminadas**

Las líneas 68-73 actualmente hacen `{ ...STAT_META[0], value: inf }`. Como `STAT_META` ya no tiene `icon` ni `color`, el spread sigue funcionando sin cambios. Verificar que la función no necesita ajuste — no lo necesita.

- [ ] **Step 4: Commit**

```bash
git add src/pages/QuienesSomos.jsx
git commit -m "refactor: remove lucide-react icons and color props from QuienesSomos"
```

---

### Task 2: Rediseñar las stats cards

Reemplazar las cajas de íconos con colores por un borde izquierdo oscuro y labels en uppercase.

**Files:**
- Modify: `src/pages/QuienesSomos.jsx` — sección stats grid (aprox. líneas 112-130)

- [ ] **Step 1: Reemplazar el render de cada stat card**

Localizar el bloque dentro del `.map((s, i) => ...)` de stats. Reemplazar el contenido del `m.div` interior:

**Antes:**
```jsx
className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col gap-3"
>
  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
    <s.icon className="w-5 h-5" />
  </div>
  <div>
    <p className="text-3xl font-bold text-[#0a1628] leading-none">{s.value}</p>
    <p className="text-xs text-slate-500 mt-1 leading-snug">{s.label}</p>
  </div>
```

**Después:**
```jsx
className="bg-white rounded-2xl border border-slate-200/60 border-l-[3px] border-l-[#0a1628] p-5 flex flex-col gap-2"
>
  <p className="text-3xl font-bold text-[#0a1628] leading-none">{s.value}</p>
  <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-snug">{s.label}</p>
```

- [ ] **Step 2: Verificar en el browser que las 4 cards se ven correctas**

Abrir la app en desarrollo (`npm run dev` o el servidor existente). Navegar a `/quienes-somos`. Las cards deben mostrar solo el número y el label, con una línea azul oscuro a la izquierda, sin íconos ni fondos de colores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/QuienesSomos.jsx
git commit -m "style: replace colored icon boxes with left border in stats cards"
```

---

### Task 3: Rediseñar los Pilares

Reemplazar las cards individuales con íconos por items de lista separados con `border-bottom`.

**Files:**
- Modify: `src/pages/QuienesSomos.jsx` — sección Pilares (aprox. líneas 163-188)

- [ ] **Step 1: Cambiar el contenedor exterior de Pilares**

Localizar el `m.div` contenedor de los pilares (el que tiene `className="flex flex-col gap-4"`). Cambiar su className:

**Antes:**
```jsx
className="flex flex-col gap-4"
```

**Después:**
```jsx
className="flex flex-col divide-y divide-slate-100"
```

- [ ] **Step 2: Reemplazar cada pilar card por un item de lista**

Dentro del `.map((p, i) => ...)`, reemplazar el `m.div` con border/background por uno sin card propia:

**Antes:**
```jsx
className="bg-white rounded-xl border border-slate-200/60 p-5 flex gap-4"
>
  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
    <p.icon className="w-5 h-5 text-brand-700" />
  </div>
  <div>
    <p className="font-semibold text-[#0a1628] mb-1">{p.title}</p>
    <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
  </div>
```

**Después:**
```jsx
className="py-4 flex flex-col gap-1"
>
  <p className="font-semibold text-[#0a1628]">{p.title}</p>
  <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
```

- [ ] **Step 3: Verificar en el browser**

Los tres pilares deben aparecer como texto separado por líneas finas horizontales, sin cajas, sin íconos, sin fondos.

- [ ] **Step 4: Commit**

```bash
git add src/pages/QuienesSomos.jsx
git commit -m "style: replace icon cards with borderless list items in Pilares"
```

---

### Task 4: Actualizar headers de las visualizaciones

Sacar los íconos de los headers de "Cobertura temática" y "Distribución geográfica" y agregar un kicker en uppercase.

**Files:**
- Modify: `src/pages/QuienesSomos.jsx` — sección visualizaciones (aprox. líneas 200-225)

- [ ] **Step 1: Actualizar el header de "Cobertura temática"**

Localizar el bloque:
```jsx
<div className="flex items-center gap-2 mb-6">
  <BarChart2 className="w-5 h-5 text-brand-600" />
  <h3 className="text-lg font-bold text-[#0a1628]">Cobertura temática</h3>
</div>
```

Reemplazarlo por:
```jsx
<div className="mb-6">
  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Análisis</p>
  <h3 className="text-lg font-bold text-[#0a1628]">Cobertura temática</h3>
</div>
```

- [ ] **Step 2: Actualizar el header de "Distribución geográfica"**

Localizar el bloque:
```jsx
<div className="flex items-center gap-2 mb-6">
  <MapPin className="w-5 h-5 text-brand-600" />
  <h3 className="text-lg font-bold text-[#0a1628]">Distribución geográfica</h3>
</div>
```

Reemplazarlo por:
```jsx
<div className="mb-6">
  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Geografía</p>
  <h3 className="text-lg font-bold text-[#0a1628]">Distribución geográfica</h3>
</div>
```

- [ ] **Step 3: Verificar en el browser**

Las dos cards de visualización deben tener el kicker en gris claro sobre el título, sin íconos. El gráfico de barras y el donut no deben verse afectados.

- [ ] **Step 4: Commit final**

```bash
git add src/pages/QuienesSomos.jsx
git commit -m "style: replace chart icons with uppercase kickers in visualization headers"
```

---

## Verificación final

- [ ] Navegar por toda la página `/quienes-somos` y confirmar que no hay íconos de lucide-react visibles en ninguna sección
- [ ] Confirmar que el import de lucide-react fue eliminado (no debe quedar ninguna referencia)
- [ ] Confirmar que las animaciones framer-motion siguen funcionando (stats y pilares entran en viewport)
- [ ] Confirmar que la sección oscura "¿Qué producimos?" no fue alterada
