import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import { APP_CONFIG } from './config/app';

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
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;