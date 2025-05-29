import { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { APP_CONFIG } from '../config/app';
import { MapPin } from 'lucide-react';
import { ExpertCard } from '../components/ExpertCard';
import { ExpertRating } from '../components/ExpertRating';

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
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  email?: string;
  phone?: string;
  createdAt?: string;
  isEmailVerified: boolean;
  isAdminVerified: boolean;
}

const containerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 46.603354, // Centre de la France
  lng: 1.888334,
};

// Liste des départements français (code et nom)
const DEPARTEMENTS = [
  { code: '01', name: 'Ain' },
  { code: '02', name: 'Aisne' },
  { code: '03', name: 'Allier' },
  { code: '04', name: 'Alpes-de-Haute-Provence' },
  { code: '05', name: 'Hautes-Alpes' },
  { code: '06', name: 'Alpes-Maritimes' },
  { code: '07', name: 'Ardèche' },
  { code: '08', name: 'Ardennes' },
  { code: '09', name: 'Ariège' },
  { code: '10', name: 'Aube' },
  { code: '11', name: 'Aude' },
  { code: '12', name: 'Aveyron' },
  { code: '13', name: 'Bouches-du-Rhône' },
  { code: '14', name: 'Calvados' },
  { code: '15', name: 'Cantal' },
  { code: '16', name: 'Charente' },
  { code: '17', name: 'Charente-Maritime' },
  { code: '18', name: 'Cher' },
  { code: '19', name: 'Corrèze' },
  { code: '2A', name: 'Corse-du-Sud' },
  { code: '2B', name: 'Haute-Corse' },
  { code: '21', name: "Côte-d'Or" },
  { code: '22', name: "Côtes-d'Armor" },
  { code: '23', name: 'Creuse' },
  { code: '24', name: 'Dordogne' },
  { code: '25', name: 'Doubs' },
  { code: '26', name: 'Drôme' },
  { code: '27', name: 'Eure' },
  { code: '28', name: 'Eure-et-Loir' },
  { code: '29', name: 'Finistère' },
  { code: '30', name: 'Gard' },
  { code: '31', name: 'Haute-Garonne' },
  { code: '32', name: 'Gers' },
  { code: '33', name: 'Gironde' },
  { code: '34', name: 'Hérault' },
  { code: '35', name: 'Ille-et-Vilaine' },
  { code: '36', name: 'Indre' },
  { code: '37', name: 'Indre-et-Loire' },
  { code: '38', name: 'Isère' },
  { code: '39', name: 'Jura' },
  { code: '40', name: 'Landes' },
  { code: '41', name: 'Loir-et-Cher' },
  { code: '42', name: 'Loire' },
  { code: '43', name: 'Haute-Loire' },
  { code: '44', name: 'Loire-Atlantique' },
  { code: '45', name: 'Loiret' },
  { code: '46', name: 'Lot' },
  { code: '47', name: 'Lot-et-Garonne' },
  { code: '48', name: 'Lozère' },
  { code: '49', name: 'Maine-et-Loire' },
  { code: '50', name: 'Manche' },
  { code: '51', name: 'Marne' },
  { code: '52', name: 'Haute-Marne' },
  { code: '53', name: 'Mayenne' },
  { code: '54', name: 'Meurthe-et-Moselle' },
  { code: '55', name: 'Meuse' },
  { code: '56', name: 'Morbihan' },
  { code: '57', name: 'Moselle' },
  { code: '58', name: 'Nièvre' },
  { code: '59', name: 'Nord' },
  { code: '60', name: 'Oise' },
  { code: '61', name: 'Orne' },
  { code: '62', name: 'Pas-de-Calais' },
  { code: '63', name: 'Puy-de-Dôme' },
  { code: '64', name: 'Pyrénées-Atlantiques' },
  { code: '65', name: 'Hautes-Pyrénées' },
  { code: '66', name: 'Pyrénées-Orientales' },
  { code: '67', name: 'Bas-Rhin' },
  { code: '68', name: 'Haut-Rhin' },
  { code: '69', name: 'Rhône' },
  { code: '70', name: 'Haute-Saône' },
  { code: '71', name: 'Saône-et-Loire' },
  { code: '72', name: 'Sarthe' },
  { code: '73', name: 'Savoie' },
  { code: '74', name: 'Haute-Savoie' },
  { code: '75', name: 'Paris' },
  { code: '76', name: 'Seine-Maritime' },
  { code: '77', name: 'Seine-et-Marne' },
  { code: '78', name: 'Yvelines' },
  { code: '79', name: 'Deux-Sèvres' },
  { code: '80', name: 'Somme' },
  { code: '81', name: 'Tarn' },
  { code: '82', name: 'Tarn-et-Garonne' },
  { code: '83', name: 'Var' },
  { code: '84', name: 'Vaucluse' },
  { code: '85', name: 'Vendée' },
  { code: '86', name: 'Vienne' },
  { code: '87', name: 'Haute-Vienne' },
  { code: '88', name: 'Vosges' },
  { code: '89', name: 'Yonne' },
  { code: '90', name: 'Territoire de Belfort' },
  { code: '91', name: 'Essonne' },
  { code: '92', name: 'Hauts-de-Seine' },
  { code: '93', name: 'Seine-Saint-Denis' },
  { code: '94', name: 'Val-de-Marne' },
  { code: '95', name: "Val-d'Oise" },
  { code: '971', name: 'Guadeloupe' },
  { code: '972', name: 'Martinique' },
  { code: '973', name: 'Guyane' },
  { code: '974', name: 'La Réunion' },
  { code: '976', name: 'Mayotte' },
];

