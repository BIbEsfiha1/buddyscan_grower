import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

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

  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('plant_id', plantId)
      .order('timestamp', { ascending: false });
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao buscar entradas.', details: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify(data || []) };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }) };
  }
};
