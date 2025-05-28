import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AppointmentSchedulerProps {
  freelancerId: string;
  ticketId: string;
  onAppointmentSelected: (date: Date, timeSlot: TimeSlot) => void;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  freelancerId,
  ticketId,
  onAppointmentSelected,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Générer les créneaux horaires pour une journée (9h-18h)
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push({
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        isAvailable: true,
      });
    }
    return slots;
  };

  // Charger les créneaux disponibles pour une date donnée
  const loadAvailableTimeSlots = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(
        `http://localhost:3001/api/appointments/available-slots?freelancerId=${freelancerId}&date=${date.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des créneaux disponibles');
      }

      const data = await response.json();
      setAvailableTimeSlots(data.timeSlots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setAvailableTimeSlots(generateTimeSlots()); // Fallback aux créneaux par défaut
    } finally {
      setLoading(false);
    }
  };

  // Gérer la sélection d'une date
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    loadAvailableTimeSlots(date);
  };

  // Gérer la sélection d'un créneau horaire
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (selectedDate && timeSlot.isAvailable) {
      onAppointmentSelected(selectedDate, timeSlot);
    }
  };

  return (
    <div className="bg-[#36393F] rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Prendre rendez-vous</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sélecteur de date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sélectionnez une date
          </label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleDateSelect(new Date(e.target.value))}
            className="w-full px-3 py-2 bg-[#2F3136] border border-[#202225] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
          />
        </div>

        {/* Liste des créneaux horaires */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Créneaux disponibles
            </label>
            <div className="grid grid-cols-2 gap-2">
              {loading ? (
                <div className="col-span-2 text-center text-gray-400">
                  Chargement des créneaux...
                </div>
              ) : (
                availableTimeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeSlotSelect(slot)}
                    disabled={!slot.isAvailable}
                    className={`flex items-center justify-center px-3 py-2 rounded-md text-sm ${
                      slot.isAvailable
                        ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
                        : 'bg-[#2F3136] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {slot.startTime}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentScheduler; 