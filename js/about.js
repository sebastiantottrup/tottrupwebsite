import { loadSite, hydrateChrome, hydrateSeo, hydratePersonSchema, escapeHtml, revealPage } from './site.js';

const page = document.querySelector('[data-about]');

try {
  const site = await loadSite();
  hydrateChrome(site);
  hydrateSeo(site, {
    title: `About — ${site.name || 'Portfolio'}`,
    description: site.aboutSeoDescription || site.about || site.intro || `About ${site.name || 'the portfolio owner'}.`,
    path: 'about.html',
    image: site.seoImage,
    type: 'profile'
  });
  hydratePersonSchema(site);

  const resume = Array.isArray(site.resume) ? site.resume : [];
  const resumeMarkup = resume.map(item => `
    <div class="resume-row">
      <span>${escapeHtml(item.period)}</span>
      <span>${escapeHtml(item.role)}${item.company ? ` / ${escapeHtml(item.company)}` : ''}</span>
    </div>
  `).join('');

  page.innerHTML = `
    <section class="about-intro">
      <h1>${escapeHtml(site.name || 'YOUR NAME')}</h1>
      ${site.intro ? `<p>${escapeHtml(site.intro)}</p>` : ''}
      ${site.location ? `<p class="muted">${escapeHtml(site.location)}</p>` : ''}
    </section>
    ${site.about ? `<section><h2>About</h2><p>${escapeHtml(site.about)}</p></section>` : ''}
    ${resumeMarkup ? `<section><h2>Experience</h2><div class="resume-list">${resumeMarkup}</div></section>` : ''}
  `;

  await revealPage();
} catch (error) {
  page.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  await revealPage();
}
