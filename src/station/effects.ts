// Brewing effects (Stage 7). Plain DOM + Web Animations; nothing runs when
// the visitor prefers reduced motion. Sparks: "Pixel potions" by Brysiaa.
import { ASSET } from './art';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const done = (a: Animation) => a.finished.then(() => undefined, () => undefined);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const BUBBLES = ['#fff2e0', '#c0c9ee', '#a2aadb'];

function layer(root: HTMLElement) {
  const l = document.createElement('div');
  l.className = 'fx-layer';
  l.setAttribute('aria-hidden', 'true');
  root.append(l);
  return l;
}
const center = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
};
function dot(l: HTMLElement, cls: string, x: number, y: number, size: number, color?: string) {
  const d = document.createElement('span');
  d.className = cls;
  Object.assign(d.style, { left: `${x - size / 2}px`, top: `${y - size / 2}px`, width: `${size}px`, height: `${size}px` });
  if (color) d.style.background = color;
  l.append(d);
  return d;
}

/** Cauldron bubbles and shakes; resolves when the brew is ready to reveal. */
export async function brewing(root: HTMLElement): Promise<void> {
  if (reduced()) return;
  const pot = root.querySelector('.st-cauldron');
  if (!pot) return;
  const l = layer(root);
  const { x, r } = center(pot);
  const top = r.top + r.height * 0.15;
  pot.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }],
    { duration: 180, iterations: 4 },
  );
  const anims = Array.from({ length: 16 }, (_, i) => {
    const size = Math.round(rand(2, 5)) * 2; // even px keeps them crisp
    const b = dot(l, 'fx-bubble', x + rand(-r.width * 0.3, r.width * 0.3), top, size, BUBBLES[i % BUBBLES.length]);
    return b.animate(
      [{ transform: 'translateY(0)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translateY(${-rand(40, 110)}px)`, opacity: 0 }],
      { duration: rand(400, 600), delay: rand(0, 200), easing: 'ease-out', fill: 'forwards' },
    );
  });
  await Promise.all(anims.map(done));
  l.remove();
}

/** Success: glowing orbs float from the cauldron to the window, then sparks burst. */
export async function success(root: HTMLElement, reveal: () => void): Promise<void> {
  const pot = root.querySelector('.st-cauldron');
  const glass = root.querySelector('.st-window-glass');
  if (reduced() || !pot || !glass) { reveal(); return; }
  const l = layer(root);
  const from = center(pot), to = center(glass);
  const orbs = Array.from({ length: 5 }, (_, i) => {
    const o = dot(l, 'fx-orb', from.x + rand(-20, 20), from.r.top + 10, 14);
    const mx = (from.x + to.x) / 2 + rand(-80, 80) - from.x, my = (from.r.top + to.y) / 2 - from.r.top - rand(40, 120);
    return o.animate(
      [
        { transform: 'translate(0,0) scale(0.4)', opacity: 0 },
        { transform: `translate(${mx}px, ${my}px) scale(1)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${to.x - from.x}px, ${to.y - from.r.top - 10}px) scale(0.6)`, opacity: 0 },
      ],
      { duration: 600, delay: i * 50, easing: 'ease-in-out', fill: 'forwards' },
    );
  });
  await Promise.all(orbs.map(done));
  reveal();
  const sparks = Array.from({ length: 10 }, () => {
    const s = dot(l, 'fx-spark', to.r.left + rand(10, to.r.width - 10), to.r.top + rand(10, to.r.height - 40), 48);
    s.style.backgroundImage = `url(${ASSET('spark.png')})`;
    return s.animate(
      [{ backgroundPosition: '0 0', opacity: 1 }, { backgroundPosition: '-144px 0', opacity: 0.2 }],
      { duration: 360, delay: rand(0, 300), easing: 'steps(3, end)', fill: 'forwards' },
    );
  });
  await Promise.all(sparks.map(done));
  l.remove();
}

/** Fizzle: grey smoke puffs out of the cauldron. */
export async function fizzle(root: HTMLElement, reveal: () => void): Promise<void> {
  reveal();
  const pot = root.querySelector('.st-cauldron');
  if (reduced() || !pot) return;
  const l = layer(root);
  const { x, r } = center(pot);
  const puffs = Array.from({ length: 8 }, () => {
    const p = dot(l, 'fx-smoke', x + rand(-30, 30), r.top + 10, rand(24, 44));
    return p.animate(
      [{ transform: 'translate(0,0) scale(0.4)', opacity: 0.85 }, { transform: `translate(${rand(-40, 40)}px, ${-rand(60, 130)}px) scale(1.6)`, opacity: 0 }],
      { duration: rand(700, 1000), delay: rand(0, 200), easing: 'ease-out', fill: 'forwards' },
    );
  });
  await Promise.all(puffs.map(done));
  l.remove();
}
