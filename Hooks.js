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
    console.log('Context: currentFiber', currentFiber);
    const oldHook = currentFiber.alternate && currentFiber.alternate.hooks && currentFiber.alternate.hooks[Hooks.stateManager.getHookIndex()];
    console.log('Context: oldHook', oldHook);

    let hook;
    if (oldHook) {
      console.log('Context: oldHook.state', oldHook.state);
      if (oldHook.cleanup) {
        oldHook.cleanup();
      }
      hook = oldHook;
    } else {
      hook = {
        state: context.value,
        cleanup: null
      };
    }
    if (context.subscribe && !hook.cleanup) {
      // Only subscribe if we do not already have a cleanup function (to avoid duplicate subscriptions)
      console.log('Context: hook', hook);
      hook.cleanup = context.subscribe(() => {
        console.log('Context value changed, updating hook state');
        hook.state = context.value;
        const wipRoot = {
          dom: Hooks.stateManager.getCurrentRoot().dom,
          props: Hooks.stateManager.getCurrentRoot().props,
          alternate: Hooks.stateManager.getCurrentRoot(),
        };
        console.log('Context: wipRoot', wipRoot);
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
