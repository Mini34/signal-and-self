# Signal & Self

Signal & Self is Mina Soliman's living digital citizenship fieldbook. It connects responsible-technology habits with personal reflection, practical initiatives, measurable learning signals, and a transparent journey log.

## What is inside

- A personal story and six-part digital citizenship framework
- An interactive signals dashboard with habit progress and global context
- Twenty searchable and filterable field notes
- Ten completed, active, and planned initiatives
- A sixteen-record timeline that can be filtered, printed, or downloaded
- Device-local personalization, themes, saved items, and a global search palette
- Responsive layouts, keyboard navigation, reduced-motion support, and accessible controls

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
py tools/serve_site.py
```

Then open `http://127.0.0.1:8000`.

Run `py tools/validate_site.py` for a quick content and local-link check.

## Data and privacy

The public portfolio content is stored in `assets/data/citizenship-records.json`. Visitor personalization, theme choices, and saved items stay in the visitor's browser through local storage; the site does not send or collect that information.

## Deployment

Pushes to the default branch deploy the static site through GitHub Pages.
