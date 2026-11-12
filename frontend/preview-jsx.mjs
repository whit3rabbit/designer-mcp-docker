import { Fragment, jsx as reactJsx, jsxs as reactJsxs } from "react/jsx-runtime";

export { Fragment };

function offline(render, type, props, key) {
  if (typeof type === "string" && props) {
    if ((type === "a" || type === "area") && props.href && !String(props.href).startsWith("#")) {
      // Keep labels and styling for citation examples without making them destinations.
      const { href, target, rel, download, ping, ...label } = props;
      return render("span", label, key);
    }
    if (props.ping) props = { ...props, ping: undefined };
  }
  return render(type, props, key);
}

export const jsx = (type, props, key) => offline(reactJsx, type, props, key);
export const jsxs = (type, props, key) => offline(reactJsxs, type, props, key);
