/**
 * Dev reliability (macOS):
 * - If the tab shows 500 + `/_next/static/chunks/fallback/*`, you often have a stale
 *   `next dev` on the port you're opening, or the watcher hit EMFILE (too many open files).
 * - Fix: quit every dev server, then `npm run dev` (or use `npm run dev:poll` / `npm run dev:turbo:fresh`).
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
  webpack: (config, { dev }) => {
    // Polling uses fewer watchers than FS events — avoids EMFILE on large trees / tight ulimits.
    if (dev && process.env.NEXT_WATCH_POLL === "1") {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1200,
        aggregateTimeout: 400,
        followSymlinks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
