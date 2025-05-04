import React from 'react';
import { Monitor } from 'lucide-react';
import { Link } from './ui/Link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, MapPin, Phone, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#202225] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Monitor className="h-8 w-8 text-[#5865F2]" />
              <span className="ml-2 text-white font-bold text-xl font-['Bangers'] tracking-wider">SOS IT Services</span>
            </div>
            <p className="mb-4 text-gray-400">
              Services de dépannage informatique et support IT pour particuliers et entreprises.
              Solutions rapides et fiables pour tous vos besoins technologiques.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#services" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="#team" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Notre Équipe
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Dépannage Informatique
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Suppression de Virus
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Récupération de Données
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Configuration Réseau
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Conseil Informatique
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Contactez-nous</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Mail size={18} className="mr-2 mt-1 text-[#5865F2] flex-shrink-0" />
                <span>contact@sos-it-services.fr</span>
              </li>
              <li className="flex items-start">
                <Phone size={18} className="mr-2 mt-1 text-[#5865F2] flex-shrink-0" />
                <span>06 12 34 56 78</span>
              </li>
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 text-[#5865F2] flex-shrink-0" />
                <span>10 Rue de l'Informatique, 75000 Paris</span>
              </li>
              <li className="flex items-start">
                <Clock size={18} className="mr-2 mt-1 text-[#5865F2] flex-shrink-0" />
                <div>
                  <span className="block font-medium text-white">Horaires:</span>
                  Lun-Ven: 9h - 19h<br />
                  Sam: 10h - 17h
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} SOS IT Services. Tous droits réservés.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-sm text-gray-400 hover:text-[#5865F2]">
                Politique de Confidentialité
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#5865F2]">
                Conditions d'Utilisation
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#5865F2]">
                Mentions Légales
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;