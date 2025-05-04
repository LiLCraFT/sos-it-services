# Configuration des variables d'environnement

Créez un fichier `.env.local` dans le dossier `backend/` avec le contenu suivant:

```
# URI de connexion MongoDB
MONGODB_URI=mongodb://localhost:27017/sos-it-services

# Configuration JWT 
JWT_SECRET=votre_clé_secrète_jwt_très_sécurisée
JWT_EXPIRES_IN=7d
```

Ces variables seront utilisées par l'application pour se connecter à votre base de données MongoDB locale et gérer l'authentification. 