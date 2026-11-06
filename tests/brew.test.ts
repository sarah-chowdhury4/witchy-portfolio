import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { brew, hint, pick, unknownTags, type Item } from '../src/station/brew.ts';

const content = JSON.parse(readFileSync(new URL('../src/content.json', import.meta.url), 'utf8'));
const items: Item[] = [...content.projects, ...content.experience].map((i: any) => ({ name: i.name ?? `${i.role} · ${i.org}`, tags: i.tags }));
const flasks = content.flasks;
const ids: string[] = flasks.map((f: any) => f.id);

test('every tag names a real flask', () => {
  assert.deepEqual(unknownTags(items, flasks), []);
});

test('every flask is used by at least one item', () => {
  for (const id of ids) assert.ok(items.some((i) => i.tags.includes(id)), `unused flask: ${id}`);
});

test('every pair returns exactly the items tagged with both (brute force)', () => {
  let pairs = 0, hits = 0;
  for (let x = 0; x < ids.length; x++) for (let y = x + 1; y < ids.length; y++) {
    const a = ids[x], b = ids[y];
    const expected = items.filter((i) => i.tags.includes(a) && i.tags.includes(b)).map((i) => i.name);
    assert.deepEqual(brew(items, a, b).map((i) => i.name), expected, `${a} + ${b}`);
    assert.deepEqual(brew(items, b, a).map((i) => i.name), expected, `order matters for ${a} + ${b}`);
    pairs++; if (expected.length) hits++;
  }
  console.log(`  ${pairs} pairs checked, ${hits} with matches`);
});

test('every empty pair gets a hint that really matches', () => {
  for (const a of ids) for (const b of ids) {
    if (a === b || brew(items, a, b).length) continue;
    const h = hint(items, flasks, a, b);
    assert.ok(h, `no hint for ${a} + ${b}`);
    assert.ok([a, b].includes(h.keep));
    assert.ok(brew(items, h.keep, h.partner).length > 0, `hint ${h.keep} + ${h.partner} is empty`);
  }
});

test('same flask twice brews nothing', () => {
  assert.equal(brew(items, 'python', 'python').length, 0);
});

test('picking: toggle, cap at two, third replaces the oldest', () => {
  assert.deepEqual(pick([], 'a'), ['a']);
  assert.deepEqual(pick(['a'], 'b'), ['a', 'b']);
  assert.deepEqual(pick(['a', 'b'], 'c'), ['b', 'c']);
  assert.deepEqual(pick(['a', 'b'], 'a'), ['b']);
});
