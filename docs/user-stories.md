# MaderaLab — Historias de Usuario

## Épica 1: Scaffolding y Configuración Base

### HU-001: Configurar proyecto Vite + React + TS

> Como desarrollador, quiero inicializar el proyecto con Vite, React, TypeScript, Tailwind, Three.js y Zustand para tener la base técnica lista.

**Criterios de aceptación:**
- [ ] Proyecto corre con `npm run dev`
- [ ] Tailwind procesa clases correctamente
- [ ] React Three Fiber renderiza un cubo de prueba
- [ ] Store de Zustand funciona (crear, leer, actualizar estado)
- [ ] Estructura de carpetas creada: `src/{components,stores,lib,types,hooks,data}`

---

### HU-002: Definir tipos TypeScript del dominio

> Como desarrollador, quiero tener los tipos base definidos para que todo el código comparta el mismo contrato.

**Criterios de aceptación:**
- [ ] Tipos definidos: `FurnitureType`, `Piece`, `Material`, `Project`, `Hardware`, `Dimension`
- [ ] Tipos exportados desde `src/types/index.ts`
- [ ] Sin `any` — todo tipado estrictamente

---

### HU-003: Crear catálogos estáticos

> Como desarrollador, quiero tener los catálogos de materiales y herrajes para que el motor paramétrico los consuma.

**Criterios de aceptación:**
- [ ] Catálogo de materiales: al menos 6 materiales (MDF, pino, roble, melanina, contrachapado, aglomerado) con nombre, color default, densidad
- [ ] Catálogo de herrajes: tornillos confirmat, dados, bisagras, tiradores, tarquetas, cantos — con medidas estándar
- [ ] Datos en `src/data/` como constantes TypeScript

---

## Épica 2: Motor Paramétrico

### HU-004: Generador de mueble por tipo

> Como usuario, quiero elegir un tipo de mueble y definir sus dimensiones para que la app genere automáticamente todas las piezas necesarias.

**Criterios de aceptación:**
- [ ] Al seleccionar un tipo (estantería, mesita, mesa, cocina, cajonera) e ingresar dimensiones, se genera la lista completa de piezas
- [ ] Cada pieza tiene: id, nombre, dimensiones (largo × ancho × grosor), posición relativa, material asignado
- [ ] Cambiar dimensiones regenera las piezas automáticamente

---

### HU-005: Agregar y quitar componentes

> Como usuario, quiero agregar o quitar componentes (entrepaños, repisas, cajones, puertas, patas) al mueble para personalizarlo.

**Criterios de aceptación:**
- [ ] Puedo agregar un entrepaño → se recalculan todas las posiciones
- [ ] Puedo quitar una repisa → las demás se ajustan
- [ ] Puedo agregar cajones con cantidad configurable
- [ ] Puedo agregar puertas (izquierda/derecha) con bisagras
- [ ] Puedo cambiar patas por panel lateral (mueble al suelo)
- [ ] Todo cambio actualiza la lista de piezas y herrajes

---

### HU-006: Cálculo de lista de corte

> Como usuario, quiero ver la lista de corte completa con cada pieza, sus dimensiones y material para saber qué comprar en el aserradero.

**Criterios de aceptación:**
- [ ] Tabla con: nombre de pieza, cantidad, largo, ancho, grosor, material
- [ ] Se agrupan piezas idénticas (mismas dimensiones y material)
- [ ] Se calcula automáticamente al cambiar el modelo
- [ ] Las dimensiones están en milímetros

---

### HU-007: Cálculo de herrajes

> Como usuario, quiero ver la lista de herrajes necesarios para armar el mueble.

**Criterios de aceptación:**
- [ ] Tabla con: herraje, especificación, cantidad
- [ ] Tornillos confirmat calculados por unión
- [ ] Dados por estante ajustable
- [ ] Bisagras por puerta
- [ ] Tarquetas/cantos por arista expuesta
- [ ] Se recalcula automáticamente al cambiar el modelo

---

## Épica 3: Viewport 3D

### HU-008: Renderizar mueble en 3D

> Como usuario, quiero ver el mueble en 3D para visualizar cómo se ve antes de construirlo.