export default function ExpertsMap() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [selectedDepartement, setSelectedDepartement] = useState<string>('');
  const [visitorDepartement, setVisitorDepartement] = useState<string>('');

  // Fonction pour géocoder un code postal (utilise l'API Google Maps chargée)

  // Charger les experts et leurs coordonnées une fois la map chargée
  useEffect(() => {
    if (!mapInstance) return;
    const fetchExperts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/users?role=fondateur,freelancer,freelancer_admin');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des experts');
        }
        const data = await response.json();
        const expertsWithCoordinates = await Promise.all(
          (data.users || []).map(async (expert: Expert) => {
            let rating = undefined;
            try {
              const ratingResponse = await fetch(`http://localhost:3001/api/users/${expert._id}/rating`);
              if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json();
                rating = ratingData.rating;
              }
            } catch (err) {
              console.error('Erreur lors de la récupération de la note pour', expert._id, err);
            }
            // Harmonisation des champs pour compatibilité avec FreelancerDetailsModal
            return {
              _id: expert._id,
              firstName: expert.firstName,
              lastName: expert.lastName,
              email: expert.email || '',
              phone: expert.phone || '',
              city: expert.city || '',
              role: expert.role || '',
              profileImage: expert.profileImage || '',
              createdAt: expert.createdAt || '',
              isEmailVerified: (expert as any).isEmailVerified ?? false,
              isAdminVerified: (expert as any).isAdminVerified ?? false,
              rating: rating,
              // Ajout d'autres champs si besoin
            };
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

  // Géolocalisation automatique au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Utiliser le geocoder pour obtenir le département
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  // Chercher le département dans les composants d'adresse
                  const addressComponents = results[0].address_components;
                  const departement = addressComponents?.find(
                    component => component.types.includes('administrative_area_level_2')
                  );
                  if (departement) {
                    setVisitorDepartement(departement.short_name);
                  }
                }
              }
            );
          }
        },
        (error) => {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              break;
            case error.POSITION_UNAVAILABLE:
              break;
            case error.TIMEOUT:
              break;
            default:
              console.error('Erreur inconnue');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.error('Géolocalisation non supportée par le navigateur');
    }
  }, []);

  // Synchroniser la sélection du département avec la détection automatique
  useEffect(() => {
    if (visitorDepartement) {
      // Chercher le code du département correspondant (par nom ou code)
      const depByCode = DEPARTEMENTS.find(dep => dep.code === visitorDepartement);
      const depByName = DEPARTEMENTS.find(dep => dep.name.toLowerCase() === visitorDepartement.toLowerCase());
      if (depByCode) {
        setSelectedDepartement(depByCode.code);
      } else if (depByName) {
        setSelectedDepartement(depByName.code);
      }
    }
  }, [visitorDepartement]);

  // Filtrage des experts selon le département sélectionné
  const filteredExperts = selectedDepartement
    ? experts.filter(e => e.postalCode && e.postalCode.startsWith(selectedDepartement))
    : experts;

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
          {filteredExperts.map((expert) => {
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
              <div className="p-2 min-w-[180px]">
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
                  </div>
                </div>
                {selectedExpert.rating && selectedExpert.rating > 0 && (
                  <div className="flex justify-end mt-2">
                    <ExpertRating rating={Number(selectedExpert.rating)} />
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Filtres sous la carte */}
      <div className="bg-[#36393F] rounded-lg p-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <MapPin className="w-5 h-5 text-[#5865F2] mr-2" />
            <span className="text-white font-medium">Votre département détecté :</span>
            <span className="ml-2 text-[#5865F2] font-bold">{visitorDepartement ? visitorDepartement : 'Non détecté'}</span>
          </div>
          <div className="flex items-center">
            <label htmlFor="departement-select" className="text-white mr-2">Filtrer par département :</label>
            <select
              id="departement-select"
              className="bg-[#2F3136] text-white rounded px-3 py-2"
              value={selectedDepartement}
              onChange={e => setSelectedDepartement(e.target.value)}
            >
              <option value="">Tous</option>
              {DEPARTEMENTS.map(dep => (
                <option key={dep.code} value={dep.code}>{dep.code} - {dep.name}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Liste des experts filtrés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredExperts.length > 0 ? (
            filteredExperts.map(expert => (
              <ExpertCard
                key={expert._id}
                {...expert}
                email={expert.email}
                phone={expert.phone}
              />
            ))
          ) : (
            <div className="text-gray-300 col-span-full text-center">Aucun expert trouvé pour ce département.</div>
          )}
        </div>
      </div>
    </div>
  );
} 