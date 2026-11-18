import React from 'react';
import { PlusCircle, UserPlus, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import DatabaseBadge from './DatabaseBadge';

export default function Header({ title, subtitle, onQuickCustomer }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="no-print" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--beige-border)',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Title & Subtitle */}
      <div>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--primary)',
          margin: 0,
          lineHeight: 1.2
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          backgroundColor: '#FAF6F0',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid var(--beige-border)'
        }}>
          <Clock size={13} />
          <span>{currentDate}</span>
        </div>

        {/* Database Live Status Badge */}
        <DatabaseBadge />

        {/* Quick Actions */}
        <Link to="/new-order" className="btn btn-primary btn-sm">
          <PlusCircle size={15} />
          <span>New Order</span>
        </Link>
      </div>
    </header>
  );
}
