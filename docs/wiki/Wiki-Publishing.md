# Wiki Publishing

The documentation source is versioned in the main repository under docs/wiki. It can be read there immediately. Publishing the native GitHub Wiki is a separate operation.

## Contents

Normal Markdown pages become Wiki pages. Home.md becomes the home page. _Sidebar.md and _Footer.md provide shared navigation and attribution. Source pages use relative .md links so they work in the main repository; the exporter converts those links to native Wiki URLs.

## Export the pages

From the project root:

```sh
node scripts/export-wiki.mjs ../chanakya-wiki-export
```

The exporter creates a destination directory and writes Markdown files only. It does not delete other files, create commits, authenticate or push anything.

## Publish using an authorized Git client

GitHub documents native Wiki editing through the web UI or a separate .wiki.git repository. Create the initial Wiki page through GitHub if the Wiki has not yet been initialized.

```sh
git clone https://github.com/961222243021-sudo/chanakya-neeti-api.wiki.git ../chanakya-wiki
node scripts/export-wiki.mjs ../chanakya-wiki
cd ../chanakya-wiki
git status
git add -- '*.md'
git commit -m 'Publish complete Chanakya Neeti documentation by Shyam'
git push
```

Review the diff before committing, especially if pages already exist. Use your normal authorized GitHub credentials; never put a token into committed scripts or URLs. Changes must reach the wiki repository's default branch to appear in the Wiki tab.

## Publish through the web UI

Open the repository's Wiki tab, create or edit each page, paste its exported Markdown, and save. Use the page filename without .md as the title. Preserve the Home, _Sidebar and _Footer names for their special roles.

## Verify publication

Open the Wiki Home page and follow its links. Check the sidebar, footer, code blocks and architecture diagram. Confirm all pages exist and that the response examples match the current API.

Reference: [GitHub's wiki editing guide](https://docs.github.com/en/communities/documenting-your-project-with-wikis/adding-or-editing-wiki-pages).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
