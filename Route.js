import Didact from './Didact'; // Adjust based on your actual exports
import { routingContext } from './RoutingContext';

// Assuming you've set up RoutingContext and useContext similarly to React
export default function Route({ path, component, exact = false }) {
  const { route } = Didact.useContext(routingContext); // Accessing the current route from context

  const match = exact ? route.path === path : route.path.startsWith(path);
  // Exact match vs. startsWith allows for nested routes if exact is false

  if (match) {
    // If there's a match, render the specified component
    // Your library's syntax for rendering a component might differ
    return component();
  } else {
    // If no match, render nothing or an alternative
    return null;
  }
}
