import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(projectRoot, 'docs/wiki');
const argument = process.argv[2];
if (!argument) throw new Error('Usage: node scripts/export-wiki.mjs <destination-directory>');
const destination = resolve(argument);
const sourceRelative = relative(source, destination);
if (destination === projectRoot || (!sourceRelative.startsWith('..') && !isAbsolute(sourceRelative))) throw new Error('Choose a destination outside the wiki source directory and project root.');
const wikiBase = 'https://github.com/961222243021-sudo/chanakya-neeti-api/wiki/';
const files = readdirSync(source).filter(name => name.endsWith('.md'));
const known = new Set(files);
mkdirSync(destination, { recursive: true });
for (const filename of files) {
  const markdown = readFileSync(resolve(source, filename), 'utf8');
  const published = markdown.replace(/\]\(([A-Za-z0-9_-]+)\.md(#[^)]*)?\)/g, (match, page, fragment = '') => {
    if (!known.has(`${page}.md`)) throw new Error(`Unknown wiki page: ${page}.md`);
    return `](${wikiBase}${page}${fragment})`;
  });
  writeFileSync(resolve(destination, filename), published);
}
console.log(`Exported ${files.length} Markdown files to ${destination}. No Git actions were performed.`);
