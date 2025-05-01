async function initializeWeather() {
    try {
      console.log('☁️ Fetching weather data...');
      const weatherUrl = `${CONFIG.CORS_PROXY}https://api.openweathermap.org/data/2.5/weather?zip=${CONFIG.DEFAULT_LOCATION},US&appid=${CONFIG.WEATHER_API_KEY}&units=imperial`;
  
      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
  
      const data = await response.json();
      console.log('[Weather Data]', data);
  
      const parsed = parseWeather(data);
      updateWeatherMood(parsed);
    } catch (error) {
      console.error('❌ Weather fetch error:', error);
      updateWeatherMood({ mood: 'confused', description: 'Unable to retrieve weather data 🤷‍♂️' });
    }
  }
  
  function parseWeather(data) {
    if (!data || !data.main || !data.weather || !Array.isArray(data.weather)) {
      return { mood: 'confused', description: 'Weather data format invalid 🤔' };
    }
  
    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].main.toLowerCase();
  
    let mood = 'neutral';
    let description = `${capitalize(condition)}, ${temp}°F`;
  
    // Mood mapping
    if (condition.includes('thunderstorm') || condition.includes('rain') || condition.includes('drizzle')) {
      mood = 'gloomy';
    } else if (condition.includes('clear')) {
      mood = 'serene';
    } else if (condition.includes('snow') || condition.includes('sleet')) {
      mood = 'melancholy';
    } else if (condition.includes('cloud')) {
      mood = 'pensive';
    } else if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) {
      mood = 'neutral';
      description = `Foggy, ${temp}°F`;
    }
  
    return { mood, description };
  }
  
  function updateWeatherMood({ mood, description }) {
    const weatherEl = document.getElementById('weather-status');
    if (weatherEl) {
      weatherEl.textContent = `🌤️ ${description}`;
    }
  
    window.dispatchEvent(new CustomEvent('moodUpdate', {
      detail: { type: 'weather', mood, description }
    }));
  }
  
  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  