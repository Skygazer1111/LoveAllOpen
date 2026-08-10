/**
 * Lightweight motion helpers — scroll reveals, parallax, page enter
 */

export function initMotion(root = document) {
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
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );
    reveals.forEach((el) => {
      const stagger = el.style.getPropertyValue('--stagger');
      if (stagger) el.style.setProperty('--reveal-delay', stagger);
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  const hero = root.querySelector('[data-parallax]');
  if (hero) {
    const onScroll = () => {
      const y = Math.min(window.scrollY * 0.28, 140);
      hero.style.transform = `translate3d(0, ${y}px, 0) scale(1.06)`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

export function animatePageEnter(el) {
  if (!el) return;
  el.classList.remove('page-enter');
  void el.offsetWidth;
  el.classList.add('page-enter');
}
