const form = document.querySelector('#request-form');
const endpoint = document.querySelector('#endpoint');
const result = document.querySelector('#result');
const reader = document.querySelector('#reader');
const status = document.querySelector('#status');
const run = document.querySelector('#run');
const fullEndpoint = document.querySelector('#full-endpoint');
const readerTab = document.querySelector('#reader-tab');
const jsonTab = document.querySelector('#json-tab');
const absolute = path => new URL(path, location.origin).href;
fullEndpoint.value = absolute('/api/v1/verses/10.15');
document.querySelector('#guide-url').textContent = fullEndpoint.value;
document.querySelector('#curl-example').textContent = `curl '${fullEndpoint.value}'`;
document.querySelector('#js-example').textContent = `async function renderVerse() {
  const response = await fetch(${JSON.stringify(fullEndpoint.value)});
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error.message);
  const verse = payload.data;
  const container = document.getElementById('verse');
  container.replaceChildren();
  for (const line of verse.text.lines_ta) {
    const p = document.createElement('p');
    p.lang = 'ta';
    p.textContent = line;
    container.append(p);
  }
  for (const [field, language] of [
    ['meaning_ta', 'ta'], ['english_meaning', 'en']
  ]) {
    const p = document.createElement('p');
    p.lang = language;
    p.textContent = verse.text[field];
    container.append(p);
  }
}
renderVerse().catch(error => {
  document.getElementById('verse').textContent = error.message;
});`;
document.querySelector('#search-example').textContent = `const url = new URL('/api/v1/verses', ${JSON.stringify(location.origin)});
url.search = new URLSearchParams({ q: 'பணம்', limit: '5' });
const response = await fetch(url);
const payload = await response.json();
if (!response.ok) throw new Error(payload.error.message);
for (const verse of payload.data.results) {
  console.log(verse.id, verse.text.english_meaning);
}`;
document.querySelector('#python-example').textContent = `import json
from urllib.request import urlopen
from urllib.error import HTTPError, URLError

try:
    with urlopen(${JSON.stringify(fullEndpoint.value)}, timeout=15) as response:
        verse = json.load(response)['data']
    print('\\n'.join(verse['text']['lines_ta']))
    print(verse['text']['meaning_ta'])
    print(verse['text']['english_meaning'])
except HTTPError as error:
    print(error.code, json.load(error)['error']['message'])
except URLError as error:
    print('Connection failed:', error.reason)`;
