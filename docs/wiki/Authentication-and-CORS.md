# Authentication and CORS

## Default public access

When API_KEY is unset, API requests require no key. No login, account, session cookie or database is involved.

## Enable an API key

Set API_KEY in the server environment. All /api/v1 requests then require the matching x-api-key header. The website, reader, images, documentation and health endpoint remain public.

```sh
curl 'https://chanakya-neeti-api.vercel.app/api/v1/verses/10.15'   -H 'x-api-key: YOUR_CONFIGURED_KEY'
```

Invalid or missing keys return 401 with `UNAUTHORIZED`. The comparison uses fixed-size SHA-256 digests and a timing-safe comparison. Protected responses use no-store. Keys belong in headers, not query strings or committed files.

The public reader remains usable when a key is enabled. The API playground requires a key in its optional key field for protected requests; it does not persist the key to local storage.

## Browser origin policy

| CORS_ORIGINS | Behavior |
| --- | --- |
| Unset or * | Allow all origins |
| https://example.com | Echo that origin when requested |
| https://one.example,https://two.example | Allow either listed origin |

An unlisted browser origin receives no Access-Control-Allow-Origin header. CORS is a browser policy, not authentication: non-browser clients can still request endpoints, subject to API_KEY when enabled.

The API advertises GET, HEAD and OPTIONS; allowed request headers include x-api-key and if-none-match. OPTIONS returns 204. Exposed response headers include ETag, x-request-id and x-dataset-version. Credentials/cookies are not used.

## Local environment files

```sh
node --env-file=.env scripts/serve.mjs
```

Environment files are not loaded automatically by npm start. On Vercel, configure environment variables for the intended deployment environment and deploy with those settings. See [Vercel Deployment](Vercel-Deployment.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
