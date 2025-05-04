# SOS-IT-Services

Application de services informatiques avec une architecture frontend/backend.

## Structure du projet

- `src/` - Code source du frontend (React, TypeScript, Vite)
- `backend/` - Code source du backend (Next.js API)
- `public/` - Ressources statiques du frontend

## Frontend

### Technologies utilisées

- React 18.3
- TypeScript 5.5
- Vite 5.4
- TailwindCSS 3.4
- Lucide React (icônes)

### Prérequis

- Node.js (version recommandée : 18.x ou supérieure)
- npm ou yarn

### Installation

```bash
# À la racine du projet
npm install
```

### Démarrage du développement

```bash
npm run dev
```

Le serveur de développement sera accessible sur [http://localhost:5173](http://localhost:5173).

### Construction pour la production

```bash
npm run build
```

Les fichiers générés seront placés dans le répertoire `dist/`.

### Aperçu de la version de production

```bash
npm run preview
```

## Backend

### Technologies utilisées

- Next.js 14.2
- MongoDB & Mongoose
- JWT pour l'authentification
- Swagger pour la documentation API
- TypeScript

### Prérequis

- Node.js (version recommandée : 18.x ou supérieure)
- npm ou yarn
- MongoDB (local ou distant)

### Installation

```bash
# Dans le répertoire backend/
cd backend
npm install
```

### Configuration

Créez un fichier `.env.local` dans le répertoire `backend/` avec les variables suivantes:

```
# MongoDB
MONGODB_URI=votre_uri_mongodb

# JWT
JWT_SECRET=votre_clé_secrète
JWT_EXPIRES_IN=30d

# App
API_URL=http://localhost:3000
```

### Démarrage du développement

```bash
# Dans le répertoire backend/
npm run dev
```

Le serveur backend sera accessible sur [http://localhost:3000](http://localhost:3000).

### Construction pour la production

```bash
# Dans le répertoire backend/
npm run build
```

### Démarrage en production

```bash
# Dans le répertoire backend/
npm run start
```

## Documentation API

La documentation API Swagger est accessible à l'URL `/api-docs` du backend.

## Démarrage complet de l'application (dev)

Pour démarrer à la fois le frontend et le backend en mode développement:

```bash
# Terminal 1 (frontend, à la racine)
npm run dev

# Terminal 2 (backend)
cd backend
npm run dev
```

## Licence

Tous droits réservés. 