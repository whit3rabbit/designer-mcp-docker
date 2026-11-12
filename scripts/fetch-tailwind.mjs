import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const revision = "312f14a4eb6925eccb6d94a96999f986ce67cd55";
const digest = "b9ca7e40712583d6576881a400f415aa7c8aedd5dd2e9240ecd51b385f48f6ac";
const index = process.argv.indexOf("--out");
const output = index >= 0 ? resolve(process.argv[index + 1]) : fileURLToPath(new URL("../dist/hyperui-source", import.meta.url));
const url = `https://codeload.github.com/markmead/hyperui/tar.gz/${revision}`;
const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
if (!response.ok) throw new Error(`HyperUI archive returned HTTP ${response.status}`);
const archive = Buffer.from(await response.arrayBuffer());
if (createHash("sha256").update(archive).digest("hex") !== digest) throw new Error("HyperUI archive checksum mismatch");

const scratch = await mkdtemp(join(tmpdir(), "designer-hyperui-"));
try {
  execFileSync("tar", ["-xzf", "-", "-C", scratch], { input: archive });
  const source = join(scratch, `hyperui-${revision}`);
  await mkdir(output, { recursive: true });
  await cp(join(source, "public", "examples"), join(output, "examples"), { recursive: true });
  await copyFile(join(source, "public", "component.css"), join(output, "component.css"));
  await copyFile(join(source, "LICENSE"), join(output, "LICENSE"));
  console.log(`Pinned HyperUI ${revision}`);
} finally {
  await rm(scratch, { recursive: true, force: true });
}
