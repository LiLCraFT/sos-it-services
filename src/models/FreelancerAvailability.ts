import mongoose, { Document, Schema } from 'mongoose';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface IFreelancerAvailability extends Document {
  freelancerId: mongoose.Types.ObjectId;
  date: Date;
  timeSlots: TimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const freelancerAvailabilitySchema = new Schema<IFreelancerAvailability>(
  {
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlots: [
      {
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index pour optimiser les requêtes
freelancerAvailabilitySchema.index({ freelancerId: 1, date: 1 });

export default mongoose.model<IFreelancerAvailability>('FreelancerAvailability', freelancerAvailabilitySchema); 