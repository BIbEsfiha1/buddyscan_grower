import { Handler } from '@netlify/functions';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { successResponse } from './_utils/responseHelpers';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseClient = (): SupabaseClient => {
  return createClient(supabaseUrl, supabaseKey);
};

export const handler: Handler = async (event, context) => {
  const supabase = getSupabaseClient();
  const { user } = context.clientContext || {};
  if (!user || !user.sub) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Usuário não autenticado.' }),
    };
  }
  const userId = user.sub;
  try {
    // Suporte a filtro por cultivoId
    const url = new URL(event.rawUrl || 'http://localhost');
    const cultivoId = url.searchParams.get('cultivoId');
    let query = supabase
      .from('plants')
      .select('*')
      .eq('user_id', userId);
    if (cultivoId) {
      query = query.eq('cultivo_id', cultivoId);
    }
    const { data: plants, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao buscar plantas no Supabase:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao buscar plantas.', details: error.message }),
      };
    }
    return successResponse(plants || []);
  } catch (e: any) {
    console.error('Erro inesperado na função getPlants:', e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }),
    };
  }
};
