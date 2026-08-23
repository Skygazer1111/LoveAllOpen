/**
 * Crossfading hero background slideshow
 */

const SLIDE_MS = 5500;
const FADE_MS = 1200;

let timerId = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function destroyHeroSlideshow() {
  if (timerId != null) {
    clearInterval(timerId);
    timerId = null;
  }
}

export function initHeroSlideshow(root = document) {
  destroyHeroSlideshow();

  const slideshow = root.querySelector('.hero-slideshow');
  if (!slideshow) return;

  const slides = [...slideshow.querySelectorAll('.hero-slide')];
  if (slides.length < 2) return;

  let index = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (index < 0) {
    index = 0;
    slides[0].classList.add('is-active');
  }

  slideshow.style.setProperty('--hero-fade-ms', `${FADE_MS}ms`);

  if (prefersReducedMotion()) return;

  timerId = window.setInterval(() => {
    const current = slides[index];
    index = (index + 1) % slides.length;
    const next = slides[index];

    next.classList.add('is-active');
    current.classList.remove('is-active');
  }, SLIDE_MS);
}
