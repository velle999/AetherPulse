// weather.js — Fetches weather and updates mood and fox appearance

const weatherStatusEl = document.getElementById('weather-status');
let lastWeatherMood = null;
let currentTempC = null;
let isCelsius = true;

// 🌡️ Show temperature and bind toggle once
function displayTemperature(tempC) {
  currentTempC = tempC;
  isCelsius = true;

  const valueEl = document.getElementById('temp-value');
  const unitEl = document.getElementById('temp-unit');

  if (!valueEl || !unitEl) return;

  valueEl.textContent = Math.round(tempC);
  unitEl.textContent = '°C';

  // Bind toggle click only once
  if (!unitEl.dataset.bound) {
    unitEl.addEventListener('click', toggleTemperatureUnit);
    unitEl.dataset.bound = "true";
  }
}

// 🌡️ Toggle between Celsius and Fahrenheit
function toggleTemperatureUnit() {
  const valueEl = document.getElementById('temp-value');
  const unitEl = document.getElementById('temp-unit');
  if (!valueEl || !unitEl || currentTempC === null) return;

  if (isCelsius) {
    const f = (currentTempC * 9) / 5 + 32;
    valueEl.textContent = Math.round(f);
    unitEl.textContent = '°F';
    isCelsius = false;
  } else {
    valueEl.textContent = Math.round(currentTempC);
    unitEl.textContent = '°C';
    isCelsius = true;
  }
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

    // ⛅ Weather icon
    let icon = '⛅';
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) icon = '☔';
    else if (condition.includes('snow')) icon = '❄️';
    else if (condition.includes('clear')) icon = '😎';
    else if (condition.includes('cloud')) icon = '☁️';

    if (weatherStatusEl) weatherStatusEl.textContent = icon;

    // 🎨 Update fox sprite
    if (typeof updateFoxAppearance === 'function') {
      updateFoxAppearance(condition);
    }

    // 🌡️ Show and bind temperature toggle
    displayTemperature(tempC);

    // 🧠 Mood logic
    let moodVal = 0;
    if (['rain', 'drizzle', 'thunderstorm', 'snow'].some(w => condition.includes(w))) moodVal = -1;
    else if (condition.includes('clear')) moodVal = 1;

    lastWeatherMood = moodVal;

    const moodDescription = `${description}, ${Math.round(tempC)}°C (feels like ${Math.round(feelsC)}°C)`;
    setWeatherMood(moodVal, moodDescription);

  } catch (err) {
    console.error('🌩️ Weather fetch failed, using last known mood.', err);
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

// 🔁 Schedule updates every 10 min
function startWeatherUpdates() {
  fetchWeatherData();
  setInterval(fetchWeatherData, 10 * 60 * 1000);
}

// 🎭 Mood conversion
function moodFromValue(val) {
  if (val >= 1) return 'serene';
  if (val <= -1) return 'gloomy';
  return 'neutral';
}

function setWeatherMood(val, description) {
  window.dispatchEvent(new CustomEvent("moodUpdate", {
    detail: {
      type: "weather",
      mood: moodFromValue(val),
      description
    }
  }));
}

// 🌍 Export to global namespace
if (typeof weather === 'undefined') {
  var weather = {};
}
weather.start = startWeatherUpdates;
