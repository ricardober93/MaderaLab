## ADDED Requirements

### Requirement: Dimensiones fuera de rango se bloquean con feedback
El sistema SHALL validar los campos de ancho, alto y profundidad contra límites mínimos y máximos, mostrar un mensaje de error visible bajo el campo cuando el valor está fuera de rango, y evitar persistir el valor inválido en el proyecto.

#### Scenario: Valor mínimo violado
- **WHEN** el usuario ingresa 100 mm en ancho (mínimo 200)
- **THEN** el campo muestra borde de error y un mensaje con el rango permitido, y el proyecto conserva el último valor válido

#### Scenario: Valor vacío o fuera de rango se corrige al salir del campo
- **WHEN** el usuario deja un campo de dimensión con valor vacío o fuera de rango
- **THEN** el sistema ajusta el valor al límite más cercano y actualiza el mueble

### Requirement: Ancho responde al rango permitido
El sistema SHALL aceptar valores de ancho entre 200 y 3000 mm según `DIMENSION_LIMITS`.

#### Scenario: Límite superior de ancho
- **WHEN** el usuario ingresa 3500 mm de ancho
- **THEN** el campo marca error y el proyecto no se actualiza hasta un valor válido (o clamp en blur)

### Requirement: Grosor limitado a opciones estándar
El sistema SHALL restringir el grosor del tablero a las opciones estándar (3, 6, 12, 15, 16, 18, 19, 25 mm) mediante selección.

#### Scenario: Selección de grosor estándar
- **WHEN** el usuario abre el selector de grosor
- **THEN** solo se ofrecen los valores estándar y cualquier selección resulta válida
