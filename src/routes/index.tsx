import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { APP_CONFIG } from '../config/app';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import DepannageInformatique from '../pages/DepannageInformatique';
import CreationSiteWeb from '../pages/CreationSiteWeb';
import UserDashboard from '../pages/UserDashboard';
import TicketDetail from '../pages/TicketDetail';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout><Outlet /></MainLayout>}>
        <Route path={APP_CONFIG.routes.home} element={<HomePage />} />
        <Route path={APP_CONFIG.routes.depannage} element={<DepannageInformatique />} />
        <Route path={APP_CONFIG.routes.creationSite} element={<CreationSiteWeb />} />
        
        {/* Routes protégées */}
        <Route
          path={APP_CONFIG.routes.monEspace}
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path={APP_CONFIG.routes.tickets}
          element={
            <PrivateRoute>
              <TicketDetail />
            </PrivateRoute>
          }
        />

        {/* Redirection de /dashboard vers /mon-espace */}
        <Route path="/dashboard" element={<Navigate to={APP_CONFIG.routes.monEspace} replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 