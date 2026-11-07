import './station.css';
import content from '../content.json';
import { cauldronSvg } from './cauldron';
import { enter, exit } from './transition';
import { brew, hint, pick, secretFor } from './brew';
import { buildWelcome, seenWelcome } from './welcome';
import { wireCat } from './cat';
import { buildTutorial } from './tutorial';
import { ASSET, potionStyle } from './art';
import { BOOKS, CANDLE, PLANT } from './decor';
import { brewing, fizzle, success } from './effects';
import { playPop, playSparkle } from './sounds';

type Flask = (typeof content.flasks)[number];

export interface Entry {
  name: string; kind: string; summary: string; tech: string[]; link?: string; tags: string[];
}
const ENTRIES: Entry[] = [
  ...content.projects.map((p) => ({
    name: p.name, kind: p.kind, tech: p.tech, link: p.link, tags: p.tags,
    // a project can carry a station-only summary (e.g. the thesis mentions its game data)
    summary: ('stationSummary' in p && typeof p.stationSummary === 'string') ? p.stationSummary : p.summary,
  })),
  ...content.experience.map((x) => ({
    name: `${x.role} · ${x.org}`, kind: `Experience · ${x.dates}`, summary: x.points[0] ?? '', tech: [], tags: x.tags,
  })),
];
const LABEL = new Map(content.flasks.map((f) => [f.id, f.label]));
let picks: string[] = [];

let station: HTMLElement | null = null;
let trigger: HTMLElement | null = null;
let busy = false;
// Exposed for tests and styling: closed | opening | open | closing
const setState = (v: string) => (document.documentElement.dataset.station = v);

const BACKGROUND = () =>
  [...document.body.children].filter(
    (n): n is HTMLElement => n instanceof HTMLElement && n !== station && !n.classList.contains('bubble-layer'),
  );

function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kids: (Node | string)[]) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  n.append(...kids);
  return n;
}

function flaskButton(f: Flask) {
  return h('li', {},
    h('button', { type: 'button', class: `flask flask-${f.kind}`, 'data-flask': f.id, 'aria-pressed': 'false', draggable: 'true' },
      h('span', { class: 'flask-label' }, f.label),
      h('span', { class: 'potion-sprite', 'aria-hidden': 'true', style: potionStyle(f.id) }),
    ),
  );
}

/** Fanlight at the top of the arch: an inner half-circle, radiating spokes and a transom bar. */
function fanlight() {
  const d = h('span', { class: 'st-fanlight', 'aria-hidden': 'true' });
  const c = { x: 130, y: 130 };
  const spokes = [30, 60, 90, 120, 150].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return `<line x1="${c.x + 56 * Math.cos(r)}" y1="${c.y - 56 * Math.sin(r)}" x2="${c.x + 134 * Math.cos(r)}" y2="${c.y - 134 * Math.sin(r)}"/>`;
  }).join('');
  d.innerHTML = `<svg viewBox="0 0 260 136" preserveAspectRatio="xMidYMax meet" focusable="false">
    <g stroke="#898ac4" stroke-width="7" fill="none">
      <path d="M 74 130 A 56 56 0 0 1 186 130"/>${spokes}
    </g>
    <rect x="0" y="128" width="260" height="8" fill="#898ac4"/>
  </svg>`;
  return d;
}

function decor(svg: string, cls: string) {
  const d = h('li', { class: `decor ${cls}`, 'aria-hidden': 'true' });
  d.innerHTML = svg;
  return d;
}

