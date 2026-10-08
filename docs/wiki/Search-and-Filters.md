# Search and Filters

| Parameter | Allowed values | Default / behavior |
| :--- | :--- | :--- |
| `chapter` | Integer 1–17 | Omitted: all chapters |
| `topic` | Exact ID from `/api/v1/topics` | Omitted: all topics |
| `review` | `reviewed`, `unreviewed` | Omitted: both |
| `q` | 1–200 characters | Searches Tamil text, English meanings and topic keywords |
| `match` | `all`, `any` | `all`; applies when `q` is present |
| `page` | Integer 1–1,000,000 | 1 |
| `limit` | Browse/chapter: 1–100; related: 1–20 | Browse/chapter: 20; related: 5 |
| `count` | Random: 1–20 | 1; unique within the request |
| `date` | Real `YYYY-MM-DD` date | Today in Asia/Kolkata |
| `ids` | 1–50 comma-separated IDs | Required for batch; preserves order and duplicates |
| `format` | Single/daily: `json`, `text`; export: `json`, `ndjson` | `json` |
| `include_raw` | `true`, `false` | `false`; adds optional `raw_text` |

Search is case-insensitive, Unicode-normalized keyword matching. Spaces or commas separate query words. `match=all` requires every word; `match=any` requires at least one. Filters combine with AND. Related results use shared topic tags, not semantic similarity.

**Copy a useful request**

```text
/api/v1/verses?chapter=1&topic=money&limit=5
/api/v1/verses?q=learning%20patience&match=any&limit=5
/api/v1/daily?date=2026-10-08&topic=resilience
/api/v1/random?chapter=10&count=2
/api/v1/batch?ids=1.6,10.15
/api/v1/verses/10.15?format=text
/api/v1/export?format=ndjson&chapter=10
```

<details>
<summary><strong>Selection rules and edge cases</strong></summary>

- Daily selection stays the same for the same date, filters and content version. A content update can change the selected verse.
- Random returns 404 if the matching pool is smaller than `count`.
- A batch fails as a whole if any ID is invalid or unavailable.
- Browse with no matches returns an empty `results` array and `pages: 0`.
- A page beyond the last page returns an empty array.
- Unavailable verse numbers return 404; use the chapter index or the numbered reader.
- Unsupported, repeated or invalid parameters on validated endpoints return 400.

</details>

## Tamil search

```js
const url = new URL('/api/v1/verses', 'https://chanakya-neeti-api.vercel.app');
url.search = new URLSearchParams({ q: 'பணம்', limit: '5' });
const response = await fetch(url);
const payload = await response.json();
if (!response.ok) throw new Error(payload.error.message);
console.log(payload.data.results);
```

## English search

Search the actual explanation, not only its topic:

```text
/api/v1/verses?q=moving%20natural&match=all&limit=100
```

This finds verse 10.15 because its English explanation contains both words.

## How ranking works

The implementation normalizes Unicode, lowercases English text and removes whitespace and zero-width joiner characters from indexed strings. Query words are split on spaces or commas. It counts substring matches and gives an extra score when the normalized full query is present. Ties follow chapter and verse order.

This is predictable keyword matching. It does not understand synonyms, perform semantic search or guarantee whole-word matches. Try simpler query words if a phrase returns no results.

## Combine filters

`chapter=1&topic=money` means chapter 1 **and** topic money. `review` optionally filters editorial status. Search applies within the filtered pool. Find valid topics using `/api/v1/topics`; an unknown topic is an error.

A review filter can have zero matches. Editorial status is independent of whether an English field exists.

Next: [Pagination and Exports](Pagination-and-Exports.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
