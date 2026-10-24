## ADDED Requirements

### Requirement: Undo restaura el estado previo del proyecto
El sistema SHALL mantener un historial de estados del proyecto activo y permitir deshacer la última modificación (configuración, material, color o transform de piezas).

#### Scenario: Undo tras cambiar una dimensión
- **WHEN** el usuario modifica la altura de una estantería y ejecuta undo
- **THEN** la configuración y las piezas regeneradas vuelven al estado anterior y el proyecto se re-persiste

#### Scenario: Undo cubre transform de pieza
- **WHEN** el usuario mueve una pieza con el gizmo, suelta el mouse y ejecuta undo
- **THEN** la posición de la pieza vuelve a la que tenía antes del arrastre completo

### Requirement: Redo restaura el estado deshecho
El sistema SHALL permitir rehacer la última acción deshecha mientras no haya nuevas modificaciones.

#### Scenario: Redo tras undo
- **WHEN** el usuario deshace una modificación y ejecuta redo
- **THEN** el estado vuelve al que tenía antes del undo

#### Scenario: Nueva modificación invalida redo
- **WHEN** el usuario deshace una acción y luego realiza una modificación distinta
- **THEN** el historial de redo se descarta

### Requirement: Stack limitado a 50 estados
El sistema SHALL limitar el historial de undo a un máximo de 50 entradas y descartar las más antiguas.

#### Scenario: Límite de historial
- **WHEN** el usuario realiza más de 50 modificaciones y deshace 50 veces
- **THEN** las 50 undo tienen efecto correctamente y una 51ª no está disponible

### Requirement: Estado de disponibilidad expuesto en la UI
El sistema SHALL exponer en la toolbar botones de undo y redo que reflejen si existe historial disponible (deshabilitados cuando no).

#### Scenario: Botones deshabilitados sin historial
- **WHEN** se abre un proyecto recién creado sin modificaciones
- **THEN** los botones undo y redo están deshabilitados
