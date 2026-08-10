/**
 * Navbar — LoveAll Open
 * Shuttlecock flies between tabs on navigation
 */

const SHUTTLE_FLIGHT_KEY = 'loveall_nav_shuttle_flight';

const SHUTTLE_SVG = `
  <svg class="nav-shuttle-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <g class="nav-shuttle-feathers">
      <path d="M32 6c-2.2 8.5-3.4 14.8-3.6 20.2h7.2C35.4 20.8 34.2 14.5 32 6z" fill="currentColor" opacity="0.95"/>
      <path d="M22 10c1.2 8.2 2.8 14.2 4.4 18.8l6.2-2.2C30.8 21.4 28.2 15.6 22 10z" fill="currentColor" opacity="0.75"/>
      <path d="M42 10c-6.2 5.6-8.8 11.4-10.6 16.6l6.2 2.2C39.2 24.2 40.8 18.2 42 10z" fill="currentColor" opacity="0.75"/>
      <path d="M14 18c3.8 7.2 7.2 12.2 10.4 15.6l5-4.2C26.4 26.2 22.4 22 14 18z" fill="currentColor" opacity="0.55"/>
      <path d="M50 18c-8.4 4-12.4 8.2-15.4 11.4l5 4.2C42.8 30.2 46.2 25.2 50 18z" fill="currentColor" opacity="0.55"/>
    </g>
    <ellipse class="nav-shuttle-cork" cx="32" cy="42" rx="11" ry="13" fill="#f4efe6"/>
    <ellipse cx="32" cy="39" rx="8.5" ry="6" fill="#fff8ee" opacity="0.7"/>
    <path d="M22.5 45c2.8 4.8 6.2 7.5 9.5 7.5s6.7-2.7 9.5-7.5" fill="none" stroke="#c4b59a" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="32" cy="48.5" r="1.4" fill="#c4b59a"/>
  </svg>
`;

export function renderNavbar(currentPath) {
  const links = [
    { path: '/', label: 'Home' },
    { path: '/schedule', label: 'Fixtures' }
  ];

  const onHero = currentPath === '/';

  return `
    <nav class="navbar${onHero ? ' navbar-on-hero' : ' scrolled'}" id="main-navbar">
      <div class="navbar-inner">
        <a href="#/" class="navbar-brand">
          <img src="/images/icon.png" alt="LoveAll Club" />
          <div class="navbar-brand-text">
            <span class="navbar-brand-name">LoveAll</span>
            <span class="navbar-brand-sub">Open 2026</span>
          </div>
        </a>

        <div class="nav-capsule" id="nav-capsule">
          <span class="nav-shuttle" id="nav-shuttle" aria-hidden="true">${SHUTTLE_SVG}</span>
          <div class="navbar-links" id="navbar-links" role="navigation" aria-label="Primary">
            ${links.map(link => `
              <a href="#${link.path}"
                 class="navbar-link ${currentPath === link.path ? 'active' : ''}"
                 data-nav-path="${link.path}"
                 id="nav-${link.label.toLowerCase()}">
                <span class="navbar-link-label">${link.label}</span>
              </a>
            `).join('')}
          </div>
        </div>

        <button class="navbar-mobile-toggle" id="navbar-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="navbar-links">
          <i class='bx bx-menu'></i>
        </button>
      </div>
    </nav>
    <div class="navbar-backdrop" id="navbar-backdrop" hidden></div>
  `;
}

function getLinkCenter(link, capsule) {
  const c = capsule.getBoundingClientRect();
  const r = link.getBoundingClientRect();
  return {
    x: r.left - c.left + r.width / 2,
    y: r.top - c.top + r.height / 2
  };
}

