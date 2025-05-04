import React from 'react';
import { 
  Wrench, 
  Wifi, 
  Mail, 
  Monitor, 
  Globe, 
  Database, 
  Shield, 
  Printer 
} from 'lucide-react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => {
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-xl p-6 transition-all duration-300 overflow-hidden border border-transparent hover:border-white/10">
      {/* Highlight effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5865F2] to-[#EB459E] opacity-0 group-hover:opacity-30 blur rounded-xl transition-opacity duration-300"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#5865F2]/10 flex items-center justify-center mb-4 group-hover:bg-[#5865F2]/20 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2]">
            {icon}
          </div>
        </div>
        <h3 className="text-white text-lg font-medium leading-tight mb-2">{title}</h3>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  const services = [
    {
      icon: <Wrench size={20} />,
      title: "J'ai besoin d'aide pour installer, configurer ou accéder à un logiciel."
    },
    {
      icon: <Wifi size={20} />,
      title: "J'ai des problèmes de connexion à Internet, de configuration wifi."
    },
    {
      icon: <Mail size={20} />,
      title: "Je n'accède pas à mes mails, je n'arrive pas à les synchroniser."
    },
    {
      icon: <Monitor size={20} />,
      title: "Mon ordinateur est lent, bloqué, ou rien ne s'affiche."
    },
    {
      icon: <Globe size={20} />,
      title: "J'ai un problème avec mes applications web (M365, Drive, réseaux sociaux,...)."
    },
    {
      icon: <Database size={20} />,
      title: "Je souhaite récupérer des données, les transférer ou les sauvegarder."
    },
    {
      icon: <Shield size={20} />,
      title: "J'ai un virus ou je souhaite renforcer ma sécurité."
    },
    {
      icon: <Printer size={20} />,
      title: "Mon imprimante est inaccessible ou doit être configurée."
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-[#2F3136] to-[#36393F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] mb-5">
            <Wrench size={16} className="mr-2" />
            <span className="text-sm font-medium">Nos Services</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span>Des solutions pour</span>{' '}
            <span className="text-[#5865F2]">tous vos problèmes</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Notre équipe d'experts vous accompagne dans la résolution de tous vos problèmes informatiques.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;