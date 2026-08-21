import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const artifactsRoot = path.join(repositoryRoot, ".artifacts");

function runLauncher(overrides = {}, extraArgs = []) {
  fs.mkdirSync(artifactsRoot, { recursive: true });
  const temporaryDirectory = fs.mkdtempSync(path.join(artifactsRoot, "launcher-test-"));
  const fakePi = path.join(temporaryDirectory, "pi");
  fs.writeFileSync(
    fakePi,
    `#!/usr/bin/env node
process.stdout.write(JSON.stringify({
  args: process.argv.slice(2),
  guardMode: process.env.PI_GUARD_MODE,
  fileScope: process.env.PI_GUARD_FILE_SCOPE,
  gitMutation: process.env.PI_GIT_MUTATION,
  externalMutation: process.env.PI_GUARD_EXTERNAL_MUTATION,
  projectRoot: process.env.PI_PROJECT_ROOT,
}));
`,
    { mode: 0o755 },
  );

  try {
    return spawnSync("bash", ["p", ...extraArgs], {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${temporaryDirectory}${path.delimiter}${process.env.PATH}`,
        PI_MAIN_MODEL: "",
        PI_MAIN_THINKING: "",
        PI_ENABLED_MODELS: "",
        ...overrides,
      },
    });
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

function parsed(result) {
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("launcher grants trusted full-scope work while Git and external mutation fail closed", () => {
  const result = parsed(runLauncher({}, ["--mode", "rpc"]));
  assert.ok(result.args.includes("--approve"));
  assert.equal(result.args.includes("--no-approve"), false);
  assert.deepEqual(result.args.slice(-2), ["--mode", "rpc"]);
  assert.equal(result.guardMode, "autonomous");
  assert.equal(result.fileScope, "full");
  assert.equal(result.gitMutation, "deny");
  assert.equal(result.externalMutation, "deny");
  assert.equal(result.projectRoot, repositoryRoot);
});

test("repository does not force a provider, model, or thinking level", () => {
  const result = parsed(runLauncher());
  assert.equal(result.args.includes("--model"), false);
  assert.equal(result.args.includes("--thinking"), false);
  assert.equal(result.args.includes("--models"), false);
});

test("explicit model and thinking overrides pass through unchanged", () => {
  const result = parsed(runLauncher({
    PI_MAIN_MODEL: "provider/model-id",
    PI_MAIN_THINKING: "medium",
    PI_ENABLED_MODELS: "provider/*",
  }));
  assert.deepEqual(result.args.slice(result.args.indexOf("--model"), result.args.indexOf("--model") + 2), [
    "--model",
    "provider/model-id",
  ]);
  assert.deepEqual(result.args.slice(result.args.indexOf("--thinking"), result.args.indexOf("--thinking") + 2), [
    "--thinking",
    "medium",
  ]);
  assert.deepEqual(result.args.slice(result.args.indexOf("--models"), result.args.indexOf("--models") + 2), [
    "--models",
    "provider/*",
  ]);
});

test("launcher exposes a compact unique model-agnostic tool surface", () => {
  const result = parsed(runLauncher());
  const toolsIndex = result.args.indexOf("--tools");
  assert.notEqual(toolsIndex, -1);
  const selected = result.args[toolsIndex + 1].split(",");
  assert.equal(new Set(selected).size, selected.length);
  assert.ok(selected.length <= 20, `expected at most 20 tools, received ${selected.length}`);
  for (const required of [
    "read", "bash", "edit", "write", "subagent", "todo", "mcp",
    "lsp_diagnostics", "lsp_definition", "lsp_references",
    "doc_search_get_library_docs", "web_search", "web_fetch",
  ]) assert.ok(selected.includes(required), required);
  for (const redundant of [
    "describe_image",
    "lsp_hover",
    "lsp_document_symbols",
    "doc_search_get_cached_doc_raw",
  ]) assert.equal(selected.includes(redundant), false, redundant);
});

test("launcher preserves explicit trust and guard overrides", () => {
  const ask = parsed(runLauncher({
    PI_PROJECT_TRUST: "ask",
    PI_GUARD_MODE: "strict",
    PI_GUARD_FILE_SCOPE: "repository",
    PI_GIT_MUTATION: "allow",
  }));
  assert.equal(ask.args.includes("--approve"), false);
  assert.equal(ask.args.includes("--no-approve"), false);
  assert.equal(ask.guardMode, "strict");
  assert.equal(ask.fileScope, "repository");
  assert.equal(ask.gitMutation, "allow");

  const never = parsed(runLauncher({ PI_PROJECT_TRUST: "never" }));
  assert.ok(never.args.includes("--no-approve"));
  assert.equal(never.args.includes("--approve"), false);
});

test("launcher rejects an invalid project-trust mode", () => {
  const result = runLauncher({ PI_PROJECT_TRUST: "sometimes" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /always, ask, never/);
});
