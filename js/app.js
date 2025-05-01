// ✅ Avoid redeclaration across modules
if (typeof window.audioInitialized === 'undefined') {
  window.audioInitialized = false;
}
if (typeof window.currentTempC === 'undefined') {
  window.currentTempC = null;
  window.isCelsius = true;
}
if (!Array.isArray(window.moodQueue)) {
  window.moodQueue = [];
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌌 AetherPulse initialized.");

  // 🎧 Unlock audio system on first user click
  document.addEventListener("click", () => safeInit("initializeAudio"), { once: true });

  // 🌦️ Weather + Core systems
  if (typeof weather?.start === "function") {
    try {
      weather.start();
    } catch (err) {
      console.error("❌ Error running weather.start():", err);
    }
  } else {
    console.warn("⚠️ weather.start() is not defined.");
  }

  safeInit("initializeStocks");
  safeInit("generateMood");
  safeInit("initializeCanvas");
});

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
}

// 🔊 Audio Setup
function initializeAudio() {
  if (window.audioInitialized) return;
  window.audioInitialized = true;

  console.log("🔊 Audio system initializing...");

  document.getElementById('test-audio')?.addEventListener('click', () => {
    console.log('🧪 Playing test mood: pensive');
    playMoodAudio?.('pensive');
  });

  const moodSounds = {
    euphoric: 'audio/euphoric.mp3',
    serene: 'audio/serene.mp3',
    neutral: 'audio/neutral.mp3',
    pensive: 'audio/pensive.mp3',
    melancholy: 'audio/melancholy.mp3',
    gloomy: 'audio/gloomy.mp3',
    panic: 'audio/panic.mp3'
  };

  window.playMoodAudio = function (mood) {
    const src = moodSounds[mood?.trim().toLowerCase()];
    if (!src) {
      console.warn(`⚠️ No audio defined for mood: ${mood}`);
      return;
    }

    const audio = new Audio(src);
    audio.volume = 0.6;

    audio.play()
      .then(() => console.log(`🎶 Playing mood audio: ${mood}`))
      .catch(err => console.warn(`🔇 Audio playback failed for ${mood}:`, err));
  };

  if (window.moodQueue.length) {
    const lastMood = window.moodQueue.pop();
    console.log(`🎶 Replaying last queued mood: ${lastMood}`);
    window.playMoodAudio(lastMood);
  }

  console.log("🎧 Audio engine ready.");
}

// 🎭 Mood-to-Effect Trigger
function triggerMoodEffects(mood) {
  console.log(`✨ Mood effect triggered for: ${mood}`);
  setMoodGradient?.(mood);

  if (window.audioInitialized) {
    playMoodAudio?.(mood);
  } else {
    console.warn(`🔇 Audio not initialized — queuing "${mood}"`);
    window.moodQueue.push(mood);
  }

  handleFoxMoodAnimation(mood);
}

// 🦊 Fox Animation Handler
function handleFoxMoodAnimation(mood) {
  const fox = document.getElementById('fox');
  if (!fox) return;

  fox.classList.remove('fox-happy', 'fox-panic', 'fox-sleep', 'fox-walk');

  switch (mood) {
    case 'euphoric':
    case 'serene':
      fox.classList.add('fox-happy');
      burstFoxParticles();
      break;
    case 'panic':
      fox.classList.add('fox-panic');
      break;
    case 'melancholy':
    case 'gloomy':
      fox.classList.add('fox-sleep');
      break;
  }

  if (Math.random() < 0.3) {
    fox.classList.add('fox-walk');
    setTimeout(() => fox.classList.remove('fox-walk'), 20000);
  }
}

// ✨ Fox Sparkle Burst
function burstFoxParticles() {
  const container = document.getElementById('fox-particles');
  if (!container) return;

  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.setProperty('--x', `${Math.random() * 100 - 50}px`);
    particle.style.setProperty('--y', `${Math.random() * -100}px`);
    container.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

// 🧊 Weather-Based Fox Sprite
function updateFoxAppearance(condition) {
  const fox = document.getElementById('fox');
  if (!fox) return;

  switch (condition) {
    case 'Rain':
    case 'Thunderstorm':
      fox.src = 'assets/fox-umbrella.png';
      fox.alt = 'Fox with umbrella';
      break;
    case 'Snow':
    case 'Cold':
      fox.src = 'assets/fox-scarf.png';
      fox.alt = 'Fox with scarf';
      break;
    case 'Clear':
    case 'Sunny':
      fox.src = 'assets/fox-shades.png';
      fox.alt = 'Cool fox with shades';
      break;
    default:
      fox.src = 'assets/fox.png';
      fox.alt = 'Default fox';
      break;
  }
}

// 🌡️ Temperature Display & Toggle
function toggleTemperatureUnit() {
  const tempValueEl = document.getElementById('temp-value');
  const tempUnitEl = document.getElementById('temp-unit');
  if (!tempValueEl || !tempUnitEl || window.currentTempC === null) return;

  if (window.isCelsius) {
    const f = (window.currentTempC * 9) / 5 + 32;
    tempValueEl.textContent = Math.round(f);
    tempUnitEl.textContent = '°F';
  } else {
    tempValueEl.textContent = Math.round(window.currentTempC);
    tempUnitEl.textContent = '°C';
  }

  window.isCelsius = !window.isCelsius;
}