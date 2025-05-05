# SOS-IT-Services

Plateforme moderne pour la gestion de services informatiques d'assistance et de support technique. Ce projet est composé d'un frontend React/Vite et d'un backend Next.js.

## 📋 Structure du projet

- `src/` - Code source du frontend React/Vite
- `backend/` - Code source du backend Next.js (API)
- `public/` - Ressources statiques du frontend

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 18.x ou supérieure)
- npm (version 9.x ou supérieure)
- MongoDB (local ou distant)

### Installation et démarrage complet

```bash
# Cloner le dépôt
git clone https://github.com/votre-user/sos-it-services.git
cd sos-it-services

# Installer les dépendances frontend et backend
npm install
cd backend && npm install && cd ..

# Configurer la base de données
cd backend
cp .env.example .env.local
# Modifier le fichier .env.local avec vos informations

# Initialiser la base de données avec des données de test
node scripts/init-db.js

# Démarrer l'application en mode développement (deux options)
# Option 1: Démarrer frontend et backend en une seule commande
npm run dev:all

# Option 2: Démarrer séparément dans deux terminaux
# Terminal 1 (Frontend)
npm run dev

# Terminal 2 (Backend)
cd backend && npm run dev
```

Le frontend sera accessible sur http://localhost:5173
Le backend sera accessible sur http://localhost:3001

## 🔧 Configuration de l'environnement

### Frontend (React/Vite)

1. À la racine du projet, installez les dépendances:
```bash
npm install
```

2. Lancez le serveur de développement frontend:
```bash
npm run dev
```

### Backend (Next.js)

1. Allez dans le dossier backend:
```bash
cd backend
```

2. Créez un fichier `.env.local` basé sur `.env.example`:
```bash
cp .env.example .env.local
```

3. Modifiez le fichier `.env.local` avec vos informations:
```
# MongoDB
MONGODB_URI=mongodb://localhost:27017/sos-it-services

# JWT
JWT_SECRET=votre_clé_secrète
JWT_EXPIRES_IN=30d

# App
API_URL=http://localhost:3001
```

4. Installez les dépendances:
```bash
npm install
```

5. Initialisez la base de données (optionnel):
```bash
node scripts/init-db.js
```

6. Lancez le serveur de développement backend:
```bash
npm run dev
```

## 🔒 Authentification

L'authentification utilise JSON Web Tokens (JWT). Le frontend communique avec l'API via un contexte d'authentification React.

### Points d'API disponibles

- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login` - Authentification avec email/mot de passe
- `GET /api/auth/verify` - Vérification de la validité d'un token
- `POST /api/auth/logout` - Déconnexion (invalidation du token)

### Utilisateurs de test (après initialisation de la BD)

| Email              | Mot de passe | Rôle    |
|--------------------|--------------|---------|
| admin@example.com  | admin123     | Admin   |
| user@example.com   | user123      | User    |

## 💻 Technologies utilisées

### Frontend

- React 18.3
- TypeScript 5.5
- Vite 5.4
- TailwindCSS 3.4
- Lucide React (icônes)
- React Router
- Axios

### Backend

- Next.js 14.2
- MongoDB & Mongoose
- JWT pour l'authentification
- Express middleware
- TypeScript
- Swagger pour la documentation API

## 📝 Documentation

- Documentation API: http://localhost:3001/api-docs (disponible après démarrage du backend)
- README du frontend: [README Frontend](./README.md)
- README du backend: [README Backend](./backend/README.md)

## 🧪 Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test
```

## 📦 Build pour la production

### Frontend
```bash
npm run build
```

### Backend
```bash
cd backend && npm run build
```

## 📜 Scripts disponibles

Le projet contient plusieurs scripts npm pour faciliter le développement:

```bash
# Démarrer le frontend et le backend simultanément
npm run dev:all

# Démarrer uniquement le frontend
npm run dev:frontend

# Démarrer uniquement le backend
npm run dev:backend

# Autre façon de démarrer le frontend et le backend (équivalent à dev:all)
npm run dev

# Construire le frontend pour la production
npm run build

# Lancer le linting sur le code frontend
npm run lint

# Prévisualiser la build de production
npm run preview
```

## 📄 Licence

Tous droits réservés.