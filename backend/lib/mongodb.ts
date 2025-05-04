import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sos-it-services';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI must be defined in environment variables');
}

// Réinitialiser les modèles si en développement pour éviter les problèmes de cache
if (process.env.NODE_ENV === 'development') {
  // Vider le cache des modèles si le modèle existe déjà
  if (mongoose.models.User) {
    delete mongoose.models.User;
  }
}

let cached = global as any;
if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      // useNewUrlParser et useUnifiedTopology sont maintenant par défaut dans les nouvelles versions de Mongoose
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      });
  }
  
  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
}

export default dbConnect; 