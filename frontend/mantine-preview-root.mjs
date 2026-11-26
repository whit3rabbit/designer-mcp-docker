import { Component, createElement as h, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { useReportHeight } from "./preview-height.mjs";

class Boundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    document.documentElement.dataset.preview = "error";
  }

  render() {
    return this.state.failed
      ? h("p", {
        role: "alert",
        style: { margin: 0, padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "0.875rem", lineHeight: 1.5 },
      }, "Unable to render this preview. View the component source in the gallery.")
      : this.props.children;
  }
}

function DemoRoot({ demo }) {
  useEffect(() => {
    document.documentElement.dataset.preview = "ready";
  }, []);
  useReportHeight();
  return h(demo);
}

// Light color scheme only: the demos are authored on a light canvas and the
// gallery shows the light illustration next to them.
export function mount(demo) {
  createRoot(document.querySelector("#preview-root")).render(
    h(Boundary, null, h(MantineProvider, { defaultColorScheme: "light" }, h(DemoRoot, { demo }))),
  );
}
