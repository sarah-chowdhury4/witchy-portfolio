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

const extLink = (href: string, text: string) =>
  el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, text);

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
    ...content.skills.map((g) =>
      el('div', { class: 'skill-group' },
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
        el('p', { class: 'card-link' }, extLink(p.link, 'View on GitHub →')),
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

render();
wireExplore();
