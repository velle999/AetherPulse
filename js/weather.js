// weather.js — Fetches weather and updates mood and fox appearance

const weatherStatusEl = document.getElementById('weather-status');
let lastWeatherMood = null;

// Ensure global state is initialized
if (typeof window.currentTempC === 'undefined') window.currentTempC = null;
if (typeof window.isCelsius === 'undefined') window.isCelsius = true;

// 🌡️ Display temperature and bind toggle once
function displayTemperature(tempC) {
  window.currentTempC = tempC;
  const valueEl = document.getElementById('temp-value');
  const unitBtn = document.getElementById('temp-unit');
  if (!valueEl || !unitBtn) return;

  // Always display Celsius first
  window.isCelsius = true;
  valueEl.textContent = Math.round(tempC);
  unitBtn.textContent = '°C';

  // Attach click toggle if not already
  if (!unitBtn.dataset.bound) {
    unitBtn.addEventListener('click', toggleTemperatureUnit);
    unitBtn.dataset.bound = 'true';
  }
}

// 🌡️ Celsius ↔ Fahrenheit toggle
function toggleTemperatureUnit() {
  const valueEl = document.getElementById('temp-value');
  const unitBtn = document.getElementById('temp-unit');
  if (!valueEl || !unitBtn || window.currentTempC === null) return;

  if (window.isCelsius) {
    const f = (window.currentTempC * 9) / 5 + 32;
    valueEl.textContent = Math.round(f);
    unitBtn.textContent = '°F';
  } else {
    valueEl.textContent = Math.round(window.currentTempC);
    unitBtn.textContent = '°C';
  }

  window.isCelsius = !window.isCelsius;
}

// ☁️ Weather fetcher
async function fetchWeatherData() {
  try {
    const apiKey = typeof weatherApiKey !== 'undefined' ? weatherApiKey : CONFIG.WEATHER_API_KEY;
    const city = typeof weatherCity !== 'undefined' ? weatherCity : CONFIG.DEFAULT_CITY || 'New York';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather fetch error');

    const data = await response.json();
    const condition = data.weather[0].main.toLowerCase();
    const description = data.weather[0].description;
    const tempC = data.main.temp;
    const feelsC = data.main.feels_like;

    // 🌡️ Display temp and setup toggle
    displayTemperature(tempC);

    // ⛅ Icon
    let icon = '⛅';
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) icon = '☔';
    else if (condition.includes('snow')) icon = '❄️';
    else if (condition.includes('clear')) icon = '😎';
    else if (condition.includes('cloud')) icon = '☁️';
    if (weatherStatusEl) weatherStatusEl.textContent = icon;

    // 🦊 Update companion
    if (typeof updateFoxAppearance === 'function') {
      updateFoxAppearance(condition);
    }

    // 🧠 Mood determination
    let moodVal = 0;
    if (['rain', 'drizzle', 'thunderstorm', 'snow'].some(w => condition.includes(w))) moodVal = -1;
    else if (condition.includes('clear')) moodVal = 1;

    lastWeatherMood = moodVal;

    const moodDescription = `${description}, ${Math.round(tempC)}°C (feels like ${Math.round(feelsC)}°C)`;
    setWeatherMood(moodVal, moodDescription);

  } catch (err) {
    console.error('🌩️ Weather fetch failed. Using last known mood.', err);
    const fallbackMood = moodFromValue(lastWeatherMood ?? 0);
    window.dispatchEvent(new CustomEvent("moodUpdate", {
      detail: {
        type: "weather",
        mood: fallbackMood,
        description: "Using cached weather mood."
      }
    }));
  }
}

// 🔁 Auto-fetch every 10 minutes
function startWeatherUpdates() {
  fetchWeatherData();
  setInterval(fetchWeatherData, 10 * 60 * 1000);
}

// 🎭 Mood value to string
function moodFromValue(val) {
  if (val >= 1) return 'serene';
  if (val <= -1) return 'gloomy';
  return 'neutral';
}

// 📡 Dispatch mood event
function setWeatherMood(val, description) {
  window.dispatchEvent(new CustomEvent("moodUpdate", {
    detail: {
      type: "weather",
      mood: moodFromValue(val),
      description
    }
  }));
}

// 🌐 Export globally
if (typeof weather === 'undefined') {
  var weather = {};
}
weather.start = startWeatherUpdates;
