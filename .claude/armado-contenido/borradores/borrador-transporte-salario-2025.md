# Borrador — Informe Transporte / Salario (dic-2025)

> Encuadre: dato nacional, foco editorial en el contraste AMBA (PBA vs CABA).
> Estado: **borrador para revisión**, no subido a Supabase.

---

## Título
**El AMBA concentra los dos extremos del transporte argentino: en PBA pesa casi 3 veces más que en CABA**

## Subtítulo
Con 40 boletos mensuales, la incidencia del transporte urbano sobre el salario neto va de 0,93 % en Capital Federal a 2,67 % en la Provincia de Buenos Aires — y trepa hasta 4,12 % en Corrientes. La asimetría tarifaria que define el bolsillo del trabajador, según datos del Ministerio de Capital Humano para diciembre 2025.

## Datos de encuadre
- **Alcance**: 24 jurisdicciones (23 provincias + CABA).
- **Indicador**: % del salario neto promedio destinado a 40 boletos urbanos mensuales.
- **Período**: diciembre 2025.
- **Tema**: Económico — costo de vida / transporte.
- **Fecha de publicación**: 4 may. 2026.

## Card de hallazgos clave (insights)

1. **Provincia de Buenos Aires: 2,67 %** — posición 12 de 24, misma incidencia que Tucumán. Casi 3 veces lo que paga un porteño (0,93 %).
2. **CABA es la jurisdicción con menor presión tarifaria del país** (0,93 %), por subsidios diferenciales al transporte metropolitano.
3. **El NEA paga el doble que el AMBA**: Corrientes (4,12 %), Chaco (4,08 %), Formosa (3,54 %) y Misiones (3,22 %) superan el 3 %.
4. **La Patagonia es la región más liviana después de CABA**: Chubut (1,34 %) y Tierra del Fuego (1,36 %) cierran el ranking.

## Cuerpo (5 párrafos + viz intercalada)

```jsonc
[
  "Cuántas horas de trabajo se van en moverse al trabajo. Esa es la pregunta detrás del indicador que el Ministerio de Capital Humano publicó para diciembre de 2025: qué porcentaje del salario neto promedio de cada provincia consumen 40 boletos de transporte urbano — el viaje típico ida y vuelta de un trabajador durante 20 días al mes. La respuesta dibuja un mapa nítido de desigualdad federal.",

  {"viz": "v-incidencia-transporte-salario-2025"},

  "La Provincia de Buenos Aires aparece en el medio del ranking, en el puesto 12 con 2,67 % — la misma incidencia que Tucumán, por encima de Río Negro (2,16 %) y todas las provincias patagónicas, por debajo de Córdoba (2,85 %), Mendoza (2,79 %) y todo el NEA. Es decir: el bonaerense promedio destina algo menos de un día y medio de salario por mes a moverse al trabajo en colectivo.",

  "Pero el dato políticamente más relevante está dentro del AMBA. Mientras un trabajador porteño usa el 0,93 % de su salario en 40 boletos, un trabajador bonaerense usa el 2,67 % — una diferencia de casi tres veces dentro del mismo aglomerado urbano. La brecha no se explica por distancias ni por costos operativos: se explica por la asimetría histórica de subsidios al transporte metropolitano. La SUBE, los ramales suburbanos y el transporte interjurisdiccional reciben un esquema de compensaciones distinto al de los colectivos urbanos provinciales y municipales que mueven a la mayoría del conurbano dentro de PBA.",

  "En el otro extremo del país, el NEA paga el doble que el AMBA. Corrientes, Chaco, Formosa y Misiones combinan tarifas urbanas relativamente altas con salarios netos bajos — la fórmula que dispara la incidencia por encima del 3 %. Allí, mover al trabajador al trabajo consume más de un día completo de salario al mes. La Patagonia muestra el patrón opuesto: salarios más altos y subsidios provinciales fuertes mantienen la incidencia debajo del 1,5 % en Chubut, Tierra del Fuego y Santa Cruz.",

  "Cualquier reforma del régimen de subsidios al transporte va a sentirse, antes que en ningún otro lado, en la Provincia de Buenos Aires. PBA hoy es la jurisdicción más expuesta del esquema metropolitano: si los subsidios se redistribuyen hacia el interior, el conurbano paga la diferencia; si se quitan, la incidencia salarial podría duplicarse rápido y acercarse al 5 %. La discusión sobre quién financia el viaje al trabajo no es técnica — define el costo real de vivir en el conurbano."
]
```

## Visualización a recrear

