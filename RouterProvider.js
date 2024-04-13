import Didact from './Didact'; // Assuming Didact exports useEffect
import { routingContext } from './RoutingContext';

export default function RouterProvider({ children }) {
	console.log('RouterProvider children:', children);
	const handlePopState = () => {
		console.log('Popstate event triggered');
		const path = window.location.pathname;
		const query = Didact.RoutingContext.parseQuery(window.location.search);
		console.log('Popstate path:', path, 'query:', query);
		// Update routing context based on current browser location
		routingContext.navigate(path, query);
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
