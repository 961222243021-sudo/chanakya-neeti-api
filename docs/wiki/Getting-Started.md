# Getting Started

**Base URL**

```text
https://chanakya-neeti-api.vercel.app/api/v1
```

**Get one verse**

```sh
curl 'https://chanakya-neeti-api.vercel.app/api/v1/verses/10.15'
```

```js
const response = await fetch(
  'https://chanakya-neeti-api.vercel.app/api/v1/verses/10.15'
);
const payload = await response.json();

if (!response.ok) throw new Error(payload.error.message);

console.log(payload.data.text.english_meaning);
```

> **How IDs work:** `"10.15"` means chapter **10**, verse **15**. Keep IDs as strings. Use the chapter index to find available verse numbers.

Public access needs no key unless the owner enables one. The API supports **GET**, **HEAD** and **OPTIONS**.

## Build in four steps

1. Choose an endpoint from the [reference](API-Reference.md).
2. Make a GET request using a complete URL.
3. Check the HTTP status and parse the appropriate [response format](Response-Formats.md).
4. Display Tamil lines and both meanings, or use the returned records in your application.

## Common response locations

| Request | Verse location |
| --- | --- |
| Single lookup | `payload.data` |
| Daily | `payload.data.verse` |
| Random or batch | `payload.data[]` |
| Browse or chapter | `payload.data.results[]` |
| Related | `payload.data.results[].verse` |
| JSON export | `payload.records[]` |

Do not use one path for every endpoint. For example, daily wraps the verse with its date and timezone, while a single lookup returns it directly.

## Good first requests

- [One verse](https://chanakya-neeti-api.vercel.app/api/v1/verses/10.15)
- [Today's verse](https://chanakya-neeti-api.vercel.app/api/v1/daily)
- [Three random verses](https://chanakya-neeti-api.vercel.app/api/v1/random?count=3)
- [Chapter index](https://chanakya-neeti-api.vercel.app/api/v1/chapters)
- [Topic list](https://chanakya-neeti-api.vercel.app/api/v1/topics)

Next: [Response Formats](Response-Formats.md) or [Code Examples](Code-Examples.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
