import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Ticket from '@/models/Ticket';

export const dynamic = 'force-dynamic';

// Définir les paramètres statiques pour la route
export async function generateStaticParams() {
  return [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Récupérer l'ID depuis l'URL
    const segments = request.url.split('/');
    const userId = segments[segments.length - 2];
    
    const tickets = await Ticket.find({ 
      assignedTo: userId,
      'feedback.rating': { $exists: true }
    });

    if (tickets.length === 0) {
      return NextResponse.json({ rating: 0 }, { status: 200 });
    }

    const totalRating = tickets.reduce((sum, ticket) => {
      const rating = ticket.feedback?.rating || 0;
      return sum + rating;
    }, 0);
    
    const averageRating = totalRating / tickets.length;

    // Mettre à jour la note moyenne du freelancer
    await User.findByIdAndUpdate(userId, { rating: averageRating });

    return NextResponse.json({ rating: averageRating }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 