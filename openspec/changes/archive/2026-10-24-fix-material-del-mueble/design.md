# Design — fix-material-del-mueble

## Context

`updateConfig({ materialId })` → `generateFurniture()` produce piezas canónicas con `config.materialId`, pero `mergePieces` conserva el `materialId` de la pieza previa sin ninguna condición. El merge no distingue "material default que puso el generador" de "material que eligió el usuario sobre esa pieza".

Efecto visible: el select "Material del mueble" parece muerto (repro confirmado: config=pino, 12/12 piezas melamina_blanca). Los materiales per-piece y "para todas" sí funcionan — el arreglo debe dejar los tres armonizados.

## Goals / Non-Goals

**Goals:**
- Cambiar el select "Material del mueble" repinta el mueble de forma visible (inmediato).
- El override por pieza sobrevive a regeneraciones (se mantiene lo bueno de regeneracion-segura).
- "Material para todas" y el select quedan coherentes entre sí.

**Non-Goals:**
- Tocar `updateAllColors` / colores (la decoración color es override por pieza por diseño, sin cambios).
- Picker de materiales custom, precios, cantos (changes futuros).

## Decisions

### D1 — `materialCustom?: boolean` en `Piece` (mismo patrón que `nombreCustom`)

- `updatePieceMaterial` → guarda `{ materialId, materialCustom: true }`.
- `mergePieces`: `materialId: previa.materialCustom ? previa.materialId : canónica.materialId`.
- El único camino que crea un override es per-piece; si hay flag, es del usuario; si no hay flag, es base.

*Alternativa descartada*: inferir el override comparando el materialId previo contra el que "venía del generador anterior" — requiere guardar el material de generación aparte (estado duplicado) y el generador muta entre versiones: frágil.

### D2 — `updateAllMaterials` sincroniza `config.materialId`

"Material para todas" pasa a setear `config.materialId = materialId` además de repintar. Así el select del ConfigPanel refleja la intención y las piezas futuras (nuevo entrepaño) nacen del mismo material.

*Alternativa descartada*: "para todas" como override masivo (marcando todas las piezas `materialCustom: true`) — congelaría el material contra futuros cambios del select, contradiciendo la intención "quiero TODAS así".

### D3 — Legados: sin migración, sin flag, sin override

Piezas legacy (sin `materialCustom`) se mergen tomando el material canónico — si el usuario cambia el select, su mueble legacy se repinta completo. Es la conducta más intuitiva y la declaramos deuda aceptada: las customizaciones de material pre-merge no son detectables.

## Risks / Trade-offs

- **[Legacy: cambio de select pierde materiales personalizados pre-merge]** → aceptado (D3), documentado en el spec con ejemplo.
- **[Golden tests no cubren materialId]** → los dumps de parametric no incluyen material (ya desacoplado); la conducta nueva se testea con unit test de merge + e2e en browser.

## Open Questions

(ninguna)
