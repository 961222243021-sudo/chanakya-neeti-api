# Development plan — Developed by Shyam

## Goal

Create a useful Tamil Chanakya Neeti API inspired by the discovery patterns of `nramc/thirukkural-api`, with a new implementation and edition-specific data. Developers should obtain a source-referenced verse in one request and readers should test the API without registering.

## Decisions

| Area | Decision | Reason |
| --- | --- | --- |
| Architecture | Read-only Node.js 24 API with one shared handler | No runtime dependencies, database fees or migration burden |
| Data model | Edition ID + chapter + source verse number | Preserve source variations and omissions |
| Content | Full numbered main text plus separate notes | Prevent editorial appendix material from being mixed into the core collection |
| Language | Standard Unicode Tamil, raw extraction retained | Searchable text with an audit trail |
| Search | Ranked keyword matches, all/any mode | Predictable behavior without external AI costs |
| Topics | Transparent keyword heuristics | Useful initial discovery with an honest classification method |
| Related verses | Shared-topic score and explicit reason | Explain matches; avoid invented semantic claims |
| Daily | Indian date, deterministic dataset-aware selection | Stable results for readers on the same date |
| Security | Read-only methods, strict validation, optional secret, controlled CORS | Small attack surface; keys never appear in request URLs |
| Scaling | Cacheable static responses and immutable in-memory data | Low request cost and no cross-instance state dependency |
| Attribution | Shyam for software; Sandhya Natarajan for translation | Clearly separate development from source authorship |

## Phase 1 — Source analysis and extraction: delivered

1. Inspect title, translator and 113-page structure.
2. Recover 62 legacy font characters using an explicit mapping, normalize pre-base vowel ordering, retain raw text.
3. Extract the 319 numbered records on PDF pages 8–107 into 17 chapters.
4. Retain chapter 13's five observed numbering gaps.
5. Separate introduction, pronunciation notes and appendix; preserve page references and source checksum.
6. Label automated content and topic assignments rather than treating them as proofread.

Acceptance: unique edition IDs, populated verse and meaning fields, no residual Greek legacy characters in normalized records, valid pages, exact source gaps. Passed automated checks. This does not prove linguistic correctness.

## Phase 2 — API implementation: delivered

Deliver versioned discovery, source metadata, quality reporting, chapter browsing, Tamil search, topic filters, batch lookup, related results, unique random selection, daily selection and two download formats. Supply OpenAPI 3.1, a local interactive playground, Docker and Vercel configuration, and optional API-key access.

Acceptance: consistent response envelopes, bounded pagination and batches, valid calendar dates, meaningful 4xx errors, source-aware IDs, CORS/HEAD/OPTIONS behavior, request IDs and ETags. All endpoint tests pass.

## Phase 3 — Verification and packaging: delivered

Run 25 request-handler tests, one real HTTP integration test, two Vercel entrypoint/configuration tests and a separate integrity validation. Package source, complete extracted data, documentation and the plan together. Keep source PDF outside the package. Browser visual testing was attempted but unavailable because no Chromium executable is installed; desktop/mobile appearance and browser interactions still require visual review.

## Phase 4 — Editorial release: remaining

1. Proofread each normalized entry against the cited PDF page, including spacing, vowel ordering, spelling, transliteration and meaning boundaries.
2. Confirm the 62-character mapping against rendered glyphs. Spot checks have been performed, not an exhaustive character-by-character certification.
3. Establish permission to publish the modern translation or replace it with an independently authored, properly sourced translation.
4. Review topic assignments, add explicit editorial annotations where appropriate, and update per-record review status and the quality report.
5. Decide the software license separately from the content license.

Acceptance: every record marked reviewed has traceable editorial review; licensed public dataset; no fabricated entries or meanings. None of these steps is falsely labelled complete.

## Phase 5 — Hosted launch: remaining

Select the GitHub repository and hosting project, deploy the supplied source, verify the public endpoint behavior and protected configuration, and configure host-level abuse/rate limits. Add host logging and uptime checks. Cloud deployment and large-scale load testing have not been performed.

## Future upgrades

After the core data is verified: independently sourced English explanations, a reviewed Sanskrit-script edition, edition comparison, situation-based discovery, editorial topics, SDKs, and reviewed practical examples. Each generated explanation should carry its own provenance and review status. No AI-generated text should replace the historical source silently.
