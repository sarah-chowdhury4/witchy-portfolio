import './station.css';
import content from '../content.json';
import { cauldronSvg } from './cauldron';
import { enter, exit } from './transition';

type Flask = (typeof content.flasks)[number];

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
    h('button', { type: 'button', class: `flask flask-${f.kind}`, 'data-flask': f.id, 'aria-pressed': 'false' },
      h('span', { class: 'flask-glass', 'aria-hidden': 'true' }),
      h('span', { class: 'flask-label' }, f.label),
    ),
  );
}

function build(): HTMLElement {
  const skills = content.flasks.filter((f) => f.kind === 'skill');
  const topics = content.flasks.filter((f) => f.kind === 'topic');

  const exitBtn = h('button', { type: 'button', class: 'st-exit' }, '← Exit');
  exitBtn.addEventListener('click', () => void closeStation());

  const pot = h('div', { class: 'st-cauldron' });
  pot.innerHTML = cauldronSvg(160);

  const root = h('div', { class: 'station', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'station-title', hidden: '' },
    h('header', { class: 'st-bar' },
      exitBtn,
      h('h2', { id: 'station-title' }, 'Spell Station'),
      h('p', { class: 'st-sub' }, 'Pick two flasks, brew, and see what they made.'),
    ),
    h('div', { class: 'st-body' },
      h('section', { class: 'st-panel st-shelf', 'aria-labelledby': 'shelf-skills' },
        h('h3', { id: 'shelf-skills' }, 'Skills'),
        h('ul', { class: 'flasks' }, ...skills.map(flaskButton)),
        h('h3', { id: 'shelf-topics' }, 'Topics'),
        h('ul', { class: 'flasks' }, ...topics.map(flaskButton)),
      ),
      h('section', { class: 'st-panel st-brew', 'aria-label': 'Cauldron' },
        pot,
        h('p', { class: 'st-picks', 'aria-live': 'polite' }, 'Your cauldron is empty. Pick two flasks.'),
        h('div', { class: 'st-actions' },
          h('button', { type: 'button', class: 'st-btn st-btn-primary', disabled: '' }, 'Brew'),
          h('button', { type: 'button', class: 'st-btn', disabled: '' }, 'Clear'),
        ),
      ),
      h('section', { class: 'st-panel st-results', 'aria-labelledby': 'results-h' },
        h('h3', { id: 'results-h' }, 'Your brew'),
        h('div', { class: 'st-result', 'aria-live': 'polite' }, h('p', { class: 'st-empty' }, 'Nothing brewed yet.')),
      ),
    ),
  );

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); void closeStation(); }
    if (e.key === 'Tab') trapTab(e, root);
  });
  return root;
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
