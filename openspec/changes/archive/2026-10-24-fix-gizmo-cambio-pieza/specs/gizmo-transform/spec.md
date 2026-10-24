# fix-gizmo-cambio-pieza — Spec

## ADDED Requirements

### Requirement: Gizmo de transformación opera la pieza seleccionada vigente
Cuando cambia la pieza seleccionada, el gizmo de transformación SHALL estar atado al THREE.Group de la pieza vigente (remount por selección) y MUST operar movimientos de posición, rotación y escala sobre esa pieza al arrastrarlo, persistiendo vía `persistTransform`.

#### Scenario: Cambio de pieza reinicia el attach
- **WHEN** el usuario selecciona la pieza A y luego B desde la lista de piezas
- **THEN** el gizmo se renderiza sobre B (no flotando desacoplado) y arrastrarlo transforma a B

#### Scenario: Arrastre persiste en el proyecto
- **WHEN** el usuario mueve la pieza B con el gizmo y suelta
- **THEN** la posición de B se guarda en el proyecto (piesa sigue donde quedó tras sincronizar/reload)

### Requirement: Sin instancias huérfanas del gizmo al cambiar selección
El sistema SHALL REMOUNT el TransformControls en cada cambio de pieza seleccionada de forma que no queden controles attachados a objetos fuera del scene graph, eliminando el flood de warnings de drei por frame.

#### Scenario: Cambio de pieza sin warnings
- **WHEN** el usuario alterna la selección entre 2 o más piezas varias veces en la consola del navegador
- **THEN** no se emite ningún warning `The attached 3D object must be a part of the scene graph` (0 ocurrencias tras un periodo de estabilización)

### Requirement: Modos de transformación con tecnología del hotkey sin remontaje
Cambiar de modo de transformación (W mover / E rotar / R escalar) SHALL actualizarse sin desmontar el gizmo; el key de remontaje depende de la pieza seleccionada, no del modo.

#### Scenario: Cambio de modo mantiene el gizmo
- **WHEN** con una pieza seleccionada el usuario cambia de modo W (mover) a E (rotar)
- **THEN** el gizmo sigue activo sobre la misma pieza y opère el rotación al arrastrar
