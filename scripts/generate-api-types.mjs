import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const source = process.env.DAYSPRING_OPENAPI_URL || 'http://127.0.0.1:5310/swagger/v1/swagger.json';
const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`OpenAPI generation failed (${response.status}). Start the development API with Swagger enabled.`);
const document = await response.json();
if (!document.openapi || !document.components?.schemas) throw new Error('Expected an OpenAPI document with component schemas.');
function type(schema = {}) {
    let value;
    if (schema.$ref) value = `ApiSchemas[${JSON.stringify(schema.$ref.split('/').pop())}]`;
    else if (schema.enum) value = schema.enum.map((item) => JSON.stringify(item)).join(' | ') || 'never';
    else if (schema.oneOf || schema.anyOf) value = (schema.oneOf || schema.anyOf).map(type).join(' | ');
    else if (schema.allOf) value = schema.allOf.map(type).join(' & ');
    else if (schema.type === 'array') value = `Array<${type(schema.items)}>`;
    else if (schema.type === 'object' || schema.properties) {
        const properties = Object.entries(schema.properties || {}).map(([key, child]) => `${JSON.stringify(key)}${schema.required?.includes(key) ? '' : '?'}: ${type(child)};`);
        if (schema.additionalProperties) properties.push(`[key: string]: ${schema.additionalProperties === true ? 'unknown' : type(schema.additionalProperties)};`);
        value = `{ ${properties.join(' ')} }`;
    } else value = { string: 'string', integer: 'number', number: 'number', boolean: 'boolean' }[schema.type] || 'unknown';
    return schema.nullable ? `(${value}) | null` : value;
}
const schemas = Object.entries(document.components.schemas).sort(([a], [b]) => a.localeCompare(b)).map(([key, schema]) => `  ${JSON.stringify(key)}: ${type(schema)};`);
const operations = [];
for (const [path, methods] of Object.entries(document.paths || {})) for (const [method, operation] of Object.entries(methods)) {
    if (!['get', 'post', 'put', 'patch', 'delete', 'head'].includes(method)) continue;
    const body = operation.requestBody?.content?.['application/json']?.schema || operation.requestBody?.content?.['multipart/form-data']?.schema;
    const success = Object.entries(operation.responses || {}).find(([status]) => /^2\d\d$/.test(status))?.[1];
    const output = success?.content?.['application/json']?.schema;
    operations.push(`  ${JSON.stringify(`${method.toUpperCase()} ${path}`)}: { request: ${body ? type(body) : 'undefined'}; response: ${output ? type(output) : 'unknown'} };`);
}
const fingerprint = createHash('sha256').update(JSON.stringify(document)).digest('hex');
await writeFile(new URL('../lib/api-contracts.d.ts', import.meta.url), `// Generated from the backend OpenAPI specification. Run npm run generate:api; do not edit.\n// SHA-256: ${fingerprint}\nexport interface ApiSchemas {\n${schemas.join('\n')}\n}\nexport interface ApiOperations {\n${operations.sort().join('\n')}\n}\n`, 'utf8');
console.log(`Generated ${schemas.length} API schemas and ${operations.length} operation contracts.`);
