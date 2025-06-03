import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const handler: Handler = async (event, context) => {
  const { user } = context.clientContext || {};
  if (!user || !user.sub) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Usuário não autenticado.' }) };
  }
  const userId = user.sub;

  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido. Use DELETE.' }), headers: { Allow: 'DELETE' } };
  }
  const entryId = event.queryStringParameters?.id;
  if (!entryId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro id é obrigatório.' }) };
  }

  try {
    const { error, count } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao excluir entrada.', details: error.message }) };
    }
    if (count === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Entrada não encontrada.' }) };
    }
    return { statusCode: 204, body: '' };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }) };
  }
};
