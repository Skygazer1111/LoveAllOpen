/**
 * LoveAll Tournament 2026 — Main Entry Point
 * Initializes router, renders pages, and manages navigation
 */

import { Router } from './router.js';
import { renderNavbar, initNavbar } from './components/navbar.js';
import { renderHomePage, initHomePage } from './pages/home.js';
import { renderSchedulePage, initSchedulePage } from './pages/schedule.js';
import { renderAdminPage, initAdminPage } from './pages/admin.js';
import { animatePageEnter } from './motion.js';

// Expose navbar module globally for admin page's re-render trick
window.__navbarModule = { renderNavbar, initNavbar };

const app = document.getElementById('app');

const routes = [
  { path: '/', name: 'home', render: renderHomePage, init: initHomePage },
  { path: '/schedule', name: 'schedule', render: renderSchedulePage, init: initSchedulePage },
  { path: '/admin', name: 'admin', render: renderAdminPage, init: initAdminPage }
];

const router = new Router(routes, '/');

function renderPage(route) {
  if (!route) return;

  const navbarHtml = renderNavbar(route.path);
  const pageHtml = route.render();
  app.innerHTML = navbarHtml + pageHtml;

  initNavbar();

  if (route.init) {
    route.init();
  }

  const page = app.querySelector('.page');
  animatePageEnter(page);
  window.scrollTo(0, 0);
}

router.onRouteChange((route) => {
  renderPage(route);
});

// Initial render
const initialPath = window.location.hash.slice(1) || '/';
const initialRoute = routes.find(r => r.path === initialPath) || routes[0];
renderPage(initialRoute);
