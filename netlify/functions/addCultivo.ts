import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log('[addCultivo] Event received:', { method: event.httpMethod, body: event.body });
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { name, startDate, notes, plants } = JSON.parse(event.body || '{}');
    const { user } = context.clientContext || {};
    if (!user || !user.sub) {
      console.log('[addCultivo] Authentication failed:', { user });
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Usuário não autenticado.' })
      };
    }
    const userId = user.sub;
    if (!name || !startDate) {
      console.log('[addCultivo] Missing required fields:', { name, startDate });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields.' })
      };
    }

    // 1. Criar o cultivo
    const { data: cultivo, error: cultivoError } = await supabase
      .from('cultivos')
      .insert([{ name, start_date: startDate, notes, user_id: userId }])
      .select()
      .single();
    console.log('[addCultivo] Cultivo insert result:', { cultivo, cultivoError });
    if (cultivoError || !cultivo) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao criar cultivo', details: cultivoError })
      };
    }

    let createdPlants = [];
    if (Array.isArray(plants) && plants.length > 0) {
      // 2. Criar as plantas associadas
      // Corrige automaticamente o campo 'nome' para 'name' se vier do frontend
      // Converte campos camelCase para snake_case para compatibilidade com o banco
      const plantsToInsert = plants.map((plant: any) => {
        const { nome, birthDate, currentStage, healthStatus, operationalStatus, ...rest } = plant;
        return {
          ...rest,
          name: plant.name || nome, // Usa 'name' se existir, senão usa 'nome'
          birth_date: birthDate,
          current_stage: currentStage,
          health_status: healthStatus,
          operational_status: operationalStatus,
          cultivo_id: cultivo.id,
          user_id: userId,
        };
      });
      console.log('[addCultivo] Plants to insert:', plantsToInsert);
      const { data: plantsResult, error: plantsError } = await supabase
        .from('plants')
        .insert(plantsToInsert)
        .select();
      console.log('[addCultivo] Plants insert result:', { plantsResult, plantsError });
      if (plantsError) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Erro ao criar plantas', details: plantsError })
        };
      }
      createdPlants = plantsResult || [];
    }

    console.log('[addCultivo] Success:', { cultivo, createdPlants });
    return {
      statusCode: 200,
      body: JSON.stringify({ cultivo, plants: createdPlants })
    };
  } catch (error) {
    console.error('[addCultivo] Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro inesperado', details: error })
    };
  }
};
