let currentMood = {
  weather: null,
  stock: null,
  event: null
};

function generateMood() {
  console.log("🎛️ Mood engine ready...");
  
  // Listen for mood update events
  window.addEventListener('moodUpdate', (e) => {
    const { type, mood, description } = e.detail;
    currentMood[type] = { mood, description };
    updateOverallMood();
  });

  // Optionally trigger an initial fake mood if testing:
  // window.dispatchEvent(new CustomEvent("moodUpdate", {
  //   detail: { type: "weather", mood: "serene", description: "Clear skies ahead." }
  // }));
}

function updateOverallMood() {
const moodEl = document.getElementById('mood-title');
const descEl = document.getElementById('mood-description'); // 🔥 fixed this

  const activeMoods = Object.values(currentMood).filter(Boolean);
  if (activeMoods.length === 0) return;

  const moodWeights = {
    euphoric: 3,
    serene: 2,
    neutral: 1,
    pensive: 0,
    melancholy: -1,
    gloomy: -2,
    panic: -3
  };

  let score = 0;
  let descriptions = [];

  activeMoods.forEach(({ mood, description }) => {
    score += moodWeights[mood] || 0;
    descriptions.push(description);
  });

  let overall = 'neutral';
  if (score >= 4) overall = 'euphoric';
  else if (score >= 2) overall = 'serene';
  else if (score === 1) overall = 'pensive';
  else if (score <= -4) overall = 'panic';
  else if (score <= -2) overall = 'gloomy';
  else if (score < 0) overall = 'melancholy';

  // Update DOM
  if (moodEl) moodEl.textContent = `Current Mood: ${overall.toUpperCase()}`;
  if (descEl) descEl.textContent = descriptions.join(' | ');

  // Fire up ambient mood FX
  triggerMoodEffects(overall);
}

function triggerMoodEffects(mood) {
  console.log(`✨ Mood effect triggered for: ${mood}`);
  if (typeof setMoodGradient === "function") setMoodGradient(mood);
  if (typeof playMoodAudio === "function") playMoodAudio(mood);
}

