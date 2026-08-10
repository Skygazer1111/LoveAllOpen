/**
 * Navbar — LoveAll Open
 */

export function renderNavbar(currentPath) {
  const links = [
    { path: '/', label: 'Home' },
    { path: '/schedule', label: 'Fixtures' },
    { path: '/admin', label: 'Admin' }
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
               class="navbar-link ${currentPath === link.path ? 'active' : ''}${link.path === '/admin' ? ' navbar-link-admin' : ''}"
               id="nav-${link.label.toLowerCase()}">
              ${link.label}
            </a>
          `).join('')}
        </div>
        <button class="navbar-mobile-toggle" id="navbar-toggle" aria-label="Toggle navigation">
          <i class='bx bx-menu'></i>
        </button>
      </div>
    </nav>
  `;
}

export function initNavbar() {
  const toggle = document.getElementById('navbar-toggle');
  const links = document.getElementById('navbar-links');
  const navbar = document.getElementById('main-navbar');

  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.className = links.classList.contains('open') ? 'bx bx-x' : 'bx bx-menu';
      }
    });

    links.querySelectorAll('.navbar-link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        const icon = toggle.querySelector('i');
        if (icon) icon.className = 'bx bx-menu';
      });
    });
  }
}
