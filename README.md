# Signal & Self

[![Live site](https://img.shields.io/badge/Live_site-Visit-3155e8)](https://mini34.github.io/signal-and-self/)
[![Pages deployment](https://github.com/Mini34/signal-and-self/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Mini34/signal-and-self/actions/workflows/deploy-pages.yml)

Signal & Self is Mina Soliman's engineering portfolio and digital citizenship fieldbook. Tested engineering work leads into responsible-technology habits, reflection, and a dated journey log.

**Live site:** [mini34.github.io/signal-and-self](https://mini34.github.io/signal-and-self/)

## What is inside

- A personal story and six-part digital citizenship framework
- An interactive signals dashboard with habit progress and global context
- 20 field notes, with a curated starting point, search, filters, and saved items
- 15 initiatives, including 5 engineering projects with dedicated case studies and 4 featured projects
- 20 journey records that can be filtered, printed, or downloaded
- Device-local personalization, themes, saved items, and a global search palette
- Optional Google sign-in for session-only viewer personalization
- A plain-language privacy and data-control map
- Responsive layouts, keyboard navigation, reduced-motion support, and accessible controls

## Engineering highlights

- Semantic, dependency-free HTML, CSS, and JavaScript
- Data-driven reflections, projects, metrics, search, and filtering
- Responsive navigation and three visitor-selectable themes
- Device-local preferences plus privacy-first, cookie-free traffic analytics
- Consent-aware Google Identity Services loading with no stored ID token
- Automated content, structure, and internal-link validation before deployment

## Project structure

```text
signal-and-self/
├── index.html                  # Portfolio overview
├── pages/                      # Focused website sections
│   ├── profile.html            # Story, values, and framework
│   ├── insights.html           # Metrics, charts, habits, and context
│   ├── field-notes.html        # Reflection archive
│   ├── initiatives.html        # Project library
│   ├── journey.html            # Changelog and milestones
│   └── privacy.html            # Data boundaries and visitor controls
├── assets/
│   ├── data/                   # Structured portfolio records
│   ├── images/                 # Maps, favicon, and social artwork
│   ├── scripts/                # Shared interaction and rendering logic
│   └── styles/                 # Shared visual system
├── tools/serve_site.py         # Dependency-free local preview
└── .github/workflows/          # GitHub Pages deployment
```

## Preview locally

Python 3 is the only requirement.

```powershell
python tools/serve_site.py
```

Then open `http://127.0.0.1:8000`.

After editing `assets/data/citizenship-records.json` or page templates in `tools/build_site.py`, run:

```powershell
python tools/build_site.py
python tools/validate_site.py
```

The small, dependency-free Python generator produces checked-in HTML, metadata, counts, sitemap, and page-specific optional payloads. All principal content and native mobile navigation work without JavaScript. CI rejects generated files that diverge from the authoring source. The existing page URLs remain valid.

The shared controller loads no records on an ordinary visit. Settings fetch their small payload only when opened; global search loads its index on demand. Work, notes, and journey filtering use the static page content. Only Evidence loads chart/map behavior and its own dataset. No runtime npm dependency is shipped.

Development-only browser QA uses pinned Playwright, axe, and Lighthouse dependencies:

```powershell
pnpm --dir tools/qa install --frozen-lockfile
node --test tools/qa/privacy.test.mjs
node tools/qa/interactions.mjs
node tools/qa/audit.mjs final
```

Start the local server first. The audit scripts use installed Google Chrome by default; set `QA_BROWSER=chromium` after `pnpm --dir tools/qa exec playwright install chromium` for CI. Run performance audits separately from other browser tests to avoid CPU contention. Screenshots and measured results live in `docs/qa/`; methodology and limitations are in `docs/ux-audit-baseline.md` and `docs/ux-audit-results.md`.

## Analytics, data, and privacy

The site uses Cloudflare Web Analytics to measure page views, visits, referral sources, countries, devices, and page-load performance. Cloudflare states that Web Analytics does not collect or use visitors' personal data, and the site does not add analytics cookies. Analytics collection began on August 21, 2026; earlier visits cannot be reconstructed. Cloudflare currently makes the previous six months available in its dashboard.

To review the private dashboard, sign in to [Cloudflare](https://dash.cloudflare.com/) and open **Analytics → Web analytics → mini34.github.io**.

The public portfolio content is stored in `assets/data/citizenship-records.json`. Visitor personalization, theme choices, and saved items stay in the visitor's browser through local storage and are not included in analytics.

Google sign-in is optional and does not gate any content. The Google Identity Services library loads only after a visitor deliberately opens Sign in, including from mobile Account / Settings. It does not load merely from opening Settings. The site ignores the returned email claim, keeps the visitor's display name, profile image, and expiry in session storage, and discards the ID token. Sign-out clears that viewer state. Because there is no authentication backend, this state is used only for presentation and never for authorization or private data. No permanent account, named viewer log, or cloud sync is created. Aggregate Cloudflare analytics run independently for signed-out visitors; neither Google identity nor local preferences are sent to that beacon.

### Google sign-in configuration

The web OAuth client ID is public configuration and belongs in `assets/scripts/auth-config.js`; no client secret belongs in this repository. The Google web client must authorize `https://mini34.github.io` as a JavaScript origin. Add localhost origins separately when testing the real Google flow during development.

The OAuth branding should use the public homepage and `pages/privacy.html` links. Sign-in requests only the default OpenID, profile, and email scopes; no additional Google API access is needed.

## Deployment

Pushes to the default branch deploy the static site through GitHub Pages.
