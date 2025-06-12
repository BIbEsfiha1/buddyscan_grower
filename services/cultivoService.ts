import { Cultivo, Plant } from '../types';
import { convertKeysToCamelCase } from '../utils/caseUtils';
import { loadNetlifyIdentity } from '../utils/loadNetlifyIdentity';
import logger from '../utils/logger';

const API_BASE_URL = '/.netlify/functions';
const netlifyIdentity = loadNetlifyIdentity();

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

    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Authorization', `Bearer ${token}`);

    logger.log(`[fetchWithAuth] Sending ${options.method || 'GET'} to ${endpoint}`, options.body);

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers,
    });

    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error(`[fetchWithAuth] Failed to parse JSON response from ${endpoint}:`, responseText);
      throw new Error('Resposta inválida do servidor');
    }

    logger.log(`[fetchWithAuth] Response from ${endpoint}:`, {
      status: response.status,
      data: responseData
    });

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
    throw error;
  }
};

export const addCultivo = async (
  cultivoData: {
    name: string;
    startDate: string;
    notes?: string;
    substrate?: string;
    growId?: string;
    plants?: Omit<Plant, 'id' | 'qrCodeValue'>[];
  }
): Promise<{ cultivo: Cultivo; plants?: Plant[] }> => {
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

    const bodyData: any = {
      ...cultivoData,
      startDate: new Date(cultivoData.startDate).toISOString(),
    };
    if (!bodyData.plants) delete bodyData.plants;

    const result = await fetchWithAuth('addCultivo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    return result;
  } catch (error) {
    console.error('Error in addCultivo:', error);
    throw error;
  }
};

export const getCultivos = async (): Promise<Cultivo[]> => {
  try {
    logger.log('[getCultivos] Fetching cultivos');
    const result = await fetchWithAuth('getCultivos');
    const cultivos = Array.isArray(result) ? result : [];
    return cultivos.map((c: any) => ({
      ...c,
      startDate: c.start_date || c.startDate,
      finalizadoEm: c.finalizado_em || c.finalizadoEm,
      createdAt: c.created_at || c.createdAt,
      updatedAt: c.updated_at || c.updatedAt,
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

    logger.log(`[getPlantsByCultivo] Fetching plants for cultivo ${cultivoId}`);
    const result = await fetchWithAuth(
      `getPlants?cultivoId=${encodeURIComponent(cultivoId)}`
    );

    const plants = Array.isArray(result) ? result : [];
    return plants.map((p: any) => ({
      ...p,
      qrCodeValue: p.qr_code_value || p.qrCodeValue,
      birthDate: p.birth_date || p.birthDate,
      lastDailyCheckDate: p.last_daily_check_date || p.lastDailyCheckDate,
      estimatedHarvestDate: p.estimated_harvest_date || p.estimatedHarvestDate,
      createdAt: p.created_at || p.createdAt,
      updatedAt: p.updated_at || p.updatedAt,
    }));
  } catch (error) {
    console.error(`Error in getPlantsByCultivo for cultivo ${cultivoId}:`, error);
    return [];
  }
};

export const getCultivoById = async (cultivoId: string): Promise<Cultivo | null> => {
  const result = await fetchWithAuth(
    `getCultivo?id=${encodeURIComponent(cultivoId)}`
  );
  return result ? convertKeysToCamelCase(result) : null;
};

export const updateCultivo = async (
  cultivoId: string,
  cultivoData: Partial<Omit<Cultivo, 'id'>> & { plants?: any[] }
): Promise<Cultivo> => {
  try {
    const updateData = { ...cultivoData };
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    logger.log('[updateCultivo] Sending update data:', {
      id: cultivoId,
      ...updateData,
    });

    const result = await fetchWithAuth('updateCultivo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cultivoId, ...updateData }),
    });

    return result;
  } catch (error) {
    console.error('Error in updateCultivo:', error);
    throw error;
  }
};
