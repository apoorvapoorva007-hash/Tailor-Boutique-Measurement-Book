import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Measurements from './pages/Measurements';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import FittingNotes from './pages/FittingNotes';
import DeliveryManagement from './pages/DeliveryManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { authService } from './services/api';

function MainLayout({ user, onLogout, onOpenLogin }) {
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Boutique Dashboard', subtitle: 'Real-time tailor metrics, active stitching orders, and delivery timelines' };
      case '/customers':
        return { title: 'Customer Directory', subtitle: 'Customer database, measurement profiles, and order histories' };
      case '/measurements':
        return { title: 'Dynamic Measurement Book', subtitle: 'Garment-specific dynamic measurement templates, custom fields, and unit converter' };
      case '/new-order':
        return { title: 'New Stitching Order', subtitle: 'Book client orders, assign measurements, fabric details, and delivery date' };
      case '/orders':
        return { title: 'All Stitching Orders', subtitle: 'Track workflow statuses, update progress, and generate PDF job cards' };
      case '/fitting-notes':
        return { title: 'Fitting & Alteration Notes', subtitle: 'Trial session logs, pin alterations, and tailor adjustment records' };
      case '/deliveries':
        return { title: 'Delivery Management', subtitle: 'Upcoming delivery dates, overdue alerts, and garment dispatch' };
      case '/reports':
        return { title: 'Boutique Reports & Analytics', subtitle: 'Executive revenue statements, order reports, and PDF downloads' };
      case '/settings':
        return { title: 'Boutique Settings & Database', subtitle: 'MongoDB Atlas connectivity, sample data seed, and brand configuration' };
      default:
        return { title: 'Tailor & Boutique Measurement Book', subtitle: 'Boutique Couture & Tailoring Management' };
    }
  };

  const { title, subtitle } = getPageMeta();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--cream)' }}>
      <Sidebar user={user} onLogout={onLogout} onOpenLogin={onOpenLogin} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={title} subtitle={subtitle} />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/measurements" element={<Measurements />} />
            <Route path="/new-order" element={<NewOrder />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/fitting-notes" element={<FittingNotes />} />
            <Route path="/deliveries" element={<DeliveryManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    // Check saved token or auto-login with default admin if none
    const saved = authService.getCurrentUser();
    if (saved) {
      setUser(saved);
    } else {
      // Automatic seamless login with demo admin credentials for effortless testing
      authService.login('admin', 'admin123')
        .then(res => setUser(res.user))
        .catch(() => { });
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setLoginOpen(true);
  };

  return (
    <BrowserRouter>
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setLoginOpen(true)}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />
    </BrowserRouter>
  );
}
