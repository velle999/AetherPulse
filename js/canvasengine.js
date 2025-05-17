let canvas, ctx;
let moodColors = {
  euphoric: ['#00ffe7', '#3f87a6'],
  serene: ['#0099cc', '#66ccff'],
  pensive: ['#666666', '#999999'],
  melancholy: ['#2c3e50', '#34495e'],
  gloomy: ['#1e1e1e', '#3b3b3b'],
  panic: ['#ff0033', '#8e0000'],
  neutral: ['#888', '#aaa']
};

let currentGradient = moodColors['neutral'];
let t = 0;

let conflictPulses = [];

function initializeCanvas() {
  canvas = document.getElementById('ambient-canvas');
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
if (globalConflictRisk > 0.6) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

  requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function setMoodGradient(mood) {
  currentGradient = moodColors[mood] || moodColors['neutral'];
}

function animate() {
  const width = canvas.width;
  const height = canvas.height;

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, shiftHue(currentGradient[0], Math.sin(t) * 10));
  grad.addColorStop(1, shiftHue(currentGradient[1], Math.cos(t) * 10));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Overlay conflict pulses
  drawConflictPulses();

  t += 0.005;
  requestAnimationFrame(animate);
}

function shiftHue(color, amount) {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = (num >> 16) + amount;
  const g = ((num >> 8) & 0x00FF) + amount;
  const b = (num & 0x0000FF) + amount;
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}

function clamp(val) {
  return Math.max(0, Math.min(255, Math.floor(val)));
}

function renderConflictOverlay(zones) {
  if (!canvas || !ctx) {
    console.warn("🕳️ Canvas not initialized yet. Retrying...");
    setTimeout(() => renderConflictOverlay(zones), 500); // try again in 500ms
    return;
  }

  zones.forEach(zone => {
    const [lat, lon] = zone.position;
    const { x, y } = latLonToCanvasXY(lat, lon);

    const troopScale = Math.min(1, zone.troops / 20000);
    const baseRadius = 10 + troopScale * 40;
    const baseAlpha = 0.5 + troopScale * 0.4;
    const color = zone.risk === "High" ? "#ff3333" : zone.risk === "Medium" ? "#ffaa00" : "#ffff66";

    conflictPulses.push({
      x, y,
      radius: baseRadius,
      color,
      alpha: baseAlpha
    });
  });
}

function latLonToCanvasXY(lat, lon) {
  // Assume world map spans canvas dimensions (equirectangular projection)
  const x = ((lon + 180) / 360) * canvas.width;
  const y = ((90 - lat) / 180) * canvas.height;
  return { x, y };
}

function drawConflictPulses() {
  conflictPulses.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Animate
    p.radius += 0.4;
    p.alpha *= 0.96;
  });

  // Cleanup
  conflictPulses = conflictPulses.filter(p => p.alpha > 0.05);
  ctx.globalAlpha = 1.0;
}
