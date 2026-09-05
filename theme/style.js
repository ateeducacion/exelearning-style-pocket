/* Pocket — eXeLearning. GPL-3.0. Native pages and live iDevices inside a handheld. */
(() => {
  function addOpenLink() {
    if (!document.querySelector('.exe-export') || document.querySelector('.exe-open-exelearning')) return;
    const link = document.createElement('a');
    link.className = 'exe-open-exelearning';
    link.href = 'https://static.exelearning.dev/?url=https://github-proxy.exelearning.dev/?repo=ateeducacion/exelearning-style-pocket&branch=main';
    link.target = '_blank';
    link.rel = 'noopener';
    link.innerHTML = '<img class="exe-open-logo" src="icons/exe-logo.svg" alt=""><span>Edit with eXeLearning</span>';
    link.setAttribute('aria-label', 'Abrir este recurso en eXeLearning');
    document.body.append(link);
    const close = document.createElement('button');
    close.className = 'exe-open-close'; close.type = 'button'; close.textContent = '×';
    close.setAttribute('aria-label', 'Ocultar enlace de eXeLearning');
    close.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); link.remove(); });
    link.append(close);
  }
  function init() {
    addOpenLink();
    const main = document.querySelector('main.page');
    if (!document.body.classList.contains('exe-export') || !main || document.querySelector('#pocket-console')) return;
    const nodes = [...main.querySelectorAll('.idevice_node')].filter(node => !node.closest('.teacher-only'));
    if (!nodes.length) return;
    const pageTitle = main.querySelector('.page-title')?.textContent.trim() || document.title;
    const courseTitle = main.querySelector('.package-title')?.textContent.trim() || pageTitle;
    const navLinks = [...document.querySelectorAll('#siteNav a[href]')];
    const pageURL = url => { const result = new URL(url, location.href); result.hash = ''; return result.href; };
    const currentPage = Math.max(0, navLinks.findIndex(link => pageURL(link.href) === pageURL(location.href)));
    const entries = nodes.map((node, index) => ({
      node,
      box: node.closest('.box') || node,
      title: node.closest('.box')?.querySelector('.box-title')?.textContent.trim() || `Actividad ${index + 1}`,
    }));
    const device = document.createElement('section');
    device.id = 'pocket-console';
    device.className = 'pocket-console';
    device.setAttribute('aria-label', 'Consola eXe Pocket');
    device.innerHTML = `
      <div class="top-edge" aria-hidden="true"><span>◁ OFF · ON ▷</span></div>
      <button class="power" type="button" aria-label="Encendido" aria-pressed="true" data-action="power"></button>
      <div class="bezel">
        <div class="bezel-caption" aria-hidden="true"><span></span> DOT MATRIX WITH PERSONALITY <span></span></div>
        <div class="battery" aria-hidden="true"><i></i><span>BATTERY</span></div>
        <div class="lcd">
          <div class="pocket-screen" id="pocket-screen" tabindex="-1"><div id="pocket-view"></div></div>
          <div class="pocket-screen-status" id="pocket-status" aria-live="polite"></div>
        </div>
      </div>
      <div class="brand"><span aria-hidden="true"><strong>eXe</strong> <em>POCKET</em><sup>01</sup></span><button class="console-exit" type="button" data-action="expand" aria-pressed="false">AMPLIAR</button></div>
      <div class="controls">
        <div class="dpad" role="group" aria-label="Cruceta">
          <button type="button" class="up" data-action="up" aria-label="Arriba, leer hacia arriba">▲</button>
          <button type="button" class="left" data-action="left" aria-label="Izquierda, anterior control">◀</button>
          <span aria-hidden="true"></span>
          <button type="button" class="right" data-action="right" aria-label="Derecha, siguiente control">▶</button>
          <button type="button" class="down" data-action="down" aria-label="Abajo, leer hacia abajo">▼</button>
        </div>
        <div class="action-buttons">
          <div><button type="button" data-action="back" aria-label="B, volver">B</button><span aria-hidden="true">B</span></div>
          <div><button type="button" data-action="accept" aria-label="A, elegir o pulsar">A</button><span aria-hidden="true">A</span></div>
        </div>
      </div>
      <div class="system-buttons">
        <div><button type="button" data-action="sound" aria-label="Select, sonido" aria-pressed="false"></button><span aria-hidden="true">SELECT</span></div>
        <div><button type="button" data-action="start" aria-label="Start, páginas"></button><span aria-hidden="true">START</span></div>
      </div>
      <div class="speaker" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="bottom-mark" aria-hidden="true">PHONES <span>▯</span></div>`;
    const screen = device.querySelector('#pocket-screen');
    const panel = device.querySelector('#pocket-view');
    const status = device.querySelector('#pocket-status');
    const home = document.documentElement.id === 'exe-index';
    let view = home && !location.hash ? 'welcome' : entries.length === 1 ? 'content' : 'entries';
    let selected = view === 'pages' ? currentPage : 0;
    let entryIndex = 0;
    let activeControl = null;
    let powered = true;
    let sound = false;
    let audio;
    // Move, never clone: eXe retains element IDs, handlers, answers and SCORM state.
    main.parentNode.insertBefore(device, main);
    screen.append(main);
    document.body.classList.add('exe-pocket');
    const skip = document.querySelector('#skipNav');
    if (skip) skip.href = '#pocket-screen';

    function beep(frequency = 440) {
      if (!sound) return;
      try {
        audio ||= new (window.AudioContext || window.webkitAudioContext)();
        void audio.resume().catch(() => {});
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = 'square'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.025, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .07);
        oscillator.connect(gain).connect(audio.destination);
        oscillator.start(); oscillator.stop(audio.currentTime + .08);
      } catch { /* Optional sound must not prevent navigation. */ }
    }
    function reveal(element) {
      const rect = element.getBoundingClientRect();
      const bounds = screen.getBoundingClientRect();
      if (rect.top < bounds.top) screen.scrollTop -= bounds.top - rect.top + 4;
      else if (rect.bottom > bounds.bottom) screen.scrollTop += rect.bottom - bounds.bottom + 4;
    }
    function highlight(focus = true) {
      const buttons = [...panel.querySelectorAll('.pocket-screen-menu > *')];
      buttons.forEach((button, index) => button.setAttribute('aria-current', String(index === selected)));
      const button = buttons[selected];
      if (!button) return;
      if (focus) button.focus({ preventScroll: true });
      reveal(button);
      status.textContent = `${selected + 1}/${buttons.length} · A ENTRAR · B VOLVER`;
    }
    function render() {
      main.hidden = view !== 'content';
      main.inert = main.hidden;
      panel.hidden = view === 'content';
      panel.replaceChildren();
      screen.scrollTop = 0;
      activeControl?.classList.remove('pocket-active-control');
      activeControl = null;
      if (view === 'content') {
        entries.forEach((entry, index) => {
          entry.node.hidden = index !== entryIndex;
          entry.box.hidden = entry.box !== entries[entryIndex].box;
        });
        const entry = entries[entryIndex];
        entry.box.classList.remove('minimized');
        const body = entry.box.querySelector('.box-content');
        if (body) body.style.display = '';
        screen.focus({ preventScroll: true });
        status.textContent = '↑↓ LEER · ←→ CONTROLES · B VOLVER';
        // Canvas/video iDevices can recalculate after becoming visible.
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
        return;
      }
      if (view === 'welcome') {
        panel.innerHTML = `<div class="welcome"><p class="pocket-screen-kicker">EXELEARNING</p><svg class="pixel-avatar" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M7 1h2v2h2v2h2v3h1v4h-2v2H4v-2H2V8h1V5h2V3h2z"/><path fill="var(--lcd)" d="M4 8h2v3H4zm2 3h4v1H6z"/></svg><h1></h1><button class="start-prompt" type="button" data-action="start">▸ PULSA START</button><p class="pocket-help">↑↓ mover · A entrar · B volver</p></div>`;
        panel.querySelector('h1').textContent = courseTitle.replace(/\s*·\s*Pocket$/, '');
        status.textContent = 'SELECT: SONIDO · AMPLIAR: PANTALLA';
        return;
      }
      const heading = document.createElement('h1');
      heading.className = 'menu-title';
      heading.textContent = view === 'pages' ? 'PÁGINAS' : pageTitle;
      const menu = document.createElement('nav');
      menu.className = 'pocket-screen-menu';
      menu.setAttribute('aria-label', view === 'pages' ? 'Páginas de la unidad' : 'iDevices de esta página');
      const items = view === 'pages' && navLinks.length ? navLinks : entries;
      items.forEach((item, index) => {
        const button = document.createElement(view === 'pages' && navLinks.length ? 'a' : 'button');
        if (button.tagName === 'A') {
          button.href = item.href;
          button.textContent = `${item.closest('ul').parentElement.closest('li') ? '· ' : ''}${item.textContent.trim()}`;
        } else { button.type = 'button'; button.textContent = item.title; }
        button.addEventListener('focus', () => { selected = index; highlight(false); });
        button.addEventListener('click', event => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); selected = index; openSelected();
        });
        menu.append(button);
      });
      panel.append(heading, menu);
      highlight();
    }
    function openSelected() {
      beep(660);
      if (view === 'pages' && navLinks.length) {
        if (selected !== currentPage) { location.assign(navLinks[selected].href); return; }
        view = entries.length === 1 ? 'content' : 'entries'; selected = entryIndex;
      } else { entryIndex = selected; view = 'content'; }
      render();
    }
    function controls() {
      return [...entries[entryIndex].node.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, [tabindex="0"]')]
        .filter(element => !element.disabled && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
    }
    function selectControl(step) {
      const items = controls();
      if (!items.length) return;
      const previous = items.indexOf(activeControl);
      activeControl?.classList.remove('pocket-active-control');
      activeControl = items[(previous + step + items.length) % items.length];
      activeControl.classList.add('pocket-active-control');
      activeControl.focus({ preventScroll: true });
      reveal(activeControl);
      status.textContent = 'A PULSAR · ←→ CONTROLES · B VOLVER';
    }
    function showCover() {
      view = 'welcome'; selected = 0; entryIndex = 0;
      render();
    }
    function act(action) {
      if (action === 'power') {
        powered = !powered;
        device.classList.toggle('is-off', !powered);
        device.querySelector('[data-action="power"]').setAttribute('aria-pressed', String(powered));
        screen.inert = !powered;
        if (powered) showCover();
        return;
      }
      if (!powered) return;
      if (action === 'expand') {
        const expanded = device.classList.toggle('is-expanded');
        const button = device.querySelector('[data-action="expand"]');
        button.setAttribute('aria-pressed', String(expanded));
        button.textContent = expanded ? 'REDUCIR' : 'AMPLIAR';
        window.dispatchEvent(new Event('resize'));
        return;
      }
      if (action === 'sound') {
        sound = !sound;
        device.querySelector('[data-action="sound"]').setAttribute('aria-pressed', String(sound));
        status.textContent = sound ? 'SONIDO ACTIVADO' : 'SONIDO DESACTIVADO';
        beep(); return;
      }
      beep();
      if (action === 'start' || (view === 'welcome' && action === 'accept')) {
        view = navLinks.length ? 'pages' : 'entries'; selected = navLinks.length ? currentPage : 0; render();
      } else if (action === 'back') {
        if (view === 'content') { view = entries.length === 1 && navLinks.length ? 'pages' : 'entries'; selected = view === 'pages' ? currentPage : entryIndex; }
        else if (view === 'entries' && navLinks.length) { view = 'pages'; selected = currentPage; }
        else { showCover(); return; }
        render();
      } else if (action === 'up' || action === 'down') {
        const step = action === 'up' ? -1 : 1;
        if (view === 'content') screen.scrollTop += step * 48;
        else {
          const count = panel.querySelectorAll('.pocket-screen-menu > *').length;
          if (count) { selected = (selected + step + count) % count; highlight(); }
        }
      } else if (action === 'left' || action === 'right') {
        if (view === 'content') selectControl(action === 'left' ? -1 : 1);
        else act(action === 'left' ? 'back' : 'accept');
      } else if (action === 'accept') {
        if (view === 'content') {
          if (!activeControl || !controls().includes(activeControl)) selectControl(1);
          else { activeControl.focus({ preventScroll: true }); activeControl.click(); }
        } else if (view !== 'welcome') openSelected();
      }
    }
    device.addEventListener('click', event => {
      const button = event.target.closest('[data-action]');
      if (button) act(button.dataset.action);
    });
    main.addEventListener('focusin', event => {
      if (controls().includes(event.target)) activeControl = event.target;
    });
    document.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (['Enter', ' '].includes(event.key) && event.target.closest('a, button')) return;
      const action = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'accept', a: 'accept', b: 'back', Escape: 'back', s: 'start' }[event.key];
      if (!action) return;
      event.preventDefault(); act(action);
    });
    render();
    const hashTarget = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const hashIndex = entries.findIndex(entry => hashTarget && (entry.node.contains(hashTarget) || entry.box === hashTarget));
    if (hashIndex >= 0) { entryIndex = hashIndex; view = 'content'; render(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
