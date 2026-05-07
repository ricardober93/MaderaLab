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
- `src/components/` — UI: Viewport3D, PieceMesh, ConfigPanel, PropertiesPanel, PiecesList, Toolbar, Dashboard

## Decisiones clave

- Unidades en milímetros, SCALE=0.001 para Three.js
- Dimensiones espaciales (sizeX/sizeY/sizeZ) para render + cutDimension (largo/ancho/grosor) para planos
- 5 tipos de mueble: estantería, mesita, mesa, cocina, cajonera
- Interfaz en español
- Ver `docs/business-decisions.md` para decisiones completas

## HUs completadas

- HU-001 a HU-018 (scaffolding, tipos, catálogos, motor paramétrico, viewport 3D, selección, vista explotada, materiales/colores, layout, paneles, dashboard, persistencia, export JSON)
- HU-020 (export PDF), HU-021 (export CSV)
- HU-BUG-001 a HU-BUG-007 (fixes de versiones, escala, guards, layout, dimensiones espaciales, offsetY, migración localStorage)

## HUs pendientes

- HU-019: Vistas 2D acotadas en el PDF (actualmente solo tiene tablas)
- HU-022: Undo/Redo (stack de 50 estados, Ctrl+Z/Ctrl+Shift+Z)
- HU-023: Validación de inputs (dimensiones mín/máx, grosores estándar)
- HU-024: Atajos de teclado (Delete, Ctrl+S, Ctrl+Z, Esc)
- HU-025: Onboarding mínimo (tour en primer uso)

## Documentación

- `docs/business-decisions.md` — Decisiones de negocio
- `docs/user-stories.md` — Historias de usuario completas
- `docs/bugfix-flat-model.md` — Documentación del fix de modelo 3D plano + escala

## Notas para el agente

- Siempre correr `npm run build` después de cambios para verificar
- No agregar comentarios al código a menos que se pida
- Los dimensiones de Piece son espaciales (sizeX/sizeY/sizeZ), nunca usar largo/ancho/grosor para render
- Los proyectos viejos en localStorage pueden tener formato legacy — `migrateProject()` en storage.ts los maneja