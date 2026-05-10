import React, { useState, useEffect } from 'react';
import {
  Building2, Bed, Users, Activity, Settings, LogOut, Search,
  RefreshCw, Shield, Lock, Save, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import './UserPortal.css';

const HospitalPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [bedBookings, setBedBookings] = useState([]);
  const [searchStaff, setSearchStaff] = useState('');
  const [settings, setSettings] = useState({ emsLinked: true, autoReporting: false });

  useEffect(() => {
    const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
    if (!storedUser) { window.location.href = '/login'; return; }

    const token = localStorage.getItem('token');
    const hId = storedUser.hospital?.id || storedUser.hospitalId || localStorage.getItem('hospitalId');
    setHospitalId(hId);

    if (hId) {
      api.getHospitalById(hId)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setHospital(data); })
        .catch(() => {});

      api.getHospitalDoctors(hId, token)
        .then(r => r.ok ? r.json() : [])
        .then(data => setDoctors(Array.isArray(data) ? data : []))
        .catch(() => {});

      api.getHospitalBedBookings(hId, token)
        .then(r => r.ok ? r.json() : [])
        .then(data => setBedBookings(Array.isArray(data) ? data : []))
        .catch(() => {});
    } else {
      // hospitalId not in stored user — fetch from backend using token
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      fetch(`${API_BASE}/hospitals`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then(async (allHospitals) => {
          // match by userId stored on hospital record
          const matched = allHospitals.find(h => h.userId === storedUser.id);
          if (!matched) { setHospital(storedUser); return; }
          const id = matched.id;
          setHospitalId(id);
          setHospital(matched);
          localStorage.setItem('hospitalId', id);

          const [docsRes, bedsRes] = await Promise.all([
            api.getHospitalDoctors(id, token),
            api.getHospitalBedBookings(id, token)
          ]);
          if (docsRes.ok) setDoctors(await docsRes.json());
          if (bedsRes.ok) setBedBookings(await bedsRes.json());
        })
        .catch(() => setHospital(storedUser));
    }

    setLoading(false);
  }, []);

  const filteredDoctors = doctors.filter(d =>
    (d.user?.name || d.name || '').toLowerCase().includes(searchStaff.toLowerCase()) ||
    (d.speciality || d.specialization || '').toLowerCase().includes(searchStaff.toLowerCase())
  );

  const navItems = [
    { id: 'overview', label: 'Operations',    icon: <Activity /> },
    { id: 'beds',     label: 'Bed Bookings',  icon: <Bed /> },
    { id: 'staff',    label: 'Doctors',       icon: <Users /> },
    { id: 'settings', label: 'Settings',      icon: <Settings /> },
  ];

  const statusClass = (s) => ({ CONFIRMED: 'confirmed', PENDING: 'pending', CHECKED_IN: 'confirmed', CANCELLED: 'cancelled', CHECKED_OUT: 'discharged' }[s] || 'pending');

  const updateBedStatus = async (bookingId, status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await api.updateBedBookingStatus(bookingId, status, token);
      if (!res.ok) throw new Error();
      setBedBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      toast.success(status === 'CONFIRMED' ? 'Booking accepted!' : 'Patient discharged!');
    } catch {
      toast.error('Failed to update booking status');
    }
  };

  if (loading) return (
    <div className="premium-loading-container">
      <div className="medical-loader"><div className="pulse-ring"></div><Building2 size={40} /></div>
      <p className="loading-text">Loading hospital portal...</p>
    </div>
  );

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div className="sidebar-brand-container">
          <div className="elite-badge-mini" style={{ color: '#7c3aed' }}>
            <Building2 size={20} /> <span>HOSPITAL PORTAL</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} style={{ '--active-color': '#7c3aed', '--active-bg': '#f5f3ff' }}>
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
        <header className="portal-header-banner" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
          <div className="banner-content">
            <div className="portal-tag-elite">HOSPITAL PORTAL</div>
            <h1>{hospital?.name || 'Hospital'}</h1>
            <p>{hospital?.city || 'Pune'} • {hospital?.address || ''}</p>
          </div>
          <button className="btn-glass-refresh" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /><span>Refresh</span>
          </button>
        </header>

        <div className="portal-container-fluid">
          <AnimatePresence mode="wait">

            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="stats-grid-premium">
                  {[
                    { label: 'Total Doctors',    value: doctors.length,                                                          icon: <Users />,    color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Bed Bookings',     value: bedBookings.length,                                                      icon: <Bed />,      color: '#7c3aed', bg: '#f5f3ff' },
                    { label: 'Pending Bookings', value: bedBookings.filter(b => b.status === 'PENDING').length,                  icon: <AlertCircle />, color: '#f59e0b', bg: '#fff7ed' },
                    { label: 'Confirmed',        value: bedBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length, icon: <Shield />, color: '#10b981', bg: '#ecfdf5' },
                  ].map((stat, i) => (
                    <div key={i} className="stat-card-new">
                      <div className="stat-icon-new" style={{ backgroundColor: stat.bg, color: stat.color }}>{stat.icon}</div>
                      <div className="stat-data-new"><h3>{stat.value}</h3><p>{stat.label}</p></div>
                    </div>
                  ))}
                </div>

                <div className="portal-card-main">
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 800 }}>Recent Bed Bookings</h2>
                  {bedBookings.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No bed bookings yet.</p>
                  ) : (
                    bedBookings.slice(0, 5).map((b, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <strong>{b.patient?.user?.name || b.patientName || 'Unknown'}</strong>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{b.bedType} • {b.admissionDate ? new Date(b.admissionDate).toLocaleDateString('en-IN') : b.checkIn || '—'}</p>
                        </div>
                        <span className={`badge-elite ${statusClass(b.status)}`}>{b.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'beds' && (
              <motion.div key="beds" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="portal-card-main">
                  <h2 style={{ margin: '0 0 2rem', fontSize: '1.75rem', fontWeight: 800 }}>Bed Bookings</h2>
                  {bedBookings.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>No bed bookings found.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="elite-table-p" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th>Patient</th><th>Bed Type</th><th>Admission Date</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                          {bedBookings.map((b, i) => (
                            <tr key={i}>
                              <td><strong>{b.patient?.user?.name || b.patientName || 'Unknown'}</strong></td>
                              <td>{b.bedType}</td>
                              <td>{b.admissionDate ? new Date(b.admissionDate).toLocaleDateString('en-IN') : b.checkIn || '—'}</td>
                              <td><span className={`badge-elite ${statusClass(b.status)}`}>{b.status}</span></td>
                              <td>
                                {b.status === 'PENDING' && (
                                  <button onClick={() => updateBedStatus(b.id, 'CONFIRMED')}
                                    style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '0.4rem 1rem', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                                    Accept
                                  </button>
                                )}
                                {(b.status === 'CONFIRMED' || b.status === 'CHECKED_IN') && (
                                  <button onClick={() => updateBedStatus(b.id, 'CHECKED_OUT')}
                                    style={{ background: '#ede9fe', color: '#7c3aed', border: 'none', padding: '0.4rem 1rem', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                                    Discharge
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'staff' && (
              <motion.div key="staff" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="portal-card-main">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Doctors</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.75rem 1.5rem', borderRadius: '100px', border: '1px solid #e2e8f0' }}>
                      <Search size={18} color="#94a3b8" />
                      <input type="text" placeholder="Search by name or specialty..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', width: '220px' }} value={searchStaff} onChange={e => setSearchStaff(e.target.value)} />
                    </div>
                  </div>
                  {filteredDoctors.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>No doctors found.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                      {filteredDoctors.map((d, i) => (
                        <div key={i} style={{ background: '#fafafa', border: '1px solid #f1f5f9', padding: '1.5rem', borderRadius: '1.5rem' }}>
                          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1rem' }}>
                            {(d.user?.name || d.name || 'D').charAt(0)}
                          </div>
                          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{d.user?.name || d.name || '—'}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 700 }}>{d.speciality || d.specialization || '—'}</span>
                          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>{d.experience} yrs exp • ₹{d.fees}</p>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{d.qualification}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="portal-card-main">
                  <h2 style={{ margin: '0 0 2rem', fontSize: '1.5rem', fontWeight: 800 }}>Hospital Settings</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Hospital Name</label><input type="text" defaultValue={hospital?.name} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>City</label><input type="text" defaultValue={hospital?.city} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} /></div>
                    <div style={{ gridColumn: '1/-1' }}><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Address</label><input type="text" defaultValue={hospital?.address} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} /></div>
                  </div>
                  <button style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '0.875rem 2rem', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => toast.success('Settings saved')}>
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .portal-layout { display: flex; height: 100vh; background: #f8fafc; overflow: hidden; }
        .portal-sidebar { width: 280px; background: white; border-right: 1px solid #f1f5f9; display: flex; flex-direction: column; padding: 2rem 1.5rem; }
        .nav-item { display: flex; align-items: center; gap: 1rem; width: 100%; padding: 1rem 1.5rem; border-radius: 12px; border: none; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; margin-bottom: 0.5rem; }
        .nav-item.active { background: #f5f3ff; color: #7c3aed; }
        .portal-header-banner { padding: 4rem 3rem; color: white; display: flex; justify-content: space-between; align-items: center; }
        .portal-container-fluid { padding: 3rem; }
        .stats-grid-premium { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
        .stat-card-new { background: white; padding: 1.5rem; border-radius: 2rem; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 1.5rem; }
        .stat-icon-new { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-data-new h3 { font-size: 1.5rem; font-weight: 900; margin: 0; color: #1e293b; }
        .stat-data-new p { margin: 0; font-size: 0.8rem; color: #64748b; font-weight: 600; }
        .portal-card-main { background: white; border-radius: 2rem; padding: 2.5rem; border: 1px solid #f1f5f9; margin-bottom: 2rem; }
        .badge-elite { padding: 0.35rem 0.75rem; border-radius: 100px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .badge-elite.confirmed { background: #dcfce7; color: #166534; }
        .badge-elite.pending { background: #fef9c3; color: #854d0e; }
        .badge-elite.cancelled { background: #fee2e2; color: #991b1b; }
        .badge-elite.discharged { background: #ede9fe; color: #7c3aed; }
        .elite-table-p th { text-align: left; padding: 1rem; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .elite-table-p td { padding: 1.25rem 1rem; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; }
        .btn-glass-refresh { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: white; padding: 0.6rem 1.2rem; border-radius: 100px; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
        .elite-badge-mini { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; font-size: 0.9rem; }
        .sidebar-brand-container { margin-bottom: 2rem; }
        .sidebar-footer { margin-top: auto; }
        .portal-tag-elite { font-size: 0.7rem; font-weight: 800; letter-spacing: 2px; opacity: 0.7; margin-bottom: 0.5rem; }
        .banner-content h1 { font-size: 2rem; font-weight: 900; margin: 0.5rem 0; }
        .banner-content p { opacity: 0.8; margin: 0; font-size: 0.9rem; }
        .premium-loading-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; gap: 1rem; }
        .medical-loader { position: relative; display: flex; align-items: center; justify-content: center; width: 80px; height: 80px; }
        .pulse-ring { width: 60px; height: 60px; border: 4px solid #7c3aed; border-radius: 50%; position: absolute; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
        .loading-text { color: #64748b; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default HospitalPortal;
