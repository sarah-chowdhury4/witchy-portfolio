// Shopkeeper welcome: a Stardew-style dialogue box shown the first time the
// station opens (remembered per browser), and on demand from the "?" button.
const KEY = 'witchy-welcome-seen';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const seenWelcome = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { localStorage.setItem(KEY, '1'); } catch { /* storage unavailable */ } };

export function buildWelcome(lines: string[], speaker: string, onClose: () => void): HTMLElement {
  const box = document.createElement('div');
  box.className = 'st-welcome';
  box.hidden = true;
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', `${speaker} says`);
  box.innerHTML = `
    <p class="st-welcome-name">${speaker}</p>
    <p class="st-welcome-text"><span class="typed" aria-hidden="true"></span><span class="sr-only full" aria-live="polite"></span></p>
    <div class="st-welcome-actions">
      <button type="button" class="st-btn st-welcome-skip">Skip</button>
      <button type="button" class="st-btn st-btn-primary st-welcome-next">Next ▸</button>
    </div>`;
  const typed = box.querySelector<HTMLElement>('.typed')!;
  const full = box.querySelector<HTMLElement>('.full')!;
  const next = box.querySelector<HTMLButtonElement>('.st-welcome-next')!;
  const skip = box.querySelector<HTMLButtonElement>('.st-welcome-skip')!;
  let i = 0, timer = 0, typing = false;

  const finishLine = () => { window.clearInterval(timer); typing = false; typed.textContent = lines[i]; };
  const show = (n: number) => {
    i = n;
    full.textContent = lines[i];
    next.textContent = i === lines.length - 1 ? 'Start brewing ✦' : 'Next ▸';
    if (reduced()) { typed.textContent = lines[i]; return; }
    typed.textContent = '';
    typing = true;
    let c = 0;
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      c += 2;
      typed.textContent = lines[i].slice(0, c);
      if (c >= lines[i].length) finishLine();
    }, 24);
  };
  const close = () => { finishLine(); box.hidden = true; markSeen(); onClose(); };

  next.addEventListener('click', () => {
    if (typing) return finishLine();
    if (i < lines.length - 1) show(i + 1); else close();
  });
  skip.addEventListener('click', close);
  (box as HTMLElement & { open?: () => void; close?: () => void }).open = () => { box.hidden = false; show(0); next.focus(); };
  (box as HTMLElement & { close?: () => void }).close = close;
  return box;
}
