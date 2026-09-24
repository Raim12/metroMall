import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Next infer the wrong workspace
  // root; pin it to this project.
  outputFileTracingRoot: path.join(__dirname),

  /**
   * Hosts allowed to request `/_next/*` in development.
   *
   * Needed when the dev server is reached through a tunnel (exposing localhost
   * so Safepay can deliver webhooks) rather than on localhost directly.
   *
   * Note: leaving this undefined only warns, but defining it switches Next to
   * blocking anything unlisted — so every tunnel provider you use must appear
   * here. Wildcards match one segment; they cannot match a whole domain
   * (`*.com` is rejected).
   *
   * Development only. It has no effect on `next build` or `next start`.
   */
  allowedDevOrigins: [
    "*.loca.lt", // localtunnel
    "*.trycloudflare.com", // cloudflared quick tunnels
    "*.ngrok-free.app", // ngrok (free)
    "*.ngrok.app",
    "*.ngrok.io",
  ],

  /**
   * Keep compiled dev pages in memory far longer than the default minute.
   *
   * Dev compiles each route the first time it is requested (10-20s here). The
   * default disposes an idle page after ~60s, so coming back to it after a
   * short break pays that cost again. Development only — production prerenders
   * everything at build time and serves in tens of milliseconds.
   */
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 25,
  },
};

export default nextConfig;
