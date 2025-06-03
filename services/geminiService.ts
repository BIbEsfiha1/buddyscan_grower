import { DEFAULT_AI_PROMPT } from '../constants';

export interface ImageDiagnosisResult {
  summary: string;
  rawJson?: string;
}

export const getImageDiagnosis = async (
  imageBase64: string,
  prompt: string = DEFAULT_AI_PROMPT
): Promise<ImageDiagnosisResult> => {
  const res = await fetch('/.netlify/functions/diagnoseImage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, prompt }),
  });
  if (!res.ok) {
    throw new Error(`Diagnose API error: ${res.status}`);
  }
  return res.json();
};
