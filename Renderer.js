import StateManager from "./StateManager";
import Utils from "./Utils";
import { debugLog } from "./Logs";

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

  aggressiveIdleCallback(callback, options = { timeout: 120 }) {
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
      // console.log("WorkLoop: Committing root", this.stateManager.getWorkInProgressRoot());
      // console.log("WorkLoop: getNextUnitOfWork", this.stateManager.getNextUnitOfWork());
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
    // console.log("setting wipRoot: ", wipRoot);
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
    // console.log("Commit Root");
    let deletions = this.stateManager.getDeletions();
    // console.log("Deletions: ", deletions);
    deletions.forEach(this.commitWork);
    // console.log("WIP Root child: ", this.stateManager.getWorkInProgressRoot().child);
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
    // console.log("Commit Work: ", fiber);
    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
      domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber.dom;

    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
      domParent.appendChild(fiber.dom);
      // console.log("Commit Work: Placement", fiber, "with dom parent", domParent);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
      Utils.updateDom(fiber.dom, fiber.alternate.props, fiber.props);
      // console.log("Commit Work: Update", fiber, "with dom parent", domParent);
    } else if (fiber.effectTag === "DELETION") {
      // console.log("Commit Work: Deletion", fiber, "with dom parent", domParent);
      this.commitDeletion(fiber, domParent);
    }
    // console.log("Commit Work: Recursive Child", fiber.child);
    this.commitWork(fiber.child);
    // console.log("Commit Work: Recursive Sibling", fiber.sibling);
    this.commitWork(fiber.sibling);
  }

  commitDeletion(fiber, domParent) {
    console.log("Commit Deletion: ", fiber);
    if (fiber.hooks) {
      console.log("Commit Deletion: Hooks", fiber.hooks);
      fiber.hooks.forEach((hook) => {
        if (hook.cleanup) {
          hook.cleanup(); // Execute cleanup function if available
        }
      });
    }

    if (fiber.dom) {
      // If the fiber has a DOM node, remove it from the DOM
      if (domParent && domParent.contains(fiber.dom)) {
        domParent.removeChild(fiber.dom);
      }
    }
    // console.log("Commit Deletion: Recursive Child", fiber.child);
    // debugLog(fiber.chid);
    if (fiber.sibling) {
      this.commitDeletion(fiber.sibling);
    }

    if (fiber.child) {
      // If the fiber does not have a DOM node but has a child, recurse on the child
      this.commitDeletion(fiber.child, domParent);
    }
  }
}
