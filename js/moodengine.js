let currentMood = {
    weather: null,
    stock: null,
    event: null
  };
  
  function generateMood() {
    window.addEventListener('moodUpdate', (e) => {
      const { type, mood, description } = e.detail;
  
      // Save the latest mood from each source
      currentMood[type] = { mood, description };
      updateOverallMood();
    });
  }
  
  function updateOverallMood() {
    const moodEl = document.getElementById('mood-title');
    const descEl = document.getElementById('mood-desc');
  
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
  
    // Trigger canvas/audio updates
    triggerMoodEffects(overall);
  }
  
  function triggerMoodEffects(mood) {
    console.log(`✨ Mood effect triggered for: ${mood}`);
    setMoodGradient(mood);
    playMoodAudio(mood);
  
    // TODO: animate fox, shift lighting, spawn particles, etc.
  }
  
