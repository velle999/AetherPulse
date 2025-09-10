// conflict.js – Live conflict zones overlay for AetherPulse

async function fetchConflictData() {
  try {
    const res = await fetch("https://velle999.github.io/conflict-dashboard/api/zones.json");
    const data = await res.json();

    applyConflictMood(data);   // mood + background
    updateZoneMonitor(data);   // UI panel update
    plotConflictZonesOnMap(data); // map markers (if map is live)

  } catch (err) {
    console.warn("⚠️ Failed to fetch conflict data:", err);
  }
}

function applyConflictMood(zones) {
  let totalRisk = 0;

  zones.forEach(zone => {
    switch (zone.risk) {
      case "Severe": totalRisk += 4; break;
      case "High": totalRisk += 3; break;
      case "Medium": totalRisk += 2; break;
      case "Elevated": totalRisk += 1; break;
    }
  });

  const avgRisk = zones.length ? totalRisk / zones.length : 0;

  // Mood reaction logic tied to intel severity
  if (avgRisk >= 3) {
    document.getElementById("mood-description").textContent = "🚨 Severe Escalation Ongoing";
    document.body.style.background = "radial-gradient(#3a0000, #000)";
    document.getElementById("fox")?.classList.add("fox-panic");
    playConflictSoundscape();
  } else if (avgRisk >= 2) {
    document.getElementById("mood-description").textContent = "⚠️ Escalating Tensions Detected";
    document.body.style.background = "radial-gradient(#202020, #000)";
    document.getElementById("fox")?.classList.remove("fox-panic");
  } else if (avgRisk >= 1) {
    document.getElementById("mood-description").textContent = "🌍 Watching World Events...";
    document.body.style.background = "radial-gradient(#111, #000)";
    document.getElementById("fox")?.classList.remove("fox-panic");
  } else {
    document.getElementById("mood-description").textContent = "✅ Calm — No major escalations";
    document.body.style.background = "radial-gradient(#000, #000)";
    document.getElementById("fox")?.classList.remove("fox-panic");
  }

  // Optional: visual overlays
  if (typeof renderConflictOverlay === "function") {
    renderConflictOverlay(zones);
  }
}

// 🎧 Resilient audio loader for conflict-swell.mp3
async function playConflictSoundscape() {
  const bg = document.getElementById("bg-music");
  if (bg) bg.volume = 0.2;

  const primaryUrl = `${window.location.origin}/AetherPulse/assets/conflict-swell.mp3`;
  const fallbackUrl = "https://raw.githubusercontent.com/velle999/AetherPulse/main/assets/conflict-swell.mp3";

  let soundUrl = primaryUrl;

  try {
    // Try to confirm Pages asset exists
    const res = await fetch(primaryUrl, { method: "HEAD" });
    if (!res.ok) soundUrl = fallbackUrl;
  } catch (err) {
    console.warn("⚠️ Conflict-swell not found on Pages, using fallback:", err);
    soundUrl = fallbackUrl;
  }

  const conflictSound = new Audio(soundUrl);
  conflictSound.volume = 0.6;
  conflictSound.play().catch(err => {
    console.warn("⚠️ Could not auto-play conflict soundscape:", err);
  });
}

// Refresh every 15s
setInterval(fetchConflictData, 15000);
fetchConflictData();
