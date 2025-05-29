import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useModal } from './ModalContext';
import { X } from 'lucide-react';

type MessageType = 'info' | 'success' | 'error' | 'warning';

interface ChatbotContextType {
  showMessage: (message: string, type: MessageType) => void;
  isVisible: boolean;
  message: string | null;
  messageType: MessageType;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>('info');
  const [fade, setFade] = useState<'in' | 'out'>('in');
  const [isHovered, setIsHovered] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeout = useRef<NodeJS.Timeout | null>(null);
  const modal = useModal();

  useEffect(() => {
    if (isVisible && !isHovered) {
      // Démarre le timer de fermeture
      closeTimeout.current = setTimeout(() => {
        setFade('out');
        fadeTimeout.current = setTimeout(() => {
          setIsVisible(false);
          setMessage(null);
        }, 700);
      }, 3000);
    }
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    };
  }, [isVisible, isHovered]);

  const showMessage = (newMessage: string, type: MessageType) => {
    setMessage(newMessage);
    setMessageType(type);
    setIsVisible(true);
    setFade('in');
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Relance le timer de fermeture
    closeTimeout.current = setTimeout(() => {
      setFade('out');
      fadeTimeout.current = setTimeout(() => {
        setIsVisible(false);
        setMessage(null);
      }, 700);
    }, 1500); // Laisse 1.5s après le hover pour fermer
  };

  const handleClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    setFade('out');
    setTimeout(() => {
      setIsVisible(false);
      setMessage(null);
    }, 700);
  };

  return (
    <ChatbotContext.Provider value={{ showMessage, isVisible, message, messageType }}>
      {children}
      {isVisible && message && (
        <div
          className={`fixed bottom-24 right-4 z-[9999]`}
          style={{ marginRight: '40px' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative">
            <div
              className={`bg-[#2F3136] rounded-lg shadow-lg max-w-sm border border-[#5865F2] p-4 transition-opacity duration-700 ${fade === 'in' ? 'opacity-100' : 'opacity-0'}`}
              style={{ position: 'relative' }}
            >
              {/* Bouton de fermeture */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-white bg-transparent rounded-full p-1 transition-colors z-10"
                aria-label="Fermer la bulle"
                tabIndex={0}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                {messageType === 'warning' ? (
                  <span className="flex-shrink-0" aria-label="Avertissement">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.29 3.86l-8.1 14.14A2 2 0 004.18 21h15.64a2 2 0 001.99-2.99l-8.1-14.14a2 2 0 00-3.42 0z" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#FACC15"/>
                      <rect x="11" y="9" width="2" height="5.5" rx="1" fill="#111"/>
                      <circle cx="12" cy="17" r="1.2" fill="#111"/>
                    </svg>
                  </span>
                ) : (
                  <div className="flex-shrink-0">
                    <img
                      src="/images/chatbot-avatar.png"
                      alt="Chatbot"
                      className="h-10 w-10 rounded-full border-2 border-[#5865F2]"
                    />
                  </div>
                )}
                <div className="ml-0 sm:ml-3 mt-2 sm:mt-0 w-full">
                  <p className="text-sm font-medium text-white">{message}</p>
                  {message === 'Vous devez être connecté pour accéder au profil Freelancer' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold px-4 py-1.5 rounded transition-colors duration-200"
                        onClick={(e) => { e.stopPropagation(); modal.openLoginModal(); }}
                      >
                        Se connecter
                      </button>
                      <button
                        className="bg-white hover:bg-gray-200 text-[#5865F2] font-semibold px-4 py-1.5 rounded border border-[#5865F2] transition-colors duration-200"
                        onClick={(e) => { e.stopPropagation(); modal.openRegisterModal(); }}
                      >
                        S'inscrire
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Queue de la bulle de dialogue à droite */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[#2F3136] border-r border-b border-[#5865F2] transform rotate-45 transition-opacity duration-700" style={{ opacity: fade === 'in' ? 1 : 0 }}></div>
          </div>
        </div>
      )}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}; 