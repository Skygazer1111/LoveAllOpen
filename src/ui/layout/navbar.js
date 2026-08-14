/**
 * Navbar — LoveAll Open
 */

export function renderNavbar(currentPath) {
  // Admin stays available at #/admin but is intentionally hidden from public nav
  const links = [
    { path: '/', label: 'Home' },
    { path: '/schedule', label: 'Fixtures' },
    { path: '/rules', label: 'Rules' }
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
        <div class="navbar-links" id="navbar-links">
          ${links.map(link => `
            <a href="#${link.path}"
               class="navbar-link ${currentPath === link.path ? 'active' : ''}"
               id="nav-${link.label.toLowerCase()}">
              ${link.label}
            </a>
          `).join('')}
        </div>
        <button class="navbar-mobile-toggle" id="navbar-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="navbar-links">
          <i class='bx bx-menu'></i>
        </button>
      </div>
    </nav>
    <div class="navbar-backdrop" id="navbar-backdrop" hidden></div>
  `;
}

export function initNavbar() {
  const toggle = document.getElementById('navbar-toggle');
  const links = document.getElementById('navbar-links');
  const navbar = document.getElementById('main-navbar');
  const backdrop = document.getElementById('navbar-backdrop');

  const setMenuOpen = (open) => {
    if (!links || !toggle) return;
    links.classList.toggle('open', open);
    backdrop?.classList.toggle('open', open);
    if (backdrop) backdrop.hidden = !open;
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    const icon = toggle.querySelector('i');
    if (icon) icon.className = open ? 'bx bx-x' : 'bx bx-menu';
  };

  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      setMenuOpen(!links.classList.contains('open'));
    });

    backdrop?.addEventListener('click', () => setMenuOpen(false));

    links.querySelectorAll('.navbar-link').forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    window.addEventListener('hashchange', () => setMenuOpen(false));
  }
}
