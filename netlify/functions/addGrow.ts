import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { debugLog } from './utils';
import { successResponse } from './_utils/responseHelpers';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const handler: Handler = async (event, context) => {
  debugLog('[addGrow] Event received:', { method: event.httpMethod, body: event.body });
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
    const { data, error } = await supabase
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
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado', details: e.message }) };
  }
};
