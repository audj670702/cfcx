/* Agregar estas líneas al FINAL de backend/http-functions.js ya existente.
 * NO sustituir ni modificar los endpoints de TV DIGITAL.
 * Archivo dependiente: backend/revistaCfcx.js
 * URL final: GET https://www.scad.mx/_functions/revistaCfcx
 */
import { ok, serverError } from 'wix-http-functions';
import { consultarRevistaCfcx } from 'backend/revistaCfcx';

export async function get_revistaCfcx(request) {
  try {
    const result = await consultarRevistaCfcx();
    return ok({
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': 'https://cfcx.scad.mx',
        'Cache-Control': 'public, max-age=180'
      },
      body: JSON.stringify(result)
    });
  } catch (error) {
    console.error('REVISTA_CFCX_GET', error);
    return serverError({
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': 'https://cfcx.scad.mx',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ error: 'REVISTA_TEMPORALMENTE_NO_DISPONIBLE' })
    });
  }
}
