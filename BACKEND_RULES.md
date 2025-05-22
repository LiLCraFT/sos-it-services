# Règles de Développement Backend - SOS IT Services

## 1. Architecture et Structure

### Organisation des Dossiers
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

### Règles Générales
- Suivre le principe de responsabilité unique
- Utiliser l'architecture en couches (Controller -> Service -> Model)
- Implémenter le pattern Repository pour l'accès aux données
- Séparer la logique métier des contrôleurs

## 2. API et Routes

### Structure des Routes
```typescript
// routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation';

const router = Router();
const authController = new AuthController();

router.post('/register', 
  validateRequest(registerSchema),
  authController.register
);

export default router;
```

### Règles de Routes
- Utiliser des préfixes cohérents pour les routes
- Implémenter la validation des requêtes
- Documenter toutes les routes avec Swagger/OpenAPI
- Gérer les erreurs de manière uniforme

## 3. Contrôleurs

### Structure des Contrôleurs
```typescript
// controllers/user.controller.ts
export class UserController {
  constructor(private userService: UserService) {}

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.findById(req.params.id);
      res.json(user);
    } catch (error) {
      handleError(res, error);
    }
  }
}
```

### Règles des Contrôleurs
- Maximum 100 lignes par contrôleur
- Pas de logique métier dans les contrôleurs
- Gestion uniforme des erreurs
- Utilisation des services pour la logique métier

## 4. Services

### Structure des Services
```typescript
// services/user.service.ts
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}
```

### Règles des Services
- Contenir toute la logique métier
- Gérer les transactions
- Implémenter la gestion des erreurs métier
- Utiliser les repositories pour l'accès aux données

## 5. Modèles et Base de Données

### Structure des Modèles
```typescript
// models/user.model.ts
export interface IUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Règles de Base de Données
- Utiliser Prisma comme ORM
- Définir les relations explicitement
- Implémenter les migrations
- Utiliser les transactions pour les opérations complexes

## 6. Middleware

### Structure des Middleware
```typescript
// middleware/auth.middleware.ts
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedError('No token provided');
    
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
```

### Règles des Middleware
- Un middleware = une responsabilité
- Gérer les erreurs proprement
- Documenter les dépendances
- Tester les middleware

## 7. Validation

### Structure de Validation
```typescript
// validation/user.validation.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['USER', 'ADMIN'])
});

// middleware/validation.middleware.ts
export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(new ValidationError(error));
    }
  };
};
```

### Règles de Validation
- Utiliser Zod pour la validation
- Valider toutes les entrées
- Messages d'erreur clairs
- Validation au niveau des routes

## 8. Gestion des Erreurs

### Structure des Erreurs
```typescript
// errors/app.error.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// middleware/error.middleware.ts
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }
  
  // Log error
  console.error(error);
  
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
```

### Règles de Gestion des Erreurs
- Hiérarchie d'erreurs claire
- Logging approprié
- Réponses d'erreur cohérentes
- Gestion des erreurs non opérationnelles

## 9. Tests

### Structure des Tests
```typescript
// tests/user.service.test.ts
describe('UserService', () => {
  let userService: UserService;
  let userRepository: MockUserRepository;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    userService = new UserService(userRepository);
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await userService.create(userData);
    expect(user.email).toBe(userData.email);
  });
});
```

### Règles de Tests
- Tests unitaires pour les services
- Tests d'intégration pour les routes
- Mocks pour les dépendances externes
- Couverture de tests > 80%

## 10. Sécurité

### Règles de Sécurité
- Utiliser HTTPS en production
- Implémenter rate limiting
- Valider et sanitizer toutes les entrées
- Utiliser des tokens JWT sécurisés
- Implémenter CORS correctement
- Hasher les mots de passe avec bcrypt
- Utiliser des variables d'environnement

### Exemple de Configuration de Sécurité
```typescript
// config/security.ts
export const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d'
  },
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  }
};
```

## 11. Performance

### Optimisations
- Mise en cache avec Redis
- Pagination des résultats
- Indexation de la base de données
- Compression des réponses
- Gestion des connexions

### Exemple de Mise en Cache
```typescript
// services/cache.service.ts
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }
}
```

## 12. Documentation

### Règles de Documentation
- Documentation OpenAPI/Swagger
- Documentation des types
- Commentaires JSDoc
- README détaillé

### Exemple de Documentation API
```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère la liste des utilisateurs
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
``` 