# cantos Specification

## Purpose
TBD - created by archiving change cantos-y-presupuesto. Update Purpose after archive.
## Requirements
### Requirement: Cada pieza lleva su diseño de cantos por default canónico
Los generadores SHALL asignar a cada pieza canónica un valor de `cantos` ∈ {sin_canto, largo, cuatro_lados} según el kind: `fondo` → sin_canto; `puerta` → cuatro_lados; `tapa`, `base`, `repisa`, `entrepano`, `lateral` → largo. Patas y accesorios SHALL permanecer sin canto.

#### Scenario: Estantería recién generada tiene sus cantos
- **WHEN** se genera una estantería de 3 entrepaños con 4 repisas
- **THEN** tapa/base/laterales/entrepaños tienen cantos `largo`, `fondo` tiene `sin_canto`

#### Scenario: Puerta generada lleva 4 lados
- **WHEN** se genera un mueble de cocina con puertas
- **THEN** cada puerta tiene cantos `cuatro_lados`

### Requirement: Override de cantos por pieza sobrevive la regeneración
La edición de cantos de una pieza (desde PropertiesPanel o lista) SHALL setear `cantosCustom: true`; el merge de regeneración MUST conservar el valor previo de `cantos` en piezas con flag y MUST recalcular al canónico las piezas sin flag. Piezas legadas sin `cantos` MUST obtener el default canónico en la próxima regeneración.

#### Scenario: Puerta editada de cantos sigue así al cambiar el ancho
- **WHEN** el usuario pasó una puerta de cuatro_lados a largo y luego cambia el ancho del mueble
- **THEN** la puerta conserva `largo` (por el flag) y adopta las nuevas dimensiones canónicas

#### Scenario: Legado regenera con defaults
- **WHEN** un proyecto creado antes de cantos regenera su config
- **THEN** sus piezas toman el default de kind (el usuario puede overridear después)

### Requirement: El metraje de canto es determinístico desde la cara de corte
Dado `cutDimension` y `cantos` de cada pieza, el sistema MUST calcular los metros de canto: estado `largo` → 2 aristas mayores; `cuatro_lados` → 4 aristas; `sin_canto` → 0. Los metros del proyecto MUST la suma de piezas / 1000 y alimentan el presupuesto directamente.

#### Scenario: Repisa cantada en sus 2 aristas Mayores
- **WHEN** 1 repisa 768×297×16 con cantos `largo`
- **THEN** el metraje de esa pieza es 2 × 768 / 1000 = 1.536 m

#### Scenario: Puerta cantada completa
- **WHEN** 1 puerta 768×1984 con cantos `cuatro_lados`
- **THEN** el metraje es (2×1984 + 2×768) / 1000 = 5.504 m

