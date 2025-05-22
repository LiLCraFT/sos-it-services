import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development';

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     description: Vérifie la validité d'un token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     address:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     birthDate:
 *                       type: string
 *                       format: date
 *                     city:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Token invalide ou expiré
 *       500:
 *         description: Erreur serveur
 */
export async function GET(req: NextRequest) {
  console.log('Verify token: Début de la vérification');
  
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Verify token: Token manquant dans les headers');
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Verify token: Token reçu:', token);
  
  try {
    console.log('Verify token: Vérification du token avec JWT...');
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string, _id?: string };
    console.log('Verify token: Token décodé:', decoded);
    
    // Connexion à la base de données
    await dbConnect();
    
    // Récupération de l'utilisateur
    const userId = decoded.userId || decoded._id;
    console.log('Verify token: Recherche de l\'utilisateur avec l\'ID:', userId);
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('Verify token: Utilisateur non trouvé');
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 });
    }
    
    console.log('Verify token: Utilisateur trouvé:', user.email);
    
    // Retourner les données de l'utilisateur
    return NextResponse.json({
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        phone: user.phone,
        birthDate: user.birthDate,
        city: user.city,
        role: user.role,
        profileImage: user.profileImage,
        subscriptionType: user.subscriptionType,
        clientType: user.clientType
      }
    });
  } catch (error) {
    console.error('Verify token: Erreur lors de la vérification:', error);
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }
} 