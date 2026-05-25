/* music.js — handles autoplay on first user interaction */

(function () {
  const music = document.getElementById('bgMusic');
  if (!music) return;

  // Try autoplay immediately (works on some browsers)
  const tryPlay = () => {
    if (music.paused) {
      music.volume = 0.55;
      music.play().catch(() => {/* blocked — wait for tap */});
    }
  };

  tryPlay();

  // Fallback: play on first tap anywhere
  const unlockAudio = () => {
    tryPlay();
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('click', unlockAudio);
  };

  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('click',      unlockAudio, { once: true });

  // Fade in smoothly
  music.volume = 0;
  const fadeIn = setInterval(() => {
    if (music.volume < 0.55) {
      music.volume = Math.min(0.55, music.volume + 0.02);
    } else {
      clearInterval(fadeIn);
    }
  }, 100);
})();
