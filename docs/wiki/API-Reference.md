# API Reference

Paths below are relative to the website domain. All requests use GET.

| Endpoint | What it does | Where to read the result |
| :--- | :--- | :--- |
| `/api/v1` | API overview and collection counts | `data` |
| `/api/v1/verses/{id}` | One verse | `data` |
| `/api/v1/verses` | Browse and search | `data.results[]`, `data.pagination` |
| `/api/v1/verses/{id}/related` | Verses with shared topics | `data.results[]` → `verse`, `shared_topics` |
| `/api/v1/daily` | One daily verse, using Asia/Kolkata | `data.verse`, `data.date`, `data.timezone` |
| `/api/v1/random` | Unique random verses | `data[]`, even when count is 1 |
| `/api/v1/chapters` | Chapter counts and available verse numbers | `data[]` |
| `/api/v1/chapters/{chapter}` | Browse one chapter | `data.chapter`, `data.results[]`, `data.pagination` |
| `/api/v1/topics` | Valid topic IDs and counts | `data[]` |
| `/api/v1/batch` | Several verses in requested order | `data[]` |
| `/api/v1/export` | Download all or filtered verses | JSON: `records[]`; NDJSON: one verse per line |
| `/api/v1/quality` | Integrity and editorial-status summary | `data` |
| `/health` | Service status and counts | `data.status` |

**Website routes:** `/` for the homepage, `/docs` or `/api/docs` for the guide, and `/read/{id}` for a verse reader.

<details>
<summary><strong>Parameters accepted by each endpoint</strong></summary>

| Endpoint | Accepted parameters |
| :--- | :--- |
| Single verse | `format`, `include_raw` |
| Browse/search | Filters, `q`, `match`, `page`, `limit`, `include_raw` |
| Related | `limit` |
| Daily | Filters, `date`, `format`, `include_raw` |
| Random | Filters, `count`, `include_raw` |
| Chapter browse | `page`, `limit`, `include_raw` |
| Batch | `ids` required, `include_raw` |
| Export | Filters, `format`, `include_raw` |
| Overview, chapter index, topics, quality, health | No query parameters needed |

“Filters” means `chapter`, `topic` and `review`. Combine them on browse, daily, random and export endpoints.

</details>

## Route behavior and request examples

### API overview

`GET /api/v1` returns the name, version, content version, developer, record count, chapter count and documentation path.

### One verse

```text
GET /api/v1/verses/10.15
GET /api/v1/verses/10.15?format=text
```

Use a valid `chapter.verse` ID. JSON returns `data` as the verse object. Text returns a readable document without a JSON envelope.

### Browse and search

```text
GET /api/v1/verses?page=1&limit=20
GET /api/v1/verses?q=moving&chapter=10&limit=5
```

The result contains `results` and `pagination`. Ranked keyword search applies when q is present; otherwise the collection follows chapter and verse order.

### Chapters

```text
GET /api/v1/chapters
GET /api/v1/chapters/10?limit=100
```

The index includes chapter ID, names, count, available verse numbers and missing numbers within the observed range. Chapter browse contains the chapter object plus paginated records. The chapter path must be 1–17.

### Topics

`GET /api/v1/topics` returns topic objects with counts. Use their exact `id` values in the topic filter. A verse can have multiple topics or none.

### Daily, random, batch and related

These have dedicated guides: [Daily and Random](Daily-and-Random.md) and [Batch and Related](Batch-and-Related.md).

### Exports

See [Pagination and Exports](Pagination-and-Exports.md). Exports are downloads and use a different response structure.

### Quality summary

`GET /api/v1/quality` exposes collection integrity and editorial-status counts, including the content version. It is a summary, not a per-verse certification.

### Health

`GET /health` returns status `ok`, version, content version and record count. It remains public if an API key is enabled and is not cached.

## Choosing a response format

| Endpoint | Format parameter |
| --- | --- |
| Single verse / daily | `json` default, or `text` |
| Export | `json` default, or `ndjson` |
| Other endpoints | JSON only; no format parameter |

See [Search and Filters](Search-and-Filters.md) for all parameter limits and [Caching and HTTP](Caching-and-HTTP.md) for HEAD, OPTIONS and ETags.

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
