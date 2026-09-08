# Virginie Palermo — portfolio

Ultra-simple static portfolio built with HTML, CSS and vanilla JavaScript, with Pages CMS editing content stored in GitHub.

## Structure

- **Home** — four selected projects.
- **Work** — all projects in List / Grid view.
- **Random** — opens a random project.
- **About** — story, background and experience.
- **Connect** — Email, Instagram, Strava, LinkedIn and Website.
- **Project** — image/video gallery with thumbnail navigation.
- **Footer credit** — hover/click easter egg on the copyright.

## Visual system

- White background
- Greyscale interface
- Pixel Arial 11 only
- Regular 400 throughout + Bold 700 only for project-detail headlines
- Soft content fade-in / fade-out
- Animated `loading...` state

## Font files

Add the free-to-use Pixel Arial 11 files to `assets/fonts/` with these exact names:

- `PixelArial11-Regular.TTF`
- `PixelArial11-Bold.TTF`

The CSS is already wired to both files.

## Content

- `content/projects.json` — all project data
- `content/site.json` — About / Connect / site metadata
- `.pages.yml` — Pages CMS configuration

## Preview

On macOS, double-click `preview.command`, or run:

```bash
python3 -m http.server 8080
```

and visit `http://localhost:8080`.

## Publishing + CMS

See `SETUP-GUIDE.md` for a complete GitHub Pages + Pages CMS walkthrough.

## v5 layout notes

- Desktop site object is capped at **800px wide** and centered in the browser.
- Navigation sits directly underneath the content object and does not scroll with the content box.
- Home contains **exactly four featured project images in one continuous strip**: no titles, captions, or gaps.
- Work retains List / Grid views inside the 800px content area.
- Project, About and Connect pages use an internally scrollable content area so the navigation stays in a consistent location.
- Pixel Arial 11 is the only public-site font. Regular (400) is used throughout; Bold (700) is reserved only for the project headline on individual project-detail pages.

## SEO

The frontend now includes:

- unique page titles and meta descriptions
- canonical URL support once `siteUrl` is entered in the CMS
- Open Graph and Twitter metadata
- `Person` structured data
- `CreativeWork` structured data for every project
- project alt-text fields
- per-project SEO title, description, and social image fields
- `robots.txt`
- a sitemap generator at `tools/build_sitemap.py`

After your real website URL is known, set **Site / About / Connect → Live site URL** in Pages CMS (for example `https://virginiepalermo.com`). Then run:

```bash
python3 tools/build_sitemap.py
```

Commit the generated `sitemap.xml` and updated `robots.txt` to GitHub. Re-run this after adding or removing projects if you want the sitemap to stay fully current.


### Page transitions

Navigation remains visible during page transitions; only the changing page content fades while `loading...` is shown.
