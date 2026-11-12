import { createHash } from "node:crypto";

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function variantFingerprint({ id, filename, code, dependencies, registryDependencies }) {
  return sha256(JSON.stringify([id, filename, code, dependencies ?? [], registryDependencies ?? []]));
}

export const validSlug = (value) => typeof value === "string" && /^[a-z0-9-]+$/.test(value);
export const validAssetPath = (value) =>
  typeof value === "string" && value.split("/").every((part) => /^[a-z0-9_-][a-z0-9_.-]*$/i.test(part));
