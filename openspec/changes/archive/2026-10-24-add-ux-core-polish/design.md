## Context

El editor ya tiene: motor paramétrico, viewport 3D con selección/transform (W/E/R), paneles de configuración y propiedades, vistas 2D acotadas y exportación PDF/JSON/CSV con persistencia en localStorage vía `saveProject` en cada mutación del store.

Cada mutación (`updateConfig`, `updatePiece*`) recalcula y persiste `Project` completo, lo que juega a favor de undo/redo por snapshots. `DIMENSION_LIMITS` y `GROSORES_ESTANDAR` existen en `types/index.ts` y ConfigPanel los muestra, pero `onChange` pasa valores sin validar. Toolbar ya tiene un listener de teclado parcial (W/E/R) con guard de inputs.

Restricciones: client-side puro, sin dependencias nuevas de UI; HU-023 pide "no permite guardar dimensiones inválidas" (los grosores ya son select de opciones estándar desde el código original).

## Goals / Non-Goals

**Goals:**
- Undo/redo transparente cubriendo config, materiales, colores y transforms de piezas (máximo 50 estados)
- Validación visible y bloqueante en inputs de configuración, usando los límites existentes
- Atajos consolidados en un solo sistema (Delete, Ctrl+S, Ctrl+Z/Ctrl+Shift+Z, Esc) + modal de referencia
- Tour de primer uso saltable con flag en localStorage
- Pulido visual: estados consistentes, feedback "Guardado ✓", botones disabled con significado

**Non-Goals:**
- Undo granular por campo o diffing (snapshots completos es suficiente a esta escala)
- Coalescing de drags del gizmo (cada commit del gizmo es una entrada de historial)
- Migración de formato de persistencia
- Autosave aparte (ya se persiste en cada mutación)

## Decisions

**1. Undo/redo por snapshots completos de Project, dentro del store.**
Alternativa: comandos inversos por acción (patrón Command) — más memoria-efficient pero complejo y propenso a bugs con `updateConfig` que regenera piezas. Con proyectos de <100 piezas, snapshot es barato (~KBs) y trivialmente correcto.
- Accesores: `undo`, `redo`, `canUndo`, `canRedo` en `useProjectStore`
- Implementación: `past: Project[]`, `future: Project[]`; cada mutación empuja el Projects anterior a `past` (truncate a 50) y limpia `future`. `undo` mueve head de `past` a `future` y restaura; `redo` inverso. `saveProject` solo se invoca para el estado que queda activo.
- No se registran: `selectPiece`, `setTransformMode`, toggles de vista (no alteran el diseño).
- Crear/abrir/importar proyecto resetea los stacks.

**2. Throttle de drags del gizmo: commit al soltar, estado intermedio no entra al historial.**
Los handlers de arrastre (`onObjectChange` de TransformControls) actualizan sin snapshot; en `onMouseUp` se hace commit (push a past). Evita spam de 30 entradas por drag. Los cambios de inputs numéricos (PropertiesPanel) sí snapshot directo porque son discretos.

**3. Validación con estado de error local en ConfigPanel + clamp al aplicar.**
Alternativa: bloquear tipeo — inaccesible y sin feedback. Se valida contra `DIMENSION_LIMITS` al escribir: borde rojo + mensaje inline bajo el campo; `updateConfig` solo se llama si el valor es válido o al `onBlur` (clamp al rango). Grosores ya están forzados por `<select>`. Regla: el valor inválido solo vive en el input mientras se edita; el proyecto nunca persiste un valor fuera de rango.

**4. Un único `useKeyboardShortcuts` hook global en App.**
Consolida el listener actual de Toolbar (W/E/R se mueve ahí). Guard estándar: ignorar cuando focus en input/select/textarea o modal abierto (salvo Esc que también cierra modales). Delete sin `Ctrl` (mac: Delete/Backspace) elimina pieza seleccionada con snapshot (nuevo `deletePiece` en store — evita pieza huérfana de herrajes no altera). Ctrl+S previene default del navegador y dispara guardado explícito con feedback visual "Guardado ✓".

**5. Onboarding como stepper overlay ligero, sin dependencia de driver externo.**
5 pasos posicionados con CSS sobre el layout real (toolbar, ConfigPanel, PropertiesPanel, botones export). Flag `maderalab_onboarding_done` en localStorage; "Saltar" o completar el tour lo marca. Alternativa reactour/librería — dependencia extra innecesaria para 5 pasos.

**6. Pulido visual con tokens Tailwind consistentes en Toolbar/paneles/botones.**
Clase compartida de botón (primario/secundario/ghost/disabled), iconografía mínima con caracteres/SVG inline (sin lib de iconos), tooltips con `title` existente extendido a atajos.

## Risks / Trade-offs

- [Snapshot en cada mutación duplica memoria visible en drags sin throttle] → commit único al soltar (Decisión 2) y truncate a 50.
- [Undo restaura estado viejo pero localStorage ya tiene el nuevo] → `undo`/`redo` re-invocan `saveProject`, así las vistas de destruyen quedan sincronizadas.
- [Delete por teclado puede dispararse con foco en un panel no-input] → guard de focus + confirmación implícita vía undo disponible (no `confirm()` nativo).
- [Tour overlay puede tapar interacción real] → overlay con `pointer-events-none` salvo el elemento activo y botones del tour; dismissible con Esc.
- [Ctrl+S puede chocar en macOS con Cmd] → se escucha `(e.metaKey || e.ctrlKey)`.
