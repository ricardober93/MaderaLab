# Design — regeneracion-segura

## Context

Hoy el flujo es: `FurnitureConfig --generateFurniture()--> Piece[]` unidireccional y destructivo. `updateConfig` (projectStore.ts) regenera todo y reemplaza `pieces` y `hardware`, perdiendo color/material/nombre personalizados. Las piezas no tienen identidad semántica: solo uuid (que cambia en cada regeneración porque `piece()` llama a `uuid()`), nombre estrictamente derivado, y dimensiones.

Estados que conviven sobre la misma pieza:

- **Geometría**: lo que dicta la física del mueble (tamaño, posición, rotación, escala) — derivado del config.
- **Decoración**: color, material, nombre editable — elección del usuario.

Especie de "git merge" entre lo canónico nuevo y el override del usuario por pieza, usando un token de identidad determinístico.

Constraint fuerte: ambos hilos del roadmap (cut list → optimizador de corte → presupuesto) dependen de que regenerar preserve las piezas estables. Este cambio se hace primero porque es el cimiento.

## Goals / Non-Goals

**Goals:**

- Cambiar dimensiones/config **no pierde** color, material ni nombre del usuario.
- Piezas nuevas en la config (agrego un entrepaño) aparecen; piezas que dejaron de existir (quito dos) desaparecen.
- Los ids de piezas sobrevivientes **no cambian** (la selección activa, atajos y undo funcionan sin sorpresas).
- Motor preparado para escalar a más tipos de mueble (`carcasa()` helper común).
- Migración automática de proyectos legados en localStorage sin intervención.

**Non-Goals:**

- Edición libre de piezas agregadas manualmente por el usuario (el schema lo *admite* pero ninguna UI lo crea todavía).
- Derivar herrajes desde conexiones (queda diferido; se mantienen los cómputos por generador).
- Simulación estructural / validación de colisiones.
- Multi-mueble por proyecto.

## Decisions

### D1 — identity token: campo explicito `generationKey`, no slug del nombre

El nombre es texto editable; si el key derivara del slug del nombre actual, un rename rompería el merge para siempre. El key se asigna **en generación** dentro de `piece()`:

```
generationKey: "estanteria.lateral.izq" | "estanteria.entepano.2" ...
```

Clave estática de tipo + rol + índice determinístico. Suficientemente único dentro del mueble; no necesita colisiones-safe global porque nunca conviven dos muebles.
*Alternativa descartada*: derivar el key desde el nombre con slug — frágil y renombrar pierde identidad.

### D2 — Merge: conservar decoración, rebasear geometría

En el merge por key:

| Campo | Regeneración | Por qué |
|---|---|---|
| `id` | se **conserva** el uuid del sobreviviente | selección/undo no saltan |
| `color`, `materialId` | conservados | elección estética |
| `nombre` | conservado si el usuario lo renombró, canónico si no | la app no puede saber si el usuario tocó el nombre → se conserva si existe un flag `nombreCustom?: true` que setea el update de nombre) |
| `dimension`, `position`, `rotation`, `scale` | recalculados desde canónico | geometrías desactualizadas desarmarian las uniones |

Única heurística compleja: la renombrada de nombre requiere un flag para distinguir "renombrado por el usuario" de "asignado por el generador". Solución: el generador siempre setea `nombre` canónico; el user action que cambia nombre marca el flag. Si el flag está seteado, nunca se rebasa; si no, vuela canónico.

*Alternativa descartada*: conservar todas posiciones/scales del usuario — desarma el mueble silenciosamente (peor que perder color).

### D3 — updateConfig con tres fases: regenerate → diff → merge

pseudocódigo del flujo en projectStore:

```
const canonical = generateFurniture(newConfig)
const merged = mergePieces(current.pieces, canonical.pieces)
updated = { ...project, config, pieces: merged, hardware: canonical.hardware }
```

`mergePieces(existentes, canonicas)`:
1. index existente por generationKey
2. para cada canónica: si existe → {...existente, geometría de canónica}; si no → pieza nueva (id nuevo uuid, sin override)
3. sobrevivientes que no matchearon → descartados

Piezas sin generationKey en el proyecto actual (legado no reconocido o manual) quedan **al final del array** sin tocar.

### D4 — material default de piezas nuevas desde el material activo del proyecto

