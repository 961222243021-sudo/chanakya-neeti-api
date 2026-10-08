# Vercel Deployment

1. Import this GitHub repository into Vercel.
2. Select **Other** as the framework and **Node.js 24** as the runtime.
3. Keep the root directory at the repository root.
4. Let [`vercel.json`](https://github.com/961222243021-sudo/chanakya-neeti-api/blob/main/vercel.json) supply the build command, output directory, routing and bundled files. Remove conflicting dashboard overrides.
5. Deploy, then check the homepage, `/health`, `/read/1.1` and `/api/v1/verses/10.15`.

| Setting | Repository configuration |
| :--- | :--- |
| Build command | `npm run build` |
| Output directory | `public` |
| Function entrypoint | `api/index.js` |
| Included files | `data/**`, `public/**` |
| Local server | `scripts/serve.mjs` |

Keep the slash between the domain and path: **`.vercel.app/api`**. The website generates complete example URLs from its own deployment origin.

## How routing works

The function at api/index.js delegates to the same request handler as the local HTTP server. The catch-all rewrite sends nested API and reader paths to that function. Public assets are present in the configured output directory, and data/public files are included in the function bundle.

The function does not start a listening HTTP server. Keep the local listener under scripts/serve.mjs rather than adding a root server entrypoint that could alter platform detection.

## Deploy checklist

| Check | Expected behavior |
| --- | --- |
| / | Homepage with an actual first verse and navigation |
| /read/10.15 | Requested verse, Tamil and English, previous/next |
| /api/v1/verses/10.15 | JSON with data.text.english_meaning |
| /docs | Guide and examples |
| /health | data.status = ok |
| /not-a-page | Illustrated HTML 404 with HTTP 404 |
| /api/v1/not-a-route | JSON error with HTTP 404 |

## Environment configuration

Set API_KEY only if you want protected data requests. Set CORS_ORIGINS only if you need an allowlist. PORT is for local serving; the Vercel entrypoint does not use it to bind a server.

Environment-specific deployment settings can differ between preview and production. Verify the intended environment after deploying. The guide's generated example URLs use the current origin so preview links stay on the preview domain.

## Diagnosing a failure

- Build fails: run npm run build locally and inspect the first validation error.
- Homepage works but API fails: check the catch-all rewrite and function bundle configuration.
- Function returns 500: inspect runtime logs and the presence of required data and public assets.
- API returns 401: send the configured key or disable API_KEY if public access is intended.
- Browser requests fail while curl works: check CORS_ORIGINS.
- API path fails immediately: keep the slash between .vercel.app and /api.

GitHub/Vercel reporting a successful deployment does not replace opening the deployed routes and checking their responses. See [Troubleshooting](Troubleshooting.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
