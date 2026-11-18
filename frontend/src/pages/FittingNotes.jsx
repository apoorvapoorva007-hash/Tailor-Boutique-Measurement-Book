import React, { useState, useEffect } from 'react';
import { 
  Scissors, PlusCircle, CheckCircle2, AlertTriangle, 
  Clock, Trash2, Edit2, Check, X, Search, User, ShoppingBag
} from 'lucide-react';
import { boutiqueService } from '../services/api';

export default function FittingNotes() {
  const [notes, setNotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'resolved'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [trialStage, setTrialStage] = useState('First Trial');
  const [trialStatus, setTrialStatus] = useState('Minor Alteration');
  const [alterationDetails, setAlterationDetails] = useState('');
  const [tailorNotes, setTailorNotes] = useState('');
  const [customerFeedback, setCustomerFeedback] = useState('');
  const [resolved, setResolved] = useState(false);

  const fetchNotesAndOrders = async () => {
    setLoading(true);
    try {
      const [notesRes, ordersRes] = await Promise.all([
        boutiqueService.getFittingNotes(),
        boutiqueService.getOrders()
      ]);
      setNotes(notesRes);
      setOrders(ordersRes);
    } catch {
      setNotes([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesAndOrders();
  }, []);

  const handleOpenModal = () => {
    setSelectedOrderId(orders[0]?.order_id || '');
    setTrialStage('First Trial');
    setTrialStatus('Minor Alteration');
    setAlterationDetails('');
    setTailorNotes('');
    setCustomerFeedback('');
    setResolved(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || !alterationDetails.trim()) {
      alert('Order selection and alteration details are required.');
      return;
    }

    const payload = {
      order_id: selectedOrderId,
      trial_stage: trialStage,
      trial_status: trialStatus,
      alteration_details: alterationDetails,
      tailor_notes: tailorNotes,
      customer_feedback: customerFeedback,
      resolved
    };

    try {
      await boutiqueService.createFittingNote(payload);
      setSuccessMsg('Fitting trial note recorded successfully!');
      setModalOpen(false);
      fetchNotesAndOrders();
    } catch (err) {
      alert(typeof err === 'string' ? err : 'Error saving fitting note.');
    }
  };

  const handleToggleResolved = async (note) => {
    try {
      await boutiqueService.updateFittingNote(note.note_id, {
        resolved: !note.resolved
      });
      fetchNotesAndOrders();
    } catch {
      alert('Failed to update resolution status.');
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm(`Delete fitting note ${noteId}?`)) return;
    try {
      await boutiqueService.deleteFittingNote(noteId);
      setSuccessMsg('Fitting note deleted.');
      fetchNotesAndOrders();
    } catch {
      alert('Failed to delete.');
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (filter === 'pending' && n.resolved) return false;
    if (filter === 'resolved' && !n.resolved) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        n.customer_name?.toLowerCase().includes(q) ||
        n.order_id?.toLowerCase().includes(q) ||
        n.alteration_details?.toLowerCase().includes(q) ||
        n.note_id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = notes.filter(n => !n.resolved).length;
  const resolvedCount = notes.filter(n => n.resolved).length;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Fitting & Alteration Notes
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Record trial sessions, pin adjustments, alteration instructions, and client satisfaction records.
          </p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary">
          <PlusCircle size={16} /> Record Fitting Trial
        </button>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      {/* Metric & Filter Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '18px', marginBottom: '24px' }}>
        {/* Stats */}
        <div className="boutique-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Alterations</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#DC2626', fontFamily: 'var(--font-serif)' }}>{pendingCount}</div>
          </div>
          <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--beige-border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Approved & Resolved</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#059669', fontFamily: 'var(--font-serif)' }}>{resolvedCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="boutique-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FAF6F0', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, order ID, or alteration keywords..."
              style={{ width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: '0.88rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'pending', 'resolved'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: filter === t ? '1px solid var(--primary)' : '1px solid var(--beige-border)',
                  backgroundColor: filter === t ? 'var(--primary)' : '#FFF',
                  color: filter === t ? '#FFF' : 'var(--text-body)',
                  fontWeight: filter === t ? 700 : 500,
                  fontSize: '0.78rem',
                  textTransform: 'capitalize',
                  cursor: 'pointer'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fitting Notes Grid Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {filteredNotes.length === 0 ? (
          <div className="boutique-card" style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Scissors size={36} color="var(--secondary)" style={{ margin: '0 auto 12px' }} />
            <h3>No fitting notes found</h3>
            <p>Record fitting trial notes when a client tries on their stitched garment.</p>
          </div>
        ) : (
          filteredNotes.map((n) => (
            <div key={n.note_id} className="boutique-card" style={{ padding: '22px', borderLeft: n.resolved ? '4px solid #059669' : '4px solid #DC2626', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      {n.note_id} ● {n.order_id}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: n.resolved ? '#D1FAE5' : '#FEE2E2',
                      color: n.resolved ? '#065F46' : '#991B1B'
                    }}>
                      {n.resolved ? 'Altered & Resolved' : 'Alteration Pending'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                    {n.customer_name} ({n.garment_type})
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Trial: <strong>{n.trial_stage}</strong> ● {n.fitting_date}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(n.note_id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  title="Delete note"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Alteration Details Box */}
              <div style={{ backgroundColor: '#FAF6F0', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--beige-border)', marginBottom: '14px', flex: 1 }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Alteration Instructions:
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.4 }}>
                  {n.alteration_details}
                </div>

                {n.tailor_notes && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #E0D4C9', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <strong>Master Tailor Note:</strong> {n.tailor_notes}
                  </div>
                )}
                {n.customer_feedback && (
                  <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <strong>Client Feedback:</strong> "{n.customer_feedback}"
                  </div>
                )}
              </div>

              {/* Resolution toggle button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-body)' }}>
                  Result: <strong style={{ color: n.trial_status === 'Approved' ? '#059669' : '#DC2626' }}>{n.trial_status}</strong>
                </span>

                <button
                  onClick={() => handleToggleResolved(n)}
                  className={`btn btn-sm ${n.resolved ? 'btn-secondary' : 'btn-primary'}`}
                >
                  <CheckCircle2 size={14} />
                  <span>{n.resolved ? 'Mark Incomplete' : 'Mark Altered & Done'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Fitting Note Modal */}
      {modalOpen && (
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
            maxWidth: '560px',
            boxShadow: '0 20px 40px rgba(62, 31, 25, 0.25)',
            border: '1px solid var(--beige-border)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', backgroundColor: '#FAF6F0', borderBottom: '1px solid var(--beige-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                Record Fitting Trial & Alterations
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Select Customer Order *
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem', backgroundColor: '#FFF' }}
                >
                  {orders.map((o) => (
                    <option key={o.order_id} value={o.order_id}>
                      {o.order_id} — {o.customer_name} ({o.garment_type}) [{o.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Trial Stage
                  </label>
                  <select
                    value={trialStage}
                    onChange={(e) => setTrialStage(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem', backgroundColor: '#FFF' }}
                  >
                    <option value="First Trial">First Trial (Bodice / Fitting)</option>
                    <option value="Second Trial">Second Trial</option>
                    <option value="Final Fitting">Final Fitting</option>
                    <option value="Post-Delivery">Post-Delivery Adjustment</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Trial Outcome
                  </label>
                  <select
                    value={trialStatus}
                    onChange={(e) => setTrialStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem', backgroundColor: '#FFF' }}
                  >
                    <option value="Minor Alteration">Minor Alteration (Hem/Loose)</option>
                    <option value="Major Alteration">Major Alteration (Cut revision)</option>
                    <option value="Perfect Fit">Perfect Fit (Ready)</option>
                    <option value="Approved">Approved by Customer</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Alteration Details (Exact Instructions) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={alterationDetails}
                  onChange={(e) => setAlterationDetails(e.target.value)}
                  placeholder="e.g. Waist too loose by 0.5 inch, shorten blouse hem by 0.75 inch, adjust armhole curve for ease of movement."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Tailor Notes
                  </label>
                  <input
                    type="text"
                    value={tailorNotes}
                    onChange={(e) => setTailorNotes(e.target.value)}
                    placeholder="Pins placed at side seams"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Customer Feedback
                  </label>
                  <input
                    type="text"
                    value={customerFeedback}
                    onChange={(e) => setCustomerFeedback(e.target.value)}
                    placeholder="Loves the neckline finish"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="resolved_check"
                  checked={resolved}
                  onChange={(e) => setResolved(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="resolved_check" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                  Mark Alteration Completed & Resolved Immediately
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Fitting Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
