const moodAudio = {};
let currentAudio = null;
let audioInitialized = false;

function initializeAudio() {
  if (audioInitialized) return;
  audioInitialized = true;

  const moods = [
    'serene',
    'euphoric',
    'melancholy',
    'panic',
    'gloomy',
    'neutral',
    'pensive'
  ];

  moods.forEach(mood => {
    const audio = new Audio(`assets/audio/${mood}.mp3`);
    audio.loop = true;
    audio.volume = 0.6;
    moodAudio[mood] = audio;
  });

  console.log('🔊 Audio engine initialized');
}

function playMoodAudio(mood) {
  const audio = moodAudio[mood];

  if (!audio) {
    console.warn(`⚠️ No audio defined for mood: ${mood}`);
    return;
  }

  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentAudio = audio;
  currentAudio.play().catch(err => {
    console.warn('🔇 Audio playback blocked (likely due to autoplay policy):', err);
  });
}
