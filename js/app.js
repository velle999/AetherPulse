document.addEventListener("DOMContentLoaded", () => {
  console.log("🌌 AetherPulse initialized.");

  // Unlock audio after first user interaction (browser restriction workaround)
  document.addEventListener("click", () => {
    safeInit("initializeAudio");
  }, { once: true });

  // Initialize all major systems
  safeInit("initializeWeather");   // weather.js
  safeInit("initializeStocks");    // stock.js
  safeInit("generateMood");        // moodengine.js
  safeInit("initializeCanvas");    // canvasengine.js
});

/**
 * Safely run a named global function, if it exists.
 * Logs clear errors/warnings to help with debugging.
 */
function safeInit(fnName) {
  const fn = window[fnName];
  if (typeof fn === "function") {
    try {
      fn();
    } catch (err) {
      console.error(`❌ Error running ${fnName}():`, err);
    }
  } else {
    console.warn(`⚠️ ${fnName}() is not defined.`);
  }
}

function initializeCanvas() {
  console.log("🔲 Canvas initialized (stub)");
  // TODO: Add actual canvas rendering logic or animated background.
}

function initializeAudio() {
  console.log("🔊 Audio system initializing...");

  // Global mood-to-audio logic for ambient playback
  window.playMoodAudio = function (mood) {
    const moodSounds = {
      euphoric: 'audio/euphoric.mp3',
      serene: 'audio/serene.mp3',
      neutral: 'audio/neutral.mp3',
      pensive: 'audio/pensive.mp3',
      melancholy: 'audio/melancholy.mp3',
      gloomy: 'audio/gloomy.mp3',
      panic: 'audio/panic.mp3'
    };

    const src = moodSounds[mood];
    if (!src) {
      console.warn(`⚠️ No audio defined for mood: ${mood}`);
      return;
    }

    const audio = new Audio(src);
    audio.volume = 0.6;

    audio.play()
      .then(() => console.log(`🎶 Playing mood audio: ${mood}`))
      .catch(err => console.warn(`🚫 Audio playback failed for ${mood}:`, err));
  };

  console.log("🎧 Audio engine ready.");
}

