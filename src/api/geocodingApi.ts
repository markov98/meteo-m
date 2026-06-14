export async function searchCity(city: string) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5`
  );

  const data = await res.json();
  return data.results;
}