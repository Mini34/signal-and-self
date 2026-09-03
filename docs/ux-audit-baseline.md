# UX audit baseline — September 3, 2026

Baseline: `master` at `4fa77bd`, before the UX refresh. The audit brief supplied by the owner is dated September 3, 2026. Work is staged on `codex/ux-audit-priority-refresh` for a pull request; this report does not imply a production release.

## Method

Served the unchanged checkout with `python tools/serve_site.py`. Captured Chrome 152.0.7977.66 screenshots at 1440×900, 1024×768, 768×1024, 390×844, and 320×568. Ran Lighthouse 13.4.1 once per route and device profile, and axe 4.13.0 on all seven original routes. Capture began at 2026-09-03T19:33:29Z. Exact settings and retained diagnostics are in [audit.mjs](../tools/qa/audit.mjs) and [results.json](qa/baseline/results.json).

Lighthouse used simulated mobile throttling (150 ms RTT, 1638.4 Kbps, 4× CPU slowdown, 412×823 viewport), and desktop settings (40 ms RTT, 10240 Kbps, no CPU slowdown, 1350×940 viewport). Local previews deliberately exclude Cloudflare's production beacon and do not load Google Identity until account activation. These are single-run local laboratory results, not production field measurements. LCP values are milliseconds; CLS is unitless.

| Page | Mobile performance / accessibility / SEO | Mobile LCP | Mobile CLS | Desktop performance / accessibility / SEO | Desktop LCP | Desktop CLS |
|---|---|---:|---:|---|---:|---:|
| Home | 81 / 96 / 100 | 4338 | 0.0863 | 99 / 96 / 100 | 596 | 0.0638 |
| Work | 84 / 100 / 100 | 4127 | 0 | 99 / 100 / 100 | 1017 | 0.0101 |
| About | 83 / 100 / 100 | 4274 | 0.0407 | 96 / 100 / 100 | 996 | 0.0756 |
| Field Notes | 83 / 100 / 100 | 4286 | 0.0440 | 98 / 100 / 100 | 830 | 0.0718 |
| Evidence | 81 / 100 / 100 | 4720 | 0.0044 | 98 / 100 / 100 | 1090 | 0.0001 |
| Journey | 83 / 100 / 100 | 4269 | 0 | 97 / 100 / 100 | 992 | 0.0637 |
| Privacy | 83 / 100 / 100 | 4274 | 0.0308 | 98 / 100 / 100 | 827 | 0.0638 |

The full-page axe scan found contrast violations on all seven original pages and a prohibited ARIA attribute on Home. Before scanning, the harness exposed baseline reveal-animation content so the entire document could be checked. This explains why a separate Lighthouse pass could report 100 Accessibility while axe still found issues below the initial viewport. No baseline screen-reader or manual keyboard pass was recorded; the final implementation receives separate interaction checks.

## Screenshots

| Desktop, 1440×900 | Mobile, 390×844 |
|---|---|
| ![Original desktop homepage](qa/baseline/home-1440.png) | ![Original mobile homepage](qa/baseline/home-390.png) |

Additional captures: [1024](qa/baseline/home-1024.png), [768](qa/baseline/home-768.png), [320](qa/baseline/home-320.png).

## Baseline friction observed

The hero led with philosophy and personalization before owner/discipline and technical evidence. Navigation omitted the substantial Signals page. Current-state language still described an incoming student and Summer 2026. Collection counts diverged between metadata and records. All routes downloaded the same large record payload and shared behavior; essential collections depended on JavaScript rendering. Small-screen header utilities and motion competed with the primary reading path. These findings informed the refresh; the numerical scores alone did not determine the layout.
