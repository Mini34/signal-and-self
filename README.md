# Signal & Self

[![Live site](https://img.shields.io/badge/Live_site-Visit-3155e8)](https://mini34.github.io/signal-and-self/)
[![Pages deployment](https://github.com/Mini34/signal-and-self/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Mini34/signal-and-self/actions/workflows/deploy-pages.yml)

Signal & Self is Mina Soliman's living digital citizenship fieldbook. It connects responsible-technology habits with personal reflection, practical initiatives, measurable learning signals, and a transparent journey log.

**Live site:** [mini34.github.io/signal-and-self](https://mini34.github.io/signal-and-self/)

## What is inside

- A personal story and six-part digital citizenship framework
- An interactive signals dashboard with habit progress and global context
- Twenty searchable and filterable field notes
- Fourteen completed, active, and planned initiatives, including four tested Python repositories
- An eighteen-record timeline that can be filtered, printed, or downloaded
- Device-local personalization, themes, saved items, and a global search palette
- Responsive layouts, keyboard navigation, reduced-motion support, and accessible controls

## Engineering highlights

- Semantic, dependency-free HTML, CSS, and JavaScript
- Data-driven reflections, projects, metrics, search, and filtering
- Responsive navigation and three visitor-selectable themes
- Device-local preferences plus privacy-first, cookie-free traffic analytics
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
│   └── journey.html            # Changelog and milestones
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

Run `python tools/validate_site.py` for a quick content and local-link check.

## Analytics, data, and privacy

The site uses Cloudflare Web Analytics to measure page views, visits, referral sources, countries, devices, and page-load performance. Cloudflare states that Web Analytics does not collect or use visitors' personal data, and the site does not add analytics cookies. Analytics collection began on August 21, 2026; earlier visits cannot be reconstructed. Cloudflare currently makes the previous six months available in its dashboard.

To review the private dashboard, sign in to [Cloudflare](https://dash.cloudflare.com/) and open **Analytics → Web analytics → mini34.github.io**.

The public portfolio content is stored in `assets/data/citizenship-records.json`. Visitor personalization, theme choices, and saved items stay in the visitor's browser through local storage and are not included in analytics.

## Deployment

Pushes to the default branch deploy the static site through GitHub Pages.
