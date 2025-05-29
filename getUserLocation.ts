// Tenta obter a localização do usuário a partir do perfil Netlify Identity (caso tenha latitude/longitude custom claims)
// Se não houver, tenta usar a geolocalização do navegador

export async function getUserLocation(user?: any): Promise<{lat: number, lon: number} | null> {
  // 1. Busca claims customizadas do Netlify Identity
  if (user && user.user_metadata) {
    const { latitude, longitude, city } = user.user_metadata;
    if (latitude && longitude) {
      return { lat: Number(latitude), lon: Number(longitude) };
    }
    // Fallback: se só tiver cidade
    if (city) {
      // Busca coordenadas da cidade via OpenWeatherMap
      try {
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=12d976552e935e377e75b111d5f6e06a`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return { lat: data[0].lat, lon: data[0].lon };
        }
      } catch {}
    }
  }
  // 2. Usa geolocalização do navegador
  if (navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  }
  return null;
}
