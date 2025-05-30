import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  console.log('[addCultivo] Event received:', { method: event.httpMethod, body: event.body });
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { name, startDate, notes, userId, plants } = JSON.parse(event.body || '{}');
    if (!name || !startDate || !userId || !Array.isArray(plants) || plants.length === 0) {
      console.log('[addCultivo] Missing required fields:', { name, startDate, userId, plants });
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
    const { data: createdPlants, error: plantsError } = await supabase
      .from('plants')
      .insert(plantsToInsert)
      .select();
    console.log('[addCultivo] Plants insert result:', { createdPlants, plantsError });
    if (plantsError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao criar plantas', details: plantsError })
      };
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
