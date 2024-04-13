import BaseContext from './BaseContext';
import qs from 'querystringify';

class RoutingContext extends BaseContext {
  constructor() {
    super({
      path: window.location.pathname,
      query: RoutingContext.parseQuery(window.location.search)
    });
    console.log('RoutingContext initialized:', this.value);
  }

  static parseQuery(search) {
    return qs.parse(search.startsWith('?') ? search.slice(1) : search);
  }

  static stringifyQuery(query) {
    const queryString = qs.stringify(query);
    return queryString ? `?${queryString}` : '';
  }

  navigate(path, query = {}) {
    console.log('Navigating to:', path, query);
    const search = RoutingContext.stringifyQuery(query);
    window.history.pushState({}, '', `${path}${search}`);
    this.updateValue({ path, query });
  }

}

export const routingContext = new RoutingContext();

