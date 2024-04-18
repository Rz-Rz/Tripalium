import BaseContext from './BaseContext';
import qs from 'querystringify';

export default class RoutingContext extends BaseContext {
  constructor() {
    super({
      path: window.location.pathname,
      query: RoutingContext.parseQuery(window.location.search)
    });
    this.navigate = this.navigate.bind(this);
    console.log('RoutingContext initialized:', this.value);

  }

  static parseQuery(search) {
    return qs.parse(search.startsWith('?') ? search.slice(1) : search);
  }

  static stringifyQuery(query) {
    const queryString = qs.stringify(query);
    return queryString ? `?${queryString}` : '';
  }

  navigate(path, query = {}, pushState = true) {
    const search = RoutingContext.stringifyQuery(query);
    console.log('Navigating to:', path, query);
    if (pushState) {
      window.history.pushState({}, '', `${path}${search}`);
    } else {
      window.history.replaceState({}, '', `${path}${search}`);
    }
    this.updateValue({ path, query });
  }
}

export const routingContext = new RoutingContext();
