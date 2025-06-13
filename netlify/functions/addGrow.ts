import { Handler } from '@netlify/functions';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { debugLog } from './utils';
import { successResponse } from './_utils/responseHelpers';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseKey) {
    console.error('[addGrow] Supabase URL or Key is missing from environment variables.');
    throw new Error('Supabase URL or Key is missing.');
  }
  return createClient(supabaseUrl, supabaseKey);
};

export function createHandler(client: SupabaseClient): Handler {
  return async (event, context) => {
    debugLog('[addGrow] Event received:', { method: event.httpMethod, body: event.body });
    debugLog('[addGrow] SUPABASE_URL available:', !!process.env.SUPABASE_URL);
    debugLog('[addGrow] SUPABASE_SERVICE_ROLE_KEY available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { user } = context.clientContext || {};
    if (!user || !user.sub) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Usuário não autenticado.' }) };
    }
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido. Use POST.' }), headers: { Allow: 'POST' } };
    }
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Corpo da requisição ausente.' }) };
    }
    try {
      const { name, location, capacity } = JSON.parse(event.body);
      if (!name) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Nome obrigatório.' }) };
      }
      const qrCodeValue = `GROW-${uuidv4()}`;
      const { data, error } = await client
        .from('grows')
        .insert([{ name, location, capacity, qr_code_value: qrCodeValue, user_id: user.sub }])
        .select()
        .single();
      debugLog('[addGrow] Insert result:', { data, error });
      if (error || !data) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao criar grow', details: error }) };
      }
      return successResponse(data, 201);
    } catch (e: any) {
      console.error('[addGrow] Unexpected error:', e);
      if (e instanceof SyntaxError) {
        return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido.', details: e.message }) };
      }
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado', details: e.message }) };
    }
  };
}

export const handler: Handler = ((): Handler => {
  try {
    const client = getSupabaseClient();
    return createHandler(client);
  } catch (error: any) {
    return async () => ({
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to initialize Supabase client.', details: error.message }),
    });
  }
})();
