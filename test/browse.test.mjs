import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { handleRequest, verses } from '../src/app.mjs';
const request = (path, options) => handleRequest(new Request(`http://localhost${path}`,options));
test('all 319 reader pages show their verse and correct previous/next links', async () => {
  for (let i = 0; i < verses.length; i++) {
    const v = verses[i];const response = await request(`/read/${v.id}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    const section = html.split('<!--BROWSE-START-->')[1].split('<!--BROWSE-END-->')[0];
    assert.ok(section.includes(`CHAPTER ${v.chapter} · VERSE ${v.verse}`),v.id);
    assert.ok(section.includes(`${i+1} of 319`),v.id);
    assert.ok(section.includes('IN PLAIN ENGLISH'));
    const previous = section.match(/href="([^"]+)" rel="prev"/);
    const next = section.match(/href="([^"]+)" rel="next"/);
    assert.equal(previous?.[1],i>0?`/read/${verses[i-1].id}#browse`:undefined,v.id);
    assert.equal(next?.[1],i<verses.length-1?`/read/${verses[i+1].id}#browse`:undefined,v.id);
    for (const field of ['source.pages','edition_id','quality.status']) assert.ok(!section.includes(field));
  }
});
test('homepage provides a working first verse even when served as a static file',async()=>{
  const staticHtml = readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  for(const html of [staticHtml,await (await request('/')).text()]) {
    assert.ok(html.includes('id="chapter-picker"'));
    assert.ok(html.includes('id="verse-picker"'));
    assert.ok(html.includes('href="/read/1.2#browse" rel="next"'));
    assert.ok(html.includes('CHAPTER 1 · VERSE 1'));
    assert.ok(html.includes('Read verses one by one'));
  }
});
test('chapter and verse selectors navigate without requiring URL editing',()=>{
  const handlers = new Map();const assigned=[];let scrolled=false;
  runInNewContext(readFileSync(new URL('../public/browse.js',import.meta.url),'utf8'),{
    document:{getElementById:id=>({addEventListener:(event,fn)=>handlers.set(id,fn),scrollIntoView:()=>{scrolled=true;}})},
    location:{pathname:'/read/10.15',hash:'',assign:value=>assigned.push(value)}
  });
  handlers.get('chapter-picker')({target:{value:'/read/2.1#browse'}});
  handlers.get('verse-picker')({target:{value:'/read/2.3#browse'}});
  assert.deepEqual(assigned,['/read/2.1#browse','/read/2.3#browse']);assert.ok(scrolled);
});
test('missing pages and unavailable reader verses show an illustrated HTML 404',async()=>{
  for(const path of ['/missing-page','/read/13.4','/read/18.1','/404.html']) {
    const response=await request(path);assert.equal(response.status,404);
    assert.ok(response.headers.get('content-type').includes('text/html'));
    assert.equal(response.headers.get('cache-control'),'no-store');
    const body=await response.text();assert.ok(body.includes('/not-found.png'));assert.ok(body.includes('Go back home'));assert.ok(body.includes('/read/1.1#browse'));
    const head=await request(path,{method:'HEAD'});assert.equal(head.status,404);assert.equal(await head.text(),'');
  }
  for(const path of ['/api/v1/missing','/api/v1/verses/13.4','/data/missing']) {
    const response=await request(path);assert.equal(response.status,404);assert.ok(response.headers.get('content-type').includes('application/json'));assert.ok((await response.json()).error);
  }
});
test('404 illustration and reader scripts are bundled and served',async()=>{
  for(const path of ['/browse.js','/not-found.js','/not-found.png'])assert.equal((await request(path)).status,200);
  const response=await request('/not-found.png');assert.equal(response.headers.get('content-type'),'image/png');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),readFileSync(new URL('../public/not-found.png',import.meta.url)));
});
test('responsive images are served by the function with WebP types and caching',async()=>{
  for(const name of ['chanakya-modern-480','chanakya-modern-800','not-found-640','not-found-1200']) {
    const response=await request(`/${name}.webp`);
    assert.equal(response.status,200);
    assert.equal(response.headers.get('content-type'),'image/webp');
    assert.ok(response.headers.get('cache-control').includes('max-age=86400'));
    const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.subarray(8,12).toString(),'WEBP');
    assert.deepEqual(bytes,readFileSync(new URL(`../public/${name}.webp`,import.meta.url)));
  }
});
