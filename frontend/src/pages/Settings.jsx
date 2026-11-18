import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Database, ShieldCheck, RefreshCw, 
  Sparkles, Check, CheckCircle2, AlertTriangle, KeyRound, Store
} from 'lucide-react';
import { boutiqueService, authService } from '../services/api';

export default function Settings() {
  const [dbStatus, setDbStatus] = useState(null);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState('');
  const [adminUser, setAdminUser] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await boutiqueService.getHealth();
      setDbStatus(data.database);
      setCounts(data.counts || {});
    } catch {
      setDbStatus({ connected: false, mode: 'Offline' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    setAdminUser(authService.getCurrentUser());
  }, []);

  const handleReseed = async () => {
    if (!window.confirm('Reset and re-populate the sample demonstration data?')) return;
    setSeeding(true);
    try {
      const res = await boutiqueService.seedDatabase(true);
      setMsg(res.message || 'Sample database records re-seeded successfully!');
      fetchHealth();
    } catch {
      alert('Failed to re-seed data.');
    } finally {
      setSeeding(false);
    }
  };

  const isAtlas = dbStatus?.mode?.includes('Atlas');

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
          Boutique System Settings
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          Manage MongoDB Atlas database connection, re-seed demonstration data, and review boutique configurations.
        </p>
      </div>

      {msg && (
        <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {msg}
        </div>
      )}

      {/* 1. Database Connection Card */}
      <div className="boutique-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="var(--primary)" /> Database Configuration (MongoDB Atlas)
          </h3>
          <button onClick={fetchHealth} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin-icon' : ''} /> Test Connection
          </button>
        </div>

        <div style={{ backgroundColor: '#FAF6F0', borderRadius: '10px', padding: '18px', border: '1px solid var(--beige-border)', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: dbStatus?.connected ? '#10B981' : '#EF4444' }} />
              <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{dbStatus?.mode || 'Detecting...'}</strong>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '12px',
              backgroundColor: isAtlas ? '#D1FAE5' : '#FEF3C7',
              color: isAtlas ? '#065F46' : '#92400E'
            }}>
              {isAtlas ? 'Cloud Atlas Connected' : 'Continuous In-Memory Engine'}
            </span>
          </div>

          <div style={{ fontSize: '0.84rem', color: 'var(--text-body)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>Database Name: <strong>{dbStatus?.db_name || 'tailor_boutique_db'}</strong></div>
            <div>Cluster / Host: <strong>{dbStatus?.host || 'MongoDB'}</strong></div>
          </div>

          {dbStatus?.notice && (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #D6C2B4', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ℹ️ <strong>Atlas Setup:</strong> {dbStatus.notice}
            </div>
          )}
        </div>

        {/* Collection Counts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {[
            { label: 'Customers', count: counts.customers ?? '—' },
            { label: 'Orders', count: counts.orders ?? '—' },
            { label: 'Garment Profiles', count: counts.garment_profiles ?? '—' },
            { label: 'Fitting Notes', count: counts.fitting_notes ?? '—' },
            { label: 'Deliveries', count: counts.deliveries ?? '—' },
            { label: 'Admin Users', count: counts.admin_users ?? '—' },
          ].map(c => (
            <div key={c.label} style={{ backgroundColor: '#FFF', border: '1px solid var(--beige-border)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>{c.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Demonstration Seed Data Card */}
      <div className="boutique-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--primary)" /> Demonstration Sample Records
        </h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Populates the boutique database with realistic Indian boutique sample customers, diverse garment measurement profiles (Blouse, Lehenga, Chudidar, Kurti, Gown), orders across all 8 workflow stages, trial fitting notes, and overdue delivery tracking.
        </p>
        <button
          onClick={handleReseed}
          disabled={seeding}
          className="btn btn-secondary"
        >
          <RefreshCw size={15} className={seeding ? 'spin-icon' : ''} />
          <span>{seeding ? 'Seeding Database...' : 'Re-Seed Sample Demonstration Records'}</span>
        </button>
      </div>

      {/* 3. Boutique Profile & Standards Card */}
      <div className="boutique-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={20} color="var(--primary)" /> Boutique Brand & Tailoring Standards
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Boutique House Name
            </label>
            <input
              type="text"
              readOnly
              value="Atelier & Boutique Measurement Book"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem', backgroundColor: '#FAF6F0' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Standard Currency
            </label>
            <input
              type="text"
              readOnly
              value="Indian Rupee (INR - Rs.)"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem', backgroundColor: '#FAF6F0' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Default Seam Margin
            </label>
            <input
              type="text"
              readOnly
              value="2.0 Inches (Alteration Allowance)"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem', backgroundColor: '#FAF6F0' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Measurement System
            </label>
            <input
              type="text"
              readOnly
              value="Dual System: Inches (Standard) & Centimetres"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem', backgroundColor: '#FAF6F0' }}
            />
          </div>
        </div>
      </div>

      {/* 4. Security & Admin Card */}
      <div className="boutique-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--primary)" /> Security & Session Information
        </h3>
        <div style={{ backgroundColor: '#FAF6F0', borderRadius: '8px', padding: '14px', border: '1px solid var(--beige-border)', fontSize: '0.86rem' }}>
          <div>Active Administrator: <strong>{adminUser?.full_name || 'Master Tailor Admin'} ({adminUser?.username || 'admin'})</strong></div>
          <div style={{ marginTop: '4px' }}>Role Authorization: <strong>{adminUser?.role || 'Admin'}</strong></div>
          <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Endpoints protected with cryptographic token verification. Passwords securely hashed with PBKDF2/Django crypto.
          </div>
        </div>
      </div>
    </div>
  );
}
