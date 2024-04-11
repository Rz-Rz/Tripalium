import StateManager from './StateManager';
import Renderer from './Renderer';
import Reconciler from './Reconciler';
import Utils from './Utils';
import Hooks from './Hooks';
import RouterProvider from './RouterProvider';
import Link from './Link';
import Route from './Route';


let stateManager = new StateManager();
let reconciler = new Reconciler();
let renderer = new Renderer(reconciler);
Hooks.initialize(stateManager);


const Didact = {
	createElement: Utils.createElement,
	render: renderer.render.bind(renderer),
	useState: Hooks.useState,
	useEffect: Hooks.useEffect,
	useContext: Hooks.useContext,
	RouterProvider,
	Link,
	Route,
}

export default Didact;
