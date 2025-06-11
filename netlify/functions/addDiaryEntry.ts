import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { successResponse } from './_utils/responseHelpers';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function camelToSnake(obj: any) {
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
      newObj[snakeKey] = obj[key];
    }
  }
  return newObj;
}

export const handler: Handler = async (event, context) => {
  const { user } = context.clientContext || {};
  if (!user || !user.sub) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Usuário não autenticado.' }) };
  }
  const userId = user.sub;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido. Use POST.' }), headers: { Allow: 'POST' } };
  }
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corpo da requisição ausente.' }) };
  }

  try {
    const body = JSON.parse(event.body);
    if (!body.plantId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'plantId é obrigatório.' }) };
    }
    const entry = camelToSnake(body);
    entry.user_id = userId;
    delete entry.id;

    const { data, error } = await supabase
      .from('diary_entries')
      .insert([entry])
      .select('*')
      .single();
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao adicionar entrada.', details: error.message }) };
    }
    return successResponse(data, 201);
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }) };
  }
};
