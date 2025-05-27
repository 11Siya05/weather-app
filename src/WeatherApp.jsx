import React, { useState } from "react";
import { Search, MapPin, Thermometer, Droplets, Wind, Sun, Cloud, CloudRain, CloudSnow, Zap, Gauge } from "lucide-react";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [unit, setUnit] = useState("metric");
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState("");

  const apiKey = "09ecf14dbb13338f728749c366f9f264";

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError("");
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${unit}&appid=${apiKey}`
      );
      if (!weatherResponse.ok) throw new Error("City not found");
      const weather = await weatherResponse.json();
      setWeatherData(weather);
      await fetchForecast(weather.coord.lat, weather.coord.lon);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      setError("");
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`
      );
      const weather = await weatherResponse.json();
      setWeatherData(weather);
      await fetchForecast(lat, lon);
    } catch (error) {
      setError("Unable to fetch weather for your location.");
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (lat, lon) => {
    try {
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`
      );
      const forecast = await forecastResponse.json();
      setForecastData(forecast.list.filter((_, index) => index % 8 === 0));
    } catch (error) {
      console.error("Error fetching forecast:", error);
    }
  };

  const handleSearch = () => {
    if (city.trim()) {
      fetchWeather(city.trim());
    } else {
      setError("Please enter a city name");
    }
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError("Unable to access your location.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const getWeatherIcon = (iconCode, size = "sm") => {
    const iconSize = size === "lg" ? 80 : 40;
    const iconClass = `weather-icon ${size === "lg" ? "large" : "small"}`;
    const weatherType = iconCode.slice(0, -1);
    switch (weatherType) {
      case "01":
        return <Sun className={`${iconClass} sun`} size={iconSize} />;
      case "02":
      case "03":
        return <Cloud className={`${iconClass} cloud`} size={iconSize} />;
      case "04":
        return <Cloud className={`${iconClass} cloud-dark`} size={iconSize} />;
      case "09":
      case "10":
        return <CloudRain className={`${iconClass} rain`} size={iconSize} />;
      case "11":
        return <Zap className={`${iconClass} thunder`} size={iconSize} />;
      case "13":
        return <CloudSnow className={`${iconClass} snow`} size={iconSize} />;
      default:
        return <Sun className={`${iconClass} sun`} size={iconSize} />;
    }
  };

  const getTemperatureUnit = () => (unit === "metric" ? "°C" : "°F");
  const getWindUnit = () => (unit === "metric" ? "m/s" : "mph");

  return (
    <div className="weather-app">
      <div className="container">
        <div className="weather-card main-card">
          <div className="card-header">
            <h1 className="app-title">Weather Forecast</h1>
          </div>

          <div className="card-content">
            {/* Search Section */}
            <div className="search-card">
              <div className="search-content">
                <div className="search-row">
                  <div className="search-input-container">
                    <div className="input-wrapper">
                      <Search className="search-icon" size={20} />
                      <input
                        type="text"
                        placeholder="Enter city name..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        className="search-input"
                      />
                    </div>
                  </div>

                  <div className="button-group">
                    <button onClick={handleSearch} className="btn btn-primary" disabled={loading}>
                      <Search className="btn-icon" size={16} />
                      Search
                    </button>
                    <button onClick={handleLocationSearch} className="btn btn-outline" disabled={loading}>
                      <MapPin className="btn-icon" size={16} />
                      Location
                    </button>
                  </div>
                </div>

                <div className="unit-selector">
                  <Thermometer size={16} className="unit-icon" />
                  <span className="unit-label">Temperature Unit:</span>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="unit-select">
                    <option value="metric">Celsius</option>
                    <option value="imperial">Fahrenheit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-card">
                <p className="error-message">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="loading-card">
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Fetching weather data...</p>
                </div>
              </div>
            )}

            {/* Current Weather */}
            {weatherData && !loading && (
              <div className="current-weather-card">
                <div className="current-weather-content">
                  <div className="weather-main">
                    <div className="weather-icon-container">{getWeatherIcon(weatherData.weather[0].icon, "lg")}</div>

                    <div className="weather-info">
                      <h2 className="location">
                        {weatherData.name}, {weatherData.sys.country}
                      </h2>
                      <p className="temperature">
                        {Math.round(weatherData.main.temp)}
                        {getTemperatureUnit()}
                      </p>
                      <p className="description">{weatherData.weather[0].description}</p>
                    </div>
                  </div>

                  <div className="weather-details-grid">
                    <div className="detail-card">
                      <Thermometer className="detail-icon" size={24} />
                      <p className="detail-label">Feels like</p>
                      <p className="detail-value">
                        {Math.round(weatherData.main.feels_like)}
                        {getTemperatureUnit()}
                      </p>
                    </div>

                    <div className="detail-card">
                      <Droplets className="detail-icon" size={24} />
                      <p className="detail-label">Humidity</p>
                      <p className="detail-value">{weatherData.main.humidity}%</p>
                    </div>

                    <div className="detail-card">
                      <Wind className="detail-icon" size={24} />
                      <p className="detail-label">Wind Speed</p>
                      <p className="detail-value">
                        {weatherData.wind.speed} {getWindUnit()}
                      </p>
                    </div>

                    <div className="detail-card">
                      <Gauge className="detail-icon" size={24} />
                      <p className="detail-label">Pressure</p>
                      <p className="detail-value">{weatherData.main.pressure} hPa</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            {forecastData.length > 0 && !loading && (
              <div className="forecast-card">
                <div className="forecast-header">
                  <h3 className="forecast-title">5-Day Forecast</h3>
                </div>
                <div className="forecast-content">
                  <div className="forecast-grid">
                    {forecastData.map((forecast, index) => (
                      <div key={index} className="forecast-item">
                        <p className="forecast-date">
                          {new Date(forecast.dt * 1000).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>

                        <div className="forecast-icon">{getWeatherIcon(forecast.weather[0].icon)}</div>

                        <p className="forecast-temp">
                          {Math.round(forecast.main.temp)}
                          {getTemperatureUnit()}
                        </p>

                        <p className="forecast-desc">{forecast.weather[0].description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
