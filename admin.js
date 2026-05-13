const adminState = {
  content: null,
  submissions: [],
  projects: []
};

const siteForm = document.querySelector('#site-form');
const saveButton = document.querySelector('#save-site');
const saveStatus = document.querySelector('#save-status');
const projectList = document.querySelector('#project-list');
const addProjectButton = document.querySelector('#add-project');
const submissionsList = document.querySelector('#submissions-list');

document.addEventListener('DOMContentLoaded', () => {
  loadAdminData();
  bindEvents();
});

async function loadAdminData() {
  saveStatus.textContent = 'Loading studio data...';
  saveStatus.dataset.state = '';

  try {
    const [contentResponse, submissionsResponse] = await Promise.all([
      fetch('/api/site-content'),
      fetch('/api/submissions')
    ]);

    if (!contentResponse.ok || !submissionsResponse.ok) {
      throw new Error('Failed to load admin data.');
    }

    const [{ content }, { submissions }] = await Promise.all([
      contentResponse.json(),
      submissionsResponse.json()
    ]);

    adminState.content = content;
    adminState.projects = structuredClone(content.projects).map(withTechInput);
    adminState.submissions = submissions;

    populateForm(content);
    renderProjects();
    renderSubmissions();
    updateThemePreview();

    saveStatus.textContent = 'Studio ready.';
  } catch (error) {
    console.error(error);
    saveStatus.textContent = error.message;
    saveStatus.dataset.state = 'error';
  }
}

function bindEvents() {
  saveButton.addEventListener('click', saveContent);
  addProjectButton.addEventListener('click', addProject);

  siteForm.addEventListener('input', (event) => {
    if (event.target.classList.contains('theme-input')) {
      updateThemePreview();
    }
  });
}

function populateForm(content) {
  const engagement = content.engagement || {
    eyebrow: '',
    title: '',
    description: '',
    servicesTitle: '',
    services: [],
    reasonsTitle: '',
    reasons: []
  };

  setField('meta.title', content.meta.title);
  setField('meta.description', content.meta.description);
  setField('brand.name', content.brand.name);
  setField('brand.mark', content.brand.mark);
  setField('brand.role', content.brand.role);
  setField('brand.location', content.brand.location);
  setField('brand.availability', content.brand.availability);
  setField('brand.email', content.brand.email);
  setField('brand.intro', content.brand.intro);
  setField('hero.eyebrow', content.hero.eyebrow);
  setField('hero.title', content.hero.title);
  setField('hero.description', content.hero.description);
  setField('hero.primaryCtaLabel', content.hero.primaryCtaLabel);
  setField('hero.primaryCtaHref', content.hero.primaryCtaHref);
  setField('hero.secondaryCtaLabel', content.hero.secondaryCtaLabel);
  setField('hero.secondaryCtaHref', content.hero.secondaryCtaHref);
  setField('hero.spotlightTitle', content.hero.spotlightTitle);
  setField('hero.spotlightText', content.hero.spotlightText);
  setField('hero.spotlightTags', content.hero.spotlightTags.join('\n'));
  setField('hero.stats', content.hero.stats.map((stat) => `${stat.value}|${stat.label}`).join('\n'));
  setField('about.eyebrow', content.about.eyebrow);
  setField('about.title', content.about.title);
  setField('about.paragraphs', content.about.paragraphs.join('\n'));
  setField('about.cards', content.about.cards.map((card) => `${card.title}|${card.description}`).join('\n'));
  setField('skillsSection.eyebrow', content.skillsSection.eyebrow);
  setField('skillsSection.title', content.skillsSection.title);
  setField('skillsSection.description', content.skillsSection.description);
  setField('skills', content.skills.join('\n'));
  setField('projectsSection.eyebrow', content.projectsSection.eyebrow);
  setField('projectsSection.title', content.projectsSection.title);
  setField('projectsSection.description', content.projectsSection.description);
  setField('engagement.eyebrow', engagement.eyebrow);
  setField('engagement.title', engagement.title);
  setField('engagement.description', engagement.description);
  setField('engagement.servicesTitle', engagement.servicesTitle);
  setField('engagement.services', engagement.services.join('\n'));
  setField('engagement.reasonsTitle', engagement.reasonsTitle);
  setField('engagement.reasons', engagement.reasons.join('\n'));
  setField('contact.eyebrow', content.contact.eyebrow);
  setField('contact.title', content.contact.title);
  setField('contact.description', content.contact.description);
  setField('contact.email', content.contact.email);
  setField('contact.phone', content.contact.phone);
  setField('contact.location', content.contact.location);
  setField('contact.availabilityLabel', content.contact.availabilityLabel);
  setField('contact.availabilityValue', content.contact.availabilityValue);
  setField('socials', content.socials.map((social) => `${social.label}|${social.url}`).join('\n'));
  setField('theme.page', content.theme.page);
  setField('theme.pageAlt', content.theme.pageAlt);
  setField('theme.surface', content.theme.surface);
  setField('theme.surfaceAlt', content.theme.surfaceAlt);
  setField('theme.border', content.theme.border);
  setField('theme.text', content.theme.text);
  setField('theme.muted', content.theme.muted);
  setField('theme.accent', content.theme.accent);
  setField('theme.accentAlt', content.theme.accentAlt);
}

