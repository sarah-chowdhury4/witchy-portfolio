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

const srOnly = (text: string) => el('span', { class: 'sr-only' }, text);

const extLink = (href: string, text: string, srExtra = '', cls = '') =>
  el('a', { href, target: '_blank', rel: 'noopener noreferrer', ...(cls ? { class: cls } : {}) },
    text,
    srOnly(`${srExtra} (opens in a new tab)`),
  );

const chips = (items: string[], cls = 'chips') =>
  el('ul', { class: cls }, ...items.map((t) => el('li', {}, t)));

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
    'highlights',
    ...content.highlights.map((h) =>
      el('li', { class: 'card stat' },
        el('span', { class: 'stat-value' }, h.value),
        el('span', { class: 'stat-label' }, h.label),
      ),
    ),
  );

  fill(
    'skills',
    ...content.skills.map((g) =>
      el('article', { class: 'card' },
        el('h3', {}, g.group),
        chips(g.items),
      ),
    ),
  );

  fill(
    'projects',
    ...content.projects.map((p) => {
      const more = p.points.length
        ? el('details', { class: 'more' },
            el('summary', {}, 'Show more', srOnly(` about ${p.name}`)),
            el('ul', { class: 'points' }, ...p.points.map((t) => el('li', {}, t))),
          )
        : null;
      return el('article', { class: 'card project' },
        el('p', { class: 'meta' }, p.kind),
        el('h3', {}, p.name),
        chips(p.tech, 'chips small'),
        el('p', { class: 'summary' }, p.summary),
        more,
        el('p', { class: 'card-foot' }, extLink(p.link, 'GitHub →', `: ${p.name} and other work`)),
      );
    }),
  );

  fill(
    'experience',
    ...content.experience.map((x) =>
      el('article', { class: 'card job' },
        el('div', { class: 'job-head' },
          el('h3', {}, x.role),
          el('p', { class: 'meta' }, x.dates),
        ),
        el('p', { class: 'job-org' }, [x.org, x.type].filter(Boolean).join(' · ')),
        el('ul', { class: 'points' }, ...x.points.map((t) => el('li', {}, t))),
      ),
    ),
  );

  fill(
    'certifications',
    ...content.certifications.map((c) =>
      el('li', { class: 'card cert' },
        el('span', { class: 'cert-icon', 'aria-hidden': 'true' }, '✦'),
        el('span', {}, el('span', { class: 'cert-name' }, c.name), el('span', { class: 'meta' }, c.issuer)),
      ),
    ),
  );

  const { email, github, linkedin } = content.contact;
  fill(
    'contact',
    el('li', {}, el('a', { href: `mailto:${email}`, class: 'btn btn-secondary' }, 'Email', srOnly(`: ${email}`))),
    el('li', {}, extLink(github, 'GitHub', '', 'btn btn-secondary')),
    el('li', {}, extLink(linkedin, 'LinkedIn', '', 'btn btn-secondary')),
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
