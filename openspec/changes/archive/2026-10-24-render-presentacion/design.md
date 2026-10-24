## Context

El viewport de edición (`Viewport3D.tsx`) usa iluminación plana (ambient + 2 direccionales), grid helper y `TransformControls`. Capturar ese canvas directamente copiaría grid/gizmo/transparencia de edición y obligaría a activar `preserveDrawingBuffer` permanentemente (costo de memoria y re-layout). El mueble ya tiene conversión mm→Three.js vía `SCALE = 0.001` y `PieceMesh` renderiza cada pieza con material/color reutilizables.

Todas las HUs del roadmap están completas; este change agrega el "render de presentación" como paso final del flujo: diseñar → pintar → **render** → planos (PDF/CSV).

## Goals / Non-Goals

**Goals:**
- Imagen de calidad del mueble ensamblado (sombras suaves, material/color reales) en un modal independiente de la edición
- 4 ángulos de cámara sobre el bounding box real del proyecto
- Export PNG hasta 3× de resolución, con opción de fondo transparente
- El último render generado se adjunta como primera página al PDF exportado

**Non-Goals:**
- Vista explotada en el modal de render (queda solo en el editor)
- AEV/HDRI externos o dependencias nuevas (sin network en runtime)
- Persistir renders entre sesiones ni historial de imágenes
- Post-procesado (bloom, tone mapping configurable)

## Decisions

- **D1 — Modal con segundo Canvas, no captura del viewport de edición.** Un `<Canvas>` propio en `RenderModal` permite `preserveDrawingBuffer` solo ahí (captura confiable), fondo configurable, sin grid ni gizmo, y no penaliza la edición diaria. Alternativa descartada: flag global en el viewport → coste permanente y contamina la captura con overlays.
- **D2 — Captura: render forzado + `toDataURL`.** Antes de capturar se llama `gl.render(scene, camera)` explícito con el `pixelRatio` temporal deseado (1×/2×/3×), luego `gl.domElement.toDataURL('image/png')` y restore del ratio. Con `preserveDrawingBuffer:true` esto es determinista.
- **D3 — Realismo sin HDRI de red:** entorno de estudio procedural (drei `Environment` con `Lightformer` children: panel de techo + softbox frontal + relleno lateral + acento cálido — genera cubmap en runtime, cero fetch) + luz clave direccional con sombras reales (`shadows="soft"` VSM en el Canvas, mapSize 2048) + `ContactShadows` para el contacto con el piso. Materiales satinados vía `meshPhysicalMaterial` (roughness 0.45, clearcoat leve) y bordes de definición (aristas tenues) para que melamina clara no se lave sobre fondo blanco. Alternativas descartadas: `Environment preset` (descarga HDRI de CDN, requiere red) y `AccumulativeShadows` (requiere acumulación de frames, incompatible con captura de un frame).
- **D4 — Cámaras derivadas del bounding box real** (mismo cálculo `maxX/maxY/maxZ` que el viewport): distancia = maxDim × 2.5. Presets: perspectiva (¾ elevada), frontal (+Z, elevación 0), lateral (+X), superior (+Y con `camera.up = [0,0,-1]` temporal). Ref de cámara en el Canvas; lookAt al centro del mueble.
- **D5 — Fondo transparente:** `gl={{ alpha: true }}` + `setClearColor(color, transparente ? 0 : 1)`. ContactShadows sigue visible (es mesh en la escena).
- **D6 — `lastRenderDataUrl` en projectStore** (useState de sesión, sin localStorage): se setea al descargar PNG; `generatePDF` lo incluye con `doc.addImage` en página propia tras la portada del nombre y antes de las vistas 2D. Retrocompatible: sin render, PDF igual que hoy.
- **D7 — Reutilización de `PieceMesh`** con `selected: false` y sin `TransformControls`: misma geometría/material que el editor → lo que ves es lo que renderiza.

## Risks / Trade-offs

- [toDataURL devuelve imagen vacía] → mitigado por `preserveDrawingBuffer:true` + render forzado justo antes de leer el canvas
- [captura 3× en muebles grandes puede exceder límites de canvas GPU] → limitar a 3× según bounding box del modal (~700px ancho ⇒ ≤2100px, seguro en hardware WebGL2); restore del ratio en `finally`
- [`camera.up` no restaurado tras vista superior] → setear/resetear dentro de la misma llamada al preset
- [PNG transparente con ContactShadows puede verse "incompleto" fuera de app] → comportamiento esperado; la sombra viaja con alpha del mesh
- [data URL de imágenes grandes en memoria de sesión] → se guarda solo el último render; se resetea al cambiar de proyecto

## Migration Plan

Sin datos que migrar. Rollback trivial: el modal es un componente aislado; el PDF retrocompila sin `lastRenderDataUrl`.

## Open Questions

(ninguna — decisiones cubiertas en D1–D7)
