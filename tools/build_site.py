"""Generate static, readable pages and small optional payloads from one authoring record.

No runtime framework or build dependency. Run after editing citizenship-records.json.
Use --check in CI to reject generated content or counts that have drifted.
"""
from __future__ import annotations
import argparse
import json
from datetime import date
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://mini34.github.io/signal-and-self/'
VERSION = 'career-20260904'
D = json.loads((ROOT / 'assets/data/citizenship-records.json').read_text(encoding='utf-8'))
PROJECTS = sorted(D['projects'], key=lambda p: p.get('featuredOrder', 99))
ENGINEERING = [p for p in PROJECTS if p.get('type') == 'engineering-build']
FEATURED = [p for p in ENGINEERING if p.get('featured')]
NOTES = sorted(D['reflections'], key=lambda n: n['date'], reverse=True)
UPDATES = sorted(D['updates'], key=lambda u: u['date'], reverse=True)
TYPES = {'engineering-build': 'Engineering and systems builds', 'responsible-tech-tool': 'Responsible-technology tools', 'exploration': 'Explorations and planned work'}
REGIONS = {'NAC':'North America','LCN':'Latin America & Caribbean','ECS':'Europe & Central Asia','MNA':'Middle East & North Africa','SSF':'Sub-Saharan Africa','SAS':'South Asia','EAS':'East Asia & Pacific'}
OUTPUT = {}

def e(value):
    return escape(str(value), quote=True)

def dt(value):
    return date.fromisoformat(value).strftime('%b %d, %Y').replace(' 0', ' ')

def url(path, root):
    return path if path.startswith(('https:', 'mailto:', '#')) else root + path

def link(label, href, root='', cls=''):
    return f'<a{f" class={chr(34)}{cls}{chr(34)}" if cls else ""} href="{e(url(href,root))}">{e(label)}</a>'

def tags(values):
    return '<div class="tag-row">'+''.join(f'<span class="tag">{e(v)}</span>' for v in values)+'</div>'

def section(kicker, title, content, intro='', id='', cls=''):
    return f'<section class="section site-shell {cls}"{f" id={chr(34)}{id}{chr(34)}" if id else ""}><div class="section-header"><div><p class="eyebrow">{e(kicker)}</p><h2>{e(title)}</h2></div><p class="section-intro">{e(intro)}</p></div>{content}</section>'

def hero(kicker, title, description, extra=''):
    return f'<section class="page-hero site-shell"><p class="eyebrow">{e(kicker)}</p><h1>{e(title)}</h1><p class="page-lede">{e(description)}</p>{extra}</section>'

def header(page, root):
    routes = [('initiatives','Work','pages/initiatives.html'),('profile','About','pages/profile.html'),('notes','Field Notes','pages/field-notes.html'),('insights','Evidence','pages/insights.html'),('contact','Contact','index.html#contact')]
    nav = ''.join(f'<a href="{url(path,root)}"'+(' aria-current="page"' if key==page else '')+f'>{label}</a>' for key,label,path in routes)
    return f'''<div class="site-header-wrap site-shell" id="site-header"><header class="site-header">
      <a class="brand" href="{root}index.html" aria-label="S/S · Signal &amp; Self · Mina Soliman’s fieldbook · Home"><span class="brand-mark" aria-hidden="true">S/S</span><span class="brand-copy"><strong>Mina Soliman</strong><small>Signal &amp; Self · Engineering portfolio</small></span></a>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation">{nav}</nav>
      <div class="header-actions">
        <button class="icon-button search-control js-only" data-open-search type="button" aria-label="Search the fieldbook" hidden><span aria-hidden="true">⌕</span><span class="header-label">Search</span></button>
        <button class="icon-button settings-control js-only" data-open-personalize type="button" hidden><span class="desktop-label">Settings</span><span class="mobile-label">Account / Settings</span></button>
        <button class="icon-button account-button js-only" data-open-account data-account-control type="button" hidden><span data-account-label>Sign in</span></button>
        <details class="mobile-navigation" id="mobile-navigation"><summary class="menu-button">Menu</summary><nav class="mobile-nav" aria-label="Mobile navigation">{nav}</nav></details>
      </div></header></div>'''

def footer(root):
    return f'''<footer class="site-footer site-shell" id="site-footer"><div class="footer-bottom"><span>Signal &amp; Self · Mina Soliman</span><nav aria-label="Footer navigation">
      {link('Journey','pages/journey.html',root)} {link('Privacy & Data','pages/privacy.html',root)} {link('GitHub',D['profile']['github'])} {link('Back to top ↑','#top')}
      </nav><span>Updated {date.fromisoformat(D['site']['lastUpdated']).strftime('%B %Y')}</span></div></footer>'''

