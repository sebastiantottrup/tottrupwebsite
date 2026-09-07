# Setup guide — Virginie Palermo Portfolio

This site is plain HTML, CSS and JavaScript. There is no build process. Project content is stored in `content/projects.json`, site/About/Connect content is stored in `content/site.json`, and Pages CMS provides the editing interface on top of GitHub.

## 1. Add Pixel Arial 11

Copy your two `.ttf` files into `assets/fonts/` and make sure they are named exactly:

- `PixelArial11-Regular.ttf`
- `PixelArial11-Bold.ttf`

The site uses Regular as its default weight and Bold for active navigation, headings, Work table headings and `loading...`.

## 2. Preview on your Mac before publishing

### Easiest

Double-click `preview.command`.

It will start a small local web server and open `http://localhost:8080` in your browser. Keep the Terminal window open while previewing. Press Control-C to stop it.

### Manual alternative

Open Terminal, drag this project folder into the Terminal window after typing `cd `, press Return, then run:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

Do not open `index.html` by double-clicking it: the site loads JSON with JavaScript and browsers restrict that when using `file://`.

## 3. Create the GitHub repository

1. Sign in at GitHub.
2. Click `+` in the top-right → `New repository`.
3. Repository name: e.g. `virginie-portfolio`.
4. Choose **Public** if you use GitHub Free and want GitHub Pages hosting.
5. Do not add a README, `.gitignore` or license because this folder already contains the site.
6. Click `Create repository`.

## 4. Upload this site to GitHub — browser method

1. Unzip the portfolio package first.
2. In the empty GitHub repository choose `Add file` → `Upload files`.
3. Drag the **contents** of this project folder into the upload area. Do not upload the ZIP itself.
4. Make sure the root of the repository contains `index.html`, `work.html`, `.pages.yml`, `.nojekyll`, and the `css`, `js`, `content`, `assets` folders.
5. On Mac, hidden files beginning with `.` can be shown in Finder with `Command + Shift + .` if you need to verify `.pages.yml` and `.nojekyll`.
6. Commit the upload to `main`.

## 5. Turn on the live website with GitHub Pages

1. In the repository go to `Settings` → `Pages`.
2. Under **Build and deployment**, set Source to `Deploy from a branch`.
3. Select branch `main` and folder `/ (root)`.
4. Click `Save`.
5. GitHub will show the public site URL on that same Pages settings screen once deployment completes.

Every later commit to `main` republishes the website.

## 6. Connect Pages CMS

You do not build or host a CMS yourself. Use the hosted Pages CMS editor:

1. Go to `https://app.pagescms.org/`.
2. Click `Sign in with GitHub`.
3. Install/authorize the Pages CMS GitHub App.
4. When GitHub asks which repositories it may access, choose **Only select repositories** and select your portfolio repository.
5. Return to Pages CMS and open the repository.
6. Pages CMS reads `.pages.yml` from the repository root.
7. You should see two editable areas:
   - **Projects**
   - **Site / About / Connect**
8. Change a field and click Save. Pages CMS commits that edit to GitHub. GitHub Pages then republishes the site automatically.

If Pages CMS asks you to create a configuration file even though this project already has one, first check that `.pages.yml` exists at the top level of the GitHub repository and that Pages CMS is viewing the `main` branch.

## 7. Adding a project in the CMS

Open **Projects** and add a project item. The important fields are:

- **Slug** — lowercase URL value, e.g. `badlands-2026`
- **Year**
- **Title**
- **Show on homepage** — on/off
- **Homepage position** — 1–4
- **Project thumbnail** — used on Home, Work Grid and Work List hover
- **Format** — e.g. Images / Video, Product, Design
- **Brand**
- **Client**
- **Role**
- **Description**
- **Project gallery** — add any number of image/video blocks

Home shows at most four projects. Work shows every project.

## 8. Editing About and Connect

Open **Site / About / Connect** in Pages CMS to edit your name, story, location, experience, email, Instagram, Strava, LinkedIn, website and the hidden copyright site credit.

## 9. Updating the code later

For visual/code changes, replace the relevant files in GitHub and commit them. For normal project/content updates, use Pages CMS instead.
