import { useEffect, useState } from 'react';
import { searchLocations } from '../services/locationService';
import { getCurrentWeather } from '../services/weatherService';
import { getIpLocation } from '../services/ipGeolocation';
import type { CityLocation, WeatherData } from '../types';

export function useWeather() {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<CityLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<CityLocation | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    requestLocation();
  }, []);

  const formatIpLocationLabel = (location: { city?: string; region?: string; country?: string }) => {
    const parts = [location.region || location.city, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'My location (IP)';
  };

  const loadWeatherForCoords = async (latitude: number, longitude: number, nameLabel = 'My location') => {
    setLoading(true);
    setError('');

    try {
      const weatherData = await getCurrentWeather(latitude, longitude);
      setWeather(weatherData);
      setSelectedLocation({ id: 'me', name: nameLabel, country: '', latitude, longitude });
    } catch (err) {
      setError('Failed to load weather for your location.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Type a city name first.');
      return;
    }

    setError('');
    setLoading(true);
    setWeather(null);
    setSelectedLocation(null);

    try {
      const results = await searchLocations(query.trim());
      setLocations(results);
      if (results.length === 0) {
        setError('No matching locations found.');
      }
    } catch (err) {
      setError('Failed to search locations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = async (location: CityLocation) => {
    setError('');
    setLoading(true);
    setSelectedLocation(location);

    try {
      const weatherData = await getCurrentWeather(location.latitude, location.longitude);
      setWeather(weatherData);
    } catch (err) {
      setError('Failed to load weather.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      setError('');

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await loadWeatherForCoords(latitude, longitude, 'My location');
        },
        async (err) => {
          console.error('Geolocation error:', err);
          const ipLoc = await getIpLocation();
          if (ipLoc) {
            await loadWeatherForCoords(ipLoc.latitude, ipLoc.longitude, formatIpLocationLabel(ipLoc));
          } else {
            setLoading(false);
            setError('Unable to determine location. Use search instead.');
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
      return;
    }

    (async () => {
      setLoading(true);
      setError('');
      const ipLoc = await getIpLocation();
      if (ipLoc) {
        await loadWeatherForCoords(ipLoc.latitude, ipLoc.longitude, formatIpLocationLabel(ipLoc));
      } else {
        setLoading(false);
        setError('Geolocation not supported by this browser. Use search instead.');
      }
    })();
  };

  return {
    query,
    setQuery,
    locations,
    selectedLocation,
    weather,
    loading,
    error,
    handleSearch,
    handleSelectLocation,
    requestLocation,
  };
}