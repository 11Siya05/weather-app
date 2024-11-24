// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./index.css"; 

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [unit, setUnit] = useState("metric");
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const apiKey = "09ecf14dbb13338f728749c366f9f264";

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${unit}&appid=${apiKey}`
      );

      if (!weatherResponse.ok) throw new Error("City not found");
      const weather = await weatherResponse.json();
      setWeatherData(weather);

      await fetchForecast(weather.coord.lat, weather.coord.lon);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`
      );

      const weather = await weatherResponse.json();
      setWeatherData(weather);

      await fetchForecast(lat, lon);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Unable to fetch weather for your location.");
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
      setForecastData(forecast.list.filter((_, index) => index % 8 === 0)); // Get daily forecast
    } catch (error) {
      console.error("Error fetching forecast:", error);
    }
  };

  const handleSearch = () => {
    if (city) {
      fetchWeather(city);
    } else {
      alert("Please enter a city name");
    }
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude
        );
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="container">
      <div className="weather-container">
        <h2 className="text-center mb-4">Weather Forecast</h2>

        <div className="search-section">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fa fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter city name..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary" onClick={handleSearch}>
                <i className="fa fa-cloud-sun"></i> Get Weather
              </button>
              <button className="btn btn-success" onClick={handleLocationSearch}>
                <i className="fa fa-location-dot"></i> My Location
              </button>
            </div>
          </div>

          <div className="temp-toggle text-center mt-3">
            <label htmlFor="unitToggle">
              <i className="fa fa-temperature-high"></i> Display in:{" "}
            </label>
            <select
              id="unitToggle"
              className="form-select d-inline w-auto"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="metric">Celsius</option>
              <option value="imperial">Fahrenheit</option>
            </select>
          </div>
        </div>

        {loading && (
          <div id="loading" className="loading">
            <div className="loading-spinner"></div>
            <p className="mt-3">Fetching weather data...</p>
          </div>
        )}

        {weatherData && (
          <div className="weather-info">
            <div className="text-center">
              <img
                className="weather-icon"
                src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
                alt="Weather icon"
              />
              <h3>{`${weatherData.name}, ${weatherData.sys.country}`}</h3>
              <p className="text-muted">
                {weatherData.weather[0].description}
              </p>
            </div>
            <div className="weather-details">
              <p>
                <span>
                  <i className="fa fa-temperature-high"></i> Temperature:
                </span>{" "}
                {Math.round(weatherData.main.temp)}°
              </p>
              <p>
                <span>
                  <i className="fa fa-droplet"></i> Humidity:
                </span>{" "}
                {weatherData.main.humidity}%
              </p>
              <p>
                <span>
                  <i className="fa fa-wind"></i> Wind Speed:
                </span>{" "}
                {weatherData.wind.speed} m/s
              </p>
            </div>
          </div>
        )}

        {forecastData.length > 0 && (
          <div className="forecast row">
            {forecastData.map((forecast, index) => (
              <div className="col-md-2 mb-3" key={index}>
                <div className="forecast-day">
                  <p>
                    {new Date(forecast.dt * 1000).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <img
                    src={`http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
                    alt="Forecast icon"
                  />
                  <p>{Math.round(forecast.main.temp)}°</p>
                  <p className="text-muted small">
                    {forecast.weather[0].description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;
