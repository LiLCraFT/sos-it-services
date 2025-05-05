/**
 * Vérifie si un utilisateur a les droits d'administration
 * Les administrateurs et les fondateurs ont les droits d'administration
 */
export function hasAdminRights(userRole: string): boolean {
  return userRole === 'admin' || userRole === 'fondateur';
} 