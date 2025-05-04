# SOS IT Services - Backend

Ce dossier contient le backend pour l'application SOS IT Services, développé en Next.js avec une API REST et MongoDB.

## Technologies utilisées

- **Next.js**: Framework React avec support serveur
- **MongoDB**: Base de données NoSQL
- **Mongoose**: ODM (Object Document Mapper) pour MongoDB
- **JWT**: Authentification par token
- **Swagger**: Documentation API

## Prérequis

- Node.js 18+ et npm
- MongoDB (local ou en ligne)

## Installation

1. Cloner le dépôt
2. Installer les dépendances

```bash
cd backend
npm install
```

3. Créer un fichier `.env.local` à la racine du projet et ajouter les variables d'environnement suivantes:

```
MONGODB_URI=mongodb://localhost:27017/sos-it-services
JWT_SECRET=your_jwt_secret_key_here
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

## Démarrage

Pour lancer le serveur en mode développement:

```bash
npm run dev
```

Le serveur sera accessible à l'adresse http://localhost:3000.

## Documentation API

Une fois le serveur démarré, la documentation Swagger est disponible à l'adresse:

http://localhost:3000/api-docs

## Structure du projet

```
backend/
├── app/                # Routes Next.js et API
│   ├── api/            # Routes API REST
│   │   ├── auth/       # Routes authentification
│   │   ├── users/      # Routes utilisateurs
│   │   └── swagger.json # Spécification Swagger
│   └── api-docs/       # Page de documentation Swagger
├── lib/                # Utilitaires et services
│   └── mongodb.ts      # Configuration MongoDB
├── middleware.ts       # Middleware d'authentification
├── models/             # Modèles Mongoose
│   └── User.ts         # Modèle utilisateur
└── package.json        # Dépendances du projet
```

## Routes API principales

- 🔓 `POST /api/auth/register` - Inscription utilisateur
- 🔓 `POST /api/auth/login` - Authentification utilisateur
- 🔒 `GET /api/users` - Liste des utilisateurs
- 🔒 `GET /api/users/:id` - Détails d'un utilisateur
- 🔒 `PUT /api/users/:id` - Mise à jour d'un utilisateur
- 🔒 `DELETE /api/users/:id` - Suppression d'un utilisateur

_Note: Les routes marquées 🔒 nécessitent une authentification par token JWT._

## Authentification

Pour les routes protégées, inclure le header d'authentification:

```
Authorization: Bearer YOUR_JWT_TOKEN
``` 