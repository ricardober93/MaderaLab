# fix-gizmo-cambio-pieza

## Why

Al cambiar de pieza seleccionada, el gizmo de transformación (mover W / rotar E / escalar R) queda attachado a un objeto THREE muerto (la pieza anterior desmontada): deja de funcionar (arrastrar no mueve la pieza nueva), se pinta flotando desacoplado de la pieza, y emite ~1 warning por frame (`TransformControls: The attached 3D object must be a part of the scene graph`) además de retener memoria del objeto muerto. Reproducido: switch fondo→tapa genera 596 warnings en ~1s.

## What Changes

- `<TransformControls` en `Viewport3D.tsx` recibe `key={selectedPieceId}` para forzar remount (detach del objeto muerto + attach fresco al group de la pieza nueva) en cada cambio de selección.
- Sin cambios en el resto: `groupRef`, `persistTransform`, modos W/E/R, exploded view (el gizmo no se muestra con explotado) quedan igual.

## Capabilities

### New Capabilities

- `gizmo-transform`: comportamiento del gizmo de transformación 3D ante cambios de selección (attach por pieza, sin gizmo muerto).

### Modified Capabilities

(ninguna)

## Impact

- `src/components/Viewport3D.tsx` — 1 atributo en el JSX de TransformControls (+ verificación e2e). Sin cambios de datos, store ni motor.
