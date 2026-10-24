# regeneracion-segura

## Why

Al cambiar cualquier parámetro del ConfigPanel, `updateConfig` regenera el mueble completo y **destruye silenciosamente** las personalizaciones del usuario (colores, materiales, nombres renombrados) aplicadas sobre las piezas. El usuario pierde trabajo sin aviso ni posibilidad de recuperar más allá de Ctrl+Z. Esto bloquea el flujo natural de "configuro dimensiones → pinto → ajusto → vuelvo a ajustar dimensiones" y es el cimiento faltante para features futuras (lista de corte, optimizador, presupuestos) que dependen de piezas con identidad estable.

## What Changes

- **Identidad semántica de piezas**: cada pieza generada recibe un `generationKey` determinístico (ej. `estanteria.tapa`, `estanteria.entepano.2`), separado del uuid físico y del nombre editable.
- **Regeneración con merge**: `updateConfig` regenera las piezas canónicas y las fusiona con las existentes por `generationKey`:
  - piezas con el mismo key → **geometría nueva** (dimensiones, posición, rotación, escala) desde el generador canónico, **metadatos del usuario conservados**.
- **Qué se conserva en el merge** (decisión de diseño formalizada): `color`, `materialId`, `nombre` (si fue renombrado por el usuario). Qué se recalcula: `dimension`, `position`, `rotation`, `scale`.
- Piezas 100% manuales (sin `generationKey`, agregadas a mano en el futuro) **nunca se tocan** por la regeneración.
- Los herrajes se recalculan por completo en cada regeneración (son derivados, no llevan identidad).
- El material default de las piezas canónicas nuevas nace de `project.materialId` si existe (hoy está hardcodeado 'melamina_blanca' en cada generador).
- Refactor conservador del motor: extraer helpers compartidos (`carcasa()` y helpers de interior) de los 5 generadores; los generadores quedan como composición de helpers. Los herrajes siguen derivándose de fórmulas por generador (deriva por conexiones queda diferida).
- **BREAKING (datos legados)**: proyectos previos en localStorage no tienen `generationKey`. La migración asigna keys derivando desde el nombre canónico con la misma regla de slugging; piezas con nombres no reconocibles quedan sin key y se tratan como manuales.

## Capabilities

### New Capabilities

- `regeneracion-segura`: identidad de piezas y reglas de merge al regenerar desde configuración. Cómo sobreviven las personalizaciones del usuario a un cambio de dimensiones, qué se recalcula y qué se conserva, y cómo migran los proyectos legados.

### Modified Capabilities

(ninguna — `undo-redo` sigue en pieza: cada regeneración con merge es un snapshot más en `past`, igual que hoy)

## Impact

- `src/lib/parametric.ts` — asignación de generationKey en `piece()`/generadores; extracción de helpers `carcasa()`/interior; material default desde config.
- `src/types/index.ts` — nuevo campo en `Piece` (ej. `generationKey?: string`).
- `src/stores/projectStore.ts` — `updateConfig` con lógica de merge en vez de reemplazo total.
- `src/lib/storage.ts` — migración de legados: asignación de keys desde nombre.
- Sin dependencias nuevas. Sin cambios de UI visibles (el flujo existente simplemente deja de perder trabajo).
