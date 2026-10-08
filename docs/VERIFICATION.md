# Verification — version 1.2.0

Developed by Shyam. Checked on 2026-10-08.

- 319 unique verses with complete, distinct plain-English explanations.
- Both meanings included in single, browse, chapter, daily, random, batch, related and export responses; plain text includes English too.
- Tamil/English search, filters, pagination, strict input validation, dates and selection behavior covered by automated tests.
- Real HTTP adapter and explicit Vercel function entrypoint exercised locally.
- Homepage and guide served without external script or stylesheet dependencies.
- Complete endpoint and parameter reference embedded in HTML; removed specification routes return 404.
- Supplied homepage image served byte-for-byte with the correct content type.
- Public responses and HTML omit provenance fields.
- Optional authentication, CORS, HEAD, preflight, caching and error behavior covered.

Run `npm test`, `npm run build` and `node --check public/client.js` to reproduce checks. These verify software behavior and structural integrity, not an independent linguistic review. Full editorial review remains pending. Chromium is unavailable, so browser layout/interaction review is not claimed. Live endpoint verification is limited by the connected deployment permissions; GitHub deployment status is checked separately after publishing.


## Reader and 404 update

Every one of the 319 HTML reader pages is checked for its content, progress and adjacent links. Tests verify cross-chapter navigation, preserved numbering gaps, selector behavior, static homepage content, image delivery, HTML 404 status/HEAD/recovery links and unchanged JSON API errors.
