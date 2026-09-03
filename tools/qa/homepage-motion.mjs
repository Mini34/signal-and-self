import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=new URL('../../docs/qa/homepage-motion/',import.meta.url);
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',args:['--remote-debugging-port=9224']});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const results={capturedAt:new Date().toISOString(),checks:[],accessibility:[],lighthouse:[],errors:[]};
const check=(name,passed)=>{results.checks.push({name,passed});assert.ok(passed,name);};
page.on('pageerror',e=>results.errors.push(e.message));
try {
 await page.goto('http://127.0.0.1:8000',{waitUntil:'networkidle'});
 check('Compass is restored inside the hero',await page.locator('.home-hero .orbit-stage').count()===1);
 const transform=await page.locator('.orbit-stage').evaluate(n=>getComputedStyle(n,'::before').transform);
 await page.waitForTimeout(200);
 check('Compass animation advances',await page.locator('.orbit-stage').evaluate(n=>getComputedStyle(n,'::before').transform)!==transform);
 await page.getByRole('button',{name:'Pause animation',exact:true}).focus();await page.keyboard.press('Enter');
 check('Pause control stops the compass',await page.locator('.orbit-stage').evaluate(n=>getComputedStyle(n,'::before').animationPlayState)==='paused');
 check('Pause control stops the text strip',await page.locator('.signal-strip-track').evaluate(n=>getComputedStyle(n).animationPlayState)==='paused');
 await page.keyboard.press('Enter');
 check('Keyboard can resume animation',await page.locator('.orbit-stage').evaluate(n=>getComputedStyle(n,'::before').animationPlayState)==='running');
 await page.locator('.signal-strip').focus();
 check('Text strip pauses on keyboard focus',await page.locator('.signal-strip-track').evaluate(n=>getComputedStyle(n).animationPlayState)==='paused');
 await page.locator('h1').click();
 for(const [width,height] of [[1440,1000],[1024,768],[768,1024],[390,844],[320,568]]) {
  await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));
  check(`No overflow at ${width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:new URL(`home-${width}.png`,out).pathname.replace(/^\/(\w:)/,'$1')});
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const theme of ['signal','midnight','quiet']) {
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  results.accessibility.push({theme,violations:scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
  check(`No axe violations in ${theme}`,scan.violations.length===0);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 check('Reduced motion stops the compass',await page.locator('.orbit-stage').evaluate(n=>getComputedStyle(n,'::before').animationName)==='none');
 check('Reduced motion stops the text strip',await page.locator('.signal-strip-track').evaluate(n=>getComputedStyle(n).animationName)==='none');
 check('Reduced-motion strip exposes all five phrases',await page.locator('.signal-strip-group:not([aria-hidden]) span').count()===5);
 check('No console errors',results.errors.length===0);
 await page.close();
 for(const mode of ['mobile','desktop']) {
  const settings={onlyCategories:['performance','accessibility','seo'],formFactor:mode,
   screenEmulation:mode==='desktop'?{mobile:false,width:1350,height:940,deviceScaleFactor:1,disabled:false}:{mobile:true,width:412,height:823,deviceScaleFactor:1.75,disabled:false},
   throttling:mode==='desktop'?{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1,requestLatencyMs:0,downloadThroughputKbps:0,uploadThroughputKbps:0}:{rttMs:150,throughputKbps:1638.4,cpuSlowdownMultiplier:4,requestLatencyMs:0,downloadThroughputKbps:0,uploadThroughputKbps:0}};
  const {lhr}=await lighthouse('http://127.0.0.1:8000',{port:9224,logLevel:'error'},{extends:'lighthouse:default',settings});
  const row={mode,scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),lcp:lhr.audits['largest-contentful-paint'].numericValue,cls:lhr.audits['cumulative-layout-shift'].numericValue};
  results.lighthouse.push(row);console.log(row);
 }
} finally {
 await fs.writeFile(new URL('results.json',out),JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify({checks:results.checks.length,failed:results.checks.filter(c=>!c.passed),errors:results.errors}));
 await browser.close();
}