def dialogs(root):
    audiences=''.join(f'<option value="{e(a["id"])}">{e(a["label"])}</option>' for a in D['personalization']['audiences'])
    themes=''.join(f'<button class="theme-option" data-theme="{e(t["id"])}" aria-pressed="false" type="button"><strong>{e(t["label"])}</strong><small>{e(t["description"])}</small></button>' for t in D['personalization']['themes'])
    return f'''
<dialog class="dialog" id="personalize-dialog" aria-labelledby="personalize-title"><div class="dialog-inner">
 <div class="dialog-header"><div><p class="eyebrow">On this device</p><h2 id="personalize-title">Settings</h2></div><button type="button" class="dialog-close" data-close-dialog aria-label="Close settings">×</button></div>
 <p class="personal-greeting" data-personal-greeting>Welcome in.</p><p data-personal-intro></p>
 <p>Your theme, audience, name, goal, and saved items stay on this device.</p>
 <button class="button button-quiet" type="button" data-open-account>Sign in with Google · optional</button>
 <form id="personalize-form" class="form-grid"><div class="form-field"><label for="visitor-name">First name (optional)</label><input id="visitor-name" name="name" maxlength="32" autocomplete="given-name"></div>
 <div class="form-field"><label for="visitor-audience">What brings you here?</label><select id="visitor-audience" name="audience">{audiences}</select></div>
 <div class="form-field"><label for="visitor-goal">Your digital goal (optional)</label><input id="visitor-goal" name="goal" maxlength="80"></div>
 <fieldset><legend>Theme</legend><div class="theme-options">{themes}</div></fieldset>
 <div class="button-row"><button class="button button-primary" type="submit">Save settings</button><button class="button button-quiet" data-reset-personalization type="button">Reset preferences</button><button class="button button-quiet" data-clear-saved type="button">Clear saved items</button></div></form>
 {link('Privacy & Data','pages/privacy.html',root)}</div></dialog>
<dialog class="dialog account-dialog" id="account-dialog" aria-labelledby="account-title"><div class="dialog-inner">
 <div class="dialog-header"><div><p class="eyebrow">Optional session identity</p><h2 id="account-title">Sign in</h2></div><button class="dialog-close" data-close-dialog type="button" aria-label="Close account">×</button></div>
 <p>Sign in with Google to personalize your greeting during this browser session. Sign-in does not unlock private content or create a permanent account. Anonymous traffic and performance metrics are measured separately through Cloudflare Web Analytics.</p>
 <div data-auth-signed-out><div id="google-signin-host" class="google-signin-host"></div></div>
 <p id="auth-status" class="auth-status" role="status">Google is contacted only after you open this account panel.</p>
 <ul class="privacy-list"><li>The email claim is ignored and the ID token is not stored.</li><li>Only display name, profile image, and session expiry are retained for this browser session.</li><li>Google identity and local preferences are never attached to Cloudflare analytics.</li></ul>
 <div data-auth-signed-in hidden><div class="signed-in-card"><img class="signed-in-avatar" data-account-avatar width="54" height="54" alt="" referrerpolicy="no-referrer" hidden><strong data-account-name></strong></div><button class="button button-quiet" data-sign-out type="button">Sign out</button></div>
 {link('Review privacy details','pages/privacy.html',root)}</div></dialog>
<dialog class="dialog" id="search-dialog" aria-labelledby="search-title"><div class="dialog-inner"><div class="dialog-header"><h2 id="search-title">Search the fieldbook</h2><button class="dialog-close" data-close-dialog type="button" aria-label="Close search">×</button></div>
 <label class="form-field" for="global-search">Search projects, notes, and practice areas<input id="global-search" type="search" autocomplete="off"></label><div id="global-search-results" class="search-results" role="status"></div></div></dialog>
<dialog class="dialog" id="reader-dialog" aria-labelledby="reader-title"><div class="dialog-inner"><div class="dialog-header"><h2 id="reader-title">Field note</h2><button class="dialog-close" data-close-dialog type="button" aria-label="Close field note">×</button></div><div id="reader-content"></div></div></dialog>
<div class="toast" id="toast" role="status"></div>'''

def page(path, key, title, description, content, module=None, schema=None):
    root='../' if '/' in path else ''
    canonical=BASE+(path if path!='index.html' else '')
    person={'@type':'Person','@id':BASE+'#mina','name':'Mina Soliman','url':BASE,'sameAs':[D['profile']['github'],D['profile']['linkedin']],'description':D['profile']['tagline']}
    structured={'@context':'https://schema.org','@graph':[person,{'@type':'WebSite','name':'Signal & Self','url':BASE,'author':{'@id':BASE+'#mina'}}]}
    if key!='home': structured['@graph'].append({'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':BASE},{'@type':'ListItem','position':2,'name':title.split(' — ')[0],'item':canonical}]})
    if schema: structured['@graph'].append(schema)
    output=f'''<!doctype html>
<!-- Generated by tools/build_site.py; edit the records or generator, then regenerate. -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(description)}"><meta name="theme-color" content="#f4f0e8"><meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="canonical" href="{canonical}"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}"><meta property="og:type" content="website"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{BASE}assets/images/signal-and-self-og.png">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(description)}">
<link rel="icon" href="{root}assets/images/favicon.svg" type="image/svg+xml">
<link rel="preload" href="{root}assets/fonts/newsreader-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{root}assets/fonts/manrope-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{root}assets/styles/fonts.css">
<link rel="stylesheet" href="{root}assets/styles/portfolio.css?v={VERSION}">{chr(10)+f'<link rel="stylesheet" href="{root}assets/styles/home.css?v=career-20260904">' if key=='home' else ''}
<script src="{root}assets/scripts/portfolio.js?v={VERSION}" defer></script>
<script src="{root}assets/scripts/auth-config.js?v={VERSION}" defer></script><script src="{root}assets/scripts/auth.js?v={VERSION}" defer></script>
{f'<script src="{root}assets/scripts/{module}.js?v={VERSION}" defer></script>' if module else ''}
<script type="application/ld+json">{json.dumps(structured,ensure_ascii=False).replace('<','\\u003c')}</script>
</head><body id="top" data-page="{key}" data-root="{root or '.'}"><a class="skip-link" href="#main-content">Skip to content</a>
{header(key,root)}<main id="main-content" tabindex="-1">{content}</main>{footer(root)}{dialogs(root)}
<!-- Aggregate analytics load independently of optional identity, on production only. -->
<script src="{root}assets/scripts/analytics.js?v=20260821" defer></script></body></html>
'''
    OUTPUT[path]=output

