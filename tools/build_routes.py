#!/usr/bin/env python3
"""Generate folder-based clean URLs for GitHub Pages."""
from pathlib import Path
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
GENERATED_MARKER = '<!-- generated clean route; edit root templates instead -->'

STATIC_ROUTES = {
    'work.html': ROOT / 'work' / 'index.html',
    'about.html': ROOT / 'about' / 'index.html',
    'connect.html': ROOT / 'connect' / 'index.html',
    'random.html': ROOT / 'random' / 'index.html',
}

NAV_REPLACEMENTS = {
    'href="index.html"': 'href="/"',
    'href="work.html"': 'href="/work/"',
    'href="random.html"': 'href="/random/"',
    'href="about.html"': 'href="/about/"',
    'href="connect.html"': 'href="/connect/"',
}


def route_html(source: Path) -> str:
    html = source.read_text()
    if '<base href="/">' not in html:
        html = html.replace('<head>', '<head>\n  <base href="/">', 1)
    for old, new in NAV_REPLACEMENTS.items():
        html = html.replace(old, new)
    return f'{GENERATED_MARKER}\n{html}'


def write_route(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(route_html(source))


for source_name, destination in STATIC_ROUTES.items():
    write_route(ROOT / source_name, destination)

projects_data = json.loads((ROOT / 'content/projects.json').read_text())
projects = projects_data.get('projects', [])
valid_slugs = set()

for project in projects:
    slug = str(project.get('slug', '')).strip()
    if not slug or '/' in slug or slug in {'.', '..'}:
        continue
    valid_slugs.add(slug)
    write_route(ROOT / 'project.html', ROOT / 'work' / slug / 'index.html')

work_dir = ROOT / 'work'
if work_dir.exists():
    for child in work_dir.iterdir():
        if not child.is_dir() or child.name in valid_slugs:
            continue
        index = child / 'index.html'
        try:
            text = index.read_text()
        except OSError:
            continue
        if GENERATED_MARKER in text:
            shutil.rmtree(child)

print(f'Generated {len(STATIC_ROUTES)} clean page routes and {len(valid_slugs)} project routes.')
