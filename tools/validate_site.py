"""Validate Signal & Self's static pages and structured records."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

import build_site


PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXPECTED_PAGES = [
    PROJECT_ROOT / "index.html",
    PROJECT_ROOT / "pages" / "profile.html",
    PROJECT_ROOT / "pages" / "insights.html",
    PROJECT_ROOT / "pages" / "field-notes.html",
    PROJECT_ROOT / "pages" / "initiatives.html",
    PROJECT_ROOT / "pages" / "journey.html",
    PROJECT_ROOT / "pages" / "privacy.html",
]
EXPECTED_PAGES += [PROJECT_ROOT / '404.html'] + sorted((PROJECT_ROOT / 'pages').glob('project-*.html'))
FEATURED_REPOSITORIES = {
    "https://github.com/Mini34/trailhead-claude-support-api",
    "https://github.com/Mini34/power-quality-lab",
    "https://github.com/Mini34/microgrid-controller-sim",
    "https://github.com/Mini34/can-bus-anomaly-lab",
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.references: list[str] = []
        self.has_title = False
        self._in_title = False
        self.titles: list[str] = []
        self.h1_count = 0
        self.metadata: dict[str, list[str]] = {}
        self.canonicals: list[str] = []
        self.unsafe_links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if attributes.get("id"):
            self.ids.append(str(attributes["id"]))
        if tag in {"a", "link"} and attributes.get("href"):
            self.references.append(str(attributes["href"]))
        if tag in {"img", "script"} and attributes.get("src"):
            self.references.append(str(attributes["src"]))
        if tag == "title":
            self._in_title = True
            self.titles.append('')
        if tag == 'h1':
            self.h1_count += 1
        if tag == 'meta':
            key = attributes.get('name') or attributes.get('property')
            if key:
                self.metadata.setdefault(key, []).append(attributes.get('content', ''))
        if tag == 'link' and attributes.get('rel') == 'canonical':
            self.canonicals.append(attributes.get('href', ''))
        if tag == 'a' and attributes.get('target') == '_blank':
            if not {'noopener', 'noreferrer'} & set(attributes.get('rel', '').split()):
                self.unsafe_links.append(attributes.get('href', ''))

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title and data.strip():
            self.has_title = True
            self.titles[-1] += data


def local_target(page: Path, reference: str) -> Path | None:
    if reference.startswith(build_site.BASE):
        reference = reference.removeprefix(build_site.BASE) or 'index.html'
        page = PROJECT_ROOT / 'index.html'
    if reference.startswith('/signal-and-self/'):
        reference = reference.removeprefix('/signal-and-self/') or 'index.html'
        page = PROJECT_ROOT / 'index.html'
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc or reference.startswith(("#", "mailto:")):
        return None
    clean_path = unquote(parsed.path)
    if not clean_path:
        return None
    return (page.parent / clean_path).resolve()


def validate_page(page: Path) -> list[str]:
    errors: list[str] = []
    if not page.is_file():
        return [f"Missing page: {page.relative_to(PROJECT_ROOT)}"]
    parser = PageParser()
    parser.feed(page.read_text(encoding="utf-8"))
    if not parser.has_title:
        errors.append(f"Missing title: {page.relative_to(PROJECT_ROOT)}")
    if len(parser.titles) != 1 or parser.h1_count != 1:
        errors.append(f'Expected one title and H1: {page.relative_to(PROJECT_ROOT)}')
    for key in ('description', 'og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'theme-color'):
        if len(parser.metadata.get(key, [])) != 1 or not parser.metadata[key][0].strip():
            errors.append(f'Missing or repeated {key}: {page.relative_to(PROJECT_ROOT)}')
    if len(parser.canonicals) != 1 or not parser.canonicals[0].startswith(build_site.BASE):
        errors.append(f'Missing or invalid canonical: {page.relative_to(PROJECT_ROOT)}')
    elif parser.metadata.get('og:url') != parser.canonicals:
        errors.append(f'Canonical and og:url diverge: {page.relative_to(PROJECT_ROOT)}')
    errors.extend(f'Unsafe new-tab link: {link}' for link in parser.unsafe_links)
    duplicate_ids = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
    if duplicate_ids:
        errors.append(f"Duplicate IDs in {page.relative_to(PROJECT_ROOT)}: {', '.join(duplicate_ids)}")
    analytics_references = [
        reference
        for reference in parser.references
        if urlsplit(reference).path.endswith("assets/scripts/analytics.js")
    ]
    if len(analytics_references) != 1:
        errors.append(
            f"Expected one analytics loader in {page.relative_to(PROJECT_ROOT)}; "
            f"found {len(analytics_references)}"
        )
    for auth_script in ("auth-config.js", "auth.js"):
        auth_references = [
            reference
            for reference in parser.references
            if urlsplit(reference).path.endswith(f"assets/scripts/{auth_script}")
        ]
        if len(auth_references) != 1:
            errors.append(
                f"Expected one {auth_script} loader in {page.relative_to(PROJECT_ROOT)}; "
                f"found {len(auth_references)}"
            )
    for reference in parser.references:
        target = local_target(page, reference)
        if target is not None and not target.exists():
            errors.append(f"Broken reference in {page.relative_to(PROJECT_ROOT)}: {reference}")
        parsed = urlsplit(reference)
        if parsed.fragment and (reference.startswith('#') or target is not None):
            anchor_page = page if reference.startswith('#') else target
            if anchor_page and anchor_page.suffix == '.html' and anchor_page.exists():
                target_parser = PageParser()
                target_parser.feed(anchor_page.read_text(encoding='utf-8'))
                if unquote(parsed.fragment) not in target_parser.ids:
                    errors.append(f'Broken anchor in {page.relative_to(PROJECT_ROOT)}: {reference}')
    return errors


def validate_analytics() -> list[str]:
    analytics_path = PROJECT_ROOT / "assets" / "scripts" / "analytics.js"
    if not analytics_path.is_file():
        return ["Missing analytics loader: assets/scripts/analytics.js"]

    analytics = analytics_path.read_text(encoding="utf-8")
    required_fragments = [
        'window.location.hostname !== "mini34.github.io"',
        'https://static.cloudflareinsights.com/beacon.min.js',
        "dataset.cfBeacon",
    ]
    errors = [
        f"Analytics loader is missing required configuration: {fragment}"
        for fragment in required_fragments
        if fragment not in analytics
    ]
    for forbidden in ('localStorage', 'sessionStorage', 'google', 'preferences', 'viewer', 'location.search', 'location.hash'):
        if forbidden in analytics:
            errors.append(f'Analytics must not read personalization or identity: {forbidden}')
    return errors


def validate_auth() -> list[str]:
    errors: list[str] = []
    config_path = PROJECT_ROOT / "assets" / "scripts" / "auth-config.js"
    auth_path = PROJECT_ROOT / "assets" / "scripts" / "auth.js"
    if not config_path.is_file():
        errors.append("Missing auth configuration: assets/scripts/auth-config.js")
    else:
        config = config_path.read_text(encoding="utf-8")
        client_id = re.search(
            r'googleClientId:\s*"([0-9]+-[a-z0-9-]+\.apps\.googleusercontent\.com)"',
            config,
        )
        if not client_id:
            errors.append("Auth configuration is missing a valid Google web client ID")

    if not auth_path.is_file():
        return errors + ["Missing auth controller: assets/scripts/auth.js"]

    auth = auth_path.read_text(encoding="utf-8")
    required_fragments = [
        '"https://accounts.google.com/gsi/client"',
        "claims.aud === clientId()",
        "sessionStorage.setItem(sessionKey",
        "sessionStorage.removeItem(sessionKey)",
        "use_fedcm_for_button: true",
    ]
    errors.extend(
        f"Auth controller is missing required behavior: {fragment}"
        for fragment in required_fragments
        if fragment not in auth
    )
    if "localStorage.setItem(sessionKey" in auth:
        errors.append("Google viewer identity must remain session-only")
    if 'window.addEventListener(authOpenEvent, initializeGoogle)' not in auth:
        errors.append('Google initialization must remain interaction-triggered')
    if re.search(r'claims\.(email|sub)\s*[,}]', auth):
        errors.append('Do not retain email or stable subject identifiers')
    privacy = (PROJECT_ROOT / 'pages/privacy.html').read_text(encoding='utf-8')
    for statement in ('Anonymous aggregate analytics', 'Device-local personalization', 'Session-only Google identity', 'Persistent named viewer tracking', 'visitors who never sign in', 'Sign-out clears'):
        if statement not in privacy:
            errors.append(f'Privacy disclosure missing: {statement}')
    return errors


def validate_records() -> list[str]:
    errors: list[str] = []
    records_path = PROJECT_ROOT / "assets" / "data" / "citizenship-records.json"
    try:
        records = json.loads(records_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        return [f"Records could not be loaded: {error}"]

    expected_minimums = {"reflections": 20, "projects": 14, "updates": 18}
    for section, minimum in expected_minimums.items():
        entries = records.get(section, [])
        if len(entries) < minimum:
            errors.append(f"{section} has {len(entries)} entries; expected at least {minimum}")
        ids = [entry.get("id") for entry in entries]
        if None in ids or len(ids) != len(set(ids)):
            errors.append(f"{section} contains a missing or duplicate ID")

    projects = records.get("projects", [])
    project_links = {project.get("link") for project in projects}
    missing_repositories = sorted(FEATURED_REPOSITORIES - project_links)
    if missing_repositories:
        errors.append(
            "projects is missing featured repositories: "
            + ", ".join(missing_repositories)
        )
    for project in projects:
        progress = project.get("progress")
        if progress is not None and (
            not isinstance(progress, int) or not 0 <= progress <= 100
        ):
            errors.append(
                f"project {project.get('id', '<missing>')} has invalid progress"
            )
        if project.get("link") in FEATURED_REPOSITORIES and (
            project.get("status") != "Completed" or progress != 100
        ):
            errors.append(
                f"featured repository {project.get('link')} must be completed"
            )
        if project.get('type') not in build_site.TYPES:
            errors.append(f'Project taxonomy missing: {project.get("id")}')
        if project.get('link', '').split('#')[0] in {'about.html','reflections.html','timeline.html','projects.html','dashboard.html'}:
            errors.append(f'Legacy project link: {project.get("id")}')
        if project.get('type') == 'engineering-build':
            for field in ('problem','built','evidence','limitations','nextStep','repository','caseStudyPath','sourceBlob'):
                if not project.get(field):
                    errors.append(f'Engineering evidence missing {field}: {project.get("id")}')
    featured=[p for p in projects if p.get('type')=='engineering-build' and p.get('featured')]
    if len(featured)!=4 or len({p.get('featuredOrder') for p in featured}) != 4:
        errors.append('Featured engineering order must be unique')
    if featured and sorted(featured,key=lambda p:p.get('featuredOrder',99))[0]['id']!='project-pico-2w-ee-lab-tool':
        errors.append('Pico 2 W must lead featured work')
    if any(p['id']=='project-trailhead-support-api' for p in featured):
        errors.append('Trailhead belongs in the full library, not featured work')
    if 'incoming' in json.dumps(records['profile']).lower() or 'beginning in September 2026' in json.dumps(records['profile']):
        errors.append('Current profile contains stale incoming language')
    for stat in records['stats']:
        if 'July 2026' not in stat.get('period', ''):
            errors.append(f'Metric requires its historical window: {stat["id"]}')
    if records['now'].get('nextReview', '9999-01-01') < records['site']['lastUpdated']:
        errors.append('Next review is past due')

    site_date = records.get("site", {}).get("lastUpdated")
    latest_update = max(
        (update.get("date", "") for update in records.get("updates", [])),
        default="",
    )
    if not site_date or site_date != latest_update:
        errors.append("site.lastUpdated must match the newest update date")
    return errors


def validate_generated() -> list[str]:
    errors = []
    for path, expected in build_site.generate().items():
        actual = PROJECT_ROOT / path
        if not actual.is_file() or actual.read_text(encoding='utf-8') != expected:
            errors.append(f'Generated content/counts are stale: {path}; run tools/build_site.py')
    readme = (PROJECT_ROOT / 'README.md').read_text(encoding='utf-8')
    for count, label in [(len(build_site.PROJECTS),'initiatives'),(len(build_site.NOTES),'field notes'),(len(build_site.UPDATES),'journey records'),(len(build_site.FEATURED),'featured projects'),(len(build_site.ENGINEERING),'engineering projects')]:
        if f'{count} {label}' not in readme:
            errors.append(f'README count does not match authoring records: {label}')
    titles=[]
    for path in EXPECTED_PAGES:
        if path.is_file():
            p=PageParser(); p.feed(path.read_text(encoding='utf-8')); titles+=p.titles
    if len(titles)!=len(set(titles)):
        errors.append('Page titles must be unique')
    for css in (PROJECT_ROOT / 'assets/styles').glob('*.css'):
        for reference in re.findall(r'url\([\"\x27]?(.*?)[\"\x27]?\)', css.read_text(encoding='utf-8')):
            target=local_target(css, reference)
            if target is not None and not target.is_file():
                errors.append(f'Broken CSS asset in {css.name}: {reference}')
    return errors


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.removeprefix("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def contrast_ratio(foreground: str, background: str) -> float:
    def luminance(color: str) -> float:
        channels = []
        for channel in rgb(color):
            normalized = channel / 255
            channels.append(normalized / 12.92 if normalized <= 0.04045 else ((normalized + 0.055) / 1.055) ** 2.4)
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]

    lighter, darker = sorted((luminance(foreground), luminance(background)), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


def validate_theme_contrast() -> list[str]:
    css = (PROJECT_ROOT / "assets" / "styles" / "portfolio.css").read_text(encoding="utf-8")

    def variables_for(selector: str) -> dict[str, str]:
        match = re.search(rf"{re.escape(selector)}\s*\{{(?P<body>.*?)\}}", css, re.DOTALL)
        if not match:
            return {}
        return dict(re.findall(r"(--[\w-]+):\s*(#[0-9a-fA-F]{6})", match.group("body")))

    root = variables_for(":root")
    themes = {
        "signal": root,
        "midnight": root | variables_for('[data-theme="midnight"]'),
        "quiet": root | variables_for('[data-theme="quiet"]'),
    }
    pairs = [
        ("--ink", "--surface-solid", "surface text"),
        ("--ink", "--paper", "page text"),
        ("--on-blue", "--blue", "blue accent text"),
        ("--on-dark", "--dark-canvas", "dark section text"),
        ("--on-accent", "--lime", "lime accent text"),
        ("--on-coral", "--coral", "coral accent text"),
        ("--positive", "--surface-solid", "completed status text"),
        ("--planned", "--surface-solid", "planned status text"),
    ]
    errors: list[str] = []
    for theme_name, variables in themes.items():
        for foreground, background, label in pairs:
            ratio = contrast_ratio(variables[foreground], variables[background])
            if ratio < 4.5:
                errors.append(f"{theme_name} theme {label} contrast is {ratio:.2f}:1; expected at least 4.5:1")
    return errors


def main() -> int:
    errors = validate_records()
    errors.extend(validate_analytics())
    errors.extend(validate_auth())
    errors.extend(validate_theme_contrast())
    errors.extend(validate_generated())
    for page in EXPECTED_PAGES:
        errors.extend(validate_page(page))
    if errors:
        print("Signal & Self validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(
        "Signal & Self validation passed: pages, structured records, theme "
        "contrast, and local references are valid."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
