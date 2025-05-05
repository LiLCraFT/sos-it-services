import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  targetUser?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: [true, 'Titre est requis'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description est requise'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Si le modèle existe déjà, on le supprime pour éviter les erreurs
if (mongoose.models.Ticket) {
  delete mongoose.models.Ticket;
}

const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket; 