import { updateDom } from './Didact.js';

export default class Fiber {
	constructor ({type, props, dom, parent, alternate, effectTag }) {
		this.type = type
		this.props = props
		this.dom = dom
		this.parent = parent
		this.alternate = alternate
		this.effectTag = effectTag
		this.child = null
		this.sibling = null
		this.hooks = []
	}

	//Method to create a DOM node for a fiber. 
	createDom() {
		const dom = this.type === "TEXT_ELEMENT" 
		? document.createTextNode("")
		: document.createElement(this.type);
		updateDom(dom, {}, this.props);

		return dom;
	}
}

