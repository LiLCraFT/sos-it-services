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

# Google OAuth - Authentification
# ID client Google OAuth (obtenu depuis la console Google Cloud)
GOOGLE_CLIENT_ID=votre_client_id_google
# Clé secrète Google OAuth (obtenue depuis la console Google Cloud)
GOOGLE_CLIENT_SECRET=votre_client_secret_google
# URI de redirection pour l'authentification Google
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
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

## Comment configurer l'authentification Google

1. Allez sur la [Console Google Cloud](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ API
4. Dans "Credentials", créez un nouveau "OAuth 2.0 Client ID"
5. Configurez les URIs de redirection autorisés:
   - `http://localhost:3001/api/auth/google/callback` (pour le développement)
   - `https://votre-domaine.com/api/auth/google/callback` (pour la production)
6. Copiez le Client ID et le Client Secret dans votre fichier `.env.local`

## Initialisation de la base de données

Après avoir configuré votre fichier `.env.local`, vous pouvez initialiser la base de données avec des données de test:

```bash
node scripts/init-db.js
```

Cette commande créera des utilisateurs et tickets de test pour vous permettre de tester l'application. 