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

function initializeCanvas() {
  canvas = document.getElementById('ambient-canvas');
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  animateGradient();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function setMoodGradient(mood) {
  currentGradient = moodColors[mood] || moodColors['neutral'];
}

function animateGradient() {
  requestAnimationFrame(animateGradient);

  const width = canvas.width;
  const height = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, shiftHue(currentGradient[0], Math.sin(t) * 10));
  grad.addColorStop(1, shiftHue(currentGradient[1], Math.cos(t) * 10));

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  t += 0.005;
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
