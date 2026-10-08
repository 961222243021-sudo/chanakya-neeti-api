# Chanakya Neeti API

Developed by **Shyam** · Version **1.2.0**

319 verses across 17 chapters, with Tamil text, Tamil explanations and individual plain-English meanings. Includes search, daily and random selection, a responsive reader and a complete usage guide with a live playground.

Website: https://chanakya-neeti-api.vercel.app  
Documentation: https://chanakya-neeti-api.vercel.app/docs

## Read without using the API

Open the homepage and tap **Start reading**. Choose a chapter, then a numbered verse. **Next** and **Previous** move through all 319 available verses, including chapter transitions. Tamil and English meanings appear together. The reader works without JavaScript through numbered links; selectors provide another way to navigate. Unknown pages and unavailable reader verses show an illustrated 404 with working recovery links. API errors remain JSON.

## Quick start

```sh
curl 'https://chanakya-neeti-api.vercel.app/api/v1/verses/10.15'
```

```js
const response = await fetch('https://chanakya-neeti-api.vercel.app/api/v1/verses/10.15');
const payload = await response.json();
if (!response.ok) throw new Error(payload.error.message);
console.log(payload.data.text.english_meaning);
```

Public deployments need no account or key. All endpoints are read-only: GET, HEAD and OPTIONS. IDs are strings with a dot: `10.15` means chapter 10, verse 15. Use `/api/v1/chapters` for available numbers.

## Verse fields

| Field | Meaning |
| --- | --- |
| `id`, `chapter`, `verse` | String ID and integer chapter/verse numbers |
| `text.transliteration_ta` | Tamil-script verse as one clean line |
| `text.lines_ta` | Ordered lines for layout |
| `text.meaning_ta` | Tamil explanation |
| `text.english_meaning` | Short modern English interpretation, not a word-for-word translation |
| `topics` | Discovery topic IDs |
| `meta` | API version, content checksum version and Shyam credit |

Every public verse object includes both meanings. Normal JSON uses `{data, meta}`. Render lines as separate paragraphs and insert strings with `textContent` rather than `innerHTML`. Plain-text output contains actual line breaks and both meanings.

## Complete endpoint reference

| GET path | Parameters | Response location |
| --- | --- | --- |
| `/api/v1` | None | `data`: API identity and counts |
| `/api/v1/verses/{id}` | `format`, `include_raw` | `data`: one verse |
| `/api/v1/verses` | Filters, `q`, `match`, `page`, `limit`, `include_raw` | `data.results[]`, `data.pagination` |
| `/api/v1/verses/{id}/related` | `limit` (default 5, max 20) | `data.results[]`: each has `verse`, `shared_topics`; `data.method` describes matching |
| `/api/v1/daily` | Filters, `date`, `format`, `include_raw` | `data.verse`, `data.date`, `data.timezone` |
| `/api/v1/random` | Filters, `count`, `include_raw` | `data[]`, including when count is 1 |
| `/api/v1/chapters` | None | `data[]`: counts and available numbers |
| `/api/v1/chapters/{chapter}` | `page`, `limit`, `include_raw` | `data.chapter`, `data.results[]`, `data.pagination` |
| `/api/v1/topics` | None | `data[]`: topic IDs and counts |
| `/api/v1/batch` | `ids` required, `include_raw` | `data[]` in requested order |
| `/api/v1/export` | Filters, `format`, `include_raw` | `{dataset_version, records[]}` for JSON; one verse per line for NDJSON |
| `/api/v1/quality` | None | `data`: integrity and editorial-status summary |
| `/health` | None | `data.status` and counts |

Website routes: `/`, `/docs`, `/api/docs` and `/read/{id}`. The guide contains cURL, JavaScript rendering/search/pagination/export, Python and optional authentication examples. Specification routes have been removed.

## Parameters and filters

“Filters” means `chapter`, `topic` and `review`, combined with AND. Available on verse browse, daily, random and export.

