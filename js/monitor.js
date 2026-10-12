/* ==========================================================
   App CFCX · Monitor TV
   - Canal 01: señal HLS 24/7 (hls.js, o nativo en Safari/iOS)
   - Canales virtuales: listas de YouTube (iframe)
   Inicia silenciado (requisito de los navegadores para
   reproducir automáticamente); el usuario activa el sonido.
   ========================================================== */
(function () {
  var ICON = {
    up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    muted: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /**
   * @param {HTMLElement} root  contenedor donde se dibuja el monitor
   * @param {object} opts
   *   canales: lista de canales (data/canales.json)
   *   senal24: { nombre, url } de config
   *   inicial: número de canal inicial ("01")
   *   mostrarCanales: muestra la fila de canales y el enlace al Espacio
   */
  function Monitor(root, opts) {
    this.root = root;
    this.canales = opts.canales || [];
    this.senal24 = opts.senal24 || {};
    this.mostrarCanales = opts.mostrarCanales !== false;
    this.muted = true;
    this.hls = null;
    this.media = null;
    var idx = 0;
    for (var i = 0; i < this.canales.length; i++) {
      if (this.canales[i].numero === opts.inicial) idx = i;
    }
    this.idx = idx;
    this.render();
    this.sintonizar(this.idx, false);
  }

  Monitor.prototype.render = function () {
    var self = this;
    var chips = '';
    if (this.mostrarCanales) {
      chips = '<div class="chips" role="group" aria-label="Canales">' +
        this.canales.map(function (c, i) {
          return '<button type="button" class="chip" data-ch="' + i + '" aria-pressed="false">' +
            '<span class="mono">' + esc(c.numero) + '</span>' + esc(c.nombre) + '</button>';
        }).join('') +
        '</div><div data-role="espacio"></div>';
    }

    this.root.innerHTML =
      '<div class="tv">' +
        '<div class="tv-screen" data-role="screen">' +
          '<div data-role="media"></div>' +
          '<span class="tv-live" data-role="live" hidden>EN VIVO</span>' +
          '<span class="tv-osd" data-role="osd"></span>' +
          '<div class="tv-static" data-role="static"></div>' +
        '</div>' +
        '<div class="tv-controls">' +
          '<button type="button" class="tv-btn" data-act="prev" aria-label="Canal anterior">' + ICON.up + '</button>' +
          '<button type="button" class="tv-btn" data-act="next" aria-label="Canal siguiente">' + ICON.down + '</button>' +
          '<span class="tv-now" data-role="now"></span>' +
          '<button type="button" class="tv-btn" data-act="sound" aria-label="Activar sonido">' + ICON.muted + '</button>' +
          '<button type="button" class="tv-btn" data-act="full" aria-label="Pantalla completa">' + ICON.full + '</button>' +
        '</div>' +
      '</div>' + chips;

    this.el = {
      screen: this.root.querySelector('[data-role="screen"]'),
      media: this.root.querySelector('[data-role="media"]'),
      live: this.root.querySelector('[data-role="live"]'),
      osd: this.root.querySelector('[data-role="osd"]'),
      stat: this.root.querySelector('[data-role="static"]'),
      now: this.root.querySelector('[data-role="now"]'),
      sound: this.root.querySelector('[data-act="sound"]'),
      espacio: this.root.querySelector('[data-role="espacio"]')
    };

    this.onClick = function (e) {
      var b = e.target.closest('button');
      if (!b || !self.root.contains(b)) return;
      var act = b.getAttribute('data-act');
      if (act === 'prev') self.sintonizar((self.idx - 1 + self.canales.length) % self.canales.length, true);
      else if (act === 'next') self.sintonizar((self.idx + 1) % self.canales.length, true);
      else if (act === 'sound') self.alternarSonido();
      else if (act === 'full') self.pantallaCompleta();
      else if (b.hasAttribute('data-ch')) self.sintonizar(parseInt(b.getAttribute('data-ch'), 10), true);
    };
    this.root.addEventListener('click', this.onClick);
  };

  Monitor.prototype.limpiarMedia = function () {
    if (this.hls) { try { this.hls.destroy(); } catch (e) {} this.hls = null; }
    if (this.media && this.media.tagName === 'VIDEO') {
      try { this.media.pause(); this.media.removeAttribute('src'); this.media.load(); } catch (e) {}
    }
    this.media = null;
    this.el.media.innerHTML = '';
  };

  Monitor.prototype.mensaje = function (titulo, detalle) {
    this.el.media.innerHTML = '<div class="tv-msg"><strong>' + esc(titulo) + '</strong><span>' + esc(detalle) + '</span></div>';
  };

  Monitor.prototype.sintonizar = function (i, conEfecto) {
    var c = this.canales[i];
    if (!c) return;
    this.idx = i;
    this.limpiarMedia();

    if (conEfecto) {
      var st = this.el.stat;
      st.classList.remove('on');
      void st.offsetWidth; // reinicia la animación
      st.classList.add('on');
    }

    this.el.osd.textContent = 'CH ' + c.numero;
    this.el.live.hidden = c.tipo !== 'hls';
    var nombre = c.tipo === 'hls' ? (this.senal24.nombre || 'Señal 24/7') : 'Canal ' + c.nombre;
    this.el.now.innerHTML = '<b>' + esc(nombre) + '</b>';

    if (c.tipo === 'hls') this.montarHls();
    else if (c.tipo === 'youtube') this.montarYoutube(c);
    else this.mensaje('Canal en preparación', 'Muy pronto en CFCX');

    // Estado de los chips y enlace al Espacio
    var chips = this.root.querySelectorAll('.chip');
    for (var k = 0; k < chips.length; k++) chips[k].setAttribute('aria-pressed', String(k === i));
    if (chips[i] && chips[i].scrollIntoView) {
      try { chips[i].scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
    }
    if (this.el.espacio) {
      this.el.espacio.innerHTML = c.espacio
        ? '<a class="link-arrow" href="#/espacio/' + esc(c.espacio) + '">Ir al Espacio ' + esc(c.nombre) + ' →</a>'
        : '';
    }
  };

  Monitor.prototype.montarHls = function () {
    var self = this;
    var url = this.senal24.url;
    this._reintento = false;
    if (!url) { this.mensaje('Señal no configurada', 'Define la URL en js/config.js'); return; }

    var v = document.createElement('video');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.autoplay = true;
    v.muted = this.muted;
    v.controls = false;
    this.el.media.appendChild(v);
    this.media = v;

    var fallo = function () {
      self.limpiarMedia();
      self.mensaje('Señal no disponible por el momento', 'Intenta de nuevo en unos minutos');
    };

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ lowLatencyMode: false, backBufferLength: 30 });
      this.hls = hls;
      hls.loadSource(url);
      hls.attachMedia(v);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (_e, data) {
        if (!data || !data.fatal) return;
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          // reintento único de red antes de mostrar el aviso
          if (!self._reintento) { self._reintento = true; hls.startLoad(); return; }
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        fallo();
      });
    } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = url;
      v.addEventListener('error', fallo, { once: true });
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      fallo();
    }
  };

  Monitor.prototype.montarYoutube = function (c) {
    if (!c.playlist) { this.mensaje('Canal ' + c.nombre, 'Lista de reproducción por definir'); return; }
    var src = 'https://www.youtube-nocookie.com/embed/videoseries' +
      '?list=' + encodeURIComponent(c.playlist) +
      '&autoplay=1&mute=' + (this.muted ? '1' : '0') +
      '&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&loop=1';
    var f = document.createElement('iframe');
    f.src = src;
    f.title = 'Canal ' + c.nombre;
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.setAttribute('allowfullscreen', '');
    this.el.media.appendChild(f);
    this.media = f;
  };

  Monitor.prototype.alternarSonido = function () {
    this.muted = !this.muted;
    var m = this.media;
    if (m && m.tagName === 'VIDEO') {
      m.muted = this.muted;
      if (!this.muted) { var p = m.play(); if (p && p.catch) p.catch(function () {}); }
    } else if (m && m.tagName === 'IFRAME') {
      try {
        m.contentWindow.postMessage(JSON.stringify({ event: 'command', func: this.muted ? 'mute' : 'unMute', args: [] }), '*');
        if (!this.muted) m.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
      } catch (e) {}
    }
    this.el.sound.innerHTML = this.muted ? ICON.muted : ICON.sound;
    this.el.sound.classList.toggle('on', !this.muted);
    this.el.sound.setAttribute('aria-label', this.muted ? 'Activar sonido' : 'Silenciar');
  };

  Monitor.prototype.pantallaCompleta = function () {
    var s = this.el.screen;
    var m = this.media;
    try {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (s.requestFullscreen) { s.requestFullscreen(); return; }
      if (s.webkitRequestFullscreen) { s.webkitRequestFullscreen(); return; }
      if (m && m.webkitEnterFullscreen) { m.webkitEnterFullscreen(); }
    } catch (e) {}
  };

  Monitor.prototype.destroy = function () {
    this.limpiarMedia();
    this.root.removeEventListener('click', this.onClick);
  };

  window.CFCXMonitor = Monitor;
})();
