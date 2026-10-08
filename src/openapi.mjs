const integer = (name, maximum, defaultValue) => ({ name, in: 'query', schema: { type: 'integer', minimum: 1, maximum, ...(defaultValue ? { default: defaultValue } : {}) } });
const query = (name, description, schema = { type: 'string' }) => ({ name, in: 'query', description, schema });
const filters = [integer('chapter', 17), query('topic', 'Keyword-derived topic ID.'), query('review', 'Editorial review status.', { type: 'string', enum: ['reviewed', 'unreviewed'] })];
const raw = query('include_raw', 'Include original text for advanced clients.', { type: 'boolean', default: false });
const paging = [integer('page', 1000000, 1), integer('limit', 100, 20), raw];
const id = { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^(?:[1-9]|1[0-7])\\.[1-9]\\d*$', example: '1.6' } };
const json = schema => ({ 'application/json': { schema } });
const error = { description: 'Structured error', content: json({ $ref: '#/components/schemas/Error' }) };
const operation = (summary, parameters = [], schema = { $ref: '#/components/schemas/Envelope' }) => ({
  summary, operationId: summary.replace(/[^a-zA-Z0-9]+/g, '_'), parameters, security: [{}, { ApiKey: [] }],
  responses: { 200: { description: 'Success', content: { ...json(schema), ...(parameters.some(p => p.name === 'format' && p.schema.enum?.includes('text')) ? { 'text/plain': { schema: { type: 'string' } } } : {}) } }, 304: { description: 'ETag unchanged (cacheable responses only).' }, 400: error, 401: error, 404: error, 405: error, 500: error }
});
export const openapi = {
  openapi: '3.1.0',
  info: { title: 'சாணக்கிய நீதி API — Developed by Shyam', version: '1.1.0', description: 'Tamil verses and explanations with line arrays, keyword search, chapter filters and daily selection. Optional API_KEY protects /api/v1 endpoints. Developed by Shyam.' },
  servers: [{ url: '/' }],
  paths: {
    '/health': { get: { ...operation('Health and dataset version'), security: [] } },
    '/api/v1': { get: operation('API metadata') },
    '/api/v1/verses': { get: operation('Search and browse verses', [...filters, query('q', 'Tamil text or English topic keyword, 1–200 characters.', { type: 'string', minLength: 1, maxLength: 200 }), query('match', 'Combine query terms.', { type: 'string', enum: ['all', 'any'], default: 'all' }), ...paging]) },
    '/api/v1/verses/{id}': { get: operation('Get a verse', [id, raw, query('format', 'Response format.', { type: 'string', enum: ['json', 'text'], default: 'json' })]) },
    '/api/v1/verses/{id}/related': { get: operation('Find related verses by shared topics', [id, integer('limit', 20, 5)]) },
    '/api/v1/chapters': { get: operation('List chapters and numbering gaps') },
    '/api/v1/chapters/{chapter}': { get: operation('Browse chapter', [{ name: 'chapter', in: 'path', required: true, schema: { type: 'integer', minimum: 1, maximum: 17 } }, ...paging]) },
    '/api/v1/topics': { get: operation('List topics and record counts') },
    '/api/v1/quality': { get: operation('Dataset quality report') },
    '/api/v1/batch': { get: operation('Batch verse lookup', [{ ...query('ids', '1–50 comma-separated chapter.verse IDs.'), required: true }, raw]) },
    '/api/v1/random': { get: operation('Random unique verses', [...filters, integer('count', 20, 1), raw]) },
    '/api/v1/daily': { get: operation('Daily verse in Indian timezone', [...filters, query('date', 'Optional valid calendar date; defaults to today in Asia/Kolkata.', { type: 'string', format: 'date' }), raw, query('format', 'Response format.', { type: 'string', enum: ['json', 'text'], default: 'json' })]) },
    '/api/v1/export': { get: { ...operation('Export filtered dataset', [...filters, query('format', 'Download format.', { type: 'string', enum: ['json', 'ndjson'], default: 'json' }), raw]), responses: { 200: { description: 'Download. JSON is {dataset_version, records}; NDJSON is one verse per line.', content: { 'application/json': { schema: { type: 'object', required: ['dataset_version', 'records'], properties: { dataset_version: { type: 'string' }, records: { type: 'array', items: { $ref: '#/components/schemas/Verse' } } } } }, 'application/x-ndjson': { schema: { type: 'string' } } } }, 400: error, 401: error } } },
    '/api/v1/openapi.json': { get: { ...operation('OpenAPI document', [], { type: 'object' }), security: [] } }
  },
  components: {
    securitySchemes: { ApiKey: { type: 'apiKey', in: 'header', name: 'x-api-key', description: 'Only required when the server has API_KEY configured.' } },
    schemas: {
      Envelope: { type: 'object', required: ['data', 'meta'], properties: { data: {}, meta: { type: 'object', required: ['api_version', 'dataset_version', 'developed_by'], properties: { api_version: { type: 'string' }, dataset_version: { type: 'string' }, developed_by: { const: 'Shyam' } } } } },
      Verse: { type: 'object', required: ['id', 'chapter', 'verse', 'text', 'topics'], properties: { id: { type: 'string' }, chapter: { type: 'integer' }, verse: { type: 'integer' }, text: { type: 'object', required: ['transliteration_ta', 'lines_ta', 'meaning_ta'], properties: { transliteration_ta: { type: 'string', description: 'Single-line transliteration with no newline escapes.' }, lines_ta: { type: 'array', minItems: 1, items: { type: 'string' }, description: 'Ordered lines for verse display.' }, meaning_ta: { type: 'string' } } }, topics: { type: 'array', items: { type: 'string' } }, raw_text: { type: 'string' } } },
      Error: { type: 'object', required: ['error'], properties: { error: { type: 'object', required: ['code', 'message', 'request_id'], properties: { code: { type: 'string' }, message: { type: 'string' }, request_id: { type: 'string' } } } } }
    }
  }
};
