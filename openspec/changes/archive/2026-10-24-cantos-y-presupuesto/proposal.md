# cantos-y-presupuesto

## Why

El catálogo ya trae `canto_melaninico` huérfano (`porArista: 1`, sin precio, sin consumidor) y el mueble se diseña sin la dimensión más común de un corte profesional: qué aristas llevan canto. Sin presupuestar, el app genera planos de corte pero no dice cuánto cuesta construir el mueble: la respuesta que un carpintero necesita antes de cortar. Los herrajes además generan ids internos inconsistentes entre generadores (`hc-1`, `hc-m1`, `hc-mesa-1` = mismo tornillo) y especificaciones con formato no fijo (`5x50mm` vs `5 × 50mm`), lo que impide tarifación estable.

## What Changes

- **Cantos**: `Piece.cantos?: 'sin_canto' | 'largo' | 'cuatro_lados'` con defaults canónicos por kind (`fondo` → sin canto; `puerta` → cuatro lados; internal panels → largo, etc.). Override por pieza con flag `cantosCustom` (patrón `materialCustom`): el merge conserva los cantos solo con flag.
- **Precios**: catálogo de precios global editable (`localStorage` aparte, no por proyecto) con defaults: `$` por m² por material, `$` por metro de canto, `$` por unidad herraje. Modal de edición accesible.
- **Presupuesto**: `computeBudget(project, prices)` pura (área × $/m² + metros de canto × $/m + herrajes × $/ud). Modal "Presupuesto" (patrón Vistas 2D), sección en PDF y card del proyecto en landing con estimado.
- **Herrajes normalizados**: generadores emiten ids/anames/specs canónicos del catálogo para tarifación estable; las invariantes de hardware se regeneran deliberadamente (fixture congelado, workflow existente).

## Capabilities

### New Capabilities

- `cantos`: cantos por pieza, defaults por kind, override y sobrevivencia en regeneración, metraje derivado.
- `presupuesto`: precios editables y cálculo de costo (materiales, herrajes, cantos), presentación en modal/PDF/landing.

## Impact

- `src/types/index.ts` — `Piece.cantos` y `Piece.cantosCustom` opcionales; `PriceSet`/precios.
- `src/lib/parametric.ts` — defaults de canto por kind en generadores; ids de herrajes normalizados (regenerar `test/fixtures/hardware.json`).
- `src/lib/merge.ts` — conservar `cantos` solo con `cantosCustom`.
- `src/lib/budget.ts` (nuevo) — `computeBudget` pura + metraje de canto.
- `src/stores/projectStore.ts` — acción de override de cantos por pieza.
- `src/data/catalogs.ts` — precios default + `CANTO` como catálogo aparte de herrajes.
- Componentes — modal Presupuesto, sección PDF, columna CSV, landing card (estimado).
- Sin cambios en geometría 3D ni en las vistas 2D (el canto es una banda de ~1mm; no se renderiza).
