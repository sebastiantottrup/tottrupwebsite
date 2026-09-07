import { loadSite, hydrateChrome, escapeHtml, revealPage } from './site.js';

const page = document.querySelector('[data-connect]');

function normalUrl(value = '') {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

try {
  const site = await loadSite();
  hydrateChrome(site);
  document.title = `Connect — ${site.name || 'Portfolio'}`;

  const links = [];
  if (site.email) links.push({ label: 'Email', value: site.email, href: `mailto:${site.email}`, external: false });
  if (site.instagram) {
    const handle = site.instagram.replace(/^@/, '');
    links.push({ label: 'Instagram', value: `@${handle}`, href: `https://instagram.com/${handle}`, external: true });
  }
  if (site.strava) links.push({ label: 'Strava', value: site.stravaLabel || 'Profile', href: normalUrl(site.strava), external: true });
  if (site.linkedin) links.push({ label: 'LinkedIn', value: site.linkedinLabel || 'Profile', href: normalUrl(site.linkedin), external: true });
  if (site.website) links.push({ label: 'Website', value: site.websiteLabel || site.website, href: normalUrl(site.website), external: true });

  page.innerHTML = `
    <section>
      <h1>Connect</h1>
      <div class="connect-list">
        ${links.map(link => `
          <a class="connect-row" href="${escapeHtml(link.href)}" ${link.external ? 'target="_blank" rel="noreferrer"' : ''}>
            <span>${escapeHtml(link.label)}</span>
            <span>${escapeHtml(link.value)}</span>
          </a>
        `).join('') || '<p class="empty-state">Add links in the CMS.</p>'}
      </div>
    </section>
  `;

  await revealPage();
} catch (error) {
  page.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  await revealPage();
}
