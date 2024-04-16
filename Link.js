/** @jsx Didact.createElement */
import Didact from './Didact'

import { routingContext } from './RoutingContext';

export default function Link({ to, className, children }) {
	const navigate = (e) => {
		e.preventDefault();
		routingContext.navigate(to, {}, true);
	};

	return (
		<a href={to} className={className} onClick={navigate}>
		{children}
		</a>
	);
}
