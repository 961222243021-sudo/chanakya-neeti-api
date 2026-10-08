# Response Formats

A single-verse request returns the verse in `data` and version/developer information in `meta`.

```json
{
  "data": {
    "id": "10.15",
    "chapter": 10,
    "verse": 15,
    "text": {
      "transliteration_ta": "ஏக வ்ருக்ஷ ஸம ஆரூடா நானாவர்ணா விஹங்கமா: | ப்ராபாதே திக்ஷு தசஸு யான்தி கா தத்ர வேதனா ||",
      "meaning_ta": "பலவகைப் பறவைகள் ஒன்று கூடி ஓர் இரவை ஒரு மரத்தில் கழிக்கின்றன. அவை பல வண்ணம் கொண்டவை; பல இனத்தவை. கூடியிருந்த அவையனைத்தும் விடிந்ததும் பல்வேறு திசைகளில் பறந்து போய்விடுவன. இதில் துக்கப்படுவதற்கு என்ன இருக்கிறது? பிரிவு இயல்பானது. அதற்குத் துக்கப்படுவதேன்? துயரப்படுவதேன்?",
      "lines_ta": [
        "ஏக வ்ருக்ஷ ஸம ஆரூடா",
        "நானாவர்ணா விஹங்கமா: |",
        "ப்ராபாதே திக்ஷு தசஸு",
        "யான்தி கா தத்ர வேதனா ||"
      ],
      "english_meaning": "People can share a chapter of life and then go their separate ways, like birds leaving the same tree in the morning. Appreciate the time together; moving on is natural, even when it hurts."
    },
    "topics": [
      "resilience"
    ]
  },
  "meta": {
    "api_version": "1.2.0",
    "dataset_version": "c8391e0a84931676",
    "developed_by": "Shyam"
  }
}
```

| Field | Type | Use |
| :--- | :--- | :--- |
| `id` | String | Stable chapter-and-verse identifier |
| `chapter`, `verse` | Integers | Numbered location in the collection |
| `text.transliteration_ta` | String | Tamil-script verse, flattened into one line |
| `text.lines_ta` | String array | Verse lines in display order |
| `text.meaning_ta` | String | Tamil explanation |
| `text.english_meaning` | String | Short, accessible English interpretation |
| `topics` | String array | Discovery tags; may be empty |
| `meta.api_version` | String | API contract version |
| `meta.dataset_version` | String | Content checksum version |
| `meta.developed_by` | String | Developer credit: Shyam |

Every public verse object includes both meanings. Use `lines_ta` for layout and insert strings with `textContent` in HTML. Parsing JSON handles escape sequences; avoid manually modifying the raw response.

**Want plain text?** Add `?format=text` to a single-verse or daily request. It includes the verse lines and both meanings with actual line breaks.

## Response shapes

Standard JSON endpoints wrap results in `data` and attach `meta`. This table shows the shape of `data`.

| Endpoint | data shape |
| --- | --- |
| Single verse | Verse object |
| Daily | `{ date, timezone, verse }` |
| Random / batch | Array of verse objects |
| Browse | `{ results, pagination }` |
| Chapter browse | `{ chapter, results, pagination }` |
| Related | `{ method, results: [{ verse, shared_topics }] }` |
| Chapter index / topics | Array of metadata objects |
| Overview / health / quality | Metadata object |

JSON export is `{ dataset_version, records }`. NDJSON export is one verse JSON object per line. Plain text has no JSON structure.

## Displaying text correctly

- Parse JSON first, then read its fields.
- Render each item of `lines_ta` separately, preserving order.
- Use `meaning_ta` for the Tamil explanation and `english_meaning` for the English interpretation.
- The normal transliteration string is a single line. Optional raw text can contain line breaks and should not be your default display field.
- Insert text safely with `textContent`.

## Empty and missing results

A valid browse query with zero matches returns HTTP 200, `results: []`, `total: 0`, `pages: 0` and `has_next: false`. A missing specific verse is a 404 error, not an empty verse object.

## Content and API versions

`api_version` describes the API contract. `dataset_version` is a 16-character checksum derived from the verse collection and English meanings. Content edits can change the checksum without changing endpoint names. Daily selection includes this version, so a content update can change which verse a date selects.

Next: [Errors and Troubleshooting](Troubleshooting.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
