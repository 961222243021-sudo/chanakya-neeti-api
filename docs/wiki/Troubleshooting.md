# Troubleshooting

## Find the symptom

| Symptom | Check | Fix |
| --- | --- | --- |
| I cannot read verses one by one | Are you viewing raw JSON? | Open /read/1.1#browse and use numbered links or Next |
| I see escaped newline characters | Are you displaying raw JSON? | Parse JSON; render text.lines_ta separately |
| Daily data.text is undefined | Daily wraps its verse | Use data.verse.text |
| Random result has no direct text field | Random always returns an array | Use data[0].text |
| Export has no data field | Exports use a different shape | Read records for JSON; parse each line for NDJSON |
| API returns 400 | Invalid input or parameter | Read error.message and the parameter table |
| API returns 401 | API_KEY is set | Send x-api-key with the configured key |
| Specific verse returns 404 | Number may be unavailable | Check the chapter's verse_numbers |
| Random returns 404 | count exceeds matching candidates | Reduce count or broaden filters |
| Reviewed filter has no results | No records currently match | Omit review or select a matching status |
| Search returns no matches | Keyword search does not resolve synonyms | Try fewer or simpler words, or match=any |
| URL does not open | Missing slash before /api | Use .vercel.app/api, not .vercel.appapi |
| Browser fails but curl works | CORS origin mismatch | Configure CORS_ORIGINS for the app's exact origin |
| 304 fails JSON parsing | A 304 has no body | Reuse the stored response body |
| Build fails | Dataset validation fails | Read the first assertion and correct the affected record |
| Local server cannot start | Port occupied or wrong runtime | Use Node 24 and an available PORT |

## Read an error response

```json
{"error":{"code":"INVALID_PARAMETER","message":"limit must be an integer from 1 to 100.","request_id":"…"}}
```

Use the HTTP status and message together. Provide the request ID when reporting unexpected failures. Website 404s use HTML, so do not parse arbitrary missing page responses as JSON.

## Reproduce with a simple request

```sh
curl -i 'https://chanakya-neeti-api.vercel.app/api/v1/verses/10.15'
curl -i 'https://chanakya-neeti-api.vercel.app/health'
```

Then add filters one at a time. Never include a private key in public screenshots, issue descriptions or logs.

## Reporting a bug

Provide the endpoint without secrets, HTTP status, error code/message, request ID, expected behavior and steps to reproduce. For layout issues, include device size and a screenshot. For content corrections, include the verse ID and the proposed correction.

Next: [FAQ](FAQ.md) or [API Reference](API-Reference.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
