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


## REVISTA CFCX · Primera etapa (rama de revisión)

El monitor de Inicio y el servicio de canales permanecen intactos. Se pausan los accesos rápidos y el carrusel de flyers. REVISTA se convierte en la segunda sección de Inicio y se añade a la barra inferior con Videoteca.

REVISTA dispone de portadas retro compuestas en la app, carrusel automático de las cinco publicaciones recientes, hemeroteca desplazable, filtro de búsqueda y lectura editorial con fotografías, audio opcional y enlace complementario al programa de origen.

Fuente exclusiva prevista: Wix Blog de SCaD; se han retirado los artículos de demostración del flujo de carga. La propiedad \`revistaApiUrl\` de \`js/config.js\` permanece en null hasta que esté disponible un endpoint Wix público, autorizado y filtrado para CFCX. El endpoint debe devolver \`{ "articulos": [...] }\` con \`id, titulo, tipo, resumen, portada, texto/bloques, audioUrl, fotografias, programa, programaUrl, espacio\`. El navegador no debe usar claves Wix. Sin publicaciones se muestra un estado vacío real.


## REVISTA v0.2.0 · revisión de diseño conforme a continuidad

Se mantiene la rama de desarrollo y la integración editorial pendiente. Las portadas se componen en CFCX en proporción 3:4 con papel cálido, acentos vino, cabecera, fotografía, titular, entrada, edición, fecha y firma Redacción Canal Foro CX. El carrusel rota entre las cinco entradas recientes; flechas, indicadores y miniportadas permiten selección manual, pausan el movimiento y mantienen sincronizada la selección. Las miniportadas y la hemeroteca permiten consultar las entradas anteriores. Se respeta la preferencia de movimiento reducido.

La hemeroteca busca título, tema, invitado, programa y etiquetas, con orden cronológico. El lector conserva título, entrada, firma, fecha, fotografía, párrafos, subtítulos, citas, imágenes, galería, audio opcional y fuente original. Inicio conserva monitor primero y revista después; la navegación mantiene Inicio, Revista, Videoteca, Arcade y Mi CFCX.

Sin servicio editorial configurado se muestra un estado vacío: no se sustituyen publicaciones de Wix por artículos locales. Las muestras para verificación visual se sirven exclusivamente en la vista local externa al repositorio y no forman parte del contenido publicado. No se han modificado monitor, fuentes de canales ni servicios VPS. Pendiente: Wix Blog → Velo → CFCX y validación con una entrada publicada real.

### Ajuste de Inicio: carrusel de cinco ediciones

El bloque editorial bajo el monitor muestra una publicación a la vez entre las cinco más recientes, conservando portada vertical, titular, resumen y lectura directa. Incluye flechas, cinco indicadores como máximo y pausa/reanudación. La interacción pausa el avance automático; se respeta movimiento reducido. El botón fijo «Explorar más» abre `#/revista`. No se altera el monitor ni el catálogo de canales.


## Instalación · v0.2.1

El botón «Instalar app» en la barra superior abre el diálogo nativo cuando el navegador entrega `beforeinstallprompt`. En iPhone/iPad abre el tutorial `assets/tutorial-instalar-app.mp4` con controles y pasos de Safari para agregar a pantalla de inicio. Si no hay diálogo nativo disponible, muestra instrucciones de instalación y acceso al tutorial de iPhone. El acceso se oculta en modo standalone y después de `appinstalled`; el cierre pausa el video. El MP4 se carga bajo demanda y queda fuera de la caché del service worker para evitar almacenar el tutorial de 13 MB o respuestas HTTP Range.
