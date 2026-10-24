## Why

El mueble diseñado se muestra al cliente desde el viewport de edición: sin sombras, con grid visible y luces planas — no sirve como imagen de presentación. Falta una forma simple de generar una imagen de calidad del mueble terminado para compartir con clientes o adjuntar al pack de entrega (PDF de planos ya exporta vistas 2D, pero no renders).

## What Changes

- Nuevo modal "Render" (patrón Presupuesto/Vistas 2D) en Toolbar: canvas de presentación separado del viewport de edición, con iluminación de estudio (key + fill + ambient + sombras de contacto bajo el mueble), sin grid, sin gizmo ni overlay de selección.
- Presets de cámara calculados sobre el bounding box real del proyecto: perspectiva, frontal, lateral y superior; botones para cambiar de ángulo.
- Selector de fondo: blanco, gris claro o transparente (PNG con alpha).
- Export PNG del frame actual a resolución nativa, 2× o 3× (ratio de píxeles temporal sobre el canvas); descarga con nombre `{proyecto}_render.png`.
- El último render descargado (data URL, solo sesión) queda disponible para la exportación: si existe, `generatePDF` lo incluye como primera página "Render de presentación" antes de las vistas 2D.
- Sin cambios de modelo de datos: el render lee `Project` igual que el viewport, `PieceMesh` se reutiliza (sin selección).

## Capabilities

### New Capabilities
- `render-presentacion`: generación de imagen de presentación del mueble (modal con iluminación de estudio, presets de cámara, fondo configurable, export PNG y su inclusión en el PDF exportado).

### Modified Capabilities

(ninguna — el export PDF no tiene spec principal; el comportamiento de incluir el render se define dentro de `render-presentacion`)

## Impact

- `src/components/RenderModal.tsx` (nuevo): modal + canvas de presentación + controles.
- `src/lib/renderScene.ts` (nuevo): cálculo de bounding box/posiciones de cámara por preset + captura/descarga del canvas WebGL.
- `src/stores/projectStore.ts`: `showRender`, `lastRenderDataUrl` (sesión, no persiste).
- `src/components/Toolbar.tsx`: botón "Render" + render del modal; `generatePDF` incluye página del render si hay `lastRenderDataUrl`.
- `src/components/PieceMesh.tsx`: reutilizado tal cual (props ya opcionales para selección).
- Sin dependencias nuevas: drei `ContactShadows` ya está disponible; transparente usa el alpha del WebGL context.
