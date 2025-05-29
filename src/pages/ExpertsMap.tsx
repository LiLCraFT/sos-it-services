import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { getImageUrl } from '../utils/imageUtils';

interface Expert {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage: string;
  city: string;
  postalCode?: string;
  rating?: number;
  coordinates?: [number, number];
}

const ExpertsMap: React.FC = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Icône personnalisée pour les marqueurs
  const customIcon = new Icon({
    iconUrl: '/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Fonction pour géocoder un code postal
  const geocodePostalCode = async (postalCode: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&country=France&postalcode=${encodeURIComponent(postalCode)}&limit=1`,
        {
          headers: {
            'User-Agent': 'SOS-IT-Services-App'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la géolocalisation');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (err) {
      console.error(`Erreur lors de la géolocalisation du code postal ${postalCode}:`, err);
      return null;
    }
  };

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users?role=freelancer,freelancer_admin', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des experts');
        }

        const data = await response.json();
        const expertsData = data.users || [];

        // Géocoder chaque expert
        const expertsWithCoordinates = await Promise.all(
          expertsData.map(async (expert: Expert) => {
            if (expert.postalCode) {
              const coordinates = await geocodePostalCode(expert.postalCode);
              return { ...expert, coordinates };
            }
            return expert;
          })
        );

        setExperts(expertsWithCoordinates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2F3136] flex items-center justify-center">
        <div className="text-white">Chargement de la carte...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#2F3136] flex items-center justify-center">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    );
  }

  // Filtrer les experts qui ont des coordonnées valides
  const expertsWithValidCoordinates = experts.filter(expert => expert.coordinates);

  return (
    <div className="min-h-screen bg-[#2F3136] p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Trouvez un expert près de chez vous</h1>
        <div className="bg-[#36393F] rounded-lg p-4 h-[calc(100vh-12rem)] relative">
          <MapContainer
            center={[46.603354, 1.888334]} // Centre de la France
            zoom={6}
            style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {expertsWithValidCoordinates.map((expert) => (
              <Marker
                key={expert._id}
                position={expert.coordinates!}
                icon={customIcon}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getImageUrl(expert.profileImage)}
                        alt={`${expert.firstName} ${expert.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{expert.firstName} {expert.lastName}</h3>
                        <p className="text-sm text-gray-600">{expert.city}</p>
                        {expert.rating && (
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1 text-sm">{expert.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default ExpertsMap; 