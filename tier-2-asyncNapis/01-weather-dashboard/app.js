// ==========================================
// 1. DOM ELEMENTS CACHE
// ==========================================

// SEARCH
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const errorMsg = document.getElementById("error-msg");

// STATES
const loading = document.getElementById("loading");
const weatherSection = document.getElementById("weather-section");
const emptyState = document.getElementById("empty-state");

// CURRENT WEATHER
const cityName = document.getElementById("city-name");
const country = document.getElementById("country");
const currentDate = document.getElementById("current-date");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const weatherDesc = document.getElementById("weather-desc");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const visibility = document.getElementById("visibility");
const pressure = document.getElementById("pressure");

// FORECAST
const forecastContainer = document.getElementById("forecast-container");

// TOAST
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");


const API_BASE = `https://api.openweathermap.org/data/2.5/`


// ! API LAYER

// ? to get the weather data

async function fetchWeatherData(city) {
  try {
    const res = await fetch(`${API_BASE}weather?q=${city}&appid=${API_KEY}&units=metric`)

    // ? check if the network is ok 

    if (!res.ok) throw new Error("something went wrong, try again!");
    const data = await res.json();
    return data;
  }
  catch (err) {
    console.log(err.message)
  }
}

fetchWeatherData("kathmandu");



// ? to get the weather forecaset for many days

async function fetchWeatherForecast(city) {
  try {
    const res = await fetch(`${API_BASE}forecast?q=${city}&appid=${API_KEY}&units=metric`)

    if (!res.ok) throw new Error("something went wrong, please try again in a few minutes!");

    const data = await res.json()
    return data;
  }
  catch (err) {
    console.log(err.message)
  }
}



// * Manager Function 

async function getCityWeather(city) {
  try {
    const [curWeather, forecastData] = await Promise.all([fetchWeatherData(city), fetchWeatherForecast(city)]);
    renderWeatherData(curWeather, forecastData)
  }
  catch (err) {
    console.log(err.message)
  }
}


// * to render the weather data

function renderWeatherData(weatherData, forecastData) {
  weatherSection.classList.remove("hidden");
  console.log("Current:", weatherData);
  console.log("Forecast:", forecastData);

  cityName.textContent = weatherData.name;
  temperature.textContent = Math.round(weatherData.main.temp) + "°C";

  const dateObj = new Date(weatherData.dt * 1000); // Convert seconds to ms
  const dateString = dateObj.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
  currentDate.textContent = dateString;
  country.textContent = weatherData.sys.country
  weatherDesc.textContent = weatherData.weather[0].description
  feelsLike.textContent = "Feels like " + Math.round(weatherData.main.feels_like) + "°C"
  humidity.textContent = weatherData.main.humidity + "%"
  windSpeed.textContent = weatherData.wind.speed + " km/h"
  visibility.textContent = Math.round(weatherData.visibility / 1000) + " km"
  pressure.textContent = weatherData.main.pressure + " hPa"
}

fetchWeatherForecast("kathmandu")