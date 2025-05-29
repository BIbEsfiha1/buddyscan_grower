import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body || '{}');
  const { name, race, effects, flavors, created_by } = body;

  if (!name || name.length < 2) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'O nome da strain é obrigatório e deve ter pelo menos 2 caracteres.' })
    };
  }

  // Verifica se já existe strain com esse nome
  const { data: existing, error: findError } = await supabase
    .from('strains')
    .select('id')
    .ilike('name', name);

  if (findError) {
    return { statusCode: 500, body: JSON.stringify({ error: findError.message }) };
  }
  if (existing && existing.length > 0) {
    return {
      statusCode: 409,
      body: JSON.stringify({ error: 'Strain já cadastrada.' })
    };
  }

  const { data, error } = await supabase.from('strains').insert([
    {
      name,
      race: race || null,
      effects: effects || null,
      flavors: flavors || null,
      created_by: created_by || null,
    }
  ]).select();

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 201,
    body: JSON.stringify(data && data[0])
  };
};
