// Utilitário para buscar temperatura real de uma cidade usando OpenWeatherMap
// Você precisa de uma API KEY gratuita: https://openweathermap.org/appid
// Recomendo salvar a chave em .env.local ou variável de ambiente

const OPENWEATHER_API_KEY = '12d976552e935e377e75b111d5f6e06a';
const DEFAULT_CITY = 'São Paulo,BR';

export async function fetchCurrentTemperature({lat, lon, city}: {lat?: number, lon?: number, city?: string} = {}): Promise<number | null> {
  try {
    let url = '';
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(DEFAULT_CITY)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.main?.temp ?? null;
  } catch (e) {
    console.error('Erro ao buscar temperatura:', e);
    return null;
  }
}

export function getTemperatureAlert(temp: number): string | null {
  if (temp >= 35) return '⚠️ Temperatura muito alta! Risco de estresse térmico para as plantas.';
  if (temp >= 30) return 'Atenção: Temperatura acima do ideal.';
  if (temp <= 10) return '⚠️ Temperatura muito baixa! Risco de danos por frio.';
  if (temp <= 15) return 'Atenção: Temperatura abaixo do ideal.';
  return null;
}
