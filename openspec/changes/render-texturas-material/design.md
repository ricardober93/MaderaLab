# Design — render-texturas-material

## Context

El render de presentación (change `render-presentacion` archivado) pinta piezas con `meshPhysicalMaterial` color plano. Para el look "render de AutoCAD" faltan acabados: veta de madera, partícula de aglomerado, textura estampada de melamina. Todo debe seguir siendo client-side sin red.

## Goals / Non-Goals

- Goal: pieza con material idéntico al catálogo pero con acabado visual (veta/speckle), escala física real en metros, grano alineado al eje largo.
- Goal: ver acabados sin abrir el render (swatches en chips de material).
- Non-Goal: carga de imágenes externas (HDRI/texturas de CDN), PBR completo con gloss maps, cambiar el editor 3D principal.
- Non-Goal: NO tocar el generador paramétrico ni el modelo de datos.

## Decisions

- **D1 — Texturas canvas procedurales, cache por materialId:** `src/lib/textures.ts` genera 512×512 una vez por materialId (lazily al primer uso del render), `document.createElement('canvas')` + bucle de píxeles. Cero fetch. Alternativas descartadas: base64 embebido (binario inflado + 8 materiales distintos), CDN (viola offline).
- **D2 — Perfiles por material sobre HSL del color del catálogo:** derivar claro/oscuro del `colorDefault`; sin nuevos campos en catálogo. Perfiles: veta dura (roble/pino/contrachapado), veta sutil (melamina_roble estampada), fibra mini (mdf), partícula en mote (aglomerado), speckle micro (melamina_blanca/negra). Generador: suma de senos con fase aleatoria + ruido hash determinista (sin Math.random en render: seed por materialId) para reproducibilidad.
- **D3 — UV worldscale por cara:** mutar el atributo `uv` del BoxGeometry por pieza: cada cara escala `uv` por dim física/`TILE` (0.25 m). Orden de caras de BoxGeometry conocido (+X,−X,+Y,−Y,+Z,−Z, 4 verts c/u). Así el tile de veta mide 25 cm en cualquier cara (estantería de 90 cm muestra 3.6 repeticiones en el frente, no estirada). Alternativa descartada: `repeat` único (estira caras laterales).
- **D4 — Grano al eje largo:** el generador dibuja veta a lo largo de `uv.x`. Por pieza, `texture.rotation` = 0 si el eje largo es X, π/2 si es Y/Z. Se usa `texture.clone()` por pieza (comparte la imagen, GPU sub por clone aceptable con ≤30 piezas) y dispose al desmontar.
- **D5 — Prop opcional `textura` en `PieceMesh`:** `{ map, bump }`; el mesh aplica `map` + `bumpMap` (bumpScale 0.15 en unidades de bump de un metro visual → usar 0.002) solo si viene; el editor no pasa la prop y queda como hoy (slinning de rendimiento). Material: sigue `meshPhysicalMaterial`, roughness 0.35 mantiene satinado melamínico.
- **D6 — Swatches CSS para chips de material:** `texturaSwatch(materialId): string` → dataURL 48×48 (canvasERTICAL pequeño, cache Map). PropertiesPanel pinta chips con `backgroundImage`. Cara "saber los acabados" sin abrir render.
- **D7 — AutoCAD-look: archivo de suelo y reflejo leves:** sobre el ContactShadows existente, opcional PISO sutil… descartado: cambia fondos y transparente. Mantener fondo limpio AutoCAD-style (sin piso), solo shade/shadow. Grosor visual vía anisotropía 4 en las texturas.

## Risks / Trade-offs

- R1: per-piece texture clone sube GPU por clone → mitigado: ≤30 piezas en el modal, canvas 512, dispose on unmount.
- R2: mapear UV a mano puede salir torcido si el orden de caras difiere → golden check visual con screenshot por material en e2e.
- R3: generación de 512² por píxel en el creador del modal puede tardar → sprites evalúan lazy por materialId en uso; medir en e2e (debe seguir < ~1 s el open del modal).
- R4: melamina negra + bump = ruido visible en sombra → bump solo para perfil veta, speckle sin bump.
