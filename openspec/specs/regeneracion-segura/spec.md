# regeneracion-segura — Spec

## Requirements

### Requirement: Identidad semántica de piezas generadas
Cada pieza producida por el motor paramétrico SHALL llevar un campo opcional `generationKey`, determinístico, con formato `tipo.rol` o `tipo.rol.indice` cuando la pieza existe en cantidad. El índice MUST derivar de la posición física de la pieza (semántica espacial), no del orden de creación en el array.

#### Scenario: Generación de estantería asigna keys
- **WHEN** se genera una estantería con 2 entrepaños
- **THEN** las piezas llevan keys como `estanteria.tapa`, `estanteria.lateral.izq`, `estanteria.lateral.der`, `estanteria.entepano.1`, `estanteria.entepano.2` y ninguna pieza comparte key

#### Scenario: Índices estables ante reordenamiento interno
- **WHEN** en una regeneración el orden de creación de piezas en el array cambia pero la disposición física es la misma
- **THEN** los índices del generationKey de cada pieza física no cambian (asignados por posición, no por orden de push)

### Requirement: Regeneración con merge por identidad
Al actualizar la configuración (`updateConfig`), el sistema SHALL regenerar las piezas canónicas y MUST fusionarlas con las piezas actuales por `generationKey`, en vez de reemplazarlas por completo.

#### Scenario: Personalización sobrevive al cambiar ancho
- **WHEN** el usuario pintó la tapa de un color custom y luego cambia el ancho del mueble
- **THEN** la tapa mergeada conserva el color custom y su `id`, y adopta las nuevas dimensiones y posición

#### Scenario: Piezas nuevas aparecen
- **WHEN** se agrega 1 entrepaño y se regenera
- **THEN** aparece una nueva pieza con key `estanteria.entepano.N+1`, id nuevo, geometría canónica

#### Scenario: Piezas que dejan de existir se remueven
- **WHEN** se quitan 2 entrepaños y se regenera
- **THEN** las piezas `estanteria.entepano.3` y `estanteria.entepano.4` (ya inexistentes en canónico) desaparecen del proyecto

#### Scenario: Piezas sin key no se tocan
- **WHEN** el proyecto contiene piezas sin `generationKey` (manuales) y se regenera
- **THEN** se conservan intactas (id, geometría, color, material, nombre) y quedan al final del array

### Requirement: Qué se conserva y qué se recalcula en el merge
Para piezas con el mismo `generationKey`, el merge SHALL conservar `id`, `color`, `materialId` **solo cuando la pieza tiene `materialCustom`** (override explícito del usuario), y `nombre` (cuando fue renombrado por el usuario, vía flag interno); y MUST recalcular `dimension`, `position`, `rotation` y `scale` desde la pieza canónica regenerada.

#### Scenario: Nombre renombrado por el usuario sobrevive
- **WHEN** una pieza fue renombrada manualmente (flag de nombre-manual seteado) y el mueble se regenera
- **THEN** conserva el nombre del usuario

#### Scenario: Nombre canónico se actualiza
- **WHEN** una pieza conserva el nombre asignado por el generador (sin flag) y se regenera
- **THEN** adopta el nombre canónico nuevo (que puede cambiar con la config)

#### Scenario: Geometría del usuario se rebasa
- **WHEN** el usuario rotó una pieza (uso temporal) y regenera
- **THEN** la rotación vuelve al valor canónico y el mueble queda armado; Ctrl+Z recupera el estado previo con la rotación del usuario

#### Scenario: Tapa con override conserva material, base sigue al config
- **WHEN** la tapa tiene materialCustom=true con "Roble", las demás piezas están en base, y se cambia el select a "Pino" provocando regeneración
- **THEN** la tapa queda `roble` (conservado por flag) y las demás pasan al canónico `pino`

#### Scenario: Piezas sin flag siguen al material canónico
- **WHEN** las piezas están todas en el material default del generador (sin ningún override) y se cambia el select
- **THEN** TODAS las piezas adoptan el nuevo material — ninguna queda "congelada" con el material anterior

#### Scenario: Proyecto legado (sin flag) repinta completo al cambiar el select
- **WHEN** un proyecto creado antes de materialCustom se abre y el usuario cambia el select del mueble
- **THEN** todas sus piezas toman el nuevo material (deuda aceptada: customizations de material pre-merge no son detectables)

### Requirement: Herrajes siempre canónicos
Los herrajes del proyecto SHALL recalcularse por completo en cada regeneración, sin preservar identidad (son derivados, sin estado propio).

#### Scenario: Herrajes se regeneran
- **WHEN** cambia la cantidad de entrepaños
- **THEN** las cantidades de tornillos/dados se recalculan de cero desde los nuevos generadores

### Requirement: Material default desde configuración del proyecto
El material por defecto para piezas canónicas nuevas SHALL salir del proyecto activo (`config.materialId`, nuevo campo con default `melamina_blanca` para compatibilidad), en vez de estar hardcodeado por generador.

#### Scenario: Mueble nuevo arranca con material del proyecto
- **WHEN** se crea un proyecto y se elige material "Pino" en ConfigPanel
- **THEN** todas las piezas canónicas nacen con materialId `pino`

#### Scenario: Pieza nueva tras agregar entrepaño hereda material del config
- **WHEN** todas las piezas fueron repintadas a "Roble" (updateAllMaterials/color) y se agrega un entrepaño
- **THEN** el entrepaño nuevo nace con `config.materialId` (degradación aceptada y documentada: repintar "todas" sigue siendo acción del usuario)

### Requirement: Refactor del motor con carcasa común
El motor paramétrico SHALL extraer la generación de geometría común (`carcasa()`, entrepanos, repisas, patas) a helpers compartidos consumidos por los 5 generadores. La geometría producida post-refactor MUST ser idéntica a la previa.

#### Scenario: Refactor no cambia geometría
- **WHEN** se genera cada tipo con 3 configuraciones representativas antes y después del refactor
- **THEN** el dump de (nombre, generationKey, dimension, position) es idéntico para cada par

#### Scenario: Herrajes no cambian en el refactor
- **WHEN** se comparan los herrajes generados antes y después del refactor para las mismas configs
- **THEN** nombre, especificación y cantidad coinciden en cada caso

### Requirement: Migración de proyectos legados
Los proyectos sin `generationKey` SHALL migrar automáticamente asignando keys derivando por nombre con la tabla de mapeo canónica del motor. Piezas cuyo nombre no matchee MUST quedar sin key (tratadas como manuales).

#### Scenario: Proyecto viejo gana keys
- **WHEN** se abre en el nuevo build un proyecto creado antes
- **THEN** las piezas reconocibles por nombre ("Lateral izquierdo", "Tapa superior", etc.) reciben keys y las regeneraciones posteriores aplican merge

#### Scenario: Renombrado en legado se trata como manual
- **WHEN** una pieza de proyecto legado tiene un nombre que no matchea el mapeo (ej. "Mi tablita")
- **THEN** queda sin key y las regeneraciones futuras no la tocan
