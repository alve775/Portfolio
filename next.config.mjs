import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root. Without this, Turbopack walks up to a stray
  // package-lock.json in the home directory and warns on every build.
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
  // Fully static export: emits out/ with zero serverless functions and no middleware.
  // Accepted trade-offs: no next/image optimization, no ISR, no route handlers.
  output: 'export',
  // Next regenerates AGENTS.md/CLAUDE.md on every dev start. The brief asks for
  // a single README.md at the repo root, so keep them out of the tree.
  agentRules: false,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
