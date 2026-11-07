// "How to brew" tutorial: a short guided tour that spotlights each part of
// the station in turn. Next/Back/Done buttons, Esc to leave, arrow-free.
interface Step { target: string; title: string; text: string }

const STEPS: Step[] = [
  { target: '.st-shelf-skills', title: 'Pick a bottle', text: 'These shelves hold my skills (left) and topics (right). Click or tap a bottle to pour it into the cauldron. You can also drag it there.' },
  { target: '.st-counter', title: 'Add a second one', text: 'Pick one more bottle. Both appear here on the counter. Picking a third swaps out the oldest, and Clear empties the cauldron.' },
  { target: '.st-brew-btn', title: 'Brew!', text: "Press Brew. If I've used both together, the brew floats up to the window." },
  { target: '.st-window', title: 'See what I made', text: 'Discoveries appear in the window, with links to the work. If a mix fizzles, I suggest one that works. A few mixes hide secret recipes about me.' },
  { target: '.st-cat-btn', title: 'Meet Luna', text: "That's Luna, the shop cat. Give her a pet. The ♪ button up top turns her meow off." },
];

type TourBox = HTMLElement & { start?: () => void; stop?: () => void };

export function buildTutorial(root: HTMLElement, onDone: () => void): TourBox {
  const spot = document.createElement('div');
  spot.className = 'st-tour-spot';
  spot.setAttribute('aria-hidden', 'true');
  spot.hidden = true;

  const card = document.createElement('div') as TourBox;
  card.className = 'st-tour';
  card.hidden = true;
  card.setAttribute('role', 'group');
  card.setAttribute('aria-roledescription', 'tutorial');
  card.innerHTML = `
    <p class="st-tour-step" aria-hidden="true"></p>
    <h3 class="st-tour-title"></h3>
    <p class="st-tour-text"></p>
    <p class="sr-only st-tour-live" aria-live="polite"></p>
    <div class="st-tour-actions">
      <button type="button" class="st-btn st-tour-skip">Skip tour</button>
      <button type="button" class="st-btn st-tour-back">Back</button>
      <button type="button" class="st-btn st-btn-primary st-tour-next">Next ▸</button>
    </div>`;
  root.append(spot, card);

  const q = <T extends HTMLElement>(s: string) => card.querySelector<T>(s)!;
  const next = q<HTMLButtonElement>('.st-tour-next');
  const back = q<HTMLButtonElement>('.st-tour-back');
  let i = 0;

  const place = () => {
    const el = root.querySelector<HTMLElement>(STEPS[i].target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pad = 8;
    Object.assign(spot.style, {
      left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px`,
    });
    // try below, above, right, left of the target; else pin to the bottom
    const cw = Math.min(380, window.innerWidth - 32);
    card.style.width = `${cw}px`;
    const ch = card.offsetHeight || 220;
    const W = window.innerWidth, H = window.innerHeight, gap = 16, m = 12;
    const clampX = (x: number) => Math.min(Math.max(m, x), W - cw - m);
    const clampY = (y: number) => Math.min(Math.max(m, y), H - ch - m);
    let pos: [number, number];
    if (r.bottom + gap + ch <= H - m) pos = [clampX(r.left + r.width / 2 - cw / 2), r.bottom + gap];
    else if (r.top - gap - ch >= m) pos = [clampX(r.left + r.width / 2 - cw / 2), r.top - gap - ch];
    else if (r.right + gap + cw <= W - m) pos = [r.right + gap, clampY(r.top + r.height / 2 - ch / 2)];
    else if (r.left - gap - cw >= m) pos = [r.left - gap - cw, clampY(r.top + r.height / 2 - ch / 2)];
    else pos = [clampX(W / 2 - cw / 2), H - ch - m];
    Object.assign(card.style, { left: `${pos[0]}px`, top: `${pos[1]}px` });
  };

  const show = (n: number) => {
    i = n;
    const s = STEPS[i];
    q('.st-tour-step').textContent = `Step ${i + 1} of ${STEPS.length}`;
    q('.st-tour-title').textContent = s.title;
    q('.st-tour-text').textContent = s.text;
    q('.st-tour-live').textContent = `Step ${i + 1} of ${STEPS.length}. ${s.title}. ${s.text}`;
    card.setAttribute('aria-label', `How to brew, step ${i + 1} of ${STEPS.length}`);
    back.hidden = i === 0;
    next.textContent = i === STEPS.length - 1 ? 'Done ✦' : 'Next ▸';
    root.querySelector<HTMLElement>(s.target)?.scrollIntoView({ block: 'center', behavior: 'auto' });
    requestAnimationFrame(place);
  };

  const onMove = () => { if (!card.hidden) place(); };
  const stop = () => {
    card.hidden = true; spot.hidden = true;
    root.removeEventListener('scroll', onMove);
    window.removeEventListener('resize', onMove);
    onDone();
  };

  next.addEventListener('click', () => (i < STEPS.length - 1 ? show(i + 1) : stop()));
  back.addEventListener('click', () => i > 0 && show(i - 1));
  q('.st-tour-skip').addEventListener('click', stop);

  card.start = () => {
    card.hidden = false; spot.hidden = false;
    root.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('resize', onMove);
    show(0);
    next.focus({ preventScroll: true });
  };
  card.stop = stop;
  return card;
}
