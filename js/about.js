import { loadSite, hydrateChrome, hydrateSeo, hydratePersonSchema, escapeHtml, revealPage } from './site.js?v=20260908-4';

const page = document.querySelector('[data-about]');

try {
  const site = await loadSite();
  hydrateChrome(site);
  hydrateSeo(site, {
    title: site.aboutSeoTitle || `About — ${site.name || 'Sebastian Tottrup'}`,
    description: site.aboutSeoDescription || site.about || site.intro || `About ${site.name || 'Sebastian Tottrup'}.`,
    path: '/about/',
    image: site.profileImage || site.seoImage,
    imageAlt: `${site.name || 'Sebastian Tottrup'} profile`,
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
      <h1>${escapeHtml(site.name || 'Sebastian Tottrup')}</h1>
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
