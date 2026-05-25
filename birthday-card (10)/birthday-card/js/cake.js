/* cake.js — layered cake + candle blow + upward pull paper */
(function () {
  'use strict';

  let cakeRevealed = false;
  let candlesBlown = 0;
  const TOTAL_CANDLES = 5;
  let allBlown = false;
  let paperPulling = false;
  let pullStartY = 0;
  let currentPullHeight = 0;
  let MAX_PULL = 0;
  let photoShown = false;
  let isSnapped = false;

  let cakeSection, cakeScene, cakeWrap, layers, plate, candlesRow, candleHint,
      pullContainer, paperScroll, pullHint, pullProgressHint;

  function init() {
    cakeSection      = document.getElementById('cakeSection');
    if (!cakeSection) return;

    cakeScene        = cakeSection.querySelector('.cake-scene');
    cakeWrap         = document.getElementById('cakeWrap');
    layers           = Array.from(document.querySelectorAll('.cake-layer'));
    plate            = document.querySelector('.cake-plate');
    candlesRow       = document.getElementById('candlesRow');
    candleHint       = document.getElementById('candleHint');
    pullContainer    = document.getElementById('pullPaperContainer');
    paperScroll      = document.getElementById('paperScroll');
    pullHint         = document.getElementById('pullHint');
    pullProgressHint = document.getElementById('pullProgressHint');

    // MAX_PULL = spacer height (80vh) minus a small margin
    MAX_PULL = Math.min(window.innerHeight * 0.70, 640);

    window.addEventListener('resize', () => {
      if (!isSnapped) MAX_PULL = Math.min(window.innerHeight * 0.70, 640);
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !cakeRevealed) {
          cakeRevealed = true;
          revealLayers();
        }
      });
    }, { threshold: 0.15 });

    obs.observe(cakeSection);
  }

  /* ─── Position pull container on top of cake ─── */
  function positionPullContainer() {
    if (!pullContainer || !cakeWrap || !cakeScene) return;
    // Measure cake height (layers + plate) within cake-scene
    const cakeRect  = cakeWrap.getBoundingClientRect();
    const sceneRect = cakeScene.getBoundingClientRect();
    // bottom of pull-container = bottom of cake-scene - bottom of cake-wrap
    // i.e. how far cakeWrap bottom is from sceneRect bottom
    const offsetFromBottom = sceneRect.bottom - cakeRect.top;
    pullContainer.style.bottom = offsetFromBottom + 'px';
  }

  /* ─── Layer reveal ─── */
  function revealLayers() {
    const sorted = [...layers].sort((a, b) => +a.dataset.layer - +b.dataset.layer);

    sorted.forEach((layer, i) => {
      setTimeout(() => layer.classList.add('layer-revealed'), i * 270);
    });

    const totalDelay = sorted.length * 270 + 100;
    setTimeout(() => { if (plate) plate.classList.add('layer-revealed'); }, totalDelay);

    setTimeout(() => {
      if (candlesRow) candlesRow.classList.add('visible');
      setTimeout(() => {
        if (candleHint) candleHint.classList.add('visible');
        // Position pull container now that cake has rendered
        positionPullContainer();
      }, 500);
    }, totalDelay + 500);
  }

  /* ─── Candle blowing ─── */
  window.blowCandle = function (index) {
    if (allBlown) return;
    const candle = document.querySelector(`.candle[data-candle="${index}"]`);
    if (!candle || candle.classList.contains('blown')) return;

    candle.classList.add('blown');
    candlesBlown++;

    try {
      const rect = candle.getBoundingClientRect();
      if (window.launchConfettiBurst) {
        window.launchConfettiBurst(rect.left + rect.width / 2, rect.top, 20);
      }
    } catch (e) {}

    if (candlesBlown >= TOTAL_CANDLES) {
      allBlown = true;
      onAllCandlesBlown();
    }
  };

  function onAllCandlesBlown() {
    if (candleHint) {
      candleHint.style.opacity = '0';
      candleHint.style.transform = 'translateY(-10px)';
    }
    setTimeout(() => {
      try {
        if (window.launchConfettiBurst) {
          window.launchConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 150);
        }
      } catch (e) {}
    }, 300);

    setTimeout(() => {
      positionPullContainer(); // re-measure in case of any layout shift
      if (pullContainer) pullContainer.classList.add('visible');
      if (pullHint) {
        pullHint.classList.add('visible');
        // transform via class
      }
      setupPullInteraction();
    }, 1400);
  }

  /* ─── Pull interaction ─── */
  function setupPullInteraction() {
    if (!pullContainer || !paperScroll) return;

    pullContainer.addEventListener('touchstart', onPullStart, { passive: true });
    window.addEventListener('touchmove', onPullMove, { passive: false });
    window.addEventListener('touchend', onPullEnd, { passive: true });
    pullContainer.addEventListener('mousedown', onPullStart);
    window.addEventListener('mousemove', onPullMove);
    window.addEventListener('mouseup', onPullEnd);
  }

  function onPullStart(e) {
    if (!allBlown || isSnapped) return;
    paperPulling = true;
    const point = e.touches ? e.touches[0] : e;
    pullStartY = point.clientY;

    paperScroll.classList.add('pulling');
    if (pullProgressHint) pullProgressHint.classList.add('visible');
    if (pullHint) { pullHint.style.opacity = '0'; pullHint.classList.remove('visible'); }
  }

  function onPullMove(e) {
    if (!paperPulling) return;
    if (e.cancelable) e.preventDefault();

    const point = e.touches ? e.touches[0] : e;
    const dy = pullStartY - point.clientY; // upward drag = positive
    if (dy <= 0) {
      paperScroll.style.height = '0px';
      return;
    }

    currentPullHeight = Math.min(dy * 1.05, MAX_PULL);
    const ratio = currentPullHeight / MAX_PULL;

    // Scroll grows upward — container is bottom-anchored, scroll height increases upward
    paperScroll.style.height = currentPullHeight + 'px';

    if (pullProgressHint) {
      if (ratio < 0.25)       pullProgressHint.textContent = '⬆️ Keep pulling…';
      else if (ratio < 0.55)  pullProgressHint.textContent = '⬆️ Almost there…';
      else if (ratio < 0.85)  pullProgressHint.textContent = '⬆️ A little more!';
      else                    pullProgressHint.textContent = '✨ Let go!';
    }

    if (ratio > 0.18 && !photoShown) {
      photoShown = true;
      showScrollPhotos();
    }
  }

  function onPullEnd() {
    if (!paperPulling) return;
    paperPulling = false;

    const ratio = currentPullHeight / MAX_PULL;

    if (ratio > 0.42) {
      isSnapped = true;
      paperScroll.style.transition = 'height 0.5s cubic-bezier(0.34,1.2,0.64,1)';
      paperScroll.style.height = MAX_PULL + 'px';
      currentPullHeight = MAX_PULL;

      if (!photoShown) { photoShown = true; showScrollPhotos(); }

      if (pullProgressHint) {
        pullProgressHint.textContent = '🎉 Ta-da!';
        setTimeout(() => pullProgressHint.classList.remove('visible'), 1800);
      }
      setTimeout(() => {
        try {
          if (window.launchConfettiBurst)
            window.launchConfettiBurst(window.innerWidth / 2, window.innerHeight / 3, 120);
        } catch(e){}
      }, 200);
      setTimeout(() => { paperScroll.style.transition = ''; }, 700);

    } else {
      // Snap back
      paperScroll.style.transition = 'height 0.38s ease';
      paperScroll.style.height = '0px';
      currentPullHeight = 0;
      photoShown = false;

      if (pullProgressHint) pullProgressHint.classList.remove('visible');
      if (pullHint) pullHint.classList.add('visible');
      document.querySelectorAll('.scroll-photo-card').forEach(c => c.classList.remove('photo-visible'));
      setTimeout(() => { paperScroll.style.transition = ''; }, 450);
    }
  }

  function showScrollPhotos() {
    document.querySelectorAll('.scroll-photo-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('photo-visible'), i * 150 + 60);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
