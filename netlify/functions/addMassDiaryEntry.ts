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
    if (!body.cultivoId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'cultivoId é obrigatório.' }) };
    }
    const entryData = camelToSnake(body.entry || {});
    entryData.user_id = userId;
    delete entryData.id;

    const { data: plants, error: plantError } = await supabase
      .from('plants')
      .select('id')
      .eq('cultivo_id', body.cultivoId)
      .eq('user_id', userId);

    if (plantError) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao buscar plantas', details: plantError.message }) };
    }

    if (!plants || plants.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Nenhuma planta encontrada para o cultivo' }) };
    }

    const entries = plants.map(p => ({ ...entryData, plant_id: p.id }));

    const { error } = await supabase.from('diary_entries').insert(entries);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao adicionar entradas.', details: error.message }) };
    }
    return successResponse({ count: entries.length }, 201);
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }) };
  }
};