def save_button(item):
    return f'<button class="save-button js-only" type="button" data-save-item="{e(item["id"])}" aria-label="Save {e(item["title"])}" aria-pressed="false" hidden>◇</button>'

def project_card(p,root='',compact=False):
    tested=p['type']=='engineering-build'
    badge=p.get('statusLabel','Completed · Tested' if tested else p['status'])
    body=f'<p class="project-problem">{e(p.get("problem",p["description"]))}</p>'
    if tested:
        body+=f'<dl class="project-evidence"><dt>Built</dt><dd>{e(p["built"])}</dd><dt>Evidence</dt><dd>{e(p["evidence"])}</dd><dt>Boundary</dt><dd>{e(p["limitations"])}</dd></dl>'
    else: body+=f'<p class="project-impact">{e(p["impact"])}</p>'
    details=''
    if not compact:
        role=f'<p><strong>My role:</strong> {e(p["role"])}</p>' if p.get('role') else ''
        details=f'<details><summary>Project context</summary>{role}<p>{e(p["impact"])}</p></details>'
    action=link('Read case study',p['caseStudyPath'],root,'button button-quiet') if tested else ''
    image=''
    if compact and p.get('image'):
        image=f'<figure class="project-photo"><a href="{url(p["image"],root)}" aria-label="View full annotated Pico 2 W prototype image"><img src="{url(p["image"],root)}" width="{p["imageWidth"]}" height="{p["imageHeight"]}" alt="{e(p["imageAlt"])}" loading="lazy"></a><figcaption>From circuit theory to the workbench · {link("View the annotated prototype",p["image"],root)}</figcaption></figure>'
    return f'''<article class="card project-card{' lead-project' if image else ''}" id="{e(p['id'])}" data-project-type="{e(p['type'])}" data-featured="{str(bool(p.get('featured'))).lower()}" data-status="{e(p['status'])}">{image}<div class="project-content">
    <div class="card-topline"><span class="status-badge" data-status="{e(p['status'])}">{e(badge)}</span>{save_button(p) if not compact else ''}</div>
    <p class="mono-label project-domain">{e(p.get('domain',TYPES[p['type']]))}{' · '+str(p['year']) if p.get('year') else ''}</p><h3>{e(p['title'])}</h3>{body}{details}{tags(p['skills'])}
    <div class="button-row">{action}{link('Repository' if tested else p['linkLabel'],p['link'],root,'button button-small')}</div></div></article>'''

def note_links(ids,root):
    return '<ul class="evidence-links">'+''.join(f'<li>{link(next(n["title"] for n in NOTES if n["id"]==id),"pages/field-notes.html#"+id,root)}</li>' for id in ids)+'</ul>'

def practice(root):
    cards=[]
    for a in D['practiceAreas']:
        cards.append(f'<article class="card signal-card"><p class="mono-label">{e(a["label"])}</p><h3>{e(a["signal"])}</h3><p>{e(a["description"])}</p><p class="card-date">Last reviewed {dt(a["reviewedAt"])}</p>{note_links(a["evidenceLinks"],root)}<p><strong>Next:</strong> {e(a["nextStep"])}</p><details class="signal-evidence"><summary>Methodology & historical score</summary><p>Qualitative self-assessment, not an external grade. Historical score: {a["score"]}/100, recorded before this refresh. No new numerical assessment has been made.</p><p>{e(a["evidence"])}</p></details></article>')
    return '<div class="card-grid four-up">'+''.join(cards)+'</div>'

def curated(root, count=3):
    selected=[n for n in NOTES if n.get('startHere')][:count]
    return '<div class="card-grid">'+''.join(f'<article class="card"><p class="card-date">{dt(n["date"])} · {e(n["readTime"])}</p><h3>{link(n["title"],"pages/field-notes.html#"+n["id"],root)}</h3><p>{e(n["takeaway"])}</p></article>' for n in selected)+'</div>'

