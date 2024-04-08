export default class ElementFactory {
  /**
   * Creates a virtual DOM element.
   * This static method abstracts the creation of virtual DOM elements, making the element creation process 
   * more intuitive and hiding the complexity of handling children and text elements.
   *
   * @param {string} type - The type of the DOM element (e.g., 'div', 'span').
   * @param {Object} props - The properties of the DOM element.
   * @param {...any} children - The children of the DOM element, which can be either other virtual DOM elements or text.
   * @returns {Object} The virtual DOM element.
   */
  static createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map(child =>
          typeof child === "object" ? child : ElementFactory.createTextElement(child)
        ),
      },
    };
  }

  /**
   * Creates a virtual DOM element for text.
   * This method simplifies the creation of text elements in the virtual DOM, encapsulating the specific structure 
   * required for text nodes.
   *
   * @param {string} text - The text content.
   * @returns {Object} The virtual text element.
   */
  static createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: [],
      },
    };
  }
}

