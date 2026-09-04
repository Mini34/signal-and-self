import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import fs from 'node:fs/promises';

const stage = process.argv[2] || 'final';
const base = process.env.SITE_URL || 'http://127.0.0.1:8000';
const out = new URL(`../../docs/qa/${stage}/`, import.meta.url);
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ ...(process.env.QA_BROWSER === 'chromium' ? {} : {channel:'chrome'}), headless: true, args: ['--remote-debugging-port=9223'] });
const routes = { home: '/', work: '/pages/initiatives.html', about: '/pages/profile.html', notes: '/pages/field-notes.html', evidence: '/pages/insights.html', journey: '/pages/journey.html', privacy: '/pages/privacy.html' };
const sizes = [[1440,900],[1024,768],[768,1024],[390,844],[320,568]];
const result = { stage, capturedAt: new Date().toISOString(), browser: browser.version(), screenshots: [], accessibility: [], lighthouse: [] };
try {
  for (const [width,height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.screenshot({ path: new URL(`home-${width}.png`, out).pathname.replace(/^\/(\w:)/, '$1') });
    result.screenshots.push({ width, height, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
    await page.close();
  }
  for (const [name,route] of Object.entries(routes)) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(base+route, { waitUntil: 'networkidle' });
    // Scan all content, including portions that baseline reveal animations hide.
    await page.locator('[data-reveal]').evaluateAll(nodes => nodes.forEach(n => n.classList.add('is-visible')));
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    result.accessibility.push({ page:name, violations:scan.violations.map(v => ({ id:v.id, impact:v.impact, description:v.description, nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})) })) });
    await context.close();
    for (const mode of ['mobile','desktop']) {
      const settings = { onlyCategories:['performance','accessibility','seo'], formFactor:mode,
        screenEmulation: mode === 'desktop' ? { mobile:false,width:1350,height:940,deviceScaleFactor:1,disabled:false } : { mobile:true,width:412,height:823,deviceScaleFactor:1.75,disabled:false },
        throttling: mode === 'desktop' ? { rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1,requestLatencyMs:0,downloadThroughputKbps:0,uploadThroughputKbps:0 } : { rttMs:150,throughputKbps:1638.4,cpuSlowdownMultiplier:4,requestLatencyMs:0,downloadThroughputKbps:0,uploadThroughputKbps:0 }
      };
      try {
        const {lhr} = await lighthouse(base+route,{port:9223,logLevel:'error'}, {extends:'lighthouse:default',settings});
        const row = { page:name,mode,scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])), lcp:lhr.audits['largest-contentful-paint'].numericValue, cls:lhr.audits['cumulative-layout-shift'].numericValue, tbt:lhr.audits['total-blocking-time'].numericValue,
          diagnostics:Object.fromEntries(Object.entries(lhr.audits).filter(([,v])=>v.score!==null&&v.score<0.9).map(([k,v])=>[k,{title:v.title,display:v.displayValue,details:v.details}])) };
        result.lighthouse.push(row);
        console.log(stage,name,mode,JSON.stringify(row.scores),'LCP',Math.round(row.lcp),'CLS',row.cls);
      } catch(error) { result.lighthouse.push({page:name,mode,error:error.message}); console.log(name,mode,error.message); }
      await fs.writeFile(new URL('results.json',out),JSON.stringify(result,null,2)+'\n');
    }
  }
} finally { await browser.close(); }
await fs.writeFile(new URL('results.json',out),JSON.stringify(result,null,2)+'\n');