def home():
    compass='''<div class="hero-visual" role="img" aria-label="Digital citizenship compass: verify, protect, build, and reflect. Skill plus care creates trust."><div class="orbit-stage" aria-hidden="true"><div class="orbit-core"><strong>Skill + care = trust</strong></div><span class="orbit-label">Verify</span><span class="orbit-label">Protect</span><span class="orbit-label">Build</span><span class="orbit-label">Reflect</span><span class="orbit-note">Current question → How can the safer choice become the easier default?</span></div></div>'''
    intro=f'''<div class="reading-progress" aria-hidden="true"></div><section class="home-hero site-shell"><div class="hero-copy"><p class="eyebrow live-dot">{e(D["profile"]["opportunity"])}</p><h1>Mina Soliman.<br><span class="serif-italic">Engineering, tested.</span></h1><p class="hero-lede">{e(D['profile']['hero'])}</p><div class="button-row"><a class="button button-primary" href="#featured-work">View engineering projects</a><a class="button button-quiet" href="#contact">Let’s connect</a></div><div class="professional-links">{link('GitHub',D['profile']['github'])} {link('LinkedIn',D['profile']['linkedin'])} {link('About Mina','pages/profile.html')}<span>Updated {date.fromisoformat(D['site']['lastUpdated']).strftime('%B %Y')}</span></div><nav class="hero-meta" aria-label="Portfolio summary">{link(str(len(FEATURED))+" featured projects","pages/initiatives.html")}{link("Skills in practice","#skills")}{link("Responsible technology","#fieldbook")}</nav></div>{compass}<div class="hero-motion-tools"><a class="scroll-cue" href="#featured-work"><span>Follow the build</span><span class="scroll-cue-track" aria-hidden="true"><span class="scroll-cue-pulse"></span></span></a><button class="motion-toggle js-only" type="button" data-toggle-motion hidden>Pause animation</button></div></section>'''
    phrases=D['site']['movingBar']
    strip=''.join(f'<span>{e(text)}</span>' for text in phrases)
    intro+=f'<div class="signal-strip" tabindex="0" role="region" aria-label="Engineering interests; focus to pause"><div class="signal-strip-track"><div class="signal-strip-group">{strip}</div><div class="signal-strip-group" aria-hidden="true">{strip}</div></div></div>'
    intro+=section('01 / Featured engineering work','From the workbench to the code.','<div class="project-grid">'+''.join(project_card(p,compact=True) for p in FEATURED)+'</div>','A hands-on Pico 2 W lab tool leads three engineering simulations. Explore the hardware, measurements, code, and documented limits.','featured-work')
    skills=[
        ('Embedded systems & instrumentation','MicroPython · Pico 2 W · I²C · INA219','Five operating modes connect circuit measurements, an OLED display, a Wi-Fi dashboard, and experiment logs.','Pico 2 W case study','pages/project-pico-2w-ee-lab-tool.html'),
        ('Power systems & analysis','Python · waveform analysis · dispatch logic','RMS and power-factor analysis, plus constrained solar, battery, and grid dispatch with explicit unserved load.','Power quality case study','pages/project-power-quality-lab.html'),
        ('Testing & fault investigation','Automated tests · synthetic data · explainable rules','Inspectable CAN anomaly findings and deterministic simulation inputs make behavior and failure cases easier to review.','CAN bus case study','pages/project-can-bus-anomaly-lab.html'),
    ]
    skill_cards='<div class="card-grid">'+''.join(f'<article class="card"><p class="mono-label">{e(stack)}</p><h3>{e(title)}</h3><p>{e(proof)}</p>{link(label,path,cls="button button-quiet")}</article>' for title,stack,proof,label,path in skills)+'</div>'
    intro+=section('02 / Skills in practice','What I can bring to an engineering team.',skill_cards,'Skills demonstrated in the projects above, with code and case studies to inspect.','skills')
    intro+=section('03 / Let’s connect','Have a Summer 2027 opportunity?',f'<p class="contact-copy">I’m looking for an engineering internship where I can contribute to embedded systems, electrical testing, power and energy, or technical software. Reach me on LinkedIn to discuss a role and request a tailored résumé.</p><div class="button-row">{link("Connect on LinkedIn",D["profile"]["linkedin"],cls="button button-primary")}{link("Review my GitHub",D["profile"]["github"],cls="button button-quiet")}{link("More about me","pages/profile.html",cls="button button-quiet")}</div>','University of Toronto · Electrical Engineering · First year, 2026–27','contact')
    framework='''<div class="fieldbook-intro"><div><p class="eyebrow">04 / Why Signal &amp; Self exists</p><h2>Skill matters.<br><span class="serif-italic">So does judgment.</span></h2></div><div><p>Engineering work raises human questions: what can I verify, who should I protect, what can I build, and what should change after reflection?</p><p>This fieldbook keeps those questions beside the code.</p><a class="button button-quiet" href="pages/profile.html#framework">Explore the framework</a></div></div>'''
    intro+=f'<section class="section site-shell" id="fieldbook">{framework}</section>'
    intro+=f'<nav class="proof-strip site-shell" aria-label="Evidence collections">{link(str(len(FEATURED))+" featured projects","pages/initiatives.html")}{link(str(len(PROJECTS))+" initiatives","pages/initiatives.html#all-work")}{link(str(len(NOTES))+" field notes","pages/field-notes.html")}<span>Updated {date.fromisoformat(D["site"]["lastUpdated"]).strftime("%B %Y")}</span></nav>'
    now='<div class="card-grid">'+''.join(f'<article class="card"><p class="mono-label">{label}</p><h3>{e(D["now"][key])}</h3></article>' for label,key in [('Learning','learning'),('Building','building'),('Open question','question')])+'</div>'
    intro+=section('05 / Current focus','A few questions worth following.',now,f'Last reported {dt(D["now"]["asOf"])}.','now')
    intro+=section('06 / Selected field notes','The thinking behind the work.',curated(''),'A starting point for privacy, accessibility, and responsible AI.','selected-notes')

    page('index.html','home','Mina Soliman — Electrical Engineering | Summer 2027 Internships','University of Toronto Electrical Engineering student seeking Summer 2027 internships. Explore embedded hardware, power-system simulations, Python testing, and project evidence.',intro,'home')

