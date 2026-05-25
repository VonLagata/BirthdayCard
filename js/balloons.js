/* balloons.js — pop logic, confetti, transitions */

const TOTAL_BALLOONS = 7;
let poppedCount = 0;
const popped = new Array(TOTAL_BALLOONS).fill(false);

function popBalloon(index) {
  if (popped[index]) return;
  popped[index] = true;
  poppedCount++;

  const wrapper = document.getElementById('bw' + index);
  const balloon = document.getElementById('b' + index);

  // Get balloon screen position for confetti
  const rect = balloon.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;

  // Confetti burst
  burstAt(cx, cy);

  // Pop animation
  balloon.style.transition = 'transform 0.08s ease, opacity 0.15s ease';
  balloon.style.transform  = 'scale(1.4)';
  balloon.style.opacity    = '0';

  // Remove string + wrapper
  setTimeout(() => {
    wrapper.style.transition = 'opacity 0.2s ease';
    wrapper.style.opacity    = '0';
    setTimeout(() => wrapper.remove(), 250);
  }, 120);

  // Update counter
  const counter = document.getElementById('poppedCount');
  counter.textContent = poppedCount;

  // Pulse counter
  const counterEl = document.getElementById('popCounter');
  counterEl.style.color = '#FFD93D';
  counterEl.style.transform = 'translateX(-50%) scale(1.15)';
  setTimeout(() => {
    counterEl.style.color = '';
    counterEl.style.transform = 'translateX(-50%) scale(1)';
  }, 300);

  if (poppedCount === TOTAL_BALLOONS) {
    allPopped();
  }
}

function allPopped() {
  // Mega confetti explosion
  megaBurst();

  // Gift box shake + glow
  const gift = document.getElementById('giftBox');
  gift.style.animation = 'giftShake 0.5s ease, giftGlow 1s ease 0.5s forwards';

  // Inject keyframes dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes giftShake {
      0%,100%{ transform: translateX(0) rotate(0); }
      20%    { transform: translateX(-8px) rotate(-4deg); }
      40%    { transform: translateX(8px)  rotate(4deg); }
      60%    { transform: translateX(-6px) rotate(-3deg); }
      80%    { transform: translateX(6px)  rotate(3deg); }
    }
    @keyframes giftGlow {
      0%   { filter: drop-shadow(0 0 0px rgba(255,217,61,0)); }
      50%  { filter: drop-shadow(0 0 24px rgba(255,217,61,0.9)); }
      100% { filter: drop-shadow(0 0 40px rgba(255,111,168,0.7)); }
    }
  `;
  document.head.appendChild(style);

  // Navigate to card page after delay
  setTimeout(() => navigateToCard(), 2200);
}

function navigateToCard() {
  const overlay = document.getElementById('transitionOverlay');
  overlay.classList.add('fade-in');
  setTimeout(() => {
    window.location.href = 'card.html';
  }, 550);
}
