import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseClient = (): SupabaseClient => {
  return createClient(supabaseUrl, supabaseKey);
};

export const handler: Handler = async (event: HandlerEvent, context) => {
  const supabase = getSupabaseClient();
  const { user } = context.clientContext || {};

  if (!user || !user.sub) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Usuário não autenticado.' }),
    };
  }
  const userId = user.sub;

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido. Use DELETE.' }),
      headers: { Allow: 'DELETE' },
    };
  }

  const plantIdToDelete = event.queryStringParameters?.id;

  if (!plantIdToDelete) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'ID da planta ausente nos parâmetros da query (ex: ?id=seu-id).' }),
    };
  }

  try {
    const { error, count } = await supabase
      .from('plants')
      .delete()
      .eq('id', plantIdToDelete)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao deletar planta no Supabase:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao deletar planta.', details: error.message }),
      };
    }

    if (count === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Planta não encontrada ou não pertence ao usuário.' }),
      };
    }

    return {
      statusCode: 204,
      body: '',
    };
  } catch (e: any) {
    console.error('Erro inesperado na função deletePlant:', e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }),
    };
  }
};
