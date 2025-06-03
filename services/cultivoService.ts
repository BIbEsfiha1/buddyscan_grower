import { Cultivo, Plant } from '../types';
import { convertKeysToCamelCase } from './plantService';
import netlifyIdentity from 'netlify-identity-widget';

const API_BASE_URL = '/.netlify/functions';

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const user = netlifyIdentity.currentUser();
    if (!user) {
      netlifyIdentity.open('login');
      throw new Error('Usuário não autenticado. Por favor, faça login.');
    }

    const token = user.token?.access_token;
    if (!token) {
      netlifyIdentity.logout();
      netlifyIdentity.open('login');
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    // Ensure headers exist and set content type for JSON
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Authorization', `Bearer ${token}`);

    
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers,
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error(`[fetchWithAuth] Failed to parse JSON response from ${endpoint}:`, responseText);
      throw new Error('Resposta inválida do servidor');
    }


    if (response.status === 401) {
      netlifyIdentity.logout();
      netlifyIdentity.open('login');
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    if (response.status === 403) {
      throw new Error('Você não tem permissão para acessar este recurso.');
    }

    if (response.status === 404) {
      throw new Error('Recurso não encontrado.');
    }

    if (response.status >= 500) {
      console.error('Server error:', responseData);
      throw new Error('Erro interno do servidor. Por favor, tente novamente mais tarde.');
    }

    if (!response.ok) {
      const errorMessage = responseData.error || 
                         responseData.message || 
                         `Erro na requisição: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error(`[fetchWithAuth] Error in ${endpoint}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};

export const addCultivo = async (cultivoData: { name: string; startDate: string; notes?: string; plants: Omit<Plant, 'id' | 'qrCodeValue'>[] }): Promise<{ cultivo: Cultivo; plants: Plant[] }> => {
  try {
    const user = netlifyIdentity.currentUser();
    if (!user) {
      netlifyIdentity.open('login');
      throw new Error('Usuário não autenticado. Por favor, faça login.');
    }

    // Get the user ID from the JWT token
    const token = user.token?.access_token;
    if (!token) {
      netlifyIdentity.logout();
      netlifyIdentity.open('login');
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    // The user ID will be extracted from the JWT token in the Netlify function
    const result = await fetchWithAuth('addCultivo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...cultivoData,
        // Ensure startDate is properly formatted
        startDate: new Date(cultivoData.startDate).toISOString(),
      }),
    });
    
    return result;
  } catch (error) {
    console.error('Error in addCultivo:', error);
    throw error;
  }
};

export const getCultivos = async (): Promise<Cultivo[]> => {
  try {
    const result = await fetchWithAuth('getCultivos');
    
    // Ensure all dates are properly parsed
    const cultivos = Array.isArray(result) ? result : [];
    return cultivos.map((cultivo: any) => ({
      ...cultivo,
      startDate: cultivo.start_date || cultivo.startDate,
      finalizadoEm: cultivo.finalizado_em || cultivo.finalizadoEm,
      createdAt: cultivo.created_at || cultivo.createdAt,
      updatedAt: cultivo.updated_at || cultivo.updatedAt,
    }));
  } catch (error) {
    console.error('Error in getCultivos:', error);
    throw error;
  }
};

export const getPlantsByCultivo = async (cultivoId: string): Promise<Plant[]> => {
  try {
    if (!cultivoId) {
      console.warn('getPlantsByCultivo called with empty cultivoId');
      return [];
    }
    
    const result = await fetchWithAuth(`getPlants?cultivoId=${encodeURIComponent(cultivoId)}`);
    
    // Ensure all dates are properly parsed and handle potential null/undefined
    const plants = Array.isArray(result) ? result : [];
    return plants.map((plant: any) => ({
      ...plant,
      // Map snake_case to camelCase and handle potential null/undefined
      birthDate: plant.birth_date || plant.birthDate,
      lastDailyCheckDate: plant.last_daily_check_date || plant.lastDailyCheckDate,
      estimatedHarvestDate: plant.estimated_harvest_date || plant.estimatedHarvestDate,
      createdAt: plant.created_at || plant.createdAt,
      updatedAt: plant.updated_at || plant.updatedAt,
    }));
  } catch (error) {
    console.error(`Error in getPlantsByCultivo for cultivo ${cultivoId}:`, error);
    // Return empty array instead of throwing to prevent UI breaking
    return [];
  }
};

export const getCultivoById = async (cultivoId: string): Promise<Cultivo | null> => {
  const result = await fetchWithAuth(`getCultivo?id=${encodeURIComponent(cultivoId)}`);
  return result ? convertKeysToCamelCase(result) : null;
};

export const updateCultivo = async (cultivoId: string, cultivoData: Partial<Omit<Cultivo, 'id'>> & { plants?: any[] }): Promise<Cultivo> => {
  try {
    // Create a new object to avoid mutating the original
    const updateData = { ...cultivoData };
    
    // Remove any undefined values to avoid sending them to the API
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    
    const result = await fetchWithAuth('updateCultivo', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: cultivoId,
        ...updateData
      }),
    });
    
    return result;
  } catch (error) {
    console.error('Error in updateCultivo:', error);
    throw error;
  }
};
