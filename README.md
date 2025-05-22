# SOS IT Services

Application web de gestion de services informatiques professionnels.

## Architecture du Projet

```
src/
├── components/     # Composants réutilisables
├── contexts/       # Contextes React (Auth, etc.)
├── layouts/        # Layouts de l'application
├── pages/         # Pages principales
├── routes/        # Configuration des routes
├── config/        # Configuration globale
└── utils/         # Utilitaires et helpers
```

## Règles de Développement

### 1. Organisation des Routes
- Toutes les routes doivent être définies dans `src/routes/index.tsx`
- Utiliser les constantes de routes définies dans `src/config/app.ts`
- Les routes protégées doivent utiliser le composant `PrivateRoute`
- Éviter la duplication de routes

### 2. Structure des Composants
- Les composants réutilisables vont dans `src/components/`
- Les pages complètes vont dans `src/pages/`
- Utiliser le `MainLayout` pour toutes les pages
- Les composants doivent être des fonctions nommées (pas de fonctions anonymes)

### 3. Gestion de l'État
- Utiliser les Contextes React pour l'état global
- Les contextes doivent être dans `src/contexts/`
- Éviter le prop drilling

### 4. Styles
- Utiliser Tailwind CSS pour le styling
- Suivre la convention de nommage des classes Tailwind
- Éviter les styles inline

### 5. Sécurité
- Toutes les routes protégées doivent passer par `PrivateRoute`
- Gérer les tokens d'authentification via `TokenHandler`
- Ne jamais exposer les clés API dans le code

### 6. Configuration
- Centraliser la configuration dans `src/config/`
- Utiliser les constantes pour les valeurs réutilisables
- Documenter les changements de configuration

## Installation

```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm run dev

# Build pour production
npm run build
```

## Technologies Utilisées

- React
- TypeScript
- React Router
- Tailwind CSS
- Context API

## Fonctionnalités

- Page d'accueil avec présentation des services
- Système d'authentification
- Espace client personnalisé
- Gestion des tickets de support
- Services de dépannage informatique
- Création de sites web

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT.