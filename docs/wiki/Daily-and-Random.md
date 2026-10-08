# Daily and Random

## Daily verse

```text
GET /api/v1/daily
GET /api/v1/daily?date=2026-10-08
GET /api/v1/daily?topic=resilience&chapter=10
GET /api/v1/daily?format=text
```

| Parameter | Behavior |
| --- | --- |
| date | Real YYYY-MM-DD date; defaults to today in Asia/Kolkata |
| chapter, topic, review | Restrict the candidate pool |
| format | json default or text |
| include_raw | false default; true adds raw text to JSON verse objects |

The JSON shape is `{ data: { date, timezone, verse }, meta }`. Read the verse at `payload.data.verse`.

The selection is stable for the same date, filters and content version. It is not a promise that consecutive dates return different verses, nor a reading order through the whole collection. Use [Previous / Next](Reader-Guide.md) for sequential reading.

An impossible calendar date returns 400. A valid filter with no candidates returns 404 with `NO_RESULTS`. The same explicit date can select a different record after content changes.

## Random verses

```text
GET /api/v1/random
GET /api/v1/random?count=3
GET /api/v1/random?count=2&chapter=10
```

The count defaults to 1 and ranges from 1–20. Results are an array even when count is 1. Filters are chapter, topic and review; include_raw is optional.

Each response contains unique records. Separate requests may repeat a verse. The response uses no-store. If the pool is smaller than count, the whole request returns 404 with `INSUFFICIENT_RESULTS`.

## Daily JavaScript example

```js
const response = await fetch('https://chanakya-neeti-api.vercel.app/api/v1/daily');
const payload = await response.json();
if (!response.ok) throw new Error(payload.error.message);
console.log(payload.data.date, payload.data.verse.text.english_meaning);
```

Next: [Batch and Related](Batch-and-Related.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