document.querySelector('#pagination-example').textContent = `const records = [];
let page = 1;
while (true) {
  const url = new URL('/api/v1/verses', ${JSON.stringify(location.origin)});
  url.search = new URLSearchParams({ page: String(page), limit: '100' });
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error.message);
  records.push(...payload.data.results);
  if (!payload.data.pagination.has_next) break;
  page++;
}
console.log(records.length);`;
document.querySelector('#export-example').textContent = `const response = await fetch(${JSON.stringify(absolute('/api/v1/export?format=ndjson&chapter=10'))});
if (!response.ok) throw new Error((await response.json()).error.message);
const text = await response.text();
const verses = text.split('\\n').filter(line => line.trim()).map(JSON.parse);
console.log(verses[0].text.english_meaning);`;
document.querySelector('#key-example').textContent = `// Run on your server when a private key is enabled.
const response = await fetch(${JSON.stringify(fullEndpoint.value)}, {
  headers: { 'x-api-key': process.env.API_KEY }
});`;
function setView(view) {
  reader.hidden = view !== 'reader'; result.hidden = view !== 'json';
  readerTab.setAttribute('aria-selected', String(view === 'reader'));
  readerTab.tabIndex = view === 'reader' ? 0 : -1;
  jsonTab.setAttribute('aria-selected', String(view === 'json'));
  jsonTab.tabIndex = view === 'json' ? 0 : -1;
}
readerTab.addEventListener('click', () => setView('reader'));
jsonTab.addEventListener('click', () => setView('json'));
for (const tab of [readerTab, jsonTab]) tab.addEventListener('keydown', event => {
  if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault(); const next = event.key === 'Home' ? readerTab : event.key === 'End' ? jsonTab : tab === readerTab ? jsonTab : readerTab;next.focus();next.click();
  }
});
async function copyText(value, success) {
  try { await navigator.clipboard.writeText(value); status.textContent = success; }
  catch { status.textContent = 'Clipboard unavailable. Select the text to copy it.'; }
}
document.querySelector('#copy-endpoint').addEventListener('click', () => copyText(fullEndpoint.value, 'Full endpoint copied.'));
document.querySelector('#copy').addEventListener('click', () => copyText(result.textContent, 'Response copied.'));
function node(tag, text, className) { const element = document.createElement(tag); element.textContent = text; if (className) element.className = className; return element; }
function showReader(payload) {
  reader.replaceChildren();
  if (payload.error) { reader.append(node('h3', payload.error.code), node('p', payload.error.message)); return; }
  const data = payload.data ?? (payload.records ? { results: payload.records } : undefined);
  const list = data?.verse ? [data.verse] : data?.text ? [data] : Array.isArray(data) ? data : data?.results ?? [];
  const records = list.map(item => item?.verse ?? item).filter(item => item?.text?.meaning_ta);
  if (!records.length) { reader.append(node('p', 'This response contains metadata or no matching verses. Open the JSON tab for details.')); return; }
  if (data?.date) reader.append(node('p', `${data.date} · ${data.timezone}`, 'reader-meta'));
  for (const verse of records) {
    const article = node('article', '', 'verse-card');
    article.append(node('div', `CHAPTER ${verse.chapter} / VERSE ${verse.verse}`, 'eyebrow'));
    const lines = node('div', '', 'verse-lines');lines.lang = 'ta';
    for (const line of verse.text.lines_ta ?? verse.text.transliteration_ta.split('\n')) lines.append(node('p', line));
    article.append(lines, node('h3', 'பொருள்'));
    const meaning = node('p', verse.text.meaning_ta, 'verse-meaning');meaning.lang = 'ta';article.append(meaning);
    const english = node('div', '', 'english-meaning');english.lang = 'en';
    english.append(node('h3', 'IN PLAIN ENGLISH'), node('p', verse.text.english_meaning));article.append(english);
    const details = node('p', `Verse ${verse.id}`, 'reader-meta');
    const link = document.createElement('a');link.href = `/read/${encodeURIComponent(verse.id)}`;link.textContent = 'Link to this verse ↗';
    article.append(details, link);reader.append(article);
  }
}
let activeRequest;
async function execute() {
  activeRequest?.abort();
  const controller = new AbortController();activeRequest = controller;
  const timeout = setTimeout(() => controller.abort(), 15000);
  run.disabled = true; status.textContent = 'Loading…';
  try {
    const path = endpoint.value.trim(); const url = new URL(path, location.origin);
    if (url.origin !== location.origin || !/^\/api\/v1(?:\/|$)/u.test(url.pathname)) throw new Error('Use an /api/v1 endpoint on this API’s domain.');
    const key = document.querySelector('#api-key').value;
    const start = performance.now();
    const response = await fetch(url, { headers: key ? { 'x-api-key': key } : {}, signal: controller.signal });
    const text = await response.text();
    if (activeRequest !== controller) return;
    try { const payload = JSON.parse(text);result.textContent = JSON.stringify(payload, null, 2);showReader(payload); }
    catch {
      result.textContent = text;
      if (response.headers.get('content-type')?.includes('ndjson')) {
        try { showReader({ data: text.split('\n').filter(line => line.trim()).map(JSON.parse) }); }
        catch { reader.replaceChildren(node('pre', text)); }
      } else reader.replaceChildren(node('pre', text));
    }
    status.textContent = `HTTP ${response.status} · ${Math.round(performance.now() - start)} ms`;
  } catch (error) { if (activeRequest !== controller) return;const message = error.name === 'AbortError' ? 'Request timed out. Try again.' : error.message;result.textContent = '';reader.replaceChildren(node('p', message));status.textContent = message; }
  finally { clearTimeout(timeout);if (activeRequest === controller) run.disabled = false; }
}
form.addEventListener('submit', event => { event.preventDefault();execute(); });
document.querySelector('#preset').addEventListener('change', event => { endpoint.value = event.target.value;execute(); });
for (const button of document.querySelectorAll('[data-path]')) {
  button.addEventListener('click', () => {
    endpoint.value = button.dataset.path;
    execute();
    document.querySelector('#playground').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}
const deepLink = location.pathname.match(/^\/read\/(\d+\.\d+)\/?$/u);
if (deepLink) endpoint.value = `/api/v1/verses/${deepLink[1]}`;
execute();
if (['/docs', '/api/docs'].includes(location.pathname.replace(/\/$/, '')) && !location.hash) document.querySelector('#guide').scrollIntoView();
