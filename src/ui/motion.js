/**
 * Lightweight motion helpers — scroll reveals, parallax, page enter
 */

let revealObserver = null;
let parallaxHandler = null;

export function initMotion(root = document) {
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
  if (parallaxHandler) {
    window.removeEventListener('scroll', parallaxHandler);
    parallaxHandler = null;
  }

  // Fixtures page: skip reveal animations — they flash blank during live updates
  if (root?.id === 'schedule-page' || root?.closest?.('#schedule-page') || root?.querySelector?.('#schedule-page')) {
    root.querySelectorAll?.('[data-reveal]')?.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  root.querySelectorAll('[data-stagger]').forEach((parent) => {
    [...parent.children].forEach((child, i) => {
      child.style.setProperty('--stagger', `${i * 70}ms`);
      if (!child.hasAttribute('data-reveal')) {
        child.setAttribute('data-reveal', '');
      }
    });
  });

  const reveals = root.querySelectorAll('[data-reveal]');
  if (reveals.length && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );
    reveals.forEach((el) => {
      const stagger = el.style.getPropertyValue('--stagger');
      if (stagger) el.style.setProperty('--reveal-delay', stagger);
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  const hero = root.querySelector('[data-parallax]');
  if (hero) {
    parallaxHandler = () => {
      const y = Math.min(window.scrollY * 0.28, 140);
      hero.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    parallaxHandler();
    window.addEventListener('scroll', parallaxHandler, { passive: true });
  }
}

export function animatePageEnter(el) {
  if (!el) return;
  if (el.id === 'schedule-page') return;
  el.classList.remove('page-enter');
  void el.offsetWidth;
  el.classList.add('page-enter');
}
