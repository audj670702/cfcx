/* CFCX · instalación PWA y tutorial para iPhone. */
(function () {
  'use strict';
  var button = document.getElementById('installApp');
  var dialog = document.getElementById('installDialog');
  var video = document.getElementById('installTutorial');
  var title = document.getElementById('installTitle');
  var instructions = document.getElementById('installInstructions');
  var tutorialButton = document.getElementById('showInstallTutorial');
  var error = document.getElementById('installVideoError');
  var pending = null, installed = false;
  var display = window.matchMedia('(display-mode: standalone)');
  var appleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function refresh() {
    button.hidden = installed || display.matches || navigator.standalone === true;
  }
  function showTutorial() {
    title.textContent = 'Instalar CFCX en iPhone';
    instructions.innerHTML = '<ol><li>Abre <strong>cfcx.scad.mx</strong> en Safari.</li>' +
      '<li>Toca <strong>Compartir</strong>. Según la vista de Safari, está dentro del menú Más.</li>' +
      '<li>Elige <strong>Agregar a pantalla de inicio</strong>.</li>' +
      '<li>Si aparece <strong>Abrir como app web</strong>, actívalo y toca <strong>Agregar</strong>.</li></ol>';
    tutorialButton.hidden = true;
    video.hidden = false;
    error.hidden = true;
    if (!video.getAttribute('src')) {
      video.src = './assets/tutorial-instalar-app.mp4';
      video.load();
    }
    video.play().catch(function () { /* El botón de reproducción sigue disponible. */ });
  }
  function guide() {
    title.textContent = 'Instalar CFCX';
    instructions.innerHTML = '<p>Agrega CFCX a tu dispositivo para abrirla desde su propio icono.</p>' +
      '<p><strong>Android:</strong> abre el menú del navegador y busca «Instalar app» o «Agregar a pantalla principal».</p>' +
      '<p><strong>Computadora:</strong> busca la opción de instalación en la barra de direcciones o en el menú del navegador. En Safari para Mac, usa Archivo → Agregar al Dock.</p>' +
      '<p>Si esta ventana está dentro de otra aplicación, abre el sitio en el navegador de tu dispositivo.</p>';
    video.hidden = true;
    error.hidden = true;
    tutorialButton.hidden = false;
  }
  button.addEventListener('click', async function () {
    if (appleMobile) {
      showTutorial();
      dialog.showModal();
      return;
    }
    if (pending) {
      var prompt = pending;
      pending = null;
      button.disabled = true;
      try {
        await prompt.prompt();
        await prompt.userChoice;
      } catch (e) {
        guide();
        dialog.showModal();
      } finally {
        button.disabled = false;
        refresh();
      }
      return;
    }
    guide();
    dialog.showModal();
  });
  tutorialButton.addEventListener('click', showTutorial);
  document.getElementById('closeInstall').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () { video.pause(); });
  video.addEventListener('error', function () { error.hidden = false; });
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    pending = event;
    refresh();
  });
  window.addEventListener('appinstalled', function () {
    installed = true;
    pending = null;
    if (dialog.open) dialog.close();
    refresh();
  });
  if (display.addEventListener) display.addEventListener('change', refresh);
  refresh();
})();
