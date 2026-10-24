# Tasks — fix-material-del-mueble

## 1. Flag + merge

- [x] 1.1 `Piece.materialCustom?: boolean` en `src/types/index.ts`.
- [x] 1.2 `mergePieces` en `src/lib/merge.ts`: `materialId: previa.materialCustom ? previa.materialId : canónica.materialId` (además de nombreCustom ya existente).
- [x] 1.3 `updatePieceMaterial` en `projectStore`: setear `materialCustom: true`.
- [x] 1.4 `updateAllMaterials` en `projectStore`: repintar piezas + setear `config.materialId` (updateConfig sincronizado o actualización directa de config sin regenerar piezas).

## 2. Tests

- [x] 2.1 Unit test de `mergePieces`: con override (materialCustom) conserva; sin flag toma canónico; legacy sin flag toma canónico.
- [x] 2.2 Golden tests existentes siguen en verde (geometría/herrajes intactos).

## 3. Verificación e2e (browser)

- [x] 3.1 Select "Material del mueble" → Pino: 12/12 piezas → pino (viewport cambia de color).
- [x] 3.2 Pintar tapa a Roble per-piece → cambiar select a MDF: tapa sigue roble, resto MDF.
- [x] 3.3 "Material para todas" → Aglomerado: piezas + select del ConfigPanel muestran aglomerado; agregar entrepaño → nace en aglomerado.
- [x] 3.4 `npm run build` + `npm run lint` limpios.
