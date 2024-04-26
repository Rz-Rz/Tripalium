// Import the stringify and parse functions from the flatted library
import { stringify, parse } from 'flatted';

export function debugLog(...args) {
    // Process each argument separately
    const processedArgs = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
            try {
                // Use Flatted to handle circular references
                return parse(stringify(arg));
            } catch (error) {
                // Handle any errors during the stringify/parse process
                return "Failed to stringify object: " + error.message;
            }
        } else {
            // Non-object types are logged as is
            return arg;
        }
    });

    // Log all processed arguments
    console.log(...processedArgs);
}
