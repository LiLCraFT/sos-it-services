# Configuration des variables d'environnement

## Comment configurer l'environnement

1. Créez un fichier `.env.local` dans le dossier `backend/`
2. Copiez le contenu ci-dessous et personnalisez selon vos besoins
3. Assurez-vous que ce fichier n'est PAS versionné dans Git (il est ajouté au .gitignore par défaut)

## Variables d'environnement requises

```
# MongoDB - Base de données
# URI de connexion à votre base MongoDB (locale ou distante)
MONGODB_URI=mongodb://localhost:27017/sos-it-services

# JWT - Authentification
# Clé de chiffrement pour les tokens JWT (doit être complexe et sécurisée)
JWT_SECRET=votre_clé_secrète_jwt_très_sécurisée
# Durée de validité des tokens JWT
JWT_EXPIRES_IN=30d

# API - Configuration
# URL de base de l'API pour les liens absolus
API_URL=http://localhost:3001
# Port sur lequel l'API sera accessible
PORT=3001
```

## Variables d'environnement optionnelles

```
# Google Maps API (pour l'autocomplétion des adresses)
GOOGLE_MAPS_API_KEY=votre_clé_api_google_maps

# Configuration Email (pour les notifications)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=votre_email@example.com
EMAIL_PASS=votre_mot_de_passe_email
EMAIL_FROM=noreply@sos-it-services.com

# Mode d'exécution (development, production, test)
NODE_ENV=development
```

## Comment générer une clé JWT sécurisée

Vous pouvez générer une clé JWT sécurisée en exécutant cette commande dans votre terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Initialisation de la base de données

Après avoir configuré votre fichier `.env.local`, vous pouvez initialiser la base de données avec des données de test:

```bash
node scripts/init-db.js
```

Cette commande créera des utilisateurs et tickets de test pour vous permettre de tester l'application. 