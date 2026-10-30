# App CFCX · Prototipo

Prototipo navegable de la app de **Canal Foro CX**: monitor tipo TV con la señal 24/7 y canales virtuales, Espacios temáticos, revista, videoteca, Arcade, cupones y Mi CFCX con tarjeta de identidad.

HTML, CSS y JavaScript sin frameworks ni compilación. Se publica con GitHub Pages y se puede instalar en el celular (PWA).

## Qué cambiar sin tocar código

| Qué | Dónde |
|---|---|
| Canal CH00 propio de la EO (opcional) | `js/config.js` → `canalEO` |
| Canales generales (CH01+) | Panel TV Digital de SCaD; consulta pública de solo lectura (`/_functions/tvdCanalesPublicos`) |
| Espacios, talentos y programas por Espacio | `data/espacios.json` |
| Flyers de la franja (con vigencia) | `data/flyers.json` |
| Programas de la videoteca | `data/programas.json` |
| Revista (artículos, exclusivos) | `data/articulos.json` |
| Cupones de aliados | `data/cupones.json` |

**Modelo de canales v2:** Panel TV reserva CH01 y CH02 para señales VPS HLS; CH03+ son canales virtuales con playlists YouTube. No se renumeran los códigos. CH00 solo existe si la EO lo configura en `js/config.js` y nunca se administra en Panel TV. La lista de respaldo `data/canales.json` refleja el panel al 2026-10-30 y se muestra únicamente cuando el endpoint Wix no responde. El frontend consulta el endpoint al iniciar, cada 2 minutos y al reactivar la pestaña. **Requisito de sincronización real:** publicar en Wix `backend/http-functions.js` con la función `get_tvdCanalesPublicos` del repositorio `scad-sys`.

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
