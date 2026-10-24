# onboarding Specification

## Purpose
TBD - created by archiving change add-ux-core-polish. Update Purpose after archive.
## Requirements
### Requirement: Tour de primer uso
El sistema SHALL mostrar, en la primera apertura de la app, un breve tour de 4 pasos que explica elegir mueble → ajustar dimensiones → personalizar → exportar.

#### Scenario: Primer uso muestra el tour
- **WHEN** el usuario abre la app por primera vez (sin flag de onboarding en localStorage) y entra al editor con su primer proyecto
- **THEN** el paso 1 del tour se muestra sobre la interfaz del editor

#### Scenario: Tour no reaparece
- **WHEN** el usuario completa o salta el tour y recarga la app
- **THEN** el tour no se vuelve a mostrar

