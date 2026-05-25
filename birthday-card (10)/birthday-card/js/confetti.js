/* confetti.js — canvas-based confetti engine */

const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');

let particles = [];
let animId = null;

function resizeCanvas() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = ['#E8304A','#FF6B80','#FFD93D','#FFE98A','#FF6FA8','#FFB3CE','#FFFFFF','#FF9F1C'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function createParticle(x, y, count = 18, spread = 1) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: randomBetween(-6, 6) * spread,
      vy: randomBetween(-14, -4) * spread,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(5, 11),
      rotation: randomBetween(0, Math.PI * 2),
      rotSpeed: randomBetween(-0.2, 0.2),
      gravity: 0.35,
      drag: 0.97,
      life: 1,
      decay: randomBetween(0.012, 0.022),
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
      aspect: randomBetween(0.3, 0.7),
    });
  }
  startLoop();
}

/** Small pop burst at a given screen coordinate */
function burstAt(x, y) {
  createParticle(x, y, 22, 1);
}

/** Huge explosion */
function megaBurst() {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  for (let wave = 0; wave < 4; wave++) {
    setTimeout(() => createParticle(cx, cy, 60, 1.6), wave * 150);
  }
}

/** Exposed global for cake.js */
window.launchConfettiBurst = function(x, y, count) {
  createParticle(x, y, count || 40, 1.2);
};

function startLoop() {
  if (animId) return;
  animId = requestAnimationFrame(loop);
}

function loop() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += p.gravity;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.rotation += p.rotSpeed;
    p.life -= p.decay;
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * p.aspect, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size * p.aspect / 2, p.size, p.size * p.aspect);
    }
    ctx.restore();
  }
  if (particles.length > 0) {
    animId = requestAnimationFrame(loop);
  } else {
    animId = null;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}
