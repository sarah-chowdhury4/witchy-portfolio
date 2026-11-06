import './style.css';
import content from '../content.json';

type Child = Node | string | null | undefined | false;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of children) if (c) node.append(c);
  return node;
}

const extLink = (href: string, text: string, srExtra = '') =>
  el('a', { href, target: '_blank', rel: 'noopener noreferrer' },
    text,
    el('span', { class: 'sr-only' }, `${srExtra} (opens in a new tab)`),
  );

function fill(name: string, ...nodes: Node[]) {
  const target = document.querySelector(`[data-list="${name}"]`);
  if (!target) throw new Error(`Missing [data-list="${name}"]`);
  target.replaceChildren(...nodes);
}

function render() {
  document.querySelector('[data-field="name"]')!.textContent = content.name;
  document.querySelector('[data-field="title"]')!.textContent = content.title;

  fill('about', ...content.about.map((p) => el('p', {}, p)));

  fill(
    'skills',
    ...content.skills.map((g, i) =>
      el('div', { class: `skill-group tint-${i % 4}` },
        el('h3', {}, g.group),
        el('ul', { class: 'chips' }, ...g.items.map((s) => el('li', {}, s))),
      ),
    ),
  );

  fill(
    'projects',
    ...content.projects.map((p) =>
      el('article', { class: 'card' },
        el('h3', {}, p.name),
        el('p', { class: 'meta' }, p.kind),
        el('ul', { class: 'chips small' }, ...p.tech.map((t) => el('li', {}, t))),
        el('ul', { class: 'points' }, ...p.points.map((t) => el('li', {}, t))),
        el('p', { class: 'card-link' }, extLink(p.link, 'More on GitHub →', `: ${p.name} and other work`)),
      ),
    ),
  );

  fill(
    'experience',
    ...content.experience.map((x) =>
      el('article', { class: 'job' },
        el('h3', {}, `${x.role} · ${x.org}`),
        el('p', { class: 'meta' }, [x.type, x.dates].filter(Boolean).join(' · ')),
        el('ul', { class: 'points' }, ...x.points.map((t) => el('li', {}, t))),
      ),
    ),
  );

  fill(
    'certifications',
    ...content.certifications.map((c) =>
      el('li', {}, el('span', { class: 'cert-name' }, c.name), el('span', { class: 'meta' }, c.issuer)),
    ),
  );

  const { email, github, linkedin } = content.contact;
  fill(
    'contact',
    el('li', {}, 'Email: ', el('a', { href: `mailto:${email}` }, email)),
    el('li', {}, 'GitHub: ', extLink(github, github.replace('https://', ''))),
    el('li', {}, 'LinkedIn: ', extLink(linkedin, linkedin.replace('https://www.', ''))),
  );
}

function wireExplore() {
  const btn = document.querySelector<HTMLButtonElement>('#explore-btn');
  const status = document.querySelector<HTMLParagraphElement>('#explore-status');
  btn?.addEventListener('click', () => {
    if (status) status.textContent = 'The spell station is still brewing. Check back soon!';
  });
}

// Highlight the nav link for the section currently on screen.
function wireNavHighlight() {
  const links = new Map(
    [...document.querySelectorAll<HTMLAnchorElement>('.nav ul a')].map((a) => [a.hash.slice(1), a]),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        links.get(e.target.id)?.setAttribute('aria-current', 'location');
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

render();
wireExplore();
wireNavHighlight();
