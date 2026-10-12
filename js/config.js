/* ==========================================================
   App CFCX · configuración general
   Cambia aquí la señal 24/7 sin tocar el resto del código.
   ========================================================== */
window.CFCX_CONFIG = {
  // Señal digital 24/7 (HLS) emitida desde el VPS.
  senal24: {
    nombre: 'Señal CFCX 24/7',
    url: 'https://tvdigital.scad.mx/cfcx/canal/index.m3u8'
  },

  // Archivos de contenido (editables sin tocar código).
  datos: {
    canales: './data/canales.json',
    espacios: './data/espacios.json',
    flyers: './data/flyers.json',
    programas: './data/programas.json',
    articulos: './data/articulos.json',
    cupones: './data/cupones.json'
  },

  // Segundos entre cada flyer en la franja automática.
  flyerIntervalo: 5
};
