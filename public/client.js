const form = document.querySelector('#request-form');
const endpoint = document.querySelector('#endpoint');
const result = document.querySelector('#result');
const status = document.querySelector('#status');
const run = document.querySelector('#run');
const fullEndpoint = document.querySelector('#full-endpoint');
fullEndpoint.value = new URL('/api/v1/verses/1.6', location.origin).href;
document.querySelector('#copy-endpoint').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(fullEndpoint.value); status.textContent = 'Full endpoint copied.'; }
  catch { fullEndpoint.focus(); fullEndpoint.select(); status.textContent = 'Select and copy the full endpoint above.'; }
});
document.querySelector('#preset').addEventListener('change', event => { endpoint.value = event.target.value; });
form.addEventListener('submit', async event => {
  event.preventDefault(); run.disabled = true; status.textContent = 'Loading…';
  try {
    const path = endpoint.value.trim();
    if (!path.startsWith('/api/v1') || path.startsWith('//')) throw new Error('Enter a relative /api/v1 endpoint.');
    const url = new URL(path, location.origin);
    if (url.origin !== location.origin) throw new Error('Use this API’s origin.');
    const key = document.querySelector('#api-key').value;
    const start = performance.now();
    const response = await fetch(url, { headers: key ? { 'x-api-key': key } : {}, signal: AbortSignal.timeout(15000) });
    const text = await response.text();
    try { result.textContent = JSON.stringify(JSON.parse(text), null, 2); } catch { result.textContent = text; }
    status.textContent = `HTTP ${response.status} · ${Math.round(performance.now() - start)} ms`;
  } catch (error) { status.textContent = error.message; }
  finally { run.disabled = false; }
});
document.querySelector('#copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(result.textContent); status.textContent = 'Response copied.'; }
  catch { status.textContent = 'Select the response text to copy it.'; }
});
async function loadReference() {
  try {
    const response = await fetch('/openapi.json'); const spec = await response.json();
    for (const [path, methods] of Object.entries(spec.paths)) {
      const tr = document.createElement('tr');
      const pathCell = document.createElement('td');pathCell.textContent = path;
      const description = document.createElement('td');description.textContent = methods.get.summary;
      tr.append(pathCell, description);document.querySelector('#routes').append(tr);
    }
  } catch { status.textContent = 'Reference could not load. Open /openapi.json directly.'; }
}
loadReference();
