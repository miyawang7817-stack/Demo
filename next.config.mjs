/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Thumbnails are hotlinked from the original sources (with attribution),
    // so remote hosts must be allowed. Add more as the crawler grows.
    remotePatterns: [
      { protocol: "https", hostname: "**.tympanus.net" },
      { protocol: "https", hostname: "tympanus.net" },
      { protocol: "https", hostname: "**.codrops.com" },
      { protocol: "https", hostname: "**.motionsites.ai" },
      { protocol: "https", hostname: "motionsites.ai" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
