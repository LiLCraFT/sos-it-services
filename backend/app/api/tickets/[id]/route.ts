import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User, { IUser } from '@/models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Helper function to get user ID from JWT token
const getUserIdFromToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development') as { userId?: string, _id?: string };
    const userId = decoded.userId || decoded._id || null;
    return userId;
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
    
    // Get the user for audit
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Check if user has permission to update
    // On permet aussi aux administrateurs et aux techniciens assignés de modifier
    let canModify = 
      ticket.createdBy.toString() === userId || 
      user.role === 'admin' || 
      user.role === 'fondateur' ||
      (ticket.assignedTo && ticket.assignedTo.toString() === userId);

    // Exception : un ticket "libre" peut être pris par n'importe quel utilisateur (auto-assignation pour diagnostic)
    if (
      ticket.status === 'libre' &&
      data.status === 'diagnostic' &&
      (user.role === 'freelancer' || user.role === 'fondateur')
    ) {
      canModify = true;
    }

    // Exception : un ticket en diagnostic peut être modifié par le freelancer assigné ou un fondateur
    if (
      ticket.status === 'diagnostic' &&
      (user.role === 'fondateur' || (user.role === 'freelancer' && ticket.assignedTo && ticket.assignedTo.toString() === userId))
    ) {
      canModify = true;
    }

    if (!canModify) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    // Préparer l'événement d'audit
    const auditEvent = {
      date: new Date(),
      action: 'update',
      user: {
        _id: userId,
        name: `${user.firstName} ${user.lastName}`
      },
      details: {}
    };
    
    // Enregistrer les changements spécifiques
    if (data.status && data.status !== ticket.status) {
      auditEvent.action = 'status_change';
      auditEvent.details = {
        from: ticket.status,
        to: data.status
      };
    }
    
    if (data.assignedTo && (!ticket.assignedTo || data.assignedTo !== ticket.assignedTo.toString())) {
      const assignedUser = await User.findById(data.assignedTo);
      if (assignedUser) {
        auditEvent.action = 'assignment';
        auditEvent.details = {
          from: ticket.assignedTo ? ticket.assignedTo.toString() : 'unassigned',
          to: data.assignedTo,
          toName: `${assignedUser.firstName} ${assignedUser.lastName}`
        };
      }
    }
    
    // Mettre à jour le ticket
    const update: any = {
      status: data.status
    };

    // Si on a un feedback, on l'ajoute
    if (data.description && !data.skipFeedback) {
      update.feedback = {
        description: data.description,
        rating: data.rating || 5,
        date: new Date()
      };

      try {
        // Mettre à jour la note moyenne du freelancer
        if (ticket.assignedTo) {
          const averageRating = await User.calculateAverageRating(ticket.assignedTo.toString());
          await User.findByIdAndUpdate(ticket.assignedTo, { rating: averageRating });
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la note moyenne:', error);
      }
    }

    // Ajouter l'événement d'audit
    update.$push = { auditTrail: auditEvent };
    
    // Update the ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(
      params.id,
      update,
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
    
    // Get the user for audit
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Check if user has permission to delete
    if (ticket.createdBy.toString() !== userId && user.role !== 'admin' && user.role !== 'fondateur') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    // Delete the ticket
    await Ticket.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: 'Ticket supprimé avec succès' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 