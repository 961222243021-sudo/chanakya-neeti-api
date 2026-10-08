# Reader Guide

1. Open the [reader](https://chanakya-neeti-api.vercel.app/read/1.1#browse).
2. Choose **Chapter 1–17** from the chapter selector.
3. Tap a numbered verse, or use the verse selector.
4. Read the Tamil text, Tamil meaning and plain-English explanation.
5. Press **Next** or **Previous** to continue.

**No URL editing. No JSON knowledge needed.** Next automatically continues into the following chapter and skips unavailable verse numbers. The numbered links work without JavaScript; selectors offer another way to navigate.

Unknown pages and unavailable reader verses show an illustrated 404 page with working **Home**, **Start reading** and **Go back** controls.

## What you see

| Control | Purpose |
| --- | --- |
| Chapter selector | Jump to the first available verse of a chapter |
| All 17 chapters | Numbered chapter links, also usable without JavaScript |
| Verse selector | Jump to a verse in the current chapter |
| Numbered verse buttons | Open a specific available verse |
| Previous / Next | Move through the full collection in order |
| Position and progress bar | Current location, for example `1 of 319` |
| Start from verse 1 | Return to the beginning |

## Moving between chapters

Next from the last verse of chapter 1 opens the first verse of chapter 2. Previous works in the opposite direction. The controls follow available records; they do not invent missing numbers.

Previous is disabled on the first verse. Next is disabled on the final verse, where the reader offers a message to start again or select another chapter.

## Reading languages

The verse is shown in Tamil script. The Tamil explanation follows under **பொருள்**. The **IN PLAIN ENGLISH** panel explains the idea in accessible English. Both meanings are visible together; no language toggle is required.

## Share a verse

Copy the page address or share a direct link such as:

```text
https://chanakya-neeti-api.vercel.app/read/10.15#browse
```

The `#browse` fragment takes the reader to the reading section. A direct reader page also scrolls there when JavaScript is available.

## The API playground is optional

Everyday readers can stay in the numbered reader. The playground and JSON tab are for developers testing requests; they are not required to read the collection.

Next: [FAQ](FAQ.md) or [Getting Started](Getting-Started.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
