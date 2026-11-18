import React, { useState, useEffect } from 'react';
import { 
  Ruler, Plus, Trash2, Save, ShoppingBag, Eye, 
  Search, Check, RefreshCw, Scissors, Sparkles, User, FileText, ArrowRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { boutiqueService } from '../services/api';

export default function Measurements() {
  const navigate = useNavigate();
  const location = useLocation();

  const [templates, setTemplates] = useState({});
  const [garmentTypes, setGarmentTypes] = useState([]);
  const [selectedGarment, setSelectedGarment] = useState('Saree Blouse');
  const [unit, setUnit] = useState('inches'); // 'inches' | 'cm'
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [profileName, setProfileName] = useState('');
  
  // Dynamic fields state
  const [measurements, setMeasurements] = useState({});
  const [customFields, setCustomFields] = useState([]); // [{key, label, value, unit}]
  const [neckDesign, setNeckDesign] = useState('');
  const [sleeveStyle, setSleeveStyle] = useState('');
  const [notes, setNotes] = useState('');

  // Saved profiles & history
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [searchHistory, setSearchHistory] = useState('');
  const [editingProfileId, setEditingProfileId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Load Templates, Customers, and Saved Profiles on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [tplRes, custRes, profRes] = await Promise.all([
        boutiqueService.getGarmentTemplates(),
        boutiqueService.getCustomers(),
        boutiqueService.getGarmentProfiles()
      ]);
      setTemplates(tplRes.templates || {});
      setGarmentTypes(tplRes.garment_types || []);
      setCustomers(custRes || []);
      setSavedProfiles(profRes || []);

      // If customer preselected from route
      if (location.state?.customerId) {
        setSelectedCustomerId(location.state.customerId);
        const c = custRes.find(item => item.customer_id === location.state.customerId);
        if (c) setCustomerName(c.full_name);
      }
    } catch (err) {
      setErrorMsg('Failed to load measurement templates.');
    }
  };

  // 2. Initialize default fields when garment type changes
  useEffect(() => {
    if (!editingProfileId && templates[selectedGarment]) {
      const defaultFields = templates[selectedGarment].default_fields || [];
      const initVals = {};
      defaultFields.forEach(f => {
        initVals[f.key] = unit === 'cm' ? Math.round(f.default * 2.54 * 2) / 2 : f.default;
      });
      setMeasurements(initVals);
      setProfileName(`${selectedGarment} Measurement`);
    }
  }, [selectedGarment, templates]);

  // Handle unit toggle with live value conversion
  const handleUnitToggle = (newUnit) => {
    if (newUnit === unit) return;
    const factor = newUnit === 'cm' ? 2.54 : 1 / 2.54;
    
    // Convert standard fields
    const convertedMeas = {};
    Object.keys(measurements).forEach(k => {
      const val = parseFloat(measurements[k]);
      convertedMeas[k] = isNaN(val) ? '' : Math.round(val * factor * 4) / 4;
    });
    setMeasurements(convertedMeas);

    // Convert custom fields
    const convertedCustom = customFields.map(f => {
      const val = parseFloat(f.value);
      return {
        ...f,
        unit: newUnit,
        value: isNaN(val) ? f.value : Math.round(val * factor * 4) / 4
      };
    });
    setCustomFields(convertedCustom);
    setUnit(newUnit);
  };

  // Add custom measurement field
  const handleAddCustomField = () => {
    const key = `custom_${Date.now()}`;
    setCustomFields([
      ...customFields,
      { key, label: 'Custom Dimension', value: unit === 'cm' ? 25.0 : 10.0, unit }
    ]);
  };

  const handleRemoveCustomField = (index) => {
    const updated = [...customFields];
    updated.splice(index, 1);
    setCustomFields(updated);
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  // Save measurement profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer for this measurement profile.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      customer_id: selectedCustomerId,
      customer_name: customerName,
      garment_type: selectedGarment,
      profile_name: profileName || `${selectedGarment} Measurement`,
      unit,
      measurements,
      custom_fields: customFields,
      neck_design: neckDesign,
      sleeve_style: sleeveStyle,
      notes
    };

    try {
      if (editingProfileId) {
        await boutiqueService.updateGarmentProfile(editingProfileId, payload);
        setSuccessMsg(`Measurement profile for ${selectedGarment} updated successfully!`);
      } else {
        await boutiqueService.createGarmentProfile(payload);
        setSuccessMsg(`New measurement profile saved to Boutique Book!`);
      }

      // Refresh profiles
      const updatedList = await boutiqueService.getGarmentProfiles();
      setSavedProfiles(updatedList);
      setEditingProfileId(null);
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Error saving measurements.');
    } finally {
      setLoading(false);
    }
  };

  // Load existing profile into form
  const handleLoadProfileToEdit = (profile) => {
    setEditingProfileId(profile.profile_id);
    setSelectedGarment(profile.garment_type);
    setSelectedCustomerId(profile.customer_id);
    setCustomerName(profile.customer_name);
    setProfileName(profile.profile_name);
    setUnit(profile.unit || 'inches');
    setMeasurements(profile.measurements || {});
    setCustomFields(profile.custom_fields || []);
    setNeckDesign(profile.neck_design || '');
    setSleeveStyle(profile.sleeve_style || '');
    setNotes(profile.notes || '');
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1-Click Reuse in New Order
  const handleReuseInOrder = (profile) => {
    navigate('/new-order', {
      state: {
        prefilledProfile: profile,
        customerId: profile.customer_id,
        garmentType: profile.garment_type
      }
    });
  };

  // Delete profile
  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm(`Delete measurement profile ${profileId}?`)) return;
    try {
      await boutiqueService.deleteGarmentProfile(profileId);
      setSavedProfiles(savedProfiles.filter(p => p.profile_id !== profileId));
      setSuccessMsg('Profile deleted successfully.');
    } catch {
      setErrorMsg('Failed to delete profile.');
    }
  };

  const currentTemplate = templates[selectedGarment] || { default_fields: [], style_options: [] };

  const filteredHistory = savedProfiles.filter(p => {
    const q = searchHistory.toLowerCase();
    return (
      p.customer_name?.toLowerCase().includes(q) ||
      p.customer_id?.toLowerCase().includes(q) ||
      p.garment_type?.toLowerCase().includes(q) ||
      p.profile_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            <Ruler size={14} /> Core Dynamic Feature
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Dynamic Measurement Book
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Create bespoke measurement profiles for any garment, toggle inches & centimetres, add custom dimensions, and reuse with 1 click.
          </p>
        </div>

        {/* Tab switchers */}
        <div style={{
          display: 'flex',
          backgroundColor: '#FAF6F0',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--beige-border)'
        }}>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'create' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'create' ? '#FFFFFF' : 'var(--text-body)',
              boxShadow: activeTab === 'create' ? '0 2px 6px rgba(110, 56, 46, 0.25)' : 'none'
            }}
          >
            {editingProfileId ? 'Edit Measurement' : 'Record Measurements'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'history' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'history' ? '#FFFFFF' : 'var(--text-body)',
              boxShadow: activeTab === 'history' ? '0 2px 6px rgba(110, 56, 46, 0.25)' : 'none'
            }}
          >
            Measurement Book Archive ({savedProfiles.length})
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: RECORD / EDIT MEASUREMENTS FORM                         */}
      {/* ============================================================== */}
      {activeTab === 'create' && (
        <form onSubmit={handleSaveProfile}>
          {/* 1. Garment Selector Ribbon */}
          <div className="boutique-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>
              Step 1: Select Garment Template
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px'
            }}>
              {garmentTypes.map((gt) => {
                const isSelected = selectedGarment === gt;
                return (
                  <button
                    key={gt}
                    type="button"
                    onClick={() => {
                      setSelectedGarment(gt);
                      setEditingProfileId(null);
                    }}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--beige-border)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Scissors size={18} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span>{gt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Customer Assignment & Unit Selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Customer & Profile Details */}
            <div className="boutique-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
                Step 2: Customer & Profile Info
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Select Customer *
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setSelectedCustomerId(cid);
                      const cust = customers.find(c => c.customer_id === cid);
                      if (cust) setCustomerName(cust.full_name);
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--beige-border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="">-- Choose Existing Customer --</option>
                    {customers.map((c) => (
                      <option key={c.customer_id} value={c.customer_id}>
                        {c.full_name} ({c.customer_id} - {c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Profile / Garment Nickname
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Bridal Silk Blouse, Casual Kurti"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--beige-border)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Measurement Unit Selector */}
            <div className="boutique-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>Measurement Unit:</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Auto-converts values</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleUnitToggle('inches')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: unit === 'inches' ? '2px solid var(--primary)' : '1px solid var(--beige-border)',
                    backgroundColor: unit === 'inches' ? 'var(--primary-light)' : '#FFFFFF',
                    color: unit === 'inches' ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Inches (in)
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle('cm')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: unit === 'cm' ? '2px solid var(--primary)' : '1px solid var(--beige-border)',
                    backgroundColor: unit === 'cm' ? 'var(--primary-light)' : '#FFFFFF',
                    color: unit === 'cm' ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Centimetres (cm)
                </button>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Currently measuring in <strong>{unit.toUpperCase()}</strong>
              </div>
            </div>
          </div>

          {/* 3. Dynamic Garment Measurement Fields */}
          <div className="boutique-card" style={{ padding: '28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Step 3: {selectedGarment} Measurements ({unit})
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {currentTemplate.description || 'Enter client anatomical measurements accurately.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={15} /> Add Custom Dimension
              </button>
            </div>

            {/* Standard Template Fields Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px'
            }}>
              {(currentTemplate.default_fields || []).map((f) => (
                <div key={f.key} style={{ backgroundColor: '#FAF6F0', padding: '14px', borderRadius: '10px', border: '1px solid var(--beige-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {f.label}
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {unit}
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step={unit === 'cm' ? 0.5 : 0.25}
                      value={measurements[f.key] ?? ''}
                      onChange={(e) => setMeasurements({ ...measurements, [f.key]: parseFloat(e.target.value) || '' })}
                      placeholder={f.placeholder}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #D6C2B4',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Custom Fields List */}
            {customFields.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--beige-border)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '14px' }}>
                  Custom Measurement Fields Added ({customFields.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {customFields.map((cf, idx) => (
                    <div key={cf.key || idx} style={{ backgroundColor: '#FDF2F0', padding: '12px 14px', borderRadius: '8px', border: '1px solid #F5D5CE', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={cf.label}
                        onChange={(e) => handleCustomFieldChange(idx, 'label', e.target.value)}
                        placeholder="Field Name"
                        style={{ flex: 1.5, padding: '8px 10px', borderRadius: '6px', border: '1px solid #E8B9B0', fontSize: '0.84rem' }}
                      />
                      <input
                        type="number"
                        step={0.25}
                        value={cf.value}
                        onChange={(e) => handleCustomFieldChange(idx, 'value', parseFloat(e.target.value) || '')}
                        placeholder="Value"
                        style={{ width: '80px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E8B9B0', fontSize: '0.84rem', fontWeight: 600 }}
                      />
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{unit}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(idx)}
                        style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Style Specifications & Notes */}
          <div className="boutique-card" style={{ padding: '24px', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
              Step 4: Style Preferences & Tailor Fitting Notes
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Neckline Design / Cut
                </label>
                <input
                  type="text"
                  value={neckDesign}
                  onChange={(e) => setNeckDesign(e.target.value)}
                  placeholder="e.g. Princess cut sweetheart neck with deep U back & dori"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Sleeve Style & Border
                </label>
                <input
                  type="text"
                  value={sleeveStyle}
                  onChange={(e) => setSleeveStyle(e.target.value)}
                  placeholder="e.g. Elbow length with 2-inch gold zari embroidery border"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Tailor Fitting Notes / Margin Requirements
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Keep 2-inch margin inside for future alterations, customer prefers snug fit around chest."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--beige-border)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {/* Form Submit & Actions */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
            {editingProfileId && (
              <button
                type="button"
                onClick={() => {
                  setEditingProfileId(null);
                  setProfileName('');
                }}
                className="btn btn-secondary"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              <Save size={18} />
              <span>{loading ? 'Saving...' : (editingProfileId ? 'Update Measurements' : 'Save to Measurement Book')}</span>
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MEASUREMENT BOOK ARCHIVE & REUSE                        */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div>
          {/* Search bar */}
          <div className="boutique-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              placeholder="Search by customer name, customer ID, or garment type..."
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.92rem' }}
            />
          </div>

          {/* Saved Profiles Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px'
          }}>
            {filteredHistory.length === 0 ? (
              <div className="boutique-card" style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Ruler size={36} color="var(--secondary)" style={{ margin: '0 auto 12px' }} />
                <h3>No measurement profiles found</h3>
                <p>Record your first customer measurement using the Record Measurements tab.</p>
              </div>
            ) : (
              filteredHistory.map((prof) => (
                <div key={prof.profile_id} className="boutique-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #F3ECE4', paddingBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'inline-block', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px' }}>
                        {prof.garment_type} ({prof.unit || 'inches'})
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        {prof.profile_name || `${prof.garment_type} Measurement`}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <User size={13} />
                        <span><strong>{prof.customer_name}</strong> ({prof.customer_id})</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {prof.updated_at || prof.created_at}
                    </span>
                  </div>

                  {/* Measurement Chips Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '16px',
                    flex: 1
                  }}>
                    {Object.entries(prof.measurements || {}).slice(0, 9).map(([k, v]) => (
                      <div key={k} style={{ backgroundColor: '#FAF6F0', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #EFE6DC' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {k.replace('_', ' ')}
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {v} {prof.unit || 'in'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Style Details */}
                  {(prof.neck_design || prof.notes) && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', backgroundColor: '#FDFBF7', padding: '8px 10px', borderRadius: '6px', marginBottom: '16px', borderLeft: '3px solid var(--secondary)' }}>
                      {prof.neck_design && <div><strong>Style:</strong> {prof.neck_design}</div>}
                      {prof.notes && <div style={{ marginTop: '2px' }}><strong>Note:</strong> {prof.notes}</div>}
                    </div>
                  )}

                  {/* Card Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleReuseInOrder(prof)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1.5 }}
                    >
                      <ShoppingBag size={14} /> Reuse in New Order
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadProfileToEdit(prof)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProfile(prof.profile_id)}
                      className="btn btn-danger btn-sm"
                      title="Delete profile"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
