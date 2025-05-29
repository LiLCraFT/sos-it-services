import { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { APP_CONFIG } from '../config/app';
import { MapPin } from 'lucide-react';

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

const containerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 46.603354, // Centre de la France
  lng: 1.888334,
};

export default function ExpertsMap() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  // Fonction pour géocoder un code postal (utilise l'API Google Maps chargée)
  const geocodePostalCode = async (postalCode: string): Promise<[number, number] | null> => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return null;
    }
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        {
          address: `${postalCode}, France`,
          componentRestrictions: { country: 'FR' }
        },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            console.log('Geocoding', postalCode, '->', location?.lat(), location?.lng());
            if (status !== 'OK') {
              console.error('Geocoding failed for', postalCode, 'status:', status);
            }
            resolve([location.lat(), location.lng()]);
          } else {
            resolve(null);
          }
        }
      );
    });
  };

  // Charger les experts et leurs coordonnées une fois la map chargée
  useEffect(() => {
    if (!mapInstance) return;
    const fetchExperts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/users?role=freelancer,freelancer_admin');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des experts');
        }
        const data = await response.json();
        console.log('API experts data:', data);
        const expertsWithCoordinates = await Promise.all(
          (data.users || []).map(async (expert: Expert) => {
            if (expert.postalCode) {
              const coordinates = await geocodePostalCode(expert.postalCode);
              return { ...expert, coordinates };
            }
            return expert;
          })
        );
        setExperts(expertsWithCoordinates);
        const firstExpertWithCoords = expertsWithCoordinates.find(e => e.coordinates);
        if (firstExpertWithCoords?.coordinates) {
          setMapCenter({
            lat: firstExpertWithCoords.coordinates[0],
            lng: firstExpertWithCoords.coordinates[1]
          });
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement des experts');
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, [mapInstance]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
        <MapPin className="w-7 h-7 text-[#5865F2] mr-2" />
        Carte des experts
      </h1>
      <LoadScript googleMapsApiKey={APP_CONFIG.googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={6}
          onLoad={map => setMapInstance(map)}
        >
          {experts.map((expert) => {
            if (!expert.coordinates) return null;
            return (
              <Marker
                key={expert._id}
                position={{
                  lat: expert.coordinates[0],
                  lng: expert.coordinates[1]
                }}
                onClick={() => setSelectedExpert(expert)}
                icon={{
                  url: '/images/logo-image.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(20, 40),
                }}
              />
            );
          })}
          {selectedExpert && selectedExpert.coordinates && (
            <InfoWindow
              position={{
                lat: selectedExpert.coordinates[0],
                lng: selectedExpert.coordinates[1]
              }}
              onCloseClick={() => setSelectedExpert(null)}
            >
              <div className="p-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={selectedExpert.profileImage || 'http://localhost:3001/api/default-image'}
                    alt={`${selectedExpert.firstName} ${selectedExpert.lastName}`}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedExpert.firstName} {selectedExpert.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedExpert.role}</p>
                    {selectedExpert.rating && (
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {selectedExpert.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
} 