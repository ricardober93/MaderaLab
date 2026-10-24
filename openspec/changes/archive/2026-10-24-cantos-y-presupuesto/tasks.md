# Tasks — cantos-y-presupuesto

## 1. Modelo de datos + motor

- [x] 1.1 `Piece.cantos?: 'sin_canto' | 'largo' | 'cuatro_lados'` y `Piece.cantosCustom?: boolean` en `src/types/index.ts`.
- [x] 1.2 Defaults de canto por kind en generadores de `src/lib/parametric.ts` (fondo→sin_canto, puerta→cuatro_lados, resto tablero→largo).
- [x] 1.3 `mergePieces`: conservar `cantos` previo solo con `cantosCustom:true` (y propagar el flag) — patrón materialCustom.
- [x] 1.4 Acción `updatePieceCantos(pieceId, cantos)` en `projectStore` con flag `cantosCustom`.
- [x] 1.5 Golden tests verdes tras el cambio (geometría/herrajes: los cantos no tocan geometría; si hardware cambia, solo por 1.7).

## 2. Herrajes normalizados

- [x] 2.1 Generadores emiten herrajes por id de catálogo + nombre/spec unificados (mismo set actual, revisado a ojo).
- [x] 2.2 Regenerar `test/fixtures/hardware.json` (DELETE + `UPDATE_GOLDEN=1 npm test`) y validar diff: solo ids formato spec, cero cambio de cantidades.

## 3. Cantos UI

- [x] 3.1 Selector de cantos en PropertiesPanel (select 3 estados por pieza, con hint del default) o control compacto en PropertiesPanel.
- [x] 3.2 `metrajeCanto(piece)` con unit tests (1.536m repisa largo; 5.504m puerta cuatro; 0 sin_canto).

## 4. Precios

- [x] 4.1 `PriceSet` types + defaults en `catalogs.ts` + defaults de material/canto/herrajes.
- [x] 4.2 Persistencia `maderalab_prices` (load/override/save, "Restaurar defaults") en `src/lib/storage.ts` o lib nueva.
- [x] 4.3 Modal de edición de precios (accesible desde modal Presupuesto), formateo es-CL.

## 5. Presupuesto

- [x] 5.1 `src/lib/budget.ts`: `computeBudget(project, prices)` + metraje + agrupaciones + `sinPrecio` + unit tests (estantería sin overrides con fixtures sanos).
- [x] 5.2 Modal "Presupuesto" en Toolbar (patrón Vistas 2D): 3 secciones + total + "Editar precios…".
- [x] 5.3 PDF: sección "Presupuesto" tras herrajes; CSV: bloque separado al final del mismo archivo.
- [x] 5.4 Landing: "≈ $XXX" en card de proyecto (computeBudget sobre proyecto sin abrir).

## 6. Verificación e2e (browser)

- [x] 6.1 Estantería nueva: cantos default aplicados (piezas con largo, fondo sin canto); regenerar cambiando ancho → cantos conservados/editados.
- [x] 6.2 Presupuesto modal: total coherente con el unit test del mismo proyecto; herraje sin precio → línea `sinPrecio` y total sin él.
- [x] 6.3 Editar precio de material → total cambia; restaurar defaults → vuelve.
- [x] 6.4 PDF descargado con sección Presupuesto; CSV con bloque al final; landing con "≈ $XXX".
- [x] 6.5 `npm run build` + `npm run lint` limpios.