def work():
    content=hero('Work · public evidence','Engineering, with the decisions left in.',f'{len(FEATURED)} featured engineering builds lead a collection of {len(PROJECTS)} initiatives. Smaller tools and explorations have their own place.')
    controls='''<div class="filter-toolbar js-only" hidden><label class="form-field" for="project-search">Search projects or skills<input type="search" id="project-search"></label><label class="form-field" for="project-type">Project type<select id="project-type"><option value="featured">Featured projects</option><option value="engineering-build">All engineering builds</option><option value="all">All types</option><option value="responsible-tech-tool">Responsible-tech tools</option><option value="exploration">Explorations & plans</option></select></label><label class="form-field" for="project-status">Status<select id="project-status"><option value="all">All statuses</option><option>Completed</option><option>Ongoing</option><option>Planned</option></select></label><label class="saved-filter"><input id="project-saved" type="checkbox"> Saved only</label></div>'''
    content+=f'<section class="section site-shell" id="all-work">{controls}<p id="project-result-count" role="status">{len(PROJECTS)} initiatives</p>'
    for type,label in TYPES.items():
        content+=f'<section class="project-group" data-group="{type}"><h2>{label}</h2><div class="project-grid">'+''.join(project_card(p,'../') for p in PROJECTS if p['type']==type)+'</div></section>'
    content+='<p id="project-empty" class="empty-state" hidden>No projects match. Try all types or a broader search.</p></section>'
    page('pages/initiatives.html','initiatives','Work — Signal & Self',f'{len(PROJECTS)} initiatives: {len(FEATURED)} featured engineering builds, responsible-technology tools, and clearly labelled explorations.',content,'collections')

def about():
    content=hero('About Mina','Electrical engineering. Practical curiosity.',D['profile']['aboutText'][0])
    summary=f'<aside class="professional-summary"><p class="mono-label">At a glance</p><dl><dt>Program</dt><dd>Electrical Engineering, University of Toronto</dd><dt>Current year</dt><dd>{e(D["profile"]["year"])}</dd><dt>Seeking</dt><dd>{e(D["profile"]["opportunity"])}</dd><dt>Interests</dt><dd>Power systems, embedded systems, cybersecurity, responsible AI</dd><dt>Evidence</dt><dd>{link(str(len(FEATURED))+" featured engineering projects","pages/initiatives.html","../")}</dd></dl><div class="button-row">{link("Connect on LinkedIn",D["profile"]["linkedin"],cls="button button-primary")}{link("GitHub",D["profile"]["github"],cls="button button-quiet")}</div></aside>'
    content+=f'<section class="section site-shell story-grid"><div><div class="portrait-monogram" aria-hidden="true"><strong>MS</strong></div>{summary}</div><div class="story-copy">'+''.join(f'<p>{e(p)}</p>' for p in D['profile']['aboutText'][1:])+f'<p>{e(D["profile"]["definition"])}</p><p>{e(D["profile"]["mission"])}</p></div></section>'
    content+=section('Three threads','What keeps pulling me forward.','<div class="card-grid">'+''.join(f'<article class="card"><h3>{e(a["title"])}</h3><p>{e(a["text"])}</p></article>' for a in D['profile']['focusAreas'])+'</div>')
    content+=section('Working framework','Six lenses for better decisions.','<div class="card-grid">'+''.join(f'<article class="card"><h3>{e(a["title"])}</h3><p>{e(a["description"])}</p><p>{e(a["focus"])}</p></article>' for a in D['categories'])+'</div>',id='framework')
    content+=section('Personal code','Short rules for the moments that matter.','<ol class="conduct-list">'+''.join(f'<li>{e(p)}</li>' for p in D['codeOfConduct'])+'</ol>')
    content+=section('Seven commitments','Values with visible consequences.','<div class="values-grid">'+''.join(f'<article class="value-card"><strong>{e(p)}</strong></article>' for p in D['principles'])+'</div>',id='values')
    roadmap=[('Current · First year, 2026–27','Engineering fundamentals','Connect circuits, programming, and systems thinking with the human impact of technical decisions.'),('Next · Applied project growth','Connect the disciplines','Connect circuits, embedded computing, data, and security through documented projects.'),('Longer term · Trustworthy connected systems','Power, devices, and communication','Explore power, devices, communications, and secure design as connected engineering challenges.')]
    content+=section('Learning roadmap','The next stretch of the journey.','<div class="roadmap">'+''.join(f'<article class="roadmap-step"><p class="mono-label">{e(a)}</p><h3>{e(b)}</h3><p>{e(c)}</p></article>' for a,b,c in roadmap)+'</div>','Directions for learning, not completed outcomes.','roadmap')
    page('pages/profile.html','profile','About Mina Soliman — Signal & Self','Meet Mina Soliman, a first-year Electrical Engineering student at the University of Toronto exploring power, embedded computing, security, and responsible AI.',content)

