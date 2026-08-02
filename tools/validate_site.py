"""Validate Signal & Self's static pages and structured records."""

from __future__ import annotations

import json
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
    for reference in parser.references:
        target = local_target(page, reference)
        if target is not None and not target.exists():
            errors.append(f"Broken reference in {page.relative_to(PROJECT_ROOT)}: {reference}")
    return errors


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


def main() -> int:
    errors = validate_records()
    for page in EXPECTED_PAGES:
        errors.extend(validate_page(page))
    if errors:
        print("Signal & Self validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Signal & Self validation passed: 6 pages, 20 reflections, 10 initiatives, 16 journey records.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
