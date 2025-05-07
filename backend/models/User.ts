import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Force clean up pour éviter les erreurs de validation avec l'ancien modèle
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  address: string;
  phone: string;
  birthDate?: Date;
  city: string;
  clientType: 'Particulier' | 'Professionnel' | 'Freelancer';
  subscriptionType: 'none' | 'solo' | 'family';
  role: 'user' | 'admin' | 'fondateur' | 'freelancer' | 'freelancer_admin';
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isModified(path: string): boolean;
  isEmailVerified: boolean;
  isAdminVerified: boolean;
  emailVerificationToken: string;
  emailVerificationTokenExpires: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email est requis'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email invalide'],
    },
    password: {
      type: String,
      required: [true, 'Mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    },
    firstName: {
      type: String,
      required: function(this: IUser) {
        return true; // Toujours requis, contient le nom de l'entreprise pour les professionnels
      },
      trim: true,
    },
    lastName: {
      type: String,
      required: function(this: IUser) {
        return this.clientType !== 'Professionnel'; // Pas requis pour les professionnels
      },
      trim: true,
    },
    companyName: {
      type: String,
      required: function(this: IUser) {
        return this.clientType === 'Professionnel';
      },
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Adresse est requise'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Numéro de téléphone est requis'],
      trim: true,
    },
    birthDate: {
      type: Date,
      required: function(this: IUser) {
        return this.clientType !== 'Professionnel';
      },
    },
    city: {
      type: String,
      required: [true, 'Ville est requise'],
      trim: true,
    },
    clientType: {
      type: String,
      enum: ['Particulier', 'Professionnel', 'Freelancer'],
      default: 'Particulier',
      required: [true, 'Type de client est requis'],
    },
    subscriptionType: {
      type: String,
      enum: ['none', 'solo', 'family'],
      default: 'none', // À la carte par défaut
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'fondateur', 'freelancer', 'freelancer_admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isAdminVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationTokenExpires: {
      type: Date,
    },
    profileImage: {
      type: String,
      default: '/images/default-profile.png', // Image de profil par défaut
    },
  },
  {
    timestamps: true,
  }
);

// Hash le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(this: IUser, next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Créer un nouveau modèle (après avoir supprimé l'ancien si présent)
const User = mongoose.model<IUser>('User', UserSchema);

export default User; 