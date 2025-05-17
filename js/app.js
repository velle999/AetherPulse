// ✅ Global Mood + Audio + Temp State
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
if (!Array.isArray(window.activeConflictZones)) {
  window.activeConflictZones = [];
}
if (typeof window.globalConflictRisk === 'undefined') {
  window.globalConflictRisk = 0;
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
  safeInit("fetchNewsMood");
  safeInit("generateMood");
  safeInit("initializeCanvas");
  safeInit("initializeZoneMonitor");
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

// 🧭 Conflict Zone Panel
function initializeZoneMonitor() {
  const toggle = document.createElement('button');
  toggle.id = 'zone-monitor-toggle';
  toggle.textContent = '🛰️ Toggle Conflict Panel';
  Object.assign(toggle.style, {
    position: 'fixed', bottom: '20px', right: '20px', zIndex: '9999',
    background: '#000', border: '1px solid #00fff0', color: '#00fff0',
    padding: '8px 12px', cursor: 'pointer', borderRadius: '6px'
  });
  document.body.appendChild(toggle);

  const panel = document.createElement('div');
  panel.id = 'zone-monitor';
  Object.assign(panel.style, {
    position: 'absolute',
    top: '180px',
    left: '20px',
    width: '340px',
    padding: '15px',
    zIndex: '3',
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#00fff0',
    border: '1px solid #00fff0',
    borderRadius: '8px',
    boxShadow: '0 0 10px #00fff0',
    transition: 'opacity 0.5s ease, transform 0.5s ease, background 1s ease',
    opacity: '1',
    transform: 'translateY(0)',
    fontFamily: 'Courier New, monospace',
    display: 'block'
});

  // 🌈 Sync conflict panel color to current mood
  window.setMoodGradient = (function (original) {
    return function(mood) {
      original?.(mood);
      const moodMap = {
        euphoric: '#00ffe7',
        serene: '#0099cc',
        pensive: '#999999',
        melancholy: '#34495e',
        gloomy: '#3b3b3b',
        panic: '#8e0000',
        neutral: '#888888'
      };
      panel.style.borderColor = moodMap[mood] || '#00fff0';
      panel.style.boxShadow = `0 0 10px ${moodMap[mood] || '#00fff0'}`;
    };
  })(window.setMoodGradient);
  panel.innerHTML = '<h2>🛰️ Conflict Zones</h2><div id="zone-list">Loading...</div>';
  document.body.appendChild(panel);

  toggle.onclick = () => {
    if (panel.style.opacity === '0') {
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    } else {
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(20px)';
    }
  };
}


function updateZoneMonitor(zones) {
  window.activeConflictZones = zones;
  const list = document.getElementById('zone-list');
  if (!list) return;

  if (!zones.length) {
    list.innerHTML = '<p>No active conflicts.</p>';
    return;
  }

  list.innerHTML = zones.map(zone => `
    <div class="zone-item ${zone.risk.toLowerCase()}">
      <strong>${zone.name}</strong><br/>
      Risk: <span>${zone.risk}</span><br/>
      <strong>Troops:</strong> ${zone.troops ?? 'Unknown'}<br/>
      <button onclick="narrateZone('${zone.name}', '${zone.description}')">🎧 Narrate</button>
      <button onclick="muteZone('${zone.name}')">🙊 Mute</button>
      <button onclick="focusZone('${zone.name}')">🎯 Focus</button>
    </div>`).join('');

  // 🔁 Sync mood based on conflict risk
  let totalRisk = 0;
  zones.forEach(zone => {
    switch (zone.risk) {
      case "High": totalRisk += 3; break;
      case "Medium": totalRisk += 2; break;
      case "Elevated": totalRisk += 1; break;
      default: break;
    }
  });

  const avgRisk = zones.length ? totalRisk / zones.length : 0;
  window.globalConflictRisk = avgRisk;

  const panel = document.getElementById('zone-monitor');
  if (panel) {
    if (avgRisk > 0.5) {
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    } else {
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(20px)';
    }
  }

  if (avgRisk > 2.5) {
    triggerMoodEffects("panic");
  } else if (avgRisk > 1.5) {
    triggerMoodEffects("melancholy");
  } else if (avgRisk > 0.5) {
    triggerMoodEffects("pensive");
  } else {
    triggerMoodEffects("serene");
  }
}

function narrateZone(name, description) {
  const utterance = new SpeechSynthesisUtterance(`${name}. ${description}`);
  utterance.rate = 0.9;
  utterance.pitch = 0.8;
  speechSynthesis.speak(utterance);
}

function muteZone(name) {
  console.log(`🙊 Muting zone: ${name}`);
  // implement mute logic
}

function focusZone(name) {
  console.log(`🎯 Focusing view on zone: ${name}`);
  // implement map zoom/pulse highlight
}

// 🔊 Audio Setup
// [unchanged below here]
