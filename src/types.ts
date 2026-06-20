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
  weathercode?: number;
  time?: string;
}

export interface OpenMeteoHourly {
  time: string[];
  precipitation?: number[];
}

export interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_sum?: number[];
  weathercode?: number[];
}

export interface OpenMeteoWeatherResponse {
  current_weather?: OpenMeteoWeatherCurrent;
  hourly?: OpenMeteoHourly;
  daily?: OpenMeteoDaily;
}

export interface DailyForecast {
  date: string;
  tempMax: number | null;
  tempMin: number | null;
  precipitation: number | null;
  weatherCode?: number | null;
}

export interface WeatherData {
  temperature: number | null;
  windspeed: number | null;
  winddirection: number | null;
  weatherCode: number | null;
  precipitation: number | null;
  time: string | null;
  forecast: DailyForecast[];
  raw: OpenMeteoWeatherResponse | null;
}
