import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Activity, Calendar, FileText, Video, Settings, LogOut, Heart, Clock, CheckCircle, 
  ChevronRight, TrendingUp, User, Lock, Bell, Search, Save, Download, Plus, MapPin, 
  Thermometer, Droplets, Shield, CreditCard, Bed, AlertCircle, RefreshCw, Trash2, Filter,
  Building2, Server, X, FileCheck, DollarSign, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './UserPortal.css';

const UserPortal = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedApt, setSelectedApt] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  useEffect(() => {
    const initPortal = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
          const savedApts = JSON.parse(localStorage.getItem('elite_appointments') || '[]');
          const defaultApts = [
            { id: 1, doctorName: 'Dr. Sarah Wilson', specialty: 'Cardiologist', time: '09:00 AM', date: '2024-05-12', status: 'Confirmed', hospitalName: 'Metro Health', fee: 1200 },
            { id: 2, doctorName: 'Dr. Michael Chen', specialty: 'Dermatology', time: '11:30 AM', date: '2024-05-15', status: 'Pending', hospitalName: 'City General', fee: 950 }
          ];
          setAppointments(savedApts.length > 0 ? savedApts : defaultApts);
          const eliteHospitals = JSON.parse(localStorage.getItem('elite_hospitals') || '[]');
          setHospitals(eliteHospitals);
        }
      } catch (e) { toast.error('Sync failed'); }
      finally { setTimeout(() => setLoading(false), 600); }
    };
    initPortal();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Health Center', icon: <Activity /> },
    { id: 'appointments', label: 'My Sessions', icon: <Calendar /> },
    { id: 'hubs', label: 'Facility Hubs', icon: <Building2 /> },
    { id: 'billing', label: 'Bills & Payments', icon: <DollarSign /> }, // ✅ REPLACED: Clinical Vault
    { id: 'profile', label: 'My Profile', icon: <User /> }, // ✅ REPLACED: Preferences
  ];

  if (loading) return (
    <div className="premium-loading-container">
      <div className="medical-loader"><div className="pulse-ring"></div><Heart size={40} /></div>
      <p className="loading-text">Synchronizing Patient Node...</p>
    </div>
  );

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div className="sidebar-brand-container">
          <div className="elite-badge-mini" style={{ color: '#db2777' }}>
            <Heart size={20} fill="#db2777" /> <span>ELITE PATIENT</span>
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
          <button className="nav-item logout-btn" onClick={() => window.location.href = '/'}>
            <LogOut /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <header className="portal-header-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
          <div className="banner-content">
            <div className="portal-tag-elite">SECURE PATIENT NODE</div>
            <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
            <p>Your health ecosystem is live. <strong>{appointments.length} active sessions</strong> scheduled.</p>
          </div>
          <div className="header-score-card">
            <div className="score-viz-box" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}><TrendingUp size={28} /></div>
            <div className="score-text-box"><h3>98%</h3><span>VITALITY</span></div>
          </div>
        </header>

        <div className="portal-container-fluid">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="stats-grid-premium">
                  {[{ label: 'Avg Heart Rate', value: '72 bpm', icon: <Heart />, color: '#ef4444', bg: '#fef2f2' }, { label: 'Oxygen Sat', value: '99%', icon: <Droplets />, color: '#3b82f6', bg: '#eff6ff' }, { label: 'Core Temp', value: '98.6°F', icon: <Thermometer />, color: '#f59e0b', bg: '#fff7ed' }, { label: 'Health Goal', value: '84%', icon: <TrendingUp />, color: '#10b981', bg: '#ecfdf5' }].map((stat, i) => (
                    <div key={i} className="stat-card-new">
                      <div className="stat-icon-new" style={{ backgroundColor: stat.bg, color: stat.color }}>{stat.icon}</div>
                      <div className="stat-data-new"><h3>{stat.value}</h3><p>{stat.label}</p></div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'appointments' && (
              <motion.div key="apt" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="portal-card-main">
                  <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Medical Sessions</h2>
                    <button className="btn-primary-elite" onClick={() => window.location.href = '/doctors'}><Plus size={18} /> New Appointment</button>
                  </div>
                  <div className="sessions-table-wrapper">
                    <table className="elite-table-p" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr><th>Doctor</th><th>Specialty</th><th>Date</th><th>Status</th><th>View Details</th></tr></thead>
                      <tbody>
                        {appointments.map((apt, i) => (
                          <tr key={i}>
                            <td><strong>{apt.doctorName}</strong></td>
                            <td>{apt.specialty}</td>
                            <td>{apt.date} • {apt.time}</td>
                            <td><span className={`badge-elite ${apt.status.toLowerCase()}`}>{apt.status}</span></td>
                            <td><button className="btn-icon-lite" onClick={() => setSelectedApt(apt)}><FileCheck size={18} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ✅ NEW TAB: BILLS & PAYMENTS */}
            {activeTab === 'billing' && (
              <motion.div key="billing" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="portal-card-main">
                  <div className="billing-summary-grid">
                    <div className="billing-stat-box"><span>Total Spent</span><h3>₹{appointments.reduce((sum, a) => sum + (parseInt(a.fee || 0) + 150), 0)}</h3></div>
                    <div className="billing-stat-box"><span>Active Payments</span><h3>{appointments.length}</h3></div>
                    <div className="billing-stat-box"><span>Verified Nodes</span><h3>100%</h3></div>
                  </div>
                  <h2 style={{ margin: '2rem 0' }}>Transaction History</h2>
                  <div className="billing-ledger">
                    {appointments.map((apt, i) => (
                      <div key={i} className="ledger-item">
                        <div className="ledger-info">
                          <div className="ledger-icon"><Wallet size={18} /></div>
                          <div><strong>Payment for {apt.doctorName}</strong><p>{apt.date} • {apt.hospitalName}</p></div>
                        </div>
                        <div className="ledger-amount">
                          <strong>₹{parseInt(apt.fee || 0) + parseInt(((apt.fee || 0) * 0.05).toFixed(0)) + 150}</strong>
                          <button onClick={() => setSelectedApt(apt)} className="btn-text-elite">View Bill</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ✅ NEW TAB: MY PROFILE */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="portal-card-main">
                  <div className="profile-hero-elite">
                    <div className="profile-avatar-large"><User size={40} /></div>
                    <div className="profile-hero-info">
                      <h2>{user?.name}</h2>
                      <p><Mail size={14} /> {user?.email}</p>
                      <span className="profile-badge-elite">VERIFIED PATIENT</span>
                    </div>
                  </div>
                  <div className="profile-details-grid">
                    {[
                      { label: 'Patient ID', value: user?.id?.slice(0, 8) || 'ELT-9921', icon: <Lock /> },
                      { label: 'Blood Group', value: 'O+', icon: <Heart /> },
                      { label: 'Core Weight', value: '72 KG', icon: <TrendingUp /> },
                      { label: 'Emergency Contact', value: '+91 99XXXXXX01', icon: <Phone /> }
                    ].map((item, i) => (
                      <div key={i} className="profile-info-card">
                        <div className="pic-icon">{item.icon}</div>
                        <div className="pic-data"><span>{item.label}</span><strong>{item.value}</strong></div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-edit-profile" onClick={() => toast.success('Profile Editing is restricted to verified nodes.')}>Update Medical Data</button>
                </div>
              </motion.div>
            )}

            {activeTab === 'hubs' && (
              <motion.div key="hubs" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="portal-card-main">
                  <h2 style={{ marginBottom: '3rem' }}>Facility Management</h2>
                  <div className="hospitals-stack-elite">
                    {hospitals.map((h, i) => (
                      <div key={i} className="stack-item-premium" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid #f1f5f9', borderRadius: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <div className="si-avatar" style={{ background: '#7c3aed', padding: '10px', borderRadius: '10px', color: 'white' }}><Building2 size={20} /></div>
                          <div className="si-info"><strong>{h.name}</strong><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{h.city} • Verified Hub</p></div>
                        </div>
                        <button className="btn-icon-lite" onClick={() => toast.success('Link Secured')}><Server size={18} /></button>
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
                <div className="brand-acc-mini"><Heart size={16} fill="#db2777" color="#db2777" /> <span>VITALITY SECURE</span></div>
                <button className="close-btn-p" onClick={() => setSelectedApt(null)}><X size={18} /></button>
              </div>

              <div className="receipt-content-area">
                <div className="receipt-main-title">
                  <h2>Invoice & Session Summary</h2>
                  <div className="paid-stamp-elite">PAID</div>
                </div>

                <div className="receipt-grid">
                  <div className="r-section"><label>PATIENT NODE</label><p>{user?.name}</p></div>
                  <div className="r-section"><label>CLINICIAN</label><p>{selectedApt.doctorName}</p></div>
                  <div className="r-section"><label>FACILITY</label><p>{selectedApt.hospitalName || 'Elite Medical Hub'}</p></div>
                  <div className="r-section"><label>DATE & TIME</label><p>{selectedApt.date} • {selectedApt.time}</p></div>
                </div>

                <div className="divider-dashed"></div>

                <div className="billing-table-elite">
                  <div className="bt-row"><span>Consultation Professional Fee</span><strong>₹{selectedApt.fee || '850'}</strong></div>
                  <div className="bt-row"><span>Digital Facility & Bed Allocation</span><strong>₹150</strong></div>
                  <div className="bt-row"><span>Service Tax & Processing (5%)</span><strong>₹{(parseInt(selectedApt.fee || 850) * 0.05).toFixed(0)}</strong></div>
                  <div className="bt-total"><span>Amount Paid (INR)</span><h3>₹{parseInt(selectedApt.fee || 850) + parseInt((parseInt(selectedApt.fee || 850) * 0.05).toFixed(0)) + 150}</h3></div>
                </div>

                <div className="receipt-footer-elite">
                  <div className="footer-meta">
                    <p><Shield size={12} /> Encrypted Digital Receipt</p>
                    <span>ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                  </div>
                  <button className="btn-download-premium" onClick={() => toast.success('Exporting Clinical Receipt...')}>
                    <Download size={18} /> Download PDF
                  </button>
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
        .stats-grid-premium { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
        .stat-card-new { background: white; padding: 1.5rem; border-radius: 2rem; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 1.5rem; }
        .stat-icon-new { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .elite-table-p th { text-align: left; padding: 1rem; color: #64748b; border-bottom: 1px solid #f1f5f9; }
        .elite-table-p td { padding: 1.5rem 1rem; border-bottom: 1px solid #f8fafc; }
        .badge-elite { padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
        .badge-elite.confirmed { background: #dcfce7; color: #166534; }
        .badge-elite.pending { background: #fef9c3; color: #854d0e; }
        
        .billing-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .billing-stat-box { background: #f8fafc; padding: 1.5rem; border-radius: 1.5rem; border: 1px solid #e2e8f0; }
        .billing-stat-box span { color: #64748b; font-size: 0.85rem; font-weight: 700; }
        .billing-stat-box h3 { font-size: 1.5rem; font-weight: 900; margin-top: 0.5rem; color: #1e293b; }
        .billing-ledger { background: white; border-radius: 2rem; border: 1px solid #f1f5f9; overflow: hidden; }
        .ledger-item { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid #f8fafc; }
        .ledger-info { display: flex; gap: 1.5rem; align-items: center; }
        .ledger-icon { background: #fdf2f8; color: #db2777; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .ledger-amount { text-align: right; }
        .btn-text-elite { background: none; border: none; color: #3b82f6; font-weight: 800; cursor: pointer; display: block; font-size: 0.8rem; margin-top: 0.25rem; }
        
        .profile-hero-elite { display: flex; align-items: center; gap: 2rem; background: #f8fafc; padding: 2.5rem; border-radius: 2rem; margin-bottom: 3rem; }
        .profile-avatar-large { width: 100px; height: 100px; background: white; border-radius: 50%; border: 4px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
        .profile-hero-info h2 { font-size: 1.8rem; font-weight: 900; color: #1e293b; }
        .profile-hero-info p { color: #64748b; display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0; }
        .profile-badge-elite { background: #dcfce7; color: #166534; padding: 0.35rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 900; }
        .profile-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
        .profile-info-card { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 1.5rem; border-radius: 1.5rem; border: 1px solid #f1f5f9; }
        .pic-icon { width: 45px; height: 45px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #1e3a8a; }
        .pic-data span { font-size: 0.8rem; color: #94a3b8; font-weight: 700; display: block; }
        .pic-data strong { font-size: 1.1rem; color: #1e293b; font-weight: 800; }
        .btn-edit-profile { width: 100%; padding: 1.25rem; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 15px; color: #64748b; font-weight: 800; cursor: pointer; transition: 0.2s; }
        
        .elite-detail-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .elite-detail-card { background: white; width: 100%; max-width: 550px; border-radius: 2.5rem; padding: 3rem; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.3); position: relative; overflow: hidden; }
        .detail-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .brand-acc-mini { display: flex; align-items: center; gap: 0.5rem; font-weight: 900; font-size: 0.75rem; color: #db2777; letter-spacing: 1px; }
        .close-btn-p { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; }
        .receipt-main-title { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .receipt-main-title h2 { font-size: 1.5rem; font-weight: 900; color: #1e293b; max-width: 250px; line-height: 1.2; margin: 0; }
        .paid-stamp-elite { padding: 0.4rem 1.2rem; border: 3px solid #10b981; color: #10b981; font-weight: 900; font-size: 1rem; transform: rotate(-15deg); border-radius: 8px; opacity: 0.8; }
        .receipt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .r-section label { display: block; font-size: 0.65rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
        .r-section p { font-weight: 800; color: #1e293b; font-size: 0.9rem; margin: 0; }
        .divider-dashed { height: 1px; border-top: 2px dashed #f1f5f9; margin-bottom: 2rem; }
        .bt-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: #64748b; font-weight: 600; font-size: 0.9rem; }
        .bt-total { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f8fafc; display: flex; justify-content: space-between; align-items: center; }
        .bt-total h3 { font-size: 1.5rem; font-weight: 900; color: #1e293b; margin: 0; }
        .receipt-footer-elite { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .footer-meta { display: flex; justify-content: space-between; align-items: center; color: #94a3b8; font-size: 0.7rem; font-weight: 700; }
        .btn-download-premium { width: 100%; padding: 1.1rem; background: #0f172a; color: white; border: none; border-radius: 15px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.75rem; cursor: pointer; transition: 0.3s; }
        .btn-download-premium:hover { background: #1e1b4b; transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

// Internal Helper
const Mail = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-10 11"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>;
const Phone = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

export default UserPortal;