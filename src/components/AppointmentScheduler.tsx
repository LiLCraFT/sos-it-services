import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, User, Info, MapPin, Video, Phone } from 'lucide-react';

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
  onAppointmentSelected,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [freelancerInfo, setFreelancerInfo] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'online' | 'onsite'>('online');

  // Charger les informations du freelance
  useEffect(() => {
    const fetchFreelancerInfo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Non authentifié');
        }

        const response = await fetch(`http://localhost:3001/api/users/${freelancerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des informations du freelance');
        }

        const data = await response.json();
        setFreelancerInfo(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      }
    };

    fetchFreelancerInfo();
  }, [freelancerId]);

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Ajouter les jours du mois précédent pour compléter la première semaine
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Ajouter les jours du mois courant
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === new Date().toDateString(),
      });
    }

    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i <= 7 - lastDayOfWeek; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

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

  // Gérer le changement de mois
  const handleMonthChange = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="flex gap-0 bg-[#23272A] rounded-lg shadow-lg border border-[#36393F] mx-auto">
      {/* Colonne de gauche : Informations du rendez-vous */}
      <div className="w-96 p-6 flex flex-col justify-between bg-[#282B30] border-r border-[#36393F]">
        <div className="space-y-8">
          {/* Informations du freelance */}
          <div className="flex items-center space-x-4 mb-6">
            {freelancerInfo?.profileImage ? (
              <img
                src={freelancerInfo.profileImage}
                alt={`${freelancerInfo.firstName} ${freelancerInfo.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#5865F2]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#5865F2] flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-white">
                {freelancerInfo?.firstName} {freelancerInfo?.lastName}
              </h3>
              <p className="text-gray-400 font-medium">Freelance IT</p>
            </div>
          </div>

          {/* Type de rendez-vous */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Type de rendez-vous
            </h4>
            <button
              className={`flex items-center w-full p-3 rounded-lg transition-all border-2 ${selectedType === 'online' ? 'bg-[#5865F2] border-[#5865F2] text-white font-bold shadow' : 'bg-[#23272A] border-transparent text-gray-200 hover:bg-[#36393F]'}`}
              onClick={() => setSelectedType('online')}
              aria-label="Diagnostic en ligne"
            >
              <Video className="w-5 h-5 text-white mr-3" />
              <div className="text-left">
                <p className="text-base leading-tight">Diagnostic en ligne</p>
                <p className="text-xs text-gray-300">Via visioconférence</p>
              </div>
            </button>
            <button
              className={`flex items-center w-full p-3 rounded-lg transition-all border-2 ${selectedType === 'onsite' ? 'bg-[#5865F2] border-[#5865F2] text-white font-bold shadow' : 'bg-[#23272A] border-transparent text-gray-200 hover:bg-[#36393F]'}`}
              onClick={() => setSelectedType('onsite')}
              aria-label="Diagnostic à domicile"
            >
              <MapPin className="w-5 h-5 text-white mr-3" />
              <div className="text-left">
                <p className="text-base leading-tight">Diagnostic à domicile</p>
                <p className="text-xs text-gray-300">Intervention sur site</p>
              </div>
            </button>
          </div>

          {/* Durée */}
          <div className="mt-8">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Durée
            </h4>
            <p className="text-white font-semibold">1 heure</p>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-8">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Informations importantes
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start">
                <Info className="w-4 h-4 text-[#5865F2] mr-2 mt-1 flex-shrink-0" />
                <span>Préparez votre matériel avant le rendez-vous</span>
              </li>
              <li className="flex items-start">
                <Phone className="w-4 h-4 text-[#5865F2] mr-2 mt-1 flex-shrink-0" />
                <span>Un lien de visioconférence sera envoyé par email</span>
              </li>
              <li className="flex items-start">
                <Clock className="w-4 h-4 text-[#5865F2] mr-2 mt-1 flex-shrink-0" />
                <span>Arrivez 5 minutes avant le rendez-vous</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Colonne du milieu : Calendrier */}
      <div className="w-96 p-6 bg-[#23272A] flex flex-col items-center border-r border-[#36393F]">
        <div className="flex items-center justify-between w-full mb-6">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-2 hover:bg-[#2F3136] rounded-full transition-colors"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-2 hover:bg-[#2F3136] rounded-full transition-colors"
            aria-label="Mois suivant"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2 w-full">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 py-2 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 w-full">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(day.date)}
              className={`p-2 rounded-lg text-center transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-[#5865F2] ${
                day.isCurrentMonth
                  ? selectedDate?.toDateString() === day.date.toDateString()
                    ? 'bg-[#5865F2] text-white shadow-lg border-2 border-[#5865F2]'
                    : day.isToday
                    ? 'bg-[#2F3136] text-white border border-[#5865F2]'
                    : 'text-gray-300 hover:bg-[#36393F]'
                  : 'text-gray-600 opacity-50 cursor-not-allowed'
              }`}
              disabled={!day.isCurrentMonth}
              aria-label={`Jour ${day.date.getDate()}`}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>
      </div>

      {/* Colonne de droite : Créneaux horaires */}
      <div className="w-96 p-6 bg-[#23272A] flex flex-col items-center">
        {selectedDate ? (
          <>
            <h3 className="text-lg font-bold text-white mb-6 text-center">
              Créneaux disponibles<br />
              <span className="text-[#5865F2] text-base font-semibold">pour le {selectedDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
            </h3>
            <div className="flex flex-col gap-3 w-full">
              {availableTimeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSlotSelect(slot)}
                  disabled={!slot.isAvailable}
                  className={`w-full py-4 rounded-lg text-center text-base font-semibold transition-all border-2 flex items-center justify-center gap-2 ${
                    slot.isAvailable
                      ? 'bg-[#5865F2] border-[#5865F2] text-white hover:bg-[#4752C4] hover:border-[#4752C4] focus:outline-none focus:ring-2 focus:ring-[#5865F2] shadow'
                      : 'bg-[#2F3136] border-[#36393F] text-gray-500 cursor-not-allowed opacity-60'
                  }`}
                  aria-label={`Choisir le créneau ${slot.startTime} - ${slot.endTime}`}
                >
                  <Clock className="w-5 h-5" />
                  {slot.startTime} - {slot.endTime}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p>Sélectionnez une date pour voir les créneaux disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentScheduler; 