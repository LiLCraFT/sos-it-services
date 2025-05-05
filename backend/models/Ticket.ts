import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  subcategory: string;
  attachments: {
    filename: string;
    originalname: string;
    path: string;
    mimetype: string;
    size: number;
  }[];
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
    category: {
      type: String,
      required: [true, 'Catégorie est requise'],
      trim: true,
    },
    subcategory: {
      type: String,
      default: 'Non spécifié',
      trim: true,
    },
    attachments: [{
      filename: String,     // Nom du fichier stocké
      originalname: String, // Nom original du fichier
      path: String,         // Chemin d'accès au fichier
      mimetype: String,     // Type MIME du fichier
      size: Number          // Taille du fichier en octets
    }],
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