import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

// Helper function to get user ID from JWT token
const getUserIdFromToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development') as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Get all tickets or tickets related to a specific user
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const url = new URL(req.url);
    const targetUserId = url.searchParams.get('targetUser');
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur pour vérifier son rôle
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    console.log('User role:', user.role);
    console.log('User ID:', userId);

    let query = {};
    
    // Si l'utilisateur est admin ou fondateur, il peut voir tous les tickets
    if (user.role === 'admin' || user.role === 'fondateur') {
      query = {};
      console.log('Admin/Fondateur query:', query);
    } 
    // Si l'utilisateur est freelancer_admin, il peut voir tous les tickets
    else if (user.role === 'freelancer_admin') {
      query = {};
      console.log('Freelancer admin query:', query);
    }
    // Si l'utilisateur est freelancer, il peut voir les tickets qui lui sont assignés
    else if (user.role === 'freelancer') {
      query = { assignedTo: userId };
      console.log('Freelancer query:', query);
    }
    // Pour les autres utilisateurs
    else if (targetUserId) {
      query = { targetUser: targetUserId };
      console.log('Target user query:', query);
    } else {
      query = { createdBy: userId };
      console.log('Default user query:', query);
    }
    
    const tickets = await Ticket.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('targetUser', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    console.log('Number of tickets found:', tickets.length);
    if (tickets.length > 0) {
      console.log('First ticket details:', {
        id: tickets[0]._id,
        createdBy: tickets[0].createdBy,
        targetUser: tickets[0].targetUser,
        assignedTo: tickets[0].assignedTo
      });
    } else {
      console.log('No tickets found');
    }
      
    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/tickets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new ticket
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }
    
    // La requête peut être multipart/form-data si des fichiers sont envoyés
    // Nous devons vérifier le type de contenu
    const contentType = req.headers.get('content-type') || '';
    
    let data: any = {};
    let attachments = [];
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      
      // Extraire les données du formulaire
      data = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        category: formData.get('category'),
        subcategory: formData.get('subcategory') || 'Non spécifié',
      };
      
      if (formData.get('targetUser')) {
        data.targetUser = formData.get('targetUser');
      }
      
      // Extraire les pièces jointes
      const files = formData.getAll('attachments');
      
      for (const file of files) {
        if (file instanceof File) {
          // Stocker le fichier dans un dossier d'uploads (implémentation à faire)
          // Pour l'instant, on simule avec les détails du fichier
          const attachment = {
            filename: `${Date.now()}-${file.name}`, // On génère un nom unique
            originalname: file.name,
            path: `/uploads/${Date.now()}-${file.name}`, // Chemin simulé
            mimetype: file.type,
            size: file.size
          };
          
          attachments.push(attachment);
        }
      }
    } else {
      // Si c'est une requête JSON standard
      data = await req.json();
    }
    
    // Validate required fields
    if (!data.title || !data.description || !data.category) {
      return NextResponse.json(
        { error: 'Le titre, la description et la catégorie sont requis' }, 
        { status: 400 }
      );
    }
    
    // Récupérer l'utilisateur pour l'audit
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Créer un événement d'audit pour la création du ticket
    const creationAudit = {
      date: new Date(),
      action: 'creation',
      user: {
        _id: userId,
        name: `${user.firstName} ${user.lastName}`
      },
      details: {
        title: data.title,
        category: data.category
      }
    };
    
    // Create ticket
    const ticketData = {
      ...data,
      createdBy: userId,
      attachments: attachments.length > 0 ? attachments : undefined,
      auditTrail: [creationAudit]
    };
    
    const ticket = await Ticket.create(ticketData);
    
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 