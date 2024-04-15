import Didact from './Didact'; // Assuming Didact exports useEffect
import { routingContext } from './RoutingContext';

export default function RouterProvider({ children }) {
  console.log('RouterProvider children:', children);
  Didact.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const query = Didact.RoutingContext.parseQuery(window.location.search);
      console.log('Popstate path:', path, 'query:', query);
      // Update routing context based on current browser location
      routingContext.navigate(path, query, false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      console.log('Removing popstate event listener');
      window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  return children;
}
