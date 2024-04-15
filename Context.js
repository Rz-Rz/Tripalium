import StateManager from './StateManager';

class Context {
  constructor(defaultValue) {
    this.value = defaultValue;
    this.subscribers = new Set();
  }

  provide(newValue) {
    if (newValue !== this.value) {
      this.value = newValue;
      this.subscribers.forEach(component => component.update());
    }
  }

  subscribe(component) {
    this.subscribers.add(component);
  }

  unsubscribe(component) {
    this.subscribers.delete(component);
  }
}

export function createContext(defaultValue) {
  return new Context(defaultValue);
}

export function useContext(context) {
  const fiber = StateManager.instance.getWipFiber();
  context.subscribe(fiber);
  fiber.cleanup = () => context.unsubscribe(fiber);  // Cleanup on unmount

  return context.value;
}

export function ContextProvider({ value, context, children }) {
  context.provide(value);
  return children;
}

