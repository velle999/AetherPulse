document.addEventListener("DOMContentLoaded", () => {
  console.log("🌌 AetherPulse initialized.");

  // Wait for a user interaction to enable audio playback
  document.addEventListener("click", () => {
    initializeAudio(); // prevents autoplay block
  }, { once: true });

  // Initialize all systems
  initializeWeather();     // weather.js
  initializeStocks();      // stock.js
  generateMood();          // moodEngine.js
  initializeCanvas();      // canvasEngine.js
});
