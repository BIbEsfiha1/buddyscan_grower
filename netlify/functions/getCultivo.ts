import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { successResponse } from './_utils/responseHelpers';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { user } = context.clientContext || {};
  if (!user || !user.sub) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Usuário não autenticado.' }),
    };
  }
  const userId = user.sub;

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido. Use GET.' }),
      headers: { Allow: 'GET' },
    };
  }

  const id = event.queryStringParameters?.id;
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'ID do cultivo não fornecido.' }),
    };
  }

  try {
    const { data, error } = await supabase
      .from('cultivos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao buscar cultivo', details: error }),
      };
    }
    return successResponse(data);
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro inesperado', details: e.message }),
    };
  }
};
