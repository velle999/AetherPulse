document.addEventListener("DOMContentLoaded", () => {
  console.log("🌌 AetherPulse initialized.");

  // Enable audio playback after the first user interaction (required by many browsers)
  document.addEventListener("click", () => {
    if (typeof initializeAudio === "function") {
      initializeAudio();
    } else {
      console.warn("⚠️ initializeAudio() is not defined.");
    }
  }, { once: true });

  // Initialize core systems with safety checks
  if (typeof initializeWeather === "function") {
    initializeWeather(); // weather.js
  } else {
    console.warn("⚠️ initializeWeather() is not defined.");
  }

  if (typeof initializeStocks === "function") {
    initializeStocks(); // stock.js
  } else {
    console.warn("⚠️ initializeStocks() is not defined.");
  }

  if (typeof generateMood === "function") {
    generateMood(); // moodEngine.js
  } else {
    console.warn("⚠️ generateMood() is not defined.");
  }

  if (typeof initializeCanvas === "function") {
    initializeCanvas(); // canvasEngine.js
  } else {
    console.warn("⚠️ initializeCanvas() is not defined.");
  }
});

