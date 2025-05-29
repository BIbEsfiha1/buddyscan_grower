import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const strainApiKey = process.env.STRAIN_API_KEY!; // RapidAPI Key

async function fetchStrainApi(query: string) {
  const url = `https://strains.evanbusse.com/strains/search/${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': strainApiKey,
      'X-RapidAPI-Host': 'strains.evanbusse.com',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  // Normaliza para o formato esperado
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
    id: `external-${item.id}`,
    name: item.name,
    race: item.race,
    effects: item.effects || [],
    flavors: item.flavors || [],
    origin: 'external',
  }));
}

export const handler: Handler = async (event) => {
  const query = event.queryStringParameters?.query || '';
  if (!query || query.length < 2) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Query must be at least 2 characters.' })
    };
  }

  // Busca local
  const { data: local, error } = await supabase
    .from('strains')
    .select('id, name, race, effects, flavors')
    .ilike('name', `%${query}%`)
    .order('name');

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }

  // Marca origem local
  const localStrains = (local || []).map(s => ({ ...s, origin: 'local' }));

  // Se já tem pelo menos 5 sugestões locais, retorna só elas
  if (localStrains.length >= 5) {
    return {
      statusCode: 200,
      body: JSON.stringify(localStrains)
    };
  }

  // Busca externa
  let externalStrains: any[] = [];
  try {
    externalStrains = await fetchStrainApi(query);
  } catch (e) {
    // Falha silenciosa na externa
    externalStrains = [];
  }

  // Evita duplicatas pelo nome (case-insensitive)
  const namesSet = new Set(localStrains.map(s => s.name.toLowerCase()));
  const merged = [
    ...localStrains,
    ...externalStrains.filter(s => !namesSet.has(s.name.toLowerCase())),
  ];

  return {
    statusCode: 200,
    body: JSON.stringify(merged)
  };
};
