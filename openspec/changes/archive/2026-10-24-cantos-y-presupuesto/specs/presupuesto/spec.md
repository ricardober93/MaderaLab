# presupuesto — Spec (delta)

## ADDED Requirements

### Requirement: El presupuesto deriva exclusivamente del estado del proyecto y los precios
`computeBudget(project, prices)` MUST calcular: materiales (Σ m² × $/m² agrupado por material), cantos (Σ metros × $/m), herrajes (Σ cantidad × $/ud con match por id de catálogo), y el total como suma de las secciones. Cuando un herraje no tiene precio definido, la línea MUST marcarse `sinPrecio` y contribuir con $0 (nunca un valor inventado).

#### Scenario: Presupuesto de estantería con todo "$" definido
- **WHEN** proyecto con precios definidos para melamina_blanca, canto_melaninico y sus herrajes
- **THEN** el total = m2×$ + metros×$ + herrajes×$ (suma exacta de las secciones)

#### Scenario: Herraje sin precio no miente
- **WHEN** un herraje cuyo id no está en el PriceSet
- **THEN** su línea aparece con `sinPrecio` y $0, y el total refleja el resto

### Requirement: Precios globales editables con defaults
El PriceSet SHALL ser único para la app (localStorage `maderalab_prices`), inicializado desde los defaults del catálogo si no existe, editable línea por línea (materiales, cantos, herrajes) y restaurable a defaults. El formato de moneda SHALL salir del campo `moneda` (default CLP, formateado con `Intl.NumberFormat('es-CL')`).

#### Scenario: Editar precio de Melamina Blanca recalcula el presupuesto
- **WHEN** el usuario edita el $/m² de melamina_blanca en el modal de precios
- **THEN** el presupuesto del proyecto muestra el nuevo total formateado

#### Scenario: Restaurar defaults
- **WHEN** el usuario elige "Restaurar defaults" en el editor de precios
- **THEN** el PriceSet vuelve a los valores del catálogo y persiste

### Requirement: El presupuesto es visible en modal, PDF y landing
La app SHALL exponer el presupuesto en: (1) un modal accesible desde Toolbar con las secciones Materiales / Cantos / Herrajes / TOTAL y acceso al editor de precios; (2) una sección "Presupuesto" del PDF y un bloque separado en el CSV; (3) un estimado "≈ $XXX" en cada card de proyecto del landing, calculado sin abrir el proyecto.

#### Scenario: Modal de presupuesto desde Toolbar
- **WHEN** el usuario abre "Presupuesto" desde la toolbar con proyecto activo
- **THEN** el modal lista materiales, cantos, herrajes y total con formato es-CL

#### Scenario: PDF con presupuesto
- **WHEN** el usuario exporta el PDF
- **THEN** después de la sección de herrajes aparece "Presupuesto" con las tres secciones y el total

#### Scenario: Card del landing muestra estimado
- **WHEN** el landing lista proyectos con su estado guardado y precios existentes
- **THEN** cada card muestra "≈ $XXX" con el total de `computeBudget`