**Criterios de aceptación:**
- [ ] Viewport centra el mueble al cargar
- [ ] Puedo rotar el modelo (click + arrastre)
- [ ] Puedo hacer zoom (scroll)
- [ ] Puedo panorámica (click derecho + arrastre)
- [ ] Cada pieza se renderiza como una caja con el grosor correspondiente
- [ ] Las piezas se posicionan correctamente respecto a las otras

---

### HU-009: Seleccionar pieza en 3D

> Como usuario, quiero hacer click en una pieza del modelo 3D para seleccionarla y ver sus propiedades.

**Criterios de aceptación:**
- [ ] Click en una pieza → se ilumina (outline o color highlight)
- [ ] La pieza seleccionada se refleja en el panel de propiedades
- [ ] Click en espacio vacío → deselecciona
- [ ] La selección se sincroniza entre la lista de piezas y el viewport

---

### HU-010: Vista explotada

> Como usuario, quiero ver las piezas separadas en vista explotada para entender cómo se ensambla el mueble.

**Criterios de aceptación:**
- [ ] Botón que alterna entre vista ensamblada y explotada
- [ ] Las piezas se separan animadamente en el eje Y
- [ ] La separación es proporcional al tamaño del mueble
- [ ] Se puede rotar y hacer zoom en la vista explotada

---

### HU-011: Asignar materiales y colores

> Como usuario, quiero cambiar el material y color de cada pieza o de todo el mueble para visualizar diferentes combinaciones.

**Criterios de aceptación:**
- [ ] Puedo seleccionar material por pieza (MDF, pino, roble, etc.)
- [ ] Puedo cambiar el color de una pieza individual
- [ ] Puedo aplicar un color/material a todas las piezas
- [ ] Paleta de colores predefinidos + color picker
- [ ] Los cambios se reflejan inmediatamente en el viewport 3D

---

## Épica 4: Interfaz de Usuario

### HU-012: Layout principal de tres paneles

> Como usuario, quiero una interfaz organizada en tres paneles para trabajar cómodamente.

**Criterios de aceptación:**
- [ ] Panel izquierdo: lista de piezas y configuración del mueble
- [ ] Centro: viewport 3D
- [ ] Panel derecho: propiedades de la pieza seleccionada
- [ ] Los paneles son redimensionables (opcional, nice-to-have)
- [ ] Layout responsive que prioriza el viewport en pantallas pequeñas

---

### HU-013: Panel de configuración del mueble

> Como usuario, quiero un panel donde configurar el tipo de mueble y sus dimensiones principales.

**Criterios de aceptación:**
- [ ] Selector de tipo de mueble (estantería, mesita, mesa, cocina, cajonera)
- [ ] Inputs de dimensiones: ancho, alto, profundidad (en mm)
- [ ] Controles para agregar/quitar: entrepaños, repisas, cajones, puertas, patas
- [ ] Cada cambio actualiza el modelo inmediatamente

---

### HU-014: Panel de propiedades de pieza

> Como usuario, quiero ver y editar las propiedades de la pieza seleccionada.

**Criterios de aceptación:**
- [ ] Muestra nombre, dimensiones (no editables — se calculan), material y color
- [ ] Puedo cambiar material y color
- [ ] Si no hay pieza seleccionada, muestra mensaje "Selecciona una pieza"

---

### HU-015: Lista de piezas interactiva

> Como usuario, quiero ver la lista de todas las piezas del mueble y poder seleccionarlas desde ahí.

**Criterios de aceptación:**
- [ ] Lista ordenada por tipo (laterales, entrepaños, repisas, etc.)
- [ ] Click en una pieza → la selecciona en el viewport y en el panel de propiedades
- [ ] Cada ítem muestra nombre, dimensiones y material

---

## Épica 5: Persistencia y Gestión de Proyectos

### HU-016: Dashboard de proyectos

> Como usuario, quiero ver mis proyectos guardados al abrir la app y poder crear uno nuevo.

