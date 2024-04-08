export default class DomUtils {
  /**
   * Determines if a given key represents an event listener.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key starts with "on", indicating an event listener.
   */
  static isEvent(key) {
    return key.startsWith("on");
  }

  /**
   * Determines if a given key represents a property (excluding children and events).
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key is neither "children" nor an event listener.
   */
  static isProperty(key) {
    return key !== "children" && !DomUtils.isEvent(key);
  }

  /**
   * Determines if a property is new or has changed between the previous and next sets of properties.
   * @param {Object} prev - The previous properties.
   * @param {Object} next - The next properties.
   * @returns {Function} A function that takes a key and returns true if the value associated with that key has changed.
   */
  static isNew(prev, next) {
    return key => prev[key] !== next[key];
  }

  /**
   * Determines if a property is gone, i.e., it does not exist in the next set of properties.
   * @param {Object} prev - The previous properties.
   * @param {Object} next - The next properties.
   * @returns {Function} A function that takes a key and returns true if the key is not in the next set of properties.
   */
  static isGone(prev, next) {
    return key => !(key in next);
  }
}
