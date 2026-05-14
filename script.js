const state = {
  content: null
};

const nav = document.querySelector('.site-nav');
const navToggle = document.querySelector('.nav-toggle');
const navBackdrop = document.querySelector('.nav-backdrop');
const heroActions = document.querySelector('#hero-actions');
const heroStats = document.querySelector('#hero-stats');
const heroTags = document.querySelector('#hero-tags');
const aboutParagraphs = document.querySelector('#about-paragraphs');
const aboutCards = document.querySelector('#about-cards');
const skillsList = document.querySelector('#skills-list');
const projectsGrid = document.querySelector('#projects-grid');
const engagementServices = document.querySelector('#engagement-services');
const engagementReasons = document.querySelector('#engagement-reasons');
const socialLinks = document.querySelector('#social-links');
const contactForm = document.querySelector('#contact-form');
const contactFormStatus = document.querySelector('#contact-form-status');
const metaDescription = document.querySelector('meta[name="description"]');

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupContactForm();
  loadContent();
});

async function loadContent() {
  try {
    const response = await fetch('/api/site-content');

    if (!response.ok) {
      throw new Error(`Failed to load content: ${response.status}`);
    }

    const payload = await response.json();
    state.content = payload.content;
    renderContent(payload.content);
  } catch (error) {
    console.error(error);
    contactFormStatus.textContent =
      'The page could not load its content. Check the server and refresh.';
    contactFormStatus.dataset.state = 'error';
  }
}

function renderContent(content) {
  updateTextFields(content);
  updateLinkFields(content);
  updateMeta(content.meta);
  applyTheme(content.theme);
  renderHeroActions(content.hero);
  renderHeroStats(content.hero.stats);
  renderList(heroTags, content.hero.spotlightTags, 'li');
  renderAbout(content.about);
  renderSkills(content.skills);
  renderProjects(content.projects);
  renderEngagement(content.engagement);
  renderSocials(content.socials);
}

function updateTextFields(content) {
  document.querySelectorAll('[data-field]').forEach((element) => {
    const value = getByPath(content, element.dataset.field);

    if (typeof value === 'string') {
      element.textContent = value;
    }
  });
}

function updateLinkFields(content) {
  document.querySelectorAll('[data-link-field]').forEach((element) => {
    const value = getByPath(content, element.dataset.linkField);

    if (typeof value !== 'string' || !value.trim()) {
      return;
    }

    const prefix = element.dataset.linkPrefix || '';
    const href =
      prefix && !value.startsWith(prefix) ? `${prefix}${value}` : value;

    element.textContent = value;
    element.href = href;
  });
}

function updateMeta(meta) {
  if (meta?.title) {
    document.title = meta.title;
  }

  if (metaDescription && meta?.description) {
    metaDescription.setAttribute('content', meta.description);
  }
}

function renderHeroActions(hero) {
  heroActions.innerHTML = '';

  [
    {
      label: hero.primaryCtaLabel,
      href: hero.primaryCtaHref,
      className: 'button button--primary'
    },
    {
      label: hero.secondaryCtaLabel,
      href: hero.secondaryCtaHref,
      className: 'button button--secondary'
    }
  ].forEach((action) => {
    if (!action.label || !action.href) {
      return;
    }

    heroActions.appendChild(createLink(action.href, action.label, action.className));
  });
}

function renderHeroStats(stats) {
  heroStats.innerHTML = '';

  stats.forEach((stat) => {
    const wrapper = document.createElement('div');
    const value = document.createElement('dd');
    const label = document.createElement('dt');

    value.textContent = stat.value;
    label.textContent = stat.label;

    wrapper.append(value, label);
    heroStats.appendChild(wrapper);
  });
}

function renderAbout(about) {
  aboutParagraphs.innerHTML = '';
  aboutCards.innerHTML = '';

  about.paragraphs.forEach((paragraph) => {
    const item = document.createElement('p');
    item.textContent = paragraph;
    aboutParagraphs.appendChild(item);
  });

  about.cards.forEach((card) => {
    const article = document.createElement('article');
    const title = document.createElement('h3');
    const description = document.createElement('p');

    article.className = 'about-card';
    title.textContent = card.title;
    description.textContent = card.description;
    article.append(title, description);

    aboutCards.appendChild(article);
  });
}

function renderSkills(skills) {
  skillsList.innerHTML = '';

  skills.forEach((skill) => {
    const item = document.createElement('span');
    item.className = 'skill-cloud__item';
    item.textContent = skill;
    skillsList.appendChild(item);
  });
}

function renderProjects(projects) {
  projectsGrid.innerHTML = '';

  projects.forEach((project) => {
    const article = document.createElement('article');
    article.className = project.featured
      ? 'project-card project-card--featured'
      : 'project-card';

    const media = document.createElement('div');
    media.className = 'project-card__media';

    if (project.image) {
      const image = document.createElement('img');
      image.src = project.image;
      image.alt = `${project.name} preview`;
      media.appendChild(image);
    }

    if (project.featured) {
      const badge = document.createElement('span');
      badge.className = 'project-card__featured-badge';
      badge.textContent = 'Featured';
      media.appendChild(badge);
    }

    const body = document.createElement('div');
    body.className = 'project-card__body';

    const meta = document.createElement('div');
    meta.className = 'project-card__meta';
    meta.innerHTML = `<span>${project.featured ? 'Featured case' : 'Selected project'}</span><span>${project.year || ''}</span>`;

    const title = document.createElement('h3');
    title.className = 'project-card__title';
    title.textContent = project.name;

    const summary = document.createElement('p');
    summary.className = 'project-card__summary';
    summary.textContent = project.summary;

    const description = document.createElement('p');
    description.className = 'project-card__description';
    description.textContent = project.description;

    const impact = document.createElement('p');
    impact.className = 'project-card__impact';
    impact.textContent = project.impact;

    const tags = document.createElement('div');
    tags.className = 'project-card__tags';

    project.tech.forEach((tech) => {
      const tag = document.createElement('span');
      tag.className = 'project-card__tag';
      tag.textContent = tech;
      tags.appendChild(tag);
    });

    const actions = document.createElement('div');
    actions.className = 'project-card__actions';

    renderProjectStoreLinks(actions, project);

    if (project.codeUrl) {
      actions.appendChild(createLink(project.codeUrl, 'Source code', 'button button--secondary'));
    }

    body.append(meta, title, summary, description, impact, tags, actions);
    article.append(media, body);
    projectsGrid.appendChild(article);
  });
}

