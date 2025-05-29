// Certifique-se de instalar @netlify/functions localmente para desenvolvimento TS
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseKey) {
    console.error('[addPlant] Supabase URL or Key is missing from environment variables.');
    throw new Error('Supabase URL or Key is missing.');
  }
  return createClient(supabaseUrl, supabaseKey);
};

// Função utilitária para converter camelCase para snake_case
function camelToSnake(obj: any) {
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = obj[key];
    }
  }
  return newObj;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log('[addPlant] Function invoked.');
  console.log('[addPlant] SUPABASE_URL available:', !!process.env.SUPABASE_URL);
  console.log('[addPlant] SUPABASE_SERVICE_ROLE_KEY available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('[addPlant] context.clientContext:', JSON.stringify(context.clientContext, null, 2));

  let supabase: SupabaseClient;
  try {
    supabase = getSupabaseClient();
    console.log('[addPlant] Supabase client initialized successfully.');
  } catch (error: any) {
    console.error('[addPlant] Error initializing Supabase client:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to initialize Supabase client.', 
        details: error.message 
      }),
    };
  }

  const { user } = context.clientContext || {};

  if (!user || !user.sub) {
    console.warn('[addPlant] Authentication check failed: User or user.sub is missing.');
    return {
      statusCode: 401, // Correctly send 401 for auth issues
      body: JSON.stringify({ error: 'Usuário não autenticado.' }),
    };
  }
  console.log('[addPlant] User authenticated:', user.sub);

  const userId = user.sub;

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido. Use POST.' }),
      headers: { Allow: 'POST' },
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Corpo da requisição ausente.' }),
    };
  }

  try {
    const plantData = JSON.parse(event.body);
    console.log('[addPlant] Received plantData:', plantData);

    // Converte todas as chaves camelCase para snake_case
    const plantToInsert = {
      ...camelToSnake(plantData),
      user_id: userId,
    };
    console.log('[addPlant] plantToInsert (snake_case):', plantToInsert);

    // Remove o campo 'id' se ele vier do cliente, pois o Supabase gera automaticamente
    delete plantToInsert.id;

    // 1. Inserir planta sem qr_code_value
    console.log('[addPlant] Attempting to insert plant:', plantToInsert);
    const { data: insertedPlant, error: insertError } = await supabase
      .from('plants')
      .insert([plantToInsert])
      .select()
      .single();

    if (insertError) {
      console.error('[addPlant] Erro ao inserir planta no Supabase:', insertError);
      console.error('[addPlant] Details - Received Data:', plantData);
      console.error('[addPlant] Details - Data to Insert:', plantToInsert);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Erro ao adicionar planta.', 
          details: insertError.message, 
          supabaseError: insertError, 
          receivedPlantData: plantData, 
          plantToInsert: plantToInsert
        }),
      };
    }

    console.log('[addPlant] Plant inserted successfully. ID:', insertedPlant.id);
    console.log('[addPlant] Full insertedPlant object:', JSON.stringify(insertedPlant, null, 2));

    // 2. Atualizar qr_code_value com o id gerado
    console.log(`[addPlant] Attempting to update qr_code_value for plant ID ${insertedPlant.id} with value ${insertedPlant.id}`);
    const { data: updatedPlant, error: updateError } = await supabase
      .from('plants')
      .update({ qr_code_value: insertedPlant.id })
      .eq('id', insertedPlant.id)
      .select()
      .single();

    if (updateError) {
      console.error('[addPlant] Erro ao atualizar qr_code_value no Supabase:', updateError);
      console.error(`[addPlant] Details - Plant ID: ${insertedPlant.id}, Value for qr_code_value: ${insertedPlant.id}`);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Erro ao atualizar qr_code_value.',
          details: updateError.message,
          supabaseError: updateError,
          insertedPlant: insertedPlant
        }),
      };
    }

    console.log('[addPlant] qr_code_value updated successfully.');
    console.log('[addPlant] Full updatedPlant object after qr_code_value update:', JSON.stringify(updatedPlant, null, 2));

    return {
      statusCode: 201, // 201 Created
      body: JSON.stringify(updatedPlant),
    };
  } catch (e: any) {
    console.error('[addPlant] Erro ao processar requisição em addPlant:', e);
    if (e instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'JSON inválido no corpo da requisição.', details: e?.message || String(e), requestBody: event.body }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e?.message || String(e) }),
    };
  }
};
