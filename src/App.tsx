import { useState } from 'react';
import { searchLocations } from './services/locationService';
import { getCurrentWeather } from './services/weatherService';
import type { CityLocation, WeatherData } from './types';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<CityLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<CityLocation | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="app-container">
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
        <section className="weather-section">
          <h2>Weather for {selectedLocation.name}</h2>
          <p>Temperature: {weather.temperature ?? 'N/A'}°C</p>
          <p>Wind speed: {weather.windspeed ?? 'N/A'} km/h</p>
          <p>Wind direction: {weather.winddirection ?? 'N/A'}°</p>
          <p>Time: {weather.time ?? 'N/A'}</p>
        </section>
      )}
    </div>
  );
}

export default App;
