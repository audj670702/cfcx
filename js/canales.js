/* CFCX · Adaptador público de canales TV Digital · v2.0
   No hace consultas administrativas ni envía credenciales a Wix.
   Respeta el código CHXX; CH00 se agrega solo desde configuración de EO.
*/
(function () {
  'use strict';

  function listaCanonica(items, canalEO, senalesVpsRespaldo) {
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
      // Si el listado público no incluye rutaHls, recuperar la señal VPS
      // previamente registrada para este canal. No modifica la señal en el VPS.
      if (tipo === 'VPS' && !/^https:\/\//i.test(url)) {
        url = String(senalesVpsRespaldo && senalesVpsRespaldo[codigo] || '').trim();
      }
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

  // Solo guarda el último catálogo oficial, nunca datos de demostración.
  var CACHE_KEY = 'cfcx.canalesPanelTv';
  var CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  function guardarCache(canales) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        guardado: Date.now(),
        canales: canales
      }));
    } catch (_) {
      // La política de almacenamiento del navegador puede impedir guardar.
    }
  }

  function recuperarCache(cfg) {
    try {
      var dato = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (dato && Array.isArray(dato.canales) && Number.isFinite(Number(dato.guardado)) &&
          Date.now() - Number(dato.guardado) <= CACHE_TTL_MS &&
          Number(dato.guardado) <= Date.now()) {
        return { canales: listaCanonica(dato.canales, cfg.canalEO, cfg.senalesVpsRespaldo), origen: 'CACHE' };
      }
    } catch (_) {}
    // Sin datos vigentes, mejor mostrar "sin conexión" que canales incorrectos.
    return { canales: listaCanonica([], cfg.canalEO, cfg.senalesVpsRespaldo), origen: 'SIN_CONEXION' };
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
        var canales = listaCanonica(datos.canales, cfg.canalEO, cfg.senalesVpsRespaldo);
        // Una respuesta correcta sin canales significa que no hay canales activos.
        guardarCache(datos.canales);
        return { canales: canales, origen: 'PANEL_TV' };
      });
  }

  window.CFCX_CANALES = {
    desdePanel: remoto,
    cargarInicial: function (cfg) {
      return remoto(cfg).catch(function (error) {
        console.warn('CFCX: no se pudo consultar Panel TV Digital; usando último catálogo oficial si existe.', error.message);
        return recuperarCache(cfg);
      });
    },
    // Expuesto para pruebas y verificación de reglas de numeración.
    normalizar: listaCanonica
  };
})();
