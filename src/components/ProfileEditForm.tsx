import { useState, useEffect } from 'react';
import { User, MapPin, Phone, Calendar, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { geocodeByAddress } from 'react-google-places-autocomplete';

// Type pour l'adresse sélectionnée
type AddressOption = {
  value: {
    description: string;
    place_id: string;
  };
  label: string;
};

// Type pour les composants d'adresse
type AddressComponents = {
  street_number?: string;
  route?: string;
  locality?: string; // city
  postal_code?: string;
  country?: string;
};

// Type pour les composants renvoyés par l'API Google
interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

const ProfileEditForm = ({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
  });
  const [addressOption, setAddressOption] = useState<AddressOption | null>(null);
  const [addressComponents, setAddressComponents] = useState<AddressComponents>({});
  const [postalCode, setPostalCode] = useState<string>('');

  useEffect(() => {
    if (addressOption) {
      handlePlaceSelect(addressOption);
    }
  }, [addressOption]);

  const handlePlaceSelect = async (option: AddressOption) => {
    try {
      const results = await geocodeByAddress(option.value.description);
      const addressComponents: AddressComponents = {};
      let streetNumber = '';
      let route = '';

      results[0].address_components.forEach((component: AddressComponent) => {
        const types = component.types;
        
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
          addressComponents.street_number = component.long_name;
        }
        
        if (types.includes('route')) {
          route = component.long_name;
          addressComponents.route = component.long_name;
        }
        
        if (types.includes('locality')) {
          setFormData(prev => ({ ...prev, city: component.long_name }));
          addressComponents.locality = component.long_name;
        }
        
        if (types.includes('postal_code')) {
          setPostalCode(component.long_name);
          addressComponents.postal_code = component.long_name;
        }
        
        if (types.includes('country')) {
          addressComponents.country = component.long_name;
        }
      });

      // Combine street number and route to form the street address
      const streetAddress = `${streetNumber} ${route}`.trim();
      if (streetAddress) {
        setFormData(prev => ({ ...prev, address: streetAddress }));
      }

      setAddressComponents(addressComponents);
    } catch (error) {
      console.error('Error selecting place:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    try {
      setLoading(true);
      
      // Format city with postal code in parentheses
      const city = addressComponents.locality && postalCode 
        ? `${addressComponents.locality} (${postalCode})`
        : formData.city;
      
      const updatedFormData = {
        ...formData,
        city
      };

      // Use the API_URL from the same place where it's defined in AuthContext
      const API_URL = 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updatedFormData),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      if (data.user) {
        updateUser(data.user);
        // Also update localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Format de réponse inattendu');
      }
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Une erreur est survenue lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#36393F] rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Modifier mon profil</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
              Prénom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="bg-[#2F3136] text-white pl-10 block w-full rounded-md border-0 py-2.5 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
              Nom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="bg-[#2F3136] text-white pl-10 block w-full rounded-md border-0 py-2.5 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
                required
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-[#2F3136] text-white pl-10 block w-full rounded-md border-0 py-2.5 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
            Téléphone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="bg-[#2F3136] text-white pl-10 block w-full rounded-md border-0 py-2.5 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
            Adresse
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <div className="pl-10 w-full">
              <GooglePlacesAutocomplete
                apiKey="YOUR_GOOGLE_MAPS_API_KEY"
                selectProps={{
                  value: addressOption,
                  onChange: setAddressOption,
                  placeholder: formData.address || 'Rechercher une adresse...',
                  styles: {
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: '#2F3136',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      boxShadow: 'none',
                      padding: '0.125rem 0',
                    }),
                    input: (provided) => ({
                      ...provided,
                      color: 'white',
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: '#9CA3AF',
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: 'white',
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? '#5865F2' : '#2F3136',
                      color: 'white',
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: '#2F3136',
                      zIndex: 10,
                    }),
                  },
                }}
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
            Ville {postalCode && `(${postalCode})`}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="bg-[#2F3136] text-white pl-10 block w-full rounded-md border-0 py-2.5 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
              readOnly={!!addressComponents.locality}
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300 mb-2">
            Date de naissance
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="bg-[#2F3136] text-white pl-10 block w-full rounded-md border-0 py-2.5 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#4F545C] text-white rounded-md hover:bg-[#686D73] focus:outline-none"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none"
            disabled={loading}
          >
            {loading ? 'Mise à jour...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm; 