/* ==========================================================
   App CFCX · aplicación (rutas y pantallas)
   Navegación por hash: #/inicio, #/espacios, #/espacio/<id>,
   #/revista, #/videoteca, #/buscar, #/arcade, #/cupones, #/mi
   ========================================================== */
(function () {
  var CFG = window.CFCX_CONFIG;
  var STORE = window.CFCX_STORE;
  var view = document.getElementById('view');
  var DATA = {};
  var limpieza = []; // funciones a ejecutar al salir de una pantalla

  // ---------------------------------------------------------- utilidades
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) {
    return String(s || '').toLocaleLowerCase('es-MX').normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function hoy() { return new Date().toISOString().slice(0, 10); }
  function vigente(item) {
    var d = hoy();
    return (!item.desde || item.desde <= d) && (!item.hasta || item.hasta >= d);
  }
  function espacioPorId(id) {
    return (DATA.espacios || []).filter(function (e) { return e.id === id; })[0];
  }
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  var I = {
    grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z"/><path d="M18 8h2v10a2 2 0 0 1-2 2M8 8h6M8 12h6M8 16h4"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>',
    game: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18" cy="13.5" r=".8"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/></svg>',
    people: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 20a4.5 4.5 0 0 1 7-3.7"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18 9 12l6-6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  // ---------------------------------------------------------- tema
  var mqLight = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  function temaEfectivo() {
    var t = STORE.getTheme();
    if (t !== 'auto') return t;
    return mqLight && mqLight.matches ? 'light' : 'dark';
  }
  function aplicarTema(t) {
    STORE.setTheme(t);
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    pintarBotonTema();
  }
  function pintarBotonTema() {
    var b = document.getElementById('themeToggle');
    var oscuro = temaEfectivo() === 'dark';
    b.innerHTML = oscuro ? I.moon : I.sun;
    b.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }
  document.getElementById('themeToggle').addEventListener('click', function () {
    aplicarTema(temaEfectivo() === 'dark' ? 'light' : 'dark');
    if (location.hash.indexOf('#/mi') === 0) router();
  });
  if (mqLight && mqLight.addEventListener) mqLight.addEventListener('change', pintarBotonTema);

  // ---------------------------------------------------------- sesión en barra superior
  function pintarSesion() {
    var a = document.getElementById('sessionLink');
    var s = STORE.getSession();
    if (s) {
      var ini = (s.nombre || '?').trim().charAt(0).toUpperCase();
      a.innerHTML = '<span class="avatar">' + esc(ini) + '</span>' + esc((s.nombre || '').split(' ')[0]);
      a.setAttribute('aria-label', 'Mi CFCX');
    } else {
      a.textContent = 'Entrar';
      a.removeAttribute('aria-label');
    }
  }

  // ---------------------------------------------------------- reproductor de videoteca
  var modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = '<div class="modal-inner"><div class="modal-head"><strong data-role="t"></strong>' +
    '<button type="button" class="icon-btn" data-role="x" aria-label="Cerrar">' + I.close + '</button></div>' +
    '<div class="frame" data-role="f"></div></div>';
  document.body.appendChild(modal);
  function abrirPlaylist(nombre, playlist) {
    modal.querySelector('[data-role="t"]').textContent = nombre;
    modal.querySelector('[data-role="f"]').innerHTML =
      '<iframe title="' + esc(nombre) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen src="https://www.youtube-nocookie.com/embed/videoseries?list=' +
      encodeURIComponent(playlist) + '&autoplay=1&playsinline=1&rel=0"></iframe>';
    modal.classList.add('open');
    modal.querySelector('[data-role="x"]').focus();
  }
  function cerrarModal() {
    modal.classList.remove('open');
    modal.querySelector('[data-role="f"]').innerHTML = '';
  }
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('[data-role="x"]')) cerrarModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) cerrarModal();
  });

  // ---------------------------------------------------------- piezas reutilizables
  function filaArticulo(a) {
    var e = espacioPorId(a.espacio);
    var bloqueado = a.exclusivo && !STORE.getSession();
    return '<a class="row" href="#/espacio/' + esc(a.espacio) + '" data-art="' + esc(a.id) + '">' +
      '<span class="thumb">' + (bloqueado ? I.lock : '[Foto]') + '</span>' +
      '<span class="meta"><span class="kicker">' + esc(a.tipo) + (e ? ' · ' + esc(e.nombre) : '') +
      (a.exclusivo ? ' · Exclusivo' : '') + '</span>' +
      '<span class="title" style="display:block">' + esc(a.titulo) + '</span></span></a>';
  }
  function filaPrograma(p) {
    var e = espacioPorId(p.espacio);
    return '<button type="button" class="row" data-play="' + esc(p.playlist) + '" data-name="' + esc(p.nombre) + '">' +
      '<span class="thumb">' + I.play + '</span>' +
      '<span class="meta"><span class="kicker">' + (e ? esc(e.nombre) : 'Programa') + '</span>' +
      '<span class="title" style="display:block">' + esc(p.nombre) + '</span></span>' +
      '<span class="chev">' + I.chev + '</span></button>';
  }
  function enlazarProgramas(root) {
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-play]');
      if (b) abrirPlaylist(b.getAttribute('data-name'), b.getAttribute('data-play'));
      var a = e.target.closest('[data-art]');
      if (a) {
        var art = (DATA.articulos || []).filter(function (x) { return x.id === a.getAttribute('data-art'); })[0];
        if (art && art.exclusivo && !STORE.getSession()) {
          e.preventDefault();
          toast('Contenido exclusivo: inicia sesión para verlo');
        }
      }
    });
  }

  // ---------------------------------------------------------- pantallas
  var V = {};

  V.inicio = function () {
    var flyers = (DATA.flyers || []).filter(vigente);
    view.innerHTML =
      '<section class="section"><div id="monitor"></div></section>' +
      '<section class="section"><h2 class="eyebrow">Accesos rápidos</h2><div class="quick">' +
        '<a href="#/espacios">' + I.grid + 'Espacios</a>' +
        '<a href="#/revista">' + I.book + 'Revista</a>' +
        '<a href="#/videoteca">' + I.play + 'Videoteca</a>' +
        '<a href="#/arcade">' + I.game + 'Arcade</a>' +
        '<a href="#/cupones">' + I.ticket + 'Cupones</a>' +
        '<a href="#/espacio/comunidad">' + I.people + 'Comunidad</a>' +
      '</div></section>' +
      (flyers.length ? '<section class="section flyers" aria-label="Avisos"><div class="flyer-track" id="flyerTrack">' +
        flyers.map(function (f, i) {
          var inner = '<span class="flyer-img">' + (f.imagen ? '<img src="' + esc(f.imagen) + '" alt="">' : '[Flyer]') + '</span>' +
            '<span><small>' + esc(f.etiqueta || 'Aviso') + ' · ' + (i + 1) + ' / ' + flyers.length + '</small><strong>' + esc(f.titulo) + '</strong></span>';
          return f.enlace ? '<a class="flyer" href="' + esc(f.enlace) + '">' + inner + '</a>' : '<div class="flyer">' + inner + '</div>';
        }).join('') +
        '</div><div class="dots" aria-hidden="true">' + flyers.map(function (_, i) { return '<span' + (i === 0 ? ' class="on"' : '') + '></span>'; }).join('') + '</div></section>' : '');

    var mon = new window.CFCXMonitor(document.getElementById('monitor'), {
      canales: DATA.canales, senal24: CFG.senal24, inicial: '01', mostrarCanales: true
    });
    limpieza.push(function () { mon.destroy(); });

    // Franja de flyers: avance automático; se pausa al tocarla
    var track = document.getElementById('flyerTrack');
    if (track && flyers.length > 1) {
      var dots = view.querySelectorAll('.dots span');
      var actual = 0, pausa = false;
      var marcar = function () {
        var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        actual = i;
        for (var k = 0; k < dots.length; k++) dots[k].classList.toggle('on', k === i);
      };
      track.addEventListener('scroll', function () { window.requestAnimationFrame(marcar); }, { passive: true });
      var pausar = function () { pausa = true; clearTimeout(track._t); track._t = setTimeout(function () { pausa = false; }, 8000); };
      track.addEventListener('pointerdown', pausar);
      track.addEventListener('touchstart', pausar, { passive: true });
      var timer = setInterval(function () {
        if (pausa || document.hidden) return;
        var sig = (actual + 1) % flyers.length;
        track.scrollTo({ left: sig * (track.clientWidth + 10), behavior: 'smooth' });
      }, (CFG.flyerIntervalo || 5) * 1000);
      limpieza.push(function () { clearInterval(timer); clearTimeout(track._t); });
    }
  };

  V.espacios = function () {
    view.innerHTML = '<section class="section"><a class="back" href="#/inicio">' + I.back + 'Inicio</a>' +
      '<h1 class="h1">Espacios</h1><p class="lead">Cada Espacio tiene su canal, su revista y su comunidad.</p></section>' +
      '<section class="section"><div class="space-grid">' +
      (DATA.espacios || []).map(function (e) {
        return '<a class="space-card" href="#/espacio/' + esc(e.id) + '"><span class="mono">CH ' + esc(e.canal) + '</span><strong>' + esc(e.nombre) + '</strong><span>' + esc(e.descripcion) + '</span></a>';
      }).join('') + '</div></section>';
  };

  V.espacio = function (id, tab) {
    var e = espacioPorId(id);
    if (!e) { location.hash = '#/espacios'; return; }
    tab = tab || 'revista';
    var arts = (DATA.articulos || []).filter(function (a) { return a.espacio === id; });
    var progs = (DATA.programas || []).filter(function (p) { return p.espacio === id; });

    var cuerpo = '';
    if (tab === 'revista') {
      cuerpo = arts.length ? '<div class="list">' + arts.map(filaArticulo).join('') + '</div>' : '<p class="muted">Pronto habrá contenido en este Espacio.</p>';
    } else if (tab === 'talentos') {
      cuerpo = '<div class="talents">' + (e.talentos || []).map(function (t) {
        return '<div class="talent"><div class="face"></div>' + esc(t) + '</div>';
      }).join('') + '</div>';
    } else {
      cuerpo = progs.length ? '<div class="list">' + progs.map(filaPrograma).join('') + '</div>' : '<p class="muted">Sin programas asignados todavía.</p>';
    }

    var tabs = [['revista', 'Revista'], ['talentos', id === 'comunidad' ? 'Asociaciones' : 'Talentos'], ['videoteca', 'Videoteca']];

    view.innerHTML =
      '<section class="section"><a class="back" href="#/espacios">' + I.back + 'Espacios</a>' +
      '<p class="mono muted" style="margin:0 0 4px">ESPACIO · CH ' + esc(e.canal) + '</p>' +
      '<h1 class="h1">' + esc(e.nombre) + '</h1><p class="lead">' + esc(e.descripcion) + '</p></section>' +
      '<section class="section"><div id="monitor"></div></section>' +
      '<section class="section"><div class="tabs" role="tablist">' +
        tabs.map(function (t) {
          return '<button type="button" role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
        }).join('') +
      '</div><div id="tabBody">' + cuerpo + '</div></section>' +
      '<section class="section"><div class="box"><strong>¿Tienes algo que compartir?</strong>' +
        '<p>Envía tu información y el equipo de CFCX la revisa y la publica.</p>' +
        '<button type="button" class="btn ghost block" style="margin-top:12px" id="comparte">Comparte con CFCX</button></div></section>';

    var mon = new window.CFCXMonitor(document.getElementById('monitor'), {
      canales: DATA.canales, senal24: CFG.senal24, inicial: e.canal, mostrarCanales: false
    });
    limpieza.push(function () { mon.destroy(); });

    view.querySelector('.tabs').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-tab]');
      if (b) history.replaceState(null, '', '#/espacio/' + id + '/' + b.getAttribute('data-tab'));
      if (b) router();
    });
    document.getElementById('comparte').addEventListener('click', function () {
      toast('El formulario para enviar contenido llega en la siguiente fase');
    });
    enlazarProgramas(view);
  };

  V.revista = function () {
    view.innerHTML = '<section class="section"><a class="back" href="#/inicio">' + I.back + 'Inicio</a>' +
      '<h1 class="h1">Revista</h1><p class="lead">Entrevistas, talentos, invitados y comunidad.</p></section>' +
      '<section class="section"><div class="list">' + (DATA.articulos || []).map(filaArticulo).join('') + '</div></section>';
    enlazarProgramas(view);
  };

  V.videoteca = function () {
    var progs = DATA.programas || [];
    view.innerHTML = '<section class="section"><a class="back" href="#/inicio">' + I.back + 'Inicio</a>' +
      '<h1 class="h1">Videoteca</h1><p class="lead">Programas del acervo de Canal Foro CX.</p></section>' +
      '<section class="section"><div class="search-wrap">' + I.search +
      '<input class="search" id="vq" type="search" placeholder="Buscar programa" aria-label="Buscar programa"></div></section>' +
      '<section class="section"><div class="list" id="vlist">' + progs.map(filaPrograma).join('') + '</div></section>';
    var q = document.getElementById('vq');
    q.addEventListener('input', function () {
      var t = norm(q.value);
      document.getElementById('vlist').innerHTML = progs.filter(function (p) { return norm(p.nombre).indexOf(t) > -1; }).map(filaPrograma).join('') ||
        '<p class="muted">Sin resultados.</p>';
    });
    enlazarProgramas(view);
  };

  V.buscar = function () {
    view.innerHTML = '<section class="section"><h1 class="h1">Buscar</h1></section>' +
      '<section class="section"><div class="search-wrap">' + I.search +
      '<input class="search" id="q" type="search" placeholder="Programas, espacios, revista…" aria-label="Buscar en CFCX"></div></section>' +
      '<section class="section" id="res"><p class="muted">Escribe para buscar en el acervo y la revista.</p></section>';
    var q = document.getElementById('q');
    var res = document.getElementById('res');
    q.addEventListener('input', function () {
      var t = norm(q.value).trim();
      if (!t) { res.innerHTML = '<p class="muted">Escribe para buscar en el acervo y la revista.</p>'; return; }
      var esp = (DATA.espacios || []).filter(function (e) { return norm(e.nombre + ' ' + e.descripcion).indexOf(t) > -1; });
      var pro = (DATA.programas || []).filter(function (p) { return norm(p.nombre).indexOf(t) > -1; });
      var art = (DATA.articulos || []).filter(function (a) { return norm(a.titulo + ' ' + a.tipo).indexOf(t) > -1; });
      var html = '';
      if (esp.length) html += '<h2 class="eyebrow">Espacios</h2><div class="list" style="margin-bottom:18px">' + esp.map(function (e) {
        return '<a class="row" href="#/espacio/' + esc(e.id) + '"><span class="meta"><span class="kicker">CH ' + esc(e.canal) + '</span><span class="title" style="display:block">' + esc(e.nombre) + '</span></span><span class="chev">' + I.chev + '</span></a>';
      }).join('') + '</div>';
      if (pro.length) html += '<h2 class="eyebrow">Programas</h2><div class="list" style="margin-bottom:18px">' + pro.map(filaPrograma).join('') + '</div>';
      if (art.length) html += '<h2 class="eyebrow">Revista</h2><div class="list">' + art.map(filaArticulo).join('') + '</div>';
      res.innerHTML = html || '<p class="muted">Sin resultados.</p>';
    });
    enlazarProgramas(view);
    q.focus();
  };

  V.arcade = function () {
    var juegos = [
      { id: 'laberinto', tag: 'L', nombre: 'Laberinto', desc: 'Responde para abrir caminos hasta la salida.' },
      { id: 'serpientes', tag: 'S', nombre: 'Serpientes y escaleras', desc: 'Aciertas, subes; fallas, bajas.' },
      { id: 'colores', tag: 'C', nombre: 'Colores', desc: 'Asociación rápida, partidas cortas.' }
    ];
    var sel = { j: 0, e: 0 };
    var esps = DATA.espacios || [];
    var sesion = STORE.getSession();

    function pintar() {
      view.innerHTML = '<section class="section"><p class="mono muted" style="margin:0 0 4px">ARCADE CFCX</p>' +
        '<h1 class="h1">¿Cuánto sabes del canal?</h1>' +
        '<p class="lead">Trivia de programas, entrevistas y talentos. Juega libre; con sesión guardas puntos y ganas cupones.</p></section>' +
        '<section class="section"><h2 class="eyebrow">1 · Elige tu juego</h2><div class="list">' +
          juegos.map(function (g, i) {
            return '<button type="button" class="game" data-j="' + i + '" aria-pressed="' + (i === sel.j) + '"><span class="tag">' + g.tag + '</span><span><strong>' + esc(g.nombre) + '</strong><span>' + esc(g.desc) + '</span></span></button>';
          }).join('') +
        '</div></section>' +
        '<section class="section"><h2 class="eyebrow">2 · Elige el Espacio</h2><div class="pick-row">' +
          esps.map(function (e, i) {
            return '<button type="button" class="chip" style="min-height:44px;font-size:14px" data-e="' + i + '" aria-pressed="' + (i === sel.e) + '">' + esc(e.nombre) + '</button>';
          }).join('') +
        '</div></section>' +
        '<section class="section"><button type="button" class="btn block" id="jugar">Jugar ' + esc(juegos[sel.j].nombre) + ' · ' + esc(esps[sel.e] ? esps[sel.e].nombre : '') + '</button>' +
        (sesion ? '<p class="note">Tus puntos se sumarán a tu tarjeta CFCX.</p>' : '<a class="link-arrow" href="#/mi">Inicia sesión para guardar puntos y ganar cupones</a>') +
        '</section>';
    }
    pintar();
    view.addEventListener('click', function onArc(ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-j')) { sel.j = +b.getAttribute('data-j'); pintar(); }
      else if (b.hasAttribute('data-e')) { sel.e = +b.getAttribute('data-e'); pintar(); }
      else if (b.id === 'jugar') toast('Los juegos (RIAs) se integran en la siguiente fase');
    });
  };

  V.cupones = function () {
    var sesion = STORE.getSession();
    var obtenidos = STORE.getCupones();
    var lista = (DATA.cupones || []).filter(vigente);
    view.innerHTML = '<section class="section"><a class="back" href="#/inicio">' + I.back + 'Inicio</a>' +
      '<h1 class="h1">Cupones</h1><p class="lead">Descuentos de aliados de Canal Foro CX. Se generan a tu nombre con tu tarjeta CFCX.</p></section>' +
      '<section class="section"><div class="list">' +
      lista.map(function (c) {
        var mio = obtenidos.filter(function (o) { return o.id === c.id; })[0];
        var accion = !sesion
          ? '<a class="btn ghost" href="#/mi">Inicia sesión para obtenerlo</a>'
          : mio ? '<span class="code">' + esc(mio.codigo) + '</span><a class="link-arrow" href="#/mi" style="min-height:32px">Ver en Mi CFCX →</a>'
                : '<button type="button" class="btn" data-get="' + esc(c.id) + '">Obtener cupón</button>';
        return '<div class="coupon"><div class="value"><b>' + esc(c.descuento) + '</b><small>DESCUENTO</small></div>' +
          '<div class="body"><strong>' + esc(c.aliado) + '</strong><span class="muted" style="font-size:13px">' + esc(c.detalle) + '</span>' +
          '<span class="muted" style="font-size:12px">Vence ' + esc(c.hasta) + '</span>' + accion + '</div></div>';
      }).join('') + '</div></section>';

    view.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-get]');
      if (!b) return;
      var c = lista.filter(function (x) { return x.id === b.getAttribute('data-get'); })[0];
      var s = STORE.getSession();
      if (!c || !s) return;
      STORE.obtenerCupon(c, s);
      toast('Cupón generado a tu nombre');
      router();
    });
  };

  function patronQR(semilla) {
    // Patrón visual de ejemplo (no es un QR real; en fase 2 se genera el código verdadero).
    var h = 0;
    for (var i = 0; i < semilla.length; i++) h = (h * 31 + semilla.charCodeAt(i)) >>> 0;
    var celdas = '';
    for (var k = 0; k < 49; k++) {
      var r = Math.floor(k / 7), c = k % 7;
      var esquina = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
      h = (h * 1103515245 + 12345) >>> 0;
      var on = esquina || (h >>> 16) % 2 === 0;
      celdas += '<i' + (on ? '' : ' class="off"') + '></i>';
    }
    return celdas;
  }

  V.mi = function () {
    var s = STORE.getSession();
    var tema = STORE.getTheme();
    var temaHtml = '<section class="section"><h2 class="eyebrow">Apariencia</h2><div class="segmented" id="tema">' +
      [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']].map(function (t) {
        return '<button type="button" data-theme="' + t[0] + '" aria-pressed="' + (t[0] === tema) + '">' + t[1] + '</button>';
      }).join('') + '</div><p class="note">Automático sigue la configuración de tu celular.</p></section>';

    if (!s) {
      view.innerHTML = '<section class="section"><h1 class="h1">Mi CFCX</h1>' +
        '<p class="lead">Con tu sesión obtienes tu tarjeta de identidad CFCX, cupones a tu nombre, contenido exclusivo y puntos en Arcade.</p></section>' +
        '<section class="section"><form class="box" id="login"><div class="field"><label for="nombre">Tu nombre</label>' +
        '<input id="nombre" name="nombre" autocomplete="name" required placeholder="Nombre y apellido"></div>' +
        '<button class="btn block" type="submit">Entrar</button>' +
        '<p class="note">Prototipo: la sesión es simulada y se guarda solo en este dispositivo. En la versión final se usa el inicio de sesión de Wix.</p></form></section>' +
        temaHtml;
      document.getElementById('login').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var n = document.getElementById('nombre').value.trim();
        if (!n) return;
        STORE.login(n);
        pintarSesion();
        toast('Bienvenido a CFCX');
        router();
      });
    } else {
      var mis = STORE.getCupones();
      view.innerHTML =
        '<section class="section"><p class="muted" style="margin:0">Hola,</p><h1 class="h1">' + esc(s.nombre) + '</h1></section>' +
        '<section class="section"><div class="idcard" aria-label="Tarjeta de identidad CFCX">' +
          '<div class="top"><div><small>TARJETA DE IDENTIDAD</small><span class="brand">CANAL FORO CX</span></div>' +
          '<div class="qr" aria-hidden="true">' + patronQR(s.miembro) + '</div></div>' +
          '<div><div class="name">' + esc(s.nombre) + '</div><div class="foot"><span>' + esc(s.miembro) + '</span><span>Desde ' + esc(s.desde) + '</span></div></div>' +
        '</div></section>' +
        '<section class="section"><div class="stats">' +
          '<div class="stat"><b>' + STORE.getPuntos() + '</b><span>Puntos Arcade</span></div>' +
          '<div class="stat"><b>' + mis.length + '</b><span>Cupones</span></div>' +
          '<div class="stat"><b>0</b><span>Favoritos</span></div>' +
        '</div></section>' +
        '<section class="section"><h2 class="h2">Mis cupones</h2>' +
          (mis.length ? '<div class="list">' + mis.map(function (c) {
            return '<div class="coupon"><div class="value"><b>' + esc(c.descuento) + '</b><small>DESCUENTO</small></div>' +
              '<div class="body"><strong>' + esc(c.aliado) + '</strong><span class="code">' + esc(c.codigo) + '</span>' +
              '<span class="muted" style="font-size:12px">A nombre de ' + esc(c.titular) + ' · vence ' + esc(c.hasta) + '</span></div></div>';
          }).join('') + '</div>' : '<p class="muted">Aún no tienes cupones. <a class="link-arrow" href="#/cupones" style="min-height:0">Ver cupones →</a></p>') +
        '</section>' +
        temaHtml +
        '<section class="section"><button type="button" class="btn ghost block" id="salir">Cerrar sesión</button></section>';
      document.getElementById('salir').addEventListener('click', function () {
        STORE.logout();
        pintarSesion();
        toast('Sesión cerrada');
        router();
      });
    }
    document.getElementById('tema').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-theme]');
      if (!b) return;
      aplicarTema(b.getAttribute('data-theme'));
      router();
    });
  };

  // ---------------------------------------------------------- router
  var TABS = { buscar: 'buscar', arcade: 'arcade', mi: 'mi' };

  function router() {
    while (limpieza.length) { try { limpieza.pop()(); } catch (e) {} }
    var nuevo = view.cloneNode(false); // quita escuchas de la pantalla anterior
    view.parentNode.replaceChild(nuevo, view);
    view = nuevo;

    var partes = (location.hash || '#/inicio').replace(/^#\/?/, '').split('/');
    var ruta = partes[0] || 'inicio';
    if (!V[ruta]) ruta = 'inicio';

    if (ruta === 'espacio') V.espacio(partes[1], partes[2]);
    else V[ruta]();

    var activa = TABS[ruta] || 'inicio';
    var links = document.querySelectorAll('.tabbar a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-tab') === activa) links[i].setAttribute('aria-current', 'page');
      else links[i].removeAttribute('aria-current');
    }
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------- arranque
  function cargar(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url);
      return r.json();
    });
  }

  pintarBotonTema();
  pintarSesion();
  view.innerHTML = '<section class="section"><p class="muted">Cargando…</p></section>';

  Promise.all([
    cargar(CFG.datos.canales), cargar(CFG.datos.espacios), cargar(CFG.datos.flyers),
    cargar(CFG.datos.programas), cargar(CFG.datos.articulos), cargar(CFG.datos.cupones)
  ]).then(function (r) {
    DATA.canales = r[0].canales;
    DATA.espacios = r[1].espacios;
    DATA.flyers = r[2].flyers;
    DATA.programas = r[3].programas;
    DATA.articulos = r[4].articulos;
    DATA.cupones = r[5].cupones;
    window.addEventListener('hashchange', router);
    router();
  }).catch(function () {
    view.innerHTML = '<section class="section"><div class="box"><strong>No se pudo cargar el contenido.</strong><p>Revisa tu conexión e intenta de nuevo.</p></div></section>';
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./service-worker.js').catch(function () {});
    });
  }
})();
