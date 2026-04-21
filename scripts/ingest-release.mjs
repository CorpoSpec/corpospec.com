#!/usr/bin/env node
/**
 * Ingest a CorpoSpec schema release triggered by `repository_dispatch` from
 * `beevelop/UNSTARTER`.
 *
 * Expected env:
 *   - VERSION          e.g. "0.7.1"
 *   - TARBALL_URL      GitHub Release asset URL (corpospec-schemas-vX.Y.Z.tar.gz)
 *   - TARBALL_SHA256   SHA256 of the tarball (from dispatch payload)
 *
 * Guarantees:
 *   - Refuses to overwrite an existing `public/schemas/v{version}/` directory.
 *   - Verifies the tarball SHA256 before extracting.
 *   - Writes to `public/schemas/v{version}/` atomically (temp dir + rename).
 */

import { createHash } from "node:crypto";
import { mkdtempSync, renameSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const VERSION = required("VERSION");
const TARBALL_URL = required("TARBALL_URL");
const TARBALL_SHA256 = required("TARBALL_SHA256").toLowerCase();

const root = resolve(new URL(".", import.meta.url).pathname, "..");
const targetDir = join(root, "public", "schemas", `v${VERSION}`);

if (existsSync(targetDir)) {
  fail(`public/schemas/v${VERSION}/ already exists — versions are immutable. Refusing to overwrite.`);
}

const tmp = mkdtempSync(join(tmpdir(), `corpospec-ingest-${VERSION}-`));
const tarPath = join(tmp, `release.tar.gz`);

console.log(`Downloading ${TARBALL_URL}`);
run("curl", ["-fsSL", "-o", tarPath, TARBALL_URL]);

const hash = createHash("sha256").update(readFileSync(tarPath)).digest("hex");
if (hash !== TARBALL_SHA256) {
  fail(`Tarball SHA256 mismatch: expected ${TARBALL_SHA256}, got ${hash}`);
}
console.log(`SHA256 verified: ${hash}`);

const extractDir = join(tmp, "extract");
mkdirSync(extractDir);
run("tar", ["-xzf", tarPath, "-C", extractDir]);

const extractedVersionDir = join(extractDir, `v${VERSION}`);
if (!existsSync(extractedVersionDir)) {
  fail(`Tarball did not contain v${VERSION}/ directory`);
}

mkdirSync(join(root, "public", "schemas"), { recursive: true });
renameSync(extractedVersionDir, targetDir);

rmSync(tmp, { recursive: true, force: true });

console.log(`Wrote ${targetDir}`);

function required(name) {
  const v = process.env[name];
  if (!v) fail(`Missing env var ${name}`);
  return v;
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) fail(`${cmd} ${args.join(" ")} exited ${r.status}`);
}

function fail(msg) {
  console.error(`::error::${msg}`);
  process.exit(1);
}
