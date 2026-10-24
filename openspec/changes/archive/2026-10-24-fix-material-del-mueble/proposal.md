# fix-material-del-mueble

## Why

El select "Material del mueble" en ConfigPanel está roto en la práctica: `updateConfig({ materialId })` regenera y el merge conserva el `materialId` previo de cada pieza incondicionalmente — el usuario elige "Pino" y el mueble no cambia ni un píxel (repro: config.materialId=pino, 12/12 piezas melamina_blanca). Causa raíz: el merge no distingue material default del generador vs. override explícito del usuario. Los otros selectores de material (per-piece, "para todas") funcionan correctamente y quedan sin cambios.

## What Changes

- Nuevo campo opcional `Piece.materialCustom?: boolean`, marcado SOLO por `updatePieceMaterial` (override explícito por pieza).
- `mergePieces`: conserva `materialId` previo **solo si** `materialCustom`; en caso contrario, la pieza toma el material canónico (que es `config.materialId`).
- `updateAllMaterials` ("Material para todas"): además de repintar las piezas, setea `config.materialId` al material elegido — el select del ConfigPanel y "para todas" quedan sincronizados.
- Proyectos legados (sin `materialCustom`): piezas se tratian como sin override → el select del ConfigPanel las repinta (deuda documentada; hay que hacerla explícita en el change).

## Capabilities

### New Capabilities

- `material-override`: semántica de material base (config) vs. override por pieza y su sobrevivencia al merge de regeneración.

### Modified Capabilities

- `regeneracion-segura`: la regla de merge "qué se conserva" pasa de "materialId siempre" a "materialId solo si materialCustom". (Delta spec: MODIFIED del requirement "Qué se conserva y qué se recalcula en el merge")

## Impact

- `src/types/index.ts` — campo opcional en `Piece` (sin breaking de datos).
- `src/lib/merge.ts` — condicional en material.
- `src/stores/projectStore.ts` — `updatePieceMaterial` setea flag; `updateAllMaterials` sincroniza config.
- `src/lib/storage.ts` — sin migración necesaria (campo opcional; legacy = sin override).
