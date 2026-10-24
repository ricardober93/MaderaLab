# Tasks — regeneracion-segura

## 1. Rejilla de seguridad (golden tests) ANTES del refactor

- [x] 1.1 Escribir script/test de golden dumps: para cada tipo de mueble × 3 configuraciones representativas, dump `{ generationKey▪pendiente: usar nombre, nombre, {dimension}, {position} }` de las piezas resultantes. Guardar como fixtures (JSON) en tests.
- [x] 1.2 Test que afirma que los dumps actuales coinciden con los fixtures (green antes del refactor).

## 2. Types + identidad de piezas

- [x] 2.1 Agregar a `Piece` en `src/types/index.ts`: `generationKey?: string`, `nombreCustom?: boolean`.
- [x] 2.2 Agregar `materialId` a `FurnitureConfig` (opcional, default `'melamina_blanca'`).
- [x] 2.3 Extender `piece()` en `src/lib/parametric.ts` con firma `piece(key, nombre, ...)` que asigna generationKey; y que toma el materialId default de config (`c.materialId || 'melamina_blanca'`) si no se pasa material explícito.

## 3. Asignación de keys en los 5 generadores

- [x] 3.1 Enumerar keys por tipo (tapa/base/lateral.izq/lateral.der/fondo/entepano.n/repisa.n/…/cajon frente/lateral/rail/puerta/patas/…) y aplicarlos a `generateEstanteria` (índices según posición física).
- [x] 3.2 Aplicar keys a `generateMesita`.
- [x] 3.3 Aplicar keys a `generateMesa`.
- [x] 3.4 Aplicar keys a `generateCocina`.
- [x] 3.5 Aplicar keys a `generateCajonera`.
- [x] 3.6 Actualizar fixtures del paso 1 con los keys incluidos y re-verificar que dimensional/posicional no cambió.

## 4. Refactor de generadores a helpers compartidos

- [x] 4.1 Extraer `carcasa(c, opts)` (tapa, base, laterales, fondo opcional, retorna piezas + área interna).
- [x] 4.2 Extraer helpers de interior: espaciado de entrepaños, repisas, divisiones y la matemática de espaciado duplicada.
- [x] 4.3 Reescribir los 5 generadores como composición de helpers (chicos) manteniendo schema `generateFurniture` intacto.
- [x] 4.4 Correr golden dumps: byte-identical sin cambios de geometría. Corregir integrando primero con diffs explícitos.
- [x] 4.5 Asegurar que los herrajes derivados por generador mantienen sus cantidades antiguas (assert de compares en tests).

## 5. Merge en projectStore

- [x] 5.1 Implementar `mergePieces(existentes, canonicas)` en `src/lib/parametric.ts` (o `src/lib/merge.ts`): index por key, conservar `{ id, color, materialId, nombre si nombreCustom }`, rebasear `{ dimension, position, rotation, scale }`, piezas sin key intactas al final.
- [x] 5.2 Cambiar `updateConfig` para usar generate + merge (hardware se toma completo del canonical).
- [x] 5.3 Conectar la edición de nombre en PropertiesPanel (si existe la acción de rename, setear `nombreCustom: true`); hoy nombre es sólo lectura — agregar la edición de nombre con flag como tarea del mismo grupo.

## 6. Migración de legados

- [x] 6.1 En `src/lib/storage.ts`, en migración de formato viejo: asignar `generationKey` derivado del nombre mediante tabla de mapping canonica del motor (ej. "Lateral izquierdo" → `lateral.izq`).
- [x] 6.2 Test de migración: proyecto con formato viejo yendants con keys correctos, piezas renombradas quedan sin key.

## 7. UX mínima visible

- [x] 7.1 Select de material del proyecto en ConfigPanel (usa `config.materialId`), simple select reutilizando estilos actuales.

## 8. Verificación final

- [x] 8.1 `npm run build` sin errores de TS.
- [x] 8.2 `npm run lint` limpio.
- [x] 8.3 Prueba manual end-to-end en `npm run dev`: crear estantería, pintar 2 piezas, agregar 1 entrepaño → colores intactos, entrepaño nuevo canónico; Ctrl+Z restaura.
