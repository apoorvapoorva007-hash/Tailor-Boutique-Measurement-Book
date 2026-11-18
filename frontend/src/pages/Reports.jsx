import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, Users, ShoppingBag, 
  IndianRupee, Clock, CheckCircle2, Truck, AlertTriangle, Calendar
} from 'lucide-react';
import { boutiqueService } from '../services/api';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [activeReport, setActiveReport] = useState('summary'); // 'summary' | 'customers' | 'orders' | 'pending' | 'completed' | 'revenue' | 'deliveries'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const data = await boutiqueService.getReports();
      setReportData(data);
    } catch {
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const summary = reportData?.summary || {};
  const customers = reportData?.customers || [];
  const orders = reportData?.orders || [];
  const pendingOrders = reportData?.pending_orders || [];
  const completedOrders = reportData?.completed_orders || [];
  const deliveries = reportData?.deliveries || [];
  const monthlyRevenue = reportData?.monthly_revenue || [];

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header with Export Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Boutique Reports & Analytics
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Generate executive summaries, client reports, order statuses, monthly revenue, and PDF exports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }} className="no-print">
          <a
            href={boutiqueService.getSummaryPdfUrl()}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            <Download size={16} /> Export Official PDF Report
          </a>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary"
          >
            <Printer size={16} /> Print Current Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="boutique-card" style={{ padding: '18px', borderLeft: '4px solid #6E382E' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Revenue</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
            Rs. {(summary.total_revenue || 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>From {summary.total_orders || 0} orders</span>
        </div>

        <div className="boutique-card" style={{ padding: '18px', borderLeft: '4px solid #DC2626' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Outstanding Balance</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#DC2626', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
            Rs. {(summary.total_balance_due || 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>To collect upon delivery</span>
        </div>

        <div className="boutique-card" style={{ padding: '18px', borderLeft: '4px solid #D97706' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Orders</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#D97706', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
            {summary.pending_orders || 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>In measurement & stitching</span>
        </div>

        <div className="boutique-card" style={{ padding: '18px', borderLeft: '4px solid #059669' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed & Delivered</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#059669', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
            {summary.completed_orders || 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Finished stitching jobs</span>
        </div>

        <div className="boutique-card" style={{ padding: '18px', borderLeft: '4px solid #B9736B' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registered Clients</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
            {summary.total_customers || 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Client measurement book</span>
        </div>
      </div>

      {/* Report Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }} className="no-print">
        {[
          { id: 'summary', label: 'Executive Summary' },
          { id: 'revenue', label: 'Monthly Revenue Report' },
          { id: 'customers', label: 'Customer Directory Report' },
          { id: 'orders', label: 'All Orders Report' },
          { id: 'pending', label: 'Pending Orders Report' },
          { id: 'completed', label: 'Completed Orders Report' },
          { id: 'deliveries', label: 'Delivery Schedule Report' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeReport === tab.id ? '1px solid var(--primary)' : '1px solid var(--beige-border)',
              backgroundColor: activeReport === tab.id ? 'var(--primary)' : '#FFFFFF',
              color: activeReport === tab.id ? '#FFFFFF' : 'var(--text-body)',
              fontWeight: activeReport === tab.id ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT CONTENT SECTIONS */}
      <div className="boutique-card printable-card" style={{ padding: '28px' }}>
        {/* Printable Header for physical paper */}
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                TAILOR & BOUTIQUE MANAGEMENT REPORT
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Bespoke Haute Couture Tailoring Management Book
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>Generated: <strong>{new Date().toLocaleDateString()}</strong></div>
              <div>Report Category: <strong>{activeReport.toUpperCase()}</strong></div>
            </div>
          </div>
        </div>

        {/* 1. EXECUTIVE SUMMARY TAB */}
        {activeReport === 'summary' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Business Financial Performance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#FAF6F0', padding: '18px', borderRadius: '10px', border: '1px solid var(--beige-border)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                  Revenue Breakdown
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #EAE0D6', fontSize: '0.86rem' }}>
                  <span>Gross Stitching Booking Value:</span>
                  <strong>Rs. {(summary.total_revenue || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #EAE0D6', fontSize: '0.86rem' }}>
                  <span>Advance Received:</span>
                  <strong style={{ color: '#059669' }}>Rs. {((summary.total_revenue || 0) - (summary.total_balance_due || 0)).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.86rem' }}>
                  <span>Pending Balance on Delivery:</span>
                  <strong style={{ color: '#DC2626' }}>Rs. {(summary.total_balance_due || 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div style={{ backgroundColor: '#FAF6F0', padding: '18px', borderRadius: '10px', border: '1px solid var(--beige-border)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                  Order Workflow Volume
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #EAE0D6', fontSize: '0.86rem' }}>
                  <span>Total Garments Booked:</span>
                  <strong>{summary.total_orders || 0} garments</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #EAE0D6', fontSize: '0.86rem' }}>
                  <span>In Production / Alteration:</span>
                  <strong>{summary.pending_orders || 0} orders</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.86rem' }}>
                  <span>Delivered to Clients:</span>
                  <strong style={{ color: '#059669' }}>{summary.completed_orders || 0} orders</strong>
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Recent Production Activity</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 10px' }}>Order ID</th>
                  <th style={{ padding: '8px 10px' }}>Customer</th>
                  <th style={{ padding: '8px 10px' }}>Garment</th>
                  <th style={{ padding: '8px 10px' }}>Delivery</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map(o => (
                  <tr key={o.order_id} style={{ borderBottom: '1px solid #F3ECE4' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--primary)' }}>{o.order_id}</td>
                    <td style={{ padding: '10px' }}>{o.customer_name}</td>
                    <td style={{ padding: '10px' }}>{o.garment_type}</td>
                    <td style={{ padding: '10px' }}>{o.delivery_date}</td>
                    <td style={{ padding: '10px' }}>{o.status}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>Rs. {o.total_amount?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. MONTHLY REVENUE REPORT */}
        {activeReport === 'revenue' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Monthly Revenue Statements</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 14px' }}>Month (YYYY-MM)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Booked Revenue (Rs.)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Estimated Share</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue.map((m) => (
                  <tr key={m.month} style={{ borderBottom: '1px solid #F3ECE4' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{m.month}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                      Rs. {m.revenue?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {summary.total_revenue > 0 ? ((m.revenue / summary.total_revenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. CUSTOMER REPORT */}
        {activeReport === 'customers' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Client Directory & Order Volume</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Customer ID</th>
                  <th style={{ padding: '10px 12px' }}>Full Name</th>
                  <th style={{ padding: '10px 12px' }}>Phone Number</th>
                  <th style={{ padding: '10px 12px' }}>Registered Date</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Total Orders</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Saved Profiles</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.customer_id} style={{ borderBottom: '1px solid #F3ECE4' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary)' }}>{c.customer_id}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{c.full_name}</td>
                    <td style={{ padding: '10px 12px' }}>{c.phone}</td>
                    <td style={{ padding: '10px 12px' }}>{c.registration_date}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{c.total_orders || 0}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{c.measurement_profiles || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. ALL ORDERS REPORT */}
        {activeReport === 'orders' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Complete Orders Register</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 10px' }}>Order ID</th>
                  <th style={{ padding: '8px 10px' }}>Customer</th>
                  <th style={{ padding: '8px 10px' }}>Garment</th>
                  <th style={{ padding: '8px 10px' }}>Order Date</th>
                  <th style={{ padding: '8px 10px' }}>Delivery</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.order_id} style={{ borderBottom: '1px solid #F3ECE4' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--primary)' }}>{o.order_id}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{o.customer_name}</td>
                    <td style={{ padding: '10px' }}>{o.garment_type}</td>
                    <td style={{ padding: '10px' }}>{o.order_date}</td>
                    <td style={{ padding: '10px' }}>{o.delivery_date}</td>
                    <td style={{ padding: '10px' }}>{o.status}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>Rs. {o.total_amount?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: o.balance_payment > 0 ? '#DC2626' : '#059669' }}>
                      Rs. {o.balance_payment?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. PENDING ORDERS REPORT */}
        {activeReport === 'pending' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#D97706' }}>
              Pending & In-Progress Orders ({pendingOrders.length})
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 10px' }}>Order ID</th>
                  <th style={{ padding: '8px 10px' }}>Customer</th>
                  <th style={{ padding: '8px 10px' }}>Garment</th>
                  <th style={{ padding: '8px 10px' }}>Delivery Date</th>
                  <th style={{ padding: '8px 10px' }}>Current Status</th>
                  <th style={{ padding: '8px 10px' }}>Fitting Date</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Balance Due</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((o) => (
                  <tr key={o.order_id} style={{ borderBottom: '1px solid #F3ECE4' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--primary)' }}>{o.order_id}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{o.customer_name}</td>
                    <td style={{ padding: '10px' }}>{o.garment_type}</td>
                    <td style={{ padding: '10px', color: o.is_overdue ? '#DC2626' : 'inherit', fontWeight: o.is_overdue ? 700 : 500 }}>
                      {o.delivery_date} {o.is_overdue && '(OVERDUE)'}
                    </td>
                    <td style={{ padding: '10px' }}>{o.status}</td>
                    <td style={{ padding: '10px' }}>{o.fitting_date || '—'}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#DC2626' }}>
                      Rs. {o.balance_payment?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. COMPLETED ORDERS REPORT */}
        {activeReport === 'completed' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#059669' }}>
              Completed & Delivered Orders ({completedOrders.length})
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 10px' }}>Order ID</th>
                  <th style={{ padding: '8px 10px' }}>Customer</th>
                  <th style={{ padding: '8px 10px' }}>Garment</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                  <th style={{ padding: '8px 10px' }}>Delivered On</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Cleared</th>
                </tr>
              </thead>
              <tbody>
                {completedOrders.map((o) => (
                  <tr key={o.order_id} style={{ borderBottom: '1px solid #F3ECE4' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--primary)' }}>{o.order_id}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{o.customer_name}</td>
                    <td style={{ padding: '10px' }}>{o.garment_type}</td>
                    <td style={{ padding: '10px' }}>{o.status}</td>
                    <td style={{ padding: '10px' }}>{o.delivery_date}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                      Rs. {o.total_amount?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. DELIVERY REPORT */}
        {activeReport === 'deliveries' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Delivery Schedule Master Register</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--beige-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 10px' }}>Delivery ID</th>
                  <th style={{ padding: '8px 10px' }}>Order ID</th>
                  <th style={{ padding: '8px 10px' }}>Customer</th>
                  <th style={{ padding: '8px 10px' }}>Garment</th>
                  <th style={{ padding: '8px 10px' }}>Scheduled Date</th>
                  <th style={{ padding: '8px 10px' }}>Delivery Status</th>
                  <th style={{ padding: '8px 10px' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.delivery_id} style={{ borderBottom: '1px solid #F3ECE4', backgroundColor: d.is_overdue && d.status !== 'Delivered' ? '#FFF5F5' : 'transparent' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--primary)' }}>{d.delivery_id}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{d.order_id}</td>
                    <td style={{ padding: '10px' }}>{d.customer_name}</td>
                    <td style={{ padding: '10px' }}>{d.garment_type}</td>
                    <td style={{ padding: '10px', color: d.is_overdue && d.status !== 'Delivered' ? '#DC2626' : 'inherit', fontWeight: d.is_overdue && d.status !== 'Delivered' ? 700 : 500 }}>
                      {d.scheduled_date} {d.is_overdue && d.status !== 'Delivered' && '(OVERDUE)'}
                    </td>
                    <td style={{ padding: '10px' }}>{d.status}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{d.delivery_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
