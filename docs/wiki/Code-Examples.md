# Code Examples

### Search Tamil or English

Use `URLSearchParams` to encode query values correctly.

```js
const url = new URL(
  '/api/v1/verses', 'https://chanakya-neeti-api.vercel.app'
);
url.search = new URLSearchParams({ q: 'பணம்', limit: '5' });

const response = await fetch(url);
const payload = await response.json();
if (!response.ok) throw new Error(payload.error.message);

for (const verse of payload.data.results) {
  console.log(verse.id, verse.text.english_meaning);
}
```

### Display a verse on your page

Add `<div id="verse"></div>` to the page, then run:

```js
async function showVerse() {
  const response = await fetch(
    'https://chanakya-neeti-api.vercel.app/api/v1/verses/10.15'
  );
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error.message);

  const container = document.getElementById('verse');
  const { text } = payload.data;
  container.replaceChildren();

  for (const line of text.lines_ta) {
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
    p.textContent = text[field];
    container.append(p);
  }
}

showVerse().catch(error => {
  document.getElementById('verse').textContent = error.message;
});
```

### Python, with no extra packages

```python
import json
from urllib.request import urlopen
from urllib.error import HTTPError, URLError

url = 'https://chanakya-neeti-api.vercel.app/api/v1/verses/10.15'

try:
    with urlopen(url, timeout=15) as response:
        verse = json.load(response)['data']
    print('\n'.join(verse['text']['lines_ta']))
    print(verse['text']['meaning_ta'])
    print(verse['text']['english_meaning'])
except HTTPError as error:
    print(error.code, json.load(error)['error']['message'])
except URLError as error:
    print('Connection failed:', error.reason)
```

## Server-side API key

```js
const response = await fetch(
  'https://chanakya-neeti-api.vercel.app/api/v1/verses/10.15',
  { headers: { 'x-api-key': process.env.API_KEY } }
);
const payload = await response.json();
if (!response.ok) throw new Error(payload.error.message);
console.log(payload.data.text.english_meaning);
```

Use this on your server when a private key is configured. See [Authentication and CORS](Authentication-and-CORS.md).

## Node.js usage

The JavaScript snippets use fetch and top-level await where appropriate. On Node.js 24, use an `.mjs` file or an ES module context. For a browser script without module support, place await inside an async function.

## Production behavior

Check response.ok before reading success fields. Treat network failures separately from JSON API errors. For text and NDJSON endpoints, use response.text instead of response.json. A 304 has no body and requires your stored response.

Next: [Pagination and Exports](Pagination-and-Exports.md) for complete collection retrieval.

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
