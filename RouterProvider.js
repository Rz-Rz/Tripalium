import Didact from './Didact'; // Assuming Didact exports useEffect
import { routingContext } from './RoutingContext';

export default function RouterProvider({ children }) {
	console.log('RouterProvider children:', children);
  const handlePopState = () => {
	  console.log('Popstate event triggered');
    // Update routing context based on current browser location
    routingContext.navigate(window.location.pathname, routingContext.parseQuery(window.location.search));
  };

  Didact.useEffect(() => {
    window.addEventListener('popstate', handlePopState);
    return () => {
	    console.log('Removing popstate event listener');
	    window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  return children;
}
