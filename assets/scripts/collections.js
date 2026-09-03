(() => {
  'use strict';
  const app = window.SignalSelf; if (!app) return;
  const { $, $$, saved, showDialog, toast } = app;
  const page = document.body.dataset.page;
  if (page === 'initiatives') {
    const cards = $$('.project-card');
    function filter() {
      const term = $('#project-search').value.trim().toLowerCase(); let count = 0;
      cards.forEach(card => {
        const type = $('#project-type').value;
        const visible = (type === 'all' || card.dataset.projectType === type || (type === 'featured' && card.dataset.featured === 'true'))
          && ($('#project-status').value === 'all' || card.dataset.status === $('#project-status').value)
          && (!$('#project-saved').checked || saved.has(card.id)) && card.textContent.toLowerCase().includes(term);
        card.hidden = !visible; if (visible) count++;
      });
      $$('.project-group').forEach(group => { group.hidden = !$('.project-card:not([hidden])', group); });
      $('#project-empty').hidden = count !== 0; $('#project-result-count').textContent = `${count} of ${cards.length} initiatives`;
    }
    function revealHash() {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id === 'all-work' || cards.some(card => card.id === id)) {
        $('#project-type').value = 'all'; $('#project-status').value = 'all';
        $('#project-search').value = ''; $('#project-saved').checked = false; filter();
        if (id !== 'all-work') document.getElementById(id)?.scrollIntoView({ block: 'start' });
      }
    }
    ['project-search','project-type','project-status','project-saved'].forEach(id => $('#'+id).addEventListener('input', filter));
    window.addEventListener('signal-and-self-saved-change', filter); window.addEventListener('hashchange', revealHash); filter(); revealHash();
  }
  if (page === 'notes') {
    const cards = $$('.reflection-card');
    function filter() {
      const term = $('#note-search').value.trim().toLowerCase(); let count = 0;
      cards.forEach(card => {
        const visible = ($('#note-category').value === 'all' || card.dataset.noteCategory === $('#note-category').value)
          && (!$('#note-saved').checked || saved.has(card.id)) && card.textContent.toLowerCase().includes(term);
        card.hidden = !visible; if (visible) count++;
      });
      $('#note-result-count').textContent = `${count} of ${cards.length} notes`; $('#note-empty').hidden = count !== 0;
    }
    function read(card) {
      if (!card) return; $('#reader-title').textContent = $('h3', card).textContent;
      $('#reader-content').replaceChildren($('.card-date', card).cloneNode(true), $('.note-content', card).cloneNode(true));
      showDialog($('#reader-dialog'));
    }
    function revealHash() {
      const card = cards.find(n => n.id === decodeURIComponent(location.hash.slice(1))); if (!card) return;
      $('#note-search').value = ''; $('#note-category').value = 'all'; $('#note-saved').checked = false; filter();
      $('details', card).open = true; card.scrollIntoView({ block: 'start' });
    }
    ['note-search','note-category','note-saved'].forEach(id => $('#'+id).addEventListener('input', filter));
    $('#random-note').addEventListener('click', () => read(cards[Math.floor(Math.random()*cards.length)]));
    document.addEventListener('click', event => { const button=event.target.closest('[data-read-note]'); if (button) read(document.getElementById(button.dataset.readNote)); });
    window.addEventListener('signal-and-self-saved-change', filter); window.addEventListener('hashchange', revealHash); filter(); revealHash();
  }
  if (page === 'journey') {
    const entries = $$('.timeline-item');
    $('#journey-category').addEventListener('input', () => {
      entries.forEach(entry => { entry.hidden = $('#journey-category').value !== 'all' && entry.dataset.journeyCategory !== $('#journey-category').value; });
      $('#journey-count').textContent = `${entries.filter(e=>!e.hidden).length} of ${entries.length} records`;
    });
    $('#print-journey').addEventListener('click', () => window.print());
    $('#download-journey').addEventListener('click', () => {
      const text = 'SIGNAL & SELF — HISTORICAL JOURNEY LOG\n\n'+entries.map(entry=>entry.textContent.trim()).join('\n\n');
      const href=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
      const a=document.createElement('a'); a.href=href; a.download='signal-and-self-journey.txt'; a.click();
      setTimeout(()=>URL.revokeObjectURL(href),1000); toast('Journey log downloaded.');
    });
    window.addEventListener('hashchange', () => {
      const entry=entries.find(e=>e.id===decodeURIComponent(location.hash.slice(1)));
      if (entry) { $('#journey-category').value='all'; entries.forEach(e=>e.hidden=false); entry.scrollIntoView({block:'start'}); }
    });
  }
})();
