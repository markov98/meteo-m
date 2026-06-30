import Forecast from './components/Forecast';
import { useTheme } from './hooks/useTheme';
import { useWeather } from './hooks/useWeather';
import { weatherCodeToEmoji } from './utils/weatherEmoji';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
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
  } = useWeather();

  return (
    <div className={`app-container ${theme}`}>
      <header>
        <div className="title-row">
          <h1>Meteo-M</h1>
          <button type="button" className="theme-toggle-button" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
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
                  {location.name}, {location.admin1 ? `${location.admin1}, ` : ''}
                  {location.country}
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