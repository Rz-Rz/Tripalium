import StateManager from './StateManager';
import { performUnitOfWork } from './Didact';
import DomUpdater from './DomUpdater';

export default class Renderer {
static instance;
  /**
   * Initializes a new instance of the Renderer class.
   * This constructor sets up the initial state required for the rendering process, including the root DOM element
   * where the virtual DOM will be rendered, and initializing variables to manage the work-in-progress (wip) root,
   * the current root, and a list of elements marked for deletion.
   *
   * @param {HTMLElement} root - The root DOM element where the virtual DOM will be rendered.
   */
  constructor(root) {
    if (Renderer.instance) {
      return Renderer.instance;
    }
    Renderer.instance = this;
    this.root = root;
    this.stateManager = new StateManager();
  }

  /**
   * Starts the rendering process for a given element.
   * This method initializes the work-in-progress root with the element to be rendered and kicks off the work loop
   * to process the rendering work units. It also resets the list of deletions in preparation for any element removals.
   *
   * @param {Object} element - The virtual DOM element to be rendered.
   */
  render(element) {
    this.wipRoot = {
      dom: this.root,
      props: {
        children: [element],
      },
      alternate: this.currentRoot,
    };
    this.deletions = [];
    this.nextUnitOfWork = this.wipRoot;
    this.workLoop();
  }

  /**
   * Processes the work loop using browser idle time.
   * This method continuously processes work units until there's no time left in the current frame or until
   * all work units have been processed. It leverages requestIdleCallback to ensure that rendering work does not
   * block the main thread, maintaining application responsiveness.
   *
   * @param {IdleDeadline} deadline - The IdleDeadline object, providing timeRemaining method to check available idle time.
   */
  workLoop(deadline) {
    let shouldYield = false;
    while (this.nextUnitOfWork && !shouldYield) {
      this.nextUnitOfWork = performUnitOfWork(this.nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1;
    }

    if (!this.nextUnitOfWork && this.wipRoot) {
      this.commitRoot();
      this.currentRoot = this.wipRoot;
      this.wipRoot = null;
    }

    window.requestIdleCallback(this.workLoop.bind(this));
  }

commitRoot() {
  const deletions = this.stateManager.getDeletions();
  deletions.forEach(deletion => this.commitWork(deletion));
  this.commitWork(this.stateManager.getWorkInProgressRoot().child);
  this.stateManager.setCurrentRoot(this.stateManager.getWorkInProgressRoot());
  this.stateManager.setWorkInProgressRoot(null);
}

commitWork(fiber) {
  if (!fiber) {
    return
  }

  let domParentFiber = fiber.parent
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    DomUpdater.updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
    this.commitDeletion(fiber, domParent)
  }

  this.commitWork(fiber.child)
  this.commitWork(fiber.sibling)
}

commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    this.commitDeletion(fiber.child, domParent)
  }
}
}

