import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { successResponse } from './_utils/responseHelpers';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const handler: Handler = async (event, context) => {
  const { user } = context.clientContext || {};
  if (!user || !user.sub) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Usuário não autenticado.' }) };
  }
  const userId = user.sub;
  const plantId = event.queryStringParameters?.plantId;
  if (!plantId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro plantId é obrigatório.' }) };
  }
  const limitParam = event.queryStringParameters?.limit;
  const offsetParam = event.queryStringParameters?.offset;
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

  try {
    let query = supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('plant_id', plantId)
      .order('timestamp', { ascending: false });

    if (typeof limit === 'number' && typeof offset === 'number') {
      query = query.range(offset, offset + limit - 1);
    } else if (typeof limit === 'number') {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao buscar entradas.', details: error.message }) };
    }
    return successResponse(data || []);
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }) };
  }
};
