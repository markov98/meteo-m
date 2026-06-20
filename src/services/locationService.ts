import { searchCity } from '../api/geocodingApi';
import type { CityLocation, OpenMeteoGeocodingResult } from '../types';

export async function searchLocations(query: string): Promise<CityLocation[]> {
  const results = await searchCity(query);

  if (!Array.isArray(results)) {
    return [];
  }

  return results.map((item: OpenMeteoGeocodingResult) => ({
    id: item.id?.toString() ?? `${item.latitude}-${item.longitude}`,
    name: item.name,
    country: item.country,
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
  }));
}