function renderProjectStoreLinks(container, project) {
  const storeLinks = [];

  if (project.playStoreUrl) {
    storeLinks.push(createStoreLink(project.playStoreUrl, 'play'));
  }

  if (project.appStoreUrl) {
    storeLinks.push(createStoreLink(project.appStoreUrl, 'app'));
  }

  if (storeLinks.length === 0 && project.liveUrl) {
    storeLinks.push(createStoreLink(project.liveUrl, detectStoreType(project.liveUrl)));
  }

  storeLinks.forEach((link) => container.appendChild(link));
}

function renderSocials(socials) {
  socialLinks.innerHTML = '';

  socials.forEach((social) => {
    const link = createLink(social.url, social.label, '');
    socialLinks.appendChild(link);
  });
}

function renderEngagement(engagement) {
  if (!engagement) {
    return;
  }

  renderList(engagementServices, engagement.services, 'li');
  renderList(engagementReasons, engagement.reasons, 'li');
}

function renderList(container, items, tagName) {
  if (!container || !Array.isArray(items)) {
    return;
  }

  container.innerHTML = '';

  items.forEach((item) => {
    const element = document.createElement(tagName);
    element.textContent = item;
    container.appendChild(element);
  });
}

function createLink(href, label, className) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;

  if (className) {
    link.className = className;
  }

  if (href.startsWith('http')) {
    link.target = '_blank';
    link.rel = 'noreferrer';
  }

  return link;
}

function createStoreLink(href, type) {
  const labelMap = {
    play: 'Play Store',
    app: 'App Store',
    live: 'Live Project'
  };

  const link = createLink(href, '', 'button button--primary project-store-link');
  const icon = createStoreIcon(type);
  const label = document.createElement('span');

  label.className = 'project-store-link__label';
  label.textContent = labelMap[type] || labelMap.live;

  link.append(icon, label);
  return link;
}

function createStoreIcon(type) {
  const icon = document.createElement('span');

  icon.className = 'project-store-link__icon';
  icon.setAttribute('aria-hidden', 'true');

  if (type === 'play') {
    icon.classList.add('project-store-link__icon--play');
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none"><path d="M6 4L19 12L6 20V4Z" fill="currentColor"/></svg>';
    return icon;
  }

  if (type === 'app') {
    icon.classList.add('project-store-link__icon--app');
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none"><path d="M7 18H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 6L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 6L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    return icon;
  }

  icon.classList.add('project-store-link__icon--live');
  icon.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/><path d="M12 8V12L15 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return icon;
}

function detectStoreType(url) {
  if (typeof url !== 'string') {
    return 'live';
  }

  const normalized = url.toLowerCase();

  if (normalized.includes('play.google.com')) {
    return 'play';
  }

  if (
    normalized.includes('apps.apple.com') ||
    normalized.includes('itunes.apple.com')
  ) {
    return 'app';
  }

  return 'live';
}

function applyTheme(theme) {
  const root = document.documentElement;
  const pageRgb = hexToRgb(theme.page);
  const accentRgb = hexToRgb(theme.accent);
  const accentAltRgb = hexToRgb(theme.accentAlt);

  root.style.setProperty('--page', theme.page);
  root.style.setProperty('--page-alt', theme.pageAlt);
  root.style.setProperty('--surface', theme.surface);
  root.style.setProperty('--surface-alt', theme.surfaceAlt);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-alt', theme.accentAlt);
  root.style.setProperty('--page-rgb', pageRgb);
  root.style.setProperty('--accent-rgb', accentRgb);
  root.style.setProperty('--accent-alt-rgb', accentAltRgb);
}

function setupNavigation() {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navBackdrop.hidden = !isOpen;
  });

  navBackdrop.addEventListener('click', closeNavigation);
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNavigation);
  });
}

function closeNavigation() {
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navBackdrop.hidden = true;
}

function setupContactForm() {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    contactFormStatus.textContent = 'Sending...';
    contactFormStatus.dataset.state = '';

    const payload = Object.fromEntries(new FormData(contactForm).entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Something went wrong.');
      }

      contactForm.reset();
      contactFormStatus.textContent = body.message;
      contactFormStatus.dataset.state = 'success';
    } catch (error) {
      contactFormStatus.textContent = error.message;
      contactFormStatus.dataset.state = 'error';
    }
  });
}

function getByPath(object, path) {
  return path.split('.').reduce((current, key) => {
    if (current && key in current) {
      return current[key];
    }

    return undefined;
  }, object);
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((part) => part + part)
          .join('')
      : normalized;

  const value = Number.parseInt(full, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `${red}, ${green}, ${blue}`;
}
