import { Component, createElement as h, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";

class Boundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    document.documentElement.dataset.preview = "error";
  }

  render() {
    return this.state.failed ? h("p", { role: "alert" }, "This preview could not run. The source is available in the gallery.") : this.props.children;
  }
}

function DemoRoot({ demo }) {
  useEffect(() => {
    document.documentElement.dataset.preview = "ready";
  }, []);
  return h(demo);
}

export function mount(demo) {
  createRoot(document.querySelector("#preview-root")).render(
    h(Boundary, null, h(MotionConfig, { reducedMotion: "user" }, h(DemoRoot, { demo }))),
  );
}
