# keyboard-shortcuts Specification

## Purpose
TBD - created by archiving change add-ux-core-polish. Update Purpose after archive.
## Requirements
### Requirement: Atajos de teclado del editor
El sistema SHALL responder a los atajos Delete, Ctrl+S, Ctrl+Z, Ctrl+Shift+Z y Esc en el editor, ignorándolos cuando el foco esté en un input, select o textarea.

#### Scenario: Delete elimina la pieza seleccionada
- **WHEN** hay una pieza seleccionada y el usuario presiona Delete (o Backspace)
- **THEN** la pieza se elimina del proyecto y la acción es deshacible con undo

#### Scenario: Ctrl+S guarda el proyecto
- **WHEN** el usuario presiona Ctrl+S (o Cmd+S)
- **THEN** el proyecto se guarda y se muestra confirmación visual "Guardado ✓" sin abrir el diálogo de guardado del navegador

#### Scenario: Esc deselecciona y cierra modales
- **WHEN** hay una pieza seleccionada, o una vista modal abierta, y el usuario presiona Esc
- **THEN** se cierra el modal si existe, o se limpia la selección de pieza

#### Scenario: Atajos inactivos en campos de texto
- **WHEN** el foco está en un input numérico del panel y el usuario presiona Delete o Ctrl+S
- **THEN** la tecla actúa sobre el campo (o el navegador maneja Ctrl+S de forma nativa sin undo disparado)

### Requirement: Referencia de atajos accesible desde la UI
El sistema SHALL ofrecer un modal con la lista completa de atajos accesible desde la toolbar.

#### Scenario: Abrir la guía de atajos
- **WHEN** el usuario hace clic en el botón de atajos de la toolbar
- **THEN** se muestra un modal con los atajos y sus descripciones, cerrable con Esc o clic en close

