import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.SITE_URL||'http://127.0.0.1:8000';
const target='https://mini34.github.io/digital-citizen-reflection/';
const browser=await chromium.launch({...(process.env.QA_BROWSER==='chromium'?{}:{channel:'chrome'}),headless:true});
try{
 const page=await browser.newPage();
 for(const name of ['index.html','pages/insights.html','pages/privacy.html']){await page.goto(base+'/'+name);assert.equal(await page.locator('a[href*="digital-citizen-reflection"]').count(),0);}
 for(const name of ['assets/data/search.json','sitemap.xml']){const response=await page.request.get(base+'/'+name);assert.ok(!(await response.text()).includes('pages/digital-citizen-reflection.html'));}
 const outgoing=[];await page.route('https://mini34.github.io/**',r=>{outgoing.push(r.request().url());return r.fulfill({body:'Dedicated activity'});});
 await page.goto(base+'/pages/digital-citizen-reflection.html?private=DO_NOT_FORWARD#DO_NOT_FORWARD');await page.waitForURL(target);assert.deepEqual(outgoing,[target]);
 const html=await (await page.request.get(base+'/pages/digital-citizen-reflection.html')).text();assert.ok(html.includes('<a href="'+target+'">'));assert.ok(!html.includes('assets/scripts')&&!html.includes('reflection-form'));console.log('Listings hidden; fixed redirect, fallback link, and private URL boundary verified.');
}finally{await browser.close();}
