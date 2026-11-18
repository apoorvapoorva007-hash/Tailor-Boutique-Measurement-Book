import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Edit2, Trash2, Eye, 
  Phone, Mail, MapPin, Calendar, PlusCircle, Check, X, Ruler, ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { boutiqueService } from '../services/api';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomerForView, setSelectedCustomerForView] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    gender: 'Female',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCustomers = async (query = '') => {
    setLoading(true);
    try {
      const data = await boutiqueService.getCustomers(query);
      setCustomers(data);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, [search]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      address: '',
      gender: 'Female',
      notes: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      full_name: cust.full_name || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      gender: cust.gender || 'Female',
      notes: cust.notes || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.phone.trim()) {
      setFormError('Customer full name and phone number are required.');
      return;
    }

    try {
      if (editingCustomer) {
        await boutiqueService.updateCustomer(editingCustomer.customer_id, formData);
        setSuccessMsg(`Customer ${editingCustomer.full_name} updated successfully!`);
      } else {
        const created = await boutiqueService.createCustomer(formData);
        setSuccessMsg(`Customer ${created.full_name} registered with ID ${created.customer_id}!`);
      }
      setModalOpen(false);
      fetchCustomers(search);
    } catch (err) {
      setFormError(typeof err === 'string' ? err : 'Error saving customer details.');
    }
  };

  const handleDelete = async (cust) => {
    if (!window.confirm(`Are you sure you want to delete customer ${cust.full_name} (${cust.customer_id})?`)) return;
    try {
      await boutiqueService.deleteCustomer(cust.customer_id);
      setSuccessMsg(`Customer ${cust.customer_id} removed.`);
      fetchCustomers(search);
    } catch {
      alert('Failed to delete customer.');
    }
  };

  const handleViewDetails = async (customerId) => {
    try {
      const details = await boutiqueService.getCustomer(customerId);
      setSelectedCustomerForView(details);
    } catch {
      alert('Could not load customer details.');
    }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Customer Management
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Manage client profiles, contact information, measurement books, and order history.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <UserPlus size={16} /> Add New Customer
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      {/* Search Bar */}
      <div className="boutique-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, phone number, customer ID, or email..."
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.92rem' }}
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Customers Table */}
      <div className="boutique-card" style={{ padding: '20px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 14px' }}>Customer ID</th>
                <th style={{ padding: '12px 14px' }}>Full Name</th>
                <th style={{ padding: '12px 14px' }}>Phone Number</th>
                <th style={{ padding: '12px 14px' }}>Email</th>
                <th style={{ padding: '12px 14px' }}>Registered</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Measurements</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Orders</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.customer_id} style={{ borderBottom: '1px solid #F3ECE4', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                      {c.customer_id}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.full_name}</div>
                      {c.address && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.address}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Phone size={13} color="var(--text-muted)" /> {c.phone}
                      </span>
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                      {c.email || '—'}
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {c.registration_date}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <button
                        onClick={() => navigate('/measurements', { state: { customerId: c.customer_id } })}
                        style={{
                          backgroundColor: '#FAF0EE',
                          color: 'var(--primary)',
                          border: '1px solid #EADAD5',
                          borderRadius: '12px',
                          padding: '3px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {c.measurement_profiles || 0} Profiles
                      </button>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <button
                        onClick={() => navigate('/orders', { state: { customerId: c.customer_id } })}
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                          borderRadius: '12px',
                          padding: '3px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {c.total_orders || 0} Orders
                      </button>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleViewDetails(c.customer_id)}
                          className="btn btn-secondary btn-sm"
                          title="View customer file & history"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="btn btn-secondary btn-sm"
                          title="Edit details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="btn btn-danger btn-sm"
                          title="Delete customer"
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

      {/* Add / Edit Customer Modal */}
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
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(62, 31, 25, 0.25)',
            border: '1px solid var(--beige-border)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--beige-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAF6F0'
            }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                {editingCustomer ? `Edit Customer (${editingCustomer.customer_id})` : 'Register New Boutique Customer'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {formError && (
                <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '16px' }}>
                  {formError}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Sanya Singhania"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sanya@example.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full delivery or residential address..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Client Fitting Preferences & Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Prefers boat necks, extra seam allowance, dry clean only fabrics."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Details Drawer/Modal */}
      {selectedCustomerForView && (
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
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(62, 31, 25, 0.25)',
            border: '1px solid var(--beige-border)'
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', backgroundColor: '#FAF6F0', borderBottom: '1px solid var(--beige-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Customer Dossier
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  {selectedCustomerForView.full_name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ID: {selectedCustomerForView.customer_id} | Member since {selectedCustomerForView.registration_date}
                </span>
              </div>
              <button onClick={() => setSelectedCustomerForView(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              {/* Contact info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: '#FAF6F0', padding: '16px', borderRadius: '10px', marginBottom: '24px' }}>
                <div>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Phone:</strong>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedCustomerForView.phone}</div>
                </div>
                <div>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email:</strong>
                  <div style={{ fontSize: '0.9rem' }}>{selectedCustomerForView.email || 'Not provided'}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Address:</strong>
                  <div style={{ fontSize: '0.88rem' }}>{selectedCustomerForView.address || 'No address on file'}</div>
                </div>
                {selectedCustomerForView.notes && (
                  <div style={{ gridColumn: 'span 2', borderTop: '1px dashed var(--beige-border)', paddingTop: '8px' }}>
                    <strong style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>Fitting Notes:</strong>
                    <div style={{ fontSize: '0.84rem' }}>{selectedCustomerForView.notes}</div>
                  </div>
                )}
              </div>

              {/* Saved Measurement Profiles */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Saved Measurement Profiles ({selectedCustomerForView.measurement_profiles_list?.length || 0})
                  </h4>
                  <button
                    onClick={() => {
                      const cid = selectedCustomerForView.customer_id;
                      setSelectedCustomerForView(null);
                      navigate('/measurements', { state: { customerId: cid } });
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Ruler size={13} /> Add Measurement
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {(selectedCustomerForView.measurement_profiles_list || []).map((prof) => (
                    <div key={prof.profile_id} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--beige-border)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>
                        {prof.profile_name || prof.garment_type}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Garment: {prof.garment_type} ({prof.unit})
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-body)', marginTop: '6px' }}>
                        {Object.entries(prof.measurements || {}).slice(0, 4).map(([k, v]) => `${k.replace('_', ' ')}: ${v}`).join(' | ')}
                      </div>
                    </div>
                  ))}
                  {(!selectedCustomerForView.measurement_profiles_list || selectedCustomerForView.measurement_profiles_list.length === 0) && (
                    <div style={{ gridColumn: 'span 2', fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No measurement profiles registered yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                  Customer Order History ({selectedCustomerForView.orders?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedCustomerForView.orders || []).map((ord) => (
                    <div key={ord.order_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAF6F0', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem' }}>
                      <div>
                        <strong>{ord.order_id}</strong> — {ord.garment_type}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Ordered: {ord.order_date} | Delivery: {ord.delivery_date}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="status-pill status-received" style={{ fontSize: '0.7rem' }}>{ord.status}</span>
                        <div style={{ fontWeight: 700, marginTop: '2px' }}>Rs. {ord.total_amount?.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                  {(!selectedCustomerForView.orders || selectedCustomerForView.orders.length === 0) && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No orders placed yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
