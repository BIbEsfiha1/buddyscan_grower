import { Grow } from '../types';
import { loadNetlifyIdentity } from '../utils/loadNetlifyIdentity';

const API_BASE_URL = '/.netlify/functions';

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const netlifyIdentity = await loadNetlifyIdentity();
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
  const res = await fetch(`${API_BASE_URL}/${endpoint}`, { ...options, headers });
  if (!res.ok) {
    throw new Error('Erro na requisição');
  }
  return res.json();
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
