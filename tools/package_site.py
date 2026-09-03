"""Package only public website files for GitHub Pages (no test tooling or reports)."""
from pathlib import Path
from shutil import copy2, copytree

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / '.site-dist'

def main():
    if DEST.exists():
        raise SystemExit('Output already exists. Choose a clean checkout to package the site.')
    DEST.mkdir()
    for name in ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '.nojekyll']:
        copy2(ROOT / name, DEST / name)
    for name in ['pages', 'assets']:
        copytree(ROOT / name, DEST / name)
    print('Public site packaged in .site-dist; development tooling and reports excluded.')

if __name__ == '__main__':
    main()
