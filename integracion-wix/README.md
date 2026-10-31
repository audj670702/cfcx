# REVISTA CFCX — enlace Wix Blog → App

**Modelo editorial simplificado:** el editor crea y publica las entradas directamente en Wix Blog. La app CFCX solo las lee. **No** se requiere URL de YouTube, transcripción, producción de artículos ni duplicar el CMS.

## Fuente de verdad

- Sitio Wix: SCaD (https://www.scad.mx)
- Blog: categoría **Revista CFCX** (`3d668a53-3fb1-46f1-a162-3b02e8d23f9d`)
- Firma visual (independiente del miembro Wix): **Redacción Canal Foro CX**
- Primera entrada publicada utilizada para diseñar el contrato: **«Detrás de «Luxure»: crear cine entre amigos y resolver sobre la marcha»**, con imagen de portada, párrafos, encabezados, dos imágenes interiores, un bloque HTML y un botón de enlace a YouTube.
- La función solo lee publicaciones con categoría válida; excluye vistas previas y contenido asociado a planes de pago.

## Implementación en Wix (pendiente de publicar)

1. En **SCaD → Velo → Backend**, crear `revistaCfcx.js` con el contenido de [revistaCfcx.js](revistaCfcx.js).
2. **Sin reemplazar** el `backend/http-functions.js` actual, añadir al final el contenido de [http-functions-snippet.js](http-functions-snippet.js). No duplicar imports de `ok`/`serverError` si ya existen.
3. Publicar el sitio Wix para activar `GET https://www.scad.mx/_functions/revistaCfcx`.
4. Verificar desde fuera del editor que responda **200** y el objeto `{"articulos":[...]}`, que contenga la entrada publicada real. Verificar cabecera CORS `Access-Control-Allow-Origin: https://cfcx.scad.mx`. No publicar si responde error o contiene publicaciones ajenas.
5. Una vez comprobado, cambiar en `js/config.js` (rama de revisión de CFCX) el campo `revistaApiUrl` de `null` a `'https://www.scad.mx/_functions/revistaCfcx'`; no hacerlo antes de validar el endpoint.
6. Probar portada en Inicio, carrusel, hemeroteca, texto, imágenes y enlace a entrada original desde la app. El editor podrá agregar artículos nuevos solo publicándolos con la categoría **Revista CFCX**.
7. Fusionar el PR y desplegar CFCX únicamente tras la revisión correspondiente.

**Nota sobre el contenido:** los párrafos, subtítulos, citas e imágenes de Wix Rich Content (Ricos) se normalizan al lector CFCX. Los nodos HTML, iframes y botones personalizados no se ejecutan ni inyectan en la app; se ofrece enlace a la entrada original Wix Blog. Los enlaces de botones a YouTube se usan también como vínculo complementario al programa.

**Seguridad:** la lectura Wix se hace en backend Velo. El navegador solo recibe JSON público y no contiene claves Wix. No mostrar artículos de pago o de otras categorías. Las publicaciones siguen administrándose solo en Wix Blog.

**Alcance excluido:** monitor TV, CH01/CH02, VPS, parrilla, transmisión, producción automática a partir de YouTube.

**Estado actual:** archivos de implementación preparados en la rama `feature/revista-inicio-v020-20261030`; pendiente instalarlos/publicarlos en Wix, activar URL en CFCX y hacer pruebas end-to-end. No afirmar conexión automática operativa antes de estos pasos.
