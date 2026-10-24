## Why

MaderaLab cubre el flujo completo (diseñar → pintar → exportar) pero la interacción cotidiana es frágil: no hay undo/redo, se aceptan dimensiones inválidas que rompen la geometría, no hay atajos de teclado esenciales y el usuario primerizo se enfrenta a la app sin guía. Estas carencias son las últimas HUs de la roadmap y el salto que separa un prototipo de una herramienta profesional de trabajo diario.

## What Changes

- Undo/Redo con stack de máximo 50 estados del proyecto (config, piezas, materiales, colores, transforms), expuesto en toolbar y con Ctrl+Z / Ctrl+Shift+Z
- Validación de inputs del ConfigPanel: rangos mín/máx por dimensión, ejemplo ancho 200–3000 mm, grosores limitados a opciones estándar (3, 6, 12, 15, 16, 18, 19, 25 mm), mensajes de error inline y bloqueo de valores inválidos
- Atajos de teclado consolidados: Delete (eliminar pieza), Ctrl+S (guardar), Ctrl+Z / Ctrl+Shift+Z (undo/redo), Esc (deseleccionar), W/E/R ya existentes, y referencia de atajos accesible desde la UI
- Onboarding mínimo en primer uso (flag en localStorage): tour breve que explica elegir mueble → ajustar dimensiones → personalizar → exportar, saltable y que no reaparece
- Pulido visual profesional: estados hover/active consistentes, feedback de carga/guardado ("Guardado ✓"), disabled states con meaning claro, y mejora de contraste en toolbar y paneles

## Capabilities

### New Capabilities

- `undo-redo`: Historial de estados del proyecto con límite de 50 entradas y comandos undo/redo
- `input-validation`: Rangos de dimensiones y grosores estándar con validación en UI
- `keyboard-shortcuts`: Atajos globales del editor y su referencia en UI
- `onboarding`: Tour de primer uso con persistencia de flag

### Modified Capabilities

## Impact

- `src/stores/projectStore.ts` — stack de undo/redo integrado a las mutaciones existentes
- `src/components/Toolbar.tsx` — botones undo/redo, Ctrl+S, modo persist, atajos nuevos, indicación de guardado
- `src/components/ConfigPanel.tsx` — inputs numéricos con validación y mensajes de error
- `src/components/PropertiesPanel.tsx` — validación en campos de transform si aplica
- `src/data/catalogs.ts` — bloque GROSORES_ESTANDAR
- `src/lib/constants.ts` — límites MIN/MAX por dimensión
- Nuevo `src/components/ShortcutsModal.tsx` y `src/components/OnboardingTour.tsx`
- Sin cambios de tipos de `Piece` ni de formato de persistencia (localStorage sin migración nueva)
