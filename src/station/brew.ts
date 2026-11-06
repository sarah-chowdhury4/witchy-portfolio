// Pure brewing logic: no DOM, no imports, so it can be unit-tested with node --test.

export interface Flask { id: string; label: string; kind: string }
export interface Item { name: string; tags: string[] }

/** Items tagged with BOTH flasks, in their original order. */
export function brew<T extends Item>(items: T[], a: string, b: string): T[] {
  if (a === b) return [];
  return items.filter((i) => i.tags.includes(a) && i.tags.includes(b));
}

/**
 * For an empty brew: suggest swapping one pick for a partner that does match.
 * Keeps whichever pick has the strongest partner (most matches); ties go to
 * the first pick, then to flask order. Returns null if neither pick matches anything.
 */
export function hint(items: Item[], flasks: Flask[], a: string, b: string): { keep: string; partner: string; count: number } | null {
  let best: { keep: string; partner: string; count: number } | null = null;
  for (const keep of [a, b]) {
    for (const f of flasks) {
      if (f.id === a || f.id === b) continue;
      const count = brew(items, keep, f.id).length;
      if (count > 0 && (!best || count > best.count)) best = { keep, partner: f.id, count };
    }
  }
  return best;
}

/** Picking rule: toggle off if already picked; otherwise add, dropping the oldest when two are in. */
export function pick(current: string[], id: string): string[] {
  if (current.includes(id)) return current.filter((x) => x !== id);
  return [...current, id].slice(-2);
}

/** Tags that point at no flask: a content mistake. */
export function unknownTags(items: Item[], flasks: Flask[]): string[] {
  const ids = new Set(flasks.map((f) => f.id));
  return [...new Set(items.flatMap((i) => i.tags.filter((t) => !ids.has(t))))];
}

export interface Secret { pair: string[]; title: string; text: string }

/** A secret personal recipe for this pair (order doesn't matter), if any. */
export function secretFor<T extends Secret>(secrets: T[], a: string, b: string): T | undefined {
  return secrets.find((s) => s.pair.includes(a) && s.pair.includes(b) && a !== b);
}
