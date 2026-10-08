# சாணக்கிய நீதி API

**Developed by Shyam.** An edition-aware Tamil REST API with a self-contained API playground. Version 1.0.0.

The implementation contains every numbered main-text entry detected in the supplied edition: **319 records across 17 chapters**. It preserves source numbering, raw extracted text, PDF page references, source attribution, and editorial status. The introduction, pronunciation notes, and appendix are accessible separately.

## Run

Requires Node.js 24. No runtime npm dependencies, database, login, or external AI service.

```sh
npm start
```

Open `http://localhost:3000/docs`. Test an endpoint:

```sh
curl http://localhost:3000/api/v1/verses/1.6
curl 'http://localhost:3000/api/v1/verses?topic=money&chapter=1&limit=5'
curl --get --data-urlencode 'q=சேமி' http://localhost:3000/api/v1/verses
```

```sh
npm test
npm run build
```

`build` validates the dataset; there is no compilation step. Tests exercise the actual request handler. The original uploaded PDF is not bundled.

## Endpoints

| GET path | Purpose |
| --- | --- |
| `/health` | Runtime health and dataset checksum |
| `/api/v1` | API identity, version and developer |
| `/api/v1/verses` | Paginated browse, ranked keyword search and combined filters |
| `/api/v1/verses/1.6` | Source chapter/verse lookup |
| `/api/v1/verses/1.6/related` | Shared topic matches, with match explanation |
| `/api/v1/chapters` | Chapter counts, verse numbers and observed gaps |
| `/api/v1/chapters/13` | Browse an individual chapter |
| `/api/v1/topics` | Topic taxonomy and counts |
| `/api/v1/daily` | Deterministic daily verse in Asia/Kolkata |
| `/api/v1/random` | Random records without duplication |
| `/api/v1/batch?ids=1.6,2.1` | Ordered lookup for up to 50 IDs |
| `/api/v1/export?format=ndjson` | Full or filtered JSON/NDJSON download |
| `/api/v1/sources` | Translator, edition checksum and rights status |
| `/api/v1/quality` | Review status, counts and numbering gaps |
| `/api/v1/supplementary?page=112` | Introduction, notes and appendix by PDF page |
| `/openapi.json` | OpenAPI 3.1 specification |
| `/docs` | Interactive documentation and request playground |

### Filtering and search

`chapter=1..17`, `topic=money`, `review=reviewed|unreviewed` combine with AND. Topic IDs: `money`, `friendship`, `education`, `leadership`, `relationships`, `discipline`, `resilience`, `ethics`.

`q` accepts Tamil words or English topic IDs, up to 200 characters. Separate terms with spaces or commas. `match=all` is the default; `match=any` broadens results. Search normalizes Unicode and spaces; literal substring and phrase matches determine rank. This is deterministic keyword search, not semantic AI search.

`page` defaults to 1; `limit` defaults to 20 and is capped at 100. `include_raw=true` adds unmodified PDF extraction. Empty results return an empty array and total 0. Unknown and repeated parameters fail with 400 on parameterized API routes.

`random` accepts `count=1..20`. `daily` accepts a real ISO calendar `date=YYYY-MM-DD`, defaults to the Indian date, and supports chapter/topic/review filters. Daily selection is stable for the same date, ordered filtered dataset, and dataset version. Changing the dataset may change the daily result. Random always returns an array; daily returns `{date, timezone, verse}`.

### Response contract

Normal JSON responses use `{data, meta}`. `meta` contains `api_version`, `dataset_version`, and `developed_by: "Shyam"`. Search and browse data contain `{results, pagination}`. `pagination` contains `page`, `limit`, `total`, `pages`, and `has_next`.

Errors use `{error: {code, message, request_id}}`. HTTP status codes distinguish bad parameters (400), authentication failure (401), missing source verses (404), blocked writes (405), and unexpected failures (500). OpenAPI is a raw specification. JSON exports use `{dataset_version, sources, records}`; NDJSON exports contain one record per line.

Read-only GET, HEAD and OPTIONS are supported. Cacheable responses have ETags, support conditional GET, and use a short public cache. Daily cache lifetime is 60 seconds, preventing a long stale daily response at midnight. Random and health use `no-store`. Responses protected by a configured API key also use `no-store`.

## Configuration

Environment variables:

| Variable | Default | Behavior |
| --- | --- | --- |
| `PORT` | `3000` | Local HTTP port |
| `API_KEY` | unset | When set, protect `/api/v1` data routes with `x-api-key` |
| `CORS_ORIGINS` | `*` | Allowed browser origins, comma separated |

