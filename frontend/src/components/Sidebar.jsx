import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Ruler, 
  PlusCircle, 
  ShoppingBag, 
  Scissors, 
  Truck, 
  FileText, 
  Settings as SettingsIcon, 
  LogOut,
  Sparkles,
  Crown
} from 'lucide-react';

export default function Sidebar({ user, onLogout, onOpenLogin }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Measurements', path: '/measurements', icon: Ruler, highlight: true },
    { name: 'New Order', path: '/new-order', icon: PlusCircle, badge: 'New' },
    { name: 'All Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Fitting Notes', path: '/fitting-notes', icon: Scissors },
    { name: 'Delivery Management', path: '/deliveries', icon: Truck },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#FAF6F0',
      borderRight: '1px solid var(--beige-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      zIndex: 100,
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--beige-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #7A3D33 0%, #542820 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FAF6F0',
          boxShadow: '0 4px 10px rgba(110, 56, 46, 0.25)'
        }}>
          <Scissors size={22} />
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.28rem',
            fontWeight: 700,
            lineHeight: 1.1,
            color: 'var(--primary)',
            letterSpacing: '0.02em'
          }}>
            TAILOR & BOUTIQUE
          </h1>
          <span style={{
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 700,
            color: 'var(--secondary)'
          }}>
            Measurement Book
          </span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav style={{
        padding: '16px 12px',
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-light)',
          padding: '6px 12px 4px'
        }}>
          Boutique Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : 'var(--text-body)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                boxShadow: isActive ? '0 3px 8px rgba(110, 56, 46, 0.25)' : 'none',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
                position: 'relative'
              })}
            >
              <Icon size={18} style={{ opacity: 0.9 }} />
              <span style={{ flex: 1 }}>{item.name}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: '#EFA69B',
                  color: '#6E382E',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  textTransform: 'uppercase'
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin User / Logout Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--beige-border)',
        backgroundColor: '#F3ECE4'
      }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#7A3D33',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                <Crown size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {user.full_name || user.username}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {user.role || 'Master Tailor'}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.82rem', padding: '8px 12px' }}
          >
            <Crown size={14} /> Admin Sign In
          </button>
        )}
      </div>
    </aside>
  );
}
