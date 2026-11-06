import { cauldronSvg } from './cauldron';

const BUBBLE_COLORS = ['#fff2e0', '#c0c9ee', '#a2aadb', '#898ac4'];
const FILL = '#24264f'; // station background, so the reveal is seamless

export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const done = (a: Animation) => a.finished.catch(() => undefined);

function layerAt(cx: number, cy: number) {
  const layer = document.createElement('div');
  layer.className = 'bubble-layer';
  layer.setAttribute('aria-hidden', 'true');
  const pot = document.createElement('div');
  pot.className = 'bubble-pot';
  pot.innerHTML = cauldronSvg(96);
  pot.style.left = `${cx - 48}px`;
  pot.style.top = `${cy - 56}px`;
  const fill = document.createElement('div');
  fill.className = 'bubble-fill';
  fill.style.background = FILL;
  layer.append(fill, pot);
  document.body.append(layer);
  return { layer, pot, fill };
}

function coverRadius(cx: number, cy: number) {
  const w = window.innerWidth, h = window.innerHeight;
  return Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 40;
}

function spawnBubbles(layer: HTMLElement, cx: number, cy: number, count: number) {
  const anims: Animation[] = [];
  for (let i = 0; i < count; i++) {
    const b = document.createElement('span');
    b.className = 'bubble';
    const size = 16 + Math.random() * 64;
    b.style.width = b.style.height = `${size}px`;
    b.style.left = `${cx - size / 2 + (Math.random() - 0.5) * 60}px`;
    b.style.top = `${cy - 40}px`;
    b.style.background = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
    layer.append(b);
    const dx = (Math.random() - 0.5) * window.innerWidth * 0.9;
    const dy = -(cy + 120) * (0.6 + Math.random() * 0.5);
    anims.push(
      b.animate(
        [
          { transform: 'translate(0,0) scale(0.2)', opacity: 0 },
          { opacity: 1, offset: 0.15 },
          { transform: `translate(${dx}px, ${dy}px) scale(${1 + Math.random() * 1.5})`, opacity: 0.9 },
        ],
        { duration: 700 + Math.random() * 400, delay: Math.random() * 300, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
      ),
    );
  }
  return anims;
}

/** Cauldron appears at the trigger, bubbles fill the screen, then pop to reveal `reveal`. */
export async function enter(origin: DOMRect, reveal: () => void, station: HTMLElement) {
  if (reducedMotion()) {
    reveal();
    await done(station.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 }));
    return;
  }
  const cx = origin.left + origin.width / 2;
  const cy = origin.top + origin.height / 2;
  const { layer, pot, fill } = layerAt(cx, cy);
  const r = coverRadius(cx, cy);

  await done(pot.animate(
    [{ transform: 'scale(0) rotate(-12deg)' }, { transform: 'scale(1.15) rotate(4deg)' }, { transform: 'scale(1) rotate(0)' }],
    { duration: 260, easing: 'ease-out', fill: 'forwards' },
  ));
  pot.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }],
    { duration: 220, iterations: 4 });
  const bubbles = spawnBubbles(layer, cx, cy, 36);
  await done(fill.animate(
    [{ clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${r}px at ${cx}px ${cy}px)` }],
    { duration: 600, delay: 250, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' },
  ));

  reveal();
  pot.remove();
  // Pop: the cover and remaining bubbles burst and fade.
  bubbles.forEach((a) => a.pause());
  await done(layer.animate(
    [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.08)' }],
    { duration: 300, easing: 'ease-in', fill: 'forwards' },
  ));
  layer.remove();
}

/** Reverse: cover the station, shrink back into the cauldron at the trigger. */
export async function exit(origin: DOMRect, hide: () => void, station: HTMLElement) {
  if (reducedMotion()) {
    await done(station.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }));
    hide();
    return;
  }
  const cx = origin.left + origin.width / 2;
  const cy = origin.top + origin.height / 2;
  const { layer, pot, fill } = layerAt(cx, cy);
  const r = coverRadius(cx, cy);
  pot.style.opacity = '0';
  await done(fill.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'forwards' }));
  hide();
  pot.style.opacity = '1';
  await done(fill.animate(
    [{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }, { clipPath: `circle(0px at ${cx}px ${cy}px)` }],
    { duration: 520, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' },
  ));
  await done(pot.animate([{ transform: 'scale(1)' }, { transform: 'scale(0) rotate(12deg)' }],
    { duration: 220, easing: 'ease-in', fill: 'forwards' }));
  layer.remove();
}
