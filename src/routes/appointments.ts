import express from 'express';
import { auth } from '../middleware/auth';
import Appointment from '../models/Appointment';
import Ticket from '../models/Ticket';

const router = express.Router();

// Obtenir les créneaux disponibles pour un freelance à une date donnée
router.get('/available-slots', auth, async (req, res) => {
  try {
    const { freelancerId, date } = req.query;
    
    if (!freelancerId || !date) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    // Convertir la date en objet Date
    const targetDate = new Date(date as string);
    targetDate.setHours(0, 0, 0, 0);

    // Récupérer tous les rendez-vous du freelance pour cette date
    const appointments = await Appointment.find({
      freelancerId,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    // Générer tous les créneaux possibles (9h-18h)
    const allTimeSlots = Array.from({ length: 9 }, (_, i) => ({
      startTime: `${(i + 9).toString().padStart(2, '0')}:00`,
      endTime: `${(i + 10).toString().padStart(2, '0')}:00`,
      isAvailable: true,
    }));

    // Marquer les créneaux déjà réservés comme non disponibles
    appointments.forEach((appointment) => {
      const slotIndex = allTimeSlots.findIndex(
        (slot) => slot.startTime === appointment.startTime
      );
      if (slotIndex !== -1) {
        allTimeSlots[slotIndex].isAvailable = false;
      }
    });

    res.json({ timeSlots: allTimeSlots });
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un nouveau rendez-vous
router.post('/', auth, async (req, res) => {
  try {
    const { ticketId, freelancerId, date, startTime, endTime } = req.body;

    // Vérifier si le ticket existe et est dans un état valide
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    if (!['online', 'onsite'].includes(ticket.status)) {
      return res.status(400).json({ error: 'Le ticket doit être en statut "en ligne" ou "à domicile"' });
    }

    // Vérifier si le créneau est disponible
    const existingAppointment = await Appointment.findOne({
      freelancerId,
      date: new Date(date),
      startTime,
      status: 'scheduled',
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Ce créneau est déjà réservé' });
    }

    // Créer le rendez-vous
    const appointment = new Appointment({
      ticketId,
      freelancerId,
      clientId: req.user._id,
      date: new Date(date),
      startTime,
      endTime,
      status: 'scheduled',
    });

    await appointment.save();

    res.status(201).json({ appointment });
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Annuler un rendez-vous
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Vérifier si l'utilisateur est autorisé à annuler le rendez-vous
    if (
      appointment.clientId.toString() !== req.user._id.toString() &&
      appointment.freelancerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ appointment });
  } catch (error) {
    console.error('Erreur lors de l\'annulation du rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir tous les rendez-vous d'un utilisateur
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [
        { clientId: req.user._id },
        { freelancerId: req.user._id },
      ],
    })
      .populate('ticketId')
      .populate('freelancerId', 'firstName lastName email')
      .populate('clientId', 'firstName lastName email')
      .sort({ date: 1, startTime: 1 });

    res.json({ appointments });
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router; 