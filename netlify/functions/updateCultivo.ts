import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { debugLog } from './utils';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseClient = (): SupabaseClient => {
  return createClient(supabaseUrl, supabaseKey);
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const supabase = getSupabaseClient();
  const { user } = context.clientContext || {};

  if (!user || !user.sub) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Usuário não autenticado.' }),
    };
  }
  const userId = user.sub;

  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido. Use PUT.' }),
      headers: { Allow: 'PUT' },
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Corpo da requisição ausente.' }),
    };
  }

  let cultivoId: string;
  let updateData: any;

  try {
    const requestBody = JSON.parse(event.body);
    debugLog('[updateCultivo] Received request:', requestBody);
    
    cultivoId = requestBody.id;
    updateData = { ...requestBody };
    delete updateData.id; // Remove id from update data
    delete updateData.plants; // Remove plants array as it's not a column in the cultivos table

    if (!cultivoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'ID do cultivo ausente no corpo da requisição.'
        }),
      };
    }

    debugLog('[updateCultivo] Mapped update data:', updateData);

    // Se não houver campos para atualizar, mas plants foi enviado, apenas atualizamos o timestamp
    // Isso permite que o frontend atualize apenas as plantas associadas sem precisar modificar o cultivo
    if (Object.keys(updateData).length === 0 && requestBody.plants) {
      debugLog('[updateCultivo] Only plants were sent, adding updated_at timestamp');
      updateData.updated_at = new Date().toISOString();
    } else if (Object.keys(updateData).length === 0) {
      console.warn('[updateCultivo] No valid fields to update');
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Nenhum dado válido para atualizar.',
          receivedData: requestBody,
        }),
      };
    }

    debugLog('[updateCultivo] Final updateData to send to Supabase:', updateData);

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    debugLog(`[updateCultivo] Updating cultivo ${cultivoId} for user ${userId}`);
    
    const { data: updatedCultivo, error } = await supabase
      .from('cultivos')
      .update(updateData)
      .eq('id', cultivoId)
      .eq('user_id', userId)
      .select('*')
      .single();
      
    debugLog('[updateCultivo] Update result:', { updatedCultivo, error });

    if (error) {
      console.error('Erro ao atualizar cultivo no Supabase:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao atualizar cultivo.', details: error.message, supabaseError: error }),
      };
    }
    
    if (!updatedCultivo) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Cultivo não encontrado ou não pertence ao usuário para atualização.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(updatedCultivo),
    };
  } catch (e: any) {
    console.error('Erro ao processar requisição em updateCultivo:', e);
    if (e instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'JSON inválido no corpo da requisição.', details: e.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }),
    };
  }
};
