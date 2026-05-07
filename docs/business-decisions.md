# MaderaLab — Decisiones de Negocio

## 1. Modelo de Negocio

- **Producto gratuito y open source**: MaderaLab es una herramienta client-side sin modelo de suscripción ni monetización.
- **Sin autenticación**: No hay cuentas de usuario, login, ni roles. Cada navegador es un entorno aislado.

## 2. Plataforma y Distribución

- **Web only**: La app se distribuye como sitio web estático. No hay versión desktop nativa ni app móvil.
- **Optimizada para desktop**: El modelado 3D no es práctico en pantallas táctiles pequeñas. La app es responsive pero no es prioridad móvil.
- **Sin backend**: Toda la lógica corre en el navegador. No hay servidor, base de datos, ni API externa.

## 3. Persistencia y Datos

- **localStorage**: Los proyectos se persisten en localStorage del navegador (~5MB de capacidad).
- **Export/Import JSON**: Mecanismo de respaldo para compartir o migrar proyectos entre navegadores.
- **Sin sincronización en la nube**: No hay respaldo automático. El usuario es responsable de exportar sus proyectos.
- **Sin colaboración en tiempo real**: No hay funcionalidad de compartir ni editar en equipo.

## 4. Unidades y Medidas

- **Sistema métrico (milímetros)**: Todas las dimensiones se manejan en milímetros. No hay soporte para pulgadas.
- **Grosores estándar**: Se limita a grosores comerciales comunes: 3mm, 6mm, 12mm, 15mm, 16mm, 18mm, 19mm, 25mm.

## 5. Modelado 3D

- **Paramétrico, no freeform**: El usuario elige un tipo de mueble y configura parámetros. No hay modelado libre ni escultura 3D.
- **Piezas primitivas**: Solo se usan tableros (cajas con dimensiones) y listones. No hay piezas curvas ni irregulares.
- **Sin simulación estructural**: La app no valida resistencia ni cargas. Es una herramienta de diseño visual y planos.
- **Texturas procedurales**: Los materiales se representan con colores y patrones generados, no con imágenes de textura reales.

## 6. Tipos de Mueble

- **Lanzamiento inicial**: 5 tipos — estantería, mesita de noche, mesa, mueble de cocina (base), cajonera.
- **Extensible**: La arquitectura permite agregar más tipos en el futuro.

## 7. Planos y Exportación

- **PDF client-side**: Los planos se generan en el navegador con jsPDF. No hay servidor de impresión.
- **CSV para aserradero**: Lista de corte exportable como CSV compatible con Excel/Google Sheets.
- **Sin exportación CAD**: No se generan archivos .dwg, .dxf, .skp ni formatos propietarios.

## 8. Uniones y Herrajes

- **Tornillos confirmat + dados**: Unión principal para tableros.
- **Tarquetas/espigas**: Alineación y refuerzo.
- **Bisagras**: Para puertas.
- **Cantos**: Cantos melamínicos en aristas visibles.
- **No se simulan herrajes en 3D**: Se listan en el plano pero no se renderizan en el viewport.

## 9. Idioma

- **Español**: Toda la interfaz está en español. No hay internacionalización ni soporte multi-idioma en esta versión.

## 10. Colores y Materiales

- **Paleta predefinida**: ~20 colores comunes en carpintería (blancos, naturales, oscuros, colores melanina).
- **Color picker**: Selector de color libre para personalización.
- **Materiales como metadatos**: El material afecta el color default y el grosor disponible, pero no la física del render.

## 11. UX y Accesibilidad

- **Sin onboarding obligatorio**: Tour opcional en primer uso, skipeable.
- **Sin modo oscuro**: Versión inicial solo con tema claro.
- **Atajos de teclado**: Para usuarios avanzados, con referencia accesible desde la UI.