import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Monitor, Wrench, Globe, Server, Settings, ChevronDown, User, LogOut, Ticket, CreditCard, FileText, Crown, Users, Database } from 'lucide-react';
import { Link } from './ui/Link';
import { Modal } from './ui/Modal';
import LoginForm from './LoginForm';
import RegisterModal from './RegisterModal';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

// Fonction pour construire l'URL de l'image
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) {
    return 'http://localhost:3001/api/default-image';
  }
  if (path.startsWith('http')) {
    return path;
  }
  return `http://localhost:3001${path}`;
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<number, boolean>>({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [subscriptionType, setSubscriptionType] = useState<"none" | "solo" | "family">("none");
  
  const whatsappNumber = "33695358625"; // Remplacez par votre numéro WhatsApp
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuRef]);

  useEffect(() => {
    // Mettre à jour le type d'abonnement quand l'utilisateur est chargé
    if (user && user.subscriptionType) {
      setSubscriptionType(user.subscriptionType);
    } else {
      setSubscriptionType("none");
    }
  }, [user]);

  const services = [
    {
      name: "Dépannage informatique",
      href: "/depannage-informatique",
      icon: <Wrench className="h-5 w-5" />,
      dropdown: [
        {
          name: "Particuliers",
          href: "/depannage-informatique#particuliers",
          icon: <User className="h-5 w-5" />
        },
        {
          name: "Professionnels",
          href: "/depannage-informatique#professionnels",
          icon: <Users className="h-5 w-5" />
        }
      ]
    },
    {
      name: "Création de sites web",
      href: "/creation-site-web",
      icon: <Globe className="h-5 w-5" />,
      dropdown: [
        {
          name: "Site vitrine",
          href: "/creation-site-web#web-vitrine",
          icon: <Monitor className="h-5 w-5" />
        },
        {
          name: "Site e-commerce",
          href: "/creation-site-web#web-ecommerce",
          icon: <CreditCard className="h-5 w-5" />
        }
      ]
    },
    {
      name: "Sur mesure",
      href: "#sur-mesure",
      icon: <Settings className="h-5 w-5" />,
      dropdown: [
        {
          name: "Infogérance",
          href: "#infogerance",
          icon: <Server className="h-5 w-5" />
        },
        {
          name: "Matériel",
          href: "#materiel",
          icon: <Monitor className="h-5 w-5" />
        },
        {
          name: "Formation",
          href: "#formation",
          icon: <Settings className="h-5 w-5" />
        },
        {
          name: "Conseil",
          href: "#conseil",
          icon: <Globe className="h-5 w-5" />
        }
      ]
    }
  ];

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
  };

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      // Ouvrir/fermer le menu utilisateur
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      // Si l'utilisateur n'est pas connecté, ouvrir la modal de connexion
      setIsLoginModalOpen(true);
    }
  };

  const openRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const openLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const getSubscriptionName = () => {
    switch(subscriptionType) {
      case "solo": return "Plan Solo";
      case "family": return "Plan Famille";
      case "none": 
      default: return "A la carte";
    }
  };

  const toggleMobileDropdown = (index: number) => {
    setMobileDropdowns(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#36393F] shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RouterLink to="/" className="flex items-center">
                  <Monitor className="h-8 w-8 text-[#5865F2]" />
                  <span className="ml-2 text-white font-bold text-xl font-['Bangers'] tracking-wider">SOS IT Services</span>
                </RouterLink>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                {services.map((service, index) => (
                  <div key={index} className="relative group">
                    {service.dropdown ? (
                      <div>
                        <button
                          className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors group-hover:text-white"
                        >
                          {service.icon}
                          <span className="ml-2">{service.name}</span>
                          <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                        </button>
                        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[#2F3136] ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
                          <div className="py-1">
                            {service.dropdown.map((item, dropdownIndex) => (
                              <Link
                                key={dropdownIndex}
                                href={item.href}
                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#5865F2] transition-colors"
                              >
                                {item.icon}
                                <span className="ml-2">{item.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link 
                        href={service.href} 
                        className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {service.icon}
                        <span className="ml-2">{service.name}</span>
                      </Link>
                    )}
                  </div>
                ))}
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#5865F2] hover:bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Nous contacter
                </a>
                <div className="relative" ref={userMenuRef}>
                  <button 
                    className="flex items-center justify-center p-1 rounded-full hover:bg-[#36393F] transition-colors"
                    aria-label={isAuthenticated ? 'Menu utilisateur' : 'Se connecter'}
                    onClick={handleUserButtonClick}
                  >
                    {isAuthenticated ? (
                      user?.profileImage ? (
                        <img 
                          src={getImageUrl(user.profileImage)} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = 'http://localhost:3001/api/default-image';
                          }}
                          key={user.profileImage}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-[#5865F2] flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#4E5058] flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </button>
                  
                  {/* Menu utilisateur */}
                  {isAuthenticated && (
                    <div 
                      className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#2F3136] ring-1 ring-black ring-opacity-5 transition-all duration-200 ${isUserMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                    >
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                          Connecté en tant que<br />
                          <div className="flex flex-col mt-1">
                            <span className="font-semibold text-white mb-1">{user?.firstName} {user?.lastName}</span>
                            <div className="flex flex-nowrap items-center gap-1 whitespace-nowrap overflow-x-auto">
                              {user?.role === 'fondateur' ? (
                                <>
                                  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/20 text-red-400">
                                    Fondateur
                                  </span>
                                  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400">
                                    Admin
                                  </span>
                                </>
                              ) : user?.role === 'freelancer_admin' ? (
                                <>
                                  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-500">
                                    Freelancer
                                  </span>
                                  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400">
                                    Admin
                                  </span>
                                </>
                              ) : (
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                                  user?.role === 'admin' ? 'bg-orange-500/20 text-orange-400' :
                                  user?.role === 'freelancer' ? 'bg-yellow-500/20 text-yellow-500' :
                                  'bg-[#5865F2]/20 text-[#5865F2]'
                                }`}>
                                  {user?.role === 'admin' ? 'Admin' :
                                   user?.role === 'freelancer' ? 'Freelancer' :
                                   user?.clientType || 'Utilisateur'}
                                </span>
                              )}
                              {/* Tag d'abonnement - visible uniquement pour les utilisateurs standards */}
                              {(!user?.role || 
                                (user?.role !== 'admin' && 
                                 user?.role !== 'fondateur' && 
                                 user?.role !== 'freelancer' &&
                                 user?.role !== 'freelancer_admin')) && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400">
                                    <Crown className="w-3 h-3 mr-1" />
                                    {getSubscriptionName()}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                        <RouterLink
                          to="/mon-espace"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#5865F2] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-5 h-5 mr-2" />
                          <span>Mon profil</span>
                        </RouterLink>
                        {(user?.role === 'fondateur' || user?.role === 'admin' || user?.role === 'freelancer_admin') && (
                          <>
                            <RouterLink
                              to="/mon-espace?tab=users"
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#5865F2] transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Users className="w-5 h-5 mr-2" />
                              <span>Les utilisateurs</span>
                            </RouterLink>
                            <RouterLink
                              to="/mon-espace?tab=freelancers"
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#5865F2] transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Users className="w-5 h-5 mr-2" />
                              <span>Les freelancers</span>
                            </RouterLink>
                          </>
                        )}
                        {(user?.role === 'fondateur' || user?.role === 'admin' || user?.role === 'freelancer' || user?.role === 'freelancer_admin') && (
                          <RouterLink
                            to="/mon-espace?tab=ticket_database"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#5865F2] transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Database className="w-5 h-5 mr-2" />
                            <span>Base de tickets</span>
                          </RouterLink>
                        )}
                        {(!user?.role || 
                          (user?.role !== 'admin' && 
                           user?.role !== 'fondateur' && 
                           user?.role !== 'freelancer' &&
                           user?.role !== 'freelancer_admin')) && (
                          <>
                            <RouterLink
                              to="/mon-espace?tab=tickets"
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#5865F2] transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Ticket className="w-5 h-5 mr-2" />
                              <span>Mes tickets</span>
                            </RouterLink>
                            <RouterLink
                              to="/mon-espace?tab=subscription"
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#5865F2] transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <CreditCard className="w-5 h-5 mr-2" />
                              <span>Mon abonnement</span>
                            </RouterLink>
                            <RouterLink
                              to="/mon-espace?tab=invoices"
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#5865F2] transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <FileText className="w-5 h-5 mr-2" />
                              <span>Mes factures</span>
                            </RouterLink>
                          </>
                        )}
                        <RouterLink
                          to="/mon-espace?tab=preferences"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#5865F2] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5 mr-2" />
                          <span>Préférences</span>
                        </RouterLink>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-5 h-5 mr-2" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
              >
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#2F3136]">
            {services.map((service, index) => (
              <div key={index}>
                {service.dropdown ? (
                  <>
                    <button
                      onClick={() => toggleMobileDropdown(index)}
                      className="flex items-center w-full text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                    >
                      {service.icon}
                      <span className="ml-2">{service.name}</span>
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${mobileDropdowns[index] ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`pl-6 space-y-1 transition-all duration-200 ${mobileDropdowns[index] ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                      {service.dropdown.map((item, dropdownIndex) => (
                        <RouterLink
                          key={dropdownIndex}
                          to={item.href}
                          className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.icon}
                          <span className="ml-2">{item.name}</span>
                        </RouterLink>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link 
                    href={service.href} 
                    className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                  >
                    {service.icon}
                    <span className="ml-2">{service.name}</span>
                  </Link>
                )}
              </div>
            ))}
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5865F2] hover:bg-opacity-90 text-white flex items-center px-3 py-2 rounded-md text-base font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Nous contacter
            </a>
            {/* Ajout du lien Mon espace pour mobile */}
            {isAuthenticated && (
              <>
                <RouterLink 
                  to="/mon-espace"
                  className="bg-[#5865F2]/10 text-[#5865F2] flex items-center px-3 py-2 rounded-md text-base font-medium w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  <span>Mon profil</span>
                </RouterLink>
                {(user?.role === 'fondateur' || user?.role === 'admin' || user?.role === 'freelancer_admin') && (
                  <>
                    <RouterLink
                      to="/mon-espace?tab=users"
                      className="bg-[#5865F2]/10 text-[#5865F2] flex items-center px-3 py-2 rounded-md text-base font-medium w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      <span>Les utilisateurs</span>
                    </RouterLink>
                    <RouterLink
                      to="/mon-espace?tab=freelancers"
                      className="bg-[#5865F2]/10 text-[#5865F2] flex items-center px-3 py-2 rounded-md text-base font-medium w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      <span>Les freelancers</span>
                    </RouterLink>
                  </>
                )}
                {(user?.role === 'fondateur' || user?.role === 'admin' || user?.role === 'freelancer' || user?.role === 'freelancer_admin') && (
                  <RouterLink
                    to="/mon-espace?tab=ticket_database"
                    className="bg-[#5865F2]/10 text-[#5865F2] flex items-center px-3 py-2 rounded-md text-base font-medium w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Database className="h-5 w-5 mr-2" />
                    <span>Base de tickets</span>
                  </RouterLink>
                )}
                {(!user?.role || 
                  (user?.role !== 'fondateur' && 
                   user?.role !== 'freelancer' &&
                   user?.role !== 'freelancer_admin')) && (
                  <>
                    <RouterLink 
                      to="/mon-espace?tab=tickets"
                      className="bg-[#5865F2]/10 text-[#5865F2] flex items-center px-3 py-2 rounded-md text-base font-medium w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <Ticket className="h-5 w-5 mr-2" />
                      <span>Mes tickets</span>
                    </RouterLink>
                    <RouterLink 
                      to="/mon-espace?tab=subscription"
                      className="bg-[#5865F2]/10 text-[#5865F2] flex items-center px-3 py-2 rounded-md text-base font-medium w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      <span>Mon abonnement</span>
                    </RouterLink>
                    <RouterLink 
                      to="/mon-espace?tab=invoices"
                      className="bg-[#5865F2]/10 text-[#5865F2] flex items-center px-3 py-2 rounded-md text-base font-medium w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      <span>Mes factures</span>
                    </RouterLink>
                  </>
                )}
                <RouterLink 
                  to="/mon-espace?tab=preferences"
                  className="bg-[#5865F2]/10 text-[#5865F2] flex items-center px-3 py-2 rounded-md text-base font-medium w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  <span>Préférences</span>
                </RouterLink>
                <div className="px-3 py-2 flex flex-col">
                  <span className="font-semibold text-white mb-1 truncate">{user?.firstName} {user?.lastName}</span>
                  <div className="flex flex-nowrap items-center gap-1 whitespace-nowrap overflow-x-auto">
                    {user?.role === 'fondateur' ? (
                      <>
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/20 text-red-400">
                          Fondateur
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400">
                          Admin
                        </span>
                      </>
                    ) : user?.role === 'freelancer_admin' ? (
                      <>
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-500">
                          Freelancer
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400">
                          Admin
                        </span>
                      </>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                        user?.role === 'admin' ? 'bg-orange-500/20 text-orange-400' :
                        user?.role === 'freelancer' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-[#5865F2]/20 text-[#5865F2]'
                      }`}>
                        {user?.role === 'admin' ? 'Admin' :
                         user?.role === 'freelancer' ? 'Freelancer' :
                         user?.clientType || 'Utilisateur'}
                      </span>
                    )}
                    {/* Tag d'abonnement pour mobile - visible uniquement pour les utilisateurs standards */}
                    {(!user?.role || 
                      (user?.role !== 'admin' && 
                       user?.role !== 'fondateur' && 
                       user?.role !== 'freelancer' &&
                       user?.role !== 'freelancer_admin')) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400">
                          <Crown className="w-3 h-3 mr-1" />
                          {getSubscriptionName()}
                        </span>
                      )}
                  </div>
                </div>
              </>
            )}
            <button 
              className={`${isAuthenticated ? 'bg-[#5865F2]' : 'bg-[#4E5058]'} hover:bg-opacity-90 text-white flex items-center px-3 py-2 rounded-md text-base font-medium w-full`}
              aria-label={isAuthenticated ? 'Déconnecter' : 'Se connecter'}
              onClick={isAuthenticated ? logout : () => {
                setIsOpen(false);
                setIsLoginModalOpen(true);
              }}
            >
              {isAuthenticated ? (
                <>
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Déconnexion</span>
                </>
              ) : (
                <>
                  <User className="h-5 w-5 mr-2" />
                  <span>Connexion</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Connexion"
      >
        <LoginForm onSuccess={handleLoginSuccess} onRegisterClick={openRegisterModal} />
      </Modal>
      
      {/* Register Modal */}
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        onSwitchToLogin={openLoginModal}
      />
    </>
  );
};

export default Navbar;