import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
const verses = load('verses'), chapters = load('chapters'), topics = load('topics'), quality = load('quality-report');
assert.equal(verses.length, 319); assert.equal(chapters.length, 17);
assert.equal(new Set(verses.map(v => v.id)).size, verses.length);
for (const v of verses) {
  assert.equal(v.id, `${v.chapter}.${v.verse}`);
  assert.ok(chapters.some(c => c.id === v.chapter && c.verse_numbers.includes(v.verse)));
  assert.ok(v.text.transliteration_ta.length > 5 && v.text.meaning_ta.length > 5, v.id);
  assert.ok(!/[\u1f00-\u1fff]/u.test(JSON.stringify(v.text)), v.id);
  assert.ok(v.source.pages.length && v.source.pages.every(p => p >= 8 && p <= 107), v.id);
  assert.ok(v.topics.every(t => topics.some(x => x.id === t)), v.id);
  assert.ok(['reviewed', 'unreviewed'].includes(v.quality.status));
  assert.ok(v.raw_text.length > 5);
}
assert.equal(chapters.reduce((sum, c) => sum + c.count, 0), verses.length);
assert.deepEqual(chapters[12].missing_within_observed_range, [4, 5, 6, 7, 11]);
assert.equal(quality.records, verses.length);
assert.equal(quality.reviewed_records, verses.filter(v => v.quality.status === 'reviewed').length);
assert.deepEqual(quality.split_failures, []);
console.log(`Validated ${verses.length} unique records, ${chapters.length} chapters, preserved source gaps, nonempty verse/meaning boundaries, and Unicode conversion.`);
