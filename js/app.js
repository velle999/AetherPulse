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
if (typeof window.militaryFlights === 'undefined') {
  window.militaryFlights = [];
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
  safeInit("initializeMilitaryTracker");
  safeInit("initializeBackgroundMap");
  safeInit("initializeCompanion");
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

// 🎧 Audio Engine with available audio files
function initializeAudio() {
  console.log('🔊 Audio engine initialized');
  window.audioInitialized = true;
  
  // Define available audio files
  const availableMoods = ['gloomy', 'melancholy', 'neutral', 'panic', 'pensive', 'serene'];
  
  // Create audio elements for each mood
  availableMoods.forEach(mood => {
    const audio = new Audio(`assets/${mood}.mp3`);
    audio.preload = 'auto';
    window[mood + 'Audio'] = audio;
    
    // Add error handling for missing files
    audio.onerror = () => {
      console.warn(`⚠️ Audio file not found: assets/${mood}.mp3`);
    };
  });
  
  // Set up audio context
  if (!window.AudioContext) {
    console.warn('❌ Web Audio API not supported');
    return;
  }
  
  window.audioContext = new AudioContext();
  window.audioInitialized = true;
}

function playMoodAudio(mood) {
  // Only play audio for moods that have audio files
  const validMoods = ['gloomy', 'melancholy', 'neutral', 'panic', 'pensive', 'serene'];
  
  if (!validMoods.includes(mood)) {
    console.warn(`⚠️ Mood ${mood} has no audio file`);
    return;
  }
  
  // Check if the audio element exists
  if (window[mood + 'Audio']) {
    try {
      // Stop any existing audio
      window[mood + 'Audio'].pause();
      window[mood + 'Audio'].currentTime = 0;
      
      // Play the audio
      window[mood + 'Audio'].play().catch(e => {
        console.warn(`⚠️ Audio play failed for ${mood}:`, e);
      });
    } catch (error) {
      console.warn(`⚠️ Error playing audio for ${mood}:`, error);
    }
  } else {
    console.warn(`⚠️ No audio defined for mood: ${mood}`);
  }
}

function stopMoodAudio(mood) {
  if (window[mood + 'Audio']) {
    window[mood + 'Audio'].pause();
    window[mood + 'Audio'].currentTime = 0;
  }
}

function triggerMoodEffects(mood) {
  // Only play audio for moods that have audio files
  const validMoods = ['gloomy', 'melancholy', 'neutral', 'panic', 'pensive', 'serene'];
  
  if (validMoods.includes(mood)) {
    playMoodAudio(mood);
  } else {
    console.warn(`⚠️ Mood ${mood} has no audio file`);
  }
  
  // Dispatch mood change event
  window.dispatchEvent(new CustomEvent('moodChange', {
    detail: { mood: mood }
  }));
}

// 🦊 Animated Companion with Mood-Based Fox Assets
function initializeCompanion() {
  const companion = document.getElementById('companion');
  if (!companion) return;
  
  // Create fox image element
  const foxImage = document.getElementById('fox');
  if (!foxImage) return;
  
  // Set initial fox
  setFoxByMood('serene');
  
  // Add event listener for mood changes
  window.addEventListener('moodChange', (event) => {
    const newMood = event.detail?.mood || 'serene';
    setFoxByMood(newMood);
  });
  
  // Update fox when military activity changes
  window.addEventListener('militaryFlightsUpdated', (event) => {
    const flights = event.detail?.flights || [];
    const militaryActivityLevel = calculateMilitaryActivityLevel(flights);
    
    // Determine mood based on military activity
    let mood;
    if (militaryActivityLevel > 15) {
      mood = "panic";
    } else if (militaryActivityLevel > 10) {
      mood = "melancholy";
    } else if (militaryActivityLevel > 5) {
      mood = "pensive";
    } else {
      mood = "serene";
    }
    
    // Update fox based on military activity
    setFoxByMood(mood);
  });
}

function setFoxByMood(mood) {
  const foxImage = document.getElementById('fox');
  if (!foxImage) return;
  
  // Map mood to fox asset
  const foxAssets = {
    'serene': 'fox.png',
    'pensive': 'fox-scarf.png',
    'melancholy': 'fox-scarf.png',
    'gloomy': 'fox-scarf.png',
    'panic': 'fox-umbrella.png',
    'neutral': 'fox.png'
  };
  
  // Default to serene if mood not found
  const assetName = foxAssets[mood] || 'fox.png';
  const assetPath = `assets/${assetName}`;
  
  console.log(`🦊 Changing fox to ${mood} (${assetName})`);
  
  // Update fox image
  foxImage.src = assetPath;
  
  // Add animation based on mood
  animateFox(mood);
}

function animateFox(mood) {
  const foxImage = document.getElementById('fox');
  if (!foxImage) return;

  // Create or reuse a particle container that's attached to the fox
  let foxParticles = document.getElementById('fox-particles');
  if (!foxParticles) {
    foxParticles = document.createElement('div');
    foxParticles.id = 'fox-particles';
    foxParticles.style.position = 'absolute';
    foxParticles.style.left = '0';
    foxParticles.style.top = '0';
    foxParticles.style.width = '100%';
    foxParticles.style.height = '100%';
    foxParticles.style.pointerEvents = 'none';
    foxParticles.style.overflow = 'visible';

    // Wrap fox image in a relative container so particles track with it
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.transform = foxImage.style.transform || 'translate(0,0)';
    wrapper.style.transition = foxImage.style.transition || 'transform 2s linear';
    wrapper.appendChild(foxImage.cloneNode(true)); // clone original fox
    foxImage.replaceWith(wrapper);

    wrapper.appendChild(foxParticles);
    wrapper.id = 'fox-wrapper';
    window.foxWrapper = wrapper;
  } else {
    foxParticles.innerHTML = ''; // clear old particles
  }

  // Decide particle count and color by mood
  const particleCount =
    mood === 'panic' ? 20 :
    mood === 'melancholy' ? 15 :
    mood === 'pensive' ? 10 : 5;

  const color =
    mood === 'panic' ? '#ff0000' :
    mood === 'melancholy' ? '#666666' :
    mood === 'pensive' ? '#ff9900' : '#00fff0';

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${color};
      opacity: 0.7;
      animation: float ${3 + Math.random() * 4}s infinite linear;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 5px ${color};
    `;

    if (mood === 'panic') {
      particle.style.transform += ` rotate(${Math.random() * 360}deg)`;
    }

    foxParticles.appendChild(particle);
  }

  // Add CSS animations once
  if (!document.getElementById('fox-animations')) {
    const style = document.createElement('style');
    style.id = 'fox-animations';
    style.textContent = `
      @keyframes float {
        0% { transform: translateY(0) scale(1); opacity: 0.7; }
        50% { transform: translateY(-15px) scale(1.2); opacity: 0.3; }
        100% { transform: translateY(0) scale(1); opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
  }
}

function startFoxRoaming() {
  const fox = document.getElementById("fox");
  if (!fox) return;

  function roam() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // random target inside viewport with margin
    const x = Math.random() * (vw - 120);
    const y = Math.random() * (vh - 120);

    // mood affects speed + wait time
    const mood = window.currentMood || "serene";
    let duration, wait;

    switch (mood) {
      case "panic": duration = 1.2; wait = 800; break;
      case "melancholy": duration = 4.5; wait = 5000; break;
      case "pensive": duration = 3; wait = 3000; break;
      case "gloomy": duration = 5; wait = 6000; break;
      default: duration = 3.5; wait = 4000; break; // serene/neutral
    }

    // apply speed
    fox.style.transition = `transform ${duration}s linear`;
    fox.style.transform = `translate(${x}px, ${y}px)`;

    // queue next roam
    setTimeout(roam, wait + duration * 1000);
  }

  roam();

  // restart immediately when mood changes
  window.addEventListener("moodChange", roam);
}

document.addEventListener("DOMContentLoaded", startFoxRoaming);

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

// 🛩️ Military Flight Tracking System
function initializeMilitaryTracker() {
  const toggle = document.createElement('button');
  toggle.id = 'military-tracker-toggle';
  toggle.textContent = '✈️ Toggle Military Flights';
  Object.assign(toggle.style, {
    position: 'fixed', 
    bottom: '60px', 
    right: '20px', 
    zIndex: '9999',
    background: '#000', 
    border: '1px solid #ff0080', 
    color: '#ff0080',
    padding: '8px 12px', 
    cursor: 'pointer', 
    borderRadius: '6px'
  });
  document.body.appendChild(toggle);

  const panel = document.createElement('div');
  panel.id = 'military-tracker';
  Object.assign(panel.style, {
    position: 'absolute',
    top: '180px',
    right: '20px',
    width: '340px',
    padding: '15px',
    zIndex: '3',
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#ff0080',
    border: '1px solid #ff0080',
    borderRadius: '8px',
    boxShadow: '0 0 10px #ff0080',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    opacity: '0',
    transform: 'translateY(20px)',
    fontFamily: 'Courier New, monospace',
    display: 'block'
  });

  panel.innerHTML = '<h2>✈️ Military Flights</h2><div id="flight-list">Click to load military flights...</div>';
  document.body.appendChild(panel);

  // Sync with mood system
  window.setMoodGradient = (function (original) {
    return function(mood) {
      original?.(mood);
      const moodMap = {
        euphoric: '#ff00ff',
        serene: '#00ccff',
        pensive: '#ff6600',
        melancholy: '#666666',
        gloomy: '#444444',
        panic: '#ff0000',
        neutral: '#888888'
      };
      panel.style.borderColor = moodMap[mood] || '#ff0080';
      panel.style.boxShadow = `0 0 10px ${moodMap[mood] || '#ff0080'}`;
    };
  })(window.setMoodGradient);

  toggle.onclick = () => {
    if (panel.style.opacity === '0') {
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
      startMilitaryTracking();
    } else {
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(20px)';
      stopMilitaryTracking();
    }
  };

  window.addEventListener('militaryFlightsUpdated', updateMilitaryPanel);
}

function startMilitaryTracking() {
  // Start polling for military flights
  window.militaryTrackingInterval = setInterval(fetchMilitaryFlights, 60000); // Every minute
  fetchMilitaryFlights(); // Initial fetch
}

function stopMilitaryTracking() {
  if (window.militaryTrackingInterval) {
    clearInterval(window.militaryTrackingInterval);
  }
}

async function loadOpenSkyCredentials() {
  // Validate that credentials are set
  if (CONFIG.OPENSKY.CLIENT_SECRET === 'YOUR_ACTUAL_CLIENT_SECRET_HERE') {
    throw new Error(`
      🔐 OpenSky credentials required!
      Please update CONFIG.OPENSKY.CLIENT_SECRET in config.js with your actual client secret.
      Get it from: https://opensky-network.org/index.php?option=com_users&view=profile
    `);
  }
  
  return {
    client_id: CONFIG.OPENSKY.CLIENT_ID,
    client_secret: CONFIG.OPENSKY.CLIENT_SECRET
  };
}

async function getOpenSkyToken(useProxy = false) {
  try {
    // Load credentials
    const credentials = await loadOpenSkyCredentials();
    
    const tokenUrl = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
    
    let tokenResponse;
    
    if (useProxy) {
      // Use CORS proxy for token request
      const proxyUrl = CONFIG.CORS_PROXY || 'https://api.allorigins.win/raw?url=';
      const formData = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: credentials.client_id,
        client_secret: credentials.client_secret
      });
      
      tokenResponse = await fetch(proxyUrl + encodeURIComponent(tokenUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
    } else {
      // Direct request
      tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: credentials.client_id,
          client_secret: credentials.client_secret
        })
      });
    }

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
    
  } catch (error) {
    console.error('❌ Error getting OpenSky token:', error);
    throw error;
  }
}

