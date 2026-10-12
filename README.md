# App CFCX · Prototipo

Prototipo navegable de la app de **Canal Foro CX**: monitor tipo TV con la señal 24/7 y canales virtuales, Espacios temáticos, revista, videoteca, Arcade, cupones y Mi CFCX con tarjeta de identidad.

HTML, CSS y JavaScript sin frameworks ni compilación. Se publica con GitHub Pages y se puede instalar en el celular (PWA).

## Qué cambiar sin tocar código

| Qué | Dónde |
|---|---|
| URL de la señal 24/7 (HLS) | `js/config.js` → `senal24.url` |
| Canales y sus listas de YouTube | `data/canales.json` |
| Espacios, talentos y programas por Espacio | `data/espacios.json` |
| Flyers de la franja (con vigencia) | `data/flyers.json` |
| Programas de la videoteca | `data/programas.json` |
| Revista (artículos, exclusivos) | `data/articulos.json` |
| Cupones de aliados | `data/cupones.json` |

> Las listas de YouTube de los canales virtuales son **ejemplos** tomadas del catálogo actual de TV Digital Internet. Sustitúyelas por las definitivas.

## Pantallas (rutas)

`#/inicio` · `#/espacios` · `#/espacio/<id>` · `#/revista` · `#/videoteca` · `#/buscar` · `#/arcade` · `#/cupones` · `#/mi`

## Alcance de esta fase

Incluido: monitor con canales, accesos rápidos, flyers automáticos, Espacios, revista, videoteca, búsqueda, menú de Arcade, cupones personalizados y tarjeta de identidad con **sesión simulada** (guardada solo en el dispositivo), modo claro/oscuro/automático.

Siguiente fase: inicio de sesión real con Wix, contenido desde el CMS de Wix, generación y canje real de cupones, integración de los RIAs (Laberinto, Serpientes y escaleras, Colores) con banco de preguntas propio de CFCX, formulario "Comparte con CFCX".

## Estructura

```
index.html            cáscara de la app
css/app.css           estilos y temas
js/config.js          configuración (señal, archivos de datos)
js/store.js           tema, sesión simulada y cupones (localStorage)
js/monitor.js         monitor TV: HLS + YouTube
js/app.js             rutas y pantallas
data/*.json           contenido editable
service-worker.js     PWA (no guarda la señal en vivo)
```
