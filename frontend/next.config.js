/** @type {import('next').NextConfig} */

// Import the PWA plugin using CommonJS syntax
const withPWA = require('next-pwa')({
  dest: 'public',
  // This disables PWA features in development to prevent conflicts
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

// Your Next.js configuration
const nextConfig = {
  // You can add other Next.js configurations here if needed
};

// Export the configuration wrapped with the PWA plugin
module.exports = withPWA(nextConfig);