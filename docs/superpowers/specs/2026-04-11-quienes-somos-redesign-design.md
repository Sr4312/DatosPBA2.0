# QuienesSomos — Rediseño ajuste fino (Think Tank)

**Fecha:** 2026-04-11  
**Dirección:** Think Tank / Institución — mismo layout, menos decoración  
**Alcance:** Solo `src/pages/QuienesSomos.jsx`

## Objetivo

Reducir la apariencia genérica de plantilla IA eliminando elementos decorativos (iconos con fondos de colores, badges coloreadas) y reemplazándolos con jerarquía tipográfica. El layout estructural no cambia.

---

## Cambios por sección

### 1. Stats grid (`STAT_META` + render)

**Antes:** cada stat card tiene un `div` con icono Lucide dentro de un fondo de color (`bg-blue-50 text-blue-700`, etc.)

**Después:**
- Eliminar el `div` de icono completo (`w-10 h-10 rounded-xl ...` y el `<s.icon>`)
- Agregar `border-l-2 border-[#0a1628]` a la card principal (junto al borde existente)
- El label (`text-xs text-slate-500`) pasa a `text-[10px] text-slate-400 uppercase tracking-wide`
- Eliminar `STAT_META[].color` — ya no se usa

### 2. Pilares (`PILARES` + render)

**Antes:** cada pilar es una card (`bg-white rounded-xl border p-5`) con icono en `bg-brand-50` + título + descripción

**Después:**
- Eliminar el `div` de icono (`w-10 h-10 rounded-lg bg-brand-50 ...` y el `<p.icon>`)
- Reemplazar las cards individuales (`m.div` con border) por items de lista separados con `border-b border-slate-100 py-4` (sin background propio, sin border-radius)
- El contenedor exterior (`flex flex-col gap-4`) pasa a `divide-y divide-slate-100`
- Eliminar `PILARES[].icon` — ya no se usa

### 3. Headers de visualizaciones (cobertura temática + distribución geográfica)

**Antes:** `<BarChart2 className="w-5 h-5 text-brand-600" />` + `<h3>` en la misma fila

**Después:**
- Eliminar el icono (`BarChart2`, `MapPin` y su `div` contenedor `flex items-center gap-2`)
- Agregar un kicker sobre el título: `<p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Análisis</p>` y `<p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Geografía</p>`
- El `<h3>` queda solo, sin icono al lado
- Eliminar los imports de `BarChart2` y `MapPin` de lucide-react si no se usan en otro lugar

### 4. Imports de lucide-react

Verificar qué íconos quedan en uso tras los cambios:
- `FileText`, `Database`, `MapPin`, `Users` — usados en `STAT_META` → **eliminar** (sacar de STAT_META también)
- `Eye`, `Target`, `TrendingUp` — usados en `PILARES` → **eliminar**
- `BarChart2` — usado en header de cobertura temática → **eliminar**
- `MapPin` — usado en header de distribución geográfica → **eliminar**

Resultado: el import de lucide-react se elimina completamente.

---

## Lo que NO cambia

- Layout de dos columnas (misión + pilares)
- Grid de stats (2x2 en mobile, 4 columnas en desktop)
- Gráfico de barras (`BarSimple`) — barras, colores, animación
- Donut chart SVG — colores, datos, leyenda
- Sección oscura "¿Qué producimos?" — sin cambios
- Hero section — sin cambios
- Animaciones framer-motion — sin cambios
- Datos y textos — sin cambios

---

## Archivos afectados

- `src/pages/QuienesSomos.jsx` — único archivo a modificar