function placeShuttle(shuttle, x, y, rotating = false) {
  shuttle.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)${rotating ? '' : ''}`;
  shuttle.style.setProperty('--shuttle-x', `${x}px`);
  shuttle.style.setProperty('--shuttle-y', `${y}px`);
}

function flyShuttle(shuttle, from, to, { reducedMotion = false } = {}) {
  if (reducedMotion) {
    placeShuttle(shuttle, to.x, to.y);
    shuttle.classList.add('is-settled');
    return;
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 4) {
    placeShuttle(shuttle, to.x, to.y);
    shuttle.classList.add('is-settled');
    return;
  }

  const goingRight = dx >= 0;
  const peak = Math.min(42, 18 + distance * 0.18);
  const mid = {
    x: from.x + dx * 0.5,
    y: from.y + dy * 0.5 - peak
  };

  shuttle.classList.remove('is-settled');
  shuttle.classList.add('is-flying');

  const spinStart = goingRight ? -28 : 28;
  const spinMid = goingRight ? 18 : -18;
  const spinEnd = goingRight ? 42 : -42;

  const animation = shuttle.animate(
    [
      {
        transform: `translate(${from.x}px, ${from.y}px) translate(-50%, -50%) rotate(${spinStart}deg) scale(0.92)`,
        offset: 0
      },
      {
        transform: `translate(${from.x + dx * 0.18}px, ${from.y + dy * 0.12 - peak * 0.35}px) translate(-50%, -50%) rotate(${spinStart * 0.2}deg) scale(1.08)`,
        offset: 0.2
      },
      {
        transform: `translate(${mid.x}px, ${mid.y}px) translate(-50%, -50%) rotate(${spinMid}deg) scale(1.18)`,
        offset: 0.48
      },
      {
        transform: `translate(${to.x - dx * 0.08}px, ${to.y - 6}px) translate(-50%, -50%) rotate(${spinEnd}deg) scale(1.05)`,
        offset: 0.82
      },
      {
        transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) rotate(0deg) scale(1)`,
        offset: 1
      }
    ],
    {
      duration: Math.min(900, 520 + distance * 0.55),
      easing: 'cubic-bezier(0.18, 0.9, 0.22, 1)',
      fill: 'forwards'
    }
  );

  animation.finished
    .then(() => {
      placeShuttle(shuttle, to.x, to.y);
      shuttle.classList.remove('is-flying');
      shuttle.classList.add('is-settled');
      shuttle.getAnimations().forEach((a) => a.cancel());
      // soft landing pulse
      shuttle.animate(
        [
          { transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(1)` },
          { transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(1.12)` },
          { transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(1)` }
        ],
        { duration: 320, easing: 'ease-out' }
      );
    })
    .catch(() => {
      placeShuttle(shuttle, to.x, to.y);
      shuttle.classList.remove('is-flying');
      shuttle.classList.add('is-settled');
    });
}

function initShuttle(currentPath) {
  const capsule = document.getElementById('nav-capsule');
  const shuttle = document.getElementById('nav-shuttle');
  const links = [...document.querySelectorAll('.navbar-link[data-nav-path]')];
  if (!capsule || !shuttle || !links.length) return;

  const active = links.find((l) => l.dataset.navPath === currentPath) || links[0];
  const to = getLinkCenter(active, capsule);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let flight = null;
  try {
    flight = JSON.parse(sessionStorage.getItem(SHUTTLE_FLIGHT_KEY) || 'null');
  } catch {
    flight = null;
  }
  sessionStorage.removeItem(SHUTTLE_FLIGHT_KEY);

  // Position shuttle for absolute layout inside capsule
  shuttle.style.left = '0';
  shuttle.style.top = '0';

  if (flight && typeof flight.fromX === 'number' && flight.toPath === currentPath) {
    const from = { x: flight.fromX, y: flight.fromY };
    placeShuttle(shuttle, from.x, from.y);
    // next frame so layout is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => flyShuttle(shuttle, from, to, { reducedMotion }));
    });
  } else {
    placeShuttle(shuttle, to.x, to.y);
    shuttle.classList.add('is-settled');
    if (!reducedMotion) {
      shuttle.animate(
        [
          { transform: `translate(${to.x}px, ${to.y - 10}px) translate(-50%, -50%) scale(0.7)`, opacity: 0.4 },
          { transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(1)`, opacity: 1 }
        ],
        { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );
    }
  }

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetPath = link.dataset.navPath;
      if (!targetPath || targetPath === currentPath) return;

      // Let hash routing proceed; stash flight start for next render
      const from = getLinkCenter(active, capsule);
      sessionStorage.setItem(
        SHUTTLE_FLIGHT_KEY,
        JSON.stringify({
          fromX: from.x,
          fromY: from.y,
          toPath: targetPath
        })
      );

      // Optional instant visual feedback mid-page if SPA doesn't remount fast enough
      if (!window.matchMedia('(max-width: 768px)').matches) {
        // don't prevent default — router uses hash
      }
    });
  });

  // Keep shuttle aligned on resize
  const onResize = () => {
    if (shuttle.classList.contains('is-flying')) return;
    const nextActive = document.querySelector('.navbar-link.active[data-nav-path]') || active;
    const center = getLinkCenter(nextActive, capsule);
    placeShuttle(shuttle, center.x, center.y);
  };
  window.addEventListener('resize', onResize, { passive: true });
}

export function initNavbar() {
  const toggle = document.getElementById('navbar-toggle');
  const links = document.getElementById('navbar-links');
  const capsule = document.getElementById('nav-capsule');
  const navbar = document.getElementById('main-navbar');
  const backdrop = document.getElementById('navbar-backdrop');
  const currentPath = window.location.hash.slice(1) || '/';

  const setMenuOpen = (open) => {
    if (!links || !toggle) return;
    links.classList.toggle('open', open);
    capsule?.classList.toggle('is-open', open);
    backdrop?.classList.toggle('open', open);
    if (backdrop) backdrop.hidden = !open;
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    const icon = toggle.querySelector('i');
    if (icon) icon.className = open ? 'bx bx-x' : 'bx bx-menu';

    if (open) {
      requestAnimationFrame(() => {
        const shuttle = document.getElementById('nav-shuttle');
        const active = document.querySelector('.navbar-link.active[data-nav-path]');
        if (shuttle && capsule && active) {
          const center = getLinkCenter(active, capsule);
          placeShuttle(shuttle, center.x, center.y);
          shuttle.classList.add('is-settled');
        }
      });
    }
  };

  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      setMenuOpen(!links.classList.contains('open') && !capsule?.classList.contains('is-open'));
    });

    backdrop?.addEventListener('click', () => setMenuOpen(false));

    links.querySelectorAll('.navbar-link').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    window.addEventListener('hashchange', () => setMenuOpen(false));
  }

  requestAnimationFrame(() => initShuttle(currentPath));
}
