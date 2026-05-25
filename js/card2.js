/* card2.js — polaroid tilt on device motion + confetti burst on load */

window.addEventListener('load', () => {

  // Welcome confetti
  setTimeout(() => {
    const cx = window.innerWidth / 2;
    burstAt(cx - 60, window.innerHeight * 0.25);
    setTimeout(() => burstAt(cx + 60, window.innerHeight * 0.25), 200);
  }, 700);

  // Gyroscope tilt on the polaroid (mobile)
  const polaroid = document.getElementById('polaroid3d');
  if (window.DeviceOrientationEvent && polaroid) {
    const handleOrientation = (e) => {
      const tiltX = Math.max(-15, Math.min(15, e.beta  - 30)) * 0.5;
      const tiltY = Math.max(-15, Math.min(15, e.gamma))      * 0.5;
      polaroid.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotate(-2deg)`;
      polaroid.style.animationPlayState = 'paused';
    };
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
  }

  // Touch-drag tilt fallback
  const wrapper = document.getElementById('polaroidWrapper');
  if (wrapper) {
    let touching = false;
    wrapper.addEventListener('touchstart', () => { touching = true; }, { passive: true });
    wrapper.addEventListener('touchend',   () => {
      touching = false;
      if (polaroid) polaroid.style.animationPlayState = 'running';
    }, { passive: true });
    wrapper.addEventListener('touchmove', (e) => {
      if (!touching || !polaroid) return;
      const touch = e.touches[0];
      const rect  = wrapper.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (touch.clientX - cx) / (rect.width  / 2);
      const dy    = (touch.clientY - cy) / (rect.height / 2);
      polaroid.style.transform       = `rotateY(${dx * 18}deg) rotateX(${-dy * 12}deg) rotate(-2deg)`;
      polaroid.style.animationPlayState = 'paused';
    }, { passive: true });
  }
});

/* Navigate back to intro and reset everything */
function goBack() {
  const overlay = document.getElementById('transitionOverlay') || makeOverlay();
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'all';
  setTimeout(() => { window.location.href = 'index.html'; }, 500);
}

function makeOverlay() {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:#1a0810;z-index:99999;opacity:0;transition:opacity 0.5s ease;pointer-events:none;';
  document.body.appendChild(el);
  return el;
}
