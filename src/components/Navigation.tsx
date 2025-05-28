import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user } = useAuth();
  const isFreelancer = user && (Array.isArray(user.role) 
    ? user.role.some(r => r.includes('freelancer'))
    : typeof user.role === 'string' && user.role.includes('freelancer'));

  return (
    <nav className="bg-[#2F3136] w-64 min-h-screen p-4">
      {/* ... existing code ... */}
      {isFreelancer && (
        <Link
          to="/freelancer/availability"
          className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#2F3136] hover:text-white rounded-md"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Mes disponibilités
        </Link>
      )}
      {/* ... existing code ... */}
    </nav>
  );
};

export default Navigation; 