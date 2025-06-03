import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function camelToSnake(obj: any) {
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
      newObj[snakeKey] = obj[key];
    }
  }
  return newObj;
}

export const handler: Handler = async (event, context) => {
  const { user } = context.clientContext || {};
  if (!user || !user.sub) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Usuário não autenticado.' }) };
  }
  const userId = user.sub;
  const userEmail = (user as any).email || `${userId}@example.com`;

  // Ensure a corresponding Supabase auth user exists so the foreign key is valid
  try {
    const { data: existingUser } = await supabase.auth.admin.getUserById(userId);
    if (!existingUser) {
      await supabase.auth.admin.createUser({ id: userId, email: userEmail, email_confirm: true });
    }
  } catch (err) {
    console.error('Failed to ensure Supabase user', err);
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido. Use POST.' }), headers: { Allow: 'POST' } };
  }
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corpo da requisição ausente.' }) };
  }

  try {
    const body = JSON.parse(event.body);
    if (!body.plantId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'plantId é obrigatório.' }) };
    }
    const entry = camelToSnake(body);
    entry.user_id = userId;
    delete entry.id;

    const { data, error } = await supabase
      .from('diary_entries')
      .insert([entry])
      .select('*')
      .single();
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao adicionar entrada.', details: error.message }) };
    }
    return { statusCode: 201, body: JSON.stringify(data) };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }) };
  }
};
