# Tasks — fix-gizmo-cambio-pieza

## 1. Fix

- [x] 1.1 Agregar `key={selectedPieceId}` al `<TransformControls>` en `src/components/Viewport3D.tsx`.
- [x] 1.2 `npm run build` sin errores.

## 2. Verificación e2e (browser)

- [x] 2.1 Crear estantería → seleccionar tapa → switch a fondo → volver a tapa: gizmo sobre la pieza vigente (screenshot), arrastrar mueve la pieza y persiste (reload mantiene posición).
- [x] 2.2 Switch de selección ×2 → consola con 0 warnings "attached 3D object".
- [x] 2.3 Cambio de modo W→E→R con pieza seleccionada: gizmo no se rompe (drag opera el modo activo).
- [x] 2.4 `npm run lint` limpio.
