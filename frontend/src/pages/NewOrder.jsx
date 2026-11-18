import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, User, Ruler, Scissors, Calendar, IndianRupee, 
  Check, ArrowRight, Sparkles, FileText, Download, Printer, AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { boutiqueService } from '../services/api';

export default function NewOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState({});
  const [garmentTypes, setGarmentTypes] = useState([]);
  const [customerProfiles, setCustomerProfiles] = useState([]);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [garmentType, setGarmentType] = useState('Saree Blouse');
  const [measurementUnit, setMeasurementUnit] = useState('inches');
  const [measurements, setMeasurements] = useState({});
  
  // Fabric & Tailoring
  const [fabricType, setFabricType] = useState('Pure Raw Silk');
  const [fabricColor, setFabricColor] = useState('Red & Gold');
  const [fabricSource, setFabricSource] = useState('Provided by Customer');
  const [fabricLining, setFabricLining] = useState('Cotton Butter Crepe');
  const [stitchingInstructions, setStitchingInstructions] = useState('Princess cut with padding, deep back with dori and tassels.');

  // Dates & Priority
  const [fittingDate, setFittingDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [priority, setPriority] = useState('Normal');

  // Billing
  const [totalAmount, setTotalAmount] = useState(2500);
  const [advancePayment, setAdvancePayment] = useState(1000);
  const balancePayment = Math.max(0, (parseFloat(totalAmount) || 0) - (parseFloat(advancePayment) || 0));

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  // Load initial templates & customers
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tplRes, custRes] = await Promise.all([
        boutiqueService.getGarmentTemplates(),
        boutiqueService.getCustomers()
      ]);
      setTemplates(tplRes.templates || {});
      setGarmentTypes(tplRes.garment_types || []);
      setCustomers(custRes || []);

      // Default delivery date to 7 days from now
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDeliveryDate(d.toISOString().split('T')[0]);

      // Check if arriving from "Reuse in New Order"
      if (location.state?.prefilledProfile) {
        applyProfile(location.state.prefilledProfile);
      } else if (location.state?.customerId) {
        handleCustomerSelect(location.state.customerId, custRes);
      }
    } catch {
      setErrorMsg('Failed to initialize order form.');
    }
  };

  const handleCustomerSelect = async (customerId, custList = customers) => {
    setSelectedCustomerId(customerId);
    const cust = custList.find(c => c.customer_id === customerId);
    if (cust) {
      setCustomerName(cust.full_name);
      setCustomerPhone(cust.phone);

      // Fetch saved profiles for this customer to allow 1-click measurement autofill
      try {
        const profs = await boutiqueService.getGarmentProfiles({ customer_id: customerId });
        setCustomerProfiles(profs);
      } catch {
        setCustomerProfiles([]);
      }
    }
  };

  const applyProfile = (profile) => {
    setSelectedCustomerId(profile.customer_id);
    setCustomerName(profile.customer_name);
    setGarmentType(profile.garment_type);
    setMeasurementUnit(profile.unit || 'inches');
    setMeasurements(profile.measurements || {});
    if (profile.neck_design) {
      setStitchingInstructions(`Cut: ${profile.neck_design}. ${profile.notes || ''}`);
    }
  };

  // When garment changes and no custom measurements loaded, initialize defaults
  useEffect(() => {
    if (templates[garmentType] && Object.keys(measurements).length === 0) {
      const defs = {};
      (templates[garmentType].default_fields || []).forEach(f => {
        defs[f.key] = f.default;
      });
      setMeasurements(defs);
    }
  }, [garmentType, templates]);

  const handleGarmentChange = (newType) => {
    setGarmentType(newType);
    if (templates[newType]) {
      const defs = {};
      (templates[newType].default_fields || []).forEach(f => {
        defs[f.key] = f.default;
      });
      setMeasurements(defs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer for this order.');
      return;
    }
    if (!deliveryDate) {
      setErrorMsg('Please specify a delivery date.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const payload = {
      customer_id: selectedCustomerId,
      customer_name: customerName,
      customer_phone: customerPhone,
      garment_type: garmentType,
      measurements,
      measurement_unit: measurementUnit,
      fabric_details: {
        fabric_type: fabricType,
        color: fabricColor,
        source: fabricSource,
        lining: fabricLining
      },
      stitching_instructions: stitchingInstructions,
      fitting_date: fittingDate || null,
      delivery_date: deliveryDate,
      total_amount: parseFloat(totalAmount) || 0.0,
      advance_payment: parseFloat(advancePayment) || 0.0,
      priority,
      status: 'Order Received'
    };

    try {
      const result = await boutiqueService.createOrder(payload);
      setCreatedOrder(result);
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  // If order was created, show congratulations & job card view
  if (createdOrder) {
    return (
      <div style={{ padding: '36px 32px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div className="boutique-card" style={{ padding: '40px 32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#D1FAE5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Check size={36} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Order Booked Successfully
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 700, margin: '6px 0 12px' }}>
            Job Card: {createdOrder.order_id}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px' }}>
            New order for <strong>{createdOrder.customer_name}</strong> ({createdOrder.garment_type}) has been recorded. Delivery scheduled for <strong>{createdOrder.delivery_date}</strong>.
          </p>

          <div style={{ backgroundColor: '#FAF6F0', borderRadius: '12px', padding: '18px 24px', border: '1px solid var(--beige-border)', marginBottom: '28px', textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Customer:</span>
              <div style={{ fontWeight: 700 }}>{createdOrder.customer_name} ({createdOrder.customer_phone})</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Garment Type:</span>
              <div style={{ fontWeight: 700 }}>{createdOrder.garment_type}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Amount:</span>
              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Rs. {createdOrder.total_amount?.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Balance Due on Delivery:</span>
              <div style={{ fontWeight: 700, color: '#DC2626' }}>Rs. {createdOrder.balance_payment?.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a
              href={boutiqueService.getOrderPdfUrl(createdOrder.order_id)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              <Download size={16} /> Download Job Card PDF
            </a>
            <button
              onClick={() => {
                setCreatedOrder(null);
                navigate('/orders');
              }}
              className="btn btn-secondary"
            >
              View in All Orders <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentTemplate = templates[garmentType] || { default_fields: [] };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
          Create New Stitching Order
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          Book a custom tailoring order with measurements, fabric specifications, trial schedule, and billing.
        </p>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 1. Customer Selection */}
        <div className="boutique-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--primary)" /> Step 1: Customer Details
            </h3>
            {customerProfiles.length > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700 }}>
                ★ {customerProfiles.length} Saved Measurement Profile(s) Found
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Select Registered Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem', backgroundColor: '#FFF' }}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.full_name} ({c.customer_id} - {c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone number"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Order Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem', backgroundColor: '#FFF' }}
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent (+Expedite)</option>
                <option value="Bridal">Bridal / Haute Couture</option>
                <option value="Express">Express 24-48h</option>
              </select>
            </div>
          </div>

          {/* Quick measurement profile reuse pills */}
          {customerProfiles.length > 0 && (
            <div style={{ backgroundColor: '#FAF6F0', padding: '12px 16px', borderRadius: '8px', border: '1px dashed var(--beige-border)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Autofill from Client's Saved Measurement Book:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {customerProfiles.map((p) => (
                  <button
                    key={p.profile_id}
                    type="button"
                    onClick={() => applyProfile(p)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <Sparkles size={12} color="var(--primary)" />
                    Use {p.profile_name || p.garment_type} ({p.unit})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Garment & Dynamic Measurements */}
        <div className="boutique-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ruler size={18} color="var(--primary)" /> Step 2: Garment & Dynamic Measurements
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setMeasurementUnit('inches')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: measurementUnit === 'inches' ? '1px solid var(--primary)' : '1px solid var(--beige-border)',
                  backgroundColor: measurementUnit === 'inches' ? 'var(--primary-light)' : '#FFF',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Inches
              </button>
              <button
                type="button"
                onClick={() => setMeasurementUnit('cm')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: measurementUnit === 'cm' ? '1px solid var(--primary)' : '1px solid var(--beige-border)',
                  backgroundColor: measurementUnit === 'cm' ? 'var(--primary-light)' : '#FFF',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Centimetres
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px' }}>
              Garment Type *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {garmentTypes.map((gt) => (
                <button
                  key={gt}
                  type="button"
                  onClick={() => handleGarmentChange(gt)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: garmentType === gt ? '2px solid var(--primary)' : '1px solid var(--beige-border)',
                    backgroundColor: garmentType === gt ? 'var(--primary-light)' : '#FFF',
                    color: garmentType === gt ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: garmentType === gt ? 700 : 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}
                >
                  {gt}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Measurement Inputs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            backgroundColor: '#FAF6F0',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--beige-border)'
          }}>
            {(currentTemplate.default_fields || []).map((f) => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  {f.label} ({measurementUnit})
                </label>
                <input
                  type="number"
                  step={0.25}
                  value={measurements[f.key] ?? ''}
                  onChange={(e) => setMeasurements({ ...measurements, [f.key]: parseFloat(e.target.value) || '' })}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D6C2B4', fontSize: '0.9rem', fontWeight: 600, backgroundColor: '#FFF' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Fabric Details & Stitching Instructions */}
        <div className="boutique-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scissors size={18} color="var(--primary)" /> Step 3: Fabric & Tailoring Specifications
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Fabric Type
              </label>
              <input
                type="text"
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                placeholder="e.g. Pure Silk, Georgette, Velvet"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Color / Pattern
              </label>
              <input
                type="text"
                value={fabricColor}
                onChange={(e) => setFabricColor(e.target.value)}
                placeholder="e.g. Crimson Red with Gold Zari"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Fabric Source
              </label>
              <select
                value={fabricSource}
                onChange={(e) => setFabricSource(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem', backgroundColor: '#FFF' }}
              >
                <option value="Provided by Customer">Provided by Customer</option>
                <option value="Sourced by Boutique">Sourced by Boutique</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Lining Type
              </label>
              <input
                type="text"
                value={fabricLining}
                onChange={(e) => setFabricLining(e.target.value)}
                placeholder="e.g. Pure Cotton Butter Crepe"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Detailed Stitching Instructions & Cut Style
            </label>
            <textarea
              rows={3}
              value={stitchingInstructions}
              onChange={(e) => setStitchingInstructions(e.target.value)}
              placeholder="e.g. Princess cut, sweetheart front neck, deep back with heavy latkan tassels, 2-inch inner margin."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem' }}
            />
          </div>
        </div>

        {/* 4. Scheduling & Financials */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
          {/* Scheduling */}
          <div className="boutique-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--primary)" /> Step 4: Schedule
            </h3>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Delivery Date *
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Fitting Trial Date (Optional)
              </label>
              <input
                type="date"
                value={fittingDate}
                onChange={(e) => setFittingDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Financials & Advance Payment */}
          <div className="boutique-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IndianRupee size={18} color="var(--primary)" /> Step 5: Billing & Advance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Total Stitching Amount (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.95rem', fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Advance Received (Rs.)
                </label>
                <input
                  type="number"
                  min={0}
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.95rem', fontWeight: 700 }}
                />
              </div>
            </div>

            <div style={{ backgroundColor: '#FAF6F0', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--beige-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Balance to Collect on Delivery:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: balancePayment > 0 ? '#DC2626' : '#059669' }}>
                Rs. {balancePayment.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '14px 36px', fontSize: '1rem' }}
          >
            <ShoppingBag size={18} />
            <span>{loading ? 'Creating Order...' : 'Book Order & Generate Job Card'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
