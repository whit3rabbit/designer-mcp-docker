#!/usr/bin/env node
/**
 * probe-mcp.mjs — drive the MCP server over stdio and print what it says.
 *
 * Usage: node scripts/probe-mcp.mjs [tool ...]
 */

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const server = spawn(process.execPath, [join(HERE, "mcp-server.mjs")], {
  stdio: ["pipe", "pipe", "pipe"],
  env: { ...process.env },
});

let buffer = "";
const pending = new Map();
server.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  let nl;
  while ((nl = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    const resolver = pending.get(msg.id);
    if (resolver) {
      pending.delete(msg.id);
      resolver(msg);
    }
  }
});
server.stderr.on("data", (c) => process.stderr.write(`[server] ${c}`));

let nextId = 1;
function send(method, params) {
  const id = nextId++;
  const payload = { jsonrpc: "2.0", id, method, params };
  server.stdin.write(`${JSON.stringify(payload)}\n`);
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    setTimeout(() => reject(new Error(`timeout on ${method}`)), 20000);
  });
}

function notify(method, params) {
  server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`);
}

const init = await send("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "probe", version: "1.0.0" },
});
console.log("initialize:", JSON.stringify(init.result?.serverInfo));

notify("notifications/initialized", {});

const tools = await send("tools/list", {});
const names = tools.result.tools.map((t) => t.name);
console.log(`tools (${names.length}):`, names.join(", "));

for (const [tool, args] of [
  ["design_get", { identifier: "designer:opendesign:agentic" }],
  ["design_claude_package", { identifier: "designer:opendesign:agentic", path: "README.md" }],
  ["design_package_file", { identifier: "designer:opendesign:agentic", path: "tokens.css" }],
  ["design_facets", {}],
  ["design_list", { source: "opendesign", limit: 3 }],
]) {
  const res = await send("tools/call", { name: tool, arguments: args });
  const text = res.result?.content?.[0]?.text ?? JSON.stringify(res.result);
  console.log(`\n--- ${tool} ---`);
  console.log(text.slice(0, 900));
}

server.stdin.end();
server.kill();
