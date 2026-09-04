(() => {
  'use strict';
  const $ = (selector, host = document) => host.querySelector(selector);
  const $$ = (selector, host = document) => [...host.querySelectorAll(selector)];
  const root = document.body.dataset.root;
  const path = value => /^(https?:|#)/.test(value) ? value : (root === '.' ? '' : root) + value;
  const preferencesKey = 'signal-and-self-preferences';
  const savedKey = 'signal-and-self-saved-items';
  const themes = ['signal', 'midnight', 'quiet'];
  const fallback = { name: '', audience: 'curious', goal: '', theme: 'signal' };
  function read(key, fallbackValue) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallbackValue; } catch { return fallbackValue; }
  }
  let preferences = { ...fallback, ...read(preferencesKey, {}) };
  const savedValue = read(savedKey, []);
  const saved = new Set(Array.isArray(savedValue) ? savedValue.filter(x => typeof x === 'string') : []);
  let viewer = null;
  let siteData = null;
  let searchData = null;
  let searchRequest = null;
  const openers = new WeakMap();
  function toast(message) {
    const host = $('#toast'); host.textContent = message; host.classList.add('is-visible');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => host.classList.remove('is-visible'), 3200);
  }
  function persist(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { toast('Browser storage is unavailable. This choice lasts for this page only.'); return false; }
  }
  function applyTheme(theme) {
    preferences.theme = themes.includes(theme) ? theme : 'signal';
    document.documentElement.dataset.theme = preferences.theme;
    $('meta[name="theme-color"]').content = { signal: '#f4f0e8', midnight: '#0b1020', quiet: '#efeee9' }[preferences.theme];
    $$('.theme-option').forEach(button => {
      const selected = button.dataset.theme === preferences.theme;
      button.classList.toggle('is-active', selected); button.setAttribute('aria-pressed', String(selected));
    });
  }
  function greeting() {
    const audience = siteData?.personalization.audiences.find(a => a.id === preferences.audience);
    const name = preferences.name || viewer?.givenName;
    $('[data-personal-greeting]').textContent = `${audience?.greeting || 'Welcome in'}${name ? ', ' + name : ''}.`;
    $('[data-personal-intro]').textContent = audience?.intro || '';
  }
  function showDialog(dialog, initial) {
    if (dialog.open) return;
    openers.set(dialog, document.activeElement); dialog.showModal();
    document.body.classList.add('is-locked'); (initial || $('[data-close-dialog]', dialog))?.focus();
  }
  function syncSaved() {
    $$('[data-save-item]').forEach(button => {
      const isSaved = saved.has(button.dataset.saveItem);
      button.classList.toggle('is-saved', isSaved); button.setAttribute('aria-pressed', String(isSaved));
      button.setAttribute('aria-label', isSaved ? 'Remove saved item' : 'Save this item');
    });
    window.dispatchEvent(new CustomEvent('signal-and-self-saved-change'));
  }
  function closeMenu() { $('#mobile-navigation').open = false; }
  async function settings() {
    $('#visitor-name').value = preferences.name || ''; $('#visitor-goal').value = preferences.goal || '';
    $('#visitor-audience').value = preferences.audience || 'curious'; applyTheme(preferences.theme); greeting();
    showDialog($('#personalize-dialog'));
    try {
      if (!siteData) {
        const response = await fetch(path('assets/data/site.json?v=ux-20260903'));
        if (!response.ok) throw new Error('Settings copy unavailable'); siteData = await response.json();
      }
      greeting();
    } catch { /* The static form remains usable without optional audience copy. */ }
  }
  function account() { showDialog($('#account-dialog')); window.dispatchEvent(new CustomEvent('signal-and-self-auth-open')); }
  function renderSearch() {
    const host = $('#global-search-results'); const term = $('#global-search').value.trim().toLowerCase();
    const items = (searchData || []).filter(i => (i.title + ' ' + i.terms).toLowerCase().includes(term)).slice(0, 12);
    host.replaceChildren(); if (!items.length) { host.textContent = 'No results. Try a broader word.'; return; }
    for (const item of items) {
      const a = document.createElement('a'); a.className = 'search-result'; a.href = path(item.href);
      const type = document.createElement('span'); type.textContent = item.type;
      const title = document.createElement('strong'); title.textContent = item.title; a.append(type, title); host.append(a);
    }
  }
  async function search() {
    showDialog($('#search-dialog'), $('#global-search')); if (searchData) { renderSearch(); return; }
    $('#global-search-results').textContent = 'Loading the search index…';
    try {
      searchRequest ||= fetch(path('assets/data/search.json?v=ux-20260903')).then(response => {
        if (!response.ok) throw new Error('Search unavailable'); return response.json();
      });
      searchData = await searchRequest; renderSearch();
    } catch {
      searchRequest = null;
      $('#global-search-results').textContent = 'Search could not load. Work and Field Notes remain available in navigation. Close and reopen to retry.';
    }
  }
  // Native modals make the background inert; contain Tab as well as Shift+Tab.
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); dialog.close(); return; }
      if (event.key !== 'Tab') return;
      const controls = $$('a[href],button,input,select,textarea,summary,[tabindex="0"]', dialog).filter(n => !n.disabled && n.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return; const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.toggle('is-locked', Boolean($('dialog[open]')));
      const opener = openers.get(dialog);
      const current = $('dialog[open]');
      if ((!current || current.contains(opener)) && opener?.isConnected && opener.getClientRects().length) opener.focus();
    });
  });
  document.addEventListener('click', event => {
    const target = event.target.closest('button,a'); if (!target) return;
    if (target.matches('[data-open-personalize]')) settings();
    if (target.matches('[data-open-account]')) account();
    if (target.matches('[data-open-search]')) search();
    if (target.matches('[data-close-dialog]')) target.closest('dialog').close();
    if (target.matches('.theme-option')) { applyTheme(target.dataset.theme); persist(preferencesKey, preferences); }
    if (target.matches('[data-save-item]')) {
      const id = target.dataset.saveItem; if (saved.has(id)) saved.delete(id); else saved.add(id);
      const stored = persist(savedKey, [...saved]); syncSaved();
      if (stored) toast(saved.has(id) ? 'Saved on this device.' : 'Removed from saved items.');
    }
    if (target.closest('#site-nav,.mobile-nav')) closeMenu();
    if (target.closest('#global-search-results')) $('#search-dialog').close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !document.querySelector('dialog[open]') && $('#mobile-navigation').open) { closeMenu(); $('.menu-button').focus(); }
    const typing = event.target.matches('input,select,textarea,[contenteditable="true"]');
    if ((!typing && event.key === '/') || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) { event.preventDefault(); search(); }
  });
  $('#global-search').addEventListener('input', () => { if (searchData) renderSearch(); });
  $('#personalize-form').addEventListener('submit', event => {
    event.preventDefault(); preferences.name = $('#visitor-name').value.trim();
    preferences.audience = $('#visitor-audience').value; preferences.goal = $('#visitor-goal').value.trim();
    const stored = persist(preferencesKey, preferences); greeting(); $('#personalize-dialog').close();
    if (stored) toast('Settings saved on this device.');
  });
  $('[data-reset-personalization]').addEventListener('click', () => {
    preferences = { ...fallback }; applyTheme('signal'); persist(preferencesKey, preferences);
    $('#visitor-name').value = ''; $('#visitor-goal').value = ''; $('#visitor-audience').value = 'curious'; greeting();
  });
  $('[data-clear-saved]').addEventListener('click', () => { saved.clear(); persist(savedKey, []); syncSaved(); });
  window.addEventListener('signal-and-self-auth-change', event => { viewer = event.detail?.viewer || null; greeting(); });
  window.addEventListener('resize', () => { if (innerWidth > 1100) closeMenu(); });
  applyTheme(preferences.theme); document.documentElement.classList.add('js');
  $$('.js-only').forEach(node => { node.hidden = false; }); syncSaved();
  window.SignalSelf = Object.freeze({ $, $$, path, saved, showDialog, toast });
})();
