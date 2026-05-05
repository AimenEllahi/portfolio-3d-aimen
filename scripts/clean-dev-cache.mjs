import { existsSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const force = process.argv.includes("--force");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const skipManual =
  !force &&
  (process.env.SKIP_NEXT_DEV_CLEAN === "1" ||
    process.env.DISABLE_PREDEV_CLEAN === "1");

if (skipManual) {
  process.exit(0);
}

const dirs = [
  join(root, ".next"),
  join(root, "node_modules", ".cache"),
];

let removed = false;
for (const p of dirs) {
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true });
    removed = true;
  }
}

if (removed && force && process.stderr.isTTY) {
  console.error("[next] Removed `.next` and `node_modules/.cache`.");
}

if (
  removed &&
  !force &&
  process.stderr.isTTY &&
  process.env.npm_lifecycle_event === "predev"
) {
  console.error(
    "[next] Dev cache cleared (`predev`): HTML ↔ chunk URLs will stay in sync. Set SKIP_NEXT_DEV_CLEAN=1 to skip (not recommended).\n",
  );
}