function build(): HTMLElement {
  const skills = content.flasks.filter((f) => f.kind === 'skill');
  const topics = content.flasks.filter((f) => f.kind === 'topic');

  const exitBtn = h('button', { type: 'button', class: 'st-exit' }, '← Exit');
  exitBtn.addEventListener('click', () => void closeStation());

  const pot = h('div', { class: 'st-cauldron' });
  pot.innerHTML = cauldronSvg(128);
  const catName = content.shop.catName;
  const cat = h('button', { type: 'button', class: 'st-cat-btn', 'aria-label': `Pet ${catName}, the shop cat`, title: `Pet ${catName}` },
    h('span', { class: 'st-cat', 'aria-hidden': 'true', style: `background-image:url(${ASSET('cat-black-sleep.png')})` }));
  const sillPlant = h('div', { class: 'sill-plant', 'aria-hidden': 'true' });
  sillPlant.innerHTML = PLANT;

  const root = h('div', { class: 'station', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'station-title', hidden: '' },
    h('header', { class: 'st-bar' },
      exitBtn,
      h('h2', { id: 'station-title' }, 'Spell Station'),
      h('div', { class: 'st-tools' },
        h('button', { type: 'button', class: 'st-help st-sound', 'aria-pressed': 'false', 'aria-label': 'Mute sound' }, '♪'),
        h('button', { type: 'button', class: 'st-help', 'aria-label': "Replay the shopkeeper's welcome", title: "Replay Sarah's welcome" }, '?'),
        h('button', { type: 'button', class: 'st-tour-btn' }, h('span', { 'aria-hidden': 'true' }, '✦ '), 'How to brew'),
      ),
      h('p', { class: 'sr-only st-cat-status', 'aria-live': 'polite' }),
      h('p', { class: 'st-sub' }, 'Pick two bottles from the shelves, brew, and see what they made.'),
    ),
    h('div', { class: 'st-scene' },
      h('section', { class: 'st-shelf st-shelf-skills', 'aria-labelledby': 'shelf-skills' },
        h('h3', { id: 'shelf-skills', class: 'shelf-sign' }, 'Skills'),
        h('ul', { class: 'flasks' }, ...skills.map(flaskButton)),
      ),
      h('section', { class: 'st-window', 'aria-labelledby': 'results-h' },
        h('div', { class: 'st-window-glass' },
          h('span', { class: 'st-moon', 'aria-hidden': 'true' }),
          fanlight(),
          h('span', { class: 'st-mullions', 'aria-hidden': 'true' }),
          h('h3', { id: 'results-h', class: 'sr-only' }, 'Your brew'),
          h('div', { class: 'st-result', role: 'region', 'aria-labelledby': 'results-h', 'aria-live': 'polite', tabindex: '0' },
            h('p', { class: 'st-empty' }, 'Brew two bottles and your discoveries will appear here.')),
        ),
        h('div', { class: 'st-sill', 'aria-hidden': 'true' }),
      ),
      h('section', { class: 'st-shelf st-shelf-topics', 'aria-labelledby': 'shelf-topics' },
        sillPlant,
        h('h3', { id: 'shelf-topics', class: 'shelf-sign' }, 'Topics'),
        h('ul', { class: 'flasks' }, ...topics.map(flaskButton), decor(BOOKS, 'decor-books'), decor(CANDLE, 'decor-candle'),
          h('li', { class: 'cat-spot' }, cat)),
      ),
    ),
    h('section', { class: 'st-counter st-brew', 'aria-label': 'Cauldron' },
      h('div', { class: 'st-slots', 'aria-hidden': 'true' },
        h('span', { class: 'potion-sprite slot' }), h('span', { class: 'potion-sprite slot' })),
      pot,
      h('div', { class: 'st-counter-text' },
        h('p', { class: 'st-picks', 'aria-live': 'polite' }, 'Your cauldron is empty. Pick two bottles.'),
        h('div', { class: 'st-actions' },
          h('button', { type: 'button', class: 'st-btn st-btn-primary st-brew-btn', disabled: '' }, 'Brew'),
          h('button', { type: 'button', class: 'st-btn st-clear-btn', disabled: '' }, 'Clear'),
        ),
      ),
    ),
  );

  root.append(h('footer', { class: 'st-footer' },
    h('p', {},
      'Potions & sparks: ', h('a', { href: 'https://brysiaa.itch.io/pixel-potions-16x16-px', target: '_blank', rel: 'noopener noreferrer' }, 'Brysiaa', h('span', { class: 'sr-only' }, ' (opens in a new tab)')),
      ' · Sleeping cat: ', h('a', { href: 'https://toffeecraft.itch.io/cat-sleeping-animation-free', target: '_blank', rel: 'noopener noreferrer' }, 'Toffeecraft', h('span', { class: 'sr-only' }, ' (opens in a new tab)')),
      ' · Sounds from ', h('a', { href: 'https://pixabay.com/sound-effects/', target: '_blank', rel: 'noopener noreferrer' }, 'Pixabay', h('span', { class: 'sr-only' }, ' (opens in a new tab)')),
      ': Dragon Studio (meow, pop), humordome, koiroylers, shidenbeatsmusic (sparkles)'),
    h('p', {}, 'Cauldron, window, shelves and decor are hand-coded pixel art. Fonts: Jersey 10, Atkinson Hyperlegible. Built with Vite + TypeScript, hosted on AWS Amplify.'),
  ));
  const welcome = buildWelcome(content.shop.welcome, 'Sarah', () =>
    root.querySelector<HTMLElement>('.flask')?.focus({ preventScroll: true }));
  root.append(welcome);
  root.querySelector('.st-help:not(.st-sound)')?.addEventListener('click', () => openWelcome(root));
  const tourBtn = root.querySelector<HTMLButtonElement>('.st-tour-btn')!;
  const tour = buildTutorial(root, () => tourBtn.focus({ preventScroll: true }));
  tourBtn.addEventListener('click', () => {
    const w = root.querySelector<HTMLElement & { close?: () => void }>('.st-welcome');
    if (w && !w.hidden) w.close?.();
    tour.start?.();
  });
  wireCat(root, catName);
  wireBrewing(root);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      const w = root.querySelector<HTMLElement & { close?: () => void }>('.st-welcome');
      const t = root.querySelector<HTMLElement & { stop?: () => void }>('.st-tour');
      if (t && !t.hidden) t.stop?.();
      else if (w && !w.hidden) w.close?.();
      else void closeStation();
    }
    if (e.key === 'Tab') trapTab(e, root);
  });
  return root;
}

