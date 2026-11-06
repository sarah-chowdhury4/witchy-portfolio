import './style.css';

// Stage 0 check: Phaser loads lazily as its own chunk, only when requested.
const button = document.querySelector<HTMLButtonElement>('#phaser-check');
const status = document.querySelector<HTMLParagraphElement>('#phaser-status');

button?.addEventListener('click', async () => {
  if (!status) return;
  status.textContent = 'Loading Phaser...';
  try {
    const Phaser = await import('phaser');
    status.textContent = `Phaser ${Phaser.VERSION} loaded.`;
  } catch (err) {
    status.textContent = 'Phaser failed to load.';
    console.error(err);
  }
});
