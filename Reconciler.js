import StateManager from "./StateManager";
import Utils from "./Utils";
import { debugLog } from "./Logs";

export default class Reconciler {
  constructor() {
    this.stateManager = new StateManager();
  }

  performUnitOfWork(fiber) {
    // console.log("performUnitOfWork fiber:", fiber);
    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) {
      this.updateFunctionComponent(fiber);
    } else {
      this.updateHostComponent(fiber);
    }
    if (fiber.child) {
      // console.log("performUnitOfWork fiber.child:", fiber.child);
      return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        // console.log("performUnitOfWork nextFiber.sibling:", nextFiber.sibling);
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.parent;
    }
  }

  updateFunctionComponent(fiber) {
    // console.log("updateFunctionComponent fiber:", fiber);

    this.stateManager.setWipFiber(fiber);
    // wipFiber = fiber

    // hookIndex = 0
    this.stateManager.setHookIndex(0);
    // wipFiber.hooks = []
    this.stateManager.getWipFiber().hooks = [];
    // debugLog("updateFunctionComponent fiber:", fiber);
    const children = [fiber.type(fiber.props)];
    // debugLog("updateFunctionComponent children:", children);
    // console.log("function component fiber:", fiber );
    // console.log("function component children: ", children);
    this.reconcileChildren(fiber, children);
  }

  updateHostComponent(fiber) {
    // console.log("updateHostComponent fiber:", fiber);
    if (!fiber.dom) {
      fiber.dom = Utils.createDom(fiber);
      // console.log("Creating dom for host component: ", fiber);
    }
    // console.log("host component children: ", fiber.props.children);
    // console.log("host component dom: ", fiber.dom);
    this.reconcileChildren(fiber, fiber.props.children);
  }

  reconcileChildren(wipFiber, elements) {
    // console.log("Within reconcileChildren() wipFiber:")
    // debugLog(wipFiber);
    // console.log("reconcilChildren() elements");
    // debugLog(elements);
    elements = elements.flat(); // Ensure all elements are on the same level
    // console.log("reconcileChildren elements: ", elements);
    elements = elements.filter((el) => el !== null && el !== undefined);
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;

    while (index < elements.length || oldFiber != null) {
      const element = elements[index];
      let newFiber = null;

      const sameType = oldFiber && element && element.type === oldFiber.type;
      // if (!oldFiber)
      //   console.log("oldFiber type: NULL");
      // else
      //   console.log('old fiber type:', oldFiber.type);
      // if (!element)
      //   console.log("element is null");
      // else
      //   console.log("element.type: ", element.type);

      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE",
        };
        // console.log("Update element (sameType): ", element);
      }
      if (element && !sameType) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
        };
        // console.log("Placing new element (differentType): ", element);
      }
      if (oldFiber && !sameType) {
        oldFiber.effectTag = "DELETION";
        // console.log('deletion', oldFiber);
        // deletions.push(oldFiber)
        this.stateManager.addDeletions(oldFiber);
        // console.log("Deleting old element : ", oldFiber);
      }

      //Trying to reconcile recursively in hope to catch the straggling elements
      if (newFiber) {
        if (element.children) {
          this.reconcileChildre(newFiber, element.children);
        }
      }

      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }

      if (index === 0) {
        wipFiber.child = newFiber;
        // console.log(
        //   "ReconcileChildren : Index = 0. Setting wipFiber.child: ",
        //   newFiber,
        // );
      } else if (element) {
        prevSibling.sibling = newFiber;
        // console.log(
        //   "ReconcileChildren : Setting prevSibling.sibling: ",
        //   newFiber,
        //   " for element: ",
        //   element,
        // );
      }

      prevSibling = newFiber;
      index++;
    }
  }
}
