import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_AI_PROMPT } from '../../constants';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const handler: Handler = async (event) => {
  if (!ai) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }
  try {
    const { imageBase64, prompt } = JSON.parse(event.body || '{}');
    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing imageBase64' }) };
    }
    const model = ai.getGenerativeModel({ model: 'gemini-pro-vision' });
    const result = await model.generateContent([
      { text: prompt || DEFAULT_AI_PROMPT },
      { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
    ]);
    const text = result.response.text();
    return {
      statusCode: 200,
      body: JSON.stringify({ summary: text, rawJson: JSON.stringify(result.response) }),
    };
  } catch (error) {
    console.error('diagnoseImage error', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to get diagnosis' }) };
  }
};
