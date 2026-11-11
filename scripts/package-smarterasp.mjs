import { cp, copyFile, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const staticAssets = join(root, ".next", "static");

const build = spawnSync(
  process.execPath,
  [join(root, "node_modules", "next", "dist", "bin", "next"), "build"],
  {
    cwd: root,
    env: { ...process.env, NEXT_OUTPUT_STANDALONE: "true" },
    stdio: "inherit",
  },
);
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

await import("./sanitize-standalone.mjs");
await mkdir(join(standalone, ".next"), { recursive: true });
await cp(join(root, "public"), join(standalone, "public"), { recursive: true, force: true });
await cp(staticAssets, join(standalone, ".next", "static"), { recursive: true, force: true });
await copyFile(join(root, "web.config.example"), join(standalone, "web.config"));

console.log("SmarterASP.NET bundle prepared in .next/standalone.");
console.log("Edit .next/standalone/web.config with production database and SMTP settings before uploading.");
