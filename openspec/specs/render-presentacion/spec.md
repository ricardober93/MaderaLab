# render-presentacion Specification

## Purpose
TBD - created by archiving change render-presentacion. Update Purpose after archive.
## Requirements
### Requirement: Modal de render de presentación
El sistema SHALL ofrecer un modal "Render" (botón en Toolbar, sólo con proyecto activo) que muestre el mueble ensamblado en un canvas de presentación independiente del viewport de edición. El canvas de presentación SHALL renderizar la misma geometría y colores de las piezas (`PieceMesh`) sin grid, sin gizmo de transformación y sin resaltado de selección.

#### Scenario: apertura del modal
- **WHEN** el usuario abre un proyecto y presiona el botón "Render" en la Toolbar
- **THEN** se abre el modal con el mueble ensamblado renderizado con iluminación de estudio y sombras de contacto, sin grid ni gizmo
- **AND** la edición en el viewport no se ve afectada (sin cambios de estado del proyecto)

#### Scenario: cierre del modal
- **WHEN** el usuario cierra el modal (botón Cerrar, tecla Esc o click fuera)
- **THEN** el modal se desmonta sin dejar cambios en el proyecto

### Requirement: Realismo de presentación
El canvas de presentación SHALL usar un entorno de estudio procedural (sin fetch en runtime): luz clave con sombras reales proyectadas entre piezas, sombras de contacto con el piso, materiales satinados (melamina con brillo reflejante del entorno) y bordes de definición que permitan distinguir piezas blancas sobre fondo blanco.

#### Scenario: sombras y definition visibles
- **WHEN** se renderiza cualquier proyecto en el modal
- **THEN** la escena incluye sombras de contacto bajo la base del mueble y sombras proyectadas entre piezas de la luz clave
- **AND** las piezas de color claro (p.ej. melamina blanca) se distinguen del fondo blanco por shading env y aristas
- **AND** ninguna fuente de iluminación o entorno requiere fetch en red

### Requirement: Presets de cámara
El modal SHALL ofrecer 4 ángulos de cámara calculados sobre el bounding box real del proyecto: perspectiva, frontal, lateral y superior. Al seleccionar un preset, la cámara SHALL recolocarse y apuntar al centro del mueble.

#### Scenario: cambio de ángulo
- **WHEN** el usuario selecciona el preset "Frontal"
- **THEN** la cámara se coloca enfrente del mueble (eje Z+, elevación 0) a distancia defensiva según su tamaño
- **AND** el frame visible corresponde a la vista frontal del mueble

#### Scenario: vista superior
- **WHEN** el usuario selecciona el preset "Superior"
- **THEN** la cámara se coloca arriba del mueble (eje Y+) mostrando la planta
- **AND** al retornar a "Perspectiva", la cámara y el up del vector se restablecen

### Requirement: Fondo configurable
El modal SHALL permitir elegir el fondo del render entre blanco, gris claro y transparente (PNG con canal alpha). El cambio SHALL aplicarse en vivo sin recargar la escena.

#### Scenario: fondo blanco/gris
- **WHEN** el usuario elige blanco o gris claro
- **THEN** el render muestra el mueble sobre un fondo sólido del color elegido

#### Scenario: fondo transparente
- **WHEN** el usuario elige transparente y exporta el PNG
- **THEN** el PNG descargado tiene canal alpha (el mueble y la sombra separados del fondo)
- **AND** no se pierde la sombra de contacto

### Requirement: Export PNG del render
El modal SHALL exportar el frame actual como PNG a resolución 1×, 2× o 3× del tamaño visible del canvas, con el ratio de píxeles restaurado tras la captura. El archivo SHALL descargarse con nombre `{nombre_proyecto}_render.png` (espacios → `_`).

#### Scenario: descarga a 2×
- **WHEN** el usuario exporta el render a 2×
- **THEN** se descarga un PNG con dimensiones ≈ 2× el tamaño visible del canvas
- **AND** el ratio de píxeles vuelve al valor base tras la captura
- **AND** el `dataURL` del render queda disponible para la exportación PDF (sólo sesión)

#### Scenario: export vacío/invalid
- **WHEN** la captura del canvas falla (gl no disponible)
- **THEN** el modal muestra un mensaje de error en español y no descarga archivo

### Requirement: Render en el PDF exportado
El sistema SHALL incluir el último render descargado (del proyecto activo en curso) como página "Render de presentación" del PDF generado, después del encabezado y antes de las vistas 2D y tablas. Si no hay render de sesión, el PDF SHALL seguir generándose igual que hoy.

#### Scenario: PDF con render
- **WHEN** el usuario exporta el PDF de un proyecto del cual descargó un render en la misma sesión
- **THEN** la primera página del PDF contiene la imagen del render con el nombre del proyecto
- **AND** las vistas 2D y tablas conservan su contenido actual

#### Scenario: sin render de sesión
- **WHEN** el usuario exporta el PDF de un proyecto sin haber descargado renders en la sesión
- **THEN** el PDF se genera idéntico al formato actual (sin página de render)