```jsonc
{
  "id": "v-incidencia-transporte-salario-2025",
  "titulo": "Incidencia del transporte urbano sobre el salario neto — 40 boletos, dic-2025 (% del salario)",
  "tema": "Económico",
  "tipo": "bar",
  "fuente": "Ministerio de Capital Humano de la Nación",
  "fecha": "Dic. 2025",
  "fecha_orden": "2025-12-01",
  "informe_url": "/informes/transporte-salario-2025",
  "chart_data": {
    "labels": [
      "Corrientes","Chaco","Formosa","Misiones",
      "Santa Fe","Entre Ríos","Córdoba","Santiago del Estero","Mendoza","Salta","Tucumán","Buenos Aires","Jujuy","Catamarca","Río Negro",
      "San Juan","La Pampa","San Luis","Neuquén","La Rioja","Santa Cruz","Tierra del Fuego","Chubut","Capital Federal"
    ],
    "datasets": [{
      "label": "% del salario neto en 40 boletos",
      "data": [4.12,4.08,3.54,3.22,2.86,2.85,2.85,2.79,2.79,2.74,2.67,2.67,2.49,2.34,2.16,1.98,1.87,1.82,1.80,1.63,1.44,1.36,1.34,0.93],
      "backgroundColor": [
        "#b91c1cbb","#b91c1cbb","#b91c1cbb","#b91c1cbb",
        "#b45309bb","#b45309bb","#b45309bb","#b45309bb","#b45309bb","#b45309bb","#b45309bb","#1ab8b8bb","#b45309bb","#b45309bb","#b45309bb",
        "#0d9488bb","#0d9488bb","#0d9488bb","#0d9488bb","#0d9488bb","#0d9488bb","#0d9488bb","#0d9488bb","#1ab8b8bb"
      ],
      "borderColor": [
        "#b91c1c","#b91c1c","#b91c1c","#b91c1c",
        "#b45309","#b45309","#b45309","#b45309","#b45309","#b45309","#b45309","#1ab8b8","#b45309","#b45309","#b45309",
        "#0d9488","#0d9488","#0d9488","#0d9488","#0d9488","#0d9488","#0d9488","#0d9488","#1ab8b8"
      ],
      "borderWidth": 1,
      "borderRadius": 4
    }]
  },
  "chart_options": {
    "indexAxis": "y",
    "plugins": {
      "legend": { "display": false },
      "title": { "display": false }
    },
    "scales": {
      "x": {
        "title": { "display": true, "text": "% del salario neto destinado a 40 boletos mensuales" },
        "ticks": { "callback": "v => v + ' %'" }
      },
      "y": {
        "title": { "display": true, "text": "Jurisdicción" }
      }
    }
  }
}
```

**Notas de diseño:**
- Paleta acorde al gráfico original (rojo / ámbar / verde-teal) pero ajustada a la identidad Datos PBA.
- **PBA y CABA destacadas en teal `#1ab8b8`** (color de marca) para subrayar el contraste editorial.
- Eje horizontal con sufijo `%`, font Poppins (preferencia guardada en memoria), labels en ambos ejes.

## Fuentes (campo `fuentes`, obligatorio)

```json
[
  "Ministerio de Capital Humano de la Nación — Salarios netos por provincia, diciembre 2025",
  "Ministerio de Capital Humano de la Nación — Tarifas de transporte público urbano y cálculo de incidencia sobre 40 boletos mensuales (dic-2025)",
  "INDEC — IPC nacional y por región, complemento de actualización tarifaria"
]
```

> ⚠ La imagen original no especifica el documento exacto del Ministerio. **Antes de publicar**, confirmar con el usuario el título y la URL del informe ministerial para citar con precisión.

## SQL listo para subir (post-aprobación)

```sql
INSERT INTO informes VALUES (
  'transporte-salario-2025',
  'El AMBA concentra los dos extremos del transporte argentino: en PBA pesa casi 3 veces más que en CABA',
  'Con 40 boletos mensuales, la incidencia del transporte urbano sobre el salario neto va de 0,93% en Capital Federal a 2,67% en la Provincia de Buenos Aires — y trepa hasta 4,12% en Corrientes.',
  '4 may. 2026', '2026-05-04', 'Económico',
  '[]',
  $$[
    "Cuántas horas de trabajo se van en moverse al trabajo...",
    {"viz": "v-incidencia-transporte-salario-2025"},
    "La Provincia de Buenos Aires aparece en el medio del ranking...",
    "Pero el dato políticamente más relevante está dentro del AMBA...",
    "En el otro extremo del país, el NEA paga el doble que el AMBA...",
    "Cualquier reforma del régimen de subsidios al transporte..."
  ]$$::jsonb,
  $$[
    "Provincia de Buenos Aires: 2,67% — casi 3 veces lo que paga un porteño (0,93%).",
    "CABA es la jurisdicción con menor presión tarifaria del país (0,93%).",
    "El NEA paga el doble que el AMBA: Corrientes 4,12%, Chaco 4,08%, Formosa 3,54%, Misiones 3,22%.",
    "La Patagonia es la región más liviana después de CABA: Chubut 1,34% y Tierra del Fuego 1,36%."
  ]$$::jsonb,
  '/informes/transporte-salario-2025', null, true,
  $$[
    "Ministerio de Capital Humano de la Nación — Salarios netos por provincia, diciembre 2025",
    "Ministerio de Capital Humano de la Nación — Tarifas de transporte público urbano y cálculo de incidencia sobre 40 boletos mensuales (dic-2025)",
    "INDEC — IPC nacional y por región, complemento de actualización tarifaria"
  ]$$::jsonb
);
```

## Pasos siguientes (según `armado-contenido.md`)

1. Revisar y aprobar el borrador (vos).
2. Confirmar/ajustar fuentes (título exacto del documento del Min. Capital Humano).
3. Cargar `INSERT INTO informes` + `INSERT INTO visualizaciones` en Supabase.
4. Sumar el gráfico recreado en la home, al lado del bloque "último informe" (`Home.jsx` ya está modificado en working tree).
