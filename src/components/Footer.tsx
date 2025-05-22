import React, { useEffect, useState } from 'react';
import { Monitor, Wrench, Globe, Server, Settings } from 'lucide-react';
import { Link } from './ui/Link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, MapPin, Phone, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const emailAddress = "contact@sos-it-services.fr";
  
  useEffect(() => {
    // Fonction pour détecter si l'utilisateur est sur un appareil mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Détermine le lien à utiliser selon le type d'appareil
  const contactLink = isMobile 
    ? `tel:0660447550` 
    : `mailto:${emailAddress}?subject=Demande%20de%20contact`;

  return (
    <footer className="bg-[#202225] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <img 
                src="/images/logo-image.png" 
                alt="SOS IT Services Logo" 
                className="h-12 w-auto object-contain"
              />
              <span className="ml-2 text-white font-bold text-xl font-['Bangers'] tracking-wider">SOS IT Services</span>
            </div>
            <p className="mb-6 text-gray-400">
              Services de dépannage informatique et support IT pour particuliers et entreprises.
              Solutions rapides et fiables pour tous vos besoins technologiques.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="transition-opacity hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                  <radialGradient id="instagramGradient" cx="30%" cy="107%" r="150%">
                    <stop offset="0%" stopColor="#FFDC80" />
                    <stop offset="10%" stopColor="#FCAF45" />
                    <stop offset="20%" stopColor="#F77737" />
                    <stop offset="30%" stopColor="#F56040" />
                    <stop offset="40%" stopColor="#FD1D1D" />
                    <stop offset="50%" stopColor="#E1306C" />
                    <stop offset="60%" stopColor="#C13584" />
                    <stop offset="70%" stopColor="#833AB4" />
                    <stop offset="80%" stopColor="#5851DB" />
                    <stop offset="90%" stopColor="#405DE6" />
                  </radialGradient>
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.977.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.977-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.977-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" fill="url(#instagramGradient)" />
                </svg>
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-5.8-4.85-10.5-10.87-10.5s-10.87 4.7-10.87 10.5c0 5.23 3.84 9.575 8.87 10.347v-7.323h-2.67v-3.024h2.67V9.623c0-2.61 1.67-4.055 3.99-4.055 1.15 0 2.35.204 2.35.204v2.56h-1.32c-1.31 0-1.72.8-1.72 1.63v1.96h2.92l-.47 3.024h-2.45v7.323c5.03-.772 8.87-5.117 8.87-10.347" />
                </svg>
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000" />
                  <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-5">Liens Rapides</h3>
            <ul className="space-y-3">
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
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-5">Services</h3>
            <ul className="space-y-3">
              <li>
                <a href="/depannage-informatique" className="text-gray-400 hover:text-[#5865F2] transition-colors flex items-center">
                  <Wrench size={16} className="mr-2" />
                  Dépannage informatique
                </a>
              </li>
              <li>
                <a href="/creation-site-web" className="text-gray-400 hover:text-[#5865F2] transition-colors flex items-center">
                  <Globe size={16} className="mr-2" />
                  Création de sites web
                </a>
              </li>
              <li>
                <a href="#sur-mesure" className="text-gray-400 hover:text-[#5865F2] transition-colors flex items-center">
                  <Settings size={16} className="mr-2" />
                  Sur mesure
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-5">Contactez-nous</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="tel:0660447550"
                  className="bg-[#5865F2] hover:bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center mb-3 inline-flex"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  06 60 44 75 50
                </a>
              </li>
              <li className="flex items-start">
                <Mail size={18} className="mr-2 mt-1 text-[#5865F2] flex-shrink-0" />
                <a href="mailto:contact@sos-it-services.fr" className="hover:text-[#5865F2] transition-colors">
                  contact@sos-it-services.fr
                </a>
              </li>
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 text-[#5865F2] flex-shrink-0" />
                <a href="#etablissements" className="hover:text-[#5865F2] transition-colors">
                  Nos établissements
                </a>
              </li>
              <li className="flex items-start">
                <Clock size={18} className="mr-2 mt-1 text-[#5865F2] flex-shrink-0" />
                <div>
                  <span className="block font-medium text-white">Horaires:</span>
                  7j/7 sur rendez-vous
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} SOS IT Services. Tous droits réservés.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-8">
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