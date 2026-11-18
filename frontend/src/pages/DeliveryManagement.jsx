import React, { useState, useEffect } from 'react';
import { 
  Truck, Calendar, AlertTriangle, CheckCircle2, Clock, 
  Search, Phone, Check, RefreshCw, X, ChevronRight, PackageCheck
} from 'lucide-react';
import { boutiqueService } from '../services/api';

export default function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'upcoming' | 'overdue' | 'today' | 'delivered'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.filter = filter;
      const data = await boutiqueService.getDeliveries(params);
      setDeliveries(data);
    } catch {
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [filter]);

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      await boutiqueService.updateDelivery(deliveryId, { status: newStatus });
      setSuccessMsg(`Delivery ${deliveryId} updated to ${newStatus}.`);
      fetchDeliveries();
    } catch {
      alert('Failed to update delivery status.');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!newDate || !rescheduleModal) return;
    try {
      await boutiqueService.updateDelivery(rescheduleModal.delivery_id, {
        scheduled_date: newDate,
        status: 'Scheduled',
        notes: `Rescheduled to ${newDate}`
      });
      setSuccessMsg(`Delivery rescheduled to ${newDate}.`);
      setRescheduleModal(null);
      fetchDeliveries();
    } catch {
      alert('Failed to reschedule delivery.');
    }
  };

  const filtered = deliveries.filter((d) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        d.customer_name?.toLowerCase().includes(q) ||
        d.order_id?.toLowerCase().includes(q) ||
        d.delivery_id?.toLowerCase().includes(q) ||
        d.customer_phone?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const overdueCount = deliveries.filter(d => d.is_overdue && d.status !== 'Delivered').length;
  const upcomingCount = deliveries.filter(d => !d.is_overdue && d.status !== 'Delivered').length;
  const deliveredCount = deliveries.filter(d => d.status === 'Delivered').length;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Delivery Management & Tracking
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Monitor delivery schedules, prevent overdue delays, notify clients, and record garment dispatch.
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      {/* Overview Metric Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="boutique-card" style={{ padding: '18px', borderLeft: '4px solid #DC2626', backgroundColor: overdueCount > 0 ? '#FEF2F2' : '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: overdueCount > 0 ? '#991B1B' : 'var(--text-muted)' }}>
              Overdue Deliveries
            </span>
            <AlertTriangle size={18} color="#DC2626" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: overdueCount > 0 ? '#991B1B' : 'var(--text-main)', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
            {overdueCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: overdueCount > 0 ? '#DC2626' : 'var(--text-muted)' }}>
            {overdueCount > 0 ? 'Urgent: Deliveries passed deadline' : 'Zero overdue orders!'}
          </div>
        </div>

        <div className="boutique-card" style={{ padding: '18px', borderLeft: '4px solid #7C3AED' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Upcoming (Next 7 Days)
            </span>
            <Clock size={18} color="#7C3AED" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
            {upcomingCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Scheduled store pickups & dispatches
          </div>
        </div>

        <div className="boutique-card" style={{ padding: '18px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Successfully Delivered
            </span>
            <CheckCircle2 size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
            {deliveredCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Completed handovers
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="boutique-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FAF6F0', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--beige-border)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, order ID, or phone number..."
            style={{ width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'All Records' },
            { id: 'overdue', label: `Overdue (${overdueCount})`, alert: overdueCount > 0 },
            { id: 'upcoming', label: 'Upcoming (7d)' },
            { id: 'today', label: 'Due Today' },
            { id: 'delivered', label: 'Delivered' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: filter === t.id ? '1px solid var(--primary)' : '1px solid var(--beige-border)',
                backgroundColor: filter === t.id ? 'var(--primary)' : (t.alert ? '#FEE2E2' : '#FFF'),
                color: filter === t.id ? '#FFF' : (t.alert ? '#991B1B' : 'var(--text-body)'),
                fontWeight: filter === t.id ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery List */}
      <div className="boutique-card" style={{ padding: '20px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 14px' }}>Delivery ID</th>
                <th style={{ padding: '12px 14px' }}>Order ID</th>
                <th style={{ padding: '12px 14px' }}>Customer</th>
                <th style={{ padding: '12px 14px' }}>Garment</th>
                <th style={{ padding: '12px 14px' }}>Scheduled Date</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Type</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No delivery records found matching this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr 
                    key={d.delivery_id} 
                    style={{ 
                      borderBottom: '1px solid #F3ECE4',
                      backgroundColor: d.is_overdue && d.status !== 'Delivered' ? '#FFF5F5' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                      {d.delivery_id}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>
                      {d.order_id}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{d.customer_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={11} /> {d.customer_phone || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 500 }}>
                      {d.garment_type || 'Custom'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: d.is_overdue && d.status !== 'Delivered' ? 700 : 500,
                        color: d.is_overdue && d.status !== 'Delivered' ? '#DC2626' : 'var(--text-main)'
                      }}>
                        {d.is_overdue && d.status !== 'Delivered' && <AlertTriangle size={14} color="#DC2626" />}
                        {d.scheduled_date}
                      </div>
                      {d.is_overdue && d.status !== 'Delivered' && (
                        <div style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 700 }}>
                          OVERDUE DEADLINE
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`status-pill ${d.status === 'Delivered' ? 'status-delivered' : (d.is_overdue ? 'status-alteration' : 'status-pending')}`}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {d.delivery_type || 'Store Pickup'}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {d.status !== 'Delivered' && (
                          <button
                            onClick={() => handleStatusChange(d.delivery_id, 'Delivered')}
                            className="btn btn-primary btn-sm"
                            title="Mark Delivered & Completed"
                          >
                            <PackageCheck size={14} /> Delivered
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setRescheduleModal(d);
                            setNewDate(d.scheduled_date);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Reschedule delivery date"
                        >
                          <Calendar size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(39, 30, 27, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(62, 31, 25, 0.25)',
            border: '1px solid var(--beige-border)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', backgroundColor: '#FAF6F0', borderBottom: '1px solid var(--beige-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
                Reschedule Delivery Date
              </h3>
              <button onClick={() => setRescheduleModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReschedule} style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Select a new delivery date for <strong>{rescheduleModal.customer_name}</strong> ({rescheduleModal.order_id}).
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  New Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRescheduleModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
