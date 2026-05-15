const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { randomUUID, timingSafeEqual } = require('crypto');

const app = express();
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const siteContentPath = path.join(dataDir, 'site-content.json');
const submissionsPath = path.join(dataDir, 'submissions.json');
const port = Number(process.env.PORT) || 4174;
const isVercelRuntime = Boolean(process.env.VERCEL);
const adminUsername = process.env.ADMIN_USERNAME || 'jzb';
const adminPassword = process.env.ADMIN_PASSWORD || 'Tiksom@123';

const defaultTheme = {
  page: '#07111f',
  pageAlt: '#0d1730',
  surface: '#11203d',
  surfaceAlt: '#162a52',
  border: '#29416f',
  text: '#f5f7ff',
  muted: '#9bb0d6',
  accent: '#ff7a59',
  accentAlt: '#67e4d6'
};

const defaultContent = {
  meta: {
    title: 'John Anderson | Product Engineer',
    description:
      'A bold editable portfolio site with an admin studio, project management, and theme controls.'
  },
  brand: {
    name: 'John Anderson',
    mark: 'JA',
    role: 'Product Engineer and Frontend Systems Builder',
    location: 'Remote / Worldwide',
    availability: 'Open for selected freelance work',
    email: 'hello@johnanderson.dev',
    intro:
      'I design and ship polished portfolio sites, launch pages, and internal tools that feel deliberate from the first screen to the last detail.'
  },
  hero: {
    eyebrow: 'Portfolio studio with a real backend',
    title: 'Build a portfolio that is easy to update and hard to ignore.',
    description:
      'This rebuild turns WowFolio from a static HTML template into a small full-stack portfolio system. The public site renders from structured content, projects can be added from an admin studio, and the full visual direction can be changed through theme tokens instead of editing raw CSS everywhere.',
    primaryCtaLabel: 'Explore projects',
    primaryCtaHref: '#projects',
    secondaryCtaLabel: 'Start a conversation',
    secondaryCtaHref: '#contact',
    spotlightTitle: 'Current focus',
    spotlightText:
      'Designing portfolio experiences with stronger visual direction and cleaner systems underneath: reusable data, persistent content, and enough range to avoid the stock developer-template look.',
    spotlightTags: [
      'Theme controls',
      'Project management',
      'Contact inbox',
      'Responsive layout'
    ],
    stats: [
      {
        value: '18+',
        label: 'Projects launched'
      },
      {
        value: '6',
        label: 'Years shipping for the web'
      },
      {
        value: '24h',
        label: 'Typical response window'
      }
    ]
  },
  about: {
    eyebrow: 'About',
    title: 'A sharper portfolio needs sharper systems behind it.',
    paragraphs: [
      'The original template gave you a clean static page, but every real change still meant editing markup by hand. That becomes friction the moment you want to add new work, rewrite your positioning, or change the tone of the site without touching each section individually.',
      'This version keeps the footprint small but makes the system practical. Content lives in JSON, the frontend pulls from an API, and the admin studio lets you manage hero copy, section content, socials, contact information, projects, and color tokens from one place.',
      'The visual design also changed completely: stronger typography, layered gradients, glass surfaces, sharper spacing, and a palette model that controls page, surface, border, text, and dual-accent colors separately.'
    ],
    cards: [
      {
        title: 'Content control',
        description:
          'Edit profile copy, sections, skills, project cards, and social links from the admin studio.'
      },
      {
        title: 'Theme control',
        description:
          'Drive the whole interface with theme tokens for surfaces, text, borders, and accent pairs instead of one color picker.'
      },
      {
        title: 'Practical backend',
        description:
          'Persist projects and contact submissions locally in JSON through a small Express API that is easy to run anywhere.'
      }
    ]
  },
  skillsSection: {
    eyebrow: 'Capabilities',
    title: 'The stack and shape can change. The standard stays high.',
    description:
      'Use this section to present the technologies, services, or disciplines you want to be known for.'
  },
  skills: [
    'HTML',
    'CSS',
    'JavaScript',
    'Node.js',
    'Express',
    'Design systems',
    'UX writing',
    'Landing pages',
    'CMS workflows',
    'Responsive UI',
    'Accessibility',
    'Creative direction'
  ],
  projectsSection: {
    eyebrow: 'Selected work',
    title: 'Projects that balance presentation with engineering.',
    description:
      'Each project card supports summary copy, detailed context, impact notes, tech tags, and live or code links. Add, remove, and edit them from the admin studio.'
  },
  projects: [
    {
      id: 'studio-portfolio',
      name: 'Studio Portfolio System',
      year: '2026',
      summary: 'Converted a static portfolio template into a content-managed site.',
      description:
        'Built a lightweight Express backend, JSON persistence, editable theme tokens, and a vanilla admin dashboard for managing content without touching markup.',
      tech: ['Express', 'Vanilla JS', 'CSS variables', 'JSON'],
      liveUrl: '#',
      codeUrl: '#',
      playStoreUrl: '',
      appStoreUrl: '',
      image: './assets/mock.png',
      featured: true,
      impact:
        'Made copy, project, and theme updates possible in minutes instead of file-by-file edits.'
    },
    {
      id: 'launch-campaign',
      name: 'Launch Campaign Microsite',
      year: '2025',
      summary: 'Shaped a product launch page around messaging clarity and motion.',
      description:
        'Focused on faster scanning, tighter CTA hierarchy, and a cleaner rhythm across mobile and desktop without drifting into generic SaaS patterns.',
      tech: ['Brand systems', 'Interaction design', 'Performance'],
      liveUrl: '#',
      codeUrl: '#',
      playStoreUrl: '',
      appStoreUrl: '',
      image: './assets/mock.png',
      featured: false,
      impact:
        'Lifted conversion quality by aligning the visual tone with a clearer offer narrative.'
    },
    {
      id: 'ops-dashboard',
      name: 'Operations Dashboard',
      year: '2025',
      summary: 'Designed an internal dashboard for fast team decisions.',
      description:
        'Translated operational noise into a calmer interface with clearer priority framing, denser information design, and fewer dead-end interactions.',
      tech: ['Product UI', 'Data presentation', 'Workflow design'],
      liveUrl: '#',
      codeUrl: '#',
      playStoreUrl: '',
      appStoreUrl: '',
      image: './assets/mock.png',
      featured: true,
      impact:
        'Reduced time-to-answer for common operational questions by putting the right signals first.'
    }
  ],
  engagement: {
    eyebrow: 'Collaboration',
    title: 'What I can help with and why teams trust my execution.',
    description:
      'I support mobile products from architecture planning to release stability, whether you need a new product build, scaling support, or focused consulting.',
    servicesTitle: 'What I Can Help With',
    services: [
      'Full-cycle mobile application development',
      'Native iOS development',
      'Native Android development',
      'React Native cross-platform apps',
      'Mobile architecture planning',
      'Firebase integrations',
      'Real-time communication systems',
      'App performance optimization',
      'App Store and Play Store deployment'
    ],
    reasonsTitle: 'Why Clients Work With Me',
    reasons: [
      'Strong ownership mindset',
      'Senior-level architecture understanding',
      'Real-world production experience',
      'Scalable engineering approach',
      'Clear communication',
      'Long-term maintainability focus'
    ]
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Need a portfolio, launch page, or frontend refresh that does not feel templated?',
    description:
      'Use the form or reach out directly. Messages are stored by the backend and shown in the admin studio inbox.',
    email: 'hello@johnanderson.dev',
    phone: '+1 (555) 014-7821',
    location: 'Remote / Worldwide',
    availabilityLabel: 'Status',
    availabilityValue: 'Booking work for next month'
  },
  socials: [
    {
      label: 'GitHub',
      url: 'https://github.com/'
    },
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/'
    },
    {
      label: 'X',
      url: 'https://x.com/'
    },
    {
      label: 'Email',
      url: 'mailto:hello@johnanderson.dev'
    }
  ],
  theme: defaultTheme
};

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(rootDir, 'assets')));

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, encoded] = authHeader.split(' ');

  if (scheme === 'Basic' && encoded) {
    try {
      const decoded = Buffer.from(encoded, 'base64').toString('utf8');
      const separatorIndex = decoded.indexOf(':');
      const username =
        separatorIndex === -1 ? decoded : decoded.slice(0, separatorIndex);
      const password =
        separatorIndex === -1 ? '' : decoded.slice(separatorIndex + 1);

      if (
        safeEqual(username, adminUsername) &&
        safeEqual(password, adminPassword)
      ) {
        return next();
      }
    } catch (error) {
      console.error('Failed to parse admin authorization header.', error);
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="WowFolio Admin"');
  return res.status(401).send('Authentication required.');
}

function ensureString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function ensureStringArray(value, fallback = []) {
  return Array.isArray(value)
    ? value.map((item) => ensureString(item).trim()).filter(Boolean)
    : fallback;
}

function normalizeTheme(theme = {}) {
  return {
    page: ensureString(theme.page, defaultTheme.page),
    pageAlt: ensureString(theme.pageAlt, defaultTheme.pageAlt),
    surface: ensureString(theme.surface, defaultTheme.surface),
    surfaceAlt: ensureString(theme.surfaceAlt, defaultTheme.surfaceAlt),
    border: ensureString(theme.border, defaultTheme.border),
    text: ensureString(theme.text, defaultTheme.text),
    muted: ensureString(theme.muted, defaultTheme.muted),
    accent: ensureString(theme.accent, defaultTheme.accent),
    accentAlt: ensureString(theme.accentAlt, defaultTheme.accentAlt)
  };
}

function normalizeStats(stats = []) {
  return Array.isArray(stats)
    ? stats.map((stat) => ({
        value: ensureString(stat?.value),
        label: ensureString(stat?.label)
      }))
    : defaultContent.hero.stats;
}

function normalizeCards(cards = []) {
  return Array.isArray(cards)
    ? cards.map((card) => ({
        title: ensureString(card?.title, 'Untitled card'),
        description: ensureString(card?.description)
      }))
    : defaultContent.about.cards;
}

function normalizeProjects(projects = []) {
  return Array.isArray(projects)
    ? projects.map((project, index) => ({
        id: ensureString(project?.id, `project-${index + 1}`),
        name: ensureString(project?.name, 'Untitled project'),
        year: ensureString(project?.year),
        summary: ensureString(project?.summary),
        description: ensureString(project?.description),
        tech: ensureStringArray(project?.tech),
        liveUrl: ensureString(project?.liveUrl),
        codeUrl: ensureString(project?.codeUrl),
        playStoreUrl: ensureString(project?.playStoreUrl),
        appStoreUrl: ensureString(project?.appStoreUrl),
        image: ensureString(project?.image, './assets/mock.png'),
        featured: Boolean(project?.featured),
        impact: ensureString(project?.impact)
      }))
    : defaultContent.projects;
}

function normalizeSocials(socials = []) {
  return Array.isArray(socials)
    ? socials.map((social) => ({
        label: ensureString(social?.label, 'Link'),
        url: ensureString(social?.url, '#')
      }))
    : defaultContent.socials;
}

function normalizeContent(content = {}) {
  return {
    meta: {
      title: ensureString(content?.meta?.title, defaultContent.meta.title),
      description: ensureString(
        content?.meta?.description,
        defaultContent.meta.description
      )
    },
    brand: {
      name: ensureString(content?.brand?.name, defaultContent.brand.name),
      mark: ensureString(content?.brand?.mark, defaultContent.brand.mark),
      role: ensureString(content?.brand?.role, defaultContent.brand.role),
      location: ensureString(
        content?.brand?.location,
        defaultContent.brand.location
      ),
      availability: ensureString(
        content?.brand?.availability,
        defaultContent.brand.availability
      ),
      email: ensureString(content?.brand?.email, defaultContent.brand.email),
      intro: ensureString(content?.brand?.intro, defaultContent.brand.intro)
    },
    hero: {
      eyebrow: ensureString(
        content?.hero?.eyebrow,
        defaultContent.hero.eyebrow
      ),
      title: ensureString(content?.hero?.title, defaultContent.hero.title),
      description: ensureString(
        content?.hero?.description,
        defaultContent.hero.description
      ),
      primaryCtaLabel: ensureString(
        content?.hero?.primaryCtaLabel,
        defaultContent.hero.primaryCtaLabel
      ),
      primaryCtaHref: ensureString(
        content?.hero?.primaryCtaHref,
        defaultContent.hero.primaryCtaHref
      ),
      secondaryCtaLabel: ensureString(
        content?.hero?.secondaryCtaLabel,
        defaultContent.hero.secondaryCtaLabel
      ),
      secondaryCtaHref: ensureString(
        content?.hero?.secondaryCtaHref,
        defaultContent.hero.secondaryCtaHref
      ),
      spotlightTitle: ensureString(
        content?.hero?.spotlightTitle,
        defaultContent.hero.spotlightTitle
      ),
      spotlightText: ensureString(
        content?.hero?.spotlightText,
        defaultContent.hero.spotlightText
      ),
      spotlightTags: ensureStringArray(
        content?.hero?.spotlightTags,
        defaultContent.hero.spotlightTags
      ),
      stats: normalizeStats(content?.hero?.stats)
    },
    about: {
      eyebrow: ensureString(
        content?.about?.eyebrow,
        defaultContent.about.eyebrow
      ),
      title: ensureString(content?.about?.title, defaultContent.about.title),
      paragraphs: ensureStringArray(
        content?.about?.paragraphs,
        defaultContent.about.paragraphs
      ),
      cards: normalizeCards(content?.about?.cards)
    },
    skillsSection: {
      eyebrow: ensureString(
        content?.skillsSection?.eyebrow,
        defaultContent.skillsSection.eyebrow
      ),
      title: ensureString(
        content?.skillsSection?.title,
        defaultContent.skillsSection.title
      ),
      description: ensureString(
        content?.skillsSection?.description,
        defaultContent.skillsSection.description
      )
    },
    skills: ensureStringArray(content?.skills, defaultContent.skills),
    projectsSection: {
      eyebrow: ensureString(
        content?.projectsSection?.eyebrow,
        defaultContent.projectsSection.eyebrow
      ),
      title: ensureString(
        content?.projectsSection?.title,
        defaultContent.projectsSection.title
      ),
      description: ensureString(
        content?.projectsSection?.description,
        defaultContent.projectsSection.description
      )
    },
    projects: normalizeProjects(content?.projects),
    engagement: {
      eyebrow: ensureString(
        content?.engagement?.eyebrow,
        defaultContent.engagement.eyebrow
      ),
      title: ensureString(
        content?.engagement?.title,
        defaultContent.engagement.title
      ),
      description: ensureString(
        content?.engagement?.description,
        defaultContent.engagement.description
      ),
      servicesTitle: ensureString(
        content?.engagement?.servicesTitle,
        defaultContent.engagement.servicesTitle
      ),
      services: ensureStringArray(
        content?.engagement?.services,
        defaultContent.engagement.services
      ),
      reasonsTitle: ensureString(
        content?.engagement?.reasonsTitle,
        defaultContent.engagement.reasonsTitle
      ),
      reasons: ensureStringArray(
        content?.engagement?.reasons,
        defaultContent.engagement.reasons
      )
    },
    contact: {
      eyebrow: ensureString(
        content?.contact?.eyebrow,
        defaultContent.contact.eyebrow
      ),
      title: ensureString(content?.contact?.title, defaultContent.contact.title),
      description: ensureString(
        content?.contact?.description,
        defaultContent.contact.description
      ),
      email: ensureString(content?.contact?.email, defaultContent.contact.email),
      phone: ensureString(content?.contact?.phone, defaultContent.contact.phone),
      location: ensureString(
        content?.contact?.location,
        defaultContent.contact.location
      ),
      availabilityLabel: ensureString(
        content?.contact?.availabilityLabel,
        defaultContent.contact.availabilityLabel
      ),
      availabilityValue: ensureString(
        content?.contact?.availabilityValue,
        defaultContent.contact.availabilityValue
      )
    },
    socials: normalizeSocials(content?.socials),
    theme: normalizeTheme(content?.theme)
  };
}

async function readJson(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }

    throw error;
  }
}