API key checks use a constant-time digest comparison. API keys are not saved by the playground. CORS controls browser access; it is not authentication. Health, documentation, assets, and OpenAPI stay public. Configure secrets in the hosting dashboard or your shell; `.env` files are not loaded automatically. For a local env file, use `node --env-file=.env scripts/serve.mjs`.

## Deploy

### Vercel

The explicit `api/index.js` entrypoint exports the shared Web Request/Response handler. `vercel.json` sets the Other framework preset, publishes `public/`, routes incoming paths to the function, and explicitly includes the dataset and page assets in the function bundle. The local server lives in `scripts/serve.mjs`, outside framework entrypoint detection.

1. Put this folder's contents in a Git repository.
2. Import that repository into Vercel.
3. Use the **Other** framework preset and Node.js 24. The repository configuration sets the output directory to `public`; remove any conflicting dashboard override.
4. Set environment variables if desired, then deploy.
5. Check `/health`, `/docs`, and `/api/v1/verses/1.6` on the deployed URL.

The project has been tested locally, including its HTTP adapter and explicit Vercel function export. Hosted verification remains pending: the current Vercel connection denied access to this project’s deployment details. Reference: https://vercel.com/docs/functions/runtimes/node-js

### Docker or another Node host

```sh
docker build -t chanakya-neeti-api .
docker run --rm -p 3000:3000 chanakya-neeti-api
```

Docker configuration is supplied but was not executed in this environment. The container runs as the unprivileged `node` user. All application data is immutable at runtime.

For a high-traffic public service, configure host-level rate limits and abuse protection. There is no misleading process-local distributed rate limiter in this implementation.

## Source fidelity and publication status

- Source: *சாணக்கிய நீதி: அரசியலும் அந்தரங்கமும்*, Tamil edition, translated by Sandhya Natarajan and published by சந்தியா பதிப்பகம்.
- Main text: PDF pages 8–107. PDF has 113 pages.
- Chapter 13 lacks numbered entries 4, 5, 6, 7, and 11 in this source; they return 404. They are not silently synthesized or renumbered.
- Sanskrit text appears in Tamil transliteration. The API does not label it Devanagari or claim to supply an independently verified Sanskrit original.
- Every entry is currently **unreviewed**. Legacy font mapping repairs many encoding issues, but residual spacing, spelling, and glyph interpretation need proofreading.
- Source punctuation uses a single final bar in entries 15.2 and 15.10; these boundaries are handled explicitly and labelled in `quality.boundary_method`.
- Topic assignment is keyword-derived, not an editorial judgment. Historical prejudices remain in the source text; the API preserves the text as a historical source.
- Software development is credited to Shyam. That attribution does not claim authorship of the book or translation.
- Publication permission for the modern translation has not been established. No open license is asserted for the dataset or code in this package. Decide the code license separately from translation rights before a public release.

### Re-extract or improve data

Python with PyMuPDF is required only for source extraction, not for running the API:

```sh
python -m pip install PyMuPDF
python scripts/extract_pdf.py /path/to/source.pdf --output data
npm run check
npm test
```

The importer targets this specific edition and its page ranges. Re-running replaces generated JSON; preserve any editorial corrections before doing so. After proofreading, update `quality.status` per record and regenerate `quality-report.json` counts. Use the raw text, source pages and source SHA-256 to audit changes. A different edition should get its own importer, source ID and numbering manifest.

## Project map

`src/app.mjs` is the shared request handler, `scripts/serve.mjs` is the local HTTP adapter and `api/index.js` is the Vercel function, `src/openapi.mjs` is the API contract, `data/` contains edition records, `public/` contains the documentation playground, `scripts/` contains extraction and integrity checks, and `test/` contains endpoint tests. See `docs/DEVELOPMENT_PLAN.md` for decisions, delivered scope and release gates.

## Correct deployed URLs

If your assigned domain is `chanakya-neeti-api.vercel.app`, open:

- Homepage: https://chanakya-neeti-api.vercel.app/
- Verse: https://chanakya-neeti-api.vercel.app/api/v1/verses/1.6
- Daily: https://chanakya-neeti-api.vercel.app/api/v1/daily
- Docs: https://chanakya-neeti-api.vercel.app/docs

Always retain the slash before `api`: `.vercel.app/api`, never `.vercel.appapi`. The homepage generates the full endpoint from its actual deployed origin, so copied URLs use the correct domain.
