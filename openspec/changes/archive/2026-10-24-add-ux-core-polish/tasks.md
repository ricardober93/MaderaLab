## 1. Undo/Redo (HU-022)

- [x] 1.1 Agregar `past`/`future` (Project[]), `canUndo`/`canRedo` y helpers de snapshot al store
- [x] 1.2 Integrar push de snapshot en `updateConfig`, `updatePieceMaterial/Color`, `updateAllMaterials/Colors`, `updatePiecePosition/Rotation/Scale`, `resetPieceTransform`, `renameProject` y `deletePiece` (nueva)
- [x] 1.3 Implementar `undo`/`redo` con re-persistencia del estado restaurado y truncate a 50; resetear stacks en create/open/import
- [x] 1.4 Commit de drag del gizmo: snapshot solo en mouse-up (throttle), estado intermedio fuera del historial
- [x] 1.5 Botones Undo/Redo en toolbar con estados disabled y títulos

## 2. Validación de inputs (HU-023)

- [x] 2.1 Extraer util `validateDimension(value, field)` en `types/index.ts` o `lib/validation.ts` usando `DIMENSION_LIMITS`
- [x] 2.2 Refactor de ConfigPanel: inputs controlados con estado de error local, borde rojo, mensaje inline y DOM con `aria-invalid`
- [x] 2.3 Aplicar clamp en `onBlur` (vacío/out-of-range → límite cercano) y bloquear persistencia de valores inválidos
- [x] 2.4 Verificar selector de grosor limitado a `GROSORES_ESTANDAR` y clamps de campos de conteo (entrepanos, repisas, cajones, patas)

## 3. Atajos de teclado (HU-024)

- [x] 3.1 Crear hook `useKeyboardShortcuts` en App consolidando W/E/R (mover listener desde Toolbar), con guard de focus
- [x] 3.2 Implementar `deletePiece(flowId)` en store con snapshot, disparado por Delete/Backspace
- [x] 3.3 Implementar Ctrl+S/Cmd+S con preventDefault, guardado explícito y feedback "Guardado ✓" en toolbar
- [x] 3.4 Implementar Esc: cierra modal de vistas 2D/atajos o deselecciona pieza
- [x] 3.5 Botón "Atajos" en toolbar y `ShortcutsModal` con la tabla de atajos, cerrable con Esc/close

## 4. Onboarding (HU-025)

- [x] 4.1 Crear componente `OnboardingTour` con 4 pasos (elegir mueble → dimensiones → personalizar → exportar) posicionado sobre la UI real
- [x] 4.2 Flag `maderalab_onboarding_done` en localStorage, saltable (botón y Esc), sin reaparición tras completar/saltar
- [x] 4.3 Montar el tour en la primera visita (Dashboard y editor)

## 5. Pulido visual y verificación

- [x] 5.1 Clases de botón consistentes en Toolbar (primario/secundario/ghost/disabled con significado)
- [x] 5.2 Mejorar estados hover/disabled en paneles y lista de piezas; alineación y espaciado consistente
- [x] 5.3 Confirmación visual de guardado y toast/inline para export completado
- [x] 5.4 `npm run build` sin errores y `npm run lint` limpio
- [x] 5.5 Verificación manual: undo/redo tras drag, validación de ancho 100/3500, Ctrl+S, Delete, Esc, tour primera visita
