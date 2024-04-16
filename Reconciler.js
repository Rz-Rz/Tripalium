import StateManager from './StateManager';
import Utils from './Utils';

export default class Reconciler {
  constructor() {
    this.stateManager = new StateManager();
  }

  performUnitOfWork(fiber) {
    const isFunctionComponent =
      fiber.type instanceof Function
    if (isFunctionComponent) {
      this.updateFunctionComponent(fiber)
    } else {
      this.updateHostComponent(fiber)
    }
    if (fiber.child) {
      return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }
      nextFiber = nextFiber.parent
    }
  }

  updateFunctionComponent(fiber) {

    this.stateManager.setWipFiber(fiber);
    // wipFiber = fiber

    // hookIndex = 0
    this.stateManager.setHookIndex(0);
    // wipFiber.hooks = []
    this.stateManager.getWipFiber().hooks = []
    const children = [fiber.type(fiber.props)]
    console.log("function component fiber:", fiber );
	  // console.log("function component children: ", children);
    this.reconcileChildren(fiber, children);
  }

  updateHostComponent(fiber) {
    if (!fiber.dom) {
      fiber.dom = Utils.createDom(fiber)
    }
	  // console.log("host component children: ", fiber.props.children);
    // console.log("host component dom: ", fiber.dom);
    this.reconcileChildren(fiber, fiber.props.children)
  }

  reconcileChildren(wipFiber, elements) {
	  elements = elements.flat(); // Ensure all elements are on the same level
    console.log("reconcileChildren elements: ", elements);
    elements = elements.filter(el => el !== false && el !== null && el !== undefined);
    let index = 0
    let oldFiber =
      wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null

    while (
      index < elements.length ||
      oldFiber != null
    ) {
      const element = elements[index]
      let newFiber = null

      const sameType =
        oldFiber &&
        element &&
        element.type == oldFiber.type
      // console.log('old fiber type:', element.type);
      // console.log('new fiber type:', oldFiber.type);

      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE",
        }
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
        }
	      // console.log("Placing new element (differentType): ", element);
      }
      if (oldFiber && !sameType) {
        oldFiber.effectTag = "DELETION"
        // console.log('deletion', oldFiber);
        // deletions.push(oldFiber)
        this.stateManager.addDeletions(oldFiber);
	      // console.log("Deleting old element : ", oldFiber);
	      
      }

      if (oldFiber) {
        oldFiber = oldFiber.sibling
      }

      if (index === 0) {
        wipFiber.child = newFiber
      } else if (element) {
        prevSibling.sibling = newFiber
      }

      prevSibling = newFiber
      index++
    }
  }
}
