import assert from 'node:assert';
import test from 'node:test';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { transformSync } from 'esbuild';

const tsSource = readFileSync(new URL('./deleteDiaryEntry.ts', import.meta.url), 'utf8');
const { code } = transformSync(tsSource, { loader: 'ts', format: 'esm' });
const outfile = join(process.cwd(), 'deleteDiaryEntry.compiled.mjs');
writeFileSync(outfile, code);
process.env.SUPABASE_URL = 'http://localhost';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'key';
const { createHandler } = await import('file://' + outfile);

test('returns 404 when diary entry does not exist', async () => {
  const fakeSupabase = {
    from() {
      return {
        delete() {
          return {
            eq() {
              return {
                eq() {
                  return Promise.resolve({ error: null, count: 0 });
                }
              };
            }
          };
        }
      };
    }
  };

  const handler = createHandler(fakeSupabase);
  const event = { httpMethod: 'DELETE', queryStringParameters: { id: 'missing' } };
  const context = { clientContext: { user: { sub: 'user1' } } };
  const res = await handler(event, context);

  assert.strictEqual(res.statusCode, 404);
  assert.deepStrictEqual(JSON.parse(res.body), { error: 'Entrada não encontrada.' });
});
