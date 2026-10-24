## Why

El render de presentación ya tiene iluminación de estudio, sombras y material satinado, pero las piezas se pintan con color plano: un robledo y una melamina blanca se ven idénticos (solo cambia el tinte). Para entregar a clientes hace falta *ver los acabados*: veta de madera, microtextura de melamina y dirección de grano acorde al largo de cada pieza.

## What Changes

- Texturas **procedurales** generadas en runtime (canvas, cero fetch/red) por material del catálogo: veta de madera para maderas, speckle sutil para melaminas/color plano.
- `PieceMesh` acepta `textura` (map + bump sutil) cuando se renderiza en presentación; el editor **no cambia** (color plano, rendimiento).
- UVs de BoxGeometry escaladas por dimensión física (worldscale por cara) para que el grano tenga escala real en metros.
- Grano orientado al eje largo de la pieza (rotación de textura).
- Muestras de acabado (swatches texturizados, CSS dataURL) en el Material select del panel Propiedades para ver el acabado sin abrir el render.
- Anisotropía 4 en texturas y `bump` leve para relevo superficial.

## Capabilities

### New Capabilities

- `material-textures` — generación y aplicación de texturas procedurales por material (map/bump, worldscale, dirección de grano, swatches).

### Modified Capabilities

(ninguna — el requirement de "Realismo de presentación" existe; las texturas entran como capability nueva y `render-presentacion` pasa a componer con ella sin relevar sus requirements)

## Impact

- `src/lib/textures.ts` (nuevo): canvas procedural, cache por materialId, swatch dataURL.
- `src/components/RenderModal.tsx`: aplica textura según material de cada pieza (map, bump, worldscale, rotación por eje largo).
- `src/components/PieceMesh.tsx`: prop opcional `textura` (no breaking).
- `src/components/PropertiesPanel.tsx`: chips de material con swatch texturizado.
- Catálogo: sin cambios de datos (paleta derivada del color existente vía HSL).
