import { readFileSync } from 'node:fs';
import { renderBrowse } from './reader.mjs';
import { createHash, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';

const load = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
export const verses = load('verses');
export const chapters = load('chapters');
export const topics = load('topics');
const quality = load('quality-report');
const englishMeanings = load('english-meanings');
const lookup = new Map(verses.map(v => [v.id, v]));
const version = '1.2.0';
const datasetVersion = createHash('sha256').update(JSON.stringify({ verses, englishMeanings })).digest('hex').slice(0, 16);
const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const notFoundImage = readFileSync(new URL('../public/not-found.png', import.meta.url));
const browseClient = readFileSync(new URL('../public/browse.js', import.meta.url), 'utf8');
const notFoundClient = readFileSync(new URL('../public/not-found.js', import.meta.url), 'utf8');
const client = readFileSync(new URL('../public/client.js', import.meta.url), 'utf8');
const heroImage = readFileSync(new URL('../public/chanakya-modern.png', import.meta.url));
const responsiveImages = new Map(['chanakya-modern-480', 'chanakya-modern-800', 'not-found-640', 'not-found-1200'].map(name => [`/${name}.webp`, readFileSync(new URL(`../public/${name}.webp`, import.meta.url))]));
const style = readFileSync(new URL('../public/style.css', import.meta.url), 'utf8');
const normalize = text => text.normalize('NFC').toLocaleLowerCase('en').replace(/[\s\u200b-\u200d]+/gu, '');
const searchable = new Map(verses.map(v => [v.id, normalize(`${v.text.meaning_ta} ${v.text.transliteration_ta} ${v.topics.join(' ')} ${englishMeanings[v.id]}`)]));
class ApiError extends Error { constructor(status, code, message) { super(message); this.status = status; this.code = code; } }
const fail = (status, code, message) => { throw new ApiError(status, code, message); };
function integer(params, key, fallback, min, max) {
  const raw = params.get(key);
  if (raw === null) return fallback;
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) < min || Number(raw) > max) fail(400, 'INVALID_PARAMETER', `${key} must be an integer from ${min} to ${max}.`);
  return Number(raw);
}
function boolean(params, key) {
  const raw = params.get(key);
  if (raw === null) return false;
  if (!['true', 'false'].includes(raw)) fail(400, 'INVALID_PARAMETER', `${key} must be true or false.`);
  return raw === 'true';
}
function filter(params) {
  const chapter = integer(params, 'chapter', null, 1, 17);
  const topic = params.get('topic');
  if (topic !== null && !topics.some(t => t.id === topic)) fail(400, 'INVALID_TOPIC', 'Unknown topic. See /api/v1/topics.');
  const review = params.get('review');
  if (review !== null && !['reviewed', 'unreviewed'].includes(review)) fail(400, 'INVALID_PARAMETER', 'review must be reviewed or unreviewed.');
  return verses.filter(v => (!chapter || v.chapter === chapter) && (!topic || v.topics.includes(topic)) && (!review || v.quality.status === review));
}
const publicVerse = (v, raw = false) => {
  const { raw_text, source, quality: reviewDetails, ...rest } = v;
  const lines = v.text.transliteration_ta.split(/\r?\n/u).map(line => line.trim()).filter(Boolean);
  return { ...rest, text: { ...v.text, transliteration_ta: lines.join(' '), lines_ta: lines, english_meaning: englishMeanings[v.id] }, ...(raw ? { raw_text } : {}) };
};
function formatVerse(params, verse, extra = {}) {
  const format = params.get('format') ?? 'json';
  if (!['json', 'text'].includes(format)) fail(400, 'INVALID_PARAMETER', 'format must be json or text.');
  if (format === 'json') return { data: Object.keys(extra).length ? { ...extra, verse } : verse };
  return { body: `சாணக்கிய நீதி · ${verse.id}\n\n${verse.text.lines_ta.join('\n')}\n\n${verse.text.meaning_ta}\n\nEnglish meaning\n${verse.text.english_meaning}\n\nDeveloped by Shyam\n`, type: 'text/plain; charset=utf-8' };
}
function verseById(id) {
  if (!/^(?:[1-9]|1[0-7])\.[1-9]\d*$/.test(id)) fail(400, 'INVALID_ID', 'Use chapter.verse, for example 1.6.');
  const record = lookup.get(id);
  if (!record) fail(404, 'VERSE_NOT_FOUND', 'Requested verse number is unavailable.');
  return record;
}
function utcDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) fail(400, 'INVALID_DATE', 'date must be a real YYYY-MM-DD date.');
  return date;
}
function today() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = type => parts.find(p => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function search(params, candidates) {
  const q = params.get('q');
  if (q === null) return candidates;
  if (!q.trim() || q.length > 200) fail(400, 'INVALID_QUERY', 'q must contain 1–200 characters.');
  const terms = q.split(/[\s,]+/u).filter(Boolean).map(normalize);
  if (!terms.length || terms.some(t => !t)) fail(400, 'INVALID_QUERY', 'q must contain a searchable word.');
  const mode = params.get('match') ?? 'all';
  if (!['all', 'any'].includes(mode)) fail(400, 'INVALID_PARAMETER', 'match must be all or any.');
  return candidates.map(v => {
    const text = searchable.get(v.id);
    const hits = terms.filter(t => text.includes(t)).length;
    const score = hits + (text.includes(normalize(q)) ? 3 : 0);
    return { v, hits, score };
  }).filter(r => mode === 'all' ? r.hits === terms.length : r.hits > 0)
    .sort((a, b) => b.score - a.score || a.v.chapter - b.v.chapter || a.v.verse - b.v.verse).map(r => r.v);
}
function pageResults(params, items) {
  const page = integer(params, 'page', 1, 1, 1000000);
  const limit = integer(params, 'limit', 20, 1, 100);
  const raw = boolean(params, 'include_raw');
  return { results: items.slice((page - 1) * limit, page * limit).map(v => publicVerse(v, raw)), pagination: { page, limit, total: items.length, pages: Math.ceil(items.length / limit), has_next: page * limit < items.length } };
}
function authorized(req) {
  const key = process.env.API_KEY;
  if (!key) return;
  const supplied = req.headers.get('x-api-key') ?? '';
  const hash = value => createHash('sha256').update(value).digest();
  if (!timingSafeEqual(hash(key), hash(supplied))) fail(401, 'UNAUTHORIZED', 'A valid x-api-key header is required.');
}
function checkParams(params, allowed) {
  for (const key of params.keys()) {
    if (!allowed.includes(key)) fail(400, 'UNKNOWN_PARAMETER', `Unsupported parameter: ${key}.`);
    if (params.getAll(key).length > 1) fail(400, 'DUPLICATE_PARAMETER', `Parameter ${key} must occur only once.`);
  }
}
const filterKeys = ['chapter', 'topic', 'review'];
const listKeys = [...filterKeys, 'q', 'match', 'page', 'limit', 'include_raw'];
async function route(url) {
  const path = url.pathname.replace(/\/$/, '') || '/';
  const params = url.searchParams;
  if (['/', '/docs', '/api/docs'].includes(path) || /^\/read\/(?:[1-9]|1[0-7])\.[1-9]\d*$/u.test(path)) {
    const selected = path.startsWith('/read/') ? verseById(path.slice(6)) : verses[0];
    return { body: html.replace(/<!--BROWSE-START-->[\s\S]*?<!--BROWSE-END-->/u, () => `<!--BROWSE-START-->${renderBrowse(publicVerse(selected), verses, chapters)}<!--BROWSE-END-->`), type: 'text/html; charset=utf-8' };
  }
  if (path === '/browse.js') return { body: browseClient, type: 'text/javascript; charset=utf-8' };
  if (path === '/not-found.js') return { body: notFoundClient, type: 'text/javascript; charset=utf-8' };
  if (path === '/not-found.png') return { body: notFoundImage, type: 'image/png', ttl: 86400 };
  if (path === '/404.html') return { body: notFound, type: 'text/html; charset=utf-8', status: 404, cache: false };
  if (path === '/client.js') return { body: client, type: 'text/javascript; charset=utf-8' };
  if (responsiveImages.has(path)) return { body: responsiveImages.get(path), type: 'image/webp', ttl: 86400 };
  if (path === '/style.css') return { body: style, type: 'text/css; charset=utf-8' };
  if (path === '/chanakya-modern.png') return { body: heroImage, type: 'image/png', ttl: 86400 };
  if (path === '/health') return { data: { status: 'ok', version, dataset_version: datasetVersion, records: verses.length }, cache: false };
  if (path === '/api/v1') return { data: { name: 'சாணக்கிய நீதி API', developed_by: 'Shyam', version, dataset_version: datasetVersion, records: verses.length, chapters: chapters.length, docs: '/docs' } };
  if (path === '/api/v1/verses') { checkParams(params, listKeys); return { data: pageResults(params, search(params, filter(params))) }; }
  if (path === '/api/v1/chapters') { checkParams(params, []); return { data: chapters }; }
  if (path === '/api/v1/topics') { checkParams(params, []); return { data: topics.map(t => ({ ...t, count: verses.filter(v => v.topics.includes(t.id)).length })) }; }
  if (path === '/api/v1/quality') { checkParams(params, []); return { data: { ...quality, dataset_version: datasetVersion } }; }
  if (path === '/api/v1/batch') {
    checkParams(params, ['ids', 'include_raw']);
    const ids = params.get('ids')?.split(',');
    if (!ids?.length || ids.length > 50) fail(400, 'INVALID_PARAMETER', 'ids must contain 1–50 comma-separated chapter.verse IDs.');
    return { data: ids.map(id => publicVerse(verseById(id), boolean(params, 'include_raw'))) };
  }
  if (path === '/api/v1/random') {
    checkParams(params, [...filterKeys, 'count', 'include_raw']);
    const candidates = [...filter(params)];
    const count = integer(params, 'count', 1, 1, 20);
    if (candidates.length < count) fail(404, 'INSUFFICIENT_RESULTS', 'Not enough verses match these filters.');
    for (let i = 0; i < count; i++) { const j = randomInt(i, candidates.length); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
    return { data: candidates.slice(0, count).map(v => publicVerse(v, boolean(params, 'include_raw'))), cache: false };
  }
  if (path === '/api/v1/daily') {
    checkParams(params, [...filterKeys, 'date', 'include_raw', 'format']);
    const date = utcDate(params.get('date') ?? today());
    const candidates = filter(params);
    if (!candidates.length) fail(404, 'NO_RESULTS', 'No verses match these filters.');
    const digest = createHash('sha256').update(`${datasetVersion}:${date}:${candidates.map(v => v.id).join(',')}`).digest();
    return { ...formatVerse(params, publicVerse(candidates[digest.readUInt32BE(0) % candidates.length], boolean(params, 'include_raw')), { date, timezone: 'Asia/Kolkata' }), ttl: 60 };
  }
  if (path === '/api/v1/export') {
    checkParams(params, [...filterKeys, 'format', 'include_raw']);
    const format = params.get('format') ?? 'json';
    if (!['json', 'ndjson'].includes(format)) fail(400, 'INVALID_PARAMETER', 'format must be json or ndjson.');
    const records = filter(params).map(v => publicVerse(v, boolean(params, 'include_raw')));
    const body = format === 'json' ? JSON.stringify({ dataset_version: datasetVersion, records }, null, 2) : records.map(v => JSON.stringify(v)).join('\n') + (records.length ? '\n' : '');
    return { body, type: format === 'json' ? 'application/json; charset=utf-8' : 'application/x-ndjson; charset=utf-8', attachment: `chanakya-neeti-${datasetVersion}.${format}` };
  }
  let match = path.match(/^\/api\/v1\/verses\/(\d+\.\d+)(\/related)?$/);
  if (match) {
    checkParams(params, match[2] ? ['limit'] : ['include_raw', 'format']);
    const v = verseById(match[1]);
    if (!match[2]) return formatVerse(params, publicVerse(v, boolean(params, 'include_raw')));
    const limit = integer(params, 'limit', 5, 1, 20);
    const results = verses.filter(r => r.id !== v.id).map(r => ({ r, shared: r.topics.filter(t => v.topics.includes(t)) }))
      .filter(r => r.shared.length).sort((a, b) => b.shared.length - a.shared.length || a.r.chapter - b.r.chapter || a.r.verse - b.r.verse).slice(0, limit);
    return { data: { method: 'shared_keyword_topics', results: results.map(r => ({ verse: publicVerse(r.r), shared_topics: r.shared })) } };
  }
  match = path.match(/^\/api\/v1\/chapters\/(\d+)$/);
  if (match) {
    checkParams(params, ['page', 'limit', 'include_raw']);
    const chapter = integer(new URLSearchParams({ chapter: match[1] }), 'chapter', null, 1, 17);
    return { data: { chapter: chapters.find(c => c.id === chapter), ...pageResults(params, verses.filter(v => v.chapter === chapter)) } };
  }
  fail(404, 'ROUTE_NOT_FOUND', 'Unknown endpoint. See /docs.');
}
export async function handleRequest(req) {
  const requestId = randomUUID();
  const headers = new Headers({ 'x-request-id': requestId, 'x-api-version': version, 'x-dataset-version': datasetVersion,
    'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'access-control-allow-methods': 'GET, HEAD, OPTIONS',
    'access-control-allow-headers': 'x-api-key, if-none-match', 'access-control-expose-headers': 'etag, x-request-id, x-dataset-version', 'vary': 'Origin' });
  const origin = req.headers.get('origin');
  const allowed = (process.env.CORS_ORIGINS ?? '*').split(',').map(x => x.trim());
  if (allowed.includes('*')) headers.set('access-control-allow-origin', '*');
  else if (origin && allowed.includes(origin)) headers.set('access-control-allow-origin', origin);
  try {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (!['GET', 'HEAD'].includes(req.method)) { headers.set('allow', 'GET, HEAD, OPTIONS'); fail(405, 'METHOD_NOT_ALLOWED', 'This API is read-only.'); }
    if (req.url.length > 4096) fail(414, 'URI_TOO_LONG', 'Request URL exceeds 4096 characters.');
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/v1')) authorized(req);
    const result = await route(url);
    const body = result.body ?? JSON.stringify({ data: result.data, meta: { api_version: version, dataset_version: datasetVersion, developed_by: 'Shyam' } }, null, 2);
    headers.set('content-type', result.type ?? 'application/json; charset=utf-8');
    if (result.type?.startsWith('text/html')) headers.set('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'");
    if (result.attachment) headers.set('content-disposition', `attachment; filename="${result.attachment}"`);
    const cache = !result.status && result.cache !== false && !process.env.API_KEY;
    headers.set('cache-control', cache ? `public, max-age=${result.ttl ?? 300}, must-revalidate` : 'no-store');
    if (cache) {
      const etag = `"${createHash('sha256').update(body).digest('hex')}"`;
      headers.set('etag', etag);
      if (req.headers.get('if-none-match')?.split(',').some(t => t.trim().replace(/^W\//, '') === etag || t.trim() === '*')) return new Response(null, { status: 304, headers });
    }
    return new Response(req.method === 'HEAD' ? null : body, { status: result.status ?? 200, headers });
  } catch (error) {
    headers.set('content-type', 'application/json; charset=utf-8'); headers.set('cache-control', 'no-store');
    const expected = error instanceof ApiError;
    if (!expected) console.error('api_error', { requestId, error });
    const url = new URL(req.url);
    if (expected && error.status === 404 && !/^\/(?:api(?:\/|$)|data(?:\/|$)|health(?:\/|$))/u.test(url.pathname)) {
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.set('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'");
      return new Response(req.method === 'HEAD' ? null : notFound, { status: 404, headers });
    }
    const body = JSON.stringify({ error: { code: expected ? error.code : 'INTERNAL_ERROR', message: expected ? error.message : 'Unexpected server error.', request_id: requestId } });
    return new Response(req.method === 'HEAD' ? null : body, { status: expected ? error.status : 500, headers });
  }
}
