import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, PlusCircle, Eye, 
  Download, Trash2, AlertTriangle, Check, RefreshCw, X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { boutiqueService } from '../services/api';
import OrderDetailModal from './OrderDetailModal';

const STATUS_FILTERS = [
  'All',
  'Order Received',
  'Measurement Taken',
  'Stitching in Progress',
  'Ready for Trial',
  'Alteration Required',
  'Completed',
  'Delivered',
  'Cancelled'
];

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Check query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const st = params.get('status');
    if (st && STATUS_FILTERS.includes(st)) {
      setStatusFilter(st);
    }
  }, [location.search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      if (search) params.q = search;
      if (location.state?.customerId) params.customer_id = location.state.customerId;

      const data = await boutiqueService.getOrders(params);
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, priorityFilter, search]);

  const handleDelete = async (orderId) => {
    if (!window.confirm(`Delete order ${orderId}? This will remove associated delivery records and fitting notes.`)) return;
    try {
      await boutiqueService.deleteOrder(orderId);
      setSuccessMsg(`Order ${orderId} removed.`);
      fetchOrders();
    } catch {
      alert('Failed to delete order.');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Order Received': return 'status-received';
      case 'Measurement Taken': return 'status-measurement';
      case 'Stitching in Progress': return 'status-stitching';
      case 'Ready for Trial': return 'status-trial';
      case 'Alteration Required': return 'status-alteration';
      case 'Completed': return 'status-completed';
      case 'Delivered': return 'status-delivered';
      default: return 'status-cancelled';
    }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            All Stitching Orders
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Track order status, manage fitting trial stages, inspect measurements, and print job cards.
          </p>
        </div>
        <Link to="/new-order" className="btn btn-primary">
          <PlusCircle size={16} /> New Order
        </Link>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      {/* Filter Ribbon */}
      <div className="boutique-card" style={{ padding: '18px 20px', marginBottom: '20px' }}>
        {/* Search & Priority Controls */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FAF6F0', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--beige-border)' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Customer Name, Phone, or Garment Type..."
              style={{ width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: '0.88rem' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={15} />
              </button>
            )}
          </div>

          <div style={{ width: '200px' }}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem', backgroundColor: '#FFF' }}
            >
              <option value="All">All Priorities</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Bridal">Bridal</option>
              <option value="Express">Express</option>
            </select>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: statusFilter === st ? '1px solid var(--primary)' : '1px solid var(--beige-border)',
                backgroundColor: statusFilter === st ? 'var(--primary)' : '#FFFFFF',
                color: statusFilter === st ? '#FFFFFF' : 'var(--text-body)',
                fontSize: '0.78rem',
                fontWeight: statusFilter === st ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="boutique-card" style={{ padding: '20px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 14px' }}>Order ID</th>
                <th style={{ padding: '12px 14px' }}>Customer</th>
                <th style={{ padding: '12px 14px' }}>Garment Type</th>
                <th style={{ padding: '12px 14px' }}>Delivery Date</th>
                <th style={{ padding: '12px 14px' }}>Fitting Trial</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Balance Due</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.order_id} style={{ borderBottom: '1px solid #F3ECE4', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                      {ord.order_id}
                      {ord.priority && ord.priority !== 'Normal' && (
                        <div style={{ fontSize: '0.68rem', color: '#DC2626', fontWeight: 700, textTransform: 'uppercase' }}>
                          ● {ord.priority}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ord.customer_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{ord.customer_phone}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontWeight: 600 }}>{ord.garment_type}</span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        color: ord.is_overdue ? '#DC2626' : 'inherit',
                        fontWeight: ord.is_overdue ? 700 : 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {ord.is_overdue && <AlertTriangle size={13} color="#DC2626" />}
                        {ord.delivery_date}
                      </span>
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {ord.fitting_date || '—'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`status-pill ${getStatusClass(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 700 }}>
                      Rs. {ord.total_amount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 700, color: ord.balance_payment > 0 ? '#DC2626' : '#059669' }}>
                      Rs. {ord.balance_payment?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="btn btn-secondary btn-sm"
                          title="Open Job Card & Update Status"
                        >
                          <Eye size={13} /> View
                        </button>
                        <a
                          href={boutiqueService.getOrderPdfUrl(ord.order_id)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Download PDF Job Card"
                        >
                          <Download size={13} />
                        </a>
                        <button
                          onClick={() => handleDelete(ord.order_id)}
                          className="btn btn-danger btn-sm"
                          title="Delete Order"
                        >
                          <Trash2 size={13} />
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

      {/* Order Detail & Progression Stepper Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
