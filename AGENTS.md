# MaderaLab — Agent Context

## Proyecto

App web client-side para diseñar muebles en 3D, pintarlos y generar planos de construcción. Sin autenticación, sin backend — todo corre en el navegador.

## Stack

- React 19 + TypeScript + Vite 8
- Three.js 0.170 + React Three Fiber 9 + Drei 10
- Zustand 5 (estado global)
- Tailwind CSS 4 (vía @tailwindcss/vite)
- jsPDF + jspdf-autotable (exportación PDF)
- localStorage (persistencia)

## Comandos

- `npm run dev` — levantar dev server
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — eslint
- `npm run preview` — preview del build

## Estructura

- `src/types/index.ts` — Tipos: Piece, SpatialDimension, CutDimension, FurnitureConfig, Project, etc.
- `src/data/catalogs.ts` — Catálogos: materiales, paleta de colores, herrajes
- `src/lib/constants.ts` — Constantes (SCALE = 0.001 para conversión mm→Three.js)
- `src/lib/parametric.ts` — Motor paramétrico: genera piezas y herrajes por tipo de mueble
- `src/lib/storage.ts` — localStorage, export/import JSON, migración de formato viejo
- `src/stores/projectStore.ts` — Store Zustand: proyectos, configuración, piezas, selección
- `src/lib/orthographic.ts` — Proyecciones 2D: computeFrontalView, computeLateralView, computeTopView (rectángulos + cotas)
- `src/components/OrthographicView.tsx` — Modal SVG con 3 vistas 2D acotadas
- `src/hooks/useKeyboardShortcuts.ts` — Hook global de atajos: W/E/R, Delete, Ctrl+S, Ctrl+Z/Ctrl+Shift+Z, Esc (guard de inputs)
- `src/components/ShortcutsModal.tsx` — Modal de referencia de atajos (estado en store: showShortcuts)
- `src/components/OnboardingTour.tsx` — Tour de primer uso, 4 pasos, flag `maderalab_onboarding_done` en localStorage

## Decisiones clave

- Unidades en milímetros, SCALE=0.001 para Three.js
- Dimensiones espaciales (sizeX/sizeY/sizeZ) para render + cutDimension (largo/ancho/grosor) para planos
- 5 tipos de mueble: estantería, mesita, mesa, cocina, cajonera
- Interfaz en español
- Ver `docs/business-decisions.md` para decisiones completas

## HUs completadas

- HU-001 a HU-018 (scaffolding, tipos, catálogos, motor paramétrico, viewport 3D, selección, vista explotada, materiales/colores, layout, paneles, dashboard, persistencia, export JSON)
- HU-019 (vistas 2D acotadas en pantalla + PDF), HU-020 (vistas 2D en PDF actualizado, antes solo tablas)
- HU-020 (export PDF con vistas 2D vectoriales), HU-021 (export CSV)
- HU-022 (undo/redo con snapshots en projectStore, límite 50, botones en toolbar)
- HU-023 (validación de dimensiones en ConfigPanel: rango, error inline, clamp en blur; grosores estándar por select)
- HU-024 (atajos consolidados en useKeyboardShortcuts + modal de atajos + "Guardado ✓" con Ctrl+S)
- HU-025 (onboarding de 4 pasos, saltable, flag en localStorage)
- HU-BUG-001 a HU-BUG-007 (fixes de versiones, escala, guards, layout, dimensiones espaciales, offsetY, migración localStorage)

Cambios recientes resumidos en change archivado: `openspec/changes/archive/2026-10-24-add-ux-core-polish/` (specs en `openspec/specs/`: undo-redo, input-validation, keyboard-shortcuts, onboarding)

## HUs pendientes

(ninguna — todas las HUs del roadmap están completas)

## Documentación

- `docs/business-decisions.md` — Decisiones de negocio
- `docs/user-stories.md` — Historias de usuario completas
- `docs/bugfix-flat-model.md` — Documentación del fix de modelo 3D plano + escala

## Notas para el agente

- Siempre correr `npm run build` después de cambios para verificar
- No agregar comentarios al código a menos que se pida
- Los dimensiones de Piece son espaciales (sizeX/sizeY/sizeZ), nunca usar largo/ancho/grosor para render
- Los proyectos viejos en localStorage pueden tener formato legacy — `migrateProject()` en storage.ts los maneja