# Pagination and Exports

### Browse the full collection

`data.pagination` contains `page`, `limit`, `total`, `pages` and `has_next`. Keep your filters unchanged between pages.

```js
const records = [];
let page = 1;

while (true) {
  const url = new URL(
    '/api/v1/verses', 'https://chanakya-neeti-api.vercel.app'
  );
  url.search = new URLSearchParams({ page: String(page), limit: '100' });
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error.message);

  records.push(...payload.data.results);
  if (!payload.data.pagination.has_next) break;
  page++;
}

console.log(records.length);
```

### Download once instead

```sh
# JSON collection: { dataset_version, records }
curl 'https://chanakya-neeti-api.vercel.app/api/v1/export' -o verses.json

# NDJSON: one complete verse per line
curl 'https://chanakya-neeti-api.vercel.app/api/v1/export?chapter=10&format=ndjson' \
  -o chapter-10.ndjson
```

Exports include English meanings and support filters. JSON exports use `records`, without a `data`/`meta` envelope. For NDJSON, split into nonempty lines and parse each line separately.

```js
const response = await fetch(
  'https://chanakya-neeti-api.vercel.app/api/v1/export?format=ndjson&chapter=10'
);
if (!response.ok) throw new Error((await response.json()).error.message);
const text = await response.text();
const verses = text.split('\n').filter(line => line.trim()).map(JSON.parse);
console.log(verses[0].text.english_meaning);
```

## Pagination fields

| Field | Meaning |
| --- | --- |
| page | Requested page, starting at 1 |
| limit | Requested records per page |
| total | Total matches before pagination |
| pages | Ceiling of total / limit; zero for no matches |
| has_next | Whether another page contains records |

Use limit 100 to reduce request count when fetching the current 319-record collection. Keep query and filters unchanged across pages. Content can change between requests; a one-request export is simpler for a full snapshot.

## Export behavior

The download response includes Content-Disposition with a content-versioned filename. JSON exports include dataset_version and records. NDJSON omits the version envelope and contains one record per line. Both formats include the English meaning and support chapter/topic/review filters.

An empty filtered JSON export has records: []. An empty NDJSON export has an empty body. Do not call JSON.parse on the entire NDJSON document.

Next: [Caching and HTTP](Caching-and-HTTP.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