async function writeJson(filePath, data) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tempFile = `${filePath}.tmp`;
    await fs.writeFile(tempFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await fs.rename(tempFile, filePath);
  } catch (error) {
    if (['EROFS', 'EACCES', 'EPERM', 'ENOTSUP'].includes(error?.code)) {
      const storageError = new Error('Persistent storage is not writable.');
      storageError.code = 'READ_ONLY_STORAGE';
      storageError.cause = error;
      throw storageError;
    }

    throw error;
  }
}

async function getSiteContent() {
  const raw = await readJson(siteContentPath, defaultContent);
  return normalizeContent(raw);
}

async function getSubmissions() {
  const raw = await readJson(submissionsPath, []);
  return Array.isArray(raw) ? raw : [];
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function serveFile(res, filename) {
  res.sendFile(path.join(rootDir, filename));
}

app.get('/', (req, res) => serveFile(res, 'index.html'));
app.get('/admin', requireAdminAuth, (req, res) => serveFile(res, 'admin.html'));
app.get('/index.html', (req, res) => serveFile(res, 'index.html'));
app.get('/admin.html', requireAdminAuth, (req, res) => serveFile(res, 'admin.html'));
app.get('/style.css', (req, res) => serveFile(res, 'style.css'));
app.get('/script.js', (req, res) => serveFile(res, 'script.js'));
app.get('/admin.css', requireAdminAuth, (req, res) => serveFile(res, 'admin.css'));
app.get('/admin.js', requireAdminAuth, (req, res) => serveFile(res, 'admin.js'));

app.get(
  '/api/site-content',
  asyncRoute(async (req, res) => {
    const content = await getSiteContent();
    res.json({ content });
  })
);

app.put(
  '/api/site-content',
  requireAdminAuth,
  asyncRoute(async (req, res) => {
    const content = normalizeContent(req.body || {});
    await writeJson(siteContentPath, content);
    res.json({ message: 'Site content saved.', content });
  })
);

app.get(
  '/api/projects',
  requireAdminAuth,
  asyncRoute(async (req, res) => {
    const content = await getSiteContent();
    res.json({ projects: content.projects });
  })
);

app.post(
  '/api/projects',
  requireAdminAuth,
  asyncRoute(async (req, res) => {
    const content = await getSiteContent();
    const project = normalizeProjects([
      {
        ...req.body,
        id: ensureString(req.body?.id, randomUUID())
      }
    ])[0];

    content.projects.unshift(project);
    await writeJson(siteContentPath, content);
    res.status(201).json({ message: 'Project added.', project });
  })
);

app.put(
  '/api/projects/:id',
  requireAdminAuth,
  asyncRoute(async (req, res) => {
    const content = await getSiteContent();
    const index = content.projects.findIndex(
      (project) => project.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const updated = normalizeProjects([
      {
        ...content.projects[index],
        ...req.body,
        id: content.projects[index].id
      }
    ])[0];

    content.projects[index] = updated;
    await writeJson(siteContentPath, content);
    res.json({ message: 'Project updated.', project: updated });
  })
);

app.delete(
  '/api/projects/:id',
  requireAdminAuth,
  asyncRoute(async (req, res) => {
    const content = await getSiteContent();
    const nextProjects = content.projects.filter(
      (project) => project.id !== req.params.id
    );

    if (nextProjects.length === content.projects.length) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    content.projects = nextProjects;
    await writeJson(siteContentPath, content);
    res.json({ message: 'Project removed.' });
  })
);

app.post(
  '/api/contact',
  asyncRoute(async (req, res) => {
    const name = ensureString(req.body?.name).trim();
    const email = ensureString(req.body?.email).trim();
    const message = ensureString(req.body?.message).trim();

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: 'Name, email, and message are required.' });
    }

    const submissions = await getSubmissions();
    submissions.unshift({
      id: randomUUID(),
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    });

    await writeJson(submissionsPath, submissions);
    res.status(201).json({ message: 'Message received.' });
  })
);

app.get(
  '/api/submissions',
  requireAdminAuth,
  asyncRoute(async (req, res) => {
    const submissions = await getSubmissions();
    res.json({ submissions });
  })
);

app.delete(
  '/api/submissions/:id',
  requireAdminAuth,
  asyncRoute(async (req, res) => {
    const submissions = await getSubmissions();
    const nextSubmissions = submissions.filter(
      (submission) => submission.id !== req.params.id
    );

    if (nextSubmissions.length === submissions.length) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    await writeJson(submissionsPath, nextSubmissions);
    res.json({ message: 'Submission deleted.' });
  })
);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use((error, req, res, next) => {
  if (error?.code === 'READ_ONLY_STORAGE') {
    return res.status(503).json({
      error:
        'This deployment is running in a read-only environment. Data updates are unavailable here.'
    });
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

async function bootstrap() {
  if (!isVercelRuntime) {
    await writeJson(siteContentPath, await getSiteContent());
    await writeJson(submissionsPath, await getSubmissions());
  }

  app.listen(port, () => {
    console.log(`WowFolio Studio running on http://127.0.0.1:${port}`);
  });
}

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = app;
