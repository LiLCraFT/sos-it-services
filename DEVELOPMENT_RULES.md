# Règles de Développement - SOS IT Services

## 1. Architecture et Structure

### Organisation des Dossiers
- Suivre strictement la structure de dossiers définie
- Ne pas créer de dossiers en dehors de la structure standard
- Maintenir la séparation des responsabilités

### Nommage
- Utiliser le PascalCase pour les composants React
- Utiliser le camelCase pour les fonctions et variables
- Utiliser le kebab-case pour les noms de fichiers
- Préfixer les interfaces avec "I" (ex: IUserProps)

## 2. Composants React

### Structure des Composants
```typescript
// Bon exemple
const UserProfile: React.FC<IUserProfileProps> = ({ user }) => {
  // Hooks en haut
  const [state, setState] = useState();

  // Fonctions utilitaires
  const handleSubmit = () => {};

  // Rendu
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Règles de Composants
- Un composant = un fichier
- Maximum 300 lignes par composant
- Extraire la logique complexe dans des hooks personnalisés
- Utiliser des composants fonctionnels avec TypeScript
- Documenter les props avec des interfaces

## 3. Gestion des Routes

### Configuration des Routes
```typescript
// Dans src/config/app.ts
export const APP_CONFIG = {
  routes: {
    home: '/',
    // ...
  }
};

// Dans les composants
import { APP_CONFIG } from '../config/app';
<Link to={APP_CONFIG.routes.home}>Accueil</Link>
```

### Règles de Routes
- Toujours utiliser les constantes de routes
- Protéger les routes sensibles avec PrivateRoute
- Éviter les routes imbriquées profondes
- Documenter les nouvelles routes

## 4. Gestion de l'État

### Contextes
- Un contexte par domaine fonctionnel
- Utiliser des hooks personnalisés pour accéder aux contextes
- Éviter les contextes imbriqués

### Exemple de Contexte
```typescript
// contexts/AuthContext.tsx
export const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
  // Logique du contexte
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

## 5. Styles et UI

### Tailwind CSS
- Utiliser les classes utilitaires Tailwind
- Créer des composants réutilisables pour les patterns communs
- Suivre la convention de nommage des classes

### Exemple de Style
```typescript
// Bon
<div className="flex items-center justify-between p-4 bg-gray-100">

// Mauvais
<div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
```

## 6. Tests

### Règles de Tests
- Tests unitaires pour la logique métier
- Tests d'intégration pour les composants
- Tests E2E pour les flux critiques
- Maintenir une couverture de tests > 80%

### Exemple de Test
```typescript
describe('UserProfile', () => {
  it('should render user information', () => {
    // Test
  });
});
```

## 7. Performance

### Optimisations
- Utiliser React.memo pour les composants purs
- Implémenter la pagination pour les listes longues
- Optimiser les images et les assets
- Utiliser le lazy loading pour les routes

### Exemple d'Optimisation
```typescript
// Lazy loading des routes
const UserDashboard = lazy(() => import('../pages/UserDashboard'));

// Dans les routes
<Suspense fallback={<Loading />}>
  <UserDashboard />
</Suspense>
```

## 8. Sécurité

### Règles de Sécurité
- Valider toutes les entrées utilisateur
- Sanitizer les données avant l'affichage
- Utiliser HTTPS en production
- Gérer correctement les tokens d'authentification

### Exemple de Validation
```typescript
const validateUserInput = (input: string): boolean => {
  // Validation
  return true;
};
```

## 9. Documentation

### Règles de Documentation
- Documenter les composants complexes
- Maintenir le README à jour
- Documenter les APIs
- Ajouter des commentaires pour le code complexe

### Exemple de Documentation
```typescript
/**
 * Composant UserProfile
 * @param {IUserProfileProps} props - Les propriétés du composant
 * @returns {JSX.Element} Le composant UserProfile
 */
```

## 10. Git et Workflow

### Règles Git
- Utiliser des messages de commit conventionnels
- Créer des branches par fonctionnalité
- Faire des PRs pour chaque changement
- Maintenir l'historique propre

### Exemple de Message de Commit
```
feat(auth): add user authentication
fix(ui): resolve mobile layout issues
docs(readme): update installation instructions
```

## 11. Code Review

### Processus de Review
- Vérifier la conformité aux règles
- Tester les fonctionnalités
- Vérifier la performance
- S'assurer de la couverture de tests

### Checklist de Review
- [ ] Code conforme aux standards
- [ ] Tests présents et passants
- [ ] Documentation à jour
- [ ] Performance vérifiée
- [ ] Sécurité assurée 