function processFlightData(states) {
  // Filter for military aircraft
  const militaryFlights = parseMilitaryFlights(states);
  window.militaryFlights = militaryFlights;
  
  // Trigger update event
  window.dispatchEvent(new CustomEvent('militaryFlightsUpdated', {
    detail: { flights: militaryFlights }
  }));
  
  // Integrate with your mood system - THIS IS THE KEY INTEGRATION
  updateMoodFromMilitaryActivity(militaryFlights);
}

function calculateMilitaryActivityLevel(flights) {
  // Calculate military activity level based on flight risk and quantity
  const highRiskFlights = flights.filter(f => f.risk.level >= 4).length;
  const mediumRiskFlights = flights.filter(f => f.risk.level === 3).length;
  const elevatedRiskFlights = flights.filter(f => f.risk.level === 2).length;
  const lowRiskFlights = flights.filter(f => f.risk.level === 1).length;
  
  return (highRiskFlights * 4) + 
         (mediumRiskFlights * 3) + 
         (elevatedRiskFlights * 2) + 
         (lowRiskFlights * 1);
}

// Also update the fetchMilitaryFlights function to request specific region
async function fetchMilitaryFlights() {
  try {
    const list = document.getElementById('flight-list');
    if (list) list.innerHTML = '<p>📡 Fetching military flights in conflict zone...</p>';

    // Try to fetch with bounding box for Eastern Europe
    const bboxParams = '?lamin=35&lomin=20&lamax=55&lomax=60';
    
    // Try anonymous access first with bounding box
    try {
      const response = await fetch(`https://opensky-network.org/api/states/all${bboxParams}`);
      
      if (response.ok) {
        const data = await response.json();
        processFlightData(data.states);
        return;
      }
    } catch (anonymousError) {
      console.log('Anonymous access with bounding box failed, trying authenticated access...');
    }

    // Try authenticated access with bounding box
    try {
      const token = await getOpenSkyToken(false);
      const response = await fetch(`https://opensky-network.org/api/states/all${bboxParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        processFlightData(data.states);
        return;
      }
    } catch (directError) {
      console.log('Direct authenticated API failed, trying CORS proxy...');
    }

    // Fallback to full region fetch if bounding box fails
    try {
      const response = await fetch('https://opensky-network.org/api/states/all');
      if (response.ok) {
        const data = await response.json();
        processFlightData(data.states);
        return;
      }
    } catch (error) {
      console.log('Full region fetch failed');
    }
    
  } catch (error) {
    console.error('❌ Error fetching military flights:', error);
    const list = document.getElementById('flight-list');
    if (list) {
      list.innerHTML = `<p style="color: #ff6666;">Error: ${error.message}</p>
                       <p style="font-size: 0.8em;">Check your OpenSky credentials in config.js</p>`;
    }
  }
}

function parseMilitaryFlights(states) {
  if (!states || !Array.isArray(states)) return [];
  
  // Define bounding box for Eastern Europe/Russia conflict zone
  const conflictZoneBounds = {
    lamin: 40,    // Lower latitude bound (south)
    lamin: 35,    // Let me fix this - should be one lamin
    lomin: 20,    // Lower longitude bound (west)  
    lamax: 55,    // Upper latitude bound (north)
    lomax: 60     // Upper longitude bound (east)
  };
  
  // Fixed bounding box
  const MIN_LAT = 35;   // Southern boundary
  const MAX_LAT = 55;   // Northern boundary  
  const MIN_LON = 20;   // Western boundary
  const MAX_LON = 60;   // Eastern boundary

  return states
    .filter(state => {
      // Filter out invalid data
      if (!state || state.length < 16) return false;
      
      const callsign = state[1];
      const latitude = state[6];
      const longitude = state[5];
      
      // Check if aircraft is in conflict zone AND is military
      const isInConflictZone = latitude && longitude && 
                              latitude >= MIN_LAT && latitude <= MAX_LAT &&
                              longitude >= MIN_LON && longitude <= MAX_LON;
      
      const isMilitary = callsign && isMilitaryCallsign(callsign);
      
      return (isInConflictZone && isMilitary) || (isInConflictZone && callsign); // Show all flights in region
    })
    .map(state => {
      const [icao24, callsign, origin_country, time_position, last_contact, 
             longitude, latitude, baro_altitude, on_ground, velocity, 
             heading, vertical_rate, sensors, geo_altitude, squawk] = state;
      
      // Convert units
      const altitude = baro_altitude ? Math.round(baro_altitude * 3.28084) : 0; // meters to feet
      const speed = velocity ? Math.round(velocity * 1.94384) : 0; // m/s to knots
      
      return {
        callsign: callsign || 'UNKNOWN',
        country: origin_country || 'Unknown',
        latitude: latitude || 0,
        longitude: longitude || 0,
        altitude: altitude,
        speed: speed,
        heading: Math.round(heading || 0),
        onGround: on_ground || false,
        lastSeen: time_position ? new Date(time_position * 1000).toLocaleTimeString() : 'Unknown',
        risk: calculateFlightRisk(altitude, speed, on_ground)
      };
    })
    .slice(0, 30); // Increase limit for more aircraft in region
}

function isMilitaryCallsign(callsign) {
  if (!callsign) return false;
  
  const cleanCallsign = callsign.trim().toUpperCase();
  
  // Known military callsign patterns
  const militaryPatterns = [
    /^RCH/,      // Air Mobility Command
    /^ICE/,      // Air Refueling
    /^POW/,      // Special missions
    /^NAVY/,     // Navy aircraft
    /^MARINES/,  // Marine Corps
    /^AF\d/,     // Air Force
    /^USAF/,     // US Air Force
    /^USN/,      // US Navy
    /^USMC/,     // US Marine Corps
    /^ARMY/,     // Army aircraft
    /^COAST/,    // Coast Guard
    /^ANG/,      // Air National Guard
    /^AFRC/,     // Air Force Reserve
    /^NATO/,     // NATO aircraft
    /^TEST/      // Test flights
  ];
  
  // Check callsign patterns
  return militaryPatterns.some(pattern => pattern.test(cleanCallsign));
}

function calculateFlightRisk(altitude, speed, onGround) {
  if (onGround) {
    return { level: 1, text: 'Low', color: '#00ff00' };
  }
  
  let riskLevel = 1;
  let riskText = 'Low';
  let riskColor = '#00ff00';
  
  // High speed + low altitude = higher risk
  if (speed > 400 && altitude < 10000 && altitude > 0) {
    riskLevel = 4;
    riskText = 'High';
    riskColor = '#ff0000';
  } else if (speed > 300 && altitude < 15000) {
    riskLevel = 3;
    riskText = 'Medium';
    riskColor = '#ff9900';
  } else if (speed > 200 || altitude > 30000) {
    riskLevel = 2;
    riskText = 'Elevated';
    riskColor = '#ffff00';
  }
  
  return { level: riskLevel, text: riskText, color: riskColor };
}

function updateMilitaryPanel(event) {
  const list = document.getElementById('flight-list');
  if (!list) return;

  const flights = event.detail?.flights || window.militaryFlights || [];

  if (!flights.length) {
    list.innerHTML = '<p>No military flights detected in current airspace.</p><p style="font-size: 0.8em; color: #888;">Note: Many military aircraft do not broadcast military identifiers.</p>';
    return;
  }

  list.innerHTML = `
    <p style="font-size: 0.9em; color: #aaa;">Tracking ${flights.length} military aircraft</p>
    ${flights.map(flight => `
      <div class="flight-item" style="
        border: 1px solid ${flight.risk.color};
        padding: 8px;
        margin: 5px 0;
        border-radius: 4px;
        background: rgba(50, 50, 50, 0.3);
      ">
        <strong>${flight.callsign}</strong> (${flight.country})<br/>
        <span style="font-size: 0.85em;">Alt: ${flight.altitude.toLocaleString()}ft | 
        Speed: ${flight.speed}kts | 
        Heading: ${flight.heading}°</span><br/>
        <span>Risk: <strong style="color: ${flight.risk.color}">${flight.risk.text}</strong></span><br/>
        <span style="font-size: 0.8em; color: #888;">Last seen: ${flight.lastSeen}</span><br/>
        <button onclick="trackFlight('${flight.callsign}', ${flight.latitude}, ${flight.longitude})" 
                style="margin: 2px; padding: 2px 6px; font-size: 0.8em;">🎯 Track</button>
        <button onclick="narrateFlight('${flight.callsign}', '${flight.country}')" 
                style="margin: 2px; padding: 2px 6px; font-size: 0.8em;">🎧 Narrate</button>
      </div>
    `).join('')}
  `;
}

function trackFlight(callsign, lat, lon) {
  console.log(`🎯 Tracking flight: ${callsign} at ${lat}, ${lon}`);
  
  // If we have a map, pan to the location
  if (window.backgroundMap) {
    window.backgroundMap.setView([lat, lon], 6, {
      animate: true,
      duration: 1.5
    });
  }
}

function narrateFlight(callsign, country) {
  const utterance = new SpeechSynthesisUtterance(`Military aircraft ${callsign} from ${country} detected.`);
  utterance.rate = 0.9;
  utterance.pitch = 0.7;
  speechSynthesis.speak(utterance);
}

// 🎯 KEY FUNCTION: Military Activity to Mood Integration
function updateMoodFromMilitaryActivity(flights) {
  // Calculate military activity level based on flight risk and quantity
  const highRiskFlights = flights.filter(f => f.risk.level >= 4).length;
  const mediumRiskFlights = flights.filter(f => f.risk.level === 3).length;
  const elevatedRiskFlights = flights.filter(f => f.risk.level === 2).length;
  const lowRiskFlights = flights.filter(f => f.risk.level === 1).length;
  
  const militaryActivityLevel = 
    (highRiskFlights * 4) + 
    (mediumRiskFlights * 3) + 
    (elevatedRiskFlights * 2) + 
    (lowRiskFlights * 1);
  
  console.log(`📊 Military Activity Level: ${militaryActivityLevel} (High: ${highRiskFlights}, Medium: ${mediumRiskFlights}, Elevated: ${elevatedRiskFlights})`);
  
  // Map military activity to mood states
  let newMood;
  if (militaryActivityLevel > 15) {
    newMood = "panic";        // Very high military activity
  } else if (militaryActivityLevel > 10) {
    newMood = "melancholy";   // High military activity
  } else if (militaryActivityLevel > 5) {
    newMood = "pensive";      // Moderate military activity
  } else if (militaryActivityLevel > 2) {
    newMood = "serene";       // Low military activity - but still present
  } else {
    newMood = "serene";       // Minimal military activity
  }
  
  // Special case: If there's significant military activity but current mood is serene,
  // we might want to elevate the mood to reflect the tension
  const currentMood = window.currentMood || "serene";
  if (currentMood === "serene" && militaryActivityLevel > 3) {
    newMood = "pensive";  // Subtle elevation from serene to pensive
    console.log(`⚡ Military activity elevating serene mood to pensive`);
  }
  
  // Apply the mood change if it's different
  if (window.currentMood !== newMood) {
    console.log(`🎭 Mood shift: ${window.currentMood || 'unknown'} → ${newMood} (due to military activity)`);
    window.currentMood = newMood;
    triggerMoodEffects(newMood);
    
    // Update mood display if you have one
    const moodTitle = document.getElementById('mood-title');
    const moodDescription = document.getElementById('mood-description');
    if (moodTitle) moodTitle.textContent = `AetherPulse - ${newMood.charAt(0).toUpperCase() + newMood.slice(1)}`;
    if (moodDescription) moodDescription.textContent = `Military activity detected: ${flights.length} aircraft, Activity level: ${militaryActivityLevel}`;
  }
}

// 🗺️ Background Map with Animated Military Trackers
if (typeof window.militaryTrackers === 'undefined') {
  window.militaryTrackers = [];
}

// Add trail tracking for military flights
if (typeof window.militaryFlightTrails === 'undefined') {
  window.militaryFlightTrails = new Map(); // Map of callsign -> [positions]
}

function initializeBackgroundMap() {
  console.log('🎨 Initializing background map...');

  // Create map container if it doesn't exist
  let mapContainer = document.getElementById('background-map');
  if (!mapContainer) {
    mapContainer = document.createElement('div');
    mapContainer.id = 'background-map';
    Object.assign(mapContainer.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '0',           // ✅ keep it above the body background
      opacity: '1',          // ✅ full visibility while debugging
      pointerEvents: 'auto', // ✅ interactable (switch to 'none' later if desired)
      background: '#111'     // ✅ fallback so you can SEE it
    });
    document.body.appendChild(mapContainer);
    console.log('✅ Map container created');
  }

  // Initialize Leaflet map
  initializeLeafletMap();
}

function initializeLeafletMap() {
  console.log('🗺️ Initializing Leaflet map...');
  
  // Load Leaflet CSS and JS dynamically
  loadLeafletAssets()
    .then(() => {
      console.log('✅ Leaflet assets loaded');
      const mapContainer = document.getElementById('background-map');
      
      if (!mapContainer) {
        console.error('❌ Map container not found');
        return;
      }
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          // Create map with explicit size
          window.backgroundMap = L.map('background-map', {
            center: [20, 0],
            zoom: 2,
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            minZoom: 1,
            maxZoom: 8
          });

          console.log('✅ Map created');

          // Add tile layer with proper attribution
          const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 8,
            minZoom: 1,
            opacity: 0.8
          }).addTo(window.backgroundMap);

          console.log('✅ Tile layer added');

          // Create layer for military trackers
          window.militaryTrackerLayer = L.layerGroup().addTo(window.backgroundMap);
          console.log('✅ Tracker layer created');

          // Force map to render
          window.backgroundMap.invalidateSize();
          
          // Start updating trackers
          setInterval(enhancedMilitaryUpdate, 5000);
          console.log('✅ Map initialization complete');
          
        } catch (error) {
          console.error('❌ Error creating map:', error);
        }
      }, 100);
    })
    .catch(error => {
      console.error('❌ Failed to load map:', error);
    });
}

function loadLeafletAssets() {
  return new Promise((resolve, reject) => {
    // Check if Leaflet is already loaded
    if (typeof L !== 'undefined') {
      console.log('✅ Leaflet already loaded');
      resolve();
      return;
    }

    console.log('📥 Loading Leaflet assets...');

    // Load Leaflet CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.onload = () => {
      console.log('✅ Leaflet CSS loaded');
      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        console.log('✅ Leaflet JS loaded');
        resolve();
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Leaflet JS:', error);
        reject(error);
      };
      document.head.appendChild(script);
    };
    cssLink.onerror = (error) => {
      console.error('❌ Failed to load Leaflet CSS:', error);
      reject(error);
    };
    document.head.appendChild(cssLink);
  });
}

function updateMilitaryTrackersOnMap() {
  if (!window.backgroundMap || !window.militaryTrackerLayer) return;
  
  // Clear existing trackers
  window.militaryTrackerLayer.clearLayers();
  
  // Add current military flights as animated trackers
  if (Array.isArray(window.militaryFlights) && window.militaryFlights.length > 0) {
    window.militaryFlights.forEach((flight, index) => {
      if (flight.latitude && flight.longitude) {
        createMilitaryTracker(flight, index);
      }
    });
  }
}

function createMilitaryTracker(flight, index) {
  if (!window.militaryTrackerLayer) return;

  // Create animated marker
  const marker = L.marker([flight.latitude, flight.longitude], {
    icon: createMilitaryIcon(flight),
    rotationAngle: flight.heading || 0
  });

  // Add pulse animation
  animateMilitaryTracker(marker, flight);

  // Add tooltip
  marker.bindTooltip(`
    <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #ff0080;">
      <strong>${flight.callsign}</strong><br>
      ${flight.speed} kts<br>
      ${flight.altitude.toLocaleString()} ft<br>
      <span style="color: ${flight.risk.color}">Risk: ${flight.risk.text}</span>
    </div>
  `, {
    direction: 'top',
    offset: [0, -10],
    permanent: false
  });

  marker.addTo(window.militaryTrackerLayer);
}

function createMilitaryIcon(flight) {
  // Different icons based on risk level
  const iconColors = {
    1: '#00ff00', // Low - green
    2: '#ffff00', // Elevated - yellow
    3: '#ff9900', // Medium - orange
    4: '#ff0000'  // High - red
  };

  const color = iconColors[flight.risk.level] || '#ff0080';

  return L.divIcon({
    className: 'military-tracker-icon',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        transform: rotate(${flight.heading || 0}deg);
        box-shadow: 0 0 10px ${color};
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 8px solid ${color};
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

function animateMilitaryTracker(marker, flight) {
  // Add pulse animation
  const element = marker._icon;
  if (element) {
    element.style.animation = `pulse-${flight.risk.level} 2s infinite`;
    
    // Add CSS for animation if not exists
    if (!document.getElementById('tracker-animations')) {
      const style = document.createElement('style');
      style.id = 'tracker-animations';
      style.textContent = `
        @keyframes pulse-1 {
          0% { box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 255, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 255, 0, 0); }
        }
        @keyframes pulse-2 {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(255, 255, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0); }
        }
        @keyframes pulse-3 {
          0% { box-shadow: 0 0 0 0 rgba(255, 153, 0, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(255, 153, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 153, 0, 0); }
        }
        @keyframes pulse-4 {
          0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
          70% { box-shadow: 0 0 0 25px rgba(255, 0, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

function updateMilitaryTrackersWithTrails() {
  if (!window.backgroundMap || !window.militaryTrackerLayer) return;
  
  // Update trails for each flight
  if (Array.isArray(window.militaryFlights) && window.militaryFlights.length > 0) {
    window.militaryFlights.forEach(flight => {
      if (flight.latitude && flight.longitude && flight.callsign) {
        // Update trail
        updateFlightTrail(flight);
      }
    });
  }
}

function updateFlightTrail(flight) {
  // Get or create trail for this flight
  let trail = window.militaryFlightTrails.get(flight.callsign) || [];
  
  // Add current position
  trail.push({
    lat: flight.latitude,
    lng: flight.longitude,
    timestamp: Date.now()
  });
  
  // Keep only last 20 positions (5 minutes of history at 15sec intervals)
  if (trail.length > 20) {
    trail = trail.slice(-20);
  }
  
  // Store updated trail
  window.militaryFlightTrails.set(flight.callsign, trail);
  
  // Draw trail on map
  drawFlightTrail(flight.callsign, trail, flight.risk);
}

function drawFlightTrail(callsign, trail, risk) {
  // Remove existing trail for this flight
  const trailId = `trail-${callsign}`;
  const existingTrail = document.getElementById(trailId);
  if (existingTrail) {
    existingTrail.remove();
  }
  
  // Only draw if we have enough points
  if (trail.length < 2) return;
  
  // Create trail polyline
  const trailPoints = trail.map(pos => [pos.lat, pos.lng]);
  const trailColor = risk.color || '#ff0080';
  
  const polyline = L.polyline(trailPoints, {
    color: trailColor,
    weight: 2,
    opacity: 0.6,
    dashArray: '5, 10'
  }).addTo(window.militaryTrackerLayer);
  
  // Add ID for future removal
  polyline._leaflet_id = trailId;
}

// Enhanced update function that includes trails
function enhancedMilitaryUpdate() {
  updateMilitaryTrackersOnMap();
  updateMilitaryTrackersWithTrails();
}

// 🌍 Define conflict zones (Eastern Europe + Russia warzone)
const conflictZones = [
  {
    name: "Donbas Region",
    description: "Intense frontline battles with daily clashes and high civilian toll.",
    risk: "Severe",
    latitude: 48.5,
    longitude: 38.0,
    troops: "Heavy troop presence, 150+ engagements reported daily, artillery + glide bombs"
  },
  {
    name: "Crimea",
    description: "Heavily militarized peninsula, strategic for Russia’s missile and naval operations.",
    risk: "High",
    latitude: 45.3,
    longitude: 34.0,
    troops: "Naval + ground forces, air-defense degraded (Podlet & Nebo-M radars destroyed)"
  },
  {
    name: "Belgorod Border",
    description: "Russian staging ground under regular Ukrainian drone strikes.",
    risk: "Elevated",
    latitude: 50.6,
    longitude: 36.6,
    troops: "Cross-border attacks ongoing, Russia claims 150+ drones intercepted in a day"
  }
];

// 🗺️ Plot zones onto map
function plotConflictZonesOnMap(zones) {
  if (!window.backgroundMap) return;

  if (!window.conflictZoneLayer) {
    window.conflictZoneLayer = L.layerGroup().addTo(window.backgroundMap);
  }
  window.conflictZoneLayer.clearLayers();

  zones.forEach(zone => {
    if (zone.latitude && zone.longitude) {
      const riskColors = {
        High: "red",
        Medium: "orange",
        Elevated: "yellow",
        Low: "green"
      };
      const color = riskColors[zone.risk] || "#00fff0";

      const marker = L.circle([zone.latitude, zone.longitude], {
        radius: 200000,
        color: color,
        fillColor: color,
        fillOpacity: 0.3
      }).addTo(window.conflictZoneLayer);

      marker.bindTooltip(
        `<strong>${zone.name}</strong><br/>Risk: ${zone.risk}<br/>${zone.description}`,
        { direction: "top" }
      );
    }
  });
}

// 🔄 Initialize conflict zones after DOM load
document.addEventListener("DOMContentLoaded", () => {
  updateZoneMonitor(conflictZones);
  plotConflictZonesOnMap(conflictZones);
});

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
  
  // Find the zone by name
  const zone = conflictZones.find(z => z.name === name);
  
  if (zone && window.backgroundMap) {
    // Pan to the zone location
    window.backgroundMap.setView([zone.latitude, zone.longitude], 6, {
      animate: true,
      duration: 1.5
    });
    
    // Add a visual highlight effect
    highlightConflictZone(zone);
  } else {
    console.warn(`Zone ${name} not found or map not initialized`);
  }
}

function highlightConflictZone(zone) {
  // Remove any existing highlight
  if (window.currentHighlight) {
    if (window.conflictZoneLayer) {
      window.conflictZoneLayer.removeLayer(window.currentHighlight);
    }
  }
  
  // Create a temporary highlight circle
  if (window.backgroundMap && zone.latitude && zone.longitude) {
    const highlight = L.circle([zone.latitude, zone.longitude], {
      radius: 250000, // Slightly larger than the original
      color: '#00fff0',
      fillColor: '#00fff0',
      fillOpacity: 0.4,
      weight: 3,
      dashArray: '10, 10'
    }).addTo(window.conflictZoneLayer || window.backgroundMap);
    
    // Store reference for removal
    window.currentHighlight = highlight;
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      if (window.conflictZoneLayer && window.currentHighlight) {
        window.conflictZoneLayer.removeLayer(window.currentHighlight);
        window.currentHighlight = null;
      }
    }, 3000);
  }
}

// Enhanced version to focus on all high-risk zones
function focusOnWarZones() {
  const highRiskZones = conflictZones.filter(zone => zone.risk === "High");
  
  if (highRiskZones.length > 0 && window.backgroundMap) {
    // Calculate center point of all high-risk zones
    const avgLat = highRiskZones.reduce((sum, zone) => sum + zone.latitude, 0) / highRiskZones.length;
    const avgLng = highRiskZones.reduce((sum, zone) => sum + zone.longitude, 0) / highRiskZones.length;
    
    // Focus on the center with appropriate zoom
    window.backgroundMap.setView([avgLat, avgLng], 5, {
      animate: true,
      duration: 2
    });
    
    // Highlight all high-risk zones
    highRiskZones.forEach(zone => {
      highlightConflictZone(zone);
    });
  }
}

// Add a button to focus on all war zones
function addWarZoneFocusButton() {
  const toggle = document.createElement('button');
  toggle.id = 'warzone-focus';
  toggle.textContent = '🎯 Focus on War Zones';
  Object.assign(toggle.style, {
    position: 'fixed', 
    bottom: '100px', 
    right: '20px', 
    zIndex: '9999',
    background: '#000', 
    border: '1px solid #00fff0', 
    color: '#00fff0',
    padding: '8px 12px', 
    cursor: 'pointer', 
    borderRadius: '6px'
  });
  
  toggle.onclick = () => {
    focusOnWarZones();
  };
  
  document.body.appendChild(toggle);
}

// Add this to your DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  updateZoneMonitor(conflictZones);
  plotConflictZonesOnMap(conflictZones);
  addWarZoneFocusButton(); // Add the focus button
  
  // Auto-focus on war zones after initial load
  setTimeout(() => {
    focusOnWarZones();
  }, 3000);
}); 