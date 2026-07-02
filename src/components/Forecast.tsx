import type { DailyForecast } from '../types';
import { weatherCodeToEmoji } from '../utils/weatherEmoji';

interface Props {
  forecast: DailyForecast[];
}

export default function Forecast({ forecast }: Props) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <section className="forecast-section">
      <h2>5-day forecast</h2>
      <div className="forecast-grid">
        {forecast.map((day) => (
          <article key={day.date} className="forecast-card">
            <p className="forecast-date">
              {new Date(day.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p style={{ fontSize: '1.8rem', margin: '0.5rem 0', textAlign: 'center' }}>
              {weatherCodeToEmoji(day.weatherCode)}
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
  );
}
