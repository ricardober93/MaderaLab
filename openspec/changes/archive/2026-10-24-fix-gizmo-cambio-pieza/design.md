# Design — fix-gizmo-cambio-pieza

## Context

`Viewport3D` usa un `groupRef` (useRef) cuya identidad es estable. Al cambiar de pieza seleccionada, React desmonta el group de la pieza vieja y monta el de la nueva, pero `<TransformControls` es el mismo elemento JSX con props idénticas: no se remonta, y el effect interno de drei (deps `[object]`) no re-corre porque la identidad del RefObject no cambia. El three TransformControls queda `attach()` al THREE.Group muerto de la pieza anterior (fuera del scene graph).

Evidencia del repro: 1ª selección → 0 warnings; switch fondo→tapa → 596 warnings en ~1s; el gizmo queda pintado donde estaba la pieza vieja y no opera la nueva.

## Goals / Non-Goals

**Goals:**
- Tras cambiar de selección, el gizmo controla la pieza nueva (mover, rotar, escalar efectivos vía `persistTransform`).
- Cero warnings "attached 3D object must be part of the scene graph" en el flujo normal de selección.
- No romper el caso "selección persistente ante regeneración" (el merge de regeneracion-segura conserva ids).

**Non-Goals:**
- Rediseñar el sistema de refs (state-based attach) — innecesario para este fix.
- Snap/validación de transformaciones (colisiones; futuro).
- Gizmo en vista explotada (hoy no se muestra; sin cambios).

## Decisions

### D1 — Remount por selección vía `key={selectedPieceId}`

Una sola línea: `<TransformControls key={selectedPieceId} ...>`. Al cambiar selección: TC-viejo se desmonta (detach limpio), TC-nuevo monta y su effect corre después de que React asigna `groupRef.current` al group nuevo (orden de commit: refs antes que effects) → attach correcto.

*Alternativa descartada*: reescribir con estado (`ref={setGroup}` + `object={group}`) — re-attach automático por identidad, pero plantea manejos de null/undefined en drei y reintroduce renders extra sin necesidad; el remount por key es el patrón canónico para "por-elemento-enReact".

*Alternativa descartada*: attach manual imperative con useEffect propio — duplicaría lo que drei ya hace y suma complejidad.

### D2 — W/E/R no se afectan

El `key` depende de `selectedPieceId`, no de `transformMode`: cambiar de modo NO remonta (drei ya actualiza `mode` internamente). La única remota diferencia: si drei no aplicara el cambio de modo en un mismo mount (no evidence), el remount por key adicional por modo sería el paso 2 — no se incluye sin evidencia.

## Risks / Trade-offs

- **[FC former drift: si el usuario cambia de pieza mientras arrastra]** — imposible en la práctica: durante drag, pointer está capturado por el gizmo. Sin mitigación.
- **[Remount recrea el helper visual]** — coste trivial (una escena de gizmo por selección, REPLACED por la nueva), no perceptible.

## Migration Plan

Sin migración de datos. Feature flag no necesario — el fix es determinístico; rollback = revertir el atributo `key`.

## Open Questions

(ninguna)
