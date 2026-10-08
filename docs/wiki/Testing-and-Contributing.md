# Testing and Contributing

## Reproduce the checks

```sh
npm test
npm run build
node --check public/client.js
node --check public/browse.js
node --check public/not-found.js
```

The current local suite passed 47 checks. npm run build runs collection validation, not compilation. The check script verifies complete English coverage alongside structural collection checks.

## Coverage

| Area | Checks |
| --- | --- |
| Verse responses | Formatting, both meanings, optional fields, missing numbers |
| Search and filters | Tamil/English matching, combined filters, pagination, invalid input |
| Selection | Stable daily responses, real dates, filtered pools, random uniqueness |
| Batch and related | Order, missing IDs, shared-topic explanations |
| Downloads | JSON/NDJSON counts and format handling |
| HTTP | Adapter integration, HEAD, OPTIONS, auth, CORS, errors and ETags |
| Reader | All 319 pages, exact selected verse, neighbors, chapter transitions, static homepage fallback |
| 404 | HTTP status, illustrated HTML, recovery links, API errors staying JSON |
| Assets | Image bytes and content types |
| Examples | Executable guide snippets against the handler |
| Deployment | Local Vercel entrypoint and bundle/routing configuration |

## What these checks do not establish

They do not certify every Tamil spelling or English interpretation, confirm browser layout, prove a hosted endpoint's behavior, or benchmark large-scale traffic. The [verification record](https://github.com/961222243021-sudo/chanakya-neeti-api/blob/main/docs/VERIFICATION.md) documents these limits.

## Proposing a change

1. Read the [license](License-and-Copyright.md) and get permission when required.
2. Make a focused change with a concrete before/after description.
3. Preserve available numbering and unique IDs.
4. Keep English interpretations specific, concise and accessible.
5. Update documentation when response behavior changes.
6. Run checks appropriate to the affected behavior.

For content corrections, provide the verse ID, existing text, proposed text and a concise reason. Do not mark records reviewed without actual editorial review. Check that reader, API and export all remain consistent after changes.

## Documentation changes

Keep page links valid and examples consistent with the implemented handler. The wiki source is versioned under docs/wiki. The publication exporter rewrites internal .md links for the native GitHub Wiki; see [Wiki Publishing](Wiki-Publishing.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
