## 1. Generador de texturas (src/lib/textures.ts)

- [ ] 1.1 `paletaColor(hex)` → HSL, derivar claro/oscuro; `ruido determinista` (hash con seed por materialId); `texturaMaterialCanvas(materialId, color, size)` → canvas según perfil por material (veta/speckle/partícula).
- [ ] 1.2 Cache `Map<materialId, {canvas, bump}>` + API: `texturaMaterial(materialId, colorDefault)` → THREE.Texture base (wrap Repeat, anisotropy 4), `texturaBump(materialId)` → número de canal (bump solo perfil veta), `texturaSwatch(materialId, colorDefault)` → dataURL 48×48.

## 2. Aplicación en el render (PieMesh/RenderModal)

- [ ] 2.1 `RenderModal`: resolver `materialId` efectivo por pieza (materialCustom ? piece.materialId : config.materialId), `useMemo` de Map pieza→materialId.
- [ ] 2.2 `PiezeMesh`: prop `textura?: { map, bump }`; si viene, mundo con `meshPhysicalMaterial map+bumpMap` (sin pasar `color` igual al tinte? mantengo color blanco multiplicado? uso `map` y color blanco), UV worldscale por cara + rotación por eje largo, dispose de clones en unmount.

## 3. Swatches en panel Propiedades

- [ ] 3.1 Chips de material con `texturaSwatch` (backgroundImage dataURL + color fallback), mismo orden/dixión actual.

## 4. Verificación

- [ ] 4.1 e2e render: estantería en roble → veta horizontal en tapa/entrepanos, vertical en laterales, tile de ~25cm repetido; screenshot evidencia.
- [ ] 4.2 e2e render: melamina blanca → casi plna con speckle apenas visible; melamina negra sin ruido de bump en sombra.
- [ ] 4.3 e2e panel: chips texturizados visibles y consistentes con el render.
- [ ] 4.4 npm run build + lint + tests verde; tiempo de apertura del modal < 1s medible (perf.now en consola o intervalo del script).
