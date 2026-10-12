/* ==========================================================
   App CFCX · almacenamiento local
   Sesión SIMULADA para el prototipo. En fase 2 se sustituye
   por el inicio de sesión real de Wix (Members).
   ========================================================== */
(function () {
  var PREFIX = 'cfcx.';

  function get(key, fallback) {
    try {
      var v = localStorage.getItem(PREFIX + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) {}
  }
  function remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch (e) {}
  }

  function randomId(len) {
    var chars = '0123456789';
    var out = '';
    for (var i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
  function randomCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var out = '';
    for (var i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  window.CFCX_STORE = {
    // ----- Tema: 'auto' | 'light' | 'dark'
    getTheme: function () {
      try {
        var t = localStorage.getItem(PREFIX + 'theme');
        return t === 'light' || t === 'dark' ? t : 'auto';
      } catch (e) { return 'auto'; }
    },
    setTheme: function (t) {
      try {
        if (t === 'light' || t === 'dark') localStorage.setItem(PREFIX + 'theme', t);
        else localStorage.removeItem(PREFIX + 'theme');
      } catch (e) {}
    },

    // ----- Sesión simulada
    getSession: function () { return get('session', null); },
    login: function (nombre) {
      var s = {
        nombre: nombre,
        miembro: 'CFCX-' + randomId(6),
        desde: new Date().toISOString().slice(0, 10)
      };
      set('session', s);
      return s;
    },
    logout: function () {
      remove('session');
      remove('cupones');
    },

    // ----- Cupones obtenidos (ligados a la tarjeta)
    getCupones: function () { return get('cupones', []); },
    obtenerCupon: function (cupon, sesion) {
      var lista = get('cupones', []);
      var ya = lista.filter(function (c) { return c.id === cupon.id; })[0];
      if (ya) return ya;
      var nuevo = {
        id: cupon.id,
        aliado: cupon.aliado,
        descuento: cupon.descuento,
        hasta: cupon.hasta,
        codigo: sesion.miembro + '-' + randomCode(),
        titular: sesion.nombre
      };
      lista.push(nuevo);
      set('cupones', lista);
      return nuevo;
    },

    // ----- Puntos de Arcade (reservado para fase de RIAs)
    getPuntos: function () { return get('puntos', 0); }
  };
})();
