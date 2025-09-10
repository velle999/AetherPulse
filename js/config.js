// config.js — Global constants for AetherPulse

const CONFIG = {
  // 🌦️ Weather Settings
  WEATHER_API_KEY: 'c8e85b9c5cd854c7aac3bb9042e0801b',
  DEFAULT_CITY: 'Washington',
  DEFAULT_ZIP: '63090',

  // 📈 Stock Market Settings
  STOCK_API_KEY: 'L2MPSNN4NXEVCJCN',
  DEFAULT_STOCK: 'NVDA',

  // 🛰️ OpenSky Network Settings
  OPENSKY: {
    CLIENT_ID: 'velle999-api-client',
    CLIENT_SECRET: 'zZ24Y1rFYvDEVsATLrtr7mZzbx1yznIO'  // ← Replace with your REAL client secret
  },

  // 🌐 Networking
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',

  // 🎭 Mood Engine Timing
  MOOD_INTERVAL_MS: 60 * 1000
};