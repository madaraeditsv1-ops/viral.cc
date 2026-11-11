import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";

const standaloneDirectory = join(process.cwd(), ".next", "standalone");
try {
  await readdir(standaloneDirectory);
} catch (error) {
  if (error instanceof Error && "code" in error && error.code === "ENOENT") process.exit(0);
  throw error;
}
const entries = await readdir(standaloneDirectory, { withFileTypes: true });

for (const entry of entries) {
  if (entry.isFile() && /^\.env(?:\.|$)/i.test(entry.name)) {
    await rm(join(standaloneDirectory, entry.name));
  }
}
