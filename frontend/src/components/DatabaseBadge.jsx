import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { boutiqueService } from '../services/api';

export default function DatabaseBadge() {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await boutiqueService.getHealth();
      setDbStatus(data.database);
    } catch {
      setDbStatus({ connected: false, mode: 'Disconnected' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!dbStatus) return null;

  const isAtlas = dbStatus.mode?.includes('Atlas');
  const isConnected = dbStatus.connected;

  return (
    <div 
      className="database-status-badge"
      title={dbStatus.host || dbStatus.notice || 'Database Connection'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: isAtlas ? '#ECFDF5' : (isConnected ? '#FFFBEB' : '#FEF2F2'),
        color: isAtlas ? '#065F46' : (isConnected ? '#92400E' : '#991B1B'),
        border: `1px solid ${isAtlas ? '#A7F3D0' : (isConnected ? '#FDE68A' : '#FECACA')}`,
        cursor: 'pointer'
      }}
      onClick={fetchStatus}
    >
      <Database size={13} />
      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isConnected ? '#10B981' : '#EF4444' }} />
      <span>{dbStatus.mode || 'MongoDB'}</span>
      <RefreshCw size={11} className={loading ? 'spin-icon' : ''} style={{ opacity: 0.7 }} />
    </div>
  );
}
