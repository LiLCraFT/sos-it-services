// URL de l'image par défaut
export const DEFAULT_IMAGE = 'http://localhost:3001/api/default-image';

/**
 * Fonction utilitaire pour construire l'URL complète d'une image de profil
 * @param path - Le chemin de l'image (peut être null, undefined, une URL complète ou un chemin relatif)
 * @returns L'URL complète de l'image
 */
export const getImageUrl = (path: string | null | undefined): string => {
  // Si pas de chemin ou chemin vide, retourner l'image par défaut
  if (!path) {
    return DEFAULT_IMAGE;
  }

  // Si c'est déjà une URL complète, la retourner telle quelle
  if (path.startsWith('http')) {
    return path;
  }

  // Si le chemin commence par /images/ ou /uploads/, construire l'URL complète
  if (path.startsWith('/images/') || path.startsWith('/uploads/')) {
    return `http://localhost:3001${path}`;
  }

  // Pour les autres chemins, utiliser l'API statique
  return `http://localhost:3001/api/static?path=${encodeURIComponent(path)}`;
}; 