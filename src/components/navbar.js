/**
 * Navbar Component — Neon themed
 */

export function renderNavbar(currentPath) {
  const links = [
    { path: '/', label: 'Home', icon: 'bx-home-alt' },
    { path: '/schedule', label: 'Schedule', icon: 'bx-list-ul' },
    { path: '/admin', label: 'Admin', icon: 'bx-cog' }
  ];

  return `
    <nav class="navbar" id="main-navbar">
      <div class="navbar-inner">
        <a href="#/" class="navbar-brand">
          <img src="/images/icon.png" alt="LoveAll Club" />
          <div class="navbar-brand-text">
            <span class="navbar-brand-name">LoveAll Open</span>
            <span class="navbar-brand-sub">Tournament 2026</span>
          </div>
        </a>
        <div class="navbar-links" id="navbar-links">
          ${links.map(link => `
            <a href="#${link.path}" 
               class="navbar-link ${currentPath === link.path ? 'active' : ''}"
               id="nav-${link.label.toLowerCase()}">
              <i class='bx ${link.icon}'></i>
              <span>${link.label}</span>
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
