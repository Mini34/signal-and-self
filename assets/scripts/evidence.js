(() => {
  'use strict';
  if (!window.SignalSelf) return;
  const { $, $$, path } = window.SignalSelf;
  async function init() {
    try {
      const response = await fetch(path('assets/data/evidence.json?v=ux-20260903'));
      if (!response.ok) throw new Error('Evidence data unavailable');
      const data = await response.json();
      function chart(key) {
        const period = data.periods[key], max = Math.max(...period.points.map(p=>p.value));
        $('#chart-summary').textContent = period.summary;
        $('#learning-chart').replaceChildren();
        const table = document.createElement('table');
        const caption = table.createCaption(); caption.textContent = period.summary;
        const head=table.createTHead().insertRow();
        for(const label of ['Period','Hours']) {const th=document.createElement('th'); th.scope='col'; th.textContent=label; head.append(th);}
        const body=table.createTBody();
        for(const point of period.points) {
          const col=document.createElement('div'); col.className='chart-column';
          const wrap=document.createElement('div'); wrap.className='chart-bar-wrap';
          const bar=document.createElement('div'); bar.className='chart-bar'; bar.style.setProperty('--bar-height',`${point.value/max*100}%`);
          const value=document.createElement('strong'); value.textContent=point.value+'h'; bar.append(value); wrap.append(bar);
          const label=document.createElement('span'); label.textContent=point.label; col.append(wrap,label); $('#learning-chart').append(col);
          const row=body.insertRow(); const th=document.createElement('th'); th.scope='row'; th.textContent=point.label; row.append(th); row.insertCell().textContent=point.value;
        }
        $('#chart-data').replaceChildren(table);
        $$('[data-period]').forEach(b=>{b.classList.toggle('is-active',b.dataset.period===key); b.setAttribute('aria-pressed',String(b.dataset.period===key));});
      }
      $$('[data-period]').forEach(b=>b.addEventListener('click',()=>chart(b.dataset.period)));
      chart('monthly'); $('.no-js-period').hidden=true;
      const positions={NAC:[18,31],LCN:[28,66],ECS:[52,25],MNA:[56,47],SSF:[53,69],SAS:[68,55],EAS:[80,36]};
      for(const [code,[left,top]] of Object.entries(positions)) {
        const marker=document.createElement('span'); marker.className='map-region'; marker.dataset.region=code; marker.style.left=left+'%'; marker.style.top=top+'%'; $('#map-markers').append(marker);
      }
      function adoption() {
        const year=$('#adoption-year').value; const phrases=[];
        $('#adoption-year-label').textContent=year; $('#adoption-table-year').textContent=year;
        for(const [code,label] of Object.entries(data.regions)) {
          const value=data.adoption.series[code]?.[year];
          const text=value==null?'Not available':`${value}%`;
          $(`[data-adoption-value="${code}"]`).textContent=text;
          const marker=$(`[data-region="${code}"]`); marker.textContent=value==null?'—':`${Math.round(value)}%`;
          marker.style.setProperty('--dot-size',`${value==null?30:Math.max(36,value*0.7)}px`);
          phrases.push(`${label}: ${text}`);
        }
        $('#adoption-year').setAttribute('aria-valuetext',year);
        $('#adoption-announcement').textContent=`${year}. ${phrases.join('; ')}.`;
      }
      $('#adoption-year').addEventListener('input',adoption); adoption();
    } catch {
      // Static tables remain available if the optional interactive payload fails.
      $('#chart-summary').textContent='Interactive comparison unavailable. Historical data tables remain below.';
      $$('.segmented-control,.map-slider').forEach(node=>node.hidden=true);
    }
  }
  init();
})();
