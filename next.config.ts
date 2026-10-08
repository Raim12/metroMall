import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Next infer the wrong workspace
  // root; pin it to this project.
  outputFileTracingRoot: path.join(__dirname),

  /**
   * Image optimisation, sized for this catalogue and this host.
   *
   * The catalogue photos in uploads/products/ are already WebP, already cropped
   * and at most ~1235px wide (16-400 KB each). Next's defaults still offer
   * srcset widths up to 3840px, so a full-bleed <Image> asks the server to
   * UPSCALE and re-encode every photo — roughly 2-3s each on Render's starter
   * instance. With an empty cache after a deploy the homepage's requests queue
   * behind each other and the browser gives up, leaving broken images until the
   * cache fills.
   *
   * Capping the widths at the source resolution removes the upscale entirely
   * and keeps the responsive srcset, so images are still sized to the viewport.
   */
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [96, 128, 256, 384],
    formats: ["image/webp"],
    // Sources are immutable (filenames carry a random suffix), so a transformed
    // variant never needs re-checking. Default is 60s.
    minimumCacheTTL: 31536000,
  },

  /**
   * `next dev` gets its own output folder. Sharing `.next` with `next build`
   * means starting the dev server overwrites the production manifests, and the
   * next `next start` crashes with "routesManifest.dataRoutes is not iterable".
   */
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",

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
    "*.ngrok-free.dev", // ngrok (free, newer accounts)
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
