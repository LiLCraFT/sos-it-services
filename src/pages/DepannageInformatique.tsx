import React, { useEffect } from 'react';
import Services from '../components/Services';
import Faq from '../components/Faq';

const DepannageInformatique: React.FC = () => {
  useEffect(() => {
    // Update page title
    document.title = 'SOS IT Services - Dépannage Informatique';
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-16">
      <div className="bg-[#2F3136] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Dépannage <span className="text-[#5865F2]">Informatique</span>
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Notre équipe d'experts est à votre service pour résoudre tous vos problèmes informatiques rapidement et efficacement.
            </p>
          </div>
        </div>
      </div>
      
      <Services />
      <Faq showLink={false} showAllQuestions={true} />
    </div>
  );
};

export default DepannageInformatique; 