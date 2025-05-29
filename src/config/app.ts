export const APP_CONFIG = {
  title: 'SOS IT Services - Dépannage Informatique Professionnel',
  favicon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💻</text></svg>',
  routes: {
    home: '/',
    depannage: '/depannage-informatique',
    creationSite: '/creation-site-web',
    monEspace: '/mon-espace',
    tickets: '/tickets/:id',
    expertsMap: '/experts-map'
  },
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY|| '' 
}; 