import fs from "node:fs";
import path from "node:path";

const acmeRoot = path.resolve(process.cwd(), "content/examples/acme");

export interface TreeNode {
  name: string;
  path: string; // relative to acmeRoot
  isDir: boolean;
  children?: TreeNode[];
}

export function buildTree(subdir = ""): TreeNode[] {
  const base = path.join(acmeRoot, subdir);
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .sort((a, b) => {
      // dirs first, then alphabetical
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((e) => {
      const rel = subdir ? path.join(subdir, e.name) : e.name;
      if (e.isDirectory()) {
        return {
          name: e.name,
          path: rel,
          isDir: true,
          children: buildTree(rel),
        } satisfies TreeNode;
      }
      return { name: e.name, path: rel, isDir: false } satisfies TreeNode;
    });
}

export function readFileText(relPath: string): string | null {
  const p = path.join(acmeRoot, relPath);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}

export function countFiles(): { files: number; dirs: number } {
  let files = 0;
  let dirs = 0;
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        dirs++;
        walk(path.join(dir, e.name));
      } else {
        files++;
      }
    }
  };
  walk(acmeRoot);
  return { files, dirs };
}
