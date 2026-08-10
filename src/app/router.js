/**
 * LoveAll Tournament — Hash-based Router
 */

export class Router {
  constructor(routes, defaultRoute = '/') {
    this.routes = routes;
    this.defaultRoute = defaultRoute;
    this.currentRoute = null;
    this._onRouteChange = null;

    window.addEventListener('hashchange', () => this._handleRoute());
    window.addEventListener('load', () => this._handleRoute());
  }

  _handleRoute() {
    const hash = window.location.hash.slice(1) || this.defaultRoute;
    const route = this.routes.find(r => r.path === hash);

    if (route) {
      this.currentRoute = route;
      if (this._onRouteChange) {
        this._onRouteChange(route);
      }
    } else {
      this.navigate(this.defaultRoute);
    }
  }

  navigate(path) {
    window.location.hash = path;
  }

  onRouteChange(callback) {
    this._onRouteChange = callback;
  }

  getCurrentPath() {
    return window.location.hash.slice(1) || this.defaultRoute;
  }
}
