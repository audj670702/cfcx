# App CFCX · Prototipo

Prototipo navegable de la app de **Canal Foro CX**: monitor tipo TV con la señal 24/7 y canales virtuales, Espacios temáticos, revista, videoteca, Arcade, cupones y Mi CFCX con tarjeta de identidad.

HTML, CSS y JavaScript sin frameworks ni compilación. Se publica con GitHub Pages y se puede instalar en el celular (PWA).

## Versión visible de la aplicación

La barra superior muestra de forma permanente la versión debajo del nombre **CANAL FORO CX** (versión inicial visible: `v0.1.0`). La versión se define únicamente en `js/config.js`, propiedad `version`; `js/app.js` la presenta mediante `#appVersion`. Incrementar `version` al publicar cambios. Se actualizó la caché de la PWA a `cfcx-v4` para servir el nuevo diseño.

## Monitor TV · diseño CPC (v0.1.1)

El monitor de CFCX adopta el **modelo visual CPC** (referencia `CPC-eLearning/cpc-tv.js` y `cpc-tv.css` v0.5.35): marco azul oscuro, imagen horizontal 16:9, identificación CH/nombre sobre video, barra inferior compacta con sonido / selección de canales / ampliación, menú desplegable con canal seleccionado, indicador de carga y estática al cambiar. En iPhone, ofrece pantalla completa dentro de la app cuando no está disponible la API nativa.

Se conserva el reproductor de CFCX y la fuente de datos `/_functions/tvdCanales`: CH01–CH02 VPS HLS, CH03+ YouTube; CH00 solo si la EO lo configuró en `js/config.js`. Los Espacios usan el mismo monitor, sin menú de canales en la vista particular. La versión visible es `v0.1.1` y la caché PWA `cfcx-v5`.

## Qué cambiar sin tocar código

| Qué | Dónde |
|---|---|
| Canal CH00 propio de la EO (opcional) | `js/config.js` → `canalEO` |
| Canales generales (CH01+) | Panel TV Digital de SCaD; consulta pública de solo lectura (`/_functions/tvdCanales`) |
| Espacios, talentos y programas por Espacio | `data/espacios.json` |
| Flyers de la franja (con vigencia) | `data/flyers.json` |
| Programas de la videoteca | `data/programas.json` |
| Revista (artículos, exclusivos) | `data/articulos.json` |
| Cupones de aliados | `data/cupones.json` |

**Respaldo VPS:** `js/config.js` conserva las URL HLS de CH01 y CH02 verificadas en Panel TV; únicamente se utilizan si `tvdCanales` omite una URL válida. Las URL informadas por Panel TV siempre prevalecen. Este respaldo no altera ni reinicia el VPS.\n\n**Modelo de canales v2:** Panel TV reserva CH01 y CH02 para señales VPS HLS; CH03+ son canales virtuales con playlists YouTube. No se renumeran los códigos. CH00 solo existe si la EO lo configura en `js/config.js` y nunca se administra en Panel TV. El archivo `data/canales.json` queda únicamente como referencia histórica y **no** determina los canales del monitor. Ante una falla de red, se utiliza el último catálogo oficial guardado por un máximo de 24 horas; si no existe, el monitor indica que no hay conexión. El frontend consulta el endpoint al iniciar, cada 2 minutos y al reactivar la pestaña. **Sin nueva función Wix:** se reutiliza el endpoint existente `GET https://www.scad.mx/_functions/tvdCanales`, implementado en `backend/tvdPublico.js` y expuesto por el `http-functions.js` vigente.

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
