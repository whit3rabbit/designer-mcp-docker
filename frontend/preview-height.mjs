import { useEffect } from "react";

// Report the rendered demo height to the parent page so preview frames size
// themselves to their content instead of a fixed box. Sandboxed frames cannot
// reach the parent, so this is one-way over postMessage; standalone views post
// to themselves, where nothing listens.
export function useReportHeight() {
  useEffect(() => {
    let last = 0;
    const report = () => {
      try {
        const root = document.getElementById("preview-root");
        const height = Math.ceil(Math.max(
          root ? root.getBoundingClientRect().height : 0,
          document.body ? document.body.scrollHeight : 0,
        ));
        // Only report changes, or a subpixel reflow loop would keep both
        // sides busy forever.
        if (height && height !== last) {
          last = height;
          window.parent.postMessage({ source: "design-preview", type: "height", height }, "*");
        }
      } catch {
        // Framing and measurement are best effort.
      }
    };
    const observer = new ResizeObserver(report);
    observer.observe(document.body);
    report();
    return () => observer.disconnect();
  }, []);
}
