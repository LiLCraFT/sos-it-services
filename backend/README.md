# SOS IT Services - Backend

Ce dossier contient le backend pour l'application SOS IT Services, développé en Next.js avec une API REST et MongoDB.

## 🚀 Technologies utilisées

- **Next.js 14.2**: Framework React avec support serveur et API routes
- **MongoDB**: Base de données NoSQL
- **Mongoose**: ODM (Object Document Mapper) pour MongoDB
- **JWT**: Authentification par token
- **TypeScript**: Typage statique
- **Swagger**: Documentation API
- **Express middleware**: Middleware pour les requêtes HTTP

## 🔧 Prérequis

- Node.js 18+ et npm
- MongoDB (local ou en ligne)

## 📥 Installation

1. Cloner le dépôt (si ce n'est pas déjà fait)
```bash
git clone https://github.com/votre-user/sos-it-services.git
cd sos-it-services/backend
```

2. Installer les dépendances
```bash
npm install
```

3. Créer un fichier `.env.local` à la racine du dossier backend (copier depuis `.env.example` si disponible)
```bash
cp .env.example .env.local
```

4. Ajouter les variables d'environnement suivantes dans `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/sos-it-services
JWT_SECRET=votre_jwt_secret_key_here
JWT_EXPIRES_IN=30d
API_URL=http://localhost:3001
```

## 💾 Initialisation de la base de données

Pour initialiser la base de données avec des utilisateurs de test:

```bash
node scripts/init-db.js
```

Ce script créera deux utilisateurs de test:
- Admin: admin@example.com / admin123
- Utilisateur: user@example.com / user123

## 🏃‍♂️ Démarrage

Pour lancer le serveur en mode développement:

```bash
npm run dev
```

Le serveur sera accessible à l'adresse http://localhost:3001.

Pour lancer en production:

```bash
npm run build
npm run start
```

## 📚 Documentation API

Une fois le serveur démarré, la documentation Swagger est disponible à l'adresse:

http://localhost:3001/api-docs

## 📂 Structure du projet

```
backend/
├── app/                # Routes Next.js et API
│   ├── api/            # Routes API REST
│   │   ├── auth/       # Routes authentification
│   │   ├── users/      # Routes utilisateurs
│   │   ├── tickets/    # Routes tickets
│   │   └── swagger.json # Spécification Swagger
│   └── api-docs/       # Page de documentation Swagger
├── lib/                # Utilitaires et services
│   ├── mongodb.ts      # Configuration MongoDB
│   └── auth.ts         # Fonctions d'authentification
├── middleware.ts       # Middleware d'authentification
├── middleware/         # Middleware personnalisé
├── models/             # Modèles Mongoose
│   ├── User.ts         # Modèle utilisateur
│   └── Ticket.ts       # Modèle ticket
├── scripts/            # Scripts utilitaires
│   ├── init-db.js      # Initialisation de la base de données
│   └── seed-experts.js # Ajout d'experts au système
└── package.json        # Dépendances du projet
```

## 🔌 Routes API principales

### Authentification
- 🔓 `POST /api/auth/register` - Inscription utilisateur
- 🔓 `POST /api/auth/login` - Authentification utilisateur
- 🔓 `GET /api/auth/verify` - Vérification d'un token JWT
- 🔒 `POST /api/auth/logout` - Déconnexion

### Utilisateurs
- 🔒 `GET /api/users` - Liste des utilisateurs
- 🔒 `GET /api/users/:id` - Détails d'un utilisateur
- 🔒 `PATCH /api/users/:id` - Mise à jour d'un utilisateur
- 🔒 `DELETE /api/users/:id` - Suppression d'un utilisateur
- 🔒 `POST /api/users/:id/profile-image` - Mise à jour de l'image de profil

### Tickets
- 🔒 `GET /api/tickets` - Liste des tickets
- 🔒 `POST /api/tickets` - Création d'un ticket
- 🔒 `GET /api/tickets/:id` - Détails d'un ticket
- 🔒 `PATCH /api/tickets/:id` - Mise à jour d'un ticket
- 🔒 `DELETE /api/tickets/:id` - Suppression d'un ticket

_Note: Les routes marquées 🔒 nécessitent une authentification par token JWT._

## 🔐 Authentification

Pour les routes protégées, inclure le header d'authentification:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Tests

Pour exécuter les tests:

```bash
npm test
```

## 📦 Construction pour la production

Pour construire l'application pour la production:

```bash
npm run build
```

Les fichiers générés seront placés dans le répertoire `.next/`.

## 📜 Scripts disponibles

Le dossier backend contient plusieurs scripts npm pour faciliter le développement:

```bash
# Démarrer le serveur de développement
npm run dev

# Construire l'application pour la production
npm run build

# Démarrer l'application en mode production
npm run start

# Exécuter les tests
npm test

# Initialiser la base de données
node scripts/init-db.js

# Remplir la base de données avec des experts
node scripts/seed-experts.js
``` 