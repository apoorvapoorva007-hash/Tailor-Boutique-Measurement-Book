import React, { useState } from 'react';
import { 
  X, CheckCircle2, Clock, Scissors, Truck, AlertTriangle, 
  Download, Printer, Plus, Calendar, FileText, ChevronRight, User
} from 'lucide-react';
import { boutiqueService } from '../services/api';

const ORDER_STAGES = [
  'Order Received',
  'Measurement Taken',
  'Stitching in Progress',
  'Ready for Trial',
  'Alteration Required',
  'Completed',
  'Delivered',
  'Cancelled'
];

export default function OrderDetailModal({ order, onClose, onStatusUpdated }) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [newStatus, setNewStatus] = useState(order.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'measurements' | 'history'

  const handleUpdateStatus = async (statusToSet) => {
    setUpdating(true);
    try {
      const res = await boutiqueService.updateOrderStatus(
        currentOrder.order_id, 
        statusToSet, 
        statusNotes || `Workflow updated to ${statusToSet}`
      );
      setCurrentOrder(res);
      setNewStatus(res.status);
      setStatusNotes('');
      if (onStatusUpdated) onStatusUpdated(res);
    } catch {
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIndex = (st) => ORDER_STAGES.indexOf(st);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(39, 30, 27, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(62, 31, 25, 0.3)',
        border: '1px solid var(--beige-border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          backgroundColor: '#FAF6F0',
          borderBottom: '1px solid var(--beige-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Job Card #{currentOrder.order_id}
              </span>
              <span className={`status-pill status-${currentOrder.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                {currentOrder.status}
              </span>
              {currentOrder.priority && currentOrder.priority !== 'Normal' && (
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {currentOrder.priority}
                </span>
              )}
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              {currentOrder.customer_name} — {currentOrder.garment_type}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href={boutiqueService.getOrderPdfUrl(currentOrder.order_id)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              title="Download official PDF Job Card"
            >
              <Download size={14} /> PDF
            </a>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              title="Print Job Card"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Workflow Progression Stepper */}
        <div style={{ padding: '20px 28px', backgroundColor: '#FDFBF7', borderBottom: '1px solid var(--beige-border)' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Tailoring Workflow Stepper
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {ORDER_STAGES.slice(0, 7).map((st, idx) => {
              const currentIdx = getStatusIndex(currentOrder.status);
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div 
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minWidth: '95px',
                    textAlign: 'center',
                    opacity: isPast || isCurrent ? 1 : 0.45,
                    transition: 'opacity 0.2s'
                  }}
                  title={`Click to set status to ${st}`}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? 'var(--primary)' : (isPast ? '#059669' : '#D6C2B4'),
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                    boxShadow: isCurrent ? '0 0 0 4px var(--primary-light)' : 'none'
                  }}>
                    {isPast ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--primary)' : 'var(--text-body)' }}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick status updater controls */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add tailor update notes (e.g. Sleeves stitched, awaiting trial)..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--beige-border)', fontSize: '0.84rem' }}
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--beige-border)', fontSize: '0.84rem', backgroundColor: '#FFF' }}
            >
              {ORDER_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => handleUpdateStatus(newStatus)}
              disabled={updating}
              className="btn btn-primary btn-sm"
            >
              {updating ? 'Updating...' : 'Set Status'}
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--beige-border)', padding: '0 28px', backgroundColor: '#FFF' }}>
          {[
            { id: 'overview', label: 'Order & Billing Overview' },
            { id: 'measurements', label: 'Measurement Specifications' },
            { id: 'history', label: `Status History (${currentOrder.status_history?.length || 0})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === t.id ? 700 : 500,
                color: activeTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === t.id ? '3px solid var(--primary)' : '3px solid transparent',
                fontSize: '0.88rem'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Tabs */}
        <div style={{ padding: '24px 28px' }}>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              {/* Customer & Schedule Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#FAF6F0', padding: '16px', borderRadius: '10px', border: '1px solid var(--beige-border)' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Customer Details
                  </h4>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {currentOrder.customer_name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    ID: {currentOrder.customer_id} | Phone: {currentOrder.customer_phone}
                  </div>
                </div>

                <div style={{ backgroundColor: '#FAF6F0', padding: '16px', borderRadius: '10px', border: '1px solid var(--beige-border)' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Key Dates
                  </h4>
                  <div style={{ fontSize: '0.86rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Booked On:</span>
                    <strong>{currentOrder.order_date}</strong>
                  </div>
                  <div style={{ fontSize: '0.86rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Fitting Trial:</span>
                    <strong>{currentOrder.fitting_date || 'None scheduled'}</strong>
                  </div>
                  <div style={{ fontSize: '0.86rem', display: 'flex', justifyContent: 'space-between', color: currentOrder.is_overdue ? '#DC2626' : 'inherit' }}>
                    <span>Delivery Date:</span>
                    <strong>{currentOrder.delivery_date} {currentOrder.is_overdue && '(OVERDUE)'}</strong>
                  </div>
                </div>
              </div>

              {/* Fabric & Instructions */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--beige-border)', borderRadius: '10px', padding: '18px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                  Fabric & Stitching Specifications
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Fabric:</span>
                    <div style={{ fontWeight: 600 }}>{currentOrder.fabric_details?.fabric_type || 'Custom'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Color:</span>
                    <div style={{ fontWeight: 600 }}>{currentOrder.fabric_details?.color || 'Self'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Source:</span>
                    <div style={{ fontWeight: 600 }}>{currentOrder.fabric_details?.source || 'Client'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Lining:</span>
                    <div style={{ fontWeight: 600 }}>{currentOrder.fabric_details?.lining || 'Cotton'}</div>
                  </div>
                </div>
                <div style={{ backgroundColor: '#FAF6F0', padding: '10px 14px', borderRadius: '6px', fontSize: '0.86rem' }}>
                  <strong>Instructions:</strong> {currentOrder.stitching_instructions || 'Standard boutique pattern stitching.'}
                </div>
              </div>

              {/* Financial Box */}
              <div style={{ backgroundColor: '#FAF6F0', borderRadius: '10px', border: '1px solid var(--beige-border)', padding: '18px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
                  Payment & Invoice Status
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', textAlign: 'center' }}>
                  <div style={{ backgroundColor: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--beige-border)' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Total Amount</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                      Rs. {currentOrder.total_amount?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--beige-border)' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Advance Received</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                      Rs. {currentOrder.advance_payment?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--beige-border)' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Balance Outstanding</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: currentOrder.balance_payment > 0 ? '#DC2626' : '#059669', marginTop: '2px' }}>
                      Rs. {currentOrder.balance_payment?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEASUREMENTS TAB */}
          {activeTab === 'measurements' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Job Card Measurement Record ({currentOrder.measurement_unit})
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Garment: <strong>{currentOrder.garment_type}</strong>
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px'
              }}>
                {Object.entries(currentOrder.measurements || {}).map(([key, val]) => (
                  <div key={key} style={{ backgroundColor: '#FAF6F0', padding: '12px', borderRadius: '8px', border: '1px solid var(--beige-border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {key.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                      {val} {currentOrder.measurement_unit}
                    </div>
                  </div>
                ))}
              </div>
              {Object.keys(currentOrder.measurements || {}).length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No measurement values recorded for this job card.
                </div>
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
                Order Workflow Audit Trail
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(currentOrder.status_history || []).map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: '#FAF6F0', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ minWidth: '90px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {h.date}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {h.status}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', marginTop: '2px' }}>
                        {h.notes}
                      </div>
                    </div>
                    {h.updated_by && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        by {h.updated_by}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
