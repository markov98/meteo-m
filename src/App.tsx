import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Request the user's location on initial load
    requestLocation();
  }, []);

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
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported by this browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const weatherData = await getCurrentWeather(latitude, longitude);
          setWeather(weatherData);
          setSelectedLocation({ id: 'me', name: 'My location', country: '', latitude, longitude });
        } catch (err) {
          setError('Failed to load weather for your location.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLoading(false);
        setError('Unable to determine location. Use search instead.');
      },
      // Relax options for desktop environments: lower accuracy, longer timeout, allow cached positions
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
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

          {weather.forecast.length > 0 && (
            <section className="forecast-section">
              <h2>5-day forecast</h2>
              <div className="forecast-grid">
                {weather.forecast.map((day) => (
                  <article key={day.date} className="forecast-card">
                    <p className="forecast-date">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p>
                      High: <span className="weather-value">{day.tempMax ?? 'N/A'}°C</span>
                    </p>
                    <p>
                      Low: <span className="weather-value">{day.tempMin ?? 'N/A'}°C</span>
                    </p>
                    <p>
                      Rain: <span className="weather-value">{day.precipitation ?? 0} mm</span>
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default App;
