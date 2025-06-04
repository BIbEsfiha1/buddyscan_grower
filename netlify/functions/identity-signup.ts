import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const handler: Handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const user = payload.user || payload;
    const { id, email } = user;
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing user id' }) };
    }
    const { error } = await supabase
      .from('users_netlify')
      .upsert({ id, email });
    if (error) {
      console.error('identity-signup: failed to insert user', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e: any) {
    console.error('identity-signup error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected error' }) };
  }
};