function setField(name, value) {
  const field = siteForm.elements.namedItem(name);

  if (field) {
    field.value = value;
  }
}

function collectContent() {
  return {
    meta: {
      title: getField('meta.title'),
      description: getField('meta.description')
    },
    brand: {
      name: getField('brand.name'),
      mark: getField('brand.mark'),
      role: getField('brand.role'),
      location: getField('brand.location'),
      availability: getField('brand.availability'),
      email: getField('brand.email'),
      intro: getField('brand.intro')
    },
    hero: {
      eyebrow: getField('hero.eyebrow'),
      title: getField('hero.title'),
      description: getField('hero.description'),
      primaryCtaLabel: getField('hero.primaryCtaLabel'),
      primaryCtaHref: getField('hero.primaryCtaHref'),
      secondaryCtaLabel: getField('hero.secondaryCtaLabel'),
      secondaryCtaHref: getField('hero.secondaryCtaHref'),
      spotlightTitle: getField('hero.spotlightTitle'),
      spotlightText: getField('hero.spotlightText'),
      spotlightTags: splitLines(getField('hero.spotlightTags')),
      stats: parsePairs(getField('hero.stats'), 'value', 'label')
    },
    about: {
      eyebrow: getField('about.eyebrow'),
      title: getField('about.title'),
      paragraphs: splitLines(getField('about.paragraphs')),
      cards: parsePairs(getField('about.cards'), 'title', 'description')
    },
    skillsSection: {
      eyebrow: getField('skillsSection.eyebrow'),
      title: getField('skillsSection.title'),
      description: getField('skillsSection.description')
    },
    skills: splitLines(getField('skills')),
    projectsSection: {
      eyebrow: getField('projectsSection.eyebrow'),
      title: getField('projectsSection.title'),
      description: getField('projectsSection.description')
    },
    engagement: {
      eyebrow: getField('engagement.eyebrow'),
      title: getField('engagement.title'),
      description: getField('engagement.description'),
      servicesTitle: getField('engagement.servicesTitle'),
      services: splitLines(getField('engagement.services')),
      reasonsTitle: getField('engagement.reasonsTitle'),
      reasons: splitLines(getField('engagement.reasons'))
    },
    projects: adminState.projects.map((project) => {
      const { techInput, ...rest } = project;
      return {
        ...rest,
        tech: splitCommaList(techInput || '')
      };
    }),
    contact: {
      eyebrow: getField('contact.eyebrow'),
      title: getField('contact.title'),
      description: getField('contact.description'),
      email: getField('contact.email'),
      phone: getField('contact.phone'),
      location: getField('contact.location'),
      availabilityLabel: getField('contact.availabilityLabel'),
      availabilityValue: getField('contact.availabilityValue')
    },
    socials: parsePairs(getField('socials'), 'label', 'url'),
    theme: {
      page: getField('theme.page'),
      pageAlt: getField('theme.pageAlt'),
      surface: getField('theme.surface'),
      surfaceAlt: getField('theme.surfaceAlt'),
      border: getField('theme.border'),
      text: getField('theme.text'),
      muted: getField('theme.muted'),
      accent: getField('theme.accent'),
      accentAlt: getField('theme.accentAlt')
    }
  };
}

