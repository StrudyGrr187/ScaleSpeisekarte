import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root; a stray lockfile in the home directory otherwise
  // makes Turbopack infer /Users/<name> as the project root.
  turbopack: { root: path.resolve(__dirname) },
  // Next would otherwise generate/overwrite CLAUDE.md and AGENTS.md on every dev boot.
  agentRules: false,
  images: {
    // Exactly one host, and only over https. A wildcard here would turn
    // /_next/image into an open proxy paid for with our own bandwidth.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/uploads/**" },
    ],
  },
  experimental: {
    // Must exceed the largest file any action accepts — menu import allows 12 MB
    // (src/lib/ai-import.ts). Too low a limit fails the upload in the framework
    // with an opaque error instead of our own message.
    serverActions: { bodySizeLimit: "16mb" },
  },
};

export default nextConfig;
