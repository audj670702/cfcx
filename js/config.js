/* CFCX · Fuentes de canales · v2.0
   Panel TV Digital (Wix) administra CH01..; CH00 es opcional y local a la EO.
*/
window.CFCX_CONFIG = {
  // Versión visible en la barra superior. Incrementar en cada publicación.
  version: 'v0.1.0',
  canalesPublicosUrl: 'https://www.scad.mx/_functions/tvdCanales',
  // Señales VPS de contingencia tomadas de la configuración confirmada en Panel TV.
  // Solo se usan cuando tvdCanales no proporciona una URL HLS válida.
  // Una URL válida recibida desde el Panel TV siempre tiene prioridad.
  senalesVpsRespaldo: {
    CH01: 'https://tvdigital.scad.mx/cfcx/canal/index.m3u8',
    CH02: 'https://tvdigital.scad.mx/cfcx/prueba/index.m3u8'
  },
  // Opcional por EO. No se publica ni administra en Panel TV:
  // canalEO: { activo: true, codigo: 'CH00', nombre: 'Canal EO',
  //            tipo: 'VPS', rutaHls: 'https://servidor/eo/index.m3u8' },
  canalEO: null,
  datos: {
    canales: './data/canales.json', // referencia histórica, NO fuente de administración
    espacios: './data/espacios.json',
    flyers: './data/flyers.json',
    programas: './data/programas.json',
    articulos: './data/articulos.json',
    cupones: './data/cupones.json'
  },
  flyerIntervalo: 5
};
