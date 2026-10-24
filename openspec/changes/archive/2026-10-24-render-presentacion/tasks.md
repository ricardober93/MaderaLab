# Implementation Tasks

## 1. Estado y helpers base

- [x] 1.1 `showRender`, `lastRenderDataUrl` (y setters, reset al cambiar/proyecto nuevo) en `src/stores/projectStore.ts`.
- [x] 1.2 `src/lib/renderScene.ts`: bounding box + posiciones de cámara por preset (perspectiva/frontal/lateral/superior) reutilizando la lógica `maxX/maxY/maxZ` del viewport; tipos `RenderPreset`, `RenderFondo`.

## 2. Modal de presentación

- [x] 2.1 `src/components/RenderModal.tsx`: modal (patrón BudgetModal) con `<Canvas gl={{ preserveDrawingBuffer: true, alpha: true }}>` que reutiliza `PieceMesh` (`selected:false`, sin TransformControls ni grid).
- [x] 2.2 Iluminación de estudio: ambient + hemisfera + key/fill direccionales + `ContactShadows` bajo el mueble (sin HDRI/network).
- [x] 2.3 Presets de cámara (4 botones) conectados a `renderScene.ts`; lookAt al centro del mueble; `camera.up` reset en perspectiva/lateral/frontal.
- [x] 2.4 Selector de fondo (blanco/gris/transparente) con `setClearColor` en vivo.

## 3. Export

- [x] 3.1 Captura PNG: render forzado a pixelRatio 1×/2×/3× + `toDataURL('image/png')` + restore; manejo de error con mensaje en español.
- [x] 3.2 Descarga `{nombre}_render.png` (espacios→`_`) via `<a download>`; guardar `lastRenderDataUrl` en store.

## 4. PDF

- [x] 4.1 `generatePDF`: página "Render de presentación" con `addImage` del `lastRenderDataUrl` (si existe) tras el encabezado, antes de vistas 2D y tablas; sin render → igual que hoy.

## 5. Integración Toolbar

- [x] 5.1 Botón "Render" en Toolbar (patrón "Presupuesto") + render de `RenderModal`.

## 5b. Realismo de presentación (superrealista)

- [x] 5b.1 `PieceMesh`: `meshPhysicalMaterial` satinado (roughness 0.45, clearcoat leve), `castShadow`/`receiveShadow` en el mesh y prop `bordes` que dibuja aristas tenues cuando no hay selección.
- [x] 5b.2 `RenderModal`: entorno de estudio procedural (`Environment` + `Lightformer`, frames=1), Canvas `shadows="soft"`, luz clave con castShadow (mapSize 2048, bounds por bounding box), luz de relleno opuesta y `bordes` activado.

## 6. Verificación

- [x] 6.1 e2e: abrir proyecto → modal Render muestra mueble con sombras (sin grid/gizmo); cambiar presets de cámara (frontal/superior/perspectiva) y fondo (incl. transparente).
- [x] 6.2 e2e: descargar PNG 2× → descarga ok, ratio restaurado, `lastRenderDataUrl` seteado en store.
- [x] 6.3 e2e: exportar PDF con render de sesión incluido; PDF sin render → formato igual que hoy.
- [x] 6.4 `npm run build` + `npm run lint` limpios.
