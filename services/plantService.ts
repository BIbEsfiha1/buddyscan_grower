// MOCK Data Service - Simulates backend API calls

import { Plant, DiaryEntry, NewPlantData } from '../types';
import { loadNetlifyIdentity } from '../utils/loadNetlifyIdentity';
import logger from '../utils/logger';
import { convertKeysToCamelCase } from '../utils/caseUtils';

const API_BASE_URL = '/.netlify/functions';
const netlifyIdentity = loadNetlifyIdentity();

// Helper para realizar chamadas autenticadas
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
      throw new Error(`Falha ao processar resposta do servidor (${response.status} ${response.statusText}). Resposta: ${responseText.substring(0, 200)}`);
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

// --- Funções CRUD para Plantas ---

export const getPlants = async (): Promise<Plant[]> => {
  const result = await fetchWithAuth('getPlants');
  return convertKeysToCamelCase(result);
};

export const getPlantById = async (id: string): Promise<Plant | null> => {
  const plants = await getPlants();
  return plants.find(plant => plant.id === id) || null;
};

export const addPlant = async (plantData: NewPlantData): Promise<Plant> => {
  const result = await fetchWithAuth('addPlant', {
    method: 'POST',
    body: JSON.stringify(plantData),
  });
  return convertKeysToCamelCase(result);
};

export const updatePlant = async (
  plantId: string,
  plantData: Partial<Omit<Plant, 'id'>>
): Promise<Plant> => {
  const updateData = { ...plantData };
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof typeof updateData] === undefined) {
      delete updateData[key as keyof typeof updateData];
    }
  });

  logger.log('[updatePlant] Sending update data:', { id: plantId, ...updateData });

  const result = await fetchWithAuth('updatePlant', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: plantId, ...updateData }),
  });

  return convertKeysToCamelCase(result);
};

export const deletePlant = async (id: string): Promise<void> => {
  await fetchWithAuth(`deletePlant?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
};

// --- Funções para Entradas do Diário ---

export const getDiaryEntries = async (
  plantId: string,
  limit?: number,
  offset?: number
): Promise<DiaryEntry[]> => {
  const params = new URLSearchParams({ plantId });
  if (typeof limit === 'number') params.append('limit', String(limit));
  if (typeof offset === 'number') params.append('offset', String(offset));
  const result = await fetchWithAuth(`getDiaryEntries?${params.toString()}`);
  return convertKeysToCamelCase(result);
};

export const addDiaryEntry = async (
  plantId: string,
  entry: Omit<DiaryEntry, 'id' | 'timestamp'>
): Promise<DiaryEntry> => {
  const result = await fetchWithAuth('addDiaryEntry', {
    method: 'POST',
    body: JSON.stringify({ plantId, ...entry }),
  });
  return convertKeysToCamelCase(result);
};

export const updateDiaryEntry = async (
  plantId: string,
  entryId: string,
  updatedEntryData: Partial<Omit<DiaryEntry, 'id' | 'timestamp'>>
): Promise<DiaryEntry> => {
  const result = await fetchWithAuth('updateDiaryEntry', {
    method: 'PUT',
    body: JSON.stringify({ id: entryId, plantId, ...updatedEntryData }),
  });
  return convertKeysToCamelCase(result);
};

export const addMassDiaryEntry = async (
  cultivoId: string,
  entry: Omit<DiaryEntry, 'id' | 'timestamp' | 'plantId'>
): Promise<number> => {
  const result = await fetchWithAuth('addMassDiaryEntry', {
    method: 'POST',
    body: JSON.stringify({ cultivoId, entry }),
  });
  return result.count || 0;
};

export const deleteDiaryEntry = async (
  plantId: string,
  entryId: string
): Promise<boolean> => {
  await fetchWithAuth(`deleteDiaryEntry?id=${encodeURIComponent(entryId)}&plantId=${encodeURIComponent(plantId)}`, {
    method: 'DELETE',
  });
  return true;
};
