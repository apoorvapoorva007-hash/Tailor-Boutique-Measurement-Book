import React, { useState } from 'react';
import { Lock, User, KeyRound, Sparkles, X, ShieldCheck } from 'lucide-react';
import { authService } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid credentials. Use admin / admin123');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(39, 30, 27, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(62, 31, 25, 0.35)',
        border: '1px solid #E8DCD3',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7A3D33 0%, #542820 100%)',
          color: '#FFFFFF',
          padding: '24px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Lock size={26} color="#FFF" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
            Master Tailor Portal
          </h2>
          <p style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: '4px' }}>
            Tailor & Boutique Measurement Book
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldCheck size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Admin Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. admin"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid var(--beige-border)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Security Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid var(--beige-border)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Boutique Book'}
          </button>

          {/* Quick Demo Login Preset */}
          <div style={{
            marginTop: '16px',
            padding: '10px 12px',
            backgroundColor: '#FAF6F0',
            border: '1px dashed #D6C2B4',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <strong>Demo Credentials:</strong> admin / admin123
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem'
              }}
            >
              <Sparkles size={12} /> Auto Fill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
