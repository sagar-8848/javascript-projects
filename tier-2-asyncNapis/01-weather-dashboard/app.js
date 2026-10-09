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

// * emoji for weather for different conditions 
const weatherEmojis = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Drizzle: "🌦️"
};

// ! API LAYER

// ? to get the weather data
async function fetchWeatherData(city, signal) {
  const res = await fetch(`${API_BASE}weather?q=${city}&appid=${API_KEY}&units=metric`, { signal })

  if (!res.ok) {
    if (res.status === 404) throw new Error("city not found!");
    throw new Error("Server Error, please try again after sometimes.")
  }
  const data = await res.json();
  return data;
}

// * for the abort controller
let abortController;

// ? to get the weather forecaset for many days
async function fetchWeatherForecast(city, signal) {
  const res = await fetch(`${API_BASE}forecast?q=${city}&appid=${API_KEY}&units=metric`, { signal })

  if (!res.ok) {
    if (res.status === 404) throw new Error("city not found!");
    throw new Error("Server Error, please try again after sometimes.")
  }

  const data = await res.json()
  return data;
}

// * debounce function 
function debounce(cb, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      cb()
    }, delay)
  }
}

// * Manager Function 
async function getCityWeather(city) {
  try {
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()
    showLoading()
    const [curWeather, forecastData] = await Promise.all([fetchWeatherData(city, abortController.signal), fetchWeatherForecast(city, abortController.signal)]);
    renderWeatherData(curWeather, forecastData)
    forecastWeather(forecastData)

    localStorage.setItem("lastCity", city)
    hideLoading()
    showToast("Weather loaded successfully!", "success")

  }
  catch (err) {
    if (err.name === "AbortError") return;
    showError(err.message)
    showToast(err.message, "error")
  }
}

// * applying debounce function 
searchInput.addEventListener("input", debounce(() => {
  const searchValue = searchInput.value.trim();
  if (searchValue === "") return;
  getCityWeather(searchValue)
}, 500))

// * to render the weather data
function renderWeatherData(weatherData, forecastData) {
  weatherSection.classList.remove("hidden");

  cityName.textContent = weatherData.name;
  temperature.textContent = Math.round(weatherData.main.temp) + "°C";

  weatherIcon.textContent = `${weatherEmojis[weatherData.weather[0].main] || "🌤️"} `

  const dateObj = new Date(weatherData.dt * 1000);
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

// * to render the forecast data
function forecastWeather(forecastData) {
  forecastContainer.innerHTML = "";

  forecastData.list.forEach((curDay) => {
    if (curDay.dt_txt.includes("12:00:00")) {
      const card = document.createElement("div");
      card.classList.add("forecast-card");

      const dayName = new Date(curDay.dt_txt).toLocaleDateString("en-US", { weekday: 'short' });

      const day = document.createElement("span");
      day.classList.add("forecast-card__day");
      day.textContent = dayName;

      const emoji = document.createElement("span");
      emoji.classList.add("forecast-card__icon");
      emoji.textContent = weatherEmojis[curDay.weather[0].main] || "🌤️";

      const temp = document.createElement("span");
      temp.classList.add("forecast-card__temp")
      temp.textContent = Math.round(curDay.main.temp) + "°C";

      const desc = document.createElement("span");
      desc.classList.add("forecast-card__desc");
      desc.textContent = curDay.weather[0].description;

      card.appendChild(day);
      card.appendChild(emoji);
      card.appendChild(temp);
      card.appendChild(desc);

      forecastContainer.append(card)
    }
  })
}

function showError(message) {
  loading.classList.add("hidden")
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden")
  weatherSection.classList.add("hidden")
}

// * to show the loading 
function showLoading() {
  loading.classList.remove("hidden")
  weatherSection.classList.add("hidden")
  emptyState.classList.add("hidden")
  errorMsg.classList.add("hidden")
}

function hideLoading() {
  loading.classList.add("hidden")
  weatherSection.classList.remove("hidden")
  emptyState.classList.add("hidden");
}

// ? toast function to show the message 
let toastTimer;
function showToast(msg, type = "success") {
  clearTimeout(toastTimer);
  toastMsg.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove("hidden");
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}

function init() {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    getCityWeather(lastCity)
  }
}

init()