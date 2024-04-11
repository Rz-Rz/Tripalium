class Utils {
  static createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map(child =>
          typeof child === "object" ? child : Utils.createTextElement(child)
        ),
      },
    };
  }

  static createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: [],
      },
    };
  }

  static createDom(fiber) {
	  console.log("Fiber in createDom: ", fiber);
    const dom =
      fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(fiber.type);

    Utils.updateDom(dom, {}, fiber.props);
    return dom;
  }

  static updateDom(dom, prevProps, nextProps) {
	  console.log('updateDom called for', dom, 'with nextProps', nextProps);
    // Helpers defined within updateDom for encapsulation
    const isEvent = key => key.startsWith("on");
    const isProperty = key => key !== "children" && !isEvent(key);
    const isNew = (prev, next) => key => prev[key] !== next[key];
    const isGone = (prev, next) => key => !(key in next);

    // Remove old or changed event listeners
    Object.keys(prevProps)
      .filter(isEvent)
      .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
      .forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
      });

    // Remove old properties
    Object.keys(prevProps)
      .filter(isProperty)
      .filter(isGone(prevProps, nextProps))
      .forEach(name => {
        dom[name] = "";
      });

    // Set new or changed properties
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        dom[name] = nextProps[name];
      });

    // Add event listeners
    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
      });
  }
}

export default Utils;
