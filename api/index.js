import { handleRequest } from '../src/app.mjs';

// Vercel's explicit Function entrypoint. The shared handler uses the incoming
// URL, so homepage, documentation and API routes share the same behavior.
export default { fetch: handleRequest };
