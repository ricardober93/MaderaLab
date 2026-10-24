## ADDED Requirements

### Requirement: Texturas procedurales por material
El canvas de presentación SHALL aplicar a cada pieza una textura procedural generada en runtime que represente el acabado de su material del catálogo (veta para maderas, estampado para melamínica con veta, partícula para aglomerado, micro speckle para melamínica lisa), con map + bump sutil, sin ninguna descarga en red.

#### Scenario: acabado acorde al material
- **WHEN** se renderiza una pieza cuyo material es una madera del catálogo (roble, pino, mdf, contrachapado)
- **THEN** la superficie muestra veta a lo largo del eje largo de la pieza y el tinte coincide con `colorDefault` del material
- **AND** la textura se genera en runtime sin fetch a ningún recurso de red

#### Scenario: melamínica lisa
- **WHEN** el material es una melamínica sin veta (blanca o negra)
- **THEN** la superficie mantiene el color plano del material con un speckle imperceptible a distancia de presentación (sin bump)

### Requirement: Escala de textura física y grano alineado
La textura SHALL mapearse con escala física real (tile de referencia por cara según dimensiones de la pieza en metros) y su grano SHALL orientarse al eje largo de cada pieza.

#### Scenario: repetición acorde al tamaño
- **WHEN** se renderiza una estantería de 900 mm de ancho con frente de veta
- **THEN** la textura repite el tiling en proporción a los metros de la cara (sin estirarse para cubrir la pieza completa ni mostrar una sola veta gigante)

#### Scenario: grano vertical en laterales
- **WHEN** una pieza alta (lateral) muestra veta
- **THEN** el grano corre a lo largo de su dimensión mayor (vertical), no cruzado

### Requirement: Muestras de acabado en la UI
El paneel de Propiedades SHALL mostrar los chips de material con una muestra visual (swatch) del acabado texturizado correspondiente, y las muestras SHALL derivarse del mismo generador procedural que usa el render de presentación.

#### Scenario: acorde render/swatch
- **WHEN** el usuario ve el material "Melamina Roble" en el panel de Propiedades
- **THEN** el chip muestra un swatch con la stessa veta/tinte que aplicará el render de presentación
