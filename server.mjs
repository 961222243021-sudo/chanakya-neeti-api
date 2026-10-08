import { createServer } from 'node:http';
import { handleRequest } from './src/app.mjs';

const server = createServer(async (req, res) => {
  try {
    // Never trust Host to construct URLs or forwarded IPs for security decisions.
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(',') : value);
    }
    const response = await handleRequest(new Request(new URL(req.url ?? '/', 'http://localhost'), { method: req.method, headers }));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('http_adapter_error', error);
    res.writeHead(500, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error.' } }));
  }
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(Number(process.env.PORT ?? 3000));
export default server;
