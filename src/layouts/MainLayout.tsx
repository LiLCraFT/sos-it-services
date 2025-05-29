import { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChatbotProvider } from '../contexts/ChatbotContext';
import { ModalProvider } from '../contexts/ModalContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <ModalProvider>
      <div className="min-h-screen bg-[#36393F] text-white">
        <ChatbotProvider>
          <Navbar />
          {children}
          <Footer />
        </ChatbotProvider>
      </div>
    </ModalProvider>
  );
};

export default MainLayout; 