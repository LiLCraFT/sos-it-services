import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Ticket from '@/models/Ticket';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    console.log(`Calcul de la note moyenne pour l'utilisateur ${params.id}`);
    
    const tickets = await Ticket.find({ 
      assignedTo: params.id,
      'feedback.rating': { $exists: true }
    });

    console.log(`Nombre de tickets avec feedback trouvés: ${tickets.length}`);

    if (tickets.length === 0) {
      console.log('Aucun ticket avec feedback trouvé, retourne 0');
      return NextResponse.json({ rating: 0 }, { status: 200 });
    }

    const totalRating = tickets.reduce((sum, ticket) => {
      const rating = ticket.feedback?.rating || 0;
      console.log(`Ticket ${ticket._id}: note = ${rating}`);
      return sum + rating;
    }, 0);
    
    const averageRating = totalRating / tickets.length;
    console.log(`Note moyenne calculée: ${averageRating}`);

    // Mettre à jour la note moyenne du freelancer
    await User.findByIdAndUpdate(params.id, { rating: averageRating });
    console.log('Note moyenne mise à jour dans la base de données');

    return NextResponse.json({ rating: averageRating }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur lors du calcul de la note moyenne:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 