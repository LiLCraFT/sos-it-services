# SOS IT Services

Application web de gestion de services informatiques professionnels.

## Architecture du Projet

### Frontend
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

### Backend
```
backend/
├── src/
│   ├── config/         # Configuration de l'application
│   ├── controllers/    # Contrôleurs des routes
│   ├── middleware/     # Middleware personnalisés
│   ├── models/         # Modèles de données
│   ├── routes/         # Définition des routes
│   ├── services/       # Logique métier
│   ├── types/          # Types TypeScript
│   └── utils/          # Utilitaires
├── tests/              # Tests unitaires et d'intégration
└── prisma/             # Schéma et migrations Prisma
```

## Règles de Développement

### Frontend
- Voir [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) pour les règles frontend

### Backend
- Voir [BACKEND_RULES.md](./BACKEND_RULES.md) pour les règles backend

## Installation

### Frontend
```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm run dev

# Build pour production
npm run build
```

### Backend
```bash
# Aller dans le dossier backend
cd backend

# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env
# Modifier le fichier .env avec vos configurations

# Migration de la base de données
npx prisma migrate dev

# Démarrage en développement
npm run dev

# Build pour production
npm run build
```

## Technologies Utilisées

### Frontend
- React
- TypeScript
- React Router
- Tailwind CSS
- Context API

### Backend
- Node.js
- Express
- TypeScript
- Prisma (ORM)
- PostgreSQL
- JWT pour l'authentification
- Zod pour la validation
- Jest pour les tests

## Fonctionnalités

- Page d'accueil avec présentation des services
- Système d'authentification
- Espace client personnalisé
- Gestion des tickets de support
- Services de dépannage informatique
- Création de sites web
- API RESTful
- Documentation Swagger/OpenAPI

## API Endpoints

### Authentification
- POST /api/auth/register - Inscription
- POST /api/auth/login - Connexion
- POST /api/auth/logout - Déconnexion
- GET /api/auth/me - Informations utilisateur

### Tickets
- GET /api/tickets - Liste des tickets
- POST /api/tickets - Création d'un ticket
- GET /api/tickets/:id - Détails d'un ticket
- PUT /api/tickets/:id - Mise à jour d'un ticket

### Services
- GET /api/services - Liste des services
- GET /api/services/:id - Détails d'un service
- POST /api/services/:id/book - Réservation d'un service

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Documentation

- [Règles de développement Frontend](./DEVELOPMENT_RULES.md)
- [Règles de développement Backend](./BACKEND_RULES.md)
- [Documentation API](./docs/api.md)

## Licence

Ce projet est sous licence MIT.