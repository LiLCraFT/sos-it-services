import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import { APP_CONFIG } from './config/app';
import FreelancerAvailability from './pages/FreelancerAvailability';
import PrivateRoute from './components/PrivateRoute';

function App() {
  useEffect(() => {
    // Update page title
    document.title = APP_CONFIG.title;
    
    // Update favicon dynamically for better branding
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = APP_CONFIG.favicon;
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<AppRoutes />} />
          <Route
            path="/freelancer/availability"
            element={
              <PrivateRoute>
                <FreelancerAvailability />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;