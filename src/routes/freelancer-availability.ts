import express from 'express';
import { auth } from '../middleware/auth';
import FreelancerAvailability from '../models/FreelancerAvailability';

const router = express.Router();

// Obtenir les disponibilités d'un freelance
router.get('/:freelancerId/availability', auth, async (req, res) => {
  try {
    const { freelancerId } = req.params;

    // Vérifier si l'utilisateur est le freelance concerné
    if (req.user._id.toString() !== freelancerId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const availabilities = await FreelancerAvailability.find({
      freelancerId,
    }).sort({ date: 1 });

    res.json({ availabilities });
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter une disponibilité
router.post('/:freelancerId/availability', auth, async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { date, timeSlots } = req.body;

    // Vérifier si l'utilisateur est le freelance concerné
    if (req.user._id.toString() !== freelancerId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Vérifier si une disponibilité existe déjà pour cette date
    const existingAvailability = await FreelancerAvailability.findOne({
      freelancerId,
      date: new Date(date),
    });

    if (existingAvailability) {
      return res.status(400).json({ error: 'Une disponibilité existe déjà pour cette date' });
    }

    // Créer la nouvelle disponibilité
    const availability = new FreelancerAvailability({
      freelancerId,
      date: new Date(date),
      timeSlots,
    });

    await availability.save();

    res.status(201).json({ availability });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la disponibilité:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une disponibilité
router.delete('/:freelancerId/availability/:availabilityId', auth, async (req, res) => {
  try {
    const { freelancerId, availabilityId } = req.params;

    // Vérifier si l'utilisateur est le freelance concerné
    if (req.user._id.toString() !== freelancerId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const availability = await FreelancerAvailability.findOne({
      _id: availabilityId,
      freelancerId,
    });

    if (!availability) {
      return res.status(404).json({ error: 'Disponibilité non trouvée' });
    }

    await availability.remove();

    res.json({ message: 'Disponibilité supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la disponibilité:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour la disponibilité d'un créneau
router.put('/:freelancerId/availability/:availabilityId/time-slot', auth, async (req, res) => {
  try {
    const { freelancerId, availabilityId } = req.params;
    const { startTime, isAvailable } = req.body;

    // Vérifier si l'utilisateur est le freelance concerné
    if (req.user._id.toString() !== freelancerId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const availability = await FreelancerAvailability.findOne({
      _id: availabilityId,
      freelancerId,
    });

    if (!availability) {
      return res.status(404).json({ error: 'Disponibilité non trouvée' });
    }

    // Mettre à jour le créneau
    const timeSlotIndex = availability.timeSlots.findIndex(
      (slot) => slot.startTime === startTime
    );

    if (timeSlotIndex === -1) {
      return res.status(404).json({ error: 'Créneau non trouvé' });
    }

    availability.timeSlots[timeSlotIndex].isAvailable = isAvailable;
    await availability.save();

    res.json({ availability });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du créneau:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router; 