function wireBrewing(root: HTMLElement) {
  const brewArea = root.querySelector<HTMLElement>('.st-brew')!;
  const brewBtn = root.querySelector<HTMLButtonElement>('.st-brew-btn')!;
  const clearBtn = root.querySelector<HTMLButtonElement>('.st-clear-btn')!;

  root.querySelectorAll<HTMLButtonElement>('.flask').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.flask!;
      if (!picks.includes(id)) playPop();
      setPicks(pick(picks, id));
    });
    btn.addEventListener('dragstart', (e) => {
      e.dataTransfer?.setData('text/plain', btn.dataset.flask!);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
    });
  });
  brewArea.addEventListener('dragover', (e) => { e.preventDefault(); brewArea.classList.add('is-drop'); });
  brewArea.addEventListener('dragleave', () => brewArea.classList.remove('is-drop'));
  brewArea.addEventListener('drop', (e) => {
    e.preventDefault();
    brewArea.classList.remove('is-drop');
    const id = e.dataTransfer?.getData('text/plain');
    if (id && LABEL.has(id) && !picks.includes(id)) { playPop(); setPicks(pick(picks, id)); }
  });
  let brewingNow = false;
  brewBtn.addEventListener('click', async () => {
    if (picks.length !== 2 || brewingNow) return;
    brewingNow = true;
    brewBtn.disabled = true;
    brewBtn.textContent = 'Brewing…';
    const [a, b] = picks;
    try {
      await brewing(root);
      const reveal = () => showResult(root, a, b);
      const revealWithSparkle = () => { playSparkle(); reveal(); };
      const good = brew(ENTRIES, a, b).length > 0 || !!secretFor(content.secrets, a, b);
      await (good ? success(root, revealWithSparkle) : fizzle(root, reveal));
    } finally {
      brewingNow = false;
      brewBtn.textContent = 'Brew';
      brewBtn.disabled = picks.length !== 2;
    }
  });
  root.addEventListener('station:set-picks', (e) => setPicks((e as CustomEvent<string[]>).detail));
  clearBtn.addEventListener('click', () => setPicks([]));

  function setPicks(next: string[]) {
    picks = next;
    root.querySelectorAll<HTMLButtonElement>('.flask').forEach((b) =>
      b.setAttribute('aria-pressed', String(picks.includes(b.dataset.flask!))));
    const names = picks.map((id) => LABEL.get(id));
    root.querySelector('.st-picks')!.textContent =
      picks.length === 0 ? 'Your cauldron is empty. Pick two bottles.'
      : picks.length === 1 ? `In the cauldron: ${names[0]}. Pick one more.`
      : `In the cauldron: ${names[0]} + ${names[1]}. Ready to brew!`;
    root.querySelectorAll<HTMLElement>('.st-slots .slot').forEach((slot, i) => {
      const id = picks[i];
      slot.setAttribute('style', id ? potionStyle(id, 4) : '');
      slot.classList.toggle('is-empty', !id);
    });
    brewBtn.disabled = picks.length !== 2;
    clearBtn.disabled = picks.length === 0;
  }
}

const FIZZLES = [
  'The brew fizzles. A puff of smoke, and nothing else.',
  'Bubble, bubble... nope. These two haven\'t met yet.',
  'The cauldron sputters and goes quiet.',
  'Pfft. The cat sniffs the smoke and walks away.',
];
const fizzleFor = (a: string, b: string) =>
  FIZZLES[[...(a + b)].reduce((n, ch) => n + ch.charCodeAt(0), 0) % FIZZLES.length];

function potionCard(e: Entry) {
  return h('li', { class: 'potion' },
    h('span', { class: 'potion-icon', 'aria-hidden': 'true' }, '✦'),
    h('div', { class: 'potion-body' },
      h('p', { class: 'potion-kind' }, e.kind),
      h('h4', {}, e.name),
      h('p', {}, e.summary),
      ...(e.link ? [h('a', { href: e.link, target: '_blank', rel: 'noopener noreferrer' },
        'GitHub →', h('span', { class: 'sr-only' }, ` ${e.name} (opens in a new tab)`))] : []),
    ),
  );
}

