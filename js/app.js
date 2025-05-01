document.addEventListener("DOMContentLoaded", () => {
  console.log("🌌 AetherPulse initialized.");

  // Wait for a user click to unlock audio (thanks, browser nanny policies)
  document.addEventListener("click", () => {
    safeInit("initializeAudio");
  }, { once: true });

  // Initialize all systems safely
  safeInit("initializeWeather");   // weather.js
  safeInit("initializeStocks");    // stock.js
  safeInit("generateMood");        // moodengine.js
  safeInit("initializeCanvas");    // canvasengine.js
});

/**
 * Tries to run a function by name if it's defined in the global scope.
 * Otherwise logs a warning to the console so you know what exploded.
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
  // TODO: Add actual canvas setup code here.
}

function initializeAudio() {
  console.log("🔊 Audio initialized (stub)");
  // TODO: Add actual audio setup code here.
}
