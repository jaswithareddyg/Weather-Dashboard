// Cities to track (can be customized)
let cities = [
  { name: "New York", lat: 40.7128, lon: -74.006, country: "US" },
  { name: "London", lat: 51.5074, lon: -0.1278, country: "GB" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, country: "JP" },
  { name: "Paris", lat: 48.8566, lon: 2.3522, country: "FR" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, country: "AU" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, country: "AE" },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, country: "SG" },
  { name: "Mumbai", lat: 19.076, lon: 72.8777, country: "IN" },
];

let weatherData = {};
let isPolling = true;
let pollInterval;
let units = "metric";

// Weather icon mapping
const weatherIcons = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
};

// Initialize
async function init() {
  await loadAllWeather();
  startPolling();
}

// Load weather for all cities
async function loadAllWeather() {
  const grid = document.getElementById("weatherGrid");
  grid.innerHTML = "";

  for (const city of cities) {
    const card = createWeatherCard(city.name);
    grid.appendChild(card);
    await fetchWeatherData(city);
  }
}

// Create placeholder card
function createWeatherCard(cityName) {
  const card = document.createElement("div");
  card.className = "weather-card";
  card.id = `card-${cityName.replace(/\s+/g, "-")}`;
  card.innerHTML = `
                <div class="weather-header">
                    <div class="city-name">${cityName}</div>
                    <div class="update-badge">Loading...</div>
                </div>
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            `;
  return card;
}

// Fetch weather data from Open-Meteo API (free, no key needed)
async function fetchWeatherData(city) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=${units === "metric" ? "celsius" : "fahrenheit"}&wind_speed_unit=mph&timezone=auto`,
    );

    const data = await response.json();
    weatherData[city.name] = {
      ...data.current,
      city: city.name,
      timestamp: new Date(),
    };

    updateWeatherCard(city.name);
  } catch (error) {
    console.error(`Error fetching weather for ${city.name}:`, error);
    showErrorCard(city.name);
  }
}

async function geocodeCity(cityName) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`,
  );
  const data = await res.json();
  if (!data.results || !data.results.length) return null;
  return data.results[0];
}

async function addCity() {
  const input = prompt("Enter city name:");
  if (!input) return;

  const cityName = input.trim();

  if (cities.some((c) => c.name.toLowerCase() === cityName.toLowerCase())) {
    alert("City already exists in the dashboard.");
    return;
  }

  const geo = await geocodeCity(cityName);
  if (!geo) {
    alert("City not found. Please check the name and try again.");
    return;
  }

  const city = {
    name: geo.name,
    lat: geo.latitude,
    lon: geo.longitude,
    country: geo.country_code,
  };
  cities.push(city);

  const grid = document.getElementById("weatherGrid");
  grid.appendChild(createWeatherCard(city.name));

  fetchWeatherData(city);
}

// Update weather card with data
function updateWeatherCard(cityName) {
  const data = weatherData[cityName];
  const card = document.getElementById(`card-${cityName.replace(/\s+/g, "-")}`);

  if (!card || !data) return;

  card.classList.add("updating");
  setTimeout(() => card.classList.remove("updating"), 300);

  const cityObj = cities.find((c) => c.name === cityName);

  const displayFlag = cityObj?.country
    ? countryCodetoFlag(cityObj.country)
    : "";

  const weatherDesc = getWeatherDescription(data.weather_code);
  const icon = getWeatherIcon(data.weather_code);
  const tempUnit = units === "metric" ? "°C" : "°F";

  card.innerHTML = `
                <div class="weather-header">
                    <div class="city-name">
                        ${cityName} ${displayFlag}
                    </div>
                    <div class="update-badge">Just now</div>
                    <button class="remove-city-btn" onclick="removeCity('${cityName}')">
                        ✖
                    </button>
                </div>
                <div class="weather-main">
                    <div class="weather-icon">${icon}</div>
                    <div class="temp-display">
                        <div class="temperature">${Math.round(data.temperature_2m)}${tempUnit}</div>
                        <div class="weather-desc">${weatherDesc}</div>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="detail-item">
                        <div class="detail-label">Feels Like</div>
                        <div class="detail-value">${Math.round(data.apparent_temperature)}${tempUnit}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Humidity</div>
                        <div class="detail-value">${data.relative_humidity_2m}%</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Wind Speed</div>
                        <div class="detail-value">${Math.round(data.wind_speed_10m)} mph</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Precipitation</div>
                        <div class="detail-value">${data.precipitation} mm</div>
                    </div>
                </div>
                <div class="last-updated">Updated ${data.timestamp.toLocaleTimeString()}</div>
            `;
}

// Show error card
function showErrorCard(cityName) {
  const card = document.getElementById(`card-${cityName.replace(/\s+/g, "-")}`);
  if (!card) return;

  card.classList.add("error-card");
  card.innerHTML = `
                <div class="weather-header">
                    <div class="city-name">${cityName}</div>
                    <div class="update-badge">Error</div>
                </div>
                <div style="text-align: center; padding: 2rem; color: var(--accent-red);">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                    <div>Unable to fetch weather data</div>
                    <div style="font-size: 0.875rem; margin-top: 0.5rem; color: var(--text-dim);">
                        Will retry on next update
                    </div>
                </div>
            `;
}

// Weather code to description
function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] || "Unknown";
}

// Weather code to icon
function getWeatherIcon(code) {
  if (code === 0 || code === 1) return "☀️";
  if (code === 2 || code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 85 && code <= 86) return "❄️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

// Polling control
function startPolling() {
  pollInterval = setInterval(async () => {
    if (isPolling) {
      for (const city of cities) {
        await fetchWeatherData(city);
      }
    }
  }, 30000); // 30 seconds
}

function togglePolling() {
  isPolling = !isPolling;
  document.getElementById("pollToggle").textContent = isPolling
    ? "⏸ Pause Updates"
    : "▶ Resume Updates";
  document.getElementById("syncIndicator").style.animationPlayState = isPolling
    ? "running"
    : "paused";
}

async function refreshAll() {
  for (const city of cities) {
    await fetchWeatherData(city);
  }
}

function changeUnits() {
  units = units === "metric" ? "imperial" : "metric";
  document.getElementById("unitToggle").textContent =
    units === "metric" ? "°C → °F" : "°F → °C";
  refreshAll();
}

function removeCity(cityName) {
  cities = cities.filter((city) => city.name !== cityName);
  delete weatherData[cityName];

  const cardId = `card-${cityName.replace(/\s+/g, "-")}`;
  const card = document.getElementById(cardId);
  if (card) card.remove();
}

function countryCodetoFlag(code) {
  if (!code) return "";
  try {
    const countryCode = code.toLowerCase();
    return `<img src="https://flagcdn.com/w40/${countryCode}.png" 
               srcset="https://flagcdn.com/w80/${countryCode}.png 2x" 
               width="20" 
               alt="${code}" 
               style="vertical-align: middle; margin-left: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">`;
  } catch (e) {
    return `(${code})`;
  }
}

// Start
init();
