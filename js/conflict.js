// conflict.js – Live conflict zones overlay for AetherPulse

async function fetchConflictData() {
  try {
    const res = await fetch("https://velle999.github.io/conflict-dashboard/api/zones.json");
    const data = await res.json();

    applyConflictMood(data);        // existing mood logic
    updateZoneMonitor(data);        // <-- THIS IS THE MISSING PIECE

  } catch (err) {
    console.warn("⚠️ Failed to fetch conflict data:", err);
  }
}

function applyConflictMood(zones) {
  let globalRisk = 0;

  zones.forEach(zone => {
    if (zone.risk === "High") globalRisk += 3;
    else if (zone.risk === "Medium") globalRisk += 2;
    else if (zone.risk === "Elevated") globalRisk += 1;
  });

  // Normalize
  const riskScore = Math.min(globalRisk / zones.length, 1);

  // Mood reaction
  if (riskScore > 0.6) {
    document.getElementById("mood-description").textContent = "⚠️ Escalating Tensions Detected";
    document.body.style.background = "radial-gradient(#3a0000, #000)";
    document.getElementById("fox").classList.add("fox-panic");
    playConflictSoundscape();
  } else if (riskScore > 0.3) {
    document.getElementById("mood-description").textContent = "🌍 Watching World Events...";
    document.body.style.background = "radial-gradient(#202020, #000)";
    document.getElementById("fox").classList.remove("fox-panic");
  }

  // Optional: visual pulses on canvas
  if (typeof renderConflictOverlay === "function") {
    renderConflictOverlay(zones);
  }
}

function playConflictSoundscape() {
  const bg = document.getElementById("bg-music");
  if (bg) bg.volume = 0.2;

  const conflictSound = new Audio("assets/conflict-swell.mp3");
  conflictSound.volume = 0.6;
  conflictSound.play().catch(e => {});
}

// Call on interval
setInterval(fetchConflictData, 15000); // Refresh every 15s
fetchConflictData();