**Criterios de aceptación:**
- [ ] Pantalla inicial muestra proyectos guardados en localStorage
- [ ] Botón "Nuevo proyecto" → redirige al editor
- [ ] Puedo eliminar un proyecto existente con confirmación
- [ ] Puedo abrir un proyecto existente y continuar editándolo

---

### HU-017: Guardar proyecto automáticamente

> Como usuario, quiero que mi proyecto se guarde automáticamente para no perder trabajo.

**Criterios de aceptación:**
- [ ] Auto-guardado en localStorage cada cambio significativo
- [ ] Indicador visual de "guardado"
- [ ] Ctrl+S guarda manualmente
- [ ] Si localStorage está lleno, mostrar advertencia

---

### HU-018: Exportar e importar proyecto

> Como usuario, quiero exportar mi proyecto como JSON para respaldarlo o compartirlo.

**Criterios de aceptación:**
- [ ] Botón "Exportar" → descarga archivo `.json` con todo el proyecto
- [ ] Botón "Importar" → abre selector de archivo, valida estructura, y carga el proyecto
- [ ] Si el JSON es inválido, muestra error sin corromper el estado actual

---

## Épica 6: Generación de Planos

### HU-019: Generar vistas 2D acotadas

> Como usuario, quiero generar vistas 2D con cotas del mueble para entender sus medidas.

**Criterios de aceptación:**
- [ ] Vista frontal con cotas (ancho, alto, separación de entrepaños)
- [ ] Vista lateral con cotas (profundidad, alto)
- [ ] Vista superior con cotas (ancho, profundidad)
- [ ] Las cotas se calculan automáticamente del modelo paramétrico

---

### HU-020: Exportar plano completo en PDF

> Como usuario, quiero exportar un PDF con el plano completo del mueble para llevarlo al taller.

**Criterios de aceptación:**
- [ ] PDF incluye: vistas 2D acotadas, vista explotada, lista de corte, lista de herrajes
- [ ] Encabezado con nombre del proyecto, tipo de mueble y fecha
- [ ] Generación 100% client-side con jsPDF
- [ ] Botón "Exportar PDF" → descarga el archivo

---

### HU-021: Exportar lista de corte como CSV

> Como usuario, quiero exportar la lista de corte como CSV para dársela al aserradero.

**Criterios de aceptación:**
- [ ] CSV con columnas: pieza, cantidad, largo, ancho, grosor, material
- [ ] Compatible con Excel/Google Sheets
- [ ] Botón "Exportar CSV" → descarga el archivo

---

## Épica 7: UX y Pulido

### HU-022: Undo/Redo

> Como usuario, quiero deshacer y rehacer cambios para experimentar sin miedo a equivocarme.

**Criterios de aceptación:**
- [ ] Ctrl+Z → deshace última acción
- [ ] Ctrl+Shift+Z → rehace
- [ ] Stack de máximo 50 estados
- [ ] Botones en toolbar también disponibles

---

### HU-023: Validación de inputs

> Como usuario, quiero que la app me prevenga de ingresar dimensiones inválidas.

**Criterios de aceptación:**
- [ ] Dimensiones con mín/máx (ej: ancho 200mm–3000mm)
- [ ] Mensaje de error visible si valor fuera de rango
- [ ] No permite guardar dimensiones inválidas
- [ ] Grosores limitados a opciones estándar (3, 6, 12, 15, 16, 18, 19, 25mm)

---

### HU-024: Atajos de teclado

> Como usuario, quiero usar atajos de teclado para trabajar más rápido.

**Criterios de aceptación:**
- [ ] Delete → eliminar pieza seleccionada
- [ ] Ctrl+S → guardar
- [ ] Ctrl+Z → undo
- [ ] Ctrl+Shift+Z → redo
- [ ] Esc → deseleccionar
- [ ] Referencia de atajos accesible desde la UI

---

### HU-025: Onboarding mínimo

> Como usuario primerizo, quiero una breve guía para entender cómo usar la app.

**Criterios de aceptación:**
- [ ] Tooltip o tour interactivo en primer uso (detectado con localStorage flag)
- [ ] Explica: elegir mueble → ajustar dimensiones → personalizar → exportar
- [ ] Se puede saltar y no vuelve a aparecer