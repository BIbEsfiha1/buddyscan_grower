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

  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido. Use PUT.' }), headers: { Allow: 'PUT' } };
  }
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corpo da requisição ausente.' }) };
  }

  try {
    const body = JSON.parse(event.body);
    if (!body.id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'ID da entrada é obrigatório.' }) };
    }
    const entryId = body.id;
    const updateData = camelToSnake(body);
    delete updateData.id;
    delete updateData.user_id;

    const { data, error } = await supabase
      .from('diary_entries')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select('*')
      .single();
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao atualizar entrada.', details: error.message }) };
    }
    if (!data) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Entrada não encontrada.' }) };
    }
    return successResponse(data);
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }) };
  }
};
