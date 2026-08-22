import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Otherwise Turbopack walks up to
  // the home directory (which has its own package-lock.json) and tries to
  // watch the whole home tree, causing EMFILE "too many open files".
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
