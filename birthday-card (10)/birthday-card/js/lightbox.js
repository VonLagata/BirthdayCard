/* lightbox.js — full-screen photo viewer for scroll photo cards */
(function () {
  'use strict';

  const lightbox = document.getElementById('photoLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');

  if (!lightbox) return;

  /* Open lightbox from a .scroll-photo-card element */
  window.openLightbox = function (card) {
    const img = card.querySelector('.scroll-photo-img');
    const caption = card.querySelector('.scroll-photo-label');
    if (!img) return;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    lightboxCaption.textContent = caption ? caption.textContent : '';

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent scroll behind
  };

  window.closeLightbox = function () {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Clear src after animation so image doesn't flash
    setTimeout(() => { lightboxImg.src = ''; }, 350);
  };

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Prevent pull/scroll events from bleeding through when lightbox is open
  lightbox.addEventListener('touchmove', (e) => {
    if (lightbox.classList.contains('open')) e.preventDefault();
  }, { passive: false });

})();
