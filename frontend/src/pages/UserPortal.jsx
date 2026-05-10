import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, Calendar, DollarSign, LogOut, Heart, Clock, User,
  TrendingUp, Plus, MapPin, Droplets, Thermometer, Shield,
  Wallet, X, Download, FileCheck, Building2, BedDouble
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import './UserPortal.css';

const UserPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedApt, setSelectedApt] = useState(null);
  const [bedBookings, setBedBookings] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  useEffect(() => {
    const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
    if (!storedUser) { navigate('/login'); return; }
    setUser(storedUser);

    const token = localStorage.getItem('token');
    Promise.all([
      api.getAppointments(token).then(r => r.ok ? r.json() : []),
      api.getBedBookings(token).then(r => r.ok ? r.json() : [])
    ])
      .then(([aptData, bedData]) => {
        const mapped = (Array.isArray(aptData) ? aptData : []).map(apt => ({
          id: apt.id,
          doctorName: apt.doctor?.user?.name || 'Doctor',
          specialty: apt.doctor?.speciality || '',
          date: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-IN') : '',
          time: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
          status: apt.status,
          hospitalName: apt.doctor?.hospital?.name || 'Hospital',
          fee: apt.doctor?.fees || 0,
          reason: apt.reason,
        }));
        setAppointments(mapped);
        setBedBookings(Array.isArray(bedData) ? bedData : []);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const navItems = [
    { id: 'overview',     label: 'Health Center',    icon: <Activity /> },
    { id: 'appointments', label: 'My Appointments',  icon: <Calendar /> },
    { id: 'beds',         label: 'Hospital Beds',    icon: <BedDouble /> },
    { id: 'billing',      label: 'Bills & Payments', icon: <DollarSign /> },
    { id: 'profile',      label: 'My Profile',       icon: <User /> },
  ];

  const statusClass = (s) => {
    const m = { CONFIRMED: 'confirmed', PENDING: 'pending', COMPLETED: 'confirmed', CANCELLED: 'cancelled' };
    return m[s] || 'pending';
  };

  const bedStatusClass = (s) => {
    const m = { CONFIRMED: 'confirmed', PENDING: 'pending', CHECKED_IN: 'confirmed', CHECKED_OUT: 'cancelled', CANCELLED: 'cancelled' };
    return m[s] || 'pending';
  };

  if (loading) return (
    <div className="premium-loading-container">
      <div className="medical-loader"><div className="pulse-ring"></div><Heart size={40} /></div>
      <p className="loading-text">Loading your health data...</p>
    </div>
  );

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div className="sidebar-brand-container">
          <div className="elite-badge-mini" style={{ color: '#db2777' }}>
            <Heart size={20} fill="#db2777" /> <span>PATIENT PORTAL</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`nav-item ${activeTab === item.id ? 'active' : ''}`}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={() => navigate('/')}>
            <LogOut /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <header className="portal-header-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
          <div className="banner-content">
            <div className="portal-tag-elite">PATIENT PORTAL</div>
            <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
            <p><strong>{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</strong> in your history.</p>
          </div>
          <div className="header-score-card">
            <div className="score-viz-box" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}><TrendingUp size={28} /></div>
            <div className="score-text-box"><h3>{appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length}</h3><span>CONFIRMED</span></div>
          </div>
        </header>

        <div className="portal-container-fluid">
          <AnimatePresence mode="wait">

            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="stats-grid-premium">
                  {[
                    { label: 'Total Appointments', value: appointments.length, icon: <Calendar />, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Confirmed', value: appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length, icon: <Heart />, color: '#ef4444', bg: '#fef2f2' },
                    { label: 'Pending', value: appointments.filter(a => a.status === 'PENDING').length, icon: <Clock />, color: '#f59e0b', bg: '#fff7ed' },
                    { label: 'Total Spent', value: `₹${appointments.reduce((s, a) => s + (parseInt(a.fee) || 0), 0)}`, icon: <TrendingUp />, color: '#10b981', bg: '#ecfdf5' },
                  ].map((stat, i) => (
                    <div key={i} className="stat-card-new">
                      <div className="stat-icon-new" style={{ backgroundColor: stat.bg, color: stat.color }}>{stat.icon}</div>
                      <div className="stat-data-new"><h3>{stat.value}</h3><p>{stat.label}</p></div>
                    </div>
                  ))}
                </div>

                {appointments.length > 0 && (
                  <div className="portal-card-main">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 800 }}>Recent Appointments</h2>
                    {appointments.slice(0, 3).map((apt, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <strong>{apt.doctorName}</strong>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{apt.specialty} • {apt.date}</p>
                        </div>
                        <span className={`badge-elite ${statusClass(apt.status)}`}>{apt.status}</span>
                      </div>
                    ))}
                    <button className="btn-primary-elite" style={{ marginTop: '1.5rem' }} onClick={() => setActiveTab('appointments')}>
                      View All
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'appointments' && (
              <motion.div key="apt" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="portal-card-main">
                  <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>My Appointments</h2>
                    <button className="btn-primary-elite" onClick={() => navigate('/doctors')}><Plus size={18} /> Book New</button>
                  </div>
                  {appointments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                      <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                      <p>No appointments yet. <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/doctors')}>Book one now</button></p>
                    </div>
                  ) : (
                    <div className="sessions-table-wrapper">
                      <table className="elite-table-p" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th>Doctor</th><th>Specialty</th><th>Date & Time</th><th>Hospital</th><th>Status</th><th>Details</th></tr></thead>
                        <tbody>
                          {appointments.map((apt, i) => (
                            <tr key={i}>
                              <td><strong>{apt.doctorName}</strong></td>
                              <td>{apt.specialty}</td>
                              <td>{apt.date} • {apt.time}</td>
                              <td>{apt.hospitalName}</td>
                              <td><span className={`badge-elite ${statusClass(apt.status)}`}>{apt.status}</span></td>
                              <td><button className="btn-icon-lite" onClick={() => setSelectedApt(apt)}><FileCheck size={18} /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'beds' && (
              <motion.div key="beds" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="portal-card-main">
                  <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Hospital Bed Bookings</h2>
                    <button className="btn-primary-elite" onClick={() => navigate('/hospitals')}><Plus size={18} /> Book a Bed</button>
                  </div>
                  {bedBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                      <BedDouble size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                      <p>No bed bookings yet. <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/hospitals')}>Book one now</button></p>
                    </div>
                  ) : (
                    <div className="sessions-table-wrapper">
                      <table className="elite-table-p" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th>Hospital</th><th>Bed Type</th><th>Admission Date</th><th>Discharge Date</th><th>Status</th></tr></thead>
                        <tbody>
                          {bedBookings.map((b, i) => (
                            <tr key={i}>
                              <td><strong>{b.hospital?.name || '—'}</strong><br /><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.hospital?.city || ''}</span></td>
                              <td>{b.bedType}</td>
                              <td>{b.admissionDate ? new Date(b.admissionDate).toLocaleDateString('en-IN') : '—'}</td>
                              <td>{b.dischargeDate ? new Date(b.dischargeDate).toLocaleDateString('en-IN') : '—'}</td>
                              <td><span className={`badge-elite ${bedStatusClass(b.status)}`}>{b.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div key="billing" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="portal-card-main">
                  <div className="billing-summary-grid">
                    <div className="billing-stat-box"><span>Total Spent</span><h3>₹{appointments.reduce((s, a) => s + (parseInt(a.fee) || 0), 0)}</h3></div>
                    <div className="billing-stat-box"><span>Appointments</span><h3>{appointments.length}</h3></div>
                    <div className="billing-stat-box"><span>Confirmed</span><h3>{appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length}</h3></div>
                  </div>
                  <h2 style={{ margin: '2rem 0 1rem' }}>Transaction History</h2>
                  {appointments.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No transactions yet.</p>
                  ) : (
                    <div className="billing-ledger">
                      {appointments.map((apt, i) => (
                        <div key={i} className="ledger-item">
                          <div className="ledger-info">
                            <div className="ledger-icon"><Wallet size={18} /></div>
                            <div><strong>Consultation — {apt.doctorName}</strong><p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{apt.date} • {apt.hospitalName}</p></div>
                          </div>
                          <div className="ledger-amount">
                            <strong>₹{apt.fee}</strong>
                            <button onClick={() => setSelectedApt(apt)} className="btn-text-elite">View Bill</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="portal-card-main">
                  <div className="profile-hero-elite">
                    <div className="profile-avatar-large"><User size={40} /></div>
                    <div className="profile-hero-info">
                      <h2>{user?.name}</h2>
                      <p>{user?.email}</p>
                      <span className="profile-badge-elite">VERIFIED PATIENT</span>
                    </div>
                  </div>
                  <div className="profile-details-grid">
                    {[
                      { label: 'Full Name', value: user?.name, icon: <User /> },
                      { label: 'Email', value: user?.email, icon: <Building2 /> },
                      { label: 'Phone', value: user?.phone || 'Not set', icon: <MapPin /> },
                      { label: 'Role', value: user?.role, icon: <Shield /> },
                    ].map((item, i) => (
                      <div key={i} className="profile-info-card">
                        <div className="pic-icon">{item.icon}</div>
                        <div className="pic-data"><span>{item.label}</span><strong>{item.value}</strong></div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selectedApt && (
          <div className="elite-detail-overlay" onClick={() => setSelectedApt(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="elite-detail-card"
              onClick={e => e.stopPropagation()}
            >
              <div className="detail-card-header">
                <div className="brand-acc-mini"><Heart size={16} fill="#db2777" color="#db2777" /> <span>APPOINTMENT RECEIPT</span></div>
                <button className="close-btn-p" onClick={() => setSelectedApt(null)}><X size={18} /></button>
              </div>
              <div className="receipt-content-area">
                <div className="receipt-main-title">
                  <h2>Invoice & Session Summary</h2>
                  <div className="paid-stamp-elite">{selectedApt.status}</div>
                </div>
                <div className="receipt-grid">
                  <div className="r-section"><label>PATIENT</label><p>{user?.name}</p></div>
                  <div className="r-section"><label>DOCTOR</label><p>{selectedApt.doctorName}</p></div>
                  <div className="r-section"><label>HOSPITAL</label><p>{selectedApt.hospitalName}</p></div>
                  <div className="r-section"><label>DATE & TIME</label><p>{selectedApt.date} • {selectedApt.time}</p></div>
                  <div className="r-section"><label>REASON</label><p>{selectedApt.reason}</p></div>
                  <div className="r-section"><label>SPECIALTY</label><p>{selectedApt.specialty}</p></div>
                </div>
                <div className="divider-dashed"></div>
                <div className="billing-table-elite">
                  <div className="bt-row"><span>Consultation Fee</span><strong>₹{selectedApt.fee}</strong></div>
                  <div className="bt-row"><span>Facility Charge</span><strong>₹150</strong></div>
                  <div className="bt-row"><span>Service Tax (5%)</span><strong>₹{(parseInt(selectedApt.fee) * 0.05).toFixed(0)}</strong></div>
                  <div className="bt-total"><span>Total</span><h3>₹{parseInt(selectedApt.fee) + 150 + parseInt((parseInt(selectedApt.fee) * 0.05).toFixed(0))}</h3></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .portal-layout { display: flex; height: 100vh; background: #f8fafc; overflow: hidden; }
        .portal-sidebar { width: 280px; background: white; border-right: 1px solid #f1f5f9; display: flex; flex-direction: column; padding: 2rem 1.5rem; }
        .nav-item { display: flex; align-items: center; gap: 1rem; width: 100%; padding: 1rem 1.5rem; border-radius: 12px; border: none; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; margin-bottom: 0.5rem; }
        .nav-item.active { background: #fdf2f8; color: #db2777; }
        .portal-header-banner { padding: 4rem 3rem; color: white; display: flex; justify-content: space-between; align-items: center; }
        .portal-container-fluid { padding: 3rem; }
        .stats-grid-premium { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
        .stat-card-new { background: white; padding: 1.5rem; border-radius: 2rem; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 1.5rem; }
        .stat-icon-new { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-data-new h3 { font-size: 1.5rem; font-weight: 900; margin: 0; color: #1e293b; }
        .stat-data-new p { margin: 0; font-size: 0.8rem; color: #64748b; font-weight: 600; }
        .portal-card-main { background: white; border-radius: 2rem; padding: 2.5rem; border: 1px solid #f1f5f9; margin-bottom: 2rem; }
        .elite-table-p th { text-align: left; padding: 1rem; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .elite-table-p td { padding: 1.25rem 1rem; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; }
        .badge-elite { padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .badge-elite.confirmed { background: #dcfce7; color: #166534; }
        .badge-elite.pending { background: #fef9c3; color: #854d0e; }
        .badge-elite.cancelled { background: #fee2e2; color: #991b1b; }
        .btn-icon-lite { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; color: #64748b; cursor: pointer; }
        .btn-primary-elite { background: #1e3a8a; color: white; border: none; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
        .billing-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .billing-stat-box { background: #f8fafc; padding: 1.5rem; border-radius: 1.5rem; border: 1px solid #e2e8f0; }
        .billing-stat-box span { color: #64748b; font-size: 0.85rem; font-weight: 700; }
        .billing-stat-box h3 { font-size: 1.5rem; font-weight: 900; margin-top: 0.5rem; color: #1e293b; }
        .billing-ledger { background: white; border-radius: 2rem; border: 1px solid #f1f5f9; overflow: hidden; }
        .ledger-item { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid #f8fafc; }
        .ledger-info { display: flex; gap: 1.5rem; align-items: center; }
        .ledger-icon { background: #fdf2f8; color: #db2777; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ledger-amount { text-align: right; }
        .btn-text-elite { background: none; border: none; color: #3b82f6; font-weight: 800; cursor: pointer; display: block; font-size: 0.8rem; margin-top: 0.25rem; }
        .profile-hero-elite { display: flex; align-items: center; gap: 2rem; background: #f8fafc; padding: 2.5rem; border-radius: 2rem; margin-bottom: 3rem; }
        .profile-avatar-large { width: 100px; height: 100px; background: white; border-radius: 50%; border: 4px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
        .profile-hero-info h2 { font-size: 1.8rem; font-weight: 900; color: #1e293b; margin: 0; }
        .profile-hero-info p { color: #64748b; margin: 0.5rem 0; }
        .profile-badge-elite { background: #dcfce7; color: #166534; padding: 0.35rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 900; }
        .profile-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .profile-info-card { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 1.5rem; border-radius: 1.5rem; border: 1px solid #f1f5f9; }
        .pic-icon { width: 45px; height: 45px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #1e3a8a; flex-shrink: 0; }
        .pic-data span { font-size: 0.8rem; color: #94a3b8; font-weight: 700; display: block; }
        .pic-data strong { font-size: 1rem; color: #1e293b; font-weight: 800; word-break: break-all; }
        .elite-detail-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(12px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .elite-detail-card { background: white; width: 100%; max-width: 550px; border-radius: 2.5rem; padding: 3rem; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.3); }
        .detail-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .brand-acc-mini { display: flex; align-items: center; gap: 0.5rem; font-weight: 900; font-size: 0.75rem; color: #db2777; letter-spacing: 1px; }
        .close-btn-p { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; }
        .receipt-main-title { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .receipt-main-title h2 { font-size: 1.5rem; font-weight: 900; color: #1e293b; margin: 0; }
        .paid-stamp-elite { padding: 0.4rem 1.2rem; border: 3px solid #10b981; color: #10b981; font-weight: 900; font-size: 0.85rem; transform: rotate(-15deg); border-radius: 8px; opacity: 0.8; }
        .receipt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .r-section label { display: block; font-size: 0.65rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
        .r-section p { font-weight: 800; color: #1e293b; font-size: 0.9rem; margin: 0; }
        .divider-dashed { height: 1px; border-top: 2px dashed #f1f5f9; margin-bottom: 2rem; }
        .bt-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: #64748b; font-weight: 600; font-size: 0.9rem; }
        .bt-total { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f8fafc; display: flex; justify-content: space-between; align-items: center; }
        .bt-total h3 { font-size: 1.5rem; font-weight: 900; color: #1e293b; margin: 0; }
        .elite-badge-mini { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; font-size: 0.9rem; letter-spacing: 0.05em; }
        .sidebar-brand-container { margin-bottom: 2rem; }
        .sidebar-footer { margin-top: auto; }
        .portal-tag-elite { font-size: 0.7rem; font-weight: 800; letter-spacing: 2px; opacity: 0.7; margin-bottom: 0.5rem; }
        .banner-content h1 { font-size: 2rem; font-weight: 900; margin: 0.5rem 0; }
        .banner-content p { opacity: 0.8; margin: 0; }
        .header-score-card { display: flex; align-items: center; gap: 1.5rem; background: rgba(255,255,255,0.08); padding: 1.5rem 2rem; border-radius: 1.5rem; }
        .score-viz-box { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .score-text-box h3 { font-size: 1.75rem; font-weight: 900; margin: 0; color: white; }
        .score-text-box span { font-size: 0.65rem; font-weight: 800; letter-spacing: 1px; opacity: 0.7; color: white; }
        .card-header-flex { display: flex; justify-content: space-between; align-items: center; }
        .sessions-table-wrapper { overflow-x: auto; }
        .premium-loading-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; gap: 1rem; }
        .medical-loader { position: relative; display: flex; align-items: center; justify-content: center; width: 80px; height: 80px; }
        .pulse-ring { width: 60px; height: 60px; border: 4px solid #3b82f6; border-radius: 50%; position: absolute; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
        .loading-text { color: #64748b; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default UserPortal;
