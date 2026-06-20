export interface CityLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

export interface OpenMeteoGeocodingResult {
  id?: number | string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface OpenMeteoWeatherCurrent {
  temperature: number;
  windspeed?: number;
  winddirection?: number;
  time?: string;
}

export interface OpenMeteoWeatherResponse {
  current_weather?: OpenMeteoWeatherCurrent;
}

export interface WeatherData {
  temperature: number | null;
  windspeed: number | null;
  winddirection: number | null;
  time: string | null;
  raw: OpenMeteoWeatherResponse | null;
}
