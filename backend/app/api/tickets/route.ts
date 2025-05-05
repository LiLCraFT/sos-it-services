import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import jwt from 'jsonwebtoken';

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

    let query = {};
    
    // Si c'est un utilisateur normal, il peut seulement voir ses propres tickets
    // ou ceux qui lui sont assignés comme targetUser
    if (targetUserId) {
      query = { targetUser: targetUserId };
    } else {
      query = { 
        $or: [
          { createdBy: userId },
          { targetUser: userId },
        ]
      };
    }
    
    const tickets = await Ticket.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('targetUser', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });
      
    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error: any) {
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
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'Le titre et la description sont requis' }, 
        { status: 400 }
      );
    }
    
    // Create ticket
    const ticketData = {
      ...data,
      createdBy: userId,
    };
    
    const ticket = await Ticket.create(ticketData);
    
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 