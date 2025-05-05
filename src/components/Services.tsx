import React from 'react';
import { 
  Wrench, 
  Wifi, 
  Mail, 
  Monitor, 
  Globe, 
  Database, 
  Shield, 
  Printer,
  ArrowRight
} from 'lucide-react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => {
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-xl card-spacing transition-all duration-300 overflow-hidden border border-white/5 hover:border-white/10 flex flex-col h-full">
      {/* Hover gradient effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5865F2] to-[#EB459E] opacity-0 group-hover:opacity-20 blur rounded-xl transition-opacity duration-300"></div>
      
      <div className="relative z-10 flex flex-col h-full content-spacing">
        <div className="w-12 h-12 rounded-lg bg-[#5865F2]/10 flex items-center justify-center group-hover:bg-[#5865F2]/20 transition-all duration-300 text-[#5865F2]">
          {icon}
        </div>
        
        <h3 className="text-white text-base font-medium leading-tight">{title}</h3>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
        
        <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#5865F2] text-sm font-medium flex items-center">
          <span>En savoir plus</span>
          <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  const services = [
    {
      icon: <Wrench size={18} />,
      title: "Dépannage logiciel",
      description: "Installation, configuration et résolution de problèmes logiciels."
    },
    {
      icon: <Wifi size={18} />,
      title: "Problèmes de réseau",
      description: "Connexion internet, configuration WiFi et résolution de problèmes réseau."
    },
    {
      icon: <Mail size={18} />,
      title: "Gestion des emails",
      description: "Accès, synchronisation et configuration de votre messagerie électronique."
    },
    {
      icon: <Monitor size={18} />,
      title: "Performance PC",
      description: "Optimisation, dépannage et résolution des problèmes de lenteur."
    },
    {
      icon: <Globe size={18} />,
      title: "Applications web",
      description: "Support pour M365, Google Workspace et autres applications cloud."
    },
    {
      icon: <Database size={18} />,
      title: "Gestion de données",
      description: "Récupération, transfert et sauvegarde sécurisée de vos données."
    },
    {
      icon: <Shield size={18} />,
      title: "Sécurité informatique",
      description: "Protection antivirus, sécurisation et élimination des menaces."
    },
    {
      icon: <Printer size={18} />,
      title: "Support imprimantes",
      description: "Configuration, dépannage et optimisation de vos imprimantes."
    }
  ];

  return (
    <section id="services" className="section-spacing bg-gradient-to-b from-[#2F3136] to-[#36393F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center section-title-spacing">
          <div className="section-subtitle-badge">
            <Wrench size={14} className="mr-1.5" />
            <span className="text-xs font-medium">Nos Services</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Des solutions <span className="text-[#5865F2]">expertes</span> pour tous vos besoins
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto text-sm">
            Notre équipe de spécialistes vous accompagne pour résoudre efficacement vos problèmes informatiques.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;