def notes():
    content=hero('Field Notes','Notes from the moments between clicks.',f'{len(NOTES)} dated reflections on privacy, participation, responsible AI, and engineering judgment.')
    content+=section('Start here','Five notes to find your bearings.',curated('../',5),'Read a takeaway, then follow the decision behind it.','start-here')
    categories=sorted({n['category'] for n in NOTES})
    controls='<div class="filter-toolbar js-only" hidden><label class="form-field" for="note-search">Search notes<input type="search" id="note-search"></label><label class="form-field" for="note-category">Category<select id="note-category"><option value="all">All categories</option>'+''.join(f'<option>{e(c)}</option>' for c in categories)+'</select></label><label class="saved-filter"><input type="checkbox" id="note-saved"> Saved only</label><button class="button button-quiet" type="button" id="random-note">Surprise me</button></div>'
    cards=[]
    for n in NOTES:
        related='<ul>'+''.join(f'<li>{link(next(p["title"] for p in PROJECTS if p["id"]==id),"pages/initiatives.html#"+id,"../")}</li>' for id in n.get('relatedProjects',[]))+'</ul>'
        article=''.join(f'<p>{e(p)}</p>' for p in n['content'])
        if n.get('changedAfterward'): article+=f'<h4>What changed afterward?</h4><p>{e(n["changedAfterward"])}</p>'
        if n.get('relatedProjects'): article+='<h4>Related engineering work</h4>'+related
        cards.append(f'<article class="card reflection-card" id="{n["id"]}" data-note-category="{e(n["category"])}"><div class="card-topline"><p class="card-date"><time datetime="{n["date"]}">{dt(n["date"])}</time> · {e(n["readTime"])}</p>{save_button(n)}</div><p class="mono-label">{e(n["category"])}</p><h3>{e(n["title"])}</h3><p>{e(n["takeaway"])}</p><details class="note-detail"><summary>Read the full note</summary><div class="note-content">{article}</div></details>{tags(n["tags"])}<button class="button button-quiet js-only" type="button" data-read-note="{n["id"]}" hidden>Open reading view</button></article>')
    content+=section('Reflection archive','Newest first.',controls+f'<p id="note-result-count" role="status">{len(NOTES)} notes</p><div class="reflection-grid">'+''.join(cards)+'</div><p id="note-empty" class="empty-state" hidden>No notes match. Try another category or a broader search.</p>',id='archive')
    page('pages/field-notes.html','notes','Field Notes — Signal & Self',f'{len(NOTES)} field notes on privacy, media literacy, responsible AI, accessibility, focus, and digital participation.',content,'collections')

def chart_table(period):
    return '<table><caption>'+e(period['summary'])+'</caption><thead><tr><th scope="col">Period</th><th scope="col">Hours</th></tr></thead><tbody>'+''.join(f'<tr><th scope="row">{e(p["label"])}</th><td>{p["value"]}</td></tr>' for p in period['points'])+'</tbody></table>'

def evidence():
    content=hero('Evidence & Progress','Evidence & Progress','A dated record of practice, with sources and limits attached. Personal self-assessments are prompts for reflection, not certifications.')
    content+=section('Practice compass','Four habits, with evidence.',practice('../'),'Qualitative bands first. Earlier numeric scores remain inside each methodology disclosure.','practice')
    stats='<div class="card-grid">'+''.join(f'<article class="card"><p class="mono-label">{e(s["period"])}</p><h3>{s["value"]}{e(s["suffix"])} · {e(s["label"])}</h3><p>{e(s["description"])}</p><p>Historical goal: {s["goal"]}. {e(s["trend"])}</p></article>' for s in D['stats'])+'</div>'
    content+=section('Historical record','July 2026 snapshot.',stats,'Values are retained from the original self-reported record. These are not live counters, independently audited totals, or counts of the current project library.','snapshot')
    periods=D['dashboard']['periods']
    controls='<div class="segmented-control js-only" hidden><button class="chip" aria-pressed="true" data-period="monthly" type="button">Monthly</button><button class="chip" aria-pressed="false" data-period="weekly" type="button">Weekly</button></div><p id="chart-summary" role="status">'+e(periods['monthly']['summary'])+'</p><div id="learning-chart" class="chart-shell" aria-hidden="true"></div>'
    content+=section('Historical learning log','Consistency has a shape.',f'<div class="panel">{controls}<div id="chart-data">{chart_table(periods["monthly"])}</div><details class="no-js-period"><summary>Weekly data</summary>{chart_table(periods["weekly"])}</details></div>','The monthly and weekly logs have different aggregation windows; do not add them together.','momentum')
    habits='<div class="panel habit-list">'+''.join(f'<div class="habit-item"><strong>{e(h["label"])}</strong><p>{e(h["frequency"])} · {h["progress"]}% · {e(h["status"])}</p></div>' for h in D['habits'])+'</div>'
    content+=section('July 2026 snapshot','Small actions, repeated on purpose.',habits,'Historical self-reported habit assessments; not current streaks.')
    adoption=D['dashboard']['digitalAdoption']; year=adoption['maxYear']
    rows=''.join(f'<tr><th scope="row">{e(label)}</th><td data-adoption-value="{code}">{adoption["series"][code].get(str(year),"Not available")}%</td></tr>' for code,label in REGIONS.items())
    map_html=f'<div class="panel"><p>{e(adoption["intro"])}</p><div class="adoption-map" aria-hidden="true"><img src="../assets/images/digital-adoption-map.webp" width="7001" height="4001" loading="lazy" alt=""><div id="map-markers"></div></div><div class="js-only" hidden><label for="adoption-year">Compare a year: <output id="adoption-year-label">{year}</output></label><input class="map-slider" id="adoption-year" type="range" min="{adoption["minYear"]}" max="{year}" value="{year}" aria-describedby="adoption-announcement"></div><p id="adoption-announcement" role="status">Selected year {year}. Regional values follow in the table.</p><table><caption>Regional internet use · <span id="adoption-table-year">{year}</span></caption><thead><tr><th scope="col">Region</th><th scope="col">Population using the internet</th></tr></thead><tbody>{rows}</tbody></table><p>{e(adoption["dotScaleLabel"])}</p><p>{e(adoption["sourceNote"])}</p>'+''.join(link(s['label'],s['url'],cls='source-link') for s in adoption['sourceLinks'])+'</div>'
    content+=section('Context & Sources','Access did not arrive everywhere at once.',map_html,'A historical regional dataset retained from the fieldbook. Missing years are explicitly marked.','digital-adoption')
    content+=section('Global context','The stakes extend beyond one portfolio.','<div class="card-grid two-up">'+''.join(f'<article class="card"><p class="mono-label">{e(s["sourceLabel"])} · {e(s["sourceDate"])}</p><h3>{e(s["value"])} {e(s["title"])}</h3><p>{e(s["description"])}</p>{link("Read the source",s["url"],cls="button button-quiet")}</article>' for s in D['dashboard']['globalStats'])+'</div>',id='global-context')
    content+=section('Go deeper','Trusted starting points.','<div class="panel">'+''.join(f'<a class="resource-link" href="{e(s["url"])}"><span><strong>{e(s["title"])}</strong>{e(s["description"])}</span></a>' for s in D['dashboard']['learnMore'])+'</div>')
    page('pages/insights.html','insights','Evidence & Progress — Signal & Self','Dated evidence for Verify, Protect, Build, and Reflect, plus the July 2026 learning snapshot and sourced global context.',content,'evidence')

