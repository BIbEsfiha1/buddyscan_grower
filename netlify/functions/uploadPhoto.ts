import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { successResponse } from './_utils/responseHelpers';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const handler: Handler = async (event, context) => {
  const { user } = context.clientContext || {};
  if (!user || !user.sub) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Usuário não autenticado.' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido. Use POST.' }), headers: { Allow: 'POST' } };
  }

  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corpo da requisição ausente.' }) };
  }

  try {
    const { fileName, base64, contentType } = JSON.parse(event.body);
    if (!fileName || !base64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetros fileName e base64 são obrigatórios.' }) };
    }

    const userId = user.sub;
    const ts = Date.now();
    const ext = fileName.split('.').pop() || 'jpg';
    const originalPath = `${userId}/${ts}_${fileName}`;
    const thumbPath = `${userId}/${ts}_thumb.${ext}`;

    const base64Data = base64.includes('base64,') ? base64.split('base64,')[1] : base64;
    const buffer = Buffer.from(base64Data, 'base64');

    const { error: uploadError } = await supabase.storage
      .from('diary-photos')
      .upload(originalPath, buffer, { contentType: contentType || 'image/jpeg' });
    if (uploadError) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao salvar foto.', details: uploadError.message }) };
    }

    const thumbBuffer = await sharp(buffer).resize({ width: 300 }).toBuffer();
    const { error: thumbUploadError } = await supabase.storage
      .from('diary-photos')
      .upload(thumbPath, thumbBuffer, { contentType: contentType || 'image/jpeg' });
    if (thumbUploadError) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao salvar miniatura.', details: thumbUploadError.message }) };
    }

    const { data: originalUrl } = supabase.storage.from('diary-photos').getPublicUrl(originalPath);
    const { data: thumbUrl } = supabase.storage.from('diary-photos').getPublicUrl(thumbPath);

    return successResponse({ urlOriginal: originalUrl.publicUrl, urlThumb: thumbUrl.publicUrl }, 201);
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro inesperado no servidor.', details: e.message }) };
  }
};