Hoy cada generator hardcodea `materialId = 'melamina_blanca'`. La fuente de verdad correcta:
- `config.materialId` (nuevo campo del config, con default 'melamina_blanca' para atrás-compat) → todos los builders lo usan.
- `project.materialId` (que ya existe por updateAllMaterials) queda como info de UI y no confunde el merge.

### D5 — refactor mínimo de generadores: extraer `carcasa()` + helpers de interior

Un solo nivel de abstracción, conservador:

```
lib/parametric.ts
  ├── carcasa(c, opts{ fondo: boolean })              → Piece[] con geometría común + areaInterna
  ├── entradasDeInteriores(areaInterna, entrepanos)   → divisiones/entrep.
  ├── patas(c)                                        → Piece[]
  └── herrajesEstanteria/... (sin cambios, mismo cálculo)
```

- Los 5 generadores quedan cómo composición de ~15-25 líneas c/u.
- `piece()` firma nueva: `piece(key, nombre, kind, ...)` — el key entra en construcción para no olvidar nunca un key.
- **Cuidado**: la refactorización no debe CAMBIAR la geometría resultante (mismas posiciones/dims byte a byte) — snapshot tests por tipo+config para certificar.
- *Alternativa descartada*: no refactorizar y solo agregar keys — duplica matemática de espaciado en 5 lugares, cada bug nuevo nace 5 veces.

### D6 — legados: migración por slug del nombre, fallback manual

storage.ts debe asignar keys a proyectos viejos. Estrategia:

1. Derivar `generationKey` desde el **nombre** con la misma tabla de mapeo usada en generación (ej. "Lateral izquierdo" → `lateral.izq`; con renombrados raros, sin match → sin key.
2. Piezas sin key: `mergePieces` no las toca (son efectivamente "manuales").
3. No se pide re-generación forzada al usuario: su mueble viejo simplemente gana estabilidad en la próxima edición de config para las piezas reconocibles.

Riesgo conocido: pieza renombrada por el usuario en un proyecto legado pierde el merge (no hay flag `nombreCustom` en legacy). Aceptado y documentado — solo la próxima regeneración, no es pérdida acutal, solooverride de color/material queda.

### D7 — undo/redo: cero cambios de arquitectura

`applyChange` (projectStore) ya snapshot el proyecto completo antes de cada cambio. updateConfig con merge es otro cambio con snapshot igual; Ctrl+Z restaura intacto. No se toca俑 `undo-redo` spec.

## Risks / Trade-offs

- **[Refactor puede alterar geometría sutilmente]** → snapshot golden tests: set de configs por tipo, dump de piezas, comparar byte a byte (posición y dims en mm int) antes de mergear. Si difieren, decidir explícito.
- **[Regeneración borra posiciones/scales manipuladas por el usuario]** → documentado y deseable: es la decisión D2 (geometría de la física, no del usuario). El undo (Ctrl+Z) recupera el estado anterior si sorprende.
- **[Legados renombrados pierden el nombre en la próxima regeneración]** → aceptado (D6), documentado en spec con ejemplo.
- **[Keys e índices se corralen si generadores reordenan piezas]** → los índices (ej. `entepano.2`) deben derivar de la semántica (posición en el espacio, no orden de push en el array). Regla de codificación en tasks: "índice por posición física, no por orden de creación".

## Migration Plan

1. Desplegar types + `piece()` con key → building siempre genera con key (transparente para storage viejos: la key es campo extra, `storage.ts` con `~migrateProject` ya agrega campos faltantes defensivamente).
2. Migrar mergePieces de updateConfig.
3. Migración por slug para legados.
4. Rollback: si el merge rompe, revertir updateConfig al comportamiento anterior (reemplazo total sin override) y MAX 1 release — el campo generationKey se queda, no se remueve.

## Open Questions

- ¿El merge de material default (D4) introduce `config.materialId` como campo visible en ConfigPanel (select de material) o se mantiene oculto este cambio? → Recomendación: sí, select visible simple en ConfigPanel; es natural y desbloquea el caso de uso "todo el mueble en pino".
- ¿El flag `nombreCustom` es over-engineering para v1 (los nombres de piezas se renamename en UI siquiera hoy? → Verificar en PropertiesPanel: la muestra el nombre como texto no editable (línea 84-87), así que el flag nunca se setea hoy. Decisión: implementarlo igual (costo de 3 líneas) y documentar como preparación.
