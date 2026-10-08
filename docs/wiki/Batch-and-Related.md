# Batch and Related

## Ordered batch lookup

```text
GET /api/v1/batch?ids=1.6,10.15
GET /api/v1/batch?ids=10.15,1.6,10.15
```

Provide 1–50 comma-separated IDs. `ids` is required. The API preserves requested order and duplicates. JSON returns a verse array in `data`; every verse includes Tamil and English meanings.

Any invalid or unavailable ID fails the entire request. There are no partial successes. Do not add spaces around IDs: use `1.6,10.15`, not `1.6, 10.15`.

Use `include_raw=true` only when you need the optional raw field. Batch does not support format, pagination or search filters.

## Related verses

```text
GET /api/v1/verses/10.15/related
GET /api/v1/verses/10.15/related?limit=3
```

`limit` defaults to 5 and ranges from 1–20. The requested verse is excluded from results. Candidates must share at least one topic. They are ranked by number of shared topics, then chapter and verse order.

```json
{
  "data": {
    "method": "shared_keyword_topics",
    "results": [
      { "verse": { "id": "…", "text": { "english_meaning": "…" } }, "shared_topics": ["resilience"] }
    ]
  },
  "meta": { "api_version": "1.2.0", "dataset_version": "…", "developed_by": "Shyam" }
}
```

This is a shortened shape illustration, not a complete record. A verse with no shared topic matches returns `results: []`. Related lookup does not accept chapter or topic filters. It is tag matching, not semantic recommendation.

## Picking between endpoints

| Need | Endpoint |
| --- | --- |
| Known IDs in a chosen order | batch |
| Similar discovery topics | related |
| Search specific words | verses with q |
| Browse one chapter | chapters/{chapter} |

Next: [API Reference](API-Reference.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
