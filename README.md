# சாணக்கிய நீதி API

Developed by **Shyam**. Version **1.1.0**.

A Tamil REST API with 319 numbered entries, 17 chapters, search, topic filters, daily/random selection and a responsive guide with readable verse previews.

## Run and test

Requires Node.js 24. No runtime dependencies or database.

```sh
npm start
npm test
npm run build
```

Open `http://localhost:3000/`. The guide auto-loads today’s verse and shows JavaScript/Python examples. `/read/10.15` loads a specific verse in the reader.

## Verse formatting

- `text.transliteration_ta`: a clean single-line string.
- `text.lines_ta`: trimmed nonempty lines in display order.
- `text.meaning_ta`: the Tamil explanation.
- `/api/v1/verses/10.15?format=text`: readable text with actual line breaks.
- `/api/v1/daily?format=text`: daily verse as text.

JSON correctly escapes line breaks inside string values. The API’s standard verse string is now single-line; use `lines_ta` to lay out the poem. Original raw text is optional and may still contain escaped line breaks.

Normal JSON responses use `{data, meta}`. A single lookup returns the verse in `data`; daily returns it in `data.verse`. Arrays are returned by random and batch; search returns `{results, pagination}`. Public responses omit provenance and internal review metadata.

## Endpoints

| GET | Purpose |
| --- | --- |
| `/api/v1` | API identity |
| `/api/v1/verses/10.15` | One verse |
| `/api/v1/verses` | Paginated search and browse |
| `/api/v1/verses/10.15/related` | Related topic matches |
| `/api/v1/daily` | Daily verse in Asia/Kolkata |
| `/api/v1/random?count=3` | Unique random verses |
| `/api/v1/chapters` | Chapter index and valid numbers |
| `/api/v1/chapters/1` | Browse a chapter |
| `/api/v1/topics` | Topic IDs and counts |
| `/api/v1/batch?ids=1.6,10.15` | Ordered batch |
| `/api/v1/export?format=ndjson` | JSON or NDJSON download |
| `/api/v1/quality` | Dataset integrity summary |
| `/health` | Health |
| `/openapi.json` | OpenAPI 3.1 |
| `/docs` | Guide and playground |
| `/read/10.15` | HTML verse reader |

## Filters and errors

Combine `chapter`, `topic`, and `review`. Use `q` for Tamil words or English topic keywords; `match=all` is the default and `match=any` broadens search. Search normalizes Unicode and whitespace. Encode Tamil query values. `page` starts at 1; `limit` defaults to 20 and is capped at 100. Random count is capped at 20; batch size is capped at 50. Daily accepts a real `YYYY-MM-DD` date and is deterministic for the date, filters and dataset version.

Errors use `{error: {code, message, request_id}}`. Invalid parameters return 400, missing verses 404, and writes 405. Chapter 13’s unavailable numbers return 404. GET, HEAD and OPTIONS are supported.

## Vercel

Import the repository with Node.js 24 and Other as the framework. `vercel.json` supplies the build command, `public` output directory, function bundle and catch-all routing. Remove conflicting dashboard overrides. The function is `api/index.js`; the local listener is `scripts/serve.mjs`.

After deploying, open `/`, `/health`, `/api/v1/verses/10.15`, and `/docs`. Keep the slash between the domain and path: `.vercel.app/api`, never `.vercel.appapi`. The homepage’s copy button builds the full URL from its actual origin.

## Optional configuration

`PORT` defaults to 3000. Set `API_KEY` to require `x-api-key` on data endpoints. Set comma-separated `CORS_ORIGINS` to restrict browser origins; the default is `*`. Environment files are not loaded automatically; use `node --env-file=.env scripts/serve.mjs` locally. Do not expose private API keys in public frontend code.

Protected responses, health and random results use `no-store`. Other responses use short caching with ETag support. Exports contain records and a dataset version. Topic and related-verse results use keyword matching.

The software has automated checks; a full editorial review of every Tamil entry remains pending. Browser visual verification and live endpoint verification are not claimed by these local tests.
