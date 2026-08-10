/**
 * Navbar Component
 */

export function renderNavbar(currentPath) {
  const links = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/schedule', label: 'Schedule', icon: '📋' },
    { path: '/admin', label: 'Admin', icon: '⚙️' }
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
              <span>${link.icon}</span>
              <span>${link.label}</span>
            </a>
          `).join('')}
        </div>
        <button class="navbar-mobile-toggle" id="navbar-toggle" aria-label="Toggle navigation">
          ☰
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
      toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });

    // Close on link click (mobile)
    links.querySelectorAll('.navbar-link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.textContent = '☰';
      });
    });
  }
}
