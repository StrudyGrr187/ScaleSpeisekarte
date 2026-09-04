import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root; a stray lockfile in the home directory otherwise
  // makes Turbopack infer /Users/<name> as the project root.
  turbopack: { root: path.resolve(__dirname) },
  // Next would otherwise generate/overwrite CLAUDE.md and AGENTS.md on every dev boot.
  agentRules: false,
  // No remotePatterns on purpose: every image this app renders is a local
  // /uploads path. Allowing remote hosts would turn /_next/image into an open
  // proxy against our own bandwidth.
  experimental: {
    // Must exceed the largest file any action accepts — menu import allows 12 MB
    // (src/lib/ai-import.ts). Too low a limit fails the upload in the framework
    // with an opaque error instead of our own message.
    serverActions: { bodySizeLimit: "16mb" },
  },
};

export default nextConfig;
