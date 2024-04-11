export default class Hooks {
    static stateManager = null; // Shared state manager

    static initialize(stateManagerInstance) {
        Hooks.stateManager = stateManagerInstance;
    }

    static useState(initial) {
        const oldHook = Hooks.stateManager.getWipFiber().alternate &&
            Hooks.stateManager.getWipFiber().alternate.hooks &&
            Hooks.stateManager.getWipFiber().alternate.hooks[Hooks.stateManager.getHookIndex()];

        const hook = {
            state: oldHook ? oldHook.state : initial,
            queue: [],
        };

        const actions = oldHook ? oldHook.queue : [];
        actions.forEach(action => {
            hook.state = action(hook.state);
        });

        const setState = action => {
          const isActionFunction = typeof action === 'function';
            hook.queue.push(currentState => {
                return isActionFunction ? action(currentState) : action;
            });
            let wipRoot = {
                dom: Hooks.stateManager.getCurrentRoot().dom,
                props: Hooks.stateManager.getCurrentRoot().props,
                alternate: Hooks.stateManager.getCurrentRoot(),
            };
            Hooks.stateManager.setWorkInProgressRoot(wipRoot);
            Hooks.stateManager.setNextUnitOfWork(Hooks.stateManager.getWorkInProgressRoot());
            Hooks.stateManager.setDeletions([]);
        };

        Hooks.stateManager.getWipFiber().hooks.push(hook);
        Hooks.stateManager.setHookIndex(Hooks.stateManager.getHookIndex() + 1);
        return [hook.state, setState];
    }

  static useEffect(effect, deps) {
    const oldHook = Hooks.stateManager.getWipFiber().alternate &&
      Hooks.stateManager.getWipFiber().alternate.hooks &&
      Hooks.stateManager.getWipFiber().alternate.hooks[Hooks.stateManager.getHookIndex()];

    const hook = {
      deps,
      effect,
      cleanup: null,
    };

    if (oldHook) {
      const hasChangedDeps = deps ? !deps.every((dep, i) => dep === oldHook.deps[i]) : true;
      if (hasChangedDeps) {
        if (oldHook.cleanup) {
          oldHook.cleanup(); // Cleanup the previous effect
        }
        hook.cleanup = effect(); // Run the effect and store any cleanup function
      }
    } else {
      hook.cleanup = effect(); // This is the first run, so there are no old dependencies
    }

    Hooks.stateManager.getWipFiber().hooks.push(hook);
    Hooks.stateManager.setHookIndex(Hooks.stateManager.getHookIndex() + 1);
  }

  static useContext(context) {
    const currentFiber = Hooks.stateManager.getWipFiber();
    console.log('currentFiber', currentFiber);
    const oldHook = currentFiber.alternate && currentFiber.alternate.hooks && currentFiber.alternate.hooks[Hooks.stateManager.getHookIndex()];
    console.log('oldHook', oldHook);

    const hook = {
      state: oldHook ? oldHook.state : context._currentValue,
      queue: [],
    };

    if (!oldHook) {
      // Only subscribe the component to the context changes if it's the first render
      context._subscribers.push(() => {
        hook.state = context._currentValue;
        console.log('Context changed', hook.state);
        // Trigger re-render of the component subscribed to the context
        let wipRoot = {
          dom: Hooks.stateManager.getCurrentRoot().dom,
          props: Hooks.stateManager.getCurrentRoot().props,
          alternate: Hooks.stateManager.getCurrentRoot(),
          // dom: currentFiber.dom, // Might need adjustment based on your stateManager structure
          // props: currentFiber.props,
          // alternate: currentFiber,
        };
        // console.log('wipRoot', wipRoot);
        // console.log('currentFiber type ', currentFiber.type);
        Hooks.stateManager.setWorkInProgressRoot(wipRoot);
        Hooks.stateManager.setNextUnitOfWork(Hooks.stateManager.getWorkInProgressRoot());
        Hooks.stateManager.setDeletions([]);
      });
    }

    Hooks.stateManager.getWipFiber().hooks.push(hook);
    Hooks.stateManager.setHookIndex(Hooks.stateManager.getHookIndex() + 1);

    return hook.state;
  }
}
