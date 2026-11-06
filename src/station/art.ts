// Sprite positions in public/assets/potions.png (built from Modnifico's
// FREE Potions Assets Pack, sheet 01). Row 0 = full bottle, row 1 = poured.
export const POTION_ORDER = [
  'python', 'java', 'javascript', 'php', 'c', 'sql', 'tailwind',
  'ml', 'nlp', 'llm', 'data-quality',
  'google-cloud', 'mentoring', 'quality-review', 'video-editing',
  'healthcare', 'food', 'discovery', 'tech', 'games', 'education', 'media', 'systems',
] as const;

export const ASSET = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

/** Inline style for a 32x32 potion sprite; `poured` shows the nearly-empty bottle. */
export function potionStyle(id: string, poured = false): string {
  const i = (POTION_ORDER as readonly string[]).indexOf(id);
  return `background-image:url(${ASSET('potions.png')});background-position:${-32 * Math.max(i, 0)}px ${poured ? -32 : 0}px`;
}
