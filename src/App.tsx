import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Pricing from './components/Pricing';
import Team from './components/Team';
import Faq from './components/Faq';
import Footer from './components/Footer';
import TrustpilotWidget from './components/TrustpilotWidget';
import { AuthProvider } from './contexts/AuthContext';
import UserDashboard from './pages/UserDashboard';
import DepannageInformatique from './pages/DepannageInformatique';

// HomePage component pour regrouper les sections de la page d'accueil
const HomePage = () => (
  <>
    <Hero />
    <div className="section-divider"></div>
    <TrustpilotWidget />
    <Pricing />
    <div className="section-divider"></div>
    <Team />
    <div className="section-divider"></div>
    <Faq />
  </>
);

function App() {
  useEffect(() => {
    // Update page title
    document.title = 'SOS IT Services - Dépannage Informatique Professionnel';
    
    // Update favicon dynamically for better branding
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💻</text></svg>';
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#36393F] text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/depannage-informatique" element={<DepannageInformatique />} />
            <Route path="/mon-espace" element={<UserDashboard />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;