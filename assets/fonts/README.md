# Locally served typefaces

The existing DM Mono, Manrope, and Newsreader families are served locally in WOFF2 containers. Normal site visits make no Google Fonts request. The same system fallbacks and `font-display: swap` remain in place.

Sources were downloaded September 3, 2026 from the official Google Fonts CSS response preserved in `source-google-fonts.css`. Rules appear in that file in the same family/weight order as `assets/styles/fonts.css`. Latin, extended Latin, combining marks, punctuation, arrows, and common symbols are retained with their original outlines and standard layout features. Unused stylistic alternates are removed. Other scripts use the system fallback through the explicit `unicode-range`. The nine source TTF files totalled 789,052 bytes; final WOFF2 sizes are recorded in the UX audit report.

The included SIL Open Font License files came from:

- https://github.com/google/fonts/blob/main/ofl/dmmono/OFL.txt
- https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt
- https://github.com/google/fonts/blob/main/ofl/newsreader/OFL.txt

To reproduce the container conversion, download each documented source URL into `tools/qa/evidence/fonts` with names such as `dm-mono-400.ttf`, `manrope-800.ttf`, and `newsreader-600.ttf`. Install the development-only converter with `python -m pip install --target tools/qa/font-tools 'fonttools[woff]==4.64.0'`, then run `python tools/qa/compress-fonts.py`. FontTools 4.64.0, Brotli 1.2.0, and Zopfli 0.4.3 were used for this conversion. These tools and source downloads are excluded from the public website and are not required to build it.
