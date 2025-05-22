import React from 'react';

interface ChatbotProps {
  onClick?: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Halo animé */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-30"></span>
      </div>
      <button
        onClick={onClick}
        className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-violet-500 border-2 border-white/40 shadow-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:shadow-3xl focus:outline-none"
        aria-label="Ouvrir le chatbot"
      >
        <img 
          src="/images/logo-image.png" 
          alt="Logo du chatbot" 
          className="w-14 h-14 object-contain drop-shadow-lg"
        />
      </button>
    </div>
  );
};

export default Chatbot; 