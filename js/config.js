/* CFCX · Fuentes de canales · v2.0
   Panel TV Digital (Wix) administra CH01..; CH00 es opcional y local a la EO.
*/
window.CFCX_CONFIG = {
  canalesPublicosUrl: 'https://www.scad.mx/_functions/tvdCanalesPublicos',
  // Opcional por EO. No se publica ni administra en Panel TV:
  // canalEO: { activo: true, codigo: 'CH00', nombre: 'Canal EO',
  //            tipo: 'VPS', rutaHls: 'https://servidor/eo/index.m3u8' },
  canalEO: null,
  datos: {
    canales: './data/canales.json', // respaldo temporal, NO fuente de administración
    espacios: './data/espacios.json',
    flyers: './data/flyers.json',
    programas: './data/programas.json',
    articulos: './data/articulos.json',
    cupones: './data/cupones.json'
  },
  flyerIntervalo: 5
};
