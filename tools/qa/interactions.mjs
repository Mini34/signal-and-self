import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.SITE_URL||'http://127.0.0.1:8000';
const output=new URL(`../../docs/qa/${process.env.QA_STAGE||'final'}/`,import.meta.url);
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({...(process.env.QA_BROWSER==='chromium'?{}:{channel:'chrome'}),headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();
const errors=[], checks=[], accessibility=[];
page.on('pageerror',err=>errors.push(err.message));
const routes=['/','/pages/initiatives.html','/pages/profile.html','/pages/field-notes.html','/pages/insights.html','/pages/journey.html','/pages/privacy.html','/pages/project-pico-2w-ee-lab-tool.html','/pages/project-power-quality-lab.html','/pages/project-microgrid-controller-sim.html','/pages/project-can-bus-anomaly-lab.html','/pages/project-trailhead-support-api.html','/404.html'];
const check=(name,value)=>{checks.push({name,passed:Boolean(value)});assert.ok(value,name);};
const shot=async(name,fullPage=false)=>page.screenshot({path:new URL(name,output).pathname.replace(/^\/(\w:)/,'$1'),fullPage});
try {
 await page.goto(base,{waitUntil:'networkidle'});
 check('Four featured projects',await page.locator('#featured-work .project-card').count()===4);
 check('Pico 2 W leads featured work',await page.locator('#featured-work .project-card').first().getAttribute('id')==='project-pico-2w-ee-lab-tool');
 check('Trailhead is absent from featured work',await page.locator('#featured-work #project-trailhead-support-api').count()===0);
 check('Google library does not load before interaction',await page.locator('script[src*="accounts.google.com"]').count()===0);
 check('No Cloudflare beacon on local preview',await page.locator('script[src*="cloudflareinsights.com"]').count()===0);
 check('No monolithic records or search payload on initial load',await page.evaluate(()=>!performance.getEntriesByType('resource').some(r=>/citizenship-records|search.json|site.json/.test(r.name))));
 for(const [width,height] of [[1440,900],[1024,768],[768,1024],[390,844],[320,568]]) {
  await page.setViewportSize({width,height}); await shot(`home-${width}.png`);
 }
 await page.setViewportSize({width:1440,height:900});
 await page.locator('[data-open-personalize]').first().focus(); await page.keyboard.press('Enter');
 check('Settings opens by keyboard',await page.locator('#personalize-dialog').evaluate(n=>n.open));
 check('Settings alone does not contact Google',await page.locator('script[src*="accounts.google.com"]').count()===0);
 await page.keyboard.press('Shift+Tab');
 check('Settings contains backward Tab focus',await page.evaluate(()=>document.querySelector('#personalize-dialog').contains(document.activeElement)));
 await page.keyboard.press('Tab');
 check('Settings contains forward Tab focus',await page.evaluate(()=>document.querySelector('#personalize-dialog').contains(document.activeElement)));
 await page.locator('#visitor-name').fill('Local tester');
 await page.locator('#visitor-goal').fill('Check privacy boundaries');
 await page.locator('#visitor-audience').selectOption('student');
 await page.locator('.theme-option[data-theme="midnight"]').click();
 await page.getByRole('button',{name:'Save settings',exact:true}).click();
 check('Focus returns to settings opener',await page.locator('[data-open-personalize]').first().evaluate(n=>n===document.activeElement));
 await page.reload({waitUntil:'networkidle'});
 check('Theme persists locally',await page.locator('html').getAttribute('data-theme')==='midnight');
 check('Owner identity survives personalization',await page.locator('h1').innerText().then(t=>t.includes('Mina Soliman')));
 await page.locator('[data-open-personalize]').first().click();
 check('Local name persists',await page.locator('#visitor-name').inputValue()==='Local tester');
 await page.getByRole('button',{name:'Reset preferences',exact:true}).click(); await page.keyboard.press('Escape');
 await page.locator('[data-open-search]').click(); await page.locator('#global-search').fill('microgrid');
 await page.locator('.search-result').filter({hasText:'Microgrid'}).waitFor();
 check('Search loads on demand',await page.locator('.search-result').count()>0);
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>document.querySelector('[data-open-search]')===document.activeElement);
 check('Search restores focus',await page.locator('[data-open-search]').evaluate(n=>n===document.activeElement));
 await page.goto(base+'/pages/initiatives.html',{waitUntil:'networkidle'});
 check('Work defaults to four engineering builds',await page.locator('.project-card:visible').count()===4);
 await page.locator('#project-type').selectOption('engineering-build');
 check('Full engineering collection retains Trailhead',await page.locator('.project-card:visible').count()===5&&await page.locator('#project-trailhead-support-api').isVisible());
 await page.locator('#project-type').selectOption('exploration'); await page.locator('#project-status').selectOption('Planned');
 check('Planned filter returns only planned items',await page.locator('.project-card:visible').count()===2);
 await page.goto(base+'/pages/initiatives.html#project-peer-support',{waitUntil:'networkidle'});
 check('Non-default project deep link is visible',await page.locator('#project-peer-support').isVisible());
 await page.locator('#project-peer-support [data-save-item]').click(); await page.locator('#project-saved').check();
 check('Saved-only project filter',await page.locator('.project-card:visible').count()===1);
 await page.goto(base+'/pages/field-notes.html',{waitUntil:'networkidle'});
 check('Full note archive retained',await page.locator('.reflection-card').count()===20);
 await page.locator('[data-read-note]').first().focus(); await page.keyboard.press('Enter');
 check('Reading dialog opens by keyboard',await page.locator('#reader-dialog').evaluate(n=>n.open));
 await page.keyboard.press('Escape');
 check('Reader restores exact opener',await page.locator('[data-read-note]').first().evaluate(n=>n===document.activeElement));
 await page.locator('#note-search').fill('privacy');
 check('Note search filters',await page.locator('.reflection-card:visible').count()<20);
 await page.goto(base+'/pages/field-notes.html#reflection-ai-study-boundaries',{waitUntil:'networkidle'});
 check('Note deep link opens full content',await page.locator('#reflection-ai-study-boundaries details').evaluate(n=>n.open));
 await page.goto(base+'/pages/insights.html',{waitUntil:'networkidle'});
 await page.locator('[data-period="weekly"]').focus(); await page.keyboard.press('Enter');
 check('Weekly chart table updates',await page.locator('#chart-data tbody tr').count()===6);
 await page.locator('#adoption-year').focus(); await page.keyboard.press('Home');
 check('Missing adoption years announced',await page.locator('#adoption-announcement').innerText().then(t=>t.includes('2000')&&t.includes('Not available')));
 await page.keyboard.press('End');
 check('Selected adoption year announced',await page.locator('#adoption-announcement').innerText().then(t=>t.startsWith('2025')));
 await page.goto(base+'/pages/journey.html',{waitUntil:'networkidle'});
 const download=page.waitForEvent('download'); await page.locator('#download-journey').click();
 check('Journey text download works',(await download).suggestedFilename()==='signal-and-self-journey.txt');
 for(const route of routes) {
  await page.goto(base+route,{waitUntil:'networkidle'});
  for(const width of [320,375,390,430,768,1024,1440]) {
   await page.setViewportSize({width,height:900});
   const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
   check(`${route} no overflow at ${width}`,overflow.scroll<=overflow.inner);
  }
  for(const theme of ['signal','midnight','quiet']) {
   await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   accessibility.push({route,theme,violations:scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  }
  await page.setViewportSize({width:390,height:844});
  const mobileScan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  accessibility.push({route,theme:'quiet-mobile',violations:mobileScan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
 }
 await page.goto(base,{waitUntil:'networkidle'});
 for(const width of [640,320]) { await page.setViewportSize({width,height:900}); check(`Reflow equivalent to ${width===640?'200':'400'}% at 1280`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)); }
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});
 check('Reduced motion disables compass animation',await page.locator('.orbit-stage').evaluate(n=>getComputedStyle(n,'::before').animationName==='none'));
 await shot('home-forced-colors.png');
 await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'none'});
 await page.setViewportSize({width:390,height:844}); await page.locator('.menu-button').focus(); await page.keyboard.press('Enter');
 check('Mobile navigation opens by keyboard',await page.locator('.mobile-nav').isVisible()); await page.keyboard.press('Escape');
 check('Escape closes mobile navigation',!await page.locator('.mobile-nav').isVisible());
 check('At most three mobile header utilities',await page.locator('.header-actions button:visible').count()<=3);
 check('Mobile utility targets at least 44 pixels',await page.locator('.header-actions button:visible').evaluateAll(ns=>ns.every(n=>n.getBoundingClientRect().width>=44&&n.getBoundingClientRect().height>=44)));
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:568}});
 const staticPage=await nojs.newPage();
 for(const route of routes) { await staticPage.goto(base+route); await staticPage.locator('.menu-button').click(); check(`${route} no-JS identity and navigation`,await staticPage.locator('h1').isVisible()&&await staticPage.locator('.mobile-nav').isVisible()); }
 await staticPage.goto(base); check('No-JS featured repositories readable',await staticPage.locator('#featured-work .project-card').count()===4); await nojs.close();
 const blocked=await browser.newContext(); const blockedPage=await blocked.newPage();
 await blockedPage.route('**/assets/data/**',r=>r.abort()); await blockedPage.goto(base+'/pages/initiatives.html');
 check('Data failure keeps principal projects readable',await blockedPage.locator('.project-card:visible').count()===4); await blocked.close();
 check('No page JavaScript errors',errors.length===0);
 check('No axe violations in desktop themes or mobile scan',accessibility.every(a=>a.violations.length===0));
} finally {
 await fs.writeFile(new URL('interactions.json',output),JSON.stringify({checks,errors,accessibility},null,2)+'\n');
 console.log(JSON.stringify({checks:checks.length,failed:checks.filter(c=>!c.passed),errors,axeViolations:accessibility.filter(a=>a.violations.length)},null,2));
 await browser.close();
}
