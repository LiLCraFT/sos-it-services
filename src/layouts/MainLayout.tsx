import { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChatbotProvider } from '../contexts/ChatbotContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#36393F] text-white">
      <ChatbotProvider>
        <Navbar />
        {children}
        <Footer />
      </ChatbotProvider>
    </div>
  );
};

export default MainLayout; 