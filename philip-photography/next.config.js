const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export for Firebase Hosting
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  trailingSlash: false,
  // Disable server-side features for static export
  experimental: {
    // Add any experimental features if needed
  },
  // Configure Turbopack root to avoid workspace detection issues
  // This tells Next.js to use the current directory as the root, not the parent
  turbopack: {
    root: path.resolve(__dirname),
  },
}

module.exports = nextConfig




