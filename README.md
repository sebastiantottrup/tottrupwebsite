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
- Regular 400 + Bold 700
- Soft content fade-in / fade-out
- Animated `loading...` state

## Font files

Add the free-to-use Pixel Arial 11 files to `assets/fonts/` with these exact names:

- `PixelArial11-Regular.ttf`
- `PixelArial11-Bold.ttf`

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
