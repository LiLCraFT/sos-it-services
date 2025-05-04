/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuration du serveur pour écouter sur le port 3001
  server: {
    port: 3001,
  }
};

module.exports = nextConfig; 