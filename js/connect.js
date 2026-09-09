import { loadSite, hydrateChrome, hydrateSeo, hydratePersonSchema, escapeHtml, revealPage } from './site.js?v=20260909-1';

const page = document.querySelector('[data-connect]');

function normalUrl(value = '') {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

try {
  const site = await loadSite();
  hydrateChrome(site);
  hydrateSeo(site, {
    title: site.connectSeoTitle || `Connect — ${site.name || 'Sebastian Tottrup'}`,
    description: site.connectSeoDescription || `Contact and social links for ${site.name || 'Sebastian Tottrup'}.`,
    path: '/connect/',
    image: site.profileImage || site.seoImage,
    imageAlt: `${site.name || 'Sebastian Tottrup'} profile`,
    type: 'profile'
  });
  hydratePersonSchema(site);

  const links = [];
  if (site.instagram) {
    const handle = site.instagram.replace(/^@/, '');
    links.push({ label: 'Instagram', value: `@${handle}`, href: `https://instagram.com/${handle}`, external: true });
  }
  if (site.strava) links.push({ label: 'Strava', value: site.stravaLabel || 'Profile', href: normalUrl(site.strava), external: true });
  if (site.linkedin) links.push({ label: 'LinkedIn', value: site.linkedinLabel || 'Profile', href: normalUrl(site.linkedin), external: true });
  if (site.youtube) links.push({ label: 'YouTube', value: site.youtubeLabel || 'Channel', href: normalUrl(site.youtube), external: true });
  if (site.website) links.push({ label: 'Website', value: site.websiteLabel || site.website, href: normalUrl(site.website), external: true });

  page.innerHTML = `
    <section>
      <h1>Connect</h1>
      <div class="connect-list">
        <a class="connect-row" href="#" role="button" data-email-reveal>
          <span>Email</span>
          <span data-email-value>Click to reveal</span>
        </a>
        ${links.map(link => `
          <a class="connect-row" href="${escapeHtml(link.href)}" ${link.external ? 'target="_blank" rel="noreferrer"' : ''}>
            <span>${escapeHtml(link.label)}</span>
            <span>${escapeHtml(link.value)}</span>
          </a>
        `).join('')}
      </div>
    </section>
  `;

  const emailButton = page.querySelector('[data-email-reveal]');
  const emailValue = page.querySelector('[data-email-value]');
  const protectedEmailParts = ['c2ViYXN0aWFudG90dHJ1cA==', 'Z21haWwuY29t'];
  let emailRevealed = false;
  emailButton?.addEventListener('click', event => {
    event.preventDefault();
    const email = protectedEmailParts.map(part => atob(part)).join('@');
    if (!emailRevealed) {
      emailRevealed = true;
      emailValue.textContent = email;
      emailButton.setAttribute('aria-label', `Email ${email}. Click again to compose.`);
      return;
    }
    window.location.href = `mailto:${email}`;
  });

  await revealPage();
} catch (error) {
  page.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  await revealPage();
}
