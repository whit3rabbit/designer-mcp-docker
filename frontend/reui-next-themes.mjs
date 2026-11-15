import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setThemeState] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const sync = () => {
      setThemeState(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const setTheme = (next) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    setThemeState(next);
  };

  return { theme, resolvedTheme: theme, setTheme };
}

export function ThemeProvider({ children }) {
  return children;
}
