/**
 * App bootstrap — router, shell, page rendering
 */

import { Router } from './app/router.js';
import { renderNavbar, initNavbar } from './ui/layout/navbar.js';
import { renderHomePage, initHomePage } from './features/home/page.js';
import { renderSchedulePage, initSchedulePage } from './features/schedule/page.js';
import { renderAdminPage, initAdminPage } from './features/admin/page.js';
import {
  renderPrivacyPage,
  renderTermsPage,
  initPrivacyPage,
  initTermsPage
} from './features/legal/page.js';
import { animatePageEnter } from './ui/motion.js';

// Expose navbar for admin re-render after login
window.__navbarModule = { renderNavbar, initNavbar };

const app = document.getElementById('app');

const routes = [
  { path: '/', name: 'home', render: renderHomePage, init: initHomePage },
  { path: '/schedule', name: 'schedule', render: renderSchedulePage, init: initSchedulePage },
  { path: '/admin', name: 'admin', render: renderAdminPage, init: initAdminPage },
  { path: '/privacy', name: 'privacy', render: renderPrivacyPage, init: initPrivacyPage, hideNavbar: true },
  { path: '/terms', name: 'terms', render: renderTermsPage, init: initTermsPage, hideNavbar: true }
];

const router = new Router(routes, '/');

function renderPage(route) {
  if (!route) return;

  const navbarHtml = route.hideNavbar ? '' : renderNavbar(route.path);
  const pageHtml = route.render();
  app.innerHTML = navbarHtml + pageHtml;

  if (!route.hideNavbar) {
    initNavbar();
  }

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

const initialPath = window.location.hash.slice(1) || '/';
const initialRoute = routes.find(r => r.path === initialPath) || routes[0];
renderPage(initialRoute);