function getField(name) {
  const field = siteForm.elements.namedItem(name);
  return field ? field.value.trim() : '';
}

async function saveContent() {
  saveStatus.textContent = 'Saving...';
  saveStatus.dataset.state = '';

  try {
    const content = collectContent();
    const response = await fetch('/api/site-content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(content)
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.error || 'Failed to save changes.');
    }

    adminState.content = body.content;
    adminState.projects = structuredClone(body.content.projects).map(withTechInput);
    renderProjects();
    saveStatus.textContent = body.message;
    saveStatus.dataset.state = 'success';
  } catch (error) {
    saveStatus.textContent = error.message;
    saveStatus.dataset.state = 'error';
  }
}

function renderProjects() {
  projectList.innerHTML = '';

  if (adminState.projects.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'studio-status';
    empty.textContent = 'No projects yet. Add one below.';
    projectList.appendChild(empty);
    return;
  }

  adminState.projects.forEach((project, index) => {
    const wrapper = document.createElement('article');
    wrapper.className = 'project-editor';
    wrapper.innerHTML = `
      <div class="project-editor__header">
        <h3 class="project-editor__title">${escapeHtml(project.name || `Project ${index + 1}`)}</h3>
        <button class="project-editor__delete" type="button" data-index="${index}">Delete</button>
      </div>
      <label>
        <span>Name</span>
        <input type="text" data-project-field="name" data-index="${index}" value="${escapeAttribute(project.name)}" />
      </label>
      <div class="studio-grid studio-grid--two">
        <label>
          <span>Slug ID</span>
          <input type="text" data-project-field="id" data-index="${index}" value="${escapeAttribute(project.id)}" />
        </label>
        <label>
          <span>Year</span>
          <input type="text" data-project-field="year" data-index="${index}" value="${escapeAttribute(project.year)}" />
        </label>
      </div>
      <label>
        <span>Summary</span>
        <textarea rows="3" data-project-field="summary" data-index="${index}">${escapeHtml(project.summary)}</textarea>
      </label>
      <label>
        <span>Description</span>
        <textarea rows="4" data-project-field="description" data-index="${index}">${escapeHtml(project.description)}</textarea>
      </label>
      <label>
        <span>Impact</span>
        <textarea rows="3" data-project-field="impact" data-index="${index}">${escapeHtml(project.impact)}</textarea>
      </label>
      <label>
        <span>Tech tags</span>
        <input type="text" data-project-field="techInput" data-index="${index}" value="${escapeAttribute(project.techInput || '')}" placeholder="Comma separated tags" />
      </label>
      <div class="studio-grid studio-grid--two">
        <label>
          <span>Live URL</span>
          <input type="text" data-project-field="liveUrl" data-index="${index}" value="${escapeAttribute(project.liveUrl)}" />
        </label>
        <label>
          <span>Code URL</span>
          <input type="text" data-project-field="codeUrl" data-index="${index}" value="${escapeAttribute(project.codeUrl)}" />
        </label>
      </div>
      <label>
        <span>Image path</span>
        <input type="text" data-project-field="image" data-index="${index}" value="${escapeAttribute(project.image)}" />
      </label>
      <label class="project-editor__checkbox">
        <input type="checkbox" data-project-field="featured" data-index="${index}" ${project.featured ? 'checked' : ''} />
        <span>Featured project</span>
      </label>
    `;

    projectList.appendChild(wrapper);
  });

  projectList.querySelectorAll('[data-project-field]').forEach((field) => {
    field.addEventListener('input', handleProjectInput);
    field.addEventListener('change', handleProjectInput);
  });

  projectList.querySelectorAll('.project-editor__delete').forEach((button) => {
    button.addEventListener('click', () => removeProject(Number(button.dataset.index)));
  });
}

