const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const href = id => `/read/${id}#browse`;
export function renderBrowse(record, verses, chapters) {
  const index = verses.findIndex(v => v.id === record.id);
  const chapter = chapters.find(c => c.id === record.chapter);
  const previous = verses[index - 1], next = verses[index + 1];
  const navLink = (v, label) => v ? `<a class="button secondary" href="${href(v.id)}" rel="${label === '← Previous' ? 'prev' : 'next'}">${label}</a>` : `<span class="button secondary disabled" aria-disabled="true">${label}</span>`;
  return `<section id="browse" class="browse-section" aria-labelledby="browse-title">
    <div class="section-heading"><div><div class="eyebrow">READ AT YOUR PACE</div><h2 id="browse-title">One verse at a time.</h2></div><p>319 verses in 17 chapters.<br>Pick a chapter, tap a number, or press Next.</p></div>
    <ol class="reading-steps"><li><strong>1</strong> Choose a chapter</li><li><strong>2</strong> Pick a verse</li><li><strong>3</strong> Read Tamil + English</li></ol>
    <div class="browse-layout"><aside class="browse-controls" aria-label="Choose what to read">
      <label for="chapter-picker">Chapter / அத்தியாயம்</label><select id="chapter-picker">${chapters.map(c => `<option value="${href(`${c.id}.${c.verse_numbers[0]}`)}"${c.id === record.chapter ? ' selected' : ''}>Chapter ${c.id} · ${c.count} verses</option>`).join('')}</select>
      <details class="chapter-links"><summary>See all 17 chapters</summary><nav aria-label="All chapters">${chapters.map(c => `<a href="${href(`${c.id}.${c.verse_numbers[0]}`)}"${c.id === record.chapter ? ' aria-current="true"' : ''}>${c.id}</a>`).join('')}</nav></details>
      <label for="verse-picker">Verse / பாடல்</label><select id="verse-picker">${chapter.verse_numbers.map(n => `<option value="${href(`${chapter.id}.${n}`)}"${n === record.verse ? ' selected' : ''}>Verse ${n}</option>`).join('')}</select>
      <details class="verse-list"><summary>Show verse numbers</summary><nav class="verse-numbers" aria-label="Verses in chapter ${chapter.id}">${chapter.verse_numbers.map(n => `<a href="${href(`${chapter.id}.${n}`)}"${n === record.verse ? ' aria-current="page"' : ''} aria-label="Chapter ${chapter.id}, verse ${n}">${n}</a>`).join('')}</nav></details>
      <p class="browse-hint">Next takes you through every available verse, then into the next chapter.</p><a class="start-over" href="${href(verses[0].id)}">Start from verse 1 →</a>
    </aside><div class="browse-reading"><div class="reading-progress"><span>Chapter <strong>${record.chapter}</strong> / 17 · Verse <strong>${record.verse}</strong></span><span>${index + 1} of ${verses.length}</span></div><progress value="${index + 1}" max="${verses.length}" aria-label="Reading position">${index + 1} of ${verses.length}</progress>
      <nav class="reading-toolbar" aria-label="Quick verse navigation">${navLink(previous, '← Previous')}${navLink(next, 'Next →')}</nav>
      <article class="verse-card"><div class="eyebrow">CHAPTER ${record.chapter} · VERSE ${record.verse}</div><div class="verse-lines" lang="ta">${record.text.lines_ta.map(line => `<p>${escape(line)}</p>`).join('')}</div><h3 lang="ta">பொருள்</h3><p class="verse-meaning" lang="ta">${escape(record.text.meaning_ta)}</p><div class="english-meaning" lang="en"><h3>IN PLAIN ENGLISH</h3><p>${escape(record.text.english_meaning)}</p></div></article>
      <nav class="reading-navigation" aria-label="Read previous or next verse">${navLink(previous, '← Previous')}${navLink(next, 'Next →')}</nav>${!next ? '<p class="finished">You reached the last verse. Pick another chapter or start again.</p>' : ''}
    </div></div></section>`;
}
