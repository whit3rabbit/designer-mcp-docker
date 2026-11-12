export const OPENDESIGN_SCHEMA = "od-design-system-project/v1";

export function isPackagePath(path) {
  return typeof path === "string" && path === path.trim() &&
    !/[\\:\x00-\x1f\x7f]/.test(path) &&
    path.split("/").every((part) => part && part !== "." && part !== "..");
}

export function encodePackageFile(path, bytes) {
  const utf8 = bytes.toString("utf8");
  const isText = !utf8.includes("\0") && Buffer.from(utf8).equals(bytes);
  return {
    path,
    bytes: bytes.length,
    encoding: isText ? "utf8" : "base64",
    content: isText ? utf8 : bytes.toString("base64"),
  };
}

// Older caches stored only the core fields. Report exactly what can be read,
// even when the original manifest advertises more files.
export function legacyPackageFiles(system) {
  const json = (value) => value == null ? null : JSON.stringify(value, null, 2);
  return [
    ["manifest.json", json(system.manifest)],
    ["DESIGN.md", system.designMd ?? system.design],
    ["tokens.css", system.tokensCss],
    [system.manifest?.usage ?? "USAGE.md", system.usage],
    [system.manifest?.files?.designTokens ?? "design-tokens.json", json(system.tokens)],
  ].filter(([path, content]) => isPackagePath(path) && typeof content === "string")
    .map(([path, content]) => encodePackageFile(path, Buffer.from(content)));
}
