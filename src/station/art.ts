// Potions: "Pixel potions" by Brysiaa (brysiaa.itch.io), recoloured to a
// softer pastel. public/assets/potions.png is 11 bottles x 4 rows of 16px:
// row 0 = still bottle, rows 1-3 = bubbling animation frames.
// 0 red, 1 pink, 2 purple, 3 blue, 4 light blue, 5 cyan, 6 green,
// 7 yellow, 8 orange, 9 white, 10 black.
export const POTION: Record<string, number> = {
  'python': 4, 'java': 8, 'javascript': 7, 'php': 2, 'c': 10, 'sql': 3, 'tailwind': 5,
  'ml': 1, 'nlp': 6, 'llm': 0, 'data-quality': 9,
  'google-cloud': 5, 'mentoring': 1, 'quality-review': 6, 'video-editing': 0,
  'healthcare': 0, 'food': 8, 'discovery': 7, 'tech': 3,
  'games': 2, 'education': 4, 'media': 1, 'systems': 10,
};

export const ASSET = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

/** Inline style for a potion sprite drawn at `scale` x 16px. */
export function potionStyle(id: string, scale = 4): string {
  const col = POTION[id] ?? 0;
  const s = 16 * scale;
  return [
    `width:${s}px`, `height:${s}px`,
    `background-image:url(${ASSET('potions.png')})`,
    `background-size:${176 * scale}px ${64 * scale}px`,
    `background-position:${-col * s}px 0`,
    `--frame:${s}px`,
  ].join(';');
}
