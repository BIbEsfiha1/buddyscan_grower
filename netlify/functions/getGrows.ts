import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { successResponse } from './_utils/responseHelpers';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const handler: Handler = async (event, context) => {
  const { user } = context.clientContext || {};
  if (!user || !user.sub) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Usuário não autenticado.' }) };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido. Use GET.' }), headers: { Allow: 'GET' } };
  }
  try {
    const { data, error } = await supabase
      .from('grows')
      .select('*')
      .eq('user_id', user.sub)
      .order('created_at', { ascending: false });
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao buscar grows', details: error }) };
    }
    return successResponse(data);
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado', details: e.message }) };
  }
};
