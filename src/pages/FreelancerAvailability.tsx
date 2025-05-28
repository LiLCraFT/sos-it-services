import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Availability {
  _id: string;
  date: string;
  timeSlots: TimeSlot[];
}

const FreelancerAvailability: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les disponibilités du freelance
  const loadAvailabilities = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(
        `http://localhost:3001/api/freelancers/${user?._id}/availability`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des disponibilités');
      }

      const data = await response.json();
      setAvailabilities(data.availabilities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une nouvelle disponibilité
  const addAvailability = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(
        `http://localhost:3001/api/freelancers/${user?._id}/availability`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: selectedDate.toISOString(),
            timeSlots: Array.from({ length: 9 }, (_, i) => ({
              startTime: `${(i + 9).toString().padStart(2, '0')}:00`,
              endTime: `${(i + 10).toString().padStart(2, '0')}:00`,
              isAvailable: true,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de la disponibilité');
      }

      await loadAvailabilities();
      setSelectedDate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une disponibilité
  const deleteAvailability = async (availabilityId: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(
        `http://localhost:3001/api/freelancers/${user?._id}/availability/${availabilityId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la disponibilité');
      }

      await loadAvailabilities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour la disponibilité d'un créneau
  const updateTimeSlotAvailability = async (
    availabilityId: string,
    timeSlot: TimeSlot,
    isAvailable: boolean
  ) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(
        `http://localhost:3001/api/freelancers/${user?._id}/availability/${availabilityId}/time-slot`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            startTime: timeSlot.startTime,
            isAvailable,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du créneau');
      }

      await loadAvailabilities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailabilities();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Gérer mes disponibilités</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Ajouter une nouvelle disponibilité */}
      <div className="bg-[#36393F] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Ajouter une disponibilité</h2>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-3 py-2 bg-[#2F3136] border border-[#202225] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            />
          </div>
          <button
            onClick={addAvailability}
            disabled={!selectedDate || loading}
            className="flex items-center px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Liste des disponibilités */}
      <div className="bg-[#36393F] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Mes disponibilités</h2>
        {loading ? (
          <div className="text-center text-gray-400">Chargement...</div>
        ) : availabilities.length === 0 ? (
          <div className="text-center text-gray-400">Aucune disponibilité</div>
        ) : (
          <div className="space-y-4">
            {availabilities.map((availability) => (
              <div
                key={availability._id}
                className="bg-[#2F3136] rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-[#5865F2] mr-2" />
                    <span className="text-white">
                      {new Date(availability.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteAvailability(availability._id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {availability.timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        updateTimeSlotAvailability(
                          availability._id,
                          slot,
                          !slot.isAvailable
                        )
                      }
                      className={`flex items-center justify-center px-3 py-2 rounded-md text-sm ${
                        slot.isAvailable
                          ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
                          : 'bg-[#2F3136] text-gray-500'
                      }`}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerAvailability; 