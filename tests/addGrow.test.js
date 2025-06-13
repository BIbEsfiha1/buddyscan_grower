import assert from 'node:assert';
import test from 'node:test';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { transformSync } from 'esbuild';

const outfile = join(process.cwd(), 'addGrow.compiled.mjs');
const utilOut = join(process.cwd(), 'utils.compiled.mjs');
const respOut = join(process.cwd(), 'responseHelpers.compiled.mjs');
const growSource = readFileSync(new URL('../netlify/functions/addGrow.ts', import.meta.url), 'utf8');
const utilSource = readFileSync(new URL('../netlify/functions/utils.ts', import.meta.url), 'utf8');
const respSource = readFileSync(new URL('../netlify/functions/_utils/responseHelpers.ts', import.meta.url), 'utf8');
let compiledGrow = transformSync(growSource, { loader: 'ts', format: 'esm' }).code;
compiledGrow = compiledGrow.replace("./utils", "./utils.compiled.mjs");
compiledGrow = compiledGrow.replace("./_utils/responseHelpers", "./responseHelpers.compiled.mjs");
writeFileSync(outfile, compiledGrow);
writeFileSync(utilOut, transformSync(utilSource, { loader: 'ts', format: 'esm' }).code);
writeFileSync(respOut, transformSync(respSource, { loader: 'ts', format: 'esm' }).code);
process.env.SUPABASE_URL = 'http://localhost';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'key';
const { createHandler } = await import('file://' + outfile);

test('retorna 201 quando o grow é criado com sucesso', async () => {
  const fakeSupabase = {
    from() {
      return {
        insert() {
          return {
            select() {
              return {
                single() {
                  return Promise.resolve({ data: { id: '1', name: 'Grow' }, error: null });
                }
              };
            }
          };
        }
      };
    }
  };

  const handler = createHandler(fakeSupabase);
  const event = { httpMethod: 'POST', body: JSON.stringify({ name: 'Grow' }) };
  const context = { clientContext: { user: { sub: 'user1' } } };
  const res = await handler(event, context);

  assert.strictEqual(res.statusCode, 201);
  const body = JSON.parse(res.body);
  assert.strictEqual(body.name, 'Grow');
});

test('retorna 500 quando o Supabase falha', async () => {
  const fakeSupabase = {
    from() {
      return {
        insert() {
          return {
            select() {
              return {
                single() {
                  return Promise.resolve({ data: null, error: { message: 'fail' } });
                }
              };
            }
          };
        }
      };
    }
  };

  const handler = createHandler(fakeSupabase);
  const event = { httpMethod: 'POST', body: JSON.stringify({ name: 'Grow' }) };
  const context = { clientContext: { user: { sub: 'user1' } } };
  const res = await handler(event, context);

  assert.strictEqual(res.statusCode, 500);
  const body = JSON.parse(res.body);
  assert.strictEqual(body.error, 'Erro ao criar grow');
});
