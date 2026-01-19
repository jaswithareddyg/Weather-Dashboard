# 🌦️ Weather Dashboard

A modern, real-time **multi-city weather dashboard** built with **vanilla HTML, CSS, and JavaScript**.  
It uses the **Open-Meteo API** (no API key required) to fetch live weather data and automatically refreshes every 30 seconds.


## ✨ Features

- 🌍 Track weather for multiple cities worldwide
- 🔄 Real-time polling (auto-refresh every 30 seconds)
- ⏸ Pause / Resume live updates
- ➕ Add new cities dynamically (with geocoding)
- ❌ Remove cities from the dashboard
- 🌡️ Toggle temperature units (°C / °F)
- 📊 Displays:
  - Temperature
  - Feels-like temperature
  - Humidity
  - Wind speed
  - Precipitation
- 🎨 Clean, dark UI with subtle animations
- 🚫 No API keys required


## 🧱 Tech Stack

- **HTML5**
- **CSS3** (CSS variables, animations, grid layout)
- **Vanilla JavaScript (ES6+)**
- **Open-Meteo API**
- **Open-Meteo Geocoding API**


## 📁 Project Structure
    ├── index.html
    ├── LICENSE
    ├── README.md
    ├── script.js
    └── style.css

## Weather Data Source

 - Forecast API:
https://api.open-meteo.com

 - Geocoding API:
https://geocoding-api.open-meteo.com

## ⚠️ Error Handling

 - API failures show a styled error card

 - Automatically retries on the next polling cycle

 - UI remains responsive