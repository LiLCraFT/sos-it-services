/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configurer l'export des fichiers statiques
  output: 'standalone',
  
  // Servir les fichiers statiques depuis /public
  basePath: '',
  
  // Configuration des headers CORS pour les images et l'API
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',  // Autoriser tous les domaines
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 