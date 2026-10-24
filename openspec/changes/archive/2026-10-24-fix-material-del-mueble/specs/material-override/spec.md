# fix-material-del-mueble — Spec

## ADDED Requirements

### Requirement: Material base del proyecto dirigido por el select del ConfigPanel
El select "Material del mueble" (ConfigPanel) SHALL actualizar `config.materialId` y, tras la regeneración con merge, MUST resultar en que todas las piezas sin override explícito por pieza adopten el nuevo material (visible en viewport y lista de piezas).

#### Scenario: Cambio de material del mueble repinta piezas base
- **WHEN** las 12 piezas de una estantería están en melamina_blanca (sin overrides) y el usuario elige "Pino" en el select
- **THEN** `config.materialId` = `pino` y las 12 piezas quedan con `materialId = pino`

#### Scenario: Piezas nuevas heredan el material base
- **WHEN** con material base "Pino" el usuario agrega un entrepaño
- **THEN** la pieza nueva (`estanteria.entepano.N+1`) nace con `materialId = pino`

### Requirement: Override de material por pieza sobrevive la regeneración
`updatePieceMaterial` SHALL setear `materialCustom: true` en la pieza; el merge de regeneración MUST conservar el `materialId` previo de piezas con `materialCustom` y MUST recalcular al canónico las piezas sin el flag.

#### Scenario: Pieza personalizada mantiene su material al cambiar el select
- **WHEN** la tapa fue seteada a "Roble" por el usuario (materialCustom=true) y el resto está en base, y el usuario cambia el select del mueble a "Pino"
- **THEN** la tapa mantiene `roble` y las demás piezas pasan a `pino`

#### Scenario: Pieza personalizada sobrevive a cambio de dimensiones
- **WHEN** una pieza con materialCustom=true se regenera por cambio de dimensiones
- **THEN** conserva su materialId y adopta la geometría canónica

### Requirement: "Material para todas" sincroniza el material base
`updateAllMaterials` SHALL repintar todas las piezas con el material elegido, setear `config.materialId` al mismo valor, y MUST quedar coherente con el select del ConfigPanel (el select muestra el material aplicado).

#### Scenario: Para todas alinea el select
- **WHEN** el usuario aplica "Material para todas → Aglomerado" desde PropertiesPanel sin pieza seleccionada
- **THEN** todas las piezas quedan con materialId `aglomerado` y `config.materialId = aglomerado`

## MODIFIED Requirements

### Requirement: Qué se conserva y qué se recalcula en el merge
Para piezas con el mismo `generationKey`, el merge SHALL conservar `id`, `color`, `materialId` **solo cuando la pieza tiene `materialCustom`** (override explícito del usuario), y `nombre` (cuando fue renombrado por el usuario, vía flag interno); y MUST recalcular `dimension`, `position`, `rotation` y `scale` desde la pieza canónica regenerada.

#### Scenario: Tapa con override conserva material, base sigue al config
- **WHEN** la tapa tiene materialCustom=true con "Roble", las demás piezas están en base, y se cambia el select a "Pino" provocando regeneración
- **THEN** la tapa queda `roble` (conservado por flag) y las demás pasan al canónico `pino`

#### Scenario: Piezas sin flag siguen al material canónico
- **WHEN** las piezas están todas en el material default del generador (sin ningún override) y se cambia el select
- **THEN** TODAS las piezas adoptan el nuevo material — ninguna queda "congelada" con el material anterior

#### Scenario: Proyecto legado (sin flag) repinta completo al cambiar el select
- **WHEN** un proyecto creado antes de materialCustom se abre y el usuario cambia el select del mueble
- **THEN** todas sus piezas toman el nuevo material (deuda aceptada: customizations de material pre-merge no son detectables)
