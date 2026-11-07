// Luna the shop cat (Stage 8): click/tap/Enter to pet her. Hearts float up
// and she meows (see sounds.ts) unless sound is muted.
import { HEART } from './decor';
import { playMeow, setSound, soundOn } from './sounds';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const LINES = ['Luna purrs.', 'Luna stretches, then curls back up.', 'Luna flicks her tail happily.', 'Luna purrs louder.'];

export function wireCat(root: HTMLElement, catName: string) {
  const btn = root.querySelector<HTMLButtonElement>('.st-cat-btn');
  const status = root.querySelector<HTMLElement>('.st-cat-status');
  const toggle = root.querySelector<HTMLButtonElement>('.st-sound');
  let pets = 0, last = -Infinity;

  const syncToggle = () => {
    if (!toggle) return;
    const on = soundOn();
    // one fixed label; the pressed state says whether sound is muted
    toggle.setAttribute('aria-pressed', String(!on));
    toggle.title = on ? 'Sound on (click to mute)' : 'Sound muted (click to unmute)';
  };
  syncToggle();
  toggle?.addEventListener('click', () => { setSound(!soundOn()); syncToggle(); });

  btn?.addEventListener('click', () => {
    const now = performance.now();
    if (now - last < 600) return;
    last = now;
    playMeow();
    const line = LINES[pets++ % LINES.length].replace('Luna', catName);
    if (status) { status.textContent = ''; requestAnimationFrame(() => (status.textContent = line)); }
    hearts(btn);
  });
}

function hearts(from: HTMLElement) {
  const r = from.getBoundingClientRect();
  const layer = document.createElement('div');
  layer.className = 'fx-layer';
  layer.setAttribute('aria-hidden', 'true');
  (from.closest('.station') ?? document.body).append(layer);
  const count = reduced() ? 1 : 4;
  const anims = Array.from({ length: count }, (_, i) => {
    const h = document.createElement('span');
    h.className = 'fx-heart';
    h.innerHTML = HEART;
    h.style.left = `${r.left + r.width * (0.25 + 0.5 * Math.random()) - 10}px`;
    h.style.top = `${r.top}px`;
    layer.append(h);
    return reduced()
      ? h.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: 'forwards' })
      : h.animate(
        [{ transform: 'translate(0,0) scale(0.6)', opacity: 0 }, { opacity: 1, offset: 0.2 },
         { transform: `translate(${(Math.random() - 0.5) * 50}px, ${-60 - Math.random() * 50}px) scale(1.1)`, opacity: 0 }],
        { duration: 1000, delay: i * 120, easing: 'ease-out', fill: 'forwards' });
  });
  Promise.all(anims.map((a) => a.finished.catch(() => undefined))).then(() => layer.remove());
}