def journey():
    content=hero('Journey · historical record','Growth, with the path left visible.','A dated log of changes, lessons, and contributions. Entries describe their own moment in time.')
    controls='<div class="button-row js-only" hidden><button class="button button-quiet" type="button" id="download-journey">Download the log ↓</button><button class="button button-quiet" type="button" id="print-journey">Print this page</button></div><label class="form-field js-only" hidden for="journey-category">Filter by category<select id="journey-category"><option value="all">All categories</option>'+''.join(f'<option>{e(c)}</option>' for c in sorted({u['category'] for u in UPDATES}))+'</select></label>'
    timeline='<div class="timeline">'+''.join(f'<article class="timeline-item" id="{u["id"]}" data-journey-category="{e(u["category"])}"><time class="timeline-date" datetime="{u["date"]}">{dt(u["date"])}</time><div class="timeline-content"><p class="mono-label">{e(u["category"])}</p><h3>{e(u["title"])}</h3><p>{e(u["why"])}</p></div></article>' for u in UPDATES)+'</div>'
    content+=section('Journey log','Change, with context attached.',controls+f'<p id="journey-count" role="status">{len(UPDATES)} records</p>'+timeline)
    page('pages/journey.html','journey','Journey — Signal & Self',f'A historical journey log of {len(UPDATES)} updates showing how Signal & Self grew through projects, reflections, and contributions.',content,'collections')

def privacy():
    content=hero('Privacy & Data','Small data. Clear purpose. Real control.','Every project and field note is public. Sign-in is optional, and aggregate analytics run independently of it.')
    boundaries=[('Anonymous aggregate analytics','Cloudflare Web Analytics measures aggregate visits, page views, paths, referrals, devices, countries, browsers, operating systems, and performance on the production site. It works for visitors who never sign in. The site adds no analytics cookies.','Production only'),('Device-local personalization','Theme, audience, optional name and goal, and saved items remain in localStorage on this device. Settings let you reset preferences and clear saved items. These values are never forwarded to Cloudflare.','Visitor controlled'),('Session-only Google identity','Google Identity Services loads only when you deliberately open Sign in. The site ignores the email claim, discards the ID token, and retains only display name, profile image, and expiry in sessionStorage. Sign-out clears this session viewer data.','Optional'),('Persistent named viewer tracking','Not implemented. There is no database of visitors, permanent site account, account history, private content, cloud synchronization, or named analytics. Google profile data and stable Google identifiers are never attached to Cloudflare analytics.','No backend')]
    content+=section('Four distinct boundaries','What happens to each kind of data.','<div class="card-grid two-up">'+''.join(f'<article class="card"><p class="mono-label">{e(c)}</p><h3>{e(a)}</h3><p>{e(b)}</p></article>' for a,b,c in boundaries)+'</div>')
    content+=section('External requests','Know when another service is contacted.','<div class="panel"><p>GitHub Pages serves these public files. Typefaces are served with the site; opening a page does not contact Google Fonts. Cloudflare’s beacon is loaded only on mini34.github.io, never in local previews. Blocking a font, analytics, or identity request does not gate the portfolio.</p><p>Opening the account panel contacts Google to load its sign-in interface. Choosing an account is a further action. Google receives the requests needed for that interface; session personalization here does not provide authentication for private content.</p><p>A profile image may be requested from Google after sign-in. The image request uses a no-referrer policy. External links navigate in the same tab unless you choose otherwise.</p><p>Cloudflare analytics use their standard aggregate beacon configuration. No visitor identity, local name, goal, saved-item list, or audience is sent as custom analytics data.</p></div>')
    content+=section('Your controls','Choose how personal this visit feels.','<div class="button-row js-only" hidden><button class="button button-primary" type="button" data-open-personalize>Open Settings</button><button class="button button-quiet" type="button" data-open-account>Review sign-in</button></div><p>Clearing browser storage also resets local settings and saved items. If storage is blocked, the public content remains readable and preferences can be used temporarily on the current page.</p>'+link('Inspect the source','https://github.com/Mini34/signal-and-self',cls='button button-quiet'))
    page('pages/privacy.html','privacy','Privacy & Data — Signal & Self','How Signal & Self separates anonymous aggregate analytics, device-local preferences, and optional session-only Google identity. No persistent named visitor tracking.',content)

