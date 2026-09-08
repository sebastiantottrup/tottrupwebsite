import { loadSite, hydrateChrome, hydrateSeo, hydratePersonSchema, escapeHtml, revealPage } from './site.js?v=20260908-4';

const page = document.querySelector('[data-about]');

function normalUrl(value = '') {
  const url = String(value).trim();
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function experienceMarkup(items = []) {
  return items.map(item => {
    const company = item.company || item.project || '';
    const companyUrl = normalUrl(item.companyUrl || item.url || '');
    const skills = item.skills || item.role || '';
    const period = item.period || '';

    const companyMarkup = companyUrl
      ? `<a href="${escapeHtml(companyUrl)}" target="_blank" rel="noreferrer">${escapeHtml(company)}</a>`
      : escapeHtml(company);

    return `
      <div class="experience-row">
        <span class="experience-company">${companyMarkup}</span>
        <span class="experience-skills">${escapeHtml(skills)}</span>
        <span class="experience-period">${escapeHtml(period)}</span>
      </div>
    `;
  }).join('');
}

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

  const professionalExperience = Array.isArray(site.professionalExperience)
    ? site.professionalExperience
    : (Array.isArray(site.resume) ? site.resume : []);
  const personalExperience = Array.isArray(site.personalExperience) ? site.personalExperience : [];

  const professionalMarkup = experienceMarkup(professionalExperience);
  const personalMarkup = experienceMarkup(personalExperience);

  page.innerHTML = `
    <section class="about-intro">
      <h1>${escapeHtml(site.name || 'Sebastian Tottrup')}</h1>
      ${site.intro ? `<p>${escapeHtml(site.intro)}</p>` : ''}
      ${site.location ? `<p class="muted">${escapeHtml(site.location)}</p>` : ''}
    </section>
    ${site.about ? `<section><h2>About</h2><p>${escapeHtml(site.about)}</p></section>` : ''}
    ${professionalMarkup ? `<section><h2>Professional Experience</h2><div class="experience-list">${professionalMarkup}</div></section>` : ''}
    ${personalMarkup ? `<section><h2>Personal Experience</h2><div class="experience-list">${personalMarkup}</div></section>` : ''}
  `;

  await revealPage();
} catch (error) {
  page.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  await revealPage();
}
