import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, Clock, Scissors, CheckCircle2, 
  Truck, AlertTriangle, IndianRupee, ArrowRight, PlusCircle,
  Eye, RefreshCw, Calendar, Sparkles, TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { boutiqueService } from '../services/api';
import OrderDetailModal from './OrderDetailModal';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await boutiqueService.getDashboardStats();
      setData(res);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
        <RefreshCw size={32} className="spin-icon" color="var(--primary)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading Boutique Dashboard...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const recentOrders = data?.recent_orders || [];

  const statCards = [
    {
      label: 'Total Customers',
      value: metrics.total_customers ?? 0,
      icon: Users,
      color: '#6E382E',
      bg: '#FDF6F4',
      link: '/customers',
      subtext: 'Active boutique clients'
    },
    {
      label: 'Total Orders',
      value: metrics.total_orders ?? 0,
      icon: ShoppingBag,
      color: '#B9736B',
      bg: '#FAF0EE',
      link: '/orders',
      subtext: 'All recorded bookings'
    },
    {
      label: 'Pending Orders',
      value: metrics.pending_orders ?? 0,
      icon: Clock,
      color: '#D97706',
      bg: '#FEF3C7',
      link: '/orders?status=Order Received',
      subtext: 'Received & measurements'
    },
    {
      label: 'Orders in Progress',
      value: metrics.in_progress_orders ?? 0,
      icon: Scissors,
      color: '#2563EB',
      bg: '#EFF6FF',
      link: '/orders?status=Stitching in Progress',
      subtext: 'Stitching & trial fitting'
    },
    {
      label: 'Completed Orders',
      value: metrics.completed_orders ?? 0,
      icon: CheckCircle2,
      color: '#059669',
      bg: '#ECFDF5',
      link: '/orders?status=Completed',
      subtext: 'Ready for client pickup'
    },
    {
      label: 'Upcoming Deliveries',
      value: metrics.upcoming_deliveries ?? 0,
      icon: Truck,
      color: '#7C3AED',
      bg: '#F5F3FF',
      link: '/deliveries?filter=upcoming',
      subtext: 'Scheduled next 7 days'
    },
    {
      label: 'Overdue Deliveries',
      value: metrics.overdue_deliveries ?? 0,
      icon: AlertTriangle,
      color: '#DC2626',
      bg: '#FEF2F2',
      alert: metrics.overdue_deliveries > 0,
      link: '/deliveries?filter=overdue',
      subtext: metrics.overdue_deliveries > 0 ? 'Requires immediate action' : 'All deliveries on schedule'
    },
    {
      label: 'Total Revenue',
      value: `Rs. ${(metrics.total_revenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: '#43231C',
      bg: '#FAF5EE',
      link: '/reports',
      subtext: `Bal. Due: Rs. ${(metrics.balance_due || 0).toLocaleString('en-IN')}`
    },
  ];

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
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7A3D33 0%, #4D221A 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#FFFFFF',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(77, 34, 26, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px' }}>
            <Sparkles size={13} />
            <span>Haute Couture & Tailoring Management</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, margin: 0, color: '#FFF' }}>
            Welcome to Atelier Measurement Book
          </h1>
          <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px', maxWidth: '600px' }}>
            Manage custom client measurements, track stitching progress across all trial stages, and monitor delivery timelines with precision.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', zIndex: 2 }}>
          <Link to="/new-order" className="btn" style={{ backgroundColor: '#FFFFFF', color: 'var(--primary)', fontWeight: 700 }}>
            <PlusCircle size={16} /> New Order
          </Link>
          <Link to="/measurements" className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Scissors size={16} /> Measurement Book
          </Link>
        </div>
      </div>

      {/* 8 Stats Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="boutique-card"
              onClick={() => navigate(card.link)}
              style={{
                padding: '20px',
                cursor: 'pointer',
                borderLeft: card.alert ? '4px solid #DC2626' : `4px solid ${card.color}`,
                backgroundColor: card.alert ? '#FEF2F2' : '#FFFFFF',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: card.alert ? '#991B1B' : 'var(--text-muted)' }}>
                  {card.label}
                </span>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} />
                </div>
              </div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: card.alert ? '#991B1B' : 'var(--text-main)',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1.1,
                marginBottom: '6px'
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.74rem', color: card.alert ? '#DC2626' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{card.subtext}</span>
                <ArrowRight size={12} style={{ opacity: 0.6 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Monthly Orders & Revenue Trend */}
        <div className="boutique-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Monthly Orders & Revenue</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Performance trend over recent months</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
              <TrendingUp size={15} />
              <span>Interactive Analytics</span>
            </div>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthly_orders || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7A3D33" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#7A3D33" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E6DE" />
                <XAxis dataKey="month" stroke="#85746D" fontSize={12} />
                <YAxis yAxisId="left" stroke="#85746D" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#B9736B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E8DCD3', fontSize: '0.85rem' }} 
                  formatter={(val, name) => [name === 'revenue' ? `Rs. ${val}` : val, name === 'revenue' ? 'Revenue' : 'Orders']}
                />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#7A3D33" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="revenue" />
                <Bar yAxisId="left" dataKey="orders" fill="#B9736B" radius={[4, 4, 0, 0]} name="orders" barSize={24} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="boutique-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, marginBottom: '4px' }}>Order Status Breakdown</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Current workflow status distribution</p>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.status_distribution?.filter(s => s.count > 0) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {(charts.status_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E8DCD3', fontSize: '0.82rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Status Legend Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '10px' }}>
            {(charts.status_distribution?.filter(s => s.count > 0) || []).map((s, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-body)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                {s.name} ({s.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="boutique-card" style={{ padding: '24px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Recent Orders & Job Cards</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Latest client bookings and tailoring assignments</p>
          </div>
          <Link to="/orders" className="btn btn-secondary btn-sm">
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 14px' }}>Order ID</th>
                <th style={{ padding: '12px 14px' }}>Customer</th>
                <th style={{ padding: '12px 14px' }}>Garment</th>
                <th style={{ padding: '12px 14px' }}>Delivery Date</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No recent orders found. Click "New Order" to book your first client.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.order_id} style={{ borderBottom: '1px solid #F3ECE4', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                      {ord.order_id}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ord.customer_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{ord.customer_phone}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontWeight: 600 }}>{ord.garment_type}</span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ color: ord.is_overdue ? '#DC2626' : 'inherit', fontWeight: ord.is_overdue ? 700 : 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {ord.is_overdue && <AlertTriangle size={13} color="#DC2626" />}
                        {ord.delivery_date || 'TBD'}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`status-pill ${getStatusClass(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 700 }}>
                      Rs. {ord.total_amount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedOrder(ord)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={() => {
            fetchDashboardData();
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
