const moodAudio = {};
let currentAudio = null;
let audioInitialized = false;

function initializeAudio() {
  if (audioInitialized) return;
  audioInitialized = true;

  // Add all mood keys that could be triggered from the mood engine
  const moods = [
    'serene',
    'euphoric',
    'melancholy',
    'panic',
    'gloomy',
    'neutral',
    'pensive',
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
  if (!moodAudio[mood]) {
    console.warn(`⚠️ No audio defined for mood: ${mood}`);
    return;
  }

  if (currentAudio && currentAudio !== moodAudio[mood]) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentAudio = moodAudio[mood];
  currentAudio.play().catch(err => {
    console.warn('🔇 Autoplay blocked — user interaction required.', err);
  });
}

