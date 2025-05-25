// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiThunderstorm,
} from "weather-icons-react";
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
  const getWeatherIcon = (iconCode) => {
    const size = 50;
    const color = "#1a237e";

    switch (iconCode.slice(0, -1)) {
      case "01":
        return <WiDaySunny size={size} color={color} />;
      case "02":
      case "03":
      case "04":
        return <WiCloudy size={size} color={color} />;
      case "09":
      case "10":
        return <WiRain size={size} color={color} />;
      case "11":
        return <WiThunderstorm size={size} color={color} />;
      case "13":
        return <WiSnow size={size} color={color} />;
      default:
        return <WiDaySunny size={size} color={color} />;
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
              <button
                className="btn btn-success"
                onClick={handleLocationSearch}
              >
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
              <div className="weather-icon-large">
                {getWeatherIcon(weatherData.weather[0].icon)}
              </div>
              <h3>{`${weatherData.name}, ${weatherData.sys.country}`}</h3>
              <h2 className="temperature">
                {Math.round(weatherData.main.temp)}°
              </h2>
              <p className="description">
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
                  <p className="forecast-date">
                    {new Date(forecast.dt * 1000).toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                  {getWeatherIcon(forecast.weather[0].icon)}
                  <p className="forecast-temp">
                    {Math.round(forecast.main.temp)}°
                  </p>
                  <p className="forecast-desc">
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
