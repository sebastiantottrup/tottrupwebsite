#!/usr/bin/env python3
"""Generate sitemap.xml and robots.txt from content/site.json + projects.json."""
from pathlib import Path
from urllib.parse import quote
import json
import html

ROOT = Path(__file__).resolve().parents[1]
site = json.loads((ROOT / 'content/site.json').read_text())
projects = json.loads((ROOT / 'content/projects.json').read_text()).get('projects', [])
base = str(site.get('siteUrl', '')).strip().rstrip('/')

# The repository is usable before a final domain is chosen. Skip cleanly until
# the CMS field "Live site URL" has been populated.
if not base.startswith(('https://', 'http://')):
    print('Sitemap skipped: set content/site.json -> siteUrl to the final live URL first.')
    raise SystemExit(0)

urls = [
    f'{base}/',
    f'{base}/work.html',
    f'{base}/about.html',
    f'{base}/connect.html',
]
for project in projects:
    slug = str(project.get('slug', '')).strip()
    if slug:
        urls.append(f'{base}/project.html?slug={quote(slug)}')

body = '\n'.join(f'  <url><loc>{html.escape(url)}</loc></url>' for url in urls)
sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}\n</urlset>\n'''
(ROOT / 'sitemap.xml').write_text(sitemap)
(ROOT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {base}/sitemap.xml\n')
print(f'Generated sitemap.xml with {len(urls)} URLs and updated robots.txt.')
