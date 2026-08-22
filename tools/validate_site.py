"""Validate Signal & Self's static pages and structured records."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXPECTED_PAGES = [
    PROJECT_ROOT / "index.html",
    PROJECT_ROOT / "pages" / "profile.html",
    PROJECT_ROOT / "pages" / "insights.html",
    PROJECT_ROOT / "pages" / "field-notes.html",
    PROJECT_ROOT / "pages" / "initiatives.html",
    PROJECT_ROOT / "pages" / "journey.html",
]


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.references: list[str] = []
        self.has_title = False
        self._in_title = False

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

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title and data.strip():
            self.has_title = True


def local_target(page: Path, reference: str) -> Path | None:
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
    for reference in parser.references:
        target = local_target(page, reference)
        if target is not None and not target.exists():
            errors.append(f"Broken reference in {page.relative_to(PROJECT_ROOT)}: {reference}")
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
    return [
        f"Analytics loader is missing required configuration: {fragment}"
        for fragment in required_fragments
        if fragment not in analytics
    ]


def validate_records() -> list[str]:
    errors: list[str] = []
    records_path = PROJECT_ROOT / "assets" / "data" / "citizenship-records.json"
    try:
        records = json.loads(records_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        return [f"Records could not be loaded: {error}"]

    expected_minimums = {"reflections": 20, "projects": 10, "updates": 16}
    for section, minimum in expected_minimums.items():
        entries = records.get(section, [])
        if len(entries) < minimum:
            errors.append(f"{section} has {len(entries)} entries; expected at least {minimum}")
        ids = [entry.get("id") for entry in entries]
        if None in ids or len(ids) != len(set(ids)):
            errors.append(f"{section} contains a missing or duplicate ID")
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
    errors.extend(validate_theme_contrast())
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
