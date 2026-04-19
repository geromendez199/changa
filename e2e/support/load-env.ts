import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const ENV_FILES = [".env.e2e.local", ".env.e2e", ".env.local", ".env"];

let isLoaded = false;

export function loadE2EEnvironment() {
  if (isLoaded) return;

  const root = process.cwd();
  for (const file of ENV_FILES) {
    const fullPath = path.resolve(root, file);
    if (!fs.existsSync(fullPath)) continue;
    dotenv.config({ path: fullPath, override: false });
  }

  isLoaded = true;
}

loadE2EEnvironment();
