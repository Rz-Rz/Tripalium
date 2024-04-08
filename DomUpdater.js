import DomUtils from "./DomUtils.js";

export default class DomUpdater {
  /**
   * Updates the DOM based on the difference between the previous and next properties.
   * This static method encapsulates the logic for DOM updates, including the addition/removal of event listeners,
   * setting of new properties, and removal of old properties.
   *
   * @param {HTMLElement} dom - The DOM element to update.
   * @param {Object} prevProps - The previous properties of the element.
   * @param {Object} nextProps - The next (updated) properties of the element.
   */
  static updateDom(dom, prevProps, nextProps) {
    //Remove old or changed event listeners
    Object.keys(prevProps)
      .filter(DomUtils.isEvent)
      .filter((key) => !(key in nextProps) || DomUtils.isNew(prevProps, nextProps)(key))
      .forEach((name) => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
      });

    // Remove old properties
    Object.keys(prevProps)
      .filter(DomUtils.isProperty)
      .filter(DomUtils.isGone(prevProps, nextProps))
      .forEach((name) => {
        dom[name] = "";
      });

    // Set new or changed properties
    Object.keys(nextProps)
      .filter(DomUtils.isProperty)
      .filter(DomUtils.isNew(prevProps, nextProps))
      .forEach((name) => {
        dom[name] = nextProps[name];
      });

    // Add event listeners
    Object.keys(nextProps)
      .filter(DomUtils.isEvent)
      .filter(DomUtils.isNew(prevProps, nextProps))
      .forEach((name) => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
      });
  }
}
