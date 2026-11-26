import { Component, createElement as h, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import { useReportHeight } from "./preview-height.mjs";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/registry/bases/radix/ui/tooltip";

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

// Initial theme from query param (?theme=dark) or hash
try {
  const params = new URLSearchParams(location.search);
  if (params.get("theme") === "dark") applyTheme("dark");
} catch {
  // ignore
}

window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "reui-theme") {
    applyTheme(event.data.theme === "dark" ? "dark" : "light");
  }
});

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
      ? h("p", { role: "alert", className: "text-sm text-muted-foreground p-4" }, "Unable to render this preview. Select View code to inspect the source.")
      : this.props.children;
  }
}

function DemoRoot({ demo }) {
  useEffect(() => {
    document.documentElement.dataset.preview = "ready";
  }, []);
  useReportHeight();
  return h(
    TooltipProvider,
    null,
    h(
      "div",
      { className: "w-full flex items-center justify-center p-6 bg-background text-foreground" },
      h(demo),
    ),
    h(Toaster),
  );
}

export function mount(demo) {
  createRoot(document.querySelector("#preview-root")).render(
    h(Boundary, null, h(MotionConfig, { reducedMotion: "user" }, h(DemoRoot, { demo }))),
  );
}