function showResult(root: HTMLElement, a: string, b: string) {
  const out = root.querySelector<HTMLElement>('.st-result')!;
  const found = brew(ENTRIES, a, b);
  const title = `${LABEL.get(a)} + ${LABEL.get(b)}`;
  out.classList.toggle('is-fizzle', !found.length);
  out.closest('.st-window-glass')?.classList.add('has-result');
  out.scrollTop = 0;
  const glass = out.closest('.st-window-glass');
  if (glass) {
    const r = glass.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) {
      glass.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }
  if (found.length) {
    out.replaceChildren(
      h('p', { class: 'st-result-title' },
        h('span', { class: 'potion-sprite', 'aria-hidden': 'true', style: potionStyle(a, 2) }),
        h('span', { class: 'potion-sprite', 'aria-hidden': 'true', style: potionStyle(b, 2) }),
        title),
      h('p', { class: 'st-result-count' }, found.length === 1 ? '1 discovery' : `${found.length} discoveries`),
      h('ul', { class: 'potions' }, ...found.map(potionCard)),
    );
    return;
  }
  const secret = secretFor(content.secrets, a, b);
  if (secret) {
    out.classList.remove('is-fizzle');
    out.replaceChildren(
      h('p', { class: 'st-result-title' },
        h('span', { class: 'potion-sprite', 'aria-hidden': 'true', style: potionStyle(a, 2) }),
        h('span', { class: 'potion-sprite', 'aria-hidden': 'true', style: potionStyle(b, 2) }),
        title),
      h('p', { class: 'st-result-count st-secret-tag' }, '✦ Secret recipe ✦'),
      h('div', { class: 'potion secret' }, h('div', { class: 'potion-body' }, h('h4', {}, secret.title), h('p', {}, secret.text))),
    );
    return;
  }
  const tip = hint(ENTRIES, content.flasks, a, b);
  const nodes: (Node | string)[] = [
    h('p', { class: 'st-result-title' }, title),
    h('p', { class: 'st-result-count' }, 'Fizzle!'),
    h('p', { class: 'fizzle-line' }, fizzleFor(a, b)),
  ];
  if (tip) {
    const tryBtn = h('button', { type: 'button', class: 'st-btn st-try' },
      `Try ${LABEL.get(tip.keep)} + ${LABEL.get(tip.partner)}`);
    tryBtn.addEventListener('click', () => {
      root.dispatchEvent(new CustomEvent('station:set-picks', { detail: [tip.keep, tip.partner] }));
      showResult(root, tip.keep, tip.partner);
      root.querySelector<HTMLElement>('.st-result')?.focus();
    });
    nodes.push(h('p', { class: 'fizzle-hint' }, 'Hint: one of these works with something else.'), tryBtn);
  }
  out.replaceChildren(...nodes);
}

function openWelcome(root: HTMLElement) {
  root.querySelector<HTMLElement & { open?: () => void }>('.st-welcome')?.open?.();
}

function trapTab(e: KeyboardEvent, root: HTMLElement) {
  const focusables = [...root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')]
    .filter((n) => n.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0], last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

export async function openStation(from: HTMLElement) {
  if (busy || (station && !station.hidden)) return;
  busy = true;
  setState('opening');
  trigger = from;
  const scrollY = window.scrollY;
  if (!station) { station = build(); document.body.append(station); }
  const s = station;
  await enter(from.getBoundingClientRect(), () => {
    BACKGROUND().forEach((n) => (n.inert = true));
    document.documentElement.classList.add('station-open');
    s.hidden = false;
    s.querySelector<HTMLElement>('.st-exit')?.focus({ preventScroll: true });
    window.scrollTo(0, scrollY);
  }, s);
  busy = false;
  setState('open');
  if (!seenWelcome()) openWelcome(s);
}

export async function closeStation() {
  if (busy || !station || station.hidden) return;
  busy = true;
  setState('closing');
  const s = station;
  const t = trigger;
  const scrollY = window.scrollY;
  const rect = t?.getBoundingClientRect() ?? new DOMRect(innerWidth / 2, innerHeight / 2, 0, 0);
  await exit(rect, () => {
    s.hidden = true;
    BACKGROUND().forEach((n) => (n.inert = false));
    document.documentElement.classList.remove('station-open');
  }, s);
  window.scrollTo(0, scrollY);
  t?.focus({ preventScroll: true });
  busy = false;
  setState('closed');
}
