export default class StateManager {
  static instance;
  constructor() {
    if (StateManager.instance) {
      return StateManager.instance;
    }
    StateManager.instance = this;

    /** @type {null|Object} The current unit of work being processed. */
    this.nextUnitOfWork = null;

    /** @type {null|Object} The current root of the rendered virtual DOM. */
    this.currentRoot = null;

    /** @type {null|Object} The work-in-progress root that's being built. */
    this.wipRoot = null;

    /** @type {Array} Elements that need to be removed from the DOM. */
    this.deletions = [];

    /** @type {Array} Hooks associated with the current functional component being processed. */
    // this.hooks = [];

    /** @type {number} Index of the current hook being processed. */
    this.hookIndex = 0;
  }

  /** 
    * getCurrentRoot - Returns the current root of the rendered virtual DOM.
    * @returns {Object} The current root of the rendered virtual DOM.
    */
  getCurrentRoot() {
    return this.currentRoot;
  }

  /** 
    * setCurrentRoot - Sets the current root of the rendered virtual DOM.
    * @param {Object} root - The current root of the rendered virtual DOM.
    */
  setCurrentRoot(root) {
    this.currentRoot = root;
  }

  /** 
    * getWorkInProgressRoot - Returns the work-in-progress root that's being built.
    * @returns {Object} The work-in-progress root that's being built.
    */
  getWorkInProgressRoot() {
    return this.wipRoot;
  }

  /** 
    * setWorkInProgressRoot - Sets the work-in-progress root that's being built.
    * @param {Object} root - The work-in-progress root that's being built.
    */
  setWorkInProgressRoot(root) {
    this.wipRoot = root;
  }

  /** 
    * getDeletions - Returns elements that need to be removed from the DOM.
    * @returns {Array} Elements that need to be removed from the DOM.
    */

  getDeletions() {
    return this.deletions;
  }
  addDeletions(fiber) {
    this.deletions.push(fiber);
  }

  /** 
    * setDeletions - Sets elements that need to be removed from the DOM.
    * @param {Array} deletions - Elements that need to be removed from the DOM.
    */
  setDeletions(deletions) {
    this.deletions = deletions;
  }

  clearDeletions() {
    this.deletions = [];
  }

  /** 
    * getNextUnitOfWork - Returns the current unit of work being processed.
    * @returns {Object} The current unit of work being processed.
    */
  getNextUnitOfWork() {
    return this.nextUnitOfWork;
  }

  /** 
    * setNextUnitOfWork - Sets the current unit of work being processed.
    * @param {Object} unit - The current unit of work being processed.
    */
  setNextUnitOfWork(unit) {
    this.nextUnitOfWork = unit;
  }


}
