/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuration du serveur pour écouter sur le port 3001
  server: {
    port: 3001,
  },
  // Configurer l'export des fichiers statiques
  output: 'standalone',
  
  // Servir les fichiers statiques depuis /public
  basePath: '',
  
  // Configuration des headers CORS pour les images
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
    ];
  },
};

module.exports = nextConfig; 