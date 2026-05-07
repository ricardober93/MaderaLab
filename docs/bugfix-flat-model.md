# Bug Fix — Modelo 3D no se ve plano + doble escala en vista explotada

## Síntomas

- Las piezas del mueble en el viewport 3D no se ven como láminas planas, sino como volúmenes donde todas las dimensiones se ven similares.
- La vista explotada desplaza las piezas incorrectamente (doble multiplicación de SCALE).

## Causas raíz

### 1. Confusión de ejes en mapeo 3D

El tipo `Dimension` usa `{ largo, ancho, grosor }` que son medidas de corte (para la lista de corte del aserradero), pero `PieceMesh` las mapea directamente a `boxGeometry(largo, ancho, grosor)` interpretándolas como `(X, Y, Z)`. Esto es incorrecto porque:

- Un **lateral** tiene `largo=alto(2000), ancho=profundidad(300), grosor=16` → se renderiza como una caja de 2000×300×16 en X,Y,Z → correcto la forma pero el alto está en X en vez de Y
- Una **tapa** tiene `largo=ancho(800), ancho=profundidad(300), grosor=16` → se renderiza como 800×300×16 en X,Y,Z → el 300 que debería ser profundidad(Z) aparece como alto(Y)

### 2. Semántica ambigua de Dimension

`Dimension.largo/ancho/grosor` no indican orientación espacial. Un lateral y una tapa con las mismas dimensiones absolutas se renderizan idénticamente, pero deberían tener orientaciones distintas.

### 3. Falta de campo de orientación/rotación

Sin información de orientación, todas las piezas se renderizan con la misma orientación. Un tablero que debería estar parado (lateral) y uno que debería estar acostado (tapa) se ven iguales.

### 4. Doble multiplicación de SCALE en offsetY

En `Viewport3D.tsx`, `explodeOffset` ya está en unidades Three.js escaladas. Pero en `PieceMesh.tsx`, el `offsetY` se multiplica por `SCALE` de nuevo (`offsetY * s`), resultando en un desplazamiento mil veces menor de lo esperado.

## Solución

### HU-BUG-005: Redefinir dimensiones espaciales en tipo Piece

- Cambiar `Dimension` a `{ sizeX, sizeY, sizeZ }` — coordenadas espaciales ya orientadas (X=ancho mueble, Y=alto, Z=profundidad)
- Agregar `cutDimension: { largo, ancho, grosor }` en `Piece` para la lista de corte
- `PieceMesh` usa `boxGeometry(sizeX, sizeY, sizeZ)` directamente

### HU-BUG-006: Recalcular posiciones y dimensiones en motor paramétrico

- Cada generador asigna `sizeX, sizeY, sizeZ` según la orientación real de la pieza
- `cutDimension` se calcula a partir de `sizeX/Y/Z`: `largo=max(X,Z)`, `ancho=min(max(X,Z),Y)`, `grosor=min(X,Y,Z)`
- Las posiciones corresponden al origen de la pieza en el espacio del mueble

### HU-BUG-007: Corregir doble SCALE en offsetY

- `explodeOffset` se calcula en unidades Three.js escaladas
- `PieceMesh` aplica `offsetY` directamente sin multiplicar por SCALE de nuevo

## Orden de ejecución

```
HU-BUG-005 (tipos) → HU-BUG-006 (motor paramétrico) → HU-BUG-007 (offsetY)
```