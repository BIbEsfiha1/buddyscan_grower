import { Grow } from '../types';
import { loadNetlifyIdentity } from '../utils/loadNetlifyIdentity';

const API_BASE_URL = '/.netlify/functions';

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const netlifyIdentity = loadNetlifyIdentity();
  try {
    const user = netlifyIdentity.currentUser();
    if (!user) {
      netlifyIdentity.open('login');
      throw new Error('Usuário não autenticado.');
    }

    const token = user.token?.access_token;
    if (!token) {
      netlifyIdentity.logout();
      netlifyIdentity.open('login');
      throw new Error('Sessão expirada.');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers,
    });

    const responseText = await res.text();
    let responseData: any = {};
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('[growService] Erro ao ler resposta JSON:', responseText);
    }

    if (!res.ok) {
      const message =
        responseData.error || responseData.message || 'Erro na requisição';
      throw new Error(message);
    }

    return responseData;
  } catch (error) {
    console.error(`[growService] Erro em ${endpoint}:`, error);
    throw error;
  }
};

export const getGrows = async (): Promise<Grow[]> => {
  const data = await fetchWithAuth('getGrows');
  return Array.isArray(data)
    ? data.map((g: any) => ({
        ...g,
        qrCodeValue: g.qr_code_value || g.qrCodeValue,
        createdAt: g.created_at || g.createdAt,
      }))
    : [];
};

export const addGrow = async (grow: { name: string; location?: string; capacity?: number }): Promise<Grow> => {
  const data = await fetchWithAuth('addGrow', {
    method: 'POST',
    body: JSON.stringify(grow),
  });
  return data;
};
