import qs from 'querystringify';

class RoutingContext {
  constructor() {
    this._currentRoute = {
      path: window.location.pathname,
      query: this.parseQuery(window.location.search)
    };
    this._subscribers = [];
  }

  navigate(path, query = {}) {
    const search = this.stringifyQuery(query);
    window.history.pushState({}, "", `${path}${search}`);
    this._currentRoute = { path, query };
    this._subscribers.forEach(subscriber => subscriber());
  }

  subscribe(subscriber) {
    this._subscribers.push(subscriber);
    return () => {
      this._subscribers = this._subscribers.filter(sub => sub !== subscriber);
    };
  }

  get route() {
    return this._currentRoute;
  }

  // Helper method to parse query strings using querystringify
  parseQuery(search) {
    // The `parse` method of querystringify includes the leading '?', so we remove it
    return qs.parse(search.startsWith('?') ? search.slice(1) : search);
  }

  // Helper method to stringify query parameters using querystringify
  stringifyQuery(query) {
    // The `stringify` method of querystringify returns a query string without the leading '?'
    const queryString = qs.stringify(query);
    return queryString ? `?${queryString}` : '';
  }
}

export const routingContext = new RoutingContext();
