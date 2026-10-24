# Design — cantos-y-presupuesto

## Context

El proyecto tiene un motor paramétrico con `cutDimension` (largo/ancho/grosor en mm) y merge por `generationKey`. Existe `generateCutList` (agrupa por kind+dims+material) consumido por PDF/CSV. Herrajes: `project.hardware` agregado por generadores con ids ad-hoc (`hc-1`, `hc-m1`, `hc-mesa-1` = mismo tornillo) y especificaciones con dos formatos (`5x50mm` vs `5 × 50mm`). El catálogo `HERRAJES[]` incluye `canto_melaninico` (`porArista: 1`) sin consumidor ni precio. No hay nada de precios en el modelo de datos.

El "Dashboard" real es el landing de proyectos (cards). Los modals existentes (Vistas 2D, Atajos) fijan el patrón a imitar.

## Goals / Non-Goals

**Goals:**
- Presupuesto veraz y trazable: cada línea del costo se deriva del estado del proyecto (piezas + herrajes + cantos), no de inputs libres.
- Cantos con defaults prácticos de taller y un solo override por pieza que sobrevive la regeneración.
- Precios globales editables con defaults sensatos y matching determinístico de herrajes.
- Presupuesto en 3 superficies: modal in-app, PDF/CSV, card del landing.

**Non-Goals:**
- Renderizar el canto en 3D (banda de ~1mm: invisible, complejidad alta).
- Optimización de corte de planchas (nesting) — otro change.
- Márgenes de negocio, honorarios, IVA: el precio es una suma directa de costos de materiales.
- Cantos por arista individual (4 flags) — el select de 3 estados cubre el uso real; posible v2.

## Decisions

### D1 — Canto como enum de 3 estados en la pieza (no 4 flags)

`Piece.cantos?: 'sin_canto' | 'largo' | 'cuatro_lados'`. Semántica sobre la cara de corte (`cutDimension`): `largo` = las 2 aristas mayores cantadas; `cuatro_lados` = las 4. Metraje = Σ aristas seleccionadas / 1000 (mm→m).

*Alternativa descartada*: 4 booleans por arista — es el dato correcto para un nesting profesional, pero la UI de 4 toggles por pieza es pesada; el select cubre el 95% del uso con un enum trivial de mergear.

### D2 — Defaults por kind en los generadores; override con flag `cantosCustom`

Generadores setean `cantos` canónico por kind: `fondo` → sin_canto; `puerta` → cuatro_lados; `tapa`/`base`/`repisa`/`entrepano`/`lateral` → largo (bordes visibles al frente). Mismo patrón ya probado dos veces (`nombreCustom`, `materialCustom`): la edición por pieza marca `cantosCustom: true`; `mergePieces` conserva `cantos` previo solo con flag; si no, toma el canónico. La regla se define auto-contenida en la spec de `cantos`, para no volver a picar el requirement de merge de `regeneracion-segura` (ya modificado dos veces).

Piezas legadas sin `cantos`: obtienen el default canónico en la próxima regeneración — un solo comportamiento para legados y proyectos nuevos.

*Alternativa descartada*: defaults "nada" para todo y que el usuario marque a mano — el appart no refleja la práctica de taller (una puerta sin canto es un error, no una elección) y el usuario tendría que marcar 20 piezas por proyecto.

### D3 — Herrajes con ids canónicos del catálogo (normalización deliberada)

Los 5 generadores emiten herrajes por id de catálogo (`tornillo_confirmat_5x50`, etc.), con nombre/especificación unificados. El golden `hardware.json` congela `id`: se regenera el fixture (borrar + `UPDATE_GOLDEN=1 npm test`) en su tarea con el diff revisado — nombres y cantidades NO deben cambiar, solo ids y formato de spec.

*Alternativa descartada*: tarifar por nombre+especificación normalizada con matching difuso — matching frágil y no resuelve los ids duplicados que venderían UI de precios confusa.

### D4 — Precios globales, overlay sobre defaults, no por proyecto

`PriceSet = { materiales: Record<materialId, number>, cantos: Record<cantoId, number>, herrajes: Record<herrajeId, number>, moneda: 'CLP' }`. Defaults en `catalogs.ts`. Moneda CLP (`$` + separador de miles `.` vía `Intl.NumberFormat('es-CL')`), campo `moneda` en el set por si cambia la audiencia. Persistencia en `localStorage` key propia (`maderalab_prices`). Modal de edición desde el modal Presupuesto y desde el landing; acción "Restaurar defaults". Herraje sin precio → total muestra la línea con flag `sinPrecio` y $0 en esa línea (nunca se inventa valor).

*Alternativa descartada*: precios por proyecto — los costos unitarios no son propiedad del mueble; per-proyecto duplicaría el input.

### D5 — `computeBudget(project, prices)` como única fuente del número

`src/lib/budget.ts` (función pura):

```
budget = {
  materiales: [{ materialId, nombre, m2, unit, total }],
  cantos:     [{ cantoId, nombre, metros, unit, total }],
  herrajes:   [{ id, nombre, especificacion, cantidad, unit, total, sinPrecio? }],
  total,
  sinPrecios: cantidadDeÍtems
}
```

- m² = Σ (largo × ancho / 1e6) × cantidad (mm → m²).
- metros de canto = por pieza: `largo` → 2×max(largo,ancho)/1000... cuidado: aristas mayores son 2 × el lado mayor de la cara y aristas menores 2 × el lado menor; `cuatro_lados` suma las 4.
- Herrajes: match directo por id (D3).

Unit tests de la función; modal, PDF y card la consumen sin duplicar lógica.

### D6 — Presupuesto en 3 superficies (modal, PDF/CSV, landing card)

- Modal en Toolbar (patrón OrthographicView): secciones Materiales / Cantos / Herrajes / TOTAL + botón "Editar precios…" que abre la edición inline.
- PDF: sección "Presupuesto" después de herrajes (materiales, cantos, herrajes, total). La cut list queda sin columnas $ para no mezclar planos con pagos. El CSV agrega el presupuesto como bloque separado en el mismo archivo.
- Landing: "≈ $XXX" en cada card de proyecto (computable solo con el estado guardado, sin abrirlo).

## Risks / Trade-offs

- **[Moneda hardcodeada a es-CL/CLP]** → mitigado: `moneda` en PriceSet; formateo via Intl.
- **[Golden de hardware regenerado]** → deliberado y con diff revisado tarea por motivo; si el diff muestra algo además de ids/formatos, es un bug de refactor y se reverte.
- **[Metros de canto asumen cara de corte rectangular]** → válido: todas las piezas del modelo son prims rectangular; piezas no rectangulares son change futuro.
- **[Precio faltante de herraje]** → visible como `sinPrecio` en modal/PDF ($0), evita totales mentirosos e invita a completar la lista de precios.

## Migration Plan

Sin migración de datos: `cantos`/`cantosCustom` opcionales (undefined → default canónico en próxima regeneración) y `maderalab_prices` se llena con defaults al primer uso. Rollback = revert; los proyectos guardados con los campos nuevos los tolera un build viejo (JSON extra keys ignoradas).

## Open Questions

(ninguna — D1 enum de 3 estados, D2 defaults por kind con override, D3 normalizar ids, D4 precios globales CLP, D5 función pura, D6 tres superficies: decididas en la sesión de explore)