| Parameter | Allowed values / default |
| --- | --- |
| `chapter` | 1–17; omitted means all |
| `topic` | Exact ID from `/api/v1/topics`; omitted means all |
| `review` | `reviewed` or `unreviewed`; omitted means both |
| `q` | 1–200 characters; searches Tamil text, English meanings and topic keywords |
| `match` | `all` default or `any`; applies to q words separated by spaces/commas |
| `page` | 1–1,000,000; default 1 |
| `limit` | Browse/chapter: 1–100, default 20; related: 1–20, default 5 |
| `count` | Random: 1–20; default 1; unique within a request |
| `date` | Real YYYY-MM-DD date; default today in Asia/Kolkata |
| `ids` | Batch: 1–50 comma-separated IDs; preserves order and duplicates |
| `format` | Single/daily: json default or text; export: json default or ndjson |
| `include_raw` | true or false default; adds optional raw_text; use normal fields for display |

Search is Unicode-normalized and case-insensitive keyword matching. Related verses share topic tags. Use `URLSearchParams` to encode Tamil values. Unsupported, repeated and invalid parameters return 400. Match has an effect only when q is present.

```text
/api/v1/verses?chapter=1&topic=money&limit=5
/api/v1/verses?q=learning%20patience&match=any&limit=5
/api/v1/daily?date=2026-10-08&topic=resilience
/api/v1/random?chapter=10&count=2
/api/v1/batch?ids=1.6,10.15
/api/v1/verses/10.15?format=text
/api/v1/export?format=ndjson&chapter=10
```

Daily selection is stable for the same date, filters and content version. Content updates may change that selection. Random returns 404 if fewer candidates than count. A batch with any missing ID fails as a whole. Browse with zero matches returns an empty results array. Chapter 13's unavailable numbers return 404.

## Pagination and exports

`data.pagination` contains `page`, `limit`, `total`, `pages` and `has_next`. Start at page 1 and increment until has_next is false, keeping filters unchanged. A page past the end is empty; zero matches have pages 0.

Exports omit the data/meta envelope. Parse `records` for JSON. For NDJSON, split on line breaks, remove empty lines and parse each line independently. Both formats include English meanings and support the same filters as above.

## Errors and caching

```json
{"error":{"code":"VERSE_NOT_FOUND","message":"Requested verse number is unavailable.","request_id":"…"}}
```

400: invalid input; 401: required key missing/invalid; 404: unavailable route/verse/candidates; 405: unsupported method; 414: URL over 4,096 characters; 500: unexpected error. Read error.message; report request_id when needed. OPTIONS returns 204. HEAD returns headers without a body.

Most public responses use short caching and ETag. Send the saved ETag as If-None-Match; a 304 means reuse your saved response, with no JSON to parse. Random, health and key-protected results use no-store. CORS defaults to all origins and can be restricted by the owner.

## Run locally

Requires Node.js 24. No runtime dependencies or database.

```sh
npm start
npm test
npm run build
```

Visit http://localhost:3000. PORT defaults to 3000. Set API_KEY to require x-api-key for all /api/v1 requests. Website assets, documentation and health remain public. Keep private keys on the server. Set comma-separated CORS_ORIGINS to restrict browser origins; default `*`. To load a local environment file, use `node --env-file=.env scripts/serve.mjs`.

## Vercel

Import this repository with Node.js 24 and Other as the framework. vercel.json supplies the build command, public output directory, function bundle and catch-all routing. Remove conflicting dashboard overrides. The function is api/index.js; the local listener is scripts/serve.mjs.

After deploying, open `/`, `/health`, `/api/v1/verses/10.15` and `/docs`. Keep the slash between the domain and path: `.vercel.app/api`. The homepage generates full example URLs from the actual deployment origin.

Automated checks verify API behavior and complete English coverage. Full editorial proofreading of the Tamil text and English interpretations remains pending; see docs/VERIFICATION.md for the checks performed.
