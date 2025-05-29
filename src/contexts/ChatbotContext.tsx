import React, { createContext, useContext, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

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

  const showMessage = (newMessage: string, type: MessageType) => {
    setMessage(newMessage);
    setMessageType(type);
    setIsVisible(true);

    // Cacher le message après 3 secondes
    setTimeout(() => {
      setIsVisible(false);
      setMessage(null);
    }, 3000);
  };

  return (
    <ChatbotContext.Provider value={{ showMessage, isVisible, message, messageType }}>
      {children}
      {isVisible && message && (
        <div className="fixed bottom-24 right-4 z-[9999]" style={{ marginRight: '40px' }}>
          <div className="relative">
            <div className="bg-[#2F3136] rounded-lg shadow-lg max-w-sm border border-[#5865F2] flex items-center p-4">
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
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{message}</p>
              </div>
            </div>
            {/* Queue de la bulle de dialogue à droite */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[#2F3136] border-r border-b border-[#5865F2] transform rotate-45"></div>
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