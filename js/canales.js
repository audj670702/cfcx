/* CFCX · Adaptador público de canales TV Digital · v2.0
   No hace consultas administrativas ni envía credenciales a Wix.
   Respeta el código CHXX; CH00 se agrega solo desde configuración de EO.
*/
(function () {
  'use strict';

  function listaCanonica(items, canalEO) {
    if (!Array.isArray(items)) throw new Error('CATALOGO_INVALIDO');
    var vistos = {};
    var canales = items.map(function (item) {
      var codigo = String(item.codigo || '').trim().toUpperCase();
      var match = /^CH(\d{2,})$/.exec(codigo);
      if (!match || Number(match[1]) < 1 || vistos[codigo]) return null;
      vistos[codigo] = true;
      if (item.activo === false) return null;
      var numero = match[1];
      var n = Number(numero);
      var tipo = String(item.tipo || '').trim().toUpperCase();
      // El catálogo general reserva CH01/CH02 para VPS y CH03+ para YouTube.
      if ((n <= 2 && tipo !== 'VPS') || (n >= 3 && tipo !== 'VIRTUAL')) return null;
      var url = String(item.rutaHls || item.url || '').trim();
      var playlist = String(item.playlistYoutube || item.playlist || '').trim();
      var idEnUrl = /[?&]list=([a-zA-Z0-9_-]+)/.exec(playlist);
      if (idEnUrl) playlist = idEnUrl[1];
      return {
        codigo: codigo,
        numero: numero,
        nombre: String(item.nombre || codigo).slice(0, 100),
        tipo: tipo === 'VPS' ? 'hls' : 'youtube',
        url: tipo === 'VPS' && /^https:\/\//i.test(url) ? url : '',
        playlist: tipo === 'VIRTUAL' && /^[a-zA-Z0-9_-]{8,}$/.test(playlist) ? playlist : '',
        espacio: item.espacio || null,
        orden: Number.isFinite(Number(item.orden)) ? Number(item.orden) : n
      };
    }).filter(Boolean).sort(function (a, b) {
      return Number(a.numero) - Number(b.numero);
    });

    // CH00 no entra al CMS general y nunca es obtenido del endpoint Wix.
    if (canalEO && canalEO.activo === true) {
      var tipoEO = String(canalEO.tipo || '').trim().toUpperCase();
      var urlEO = String(canalEO.rutaHls || '').trim();
      var listaEO = String(canalEO.playlistYoutube || '').trim();
      var esVps = tipoEO === 'VPS' && /^https:\/\//i.test(urlEO);
      var esVirtual = tipoEO === 'VIRTUAL' && /^[a-zA-Z0-9_-]{8,}$/.test(listaEO);
      if (esVps || esVirtual) canales.unshift({
        codigo: 'CH00', numero: '00', nombre: String(canalEO.nombre || 'Canal EO'),
        tipo: esVps ? 'hls' : 'youtube', url: esVps ? urlEO : '',
        playlist: esVirtual ? listaEO : '', espacio: null, orden: 0
      });
    }
    return canales;
  }

  function remoto(cfg) {
    if (!cfg.canalesPublicosUrl) return Promise.reject(new Error('URL_NO_CONFIGURADA'));
    return fetch(cfg.canalesPublicosUrl, { cache: 'no-store', mode: 'cors' })
      .then(function (respuesta) {
        if (!respuesta.ok) throw new Error('HTTP_' + respuesta.status);
        return respuesta.json();
      }).then(function (datos) {
        if (!datos || datos.ok !== true || !Array.isArray(datos.canales)) {
          throw new Error('RESPUESTA_INVALIDA');
        }
        return { canales: listaCanonica(datos.canales, cfg.canalEO), origen: 'PANEL_TV' };
      });
  }

  function respaldo(cfg) {
    return fetch(cfg.datos.canales, { cache: 'no-cache' })
      .then(function (respuesta) {
        if (!respuesta.ok) throw new Error('SIN_RESPALDO');
        return respuesta.json();
      }).then(function (datos) {
        return { canales: listaCanonica(datos.canales, cfg.canalEO), origen: 'RESPALDO' };
      });
  }

  window.CFCX_CANALES = {
    desdePanel: remoto,
    cargarInicial: function (cfg) {
      return remoto(cfg).catch(function (error) {
        console.warn('CFCX: catálogo Wix no disponible; usando respaldo temporal.', error.message);
        return respaldo(cfg);
      });
    },
    // Expuesto para pruebas y verificación de reglas de numeración.
    normalizar: listaCanonica
  };
})();
