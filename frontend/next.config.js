/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // We are removing the 'disable' flag to force generation in dev mode
});

const nextConfig = withPWA({
  // your next.js config
});

module.exports = nextConfig;