def case_studies():
    for p in ENGINEERING:
        badge=p.get('statusLabel','Completed · Tested')
        content=hero(p['domain'],p['title'],p['problem'],f'<p class="status-badge" data-status="{p["status"]}">{badge} · {p["year"]}</p>')
        if p.get('image'):
            content+=f'<figure class="case-photo site-shell"><img src="../{p["image"]}" width="{p["imageWidth"]}" height="{p["imageHeight"]}" alt="{e(p["imageAlt"])}" loading="lazy"><figcaption>Component callouts identify visible parts, not electrical terminals. {link("Original photograph",p["imageOriginalSource"])} · {link("Annotation review",p["imageReviewSource"])}.</figcaption></figure>'
        headings=[('Context','impact'),('Design problem','problem'),('Approach','approach'),('Validation','evidence'),('Result','result'),('Limitations','limitations'),('What I would improve next','nextStep')]
        content+='<div class="case-article site-shell">'+''.join(f'<section><h2>{label}</h2><p>{e(p[key])}</p></section>' for label,key in headings)
        if p.get('role'): content+=f'<section><h2>My role</h2><p>{e(p["role"])}</p></section>'
        content+=f'<section><h2>Repository & documentation</h2><p>Documentation checked {dt(p["evidenceCheckedAt"])}. The summaries describe the repository’s validation approach; they do not claim new hardware or deployment results.</p><div class="button-row">{link("Repository",p["repository"],cls="button button-primary")}{link("README",p["documentation"],cls="button button-quiet")}</div></section><section><h2>Related field notes</h2>{note_links(p["relatedNotes"],"../")}</section>{link("All engineering work","pages/initiatives.html","../","button button-quiet")}</div>'
        schema={'@type':'SoftwareSourceCode','name':p['title'],'description':p['built'],'codeRepository':p['repository'],'programmingLanguage':p.get('programmingLanguage','Python'),'author':{'@id':BASE+'#mina'},'url':BASE+p['caseStudyPath']}
        page(p['caseStudyPath'],'case-study',p['title']+' — Signal & Self',p['built'],content,schema=schema)

def generate():
    home(); work(); about(); notes(); evidence(); journey(); privacy(); case_studies()
    page('404.html','not-found','Page not found — Signal & Self','Return to Mina Soliman’s engineering work, field notes, or homepage.',hero('404','This page is off the map.','The link may have moved. Your next useful path is still here.',f'<div class="button-row">{link("Home",BASE,cls="button button-primary")}{link("Engineering work",BASE+"pages/initiatives.html",cls="button button-quiet")}</div>'))
    # A project Pages 404 can be served at arbitrary path depth; asset URLs must be absolute.
    for path in ('assets/','index.html','pages/'):
        OUTPUT['404.html']=OUTPUT['404.html'].replace(f'="{path}',f'="/signal-and-self/{path}')
    OUTPUT['404.html']=OUTPUT['404.html'].replace('data-root="."','data-root="/signal-and-self/"')
    search=[]
    for n in NOTES:
        search.append({'title':n['title'],'type':'Field note','terms':' '.join([n['title'],n['category'],*n['tags'],*n['content']]),'href':'pages/field-notes.html#'+n['id']})
    for p in PROJECTS:
        search.append({'title':p['title'],'type':'Work','terms':' '.join([p['title'],p['description'],*p['skills']]),'href':p.get('caseStudyPath','pages/initiatives.html#'+p['id'])})
    for a in D['categories']:
        search.append({'title':a['title'],'type':'Practice area','terms':a['description']+' '+a['focus'],'href':'pages/profile.html#framework'})
    OUTPUT['assets/data/search.json']=json.dumps(search,ensure_ascii=False,separators=(',',':'))+'\n'
    OUTPUT['assets/data/site.json']=json.dumps({k:D[k] for k in ('site','personalization')},ensure_ascii=False,separators=(',',':'))+'\n'
    OUTPUT['assets/data/evidence.json']=json.dumps({'periods':D['dashboard']['periods'],'adoption':D['dashboard']['digitalAdoption'],'regions':REGIONS},ensure_ascii=False,separators=(',',':'))+'\n'
    paths=[path for path in OUTPUT if path.endswith('.html') and path!='404.html']
    OUTPUT['sitemap.xml']='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{BASE+(path if path!="index.html" else "")}</loc><lastmod>{D["site"]["lastUpdated"]}</lastmod></url>' for path in paths)+'</urlset>\n'
    OUTPUT['robots.txt']=f'User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n'
    OUTPUT['assets/data/collection-counts.json']=json.dumps({'projects':len(PROJECTS),'featuredProjects':len(FEATURED),'engineeringProjects':len(ENGINEERING),'notes':len(NOTES),'updates':len(UPDATES)},indent=2)+'\n'
    return OUTPUT

def main():
    parser=argparse.ArgumentParser(description=__doc__); parser.add_argument('--check',action='store_true'); args=parser.parse_args()
    changed=[]
    for path,content in generate().items():
        target=ROOT/path
        if not target.is_file() or target.read_text(encoding='utf-8')!=content:
            changed.append(path)
            if not args.check:
                target.parent.mkdir(parents=True,exist_ok=True); target.write_text(content,encoding='utf-8',newline='\n')
    if args.check and changed:
        print('Generated content differs: '+', '.join(changed)); return 1
    print(f'Generated content {"verified" if args.check else "updated"}: {len(OUTPUT)} files; {len(PROJECTS)} initiatives, {len(NOTES)} notes, {len(UPDATES)} updates.'); return 0

if __name__=='__main__':
    raise SystemExit(main())
