import { Plant, DiaryEntry, NewPlantData } from '../types';
import netlifyIdentity from 'netlify-identity-widget';

const API_BASE_URL = '/.netlify/functions';

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
      throw new Error(`Falha ao processar resposta do servidor (${response.status} ${response.statusText}). Resposta: ${responseText.substring(0, 200)}`);
    }


    if (response.status === 401) {
      // Token may have expired or is invalid
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

// --- Funções utilitárias para conversão de snake_case para camelCase ---
function snakeToCamel(s: string) {
  return s.replace(/_([a-z])/g, g => g[1].toUpperCase());
}

export function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToCamelCase(v));
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [snakeToCamel(k), convertKeysToCamelCase(v)])
    );
  }
  return obj;
}

// --- Funções CRUD para Plantas ---

export const getPlants = async (): Promise<Plant[]> => {
  const result = await fetchWithAuth('getPlants');
  return convertKeysToCamelCase(result);
};

export const getPlantById = async (id: string): Promise<Plant | null> => {
  const plants = await getPlants();
  return plants.find(plant => plant.id === id) || null;
};

// Use NewPlantData for plantData type for creation
export const addPlant = async (plantData: NewPlantData): Promise<Plant> => {
  // plantData (NewPlantData) does not contain id or qrCodeValue
  const result = await fetchWithAuth('addPlant', {
    method: 'POST',
    body: JSON.stringify(plantData),
  });
  return convertKeysToCamelCase(result);
};

// Update plant with proper data formatting
export const updatePlant = async (plantId: string, plantData: Partial<Omit<Plant, 'id'>>): Promise<Plant> => {
  // Create a new object to avoid mutating the original
  const updateData = { ...plantData };
  
  // Remove any undefined values to avoid sending them to the API
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof typeof updateData] === undefined) {
      delete updateData[key as keyof typeof updateData];
    }
  });

  
  const result = await fetchWithAuth('updatePlant', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: plantId,
      ...updateData
    }),
  });
  
  return convertKeysToCamelCase(result);
};

export const deletePlant = async (id: string): Promise<void> => {
  await fetchWithAuth(`deletePlant?id=${id}`, { // Passa o ID como query param
    method: 'DELETE',
  });
  // Não retorna nada em caso de sucesso (204 No Content)
};

// --- Funções para Entradas do Diário utilizando Supabase ---

export const getDiaryEntries = async (plantId: string): Promise<DiaryEntry[]> => {
  const result = await fetchWithAuth(`getDiaryEntries?plantId=${plantId}`);
  return convertKeysToCamelCase(result);
};

// Corrected parameter type for entry: Omit<DiaryEntry, 'id' | 'timestamp'>
export const addDiaryEntry = async (
  plantId: string,
  entry: Omit<DiaryEntry, 'id' | 'timestamp'>
): Promise<DiaryEntry> => {
  const result = await fetchWithAuth('addDiaryEntry', {
    method: 'POST',
    body: JSON.stringify({ ...entry, plantId }),
  });
  return convertKeysToCamelCase(result);
};

// Corrected parameter type for updatedEntryData: Partial<Omit<DiaryEntry, 'id' | 'timestamp'>>
export const updateDiaryEntry = async (
  plantId: string,
  entryId: string,
  updatedEntryData: Partial<Omit<DiaryEntry, 'id' | 'timestamp'>>
): Promise<DiaryEntry | null> => {
  const result = await fetchWithAuth('updateDiaryEntry', {
    method: 'PUT',
    body: JSON.stringify({ id: entryId, plantId, ...updatedEntryData }),
  });
  return convertKeysToCamelCase(result);
};

export const deleteDiaryEntry = async (plantId: string, entryId: string): Promise<boolean> => {
  await fetchWithAuth(`deleteDiaryEntry?id=${entryId}&plantId=${plantId}`, {
    method: 'DELETE',
  });
  return true;
};