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
document.querySelector('#js-example').textContent = `const response = await fetch(${JSON.stringify(fullEndpoint.value)});
const payload = await response.json();
if (!response.ok) throw new Error(payload.error.message);
const verse = payload.data;
const container = document.getElementById('verse');
container.replaceChildren();
for (const line of verse.text.lines_ta) {
  const p = document.createElement('p');
  p.textContent = line;
  container.append(p);
}
const meaning = document.createElement('p');
meaning.textContent = verse.text.meaning_ta;
container.append(meaning);`;
document.querySelector('#python-example').textContent = `import json
from urllib.request import urlopen

with urlopen(${JSON.stringify(fullEndpoint.value)}) as response:
    verse = json.load(response)['data']
for line in verse['text']['lines_ta']:
    print(line)
print()
print(verse['text']['meaning_ta'])`;
function setView(view) {
  reader.hidden = view !== 'reader'; result.hidden = view !== 'json';
  readerTab.setAttribute('aria-selected', String(view === 'reader'));
  jsonTab.setAttribute('aria-selected', String(view === 'json'));
}
readerTab.addEventListener('click', () => setView('reader'));
jsonTab.addEventListener('click', () => setView('json'));
for (const tab of [readerTab, jsonTab]) tab.addEventListener('keydown', event => {
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault(); const next = tab === readerTab ? jsonTab : readerTab;next.focus();next.click();
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
  const data = payload.data;
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
    catch { result.textContent = text;reader.replaceChildren(node('pre', text)); }
    status.textContent = `HTTP ${response.status} · ${Math.round(performance.now() - start)} ms`;
  } catch (error) { if (activeRequest !== controller) return;const message = error.name === 'AbortError' ? 'Request timed out. Try again.' : error.message;result.textContent = '';reader.replaceChildren(node('p', message));status.textContent = message; }
  finally { clearTimeout(timeout);if (activeRequest === controller) run.disabled = false; }
}
form.addEventListener('submit', event => { event.preventDefault();execute(); });
document.querySelector('#preset').addEventListener('change', event => { endpoint.value = event.target.value;execute(); });
const examples = { '/api/v1/verses/{id}': '/api/v1/verses/10.15', '/api/v1/verses/{id}/related': '/api/v1/verses/10.15/related', '/api/v1/chapters/{chapter}': '/api/v1/chapters/1', '/api/v1/batch': '/api/v1/batch?ids=1.6,10.15' };
async function loadReference() {
  try {
    const response = await fetch('/openapi.json');if (!response.ok) throw new Error('Reference request failed.');const spec = await response.json();
    for (const [path, methods] of Object.entries(spec.paths)) {
      const tr = document.createElement('tr');
      const pathCell = node('td', path);const description = node('td', methods.get.summary);const actions = document.createElement('td');
      const example = examples[path] ?? path;
      if (path.startsWith('/api/v1')) { const button = node('button', 'Try');button.type = 'button';button.addEventListener('click', () => { endpoint.value = example;execute();document.querySelector('#playground').scrollIntoView({ behavior: 'smooth' }); });actions.append(button); }
      else { const link = node('a', 'Open ↗');link.href = path;actions.append(link); }
      tr.append(pathCell, description, actions);document.querySelector('#routes').append(tr);
    }
  } catch { document.querySelector('#routes').append(node('tr', 'Reference unavailable. Open /openapi.json directly.')); }
}
const deepLink = location.pathname.match(/^\/read\/(\d+\.\d+)\/?$/u);
if (deepLink) endpoint.value = `/api/v1/verses/${deepLink[1]}`;
loadReference();execute();
