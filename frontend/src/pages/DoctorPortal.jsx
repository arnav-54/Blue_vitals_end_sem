import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Calendar, Clock, CheckCircle, User, Settings, LogOut, Activity, DollarSign,
  Plus, Bell, ShieldCheck, Video, Award, Shield, Camera, Filter, Mail, Trash2, X,
  MapPin, Phone, Briefcase, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './UserPortal.css';

const DoctorPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const initPortal = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setDoctor(storedUser);
          const allApts = JSON.parse(localStorage.getItem('elite_appointments') || '[]');
          const myApts = allApts.filter(apt => 
            apt.doctorName === storedUser.name || 
            apt.doctorName === `Dr. ${storedUser.name}`
          );
          setAppointments(myApts);
        }
      } catch (e) { toast.error('Sync failed'); }
      finally { setTimeout(() => setLoading(false), 600); }
    };
    initPortal();
  }, []);

  const deleteAppointment = (id) => {
    try {
      const allApts = JSON.parse(localStorage.getItem('elite_appointments') || '[]');
      const updated = allApts.filter(a => String(a.id) !== String(id));
      localStorage.setItem('elite_appointments', JSON.stringify(updated));
      setAppointments(appointments.filter(a => String(a.id) !== String(id)));
      toast.success('Consultation Node Terminated');
    } catch (e) { toast.error('Termination failed'); }
  };

  const totalRevenue = appointments.reduce((sum, apt) => sum + parseInt(apt.fee || 850), 0);
  const confirmedCount = appointments.filter(a => a.status === 'Confirmed').length;

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: <Activity /> },
    { id: 'schedule', label: 'Patient Queue', icon: <Calendar /> },
    { id: 'profile', label: 'Doctor Identity', icon: <Award /> },
    { id: 'settings', label: 'Preferences', icon: <Settings /> },
  ];

  if (loading) return (
    <div className="premium-loading-container">
      <div className="medical-loader"><Activity size={40} /></div>
      <p className="loading-text">Synchronizing Practitioner Node...</p>
    </div>
  );

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div className="sidebar-brand-container">
          <div className="elite-badge-mini" style={{ color: '#2563eb' }}>
            <ShieldCheck size={20} fill="#2563eb" /> <span>ELITE PRACTITIONER</span>
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
            <div className="portal-tag-elite">VERIFIED CLINICIAN HUB</div>
            <h1>{doctor?.name ? `Dr. ${doctor.name.split(' ')[0]}` : 'Doctor Hub'}</h1>
            <p>Managing <strong>{appointments.length} active cases</strong> today.</p>
          </div>
          <div className="header-score-card">
            <div className="score-viz-box" style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa' }}><Activity size={28} /></div>
            <div className="score-text-box"><h3>94%</h3><span>DIAGNOSTIC SCORE</span></div>
          </div>
        </header>

        <div className="portal-container-fluid">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="stats-grid-premium">
                  {[
                    { label: 'Today Cases', value: appointments.length, icon: <Users />, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Queue Time', value: '14m', icon: <Clock />, color: '#7c3aed', bg: '#f5f3ff' },
                    { label: 'Completed', value: confirmedCount, icon: <CheckCircle />, color: '#10b981', bg: '#ecfdf5' },
                    { label: 'Consult Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}k`, icon: <DollarSign />, color: '#db2777', bg: '#fdf2f8' },
                  ].map((stat, i) => (
                    <div key={i} className="stat-card-new">
                      <div className="stat-icon-new" style={{ backgroundColor: stat.bg, color: stat.color }}>{stat.icon}</div>
                      <div className="stat-data-new"><h3>{stat.value}</h3><p>{stat.label}</p></div>
                    </div>
                  ))}
                </div>

                <div className="portal-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
                  <div className="portal-card-main">
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Active Patient Queue</h2>
                      <button className="btn-elite-pill-ref" onClick={() => setActiveTab('schedule')}>Full List <ChevronRight size={14} /></button>
                    </div>
                    <div className="queue-stack-elite">
                      {appointments.slice(0, 5).map((apt, i) => (
                        <div key={i} className="stack-item-premium">
                          <div className="si-avatar" style={{ background: '#2563eb' }}>{(apt.patientName || 'P').charAt(0)}</div>
                          <div className="si-info"><strong>{apt.patientName}</strong><span>{apt.specialty} • {apt.time}</span></div>
                          <div className={`si-status ${(apt.status || 'pending').toLowerCase()}`}>{apt.status}</div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="si-action" onClick={() => toast.success('Joining consultation...')}><Video size={18} /></button>
                            <button className="si-action delete" onClick={() => deleteAppointment(apt.id)}><Trash2 size={18} /></button>
                          </div>
                        </div>
                      ))}
                      {appointments.length === 0 && <p className="empty-state-p">No patients in queue today.</p>}
                    </div>
                  </div>
                  <div className="portal-card-side">
                    <div className="elite-profile-mini">
                      <Award size={40} color="#3b82f6" />
                      <h4>Verified Credentials</h4>
                      <p>Specialist MD • Medical Council #MC-29384</p>
                      <button className="btn-action-primary-full" onClick={() => setActiveTab('profile')}>Update Profile</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div key="schedule" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="portal-card-main">
                  <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Clinical Schedule</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn-elite-filter"><Filter size={16} /> <span>Filter Sessions</span></button>
                      <button className="btn-primary-elite" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}><Plus size={18} /> New Slot</button>
                    </div>
                  </div>
                  <div className="schedule-table-wrapper">
                    <table className="elite-table-p" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr><th>Patient</th><th>Session Type</th><th>Time Slot</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {appointments.map((apt, i) => (
                          <tr key={i}>
                            <td><strong>{apt.patientName}</strong></td>
                            <td>{apt.specialty}</td>
                            <td><Clock size={12} style={{ marginRight: '5px' }} /> {apt.time}</td>
                            <td>{apt.date}</td>
                            <td><span className={`badge-elite ${(apt.status || 'pending').toLowerCase()}`}>{apt.status}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-icon-lite" onClick={() => toast.success('Reminder Sent')}><Mail size={16} /></button>
                                <button className="btn-icon-lite delete-btn-p" onClick={() => deleteAppointment(apt.id)}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ✅ NEW HIGH-FIDELITY DOCTOR IDENTITY UI */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="portal-card-main">
                  <div className="profile-hero-elite-p">
                    <div className="profile-avatar-large-p"><User size={40} /></div>
                    <div className="profile-hero-info-p">
                      <h2>Dr. {doctor?.name}</h2>
                      <p><Briefcase size={14} /> Senior Consultant Specialist</p>
                      <span className="profile-badge-elite-p">VERIFIED PRACTITIONER</span>
                    </div>
                  </div>
                  <div className="profile-details-grid-p">
                    {[
                      { label: 'Clinical Email', value: doctor?.email, icon: <Mail /> },
                      { label: 'Medical License', value: 'MC-29384-ELITE', icon: <Award /> },
                      { label: 'Primary Specialty', value: 'Specialist MD', icon: <Stethoscope /> },
                      { label: 'Operational Hub', value: 'Elite Medical Center', icon: <Building2 /> }
                    ].map((item, i) => (
                      <div key={i} className="profile-info-card-p">
                        <div className="pic-icon-p">{item.icon}</div>
                        <div className="pic-data-p"><span>{item.label}</span><strong>{item.value}</strong></div>
                      </div>
                    ))}
                  </div>
                  <div className="profile-bio-section-p">
                    <h3><FileText size={18} /> Practitioner Bio</h3>
                    <p>Dedicated medical professional with over 12 years of experience in clinical excellence and patient-centric care. Specializing in advanced diagnostics and therapeutic management within the Elite Health Ecosystem.</p>
                  </div>
                  <button className="btn-edit-profile-p" onClick={() => toast.success('Clinical Profile synchronization enabled.')}>Update Clinical Identity</button>
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
        .stats-grid-premium { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
        .stat-card-new { background: white; padding: 1.5rem; border-radius: 2rem; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 1.5rem; }
        .stat-icon-new { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        
        .btn-elite-pill-ref { background: #f1f5f9; border: none; padding: 0.6rem 1.25rem; border-radius: 100px; font-size: 0.8rem; font-weight: 800; color: #1e293b; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: 0.2s; }
        .btn-elite-filter { background: white; border: 1.5px solid #e2e8f0; padding: 0.75rem 1.5rem; border-radius: 12px; color: #1e293b; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: 0.2s; }
        
        /* ✅ PRACTITIONER IDENTITY UI STYLES */
        .profile-hero-elite-p { display: flex; align-items: center; gap: 2rem; background: #f8fafc; padding: 2.5rem; border-radius: 2.5rem; margin-bottom: 2.5rem; border: 1px solid #f1f5f9; }
        .profile-avatar-large-p { width: 90px; height: 90px; background: white; border-radius: 28px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #2563eb; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.1); }
        .profile-hero-info-p h2 { font-size: 1.75rem; font-weight: 900; color: #1e293b; margin: 0; }
        .profile-hero-info-p p { color: #64748b; font-size: 0.9rem; font-weight: 700; margin: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem; }
        .profile-badge-elite-p { background: #dcfce7; color: #166534; padding: 0.35rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 900; letter-spacing: 0.5px; }
        
        .profile-details-grid-p { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
        .profile-info-card-p { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 1.5rem; border-radius: 1.5rem; border: 1px solid #f1f5f9; transition: 0.2s; }
        .profile-info-card-p:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05); }
        .pic-icon-p { width: 48px; height: 48px; background: #eff6ff; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #2563eb; }
        .pic-data-p span { display: block; font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.25rem; }
        .pic-data-p strong { font-size: 1rem; color: #1e293b; font-weight: 800; }
        
        .profile-bio-section-p { background: #fafafa; padding: 2rem; border-radius: 2rem; border: 1px solid #f1f5f9; margin-bottom: 2.5rem; }
        .profile-bio-section-p h3 { font-size: 1.1rem; font-weight: 900; color: #1e293b; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
        .profile-bio-section-p p { color: #64748b; line-height: 1.6; font-size: 0.95rem; margin: 0; }
        
        .btn-edit-profile-p { width: 100%; padding: 1.25rem; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; border: none; border-radius: 18px; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.3); }
        .btn-edit-profile-p:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(15, 23, 42, 0.4); }

        .stack-item-premium { display: flex; align-items: center; gap: 1.5rem; background: #fafafa; padding: 1.25rem; border-radius: 1.5rem; border: 1px solid #f1f5f9; margin-bottom: 1rem; }
        .si-avatar { width: 44px; height: 44px; border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .si-info { flex: 1; display: flex; flex-direction: column; }
        .si-status { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; padding: 0.25rem 0.625rem; border-radius: 6px; }
        .si-status.confirmed { background: #dcfce7; color: #166534; }
        .si-status.pending { background: #fef9c3; color: #854d0e; }
        .si-action { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; color: #cbd5e1; cursor: pointer; }
        .si-action.delete:hover { color: #ef4444; border-color: #ef4444; }

        .elite-table-p th { text-align: left; padding: 1rem; color: #64748b; border-bottom: 1px solid #f1f5f9; }
        .elite-table-p td { padding: 1.5rem 1rem; border-bottom: 1px solid #f8fafc; }
        .badge-elite { padding: 0.35rem 0.75rem; border-radius: 100px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .badge-elite.confirmed { background: #dcfce7; color: #166534; }
        .badge-elite.pending { background: #fef9c3; color: #854d0e; }
        .btn-icon-lite { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; color: #64748b; cursor: pointer; }
        
        .elite-profile-mini { background: #020617; color: white; padding: 2.5rem; border-radius: 2.5rem; text-align: center; }
        .elite-profile-mini h4 { margin: 1.5rem 0 0.5rem; font-size: 1.1rem; }
        .elite-profile-mini p { font-size: 0.85rem; opacity: 0.6; margin-bottom: 2rem; }
        .btn-action-primary-full { width: 100%; padding: 1.1rem; background: #2563eb; color: white; border: none; border-radius: 14px; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.2); }
        .btn-action-primary-full:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.3); }
      `}</style>
    </div>
  );
};

// Helper Components
const ChevronRight = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const Stethoscope = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z"/><path d="M10 22v-2a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v2"/><path d="M10 14a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"/><path d="m14 10 3 3 5-5"/></svg>;
const Building2 = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>;

export default DoctorPortal;
