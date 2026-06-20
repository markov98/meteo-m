import { fetchWeather } from '../api/weatherApi';
import type { OpenMeteoWeatherResponse, WeatherData } from '../types';

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const data = (await fetchWeather(lat, lon)) as OpenMeteoWeatherResponse | null;

  return {
    temperature: data?.current_weather?.temperature ?? null,
    windspeed: data?.current_weather?.windspeed ?? null,
    winddirection: data?.current_weather?.winddirection ?? null,
    time: data?.current_weather?.time ?? null,
    raw: data,
  };
}
