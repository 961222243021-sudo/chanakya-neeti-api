# Frequently Asked Questions

## What do 319 and 17 mean?

There are 319 available verse records across 17 chapters. A chapter contains several numbered verses. The reader lets you choose them without editing URLs.

## Where do I start reading?

Open [verse 1](https://chanakya-neeti-api.vercel.app/read/1.1#browse). Press Next to continue. Choose another chapter or verse at any time.

## Does Next go to the next chapter?

Yes. At the end of a chapter, it opens the first available verse in the next chapter. The last verse of the whole collection has Next disabled.

## Why is a verse number unavailable?

The app preserves available numbering rather than fabricating records. Use the chapter index or the numbered reader to see valid numbers.

## Do I need an API key or login?

Not on a public deployment with API_KEY unset. An owner can enable a key for /api/v1 requests. Website reading remains public. There is no account/login feature.

## Is the English meaning a literal translation?

No. It is a short modern interpretation of each verse's idea, including context when needed. Both Tamil and English explanations are available.

## Can I search in English?

Yes. Search includes English explanations and topic keywords, as well as Tamil text. It uses keywords rather than semantic understanding.

## Is today's verse the next verse in order?

No. Daily selects one deterministic candidate for the date, filters and content version. Use the numbered reader for sequential reading.

## Why did a daily result change after an update?

The selection includes dataset_version. A content update can change which verse a date selects.

## Can I download the collection?

The export endpoint returns JSON or NDJSON, with optional filters. Access does not change content or software licensing; read the [license guide](License-and-Copyright.md).

## Does the project need a database or an AI key?

No. It uses bundled JSON records and no runtime dependencies. English meanings are stored content, not generated per request.

## Is every entry proofread?

Full editorial proofreading remains pending. Software tests check structural completeness and behavior, not independent linguistic accuracy.

## Is the code open source?

No. It has a proprietary license with © 2026 Shyam — All rights reserved. Public visibility does not grant a general open-source license. See the LICENSE file for scope and exceptions.

Next: [Home](Home.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
