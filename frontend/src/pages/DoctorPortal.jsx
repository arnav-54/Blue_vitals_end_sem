import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, Clock, CheckCircle, User, Settings, LogOut, Activity, DollarSign,
  Plus, ShieldCheck, Award, Filter, Mail, Trash2, X, Briefcase, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import './UserPortal.css';

const DoctorPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
    if (!storedUser) { window.location.href = '/login'; return; }
    setDoctor(storedUser);

    const token = localStorage.getItem('token');

    // Fetch doctor profile
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/doctors/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setDoctorProfile(data); })
      .catch(() => {});

    // Fetch appointments
    api.getAppointments(token)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const mapped = (Array.isArray(data) ? data : []).map(apt => ({
          id: apt.id,
          patientName: apt.patient?.user?.name || 'Patient',
          specialty: apt.doctor?.speciality || '',
          date: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-IN') : '',
          time: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
          status: apt.status,
          reason: apt.reason,
          fee: apt.doctor?.fees || 0,
        }));
        setAppointments(mapped);
      })
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await api.updateAppointmentStatus(id, status, token);
      if (!res.ok) throw new Error();
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Appointment ${status.toLowerCase()}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const totalRevenue = appointments.reduce((s, a) => s + (parseInt(a.fee) || 0), 0);
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;

  const statusClass = (s) => ({ CONFIRMED: 'confirmed', PENDING: 'pending', COMPLETED: 'confirmed', CANCELLED: 'cancelled' }[s] || 'pending');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',      icon: <Activity /> },
    { id: 'schedule',  label: 'Appointments',   icon: <Calendar /> },
    { id: 'profile',   label: 'My Profile',     icon: <Award /> },
  ];

  if (loading) return (
    <div className="premium-loading-container">
      <div className="medical-loader"><Activity size={40} /></div>
      <p className="loading-text">Loading doctor portal...</p>
    </div>
  );

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div className="sidebar-brand-container">
          <div className="elite-badge-mini" style={{ color: '#2563eb' }}>
            <ShieldCheck size={20} /> <span>DOCTOR PORTAL</span>
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
        <header className="portal-header-banner" style={{ background: 'linear-gradient(135deg, #020617 0%, #1e293b 100%)' }}>
          <div className="banner-content">
            <div className="portal-tag-elite">DOCTOR PORTAL</div>
            <h1>{doctor?.name?.split(' ').slice(0, 2).join(' ')}</h1>
            <p><strong>{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</strong> total • <strong>{pendingCount} pending</strong></p>
          </div>
          <div className="header-score-card">
            <div className="score-viz-box" style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa' }}><Activity size={28} /></div>
            <div className="score-text-box"><h3>{confirmedCount}</h3><span>CONFIRMED</span></div>
          </div>
        </header>

        <div className="portal-container-fluid">
          <AnimatePresence mode="wait">

            {activeTab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="stats-grid-premium">
                  {[
                    { label: 'Total Appointments', value: appointments.length, icon: <Users />, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Pending', value: pendingCount, icon: <Clock />, color: '#f59e0b', bg: '#fff7ed' },
                    { label: 'Confirmed', value: confirmedCount, icon: <CheckCircle />, color: '#10b981', bg: '#ecfdf5' },
                    { label: 'Total Revenue', value: `₹${totalRevenue}`, icon: <DollarSign />, color: '#db2777', bg: '#fdf2f8' },
                  ].map((stat, i) => (
                    <div key={i} className="stat-card-new">
                      <div className="stat-icon-new" style={{ backgroundColor: stat.bg, color: stat.color }}>{stat.icon}</div>
                      <div className="stat-data-new"><h3>{stat.value}</h3><p>{stat.label}</p></div>
                    </div>
                  ))}
                </div>

                <div className="portal-card-main">
                  <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Recent Appointments</h2>
                    <button className="btn-elite-pill-ref" onClick={() => setActiveTab('schedule')}>View All</button>
                  </div>
                  {appointments.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No appointments yet.</p>
                  ) : (
                    appointments.slice(0, 5).map((apt, i) => (
                      <div key={i} className="stack-item-premium">
                        <div className="si-avatar" style={{ background: '#2563eb' }}>{(apt.patientName || 'P').charAt(0)}</div>
                        <div className="si-info"><strong>{apt.patientName}</strong><span>{apt.reason} • {apt.date} {apt.time}</span></div>
                        <span className={`badge-elite ${statusClass(apt.status)}`}>{apt.status}</span>
                        {apt.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="si-action" style={{ color: '#10b981', borderColor: '#10b981' }} onClick={() => updateStatus(apt.id, 'CONFIRMED')}>✓</button>
                            <button className="si-action" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => updateStatus(apt.id, 'CANCELLED')}>✕</button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div key="schedule" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="portal-card-main">
                  <h2 style={{ margin: '0 0 2rem', fontSize: '1.75rem', fontWeight: 800 }}>All Appointments</h2>
                  {appointments.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>No appointments found.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="elite-table-p" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th>Patient</th><th>Reason</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                          {appointments.map((apt, i) => (
                            <tr key={i}>
                              <td><strong>{apt.patientName}</strong></td>
                              <td>{apt.reason}</td>
                              <td>{apt.date}</td>
                              <td><Clock size={12} style={{ marginRight: 4 }} />{apt.time}</td>
                              <td><span className={`badge-elite ${statusClass(apt.status)}`}>{apt.status}</span></td>
                              <td>
                                {apt.status === 'PENDING' && (
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-icon-lite" style={{ color: '#10b981', borderColor: '#10b981' }} onClick={() => updateStatus(apt.id, 'CONFIRMED')}>Confirm</button>
                                    <button className="btn-icon-lite" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => updateStatus(apt.id, 'CANCELLED')}>Cancel</button>
                                  </div>
                                )}
                                {apt.status === 'CONFIRMED' && (
                                  <button className="btn-icon-lite" style={{ color: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => updateStatus(apt.id, 'COMPLETED')}>Complete</button>
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

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="portal-card-main">
                  <div className="profile-hero-elite">
                    <div className="profile-avatar-large"><User size={40} /></div>
                    <div className="profile-hero-info">
                      <h2>{doctor?.name}</h2>
                      <p>{doctor?.email}</p>
                      <span className="profile-badge-elite">VERIFIED DOCTOR</span>
                    </div>
                  </div>
                  <div className="profile-details-grid">
                    {[
                      { label: 'Speciality', value: doctorProfile?.speciality || 'N/A', icon: <Briefcase /> },
                      { label: 'Experience', value: doctorProfile ? `${doctorProfile.experience} years` : 'N/A', icon: <Award /> },
                      { label: 'Consultation Fee', value: doctorProfile ? `₹${doctorProfile.fees}` : 'N/A', icon: <DollarSign /> },
                      { label: 'Hospital', value: doctorProfile?.hospital?.name || 'N/A', icon: <ShieldCheck /> },
                      { label: 'Qualification', value: doctorProfile?.qualification || 'N/A', icon: <FileText /> },
                      { label: 'City', value: doctorProfile?.city || doctorProfile?.hospital?.city || 'N/A', icon: <Users /> },
                    ].map((item, i) => (
                      <div key={i} className="profile-info-card">
                        <div className="pic-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>{item.icon}</div>
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

      <style>{`
        .portal-layout { display: flex; height: 100vh; background: #f8fafc; overflow: hidden; font-family: 'Inter', sans-serif; }
        .portal-sidebar { width: 280px; background: white; border-right: 1px solid #f1f5f9; display: flex; flex-direction: column; padding: 2rem 1.5rem; }
        .nav-item { display: flex; align-items: center; gap: 1rem; width: 100%; padding: 1rem 1.5rem; border-radius: 12px; border: none; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; margin-bottom: 0.5rem; }
        .nav-item.active { background: #eff6ff; color: #2563eb; }
        .portal-header-banner { padding: 4rem 3rem; color: white; display: flex; justify-content: space-between; align-items: center; }
        .portal-container-fluid { padding: 3rem; }
        .stats-grid-premium { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
        .stat-card-new { background: white; padding: 1.5rem; border-radius: 2rem; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 1.5rem; }
        .stat-icon-new { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-data-new h3 { font-size: 1.5rem; font-weight: 900; margin: 0; color: #1e293b; }
        .stat-data-new p { margin: 0; font-size: 0.8rem; color: #64748b; font-weight: 600; }
        .portal-card-main { background: white; border-radius: 2rem; padding: 2.5rem; border: 1px solid #f1f5f9; margin-bottom: 2rem; }
        .stack-item-premium { display: flex; align-items: center; gap: 1.5rem; background: #fafafa; padding: 1.25rem; border-radius: 1.5rem; border: 1px solid #f1f5f9; margin-bottom: 1rem; }
        .si-avatar { width: 44px; height: 44px; border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
        .si-info { flex: 1; display: flex; flex-direction: column; }
        .si-info strong { color: #1e293b; font-size: 0.95rem; }
        .si-info span { font-size: 0.75rem; color: #64748b; font-weight: 600; }
        .si-action { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; cursor: pointer; font-weight: 700; font-size: 0.8rem; }
        .badge-elite { padding: 0.35rem 0.75rem; border-radius: 100px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .badge-elite.confirmed { background: #dcfce7; color: #166534; }
        .badge-elite.pending { background: #fef9c3; color: #854d0e; }
        .badge-elite.cancelled { background: #fee2e2; color: #991b1b; }
        .btn-icon-lite { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; color: #64748b; cursor: pointer; font-size: 0.8rem; font-weight: 700; }
        .btn-elite-pill-ref { background: #f1f5f9; border: none; padding: 0.6rem 1.25rem; border-radius: 100px; font-size: 0.8rem; font-weight: 800; color: #1e293b; cursor: pointer; }
        .elite-table-p th { text-align: left; padding: 1rem; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .elite-table-p td { padding: 1.25rem 1rem; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; }
        .profile-hero-elite { display: flex; align-items: center; gap: 2rem; background: #f8fafc; padding: 2.5rem; border-radius: 2rem; margin-bottom: 3rem; }
        .profile-avatar-large { width: 100px; height: 100px; background: white; border-radius: 50%; border: 4px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
        .profile-hero-info h2 { font-size: 1.8rem; font-weight: 900; color: #1e293b; margin: 0; }
        .profile-hero-info p { color: #64748b; margin: 0.5rem 0; }
        .profile-badge-elite { background: #dcfce7; color: #166534; padding: 0.35rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 900; }
        .profile-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .profile-info-card { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 1.5rem; border-radius: 1.5rem; border: 1px solid #f1f5f9; }
        .pic-icon { width: 45px; height: 45px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pic-data span { font-size: 0.8rem; color: #94a3b8; font-weight: 700; display: block; }
        .pic-data strong { font-size: 1rem; color: #1e293b; font-weight: 800; }
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
        .premium-loading-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; gap: 1rem; }
        .medical-loader { position: relative; display: flex; align-items: center; justify-content: center; width: 80px; height: 80px; }
        .loading-text { color: #64748b; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default DoctorPortal;
