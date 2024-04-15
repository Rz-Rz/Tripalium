/** @jsx Didact.createElement */
import Didact from './Didact'

import { routingContext } from './RoutingContext';

export default function Link({ to, children }) {
	const navigate = (e) => {
		e.preventDefault();
		routingContext.navigate(to, {}, true);
	};

	return (
		<a href={to} onClick={navigate}>
		{children}
		</a>
	);
}
