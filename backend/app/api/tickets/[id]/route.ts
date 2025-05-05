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

// Get a specific ticket by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }
    
    const ticket = await Ticket.findById(params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('targetUser', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
      
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 });
    }
    
    // Vérifier que l'utilisateur a le droit de voir ce ticket
    if (ticket.createdBy._id.toString() !== userId && 
        ticket.targetUser?._id.toString() !== userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    return NextResponse.json({ ticket }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update a ticket
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Find the ticket first
    const ticket = await Ticket.findById(params.id);
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 });
    }
    
    // Check if user has permission to update
    if (ticket.createdBy.toString() !== userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    // Update the ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('targetUser', 'firstName lastName email')
     .populate('assignedTo', 'firstName lastName email');
    
    return NextResponse.json({ ticket: updatedTicket }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a ticket
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }
    
    // Find the ticket first
    const ticket = await Ticket.findById(params.id);
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 });
    }
    
    // Check if user has permission to delete
    if (ticket.createdBy.toString() !== userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    // Delete the ticket
    await Ticket.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: 'Ticket supprimé avec succès' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 