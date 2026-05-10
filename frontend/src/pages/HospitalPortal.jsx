import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Bed, Users, Activity, Settings, LogOut, Plus, Search, ChevronRight, TrendingUp, 
  AlertCircle, Calendar, Clock, Lock, Bell, Save, Trash2, Edit, FileText, MapPin, Shield, Layers,
  RefreshCw, Download, Filter, Phone, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './UserPortal.css';

const HospitalPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState(null);
  const [searchStaff, setSearchStaff] = useState('');
  
  const [settings, setSettings] = useState({ emsLinked: true, autoReporting: false, remoteAccess: true });
  const [staff, setStaff] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const initPortal = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          const hData = storedUser.hospital || storedUser;
          setHospital(hData);
          setStaff([
            { id: 1, name: 'Dr. Sarah Wilson', role: 'Cardiology', status: 'On Duty', load: 85, phone: '+91 98234-11223', email: 's.wilson@elite.com' },
            { id: 2, name: 'Dr. Michael Chen', role: 'Emergency', status: 'On Duty', load: 40, phone: '+91 98234-55667', email: 'm.chen@elite.com' },
            { id: 3, name: 'Dr. Elena Rossi', role: 'Neurology', status: 'Off Duty', load: 0, phone: '+91 98234-99880', email: 'e.rossi@elite.com' }
          ]);
          setWards([
            { id: 1, name: 'General Ward A', totalBeds: 24, occupied: 18, floor: '2nd Floor' },
            { id: 2, name: 'ICU - Level 1', totalBeds: 10, occupied: 9, floor: 'Ground Floor' },
            { id: 3, name: 'Emergency Care', totalBeds: 12, occupied: 11, floor: 'Ground Floor' }
          ]);
        }
      } catch (e) { toast.error('Facility sync failed'); }
      finally { setTimeout(() => setLoading(false), 600); }
    };
    initPortal();
  }, []);

  const filteredStaff = useMemo(() => {
    return staff.filter(s => s.name.toLowerCase().includes(searchStaff.toLowerCase()) || s.role.toLowerCase().includes(searchStaff.toLowerCase()));
  }, [staff, searchStaff]);

  const navItems = [
    { id: 'overview', label: 'Operations', icon: <Activity /> },
    { id: 'beds', label: 'Capacity Hub', icon: <Bed /> },
    { id: 'staff', label: 'Practitioners', icon: <Users /> },
    { id: 'settings', label: 'Facility Config', icon: <Settings /> },
  ];

  if (loading) return (
    <div className="premium-loading-container">
      <div className="medical-loader"><div className="pulse-ring"></div><Building2 className="loader-icon" size={40} /></div>
      <p className="loading-text">Synchronizing Facility Nodes...</p>
    </div>
  );

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div className="sidebar-brand-container">
          <div className="elite-badge-mini" style={{ color: '#7c3aed' }}>
            <Building2 size={20} fill="#7c3aed" /> <span>ELITE FACILITY</span>
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
        <header className="portal-header-banner" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
          <div className="banner-content">
            <div className="portal-tag-elite">FACILITY COMMAND NODE</div>
            <h1>{hospital?.name && hospital.name.length > 1 ? hospital.name : 'Elite Medical Hub'}</h1>
            <p>Operational status: <strong>System Stable</strong> • Network Latency: 4ms</p>
          </div>
          <button className="btn-glass-refresh" onClick={() => toast.success('Facility data synchronized')}>
            <RefreshCw size={16} /><span>Refresh Hub</span>
          </button>
        </header>

        <div className="portal-container-fluid">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="stats-grid-premium">
                  {[
                    { label: 'Bed Occupancy', value: '71%', icon: <Bed />, color: '#7c3aed', bg: '#f5f3ff' },
                    { label: 'Active Staff', value: staff.filter(s => s.status === 'On Duty').length, icon: <Users />, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Daily Admit', value: '12', icon: <Plus />, color: '#db2777', bg: '#fdf2f8' },
                    { label: 'SLA Health', value: '98.2%', icon: <Shield />, color: '#16a34a', bg: '#f0fdf4' },
                  ].map((stat, i) => (
                    <div key={i} className="stat-card-new">
                      <div className="stat-icon-new" style={{ backgroundColor: stat.bg, color: stat.color }}>{stat.icon}</div>
                      <div className="stat-data-new"><h3>{stat.value}</h3><p>{stat.label}</p></div>
                    </div>
                  ))}
                </div>

                <div className="portal-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
                  <div className="portal-card-main">
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Facility Practitioners</h2>
                      <button className="btn-lite-pill" onClick={() => setActiveTab('staff')}>Full Directory</button>
                    </div>
                    <div className="staff-overview-stack">
                      {staff.slice(0, 3).map((s, i) => (
                        <div key={i} className="stack-item-premium">
                          <div className="si-avatar" style={{ background: '#7c3aed' }}>{s.name.charAt(4)}</div>
                          <div className="si-info"><strong>{s.name}</strong><span>{s.role}</span></div>
                          <div className="si-metrics" style={{ width: '120px' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textAlign: 'right' }}>LOAD: {s.load}%</div>
                            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${s.load}%`, height: '100%', background: s.load > 80 ? '#ef4444' : '#3b82f6' }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="portal-card-side">
                    <div className="elite-alert-widget">
                      <AlertCircle size={32} />
                      <h4>Inventory Sync</h4>
                      <p>Critical: Blood bag supply (O-ve) below threshold.</p>
                      <button className="btn-action-primary-full" onClick={() => toast.success('Stock order placed')}>Auto-Reorder</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'beds' && (
              <motion.div key="beds" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="portal-card-main">
                  <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Capacity Monitoring</h2>
                    <div className="portal-tag-elite" style={{ color: '#1e293b' }}>LIVE FEED</div>
                  </div>
                  <div className="wards-grid-elite" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {wards.map((ward, i) => (
                      <div key={i} className="ward-card-premium">
                        <div className="ward-header-flex">
                          <div><h4>{ward.name}</h4><p>{ward.floor}</p></div>
                          <div className="ward-occ-badge"><strong>{ward.occupied}</strong> / {ward.totalBeds}</div>
                        </div>
                        <div className="bed-dots-viz" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '1.5rem 0' }}>
                          {[...Array(ward.totalBeds)].map((_, j) => <div key={j} className={`bed-dot ${j < ward.occupied ? 'full' : 'empty'}`}></div>)}
                        </div>
                        <button className="btn-node-full">Configure Ward</button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'staff' && (
              <motion.div key="staff" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <div className="portal-card-main">
                  <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Practitioner Directory</h2>
                    <div className="elite-search-box" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.75rem 1.5rem', borderRadius: '100px', border: '1px solid #e2e8f0' }}>
                      <Search size={18} color="#94a3b8" />
                      <input type="text" placeholder="Search by name or specialty..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', width: '250px' }} value={searchStaff} onChange={e => setSearchStaff(e.target.value)} />
                    </div>
                  </div>
                  <div className="staff-grid-elite" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {filteredStaff.map((s, i) => (
                      <div key={i} className="practitioner-card-elite">
                        <div className="p-card-top" style={{ position: 'relative', marginBottom: '1.5rem', textAlign: 'center' }}>
                          <div className="p-avatar-huge" style={{ width: '80px', height: '80px', margin: '0 auto', borderRadius: '24px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>{s.name.charAt(4)}</div>
                          <span style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0.2rem 0.6rem', borderRadius: '100px', border: '1px solid #e2e8f0', fontSize: '0.65rem', fontWeight: 800, color: s.status === 'On Duty' ? '#16a34a' : '#64748b' }}>{s.status}</span>
                        </div>
                        <h3 style={{ textAlign: 'center', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{s.name}</h3>
                        <p style={{ textAlign: 'center', margin: 0, fontSize: '0.8rem', color: '#7c3aed', fontWeight: 800, textTransform: 'uppercase' }}>{s.role}</p>
                        <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>Profile</button>
                          <button style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', background: '#7c3aed', color: 'white', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>Message</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="portal-card-main">
                  <div className="settings-pane-elite" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
                    <section>
                      <div className="s-pane-header" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', color: '#1e293b' }}>
                        <Building2 size={24} /> <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Infrastructure Node</h3>
                      </div>
                      <div className="form-grid-p" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group-p"><label>Facility Name</label><input type="text" defaultValue={hospital?.name} /></div>
                        <div className="form-group-p"><label>Region ID</label><input type="text" defaultValue={hospital?.city} /></div>
                      </div>
                      <button className="btn-primary-elite" style={{ marginTop: '2rem' }} onClick={() => toast.success('Facility config updated')}><Save size={18} /> Update Node Details</button>
                    </section>
                    
                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

                    <section>
                      <div className="s-pane-header" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', color: '#1e293b' }}>
                        <Lock size={24} /> <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Security Protocol</h3>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eff6ff' }}>
                          <div><strong style={{ display: 'block', fontSize: '0.9rem' }}>National EMS Link</strong><p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Secure tunnel to regional emergency services.</p></div>
                          <div className={`elite-switch ${settings.emsLinked ? 'active' : ''}`} style={{ width: '44px', height: '22px', borderRadius: '100px', background: settings.emsLinked ? '#10b981' : '#cbd5e1', cursor: 'pointer', position: 'relative' }} onClick={() => setSettings({...settings, emsLinked: !settings.emsLinked})}><div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: settings.emsLinked ? '25px' : '3px', transition: '0.2s' }}></div></div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .btn-glass-refresh { background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15); color: white; padding: 0.6rem 1.2rem; border-radius: 100px; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.2s; }
        .btn-glass-refresh:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }

        .ward-card-premium { background: #fafafa; border: 1px solid #f1f5f9; padding: 2rem; border-radius: 2rem; transition: all 0.2s; }
        .ward-card-premium:hover { background: white; border-color: #7c3aed; transform: translateY(-4px); }
        .ward-header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
        .ward-header-flex h4 { margin: 0; font-size: 1.1rem; color: #1e293b; }
        .ward-header-flex p { margin: 0.25rem 0 0; font-size: 0.8rem; color: #94a3b8; font-weight: 700; }
        .ward-occ-badge { font-size: 0.8rem; font-weight: 800; color: #7c3aed; background: #f5f3ff; padding: 0.4rem 0.75rem; border-radius: 10px; }
        
        .bed-dot { width: 12px; height: 12px; border-radius: 3px; }
        .bed-dot.full { background: #e2e8f0; }
        .bed-dot.empty { background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.2); }
        .btn-node-full { width: 100%; padding: 0.875rem; border: 1px solid #e2e8f0; border-radius: 12px; background: white; font-weight: 800; font-size: 0.8rem; color: #475569; cursor: pointer; }

        .elite-alert-widget { background: #7c3aed; color: white; padding: 2.5rem; border-radius: 2.5rem; }
        .elite-alert-widget h4 { margin: 1.5rem 0 0.5rem; font-size: 1.25rem; }
        .elite-alert-widget p { font-size: 0.9rem; opacity: 0.8; margin-bottom: 2rem; }
        .btn-action-primary-full { width: 100%; background: white; color: #7c3aed; border: none; padding: 1rem; border-radius: 12px; font-weight: 800; cursor: pointer; }

        .stack-item-premium { display: flex; align-items: center; gap: 1.5rem; background: #fafafa; padding: 1.25rem; border-radius: 1.5rem; border: 1px solid #f1f5f9; margin-bottom: 1rem; transition: all 0.2s; }
        .stack-item-premium:hover { background: white; border-color: #7c3aed; transform: translateX(8px); }
        .si-avatar { width: 44px; height: 44px; border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .si-info { flex: 1; display: flex; flex-direction: column; }
        .si-info strong { color: #1e293b; font-size: 0.95rem; }
        .si-info span { font-size: 0.75rem; color: #64748b; font-weight: 600; }
        
        .btn-lite-pill { background: #f1f5f9; border: none; padding: 0.5rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 800; color: #64748b; cursor: pointer; }
        .elite-badge-mini { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; font-size: 0.9rem; letter-spacing: 0.05em; }
        .practitioner-card-elite { background: #fafafa; border: 1px solid #f1f5f9; padding: 2rem; border-radius: 2.5rem; transition: all 0.3s; }
        .practitioner-card-elite:hover { background: white; border-color: #7c3aed; transform: translateY(-8px); box-shadow: 0 20px 25px rgba(124, 58, 237, 0.05); }
      `}</style>
    </div>
  );
};

export default HospitalPortal;
