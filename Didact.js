import Fiber from './Fiber.js';
import DomUpdater from './DomUpdater.js';
import StateManager from './StateManager.js';
import Renderer from './Renderer.js';
import ElementFactory from './ElementFactory.js';

const stateManager = new StateManager();
const renderer = new Renderer();

function workLoop(deadline) {
  let shouldYield = false
	console.log(`workLoop called with deadline: ${deadline}`);
  while (stateManager.getNextUnitOfWork && !shouldYield) {
	  console.log(`Performing unit of work: ${stateManager.getNextUnitOfWork}`);
    stateManager.setNextUnitOfWork(performUnitOfWork(
      stateManager.getNextUnitOfWork()
    ));
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!stateManager.getNextUnitOfWork() && stateManager.getWorkInProgressRoot()) {
	  console.log(`Committing root: ${stateManager.getWorkInProgressRoot()}`);
    renderer.commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

export function performUnitOfWork(fiber) {
  const isFunctionComponent =
    fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
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

let wipFiber = null
let hookIndex = null

function updateFunctionComponent(fiber) {
	wipFiber = fiber
	hookIndex = 0
	wipFiber.hooks = []
	const children = [fiber.type(fiber.props)]
	reconcileChildren(fiber, children)
}

function useState(initial) {
	console.log(`useState called with initial: ${initial}`);
	const oldHook =
		wipFiber.alternate &&
		wipFiber.alternate.hooks &&
		wipFiber.alternate.hooks[hookIndex]
	const hook = {
		state: oldHook ? oldHook.state : initial,
		queue: [],
	}
	console.log(`Current state: ${hook.state}`);

	const actions = oldHook ? oldHook.queue : []
	actions.forEach(action => {
		hook.state = action(hook.state)
		console.log(`Updated state after action: ${hook.state}`);
	})

	const setState = action => {
		console.log(`setState called with action: ${action}`);
    hook.queue.push(action)
    let wipRoot = {
      dom: stateManager.getCurrentRoot().dom,
      props: stateManager.getCurrentRoot().props,
      alternate: stateManager.getCurrentRoot(),
    }
    stateManager.setWorkInProgressRoot(wipRoot);
    stateManager.setNextUnitOfWork(wipRoot);
    stateManager.clearDeletions();
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = fiber.createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props.children)
}

function reconcileChildren(wipFiber, elements) {
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

    if (sameType) {
      newFiber = new Fiber({
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      });
    }
    if (element && !sameType) {
      newFiber = new Fiber ({
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      });
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION"
      stateManager.addDeletions(oldFiber);
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

const Didact = {
  createElement: ElementFactory.createElement,
  render: renderer.render.bind(renderer),
  useState,
}

export default Didact;
