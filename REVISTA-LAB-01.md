# REVISTA CFCX · LAB 01 — Portada digital interactiva

**Base:** \`main\` v0.2.3. **Prototipo:** \`v0.2.4-LAB\`. No publicar/fusionar sin revisar experiencia y accesibilidad.

## Experiencia

Se preserva la imagen de la portada editorial de «Luxure», sin modificar ni reconstruir las tipografías, la fotografía o la composición.

En la sección **Revista** (no en el reproductor), cinco áreas transparentes coinciden con los titulares impresos:

1. **Artículo principal:** «Detrás de Luxure».
2. **Un guion que se transforma.**
3. **Filmar en Celaya.**
4. **Un aprendizaje colectivo.**
5. **CINE EN CORTO** (franja inferior) → vínculo al video.

Al pulsar o tocar una zona se resalta sutilmente y se presenta una ficha textual adyacente (o debajo de la portada, en móvil). La ficha ofrece **Leer en Wix Blog** o **Ver programa completo**. No se reconstruye el artículo dentro de CFCX.

Las mismas zonas aparecen como controles textuales accesibles, con foco visible y estados \`aria-pressed\`, incluso en móvil donde los textos impresos son pequeños. La imagen grande usa carga prioritaria. Se respeta la preferencia del usuario por movimiento reducido.

## Archivos de prueba

- \`data/revista-inicial.json\`: sección \`interacciones[]\` por edición, con coordenadas porcentuales, texto corto y acción. Permite evolucionar a otras portadas sin recodificar el componente.
- \`js/app.js\`: \`portadaInteractiva()\` + \`mostrarDetallePortada()\`, y presentación condicional dentro de \`V.revista\`.
- \`css/app.css\`: áreas clicables, foco, respuestas visuales y layout adaptable.
- \`js/config.js\`, \`index.html\`, \`service-worker.js\`: identificación \`v0.2.4-LAB\` y recursos coherentes.

**Compatibilidad:** publicaciones sin \`interacciones[]\` mantienen el enlace directo a su entrada original. La portada del módulo Inicio continúa con su comportamiento actual; la interacción experimental se limita a la portada destacada en Revista.

## Verificación antes de publicar

- Revisar en móvil/desktop que las zonas coincidan con los titulares; ajustar áreas según el tamaño real de la portada.
- Probar clic, teclado (Tab + Enter/Espacio), lectores de pantalla y texto/controles alternativos.
- Verificar que se abran:
  - https://www.scad.mx/post/luxure-cine-en-corto-guion-rodaje-celaya
  - https://www.youtube.com/watch?v=HR1pSzHeUkE
- Confirmar que Inicio, monitor CH01/CH02, Videoteca, Arcade y Mi CFCX sigan iguales.
- Probar caché de PWA y conexión móvil.
- Validar en un entorno de vista previa antes de fusionar.

**No incluidos:** modificación de Wix Blog, backend Velo, publicación automática, cambios a TV DIGITAL, VPS, HLS, señales o a \`main\`.

## Pregunta de diseño para el siguiente ciclo

¿Conviene mantener las fichas debajo de la portada en móvil o convertirlas en un panel deslizable, preservando siempre la fotografía completa?
