import { fetchWeather } from '../api/weatherApi';
import type { DailyForecast, OpenMeteoWeatherResponse, WeatherData } from '../types';

function buildForecast(data: OpenMeteoWeatherResponse | null): DailyForecast[] {
  const dates = data?.daily?.time ?? [];
  const highs = data?.daily?.temperature_2m_max ?? [];
  const lows = data?.daily?.temperature_2m_min ?? [];
  const rain = data?.daily?.precipitation_sum ?? [];
  const codes = data?.daily?.weathercode ?? [];

  return dates.slice(0, 5).map((date, index) => ({
    date,
    tempMax: typeof highs[index] === 'number' ? highs[index] : null,
    tempMin: typeof lows[index] === 'number' ? lows[index] : null,
    precipitation: typeof rain[index] === 'number' ? rain[index] : null,
    weatherCode: typeof codes[index] === 'number' ? codes[index] : null,
  }));
}

function getCurrentPrecipitation(data: OpenMeteoWeatherResponse | null): number | null {
  if (!data?.hourly?.time || !data.hourly.precipitation) {
    return null;
  }

  const currentTime = data.current_weather?.time;
  if (!currentTime) {
    return data.hourly.precipitation[0] ?? null;
  }

  const currentIndex = data.hourly.time.indexOf(currentTime);
  if (currentIndex !== -1) {
    return data.hourly.precipitation[currentIndex] ?? null;
  }

  return data.hourly.precipitation[0] ?? null;
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const data = (await fetchWeather(lat, lon)) as OpenMeteoWeatherResponse | null;

  return {
    temperature: data?.current_weather?.temperature ?? null,
    windspeed: data?.current_weather?.windspeed ?? null,
    winddirection: data?.current_weather?.winddirection ?? null,
    precipitation: getCurrentPrecipitation(data),
    weatherCode: data?.current_weather?.weathercode ?? null,
    time: data?.current_weather?.time ?? null,
    forecast: buildForecast(data),
    raw: data,
  };
}
