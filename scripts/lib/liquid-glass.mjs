function boundedNumber(value, fallback, max) {
  return Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : fallback;
}

export function glassProperties(preset) {
  const dark = preset.theme === "dark";
  const fallback = dark ? "#0f172a" : "#ffffff";
  const tint = /^#[0-9a-f]{6}$/i.test(preset.tint) ? preset.tint : fallback;
  const rgb = tint.slice(1).match(/../g).map((channel) => parseInt(channel, 16)).join(" ");
  const amount = (name, base) => boundedNumber(preset[name], base, 100) / 100;
  const blur = boundedNumber(preset.blur, 18, 64);
  const saturation = boundedNumber(preset.saturate, 150, 300);
  const contrast = boundedNumber(preset.contrast, 100, 200);
  const radius = boundedNumber(preset.radius, 24, 96);

  return {
    "--glass-tint": `rgb(${rgb} / ${amount("tintOpacity", 16)})`,
    "--glass-opaque": `rgb(${rgb} / 0.92)`,
    "--glass-backdrop": `blur(${blur}px) saturate(${saturation}%) contrast(${contrast}%)`,
    "--glass-radius": `${radius}px`,
    "--glass-border": amount("borderOpacity", 24),
    "--glass-shadow": (amount("shadow", 52) * (dark ? 0.75 : 0.50)).toFixed(3),
    "--glass-shine": (amount("specular", 60) * (dark ? 0.45 : 0.66)).toFixed(3),
    "--glass-rim": (amount("rim", 65) * (dark ? 0.45 : 0.58)).toFixed(3),
    "--glass-edge": `${Math.round(18 + amount("edgeBlur", 65) * 32)}%`,
    "--glass-color-edge": (amount("chromatic", 0) * 0.85).toFixed(3),
    "--glass-grain": (amount("noise", 0) * 0.45).toFixed(3),
    "--glass-glow": (amount("glow", 0) * 0.45).toFixed(3),
  };
}

export function glassCss(properties = {}) {
  const vars = Object.entries(properties).map(([key, value]) => `  ${key}: ${value};\n`).join("");
  return `.liquid-glass {
${vars}  position: relative;
  background: var(--glass-opaque);
  border: 1px solid rgb(255 255 255 / var(--glass-border));
  border-radius: var(--glass-radius);
  box-shadow: 0 10px 34px rgb(4 7 20 / var(--glass-shadow)),
    0 0 18px rgb(194 218 255 / var(--glass-glow)),
    inset 0 1px 2px rgb(255 255 255 / var(--glass-rim)),
    inset 0 -1px 2px rgb(255 255 255 / calc(var(--glass-rim) * 0.44));
}

@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .liquid-glass {
    background: var(--glass-tint);
    -webkit-backdrop-filter: var(--glass-backdrop);
    backdrop-filter: var(--glass-backdrop);
  }
}

.liquid-glass::before,
.liquid-glass::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

.liquid-glass::before {
  background: radial-gradient(ellipse at 28% 0%, rgb(255 255 255 / var(--glass-shine)), transparent var(--glass-edge)),
    radial-gradient(ellipse at 100% 100%, rgb(255 255 255 / calc(var(--glass-rim) * 0.42)), transparent var(--glass-edge));
}

.liquid-glass::after {
  background: radial-gradient(ellipse at 0% 85%, rgb(120 183 255 / var(--glass-color-edge)), transparent 52%),
    radial-gradient(ellipse at 100% 14%, rgb(255 157 225 / var(--glass-color-edge)), transparent 52%),
    repeating-radial-gradient(circle at 40% 50%, rgb(255 255 255 / var(--glass-grain)) 0 1px, transparent 1px 4px);
}

@media (prefers-reduced-transparency: reduce) {
  .liquid-glass {
    background: var(--glass-opaque);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}`;
}
