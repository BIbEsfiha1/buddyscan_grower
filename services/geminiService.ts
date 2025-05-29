
// This is a MOCK service. In a real application, this would interact with the GoogleGenAI SDK.
// For example, `import { GoogleGenAI } from "@google/genai";` would be used.
// The API key would be `process.env.API_KEY`, handled by the backend or a secure environment.

import { DEFAULT_AI_PROMPT } from '../constants';

/**
 * Simulates getting an AI diagnosis for an image.
 * In a real app, imageBase64 would be sent to the Gemini API.
 * @param imageBase64 The base64 encoded string of the image.
 * @param prompt Optional prompt to guide the AI.
 * @returns A promise that resolves to a mock diagnosis.
 */
export const getMockImageDiagnosis = async (
   
  imageBase64: string, 
  prompt: string = DEFAULT_AI_PROMPT
): Promise<{ summary: string; rawJson: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const diagnoses = [
    "Folhas com pontas queimadas e curvadas para cima, possível excesso de nutrientes (nutrient burn). Recomenda-se flush com água pura.",
    "Manchas amarelas internervais nas folhas mais velhas, progredindo para cima. Pode ser deficiência de Magnésio. Considerar suplementação com CalMag.",
    "Pequenos pontos brancos e teias finas sob as folhas. Suspeita de infestação por spider mites. Tratar com óleo de neem ou sabão inseticida.",
    "Mofo cinza e pulverulento formando-se nos botões e folhas. Alerta para Botrytis (mofo cinzento). Aumentar ventilação e reduzir umidade.",
    "Planta parece saudável e vigorosa, com coloração verde escura uniforme. Nenhum sinal aparente de pragas ou deficiências.",
    "Folhas inferiores amareladas e caindo, enquanto o crescimento novo parece saudável. Pode ser deficiência de Nitrogênio, comum no início da floração.",
    "Crescimento lento e entrenós muito curtos. Verificar pH da rega e do solo, pode estar fora da faixa ideal.",
    "Manchas marrons ou necróticas com halos amarelos. Pode ser uma doença fúngica como Septoria. Remover folhas afetadas e melhorar circulação de ar."
  ];
  
  const randomDiagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

  return {
    summary: `${randomDiagnosis}`, // Prompt is already part of typical diagnosis structure here
    rawJson: JSON.stringify({
      details: "Esta é uma análise simulada pela IA. Em um cenário real, conteria dados estruturados da resposta do modelo Gemini.",
      confidence: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)), // between 0.7 and 1.0
      observedFeatures: ["folhas", "coloração", "textura"],
      potentialIssues: prompt.toLowerCase().includes("deficiência") ? ["deficiência nutricional"] : ["geral"],
      recommendations: ["Monitorar de perto", "Ajustar rega se necessário"],
      timestamp: new Date().toISOString(),
      modelUsed: "gemini-2.5-flash-preview-04-17 (simulado)",
    }),
  };
};

// Example of how a real Gemini API call might look (conceptual, not for direct use here as it needs API key and setup)
/*
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// This would typically be in a backend service or secure environment
// const API_KEY = process.env.API_KEY; 
// if (!API_KEY) throw new Error("API_KEY not found");
// const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getRealImageDiagnosis = async (imageBase64: string, mimeType: string, userPrompt: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType, // e.g., 'image/jpeg' or 'image/png'
        data: imageBase64,
      },
    };
    const textPart = { text: userPrompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17', // or other suitable vision model
        contents: { parts: [imagePart, textPart] },
    });
    
    // The actual text response from Gemini.
    // Needs robust error handling and parsing in a real app.
    return response.text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Handle different types of errors, e.g. GoogleGenAIError
    // if (error instanceof GoogleGenAIError) { ... }
    throw new Error("Failed to get diagnosis from Gemini API.");
  }
};
*/
