// config.js — Global constants for AetherPulse

const CONFIG = {
  // 🌦️ Weather Settings
  WEATHER_API_KEY: 'c8e85b9c5cd854c7aac3bb9042e0801b',  // OpenWeatherMap API key
  DEFAULT_CITY: 'Washington',                           // City fallback for weather
  DEFAULT_ZIP: '63090',                                 // Optional ZIP fallback

  // 📈 Stock Market Settings
  STOCK_API_KEY: 'L2MPSNN4NXEVCJCN',                    // Alpha Vantage API key
  DEFAULT_STOCK: 'NVDA',                                // Default ticker symbol

  // 🌐 Networking
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',    // Public CORS proxy

  // 🎭 Mood Engine Timing
  MOOD_INTERVAL_MS: 60 * 1000                           // Mood recalculation interval (in ms)
};
