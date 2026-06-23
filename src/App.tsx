import { useState, useEffect } from 'react';
import { searchLocations } from './services/locationService';
import { getCurrentWeather } from './services/weatherService';
import { getIpLocation } from './services/ipGeolocation';
import type { CityLocation, WeatherData } from './types';
import Forecast from './components/Forecast';
import './App.css';

function weatherCodeToEmoji(code?: number | null): string {
  if (code == null) return '❓';

  // Open-Meteo / WMO weather codes mapping
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 86) return '🌦️';
  if (code >= 95 && code <= 99) return '⛈️';

  return '🌈';
}

function App() {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<CityLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<CityLocation | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Request the user's location on initial load
    requestLocation();
  }, []);

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
      console.log('Fetched weather data:', weatherData);
      setWeather(weatherData);
    } catch (err) {
      setError('Failed to load weather.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    // Try browser geolocation first.
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
          // Try IP-based fallback
          const ipLoc = await getIpLocation();
          if (ipLoc) {
            await loadWeatherForCoords(ipLoc.latitude, ipLoc.longitude, ipLoc.city ? `${ipLoc.city}` : 'My location (IP)');
          } else {
            setLoading(false);
            setError('Unable to determine location. Use search instead.');
          }
        },
        // Relax options for desktop environments: lower accuracy, longer timeout, allow cached positions
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
      return;
    }

    // If browser geolocation is not available, fall back to IP-based lookup
    (async () => {
      setLoading(true);
      setError('');
      const ipLoc = await getIpLocation();
      if (ipLoc) {
        await loadWeatherForCoords(ipLoc.latitude, ipLoc.longitude, ipLoc.city ? `${ipLoc.city}` : 'My location (IP)');
      } else {
        setLoading(false);
        setError('Geolocation not supported by this browser. Use search instead.');
      }
    })();
  };

  return (
    <div className="app-container">
      <header>
        <div className="title-row">
          <h1>Meteo-M</h1>
        </div>
        <p className="subtitle">A simple weather app with search and browser location.</p>
      </header>

      <section className="search-section">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter city name"
        />
        <button type="button" onClick={handleSearch} disabled={loading}>
          Search
        </button>
        <button type="button" onClick={requestLocation} disabled={loading}>
          Use my location
        </button>
      </section>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading…</div>}

      {locations.length > 0 && (
        <section className="locations-section">
          <h2>Locations</h2>
          <ul>
            {locations.map((location) => (
              <li key={location.id}>
                <button type="button" onClick={() => handleSelectLocation(location)}>
                  {location.name}, {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {weather && selectedLocation && (
        <>
          <section className="weather-section">
            <h2>Weather for {selectedLocation.name}</h2>
            <p className="weather-emoji-large">{weatherCodeToEmoji(weather.weatherCode)}</p>
            <p>
              <span className="weather-value">{weather.temperature ?? 'N/A'}°C</span> — current temperature
            </p>
            <p>
              Wind speed: <span className="weather-value">{weather.windspeed ?? 'N/A'} km/h</span>
            </p>
            <p>
              Wind direction: <span className="weather-value">{weather.winddirection ?? 'N/A'}°</span>
            </p>
            <p>
              Rain: <span className="weather-value">{weather.precipitation ?? 0} mm</span>
            </p>
            <p>
              Time: <span className="weather-value">{weather.time ?? 'N/A'}</span>
            </p>
          </section>

          <Forecast forecast={weather.forecast} />
        </>
      )}

      <footer className="app-footer">App by Martin Markov</footer>
    </div>
  );
}

export default App;
