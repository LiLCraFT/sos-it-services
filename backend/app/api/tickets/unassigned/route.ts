import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import Ticket from '../../../../models/Ticket';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const ticketsLibres = await Ticket.find({
      status: 'libre',
      $or: [
        { assignedTo: null },
        { assignedTo: { $exists: false } }
      ]
    });
    return NextResponse.json({ tickets: ticketsLibres });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 