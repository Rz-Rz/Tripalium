export default class Hooks {
  static stateManager = null; // Shared state manager

  static initialize(stateManagerInstance) {
    Hooks.stateManager = stateManagerInstance;
  }

  static getOldHook() {
    const oldHook =
      Hooks.stateManager.getWipFiber().alternate &&
      Hooks.stateManager.getWipFiber().alternate.hooks &&
      Hooks.stateManager.getWipFiber().alternate.hooks[
      Hooks.stateManager.getHookIndex()
      ];
    return oldHook;
  }

  static useState(initial) {
    const oldHook = Hooks.getOldHook();

    const hook = {
      state: oldHook ? oldHook.state : initial,
      queue: [],
    };

    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action) => {
      hook.state = action(hook.state);
    });

    const setState = (action) => {
      const isActionFunction = typeof action === "function";
      hook.queue.push((currentState) => {
        return isActionFunction ? action(currentState) : action;
      });
      let wipRoot = {
        dom: Hooks.stateManager.getCurrentRoot().dom,
        props: Hooks.stateManager.getCurrentRoot().props,
        alternate: Hooks.stateManager.getCurrentRoot(),
      };
      // console.log("useState: wipRoot", wipRoot);
      Hooks.stateManager.setWorkInProgressRoot(wipRoot);
      Hooks.stateManager.setNextUnitOfWork(
        Hooks.stateManager.getWorkInProgressRoot(),
      );
      Hooks.stateManager.setDeletions([]);
    };

    Hooks.stateManager.getWipFiber().hooks.push(hook);
    Hooks.stateManager.setHookIndex(Hooks.stateManager.getHookIndex() + 1);
    return [hook.state, setState];
  }

  static useEffect(effect, deps) {
    const index = Hooks.stateManager.getHookIndex();
    const wipFiber = Hooks.stateManager.getWipFiber();
    const oldHook =
      wipFiber.alternate &&
      wipFiber.alternate.hooks &&
      wipFiber.alternate.hooks[index];

    if (oldHook) {
      console.log("useEffect: oldHook", oldHook);
      console.dir(oldHook);
      const hasChangedDeps = deps
        ? !deps.every((dep, i) => dep === oldHook.deps[i])
        : true;
      console.log("useEffect: hasChangedDeps");
      console.dir(hasChangedDeps);
      if (hasChangedDeps) {
        if (oldHook.cleanup) {
          console.log("useEffect: cleanup", oldHook.cleanup);
          oldHook.cleanup(); // Cleanup the previous effect
        }
        const cleanup = effect(); // Run the effect and store any cleanup function
        wipFiber.hooks[index] = { deps, effect, cleanup }; // Update the hook with new values
        console.log("useEffect: cleanup", cleanup);
      } else {
        console.log("Deps Not Changed : Skipping cleanup");
        wipFiber.hooks[index] = oldHook; // Retain the old hook if dependencies haven't changed
      }
    } else {
      console.log("First run of useEffect");
      const cleanup = effect(); // This is the first run
      wipFiber.hooks[index] = { deps, effect, cleanup }; // Create a new hook
    }
    Hooks.stateManager.setHookIndex(index + 1);
  }

  // static useEffect(effect, deps) {
  //   const oldHook =
  //     Hooks.stateManager.getWipFiber().alternate &&
  //     Hooks.stateManager.getWipFiber().alternate.hooks &&
  //     Hooks.stateManager.getWipFiber().alternate.hooks[
  //     Hooks.stateManager.getHookIndex()
  //     ];
  //   const hook = {
  //     deps,
  //     effect,
  //     cleanup: null,
  //   };
  //   if (oldHook) {
  //     console.log("useEffect: oldHook", oldHook);
  //     const hasChangedDeps = deps
  //       ? !deps.every((dep, i) => dep === oldHook.deps[i])
  //       : true;
  //     console.log("useEffect: hasChangedDeps");
  //     console.dir(hasChangedDeps);
  //     if (hasChangedDeps) {
  //       console.log("Deps Changed : Running cleanup");
  //       if (oldHook.cleanup) {
  //         console.log("useEffect: cleanup", oldHook.cleanup);
  //         oldHook.cleanup(); // Cleanup the previous effect
  //       }
  //       console.log("useEffect: effect" + effect);
  //       hook.cleanup = effect(); // Run the effect and store any cleanup function
  //     }
  //     else {
  //       console.log("Deps Not Changed : Skipping cleanup");
  //       hook.cleanup = oldHook.cleanup; // Reuse the cleanup function
  //     }
  //   } else {
  //     console.log("First run of useEffect");
  //     hook.cleanup = effect(); // This is the first run, so there are no old dependencies
  //     console.log("useEffect: hook.cleanup", hook.cleanup);
  //     console.dir(hook.cleanup);
  //   }
  //   console.log("useEffect: hook", hook);
  //   console.dir(hook);
  //   Hooks.stateManager.getWipFiber().hooks.push(hook);
  //   Hooks.stateManager.setHookIndex(Hooks.stateManager.getHookIndex() + 1);
  // }

  static useContext(context) {
    const currentFiber = Hooks.stateManager.getWipFiber();
    // console.log('Context: currentFiber', currentFiber);
    const oldHook =
      currentFiber.alternate &&
      currentFiber.alternate.hooks &&
      currentFiber.alternate.hooks[Hooks.stateManager.getHookIndex()];
    // console.log('Context: oldHook', oldHook);

    let hook;
    if (oldHook) {
      // console.log('Context: oldHook.state', oldHook.state);
      // if (oldHook.cleanup) {
      //   oldHook.cleanup();
      // }
      hook = oldHook;
    } else {
      hook = {
        state: context.value,
        cleanup: null,
      };
    }

    // Determine if this is a route context
    const isRouteContext = context.isRouteContext || false;

    if (context.subscribe && !hook.cleanup) {
      // Only subscribe if we do not already have a cleanup function (to avoid duplicate subscriptions)
      // console.log('Context: hook', hook);
      hook.cleanup = context.subscribe(() => {
        // console.log('Context value changed, updating hook state');
        hook.state = context.value;
        const wipRoot = {
          dom: Hooks.stateManager.getCurrentRoot().dom,
          props: Hooks.stateManager.getCurrentRoot().props,
          alternate: Hooks.stateManager.getCurrentRoot(),
        };
        // console.log('Context: wipRoot', wipRoot);
        Hooks.stateManager.setWorkInProgressRoot(wipRoot);
        Hooks.stateManager.setNextUnitOfWork(
          Hooks.stateManager.getWorkInProgressRoot(),
        );
        Hooks.stateManager.setDeletions([]);
      });
      if (isRouteContext) {
        // For route contexts, modify how cleanup is handled
        hook.cleanup = () => {
          // Potentially log or handle the fact that routes do not cleanup in the usual way
          // console.log("Route context cleanup called, no action taken.");
        };
      }
    }
    Hooks.stateManager.getWipFiber().hooks.push(hook);
    Hooks.stateManager.setHookIndex(Hooks.stateManager.getHookIndex() + 1);
    return hook.state;
  }
}
