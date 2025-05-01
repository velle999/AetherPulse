let currentMood = {
  weather: null,
  stock: null,
  event: null
};

function generateMood() {
  console.log("🎛️ Mood engine ready...");

  window.addEventListener('moodUpdate', (e) => {
    const { type, mood, description } = e.detail;
    currentMood[type] = { mood, description };
    updateOverallMood();
  });

  // Optional test injection
  // window.dispatchEvent(new CustomEvent("moodUpdate", {
  //   detail: { type: "weather", mood: "serene", description: "Clear skies ahead." }
  // }));
}

function updateOverallMood() {
  const moodEl = document.getElementById('mood-title');
  const descEl = document.getElementById('mood-description');

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

  // Update UI
  if (moodEl) moodEl.textContent = `Current Mood: ${overall.toUpperCase()}`;
  if (descEl) descEl.textContent = descriptions.join(' | ');

  triggerMoodEffects(overall);
}

function triggerMoodEffects(mood) {
  console.log(`✨ Mood effect triggered for: ${mood}`);

  if (typeof setMoodGradient === 'function') setMoodGradient(mood);
  if (typeof playMoodAudio === 'function') playMoodAudio(mood);

  handleFoxMoodAnimation(mood);
}

// 🦊 Fox Reaction System

function handleFoxMoodAnimation(mood) {
  const fox = document.getElementById('fox');
  if (!fox) return;

  fox.classList.remove('fox-happy', 'fox-panic', 'fox-sleep');

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

// 🎨 Weather-based fox image swap
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
