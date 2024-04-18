import StateManager from "./StateManager";
import Utils from "./Utils";

export default class Renderer {
  static instance;
  constructor(reconciler) {
    if (!Renderer.instance) {
      this.reconciler = reconciler;
      this.stateManager = new StateManager();
      this.workLoop = this.workLoop.bind(this);
      this.commitWork = this.commitWork.bind(this);
      this.commitDeletion = this.commitDeletion.bind(this);
      Renderer.instance = this;
    }
    return Renderer.instance;
  }

  static getInstance() {
    if (!Renderer.instance) {
      Renderer.instance = new Renderer();
    }
    return Renderer.instance;
  }

  aggressiveIdleCallback(callback, options = { timeout: 100 }) {
    const tick = () => {
      const deadline = {
        didTimeout: false,
        timeRemaining: () => Infinity,
      };
      callback(deadline); // Run the passed workLoop with simulated deadline object
      setTimeout(() => window.requestAnimationFrame(tick), options.timeout); // Recur at specified timeout
    };

    window.requestAnimationFrame(tick);
  }

  workLoop(deadline) {
    // console.log("workLoop");
    let shouldYield = false;
    while (this.stateManager.getNextUnitOfWork() && !shouldYield) {
      this.stateManager.setNextUnitOfWork(
        this.reconciler.performUnitOfWork(
          this.stateManager.getNextUnitOfWork(),
        ),
      );
      shouldYield = deadline.timeRemaining() <= 1 || deadline.didTimeout;
    }

    if (
      !this.stateManager.getNextUnitOfWork() &&
      this.stateManager.getWorkInProgressRoot()
    ) {
      this.commitRoot();
    }

    // Only schedule new work if there's more to do
    if (this.stateManager.getNextUnitOfWork()) {
      this.aggressiveIdleCallback(this.workLoop);
    } else {
      // console.log("No more work. Idle now.");
    }
  }

  render(element, container) {
    let wipRoot = {
      dom: container,
      props: {
        children: [element],
      },
      // alternate: currentRoot,
      alternate: this.stateManager.getCurrentRoot(),
    };
    this.stateManager.setWorkInProgressRoot(wipRoot);
    // deletions = []
    this.stateManager.setDeletions([]);
    // nextUnitOfWork = wipRoot
    this.stateManager.setNextUnitOfWork(
      this.stateManager.getWorkInProgressRoot(),
    );
    this.aggressiveIdleCallback(this.workLoop);
    // window.requestIdleCallback(this.workLoop)
  }

  commitRoot() {
    let deletions = this.stateManager.getDeletions();
    deletions.forEach(this.commitWork);
    this.commitWork(this.stateManager.getWorkInProgressRoot().child);
    // currentRoot = wipRoot
    this.stateManager.setCurrentRoot(this.stateManager.getWorkInProgressRoot());
    // wipRoot = null
    this.stateManager.setWorkInProgressRoot(null);
  }

  commitWork(fiber) {
    if (!fiber) {
      return;
    }

    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
      domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber.dom;

    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
      domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
      Utils.updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === "DELETION") {
      this.commitDeletion(fiber, domParent);
    }
    this.commitWork(fiber.child);
    this.commitWork(fiber.sibling);
  }

  commitDeletion(fiber, domParent) {
    if (fiber.dom) {
      // If the fiber has a DOM node, remove it from the DOM
      if (domParent && domParent.contains(fiber.dom)) {
        domParent.removeChild(fiber.dom);
      }
    } else if (fiber.child) {
      // If the fiber does not have a DOM node but has a child, recurse on the child
      this.commitDeletion(fiber.child, domParent);
    }
  }

}