function handleProjectInput(event) {
  const index = Number(event.target.dataset.index);
  const field = event.target.dataset.projectField;

  if (!Number.isInteger(index) || !field) {
    return;
  }

  adminState.projects[index][field] =
    event.target.type === 'checkbox' ? event.target.checked : event.target.value;

  if (field === 'name') {
    renderProjects();
  }
}

function addProject() {
  adminState.projects.push(
    withTechInput({
      id: `project-${Date.now()}`,
      name: 'New project',
      year: '',
      summary: '',
      description: '',
      tech: [],
      liveUrl: '',
      codeUrl: '',
      image: './assets/mock.png',
      featured: false,
      impact: ''
    })
  );

  renderProjects();
}

function removeProject(index) {
  adminState.projects.splice(index, 1);
  renderProjects();
}

function renderSubmissions() {
  submissionsList.innerHTML = '';

  if (adminState.submissions.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'studio-status';
    empty.textContent = 'No messages yet.';
    submissionsList.appendChild(empty);
    return;
  }

  adminState.submissions.forEach((submission) => {
    const article = document.createElement('article');
    article.className = 'submission-card';
    article.innerHTML = `
      <div class="submission-card__header">
        <h3 class="submission-card__title">${escapeHtml(submission.name)}</h3>
        <button class="submission-card__delete" type="button" data-id="${submission.id}">
          Delete
        </button>
      </div>
      <div class="submission-card__meta">${escapeHtml(submission.email)} · ${new Date(submission.createdAt).toLocaleString()}</div>
      <p class="submission-card__message">${escapeHtml(submission.message)}</p>
    `;

    submissionsList.appendChild(article);
  });

  submissionsList.querySelectorAll('.submission-card__delete').forEach((button) => {
    button.addEventListener('click', () => deleteSubmission(button.dataset.id));
  });
}

async function deleteSubmission(id) {
  try {
    const response = await fetch(`/api/submissions/${id}`, {
      method: 'DELETE'
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.error || 'Failed to delete submission.');
    }

    adminState.submissions = adminState.submissions.filter(
      (submission) => submission.id !== id
    );
    renderSubmissions();
  } catch (error) {
    saveStatus.textContent = error.message;
    saveStatus.dataset.state = 'error';
  }
}

function updateThemePreview() {
  const theme = {
    page: getField('theme.page'),
    surface: getField('theme.surface'),
    accent: getField('theme.accent'),
    accentAlt: getField('theme.accentAlt')
  };

  Object.entries(theme).forEach(([key, value]) => {
    const swatch = document.querySelector(`[data-theme-swatch="${key}"]`);

    if (swatch) {
      swatch.style.background = value;
    }
  });
}

function splitLines(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitCommaList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePairs(value, firstKey, secondKey) {
  return splitLines(value)
    .map((line) => {
      const [first = '', ...rest] = line.split('|');
      const second = rest.join('|').trim();
      return {
        [firstKey]: first.trim(),
        [secondKey]: second
      };
    })
    .filter((item) => item[firstKey] || item[secondKey]);
}

function withTechInput(project) {
  return {
    ...project,
    techInput: Array.isArray(project.tech) ? project.tech.join(', ') : ''
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('\n', '&#10;');
}
