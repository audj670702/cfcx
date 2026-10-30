/* ==========================================================
   App CFCX · Monitor TV
   - Modelo visual CPC v0.5.35: marco oscuro, identificación sobre imagen,
     barra compacta y selector desplegable de canales.
   - CH01 y CH02: señales HLS independientes.
   - CH03+: listas de YouTube; CH00 opcional y propio de la EO.
   Inicia silenciado (requisito de los navegadores para
   reproducir automáticamente); el usuario activa el sonido.
   ========================================================== */
(function () {
  var ICON = {
    up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>',
    muted: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
    channels: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="m8 2 4 4 4-4"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /**
   * @param {HTMLElement} root  contenedor donde se dibuja el monitor
   * @param {object} opts
   *   canales: catálogo público TV Digital normalizado
   *   Cada canal VPS lleva su URL HLS propia (rutaHls en Panel TV).
   *   inicial: número de canal inicial ("01")
   *   mostrarCanales: muestra la fila de canales y el enlace al Espacio
   */
  function Monitor(root, opts) {
    this.root = root;
    this.canales = opts.canales || [];
    this.mostrarCanales = opts.mostrarCanales !== false;
    this.muted = true;
    this.hls = null;
    this.media = null;
    this.fullscreenFallback = false;
    var idx = 0;
    for (var i = 0; i < this.canales.length; i++) {
      if (this.canales[i].numero === opts.inicial) idx = i;
    }
    this.idx = idx;
    this.render();
    if (this.canales.length) this.sintonizar(this.idx, false);
    else this.mensaje('Sin canales activos', 'El catálogo no tiene canales disponibles.');
  }

  Monitor.prototype.render = function () {
    var self = this;
    var menu = this.mostrarCanales
      ? '<div class="tv-options" data-role="options" role="dialog" aria-label="Elegir canal" hidden>' +
          '<div class="tv-options-head"><strong>Canales</strong>' +
            '<button type="button" class="tv-options-close" data-act="close-menu" aria-label="Cerrar menú">' + ICON.close + '</button></div>' +
          '<div class="tv-options-list" data-role="channel-list"></div>' +
        '</div>'
      : '';
    var selector = this.mostrarCanales
      ? '<button type="button" class="tv-btn tv-channel-trigger" data-act="channels" aria-haspopup="dialog" aria-expanded="false" aria-label="Elegir canal">' +
          ICON.channels + '<span>Canales</span>' + ICON.down + '</button>'
      : '<span class="tv-channel-label">Monitor TV</span>';

    this.root.innerHTML =
      '<div class="tv" data-role="console">' +
        '<div class="tv-screen" data-role="screen">' +
          '<div class="tv-media" data-role="media"></div>' +
          '<div class="tv-caption" aria-live="polite">' +
            '<div class="tv-channel-heading"><strong data-role="osd">CH --</strong>' +
              '<span class="tv-channel-name" data-role="now"></span></div>' +
            '<span class="tv-live" data-role="live" hidden>EN VIVO</span>' +
          '</div>' +
          '<div class="tv-status" data-role="status" hidden><span data-role="status-text"></span>' +
            '<span class="tv-status-line" aria-hidden="true"></span></div>' +
          '<div class="tv-static" data-role="static" aria-hidden="true"></div>' +
          '<button type="button" class="tv-fs-close" data-act="exit-full" aria-label="Salir de pantalla completa" hidden>' +
            ICON.close + '</button>' +
        '</div>' +
        '<button type="button" class="tv-resume" data-act="resume" hidden>▶ Reproducir señal</button>' +
        '<div class="tv-controls">' +
          '<button type="button" class="tv-btn" data-act="sound" aria-label="Activar sonido">' + ICON.muted + '</button>' +
          selector +
          '<button type="button" class="tv-btn" data-act="full" aria-label="Pantalla completa">' + ICON.full + '</button>' +
        '</div>' + menu +
      '</div>' +
      (this.mostrarCanales ? '<div data-role="espacio"></div>' : '');

    this.el = {
      console: this.root.querySelector('[data-role="console"]'),
      screen: this.root.querySelector('[data-role="screen"]'),
      media: this.root.querySelector('[data-role="media"]'),
      live: this.root.querySelector('[data-role="live"]'),
      osd: this.root.querySelector('[data-role="osd"]'),
      stat: this.root.querySelector('[data-role="static"]'),
      now: this.root.querySelector('[data-role="now"]'),
      sound: this.root.querySelector('[data-act="sound"]'),
      menu: this.root.querySelector('[data-role="options"]'),
      menuTrigger: this.root.querySelector('[data-act="channels"]'),
      channelList: this.root.querySelector('[data-role="channel-list"]'),
      status: this.root.querySelector('[data-role="status"]'),
      statusText: this.root.querySelector('[data-role="status-text"]'),
      resume: this.root.querySelector('[data-act="resume"]'),
      fullClose: this.root.querySelector('[data-act="exit-full"]'),
      espacio: this.root.querySelector('[data-role="espacio"]')
    };

    this.onClick = function (event) {
      var button = event.target.closest('button');
      if (!button || !self.root.contains(button)) return;
      var action = button.getAttribute('data-act');
      if (action === 'sound') self.alternarSonido();
      else if (action === 'channels') self.alternarMenu();
      else if (action === 'close-menu') self.cerrarMenu();
      else if (action === 'full') self.pantallaCompleta();
      else if (action === 'exit-full') self.cerrarPantallaCompleta();
      else if (action === 'resume') self.reanudar();
      else if (button.hasAttribute('data-ch')) {
        var index = Number(button.getAttribute('data-ch'));
        self.cerrarMenu();
        if (Number.isInteger(index) && index >= 0 && index < self.canales.length) {
          self.sintonizar(index, true);
        }
      }
    };
    this.root.addEventListener('click', this.onClick);
    this.onDocumentPointer = function (event) {
      if (self.el.menu && !self.el.menu.hidden && !self.el.console.contains(event.target)) self.cerrarMenu();
    };
    this.onDocumentKey = function (event) {
      if (event.key !== 'Escape') return;
      if (self.fullscreenFallback) self.cerrarPantallaCompleta();
      else self.cerrarMenu();
    };
    document.addEventListener('pointerdown', this.onDocumentPointer);
    document.addEventListener('keydown', this.onDocumentKey);
    this.pintarMenu();
  };

  Monitor.prototype.pintarMenu = function () {
    if (!this.el.channelList) return;
    var self = this;
    this.el.channelList.innerHTML = this.canales.map(function (c, i) {
      return '<button type="button" class="tv-channel-option' + (i === self.idx ? ' is-active' : '') +
        '" data-ch="' + i + '" aria-pressed="' + (i === self.idx) + '">' +
        '<span class="tv-option-code">CH ' + esc(c.numero) + '</span>' +
        '<span class="tv-option-name">' + esc(c.nombre) + '</span>' +
        '<span class="tv-option-check" aria-hidden="true">' + (i === self.idx ? '✓' : '') + '</span>' +
        '</button>';
    }).join('') || '<p class="tv-options-empty">Sin canales disponibles</p>';
  };

  Monitor.prototype.alternarMenu = function () {
    if (!this.el.menu) return;
    var abrir = this.el.menu.hidden;
    this.el.menu.hidden = !abrir;
    if (this.el.menuTrigger) this.el.menuTrigger.setAttribute('aria-expanded', String(abrir));
    if (abrir) this.pintarMenu();
  };

  Monitor.prototype.cerrarMenu = function () {
    if (this.el.menu) this.el.menu.hidden = true;
    if (this.el.menuTrigger) this.el.menuTrigger.setAttribute('aria-expanded', 'false');
  };

  Monitor.prototype.estado = function (state, text) {
    if (!this.el.status) return;
    this.el.status.hidden = !text;
    this.el.status.dataset.state = state || 'idle';
    this.el.statusText.textContent = text || '';
  };

  Monitor.prototype.reanudar = function () {
    if (this.el.resume) this.el.resume.hidden = true;
    var v = this.media;
    if (v && v.tagName === 'VIDEO') {
      var result = v.play();
      if (result && result.catch) {
        var self = this;
        result.catch(function () {
          self.estado('action', 'Pulsa Reproducir para iniciar');
          if (self.el.resume) self.el.resume.hidden = false;
        });
      }
      return;
    }
    this.sintonizar(this.idx, false);
  };

  Monitor.prototype.activarPantallaCompletaInterna = function () {
    this.fullscreenFallback = true;
    document.body.classList.add('cfcx-tv-fs');
    if (this.el.fullClose) this.el.fullClose.hidden = false;
  };

  Monitor.prototype.cerrarPantallaCompleta = function () {
    if (this.fullscreenFallback) {
      this.fullscreenFallback = false;
      document.body.classList.remove('cfcx-tv-fs');
      if (this.el.fullClose) this.el.fullClose.hidden = true;
    } else if (document.fullscreenElement === this.el.screen && document.exitFullscreen) {
      document.exitFullscreen();
    }
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
    this.estado('error', titulo);
    this.el.media.innerHTML = '<div class="tv-msg"><strong>' + esc(titulo) + '</strong><span>' + esc(detalle) + '</span></div>';
  };

  Monitor.prototype.sintonizar = function (i, conEfecto) {
    var c = this.canales[i];
    if (!c) return;
    this.idx = i;
    this.cerrarMenu();
    this.limpiarMedia();
    this.estado('', '');
    if (this.el.resume) this.el.resume.hidden = true;

    if (conEfecto) {
      var st = this.el.stat;
      st.classList.remove('on');
      void st.offsetWidth;
      st.classList.add('on');
    }
    this.el.osd.textContent = 'CH ' + c.numero;
    this.el.live.hidden = c.tipo !== 'hls';
    this.el.now.textContent = c.nombre;
    this.pintarMenu();

    if (c.tipo === 'hls') this.montarHls(c);
    else if (c.tipo === 'youtube') this.montarYoutube(c);
    else this.mensaje('Canal en preparación', 'Muy pronto en CFCX');

    if (this.el.espacio) {
      this.el.espacio.innerHTML = c.espacio
        ? '<a class="link-arrow" href="#/espacio/' + esc(c.espacio) + '">Ir al Espacio ' + esc(c.nombre) + ' →</a>'
        : '';
    }
  };

  Monitor.prototype.montarHls = function (canal) {
    var self = this;
    var url = canal.url;
    this._reintento = false;
    if (!url) { this.mensaje('Señal no configurada', 'Falta la URL HLS del canal en Panel TV.'); return; }
    this.estado('loading', 'Cargando señal…');

    var v = document.createElement('video');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.autoplay = true;
    v.muted = this.muted;
    v.controls = false;
    this.el.media.appendChild(v);
    this.media = v;
    v.addEventListener('playing', function () {
      if (self.media === v) self.estado('', '');
    });
    v.addEventListener('waiting', function () {
      if (self.media === v) self.estado('reconnecting', 'Recuperando señal…');
    });
    var reproducir = function () {
      var p = v.play();
      if (p && p.catch) p.catch(function (err) {
        if (self.media !== v || !err || err.name === 'AbortError') return;
        self.estado('action', 'Pulsa Reproducir para iniciar');
        if (self.el.resume) self.el.resume.hidden = false;
      });
    };
    var fallo = function () {
      if (self.media !== v) return;
      self.limpiarMedia();
      self.estado('error', 'Señal no disponible');
      self.mensaje('Señal no disponible por el momento', 'Intenta de nuevo en unos minutos');
      if (self.el.resume) { self.el.resume.textContent = '↻ Reintentar señal'; self.el.resume.hidden = false; }
    };

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ lowLatencyMode: false, backBufferLength: 30 });
      this.hls = hls;
      hls.loadSource(url);
      hls.attachMedia(v);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () { if (self.hls === hls) reproducir(); });
      hls.on(window.Hls.Events.ERROR, function (_e, data) {
        if (!data || !data.fatal || self.hls !== hls) return;
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
      reproducir();
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
    this.estado('loading', 'Cargando contenido…');
    var f = document.createElement('iframe');
    f.src = src;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    var self = this;
    f.addEventListener('load', function () { if (self.media === f) self.estado('', ''); });
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
    var screen = this.el.screen;
    if (this.fullscreenFallback) { this.cerrarPantallaCompleta(); return; }
    if (document.fullscreenElement === screen && document.exitFullscreen) {
      document.exitFullscreen();
      return;
    }
    var self = this;
    if (screen.requestFullscreen) {
      try {
        var result = screen.requestFullscreen();
        if (result && result.catch) result.catch(function () { self.activarPantallaCompletaInterna(); });
      } catch (_) { this.activarPantallaCompletaInterna(); }
    } else if (screen.webkitRequestFullscreen) {
      try { screen.webkitRequestFullscreen(); } catch (_) { this.activarPantallaCompletaInterna(); }
    } else {
      // iPhone: alternativa dentro de la app, como CPC.
      this.activarPantallaCompletaInterna();
    }
  };

  Monitor.prototype.actualizarCanales = function (canales) {
    var codigoActual = this.canales[this.idx] && this.canales[this.idx].codigo;
    this.limpiarMedia();
    this.cerrarPantallaCompleta();
    this.root.removeEventListener('click', this.onClick);
    document.removeEventListener('pointerdown', this.onDocumentPointer);
    document.removeEventListener('keydown', this.onDocumentKey);
    this.canales = Array.isArray(canales) ? canales : [];
    var indice = this.canales.findIndex(function (c) { return c.codigo === codigoActual; });
    this.idx = indice >= 0 ? indice : 0;
    this.render();
    if (this.canales.length) this.sintonizar(this.idx, false);
    else this.mensaje('Sin canales activos', 'El catálogo no tiene canales disponibles.');
  };

  Monitor.prototype.destroy = function () {
    this.cerrarPantallaCompleta();
    this.limpiarMedia();
    this.root.removeEventListener('click', this.onClick);
    document.removeEventListener('pointerdown', this.onDocumentPointer);
    document.removeEventListener('keydown', this.onDocumentKey);
  };

  window.CFCXMonitor = Monitor;
})();
