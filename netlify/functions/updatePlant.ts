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

  let plantIdToUpdate;
  let plantData;

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Corpo da requisição ausente.' }),
      };
    }

    plantData = JSON.parse(event.body);
    debugLog('[updatePlant] Received request:', plantData);
    
    plantIdToUpdate = plantData.id;

    if (!plantIdToUpdate) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'ID da planta ausente no corpo da requisição.',
          receivedData: plantData 
        }),
      };
    }

    // Create update data object with only the fields that were provided
    const updateData: Record<string, any> = {};
    const fieldMappings: Record<string, string> = {
      // camelCase to snake_case mappings
      name: 'name',
      strain: 'strain',
      birthDate: 'birth_date',
      currentStage: 'current_stage',
      healthStatus: 'health_status',
      operationalStatus: 'operational_status',
      cultivationType: 'cultivation_type',
      substrate: 'substrate',
      estimatedHarvestDate: 'estimated_harvest_date',
      growRoomId: 'grow_room_id',
      heightCm: 'height_cm',
      latestEc: 'latest_ec',
      latestPh: 'latest_ph',
      imageUrl: 'image_url',
      notes: 'notes',
      genetics: 'genetics',
      medium: 'medium',
      lastDailyCheckDate: 'last_daily_check_date',
      dailyWatered: 'daily_watered',
      dailyNutrients: 'daily_nutrients',
      dailyPestCheck: 'daily_pest_check',
      dailyLightAdjustment: 'daily_light_adjustment',
      dailyRotation: 'daily_rotation',
      cultivoId: 'cultivo_id' // Add this line to handle cultivoId updates
    };

    // Map camelCase fields from request to snake_case for database
    Object.entries(plantData).forEach(([key, value]) => {
      if (key === 'id') return; // Skip the id field as it's used in the where clause
      const dbField = fieldMappings[key] || key;
      // Aceita qualquer valor, exceto undefined
      if (typeof value !== 'undefined') {
        updateData[dbField] = value;
      }
    });

    debugLog('[updatePlant] Mapped update data:', updateData);

    debugLog('[updatePlant] Data to be sent to Supabase:', updateData);

    if (Object.keys(updateData).length === 0) {
      console.warn('[updatePlant] No valid fields to update');
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Nenhum dado válido para atualizar.',
          receivedData: plantData,
          mappedData: updateData
        }),
      };
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    debugLog(`[updatePlant] Updating plant ${plantIdToUpdate} for user ${userId}`);
    
    const { data: updatedPlant, error } = await supabase
      .from('plants')
      .update(updateData)
      .eq('id', plantIdToUpdate)
      .eq('user_id', userId)
      .select('*')
      .single();
      
    debugLog('[updatePlant] Update result:', { updatedPlant, error });

    if (error) {
      console.error('Erro ao atualizar planta no Supabase:', error);
      if (error.code === 'PGRST116') {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Planta não encontrada ou não pertence ao usuário.' }),
        };
      }
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao atualizar planta.', details: error.message }),
      };
    }
    
    if (!updatedPlant) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Planta não encontrada ou não pertence ao usuário para atualização.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(updatedPlant),
    };
  } catch (e: any) {
    console.error('Erro ao processar requisição em updatePlant:', e);
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
