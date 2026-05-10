import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Calendar, Settings, Activity, Plus, Trash2, 
  Search, ShieldCheck, LogOut, ChevronRight, PieChart, TrendingUp,
  MapPin, Phone, Mail, Stethoscope, AlertCircle, CheckCircle, X, Lock, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import './AdminPortal.css';

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('specialists');
  const [showDocModal, setShowDocModal] = useState(false);
  const [showHospModal, setShowHospModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null); // ✅ NEW: For credential viewing
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const eh = JSON.parse(localStorage.getItem('elite_hospitals') || '[]');
      const ed = JSON.parse(localStorage.getItem('elite_doctors') || '[]');
      
      let apiHospitals = [];
      try {
        const res = await api.getHospitals();
        if (res.ok) {
          const data = await res.json();
          apiHospitals = Array.isArray(data) ? data : [];
        }
      } catch (e) { console.warn("API Hospitals Offline"); }

      const allHospitals = [...eh, ...apiHospitals.map(h => ({ id: h.id, name: h.name, city: h.city || 'Mumbai' }))];
      setHospitals(allHospitals);
      setDoctors(ed);
    };
    loadData();
  }, []);

  const handleAddHospital = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const hName = fd.get('name');
    const email = fd.get('email');
    const password = fd.get('password');

    const newHosp = { id: Date.now(), name: hName, city: fd.get('city'), type: 'General Hospital', email: email };
    const eh = JSON.parse(localStorage.getItem('elite_hospitals') || '[]');
    localStorage.setItem('elite_hospitals', JSON.stringify([newHosp, ...eh]));
    
    const auths = JSON.parse(localStorage.getItem('elite_onboarded_auth') || '[]');
    auths.push({ ...newHosp, password: password, role: 'hospital' });
    localStorage.setItem('elite_onboarded_auth', JSON.stringify(auths));

    setHospitals([newHosp, ...hospitals]);
    setShowHospModal(false);
    toast.success(`Facility Registered: ${hName}`);
  };

  const handleAddDoctor = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const docName = fd.get('name');
    const email = fd.get('email');
    const password = fd.get('password');
    const hospitalName = fd.get('hospital');
    const selectedHosp = hospitals.find(h => h.name === hospitalName);

    const newDoc = {
      id: Date.now(),
      name: docName,
      specialty: fd.get('specialty'),
      hospital: hospitalName,
      location: selectedHosp?.city || 'Mumbai',
      fee: fd.get('fee'),
      experience: '12 Years',
      email: email,
      password: password // Store for admin visibility
    };

    const ed = JSON.parse(localStorage.getItem('elite_doctors') || '[]');
    localStorage.setItem('elite_doctors', JSON.stringify([newDoc, ...ed]));

    const auths = JSON.parse(localStorage.getItem('elite_onboarded_auth') || '[]');
    auths.push({ ...newDoc, role: 'doctor' });
    localStorage.setItem('elite_onboarded_auth', JSON.stringify(auths));

    setDoctors([newDoc, ...doctors]);
    setShowDocModal(false);
    toast.success(`Onboarded: ${docName}`);
  };

  const deleteDoctor = (id) => {
    const updated = doctors.filter(d => d.id !== id);
    localStorage.setItem('elite_doctors', JSON.stringify(updated));
    setDoctors(updated);
    toast.success('Clinician Node Terminated');
  };

  return (
    <div className="admin-portal-elite">
      <aside className="admin-sidebar">
        <div className="sidebar-brand"><ShieldCheck size={28} /><span>Admin Core</span></div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'specialists' ? 'active' : ''} onClick={() => setActiveTab('specialists')}><Stethoscope size={20} /> Specialists</button>
          <button className={activeTab === 'hospitals' ? 'active' : ''} onClick={() => setActiveTab('hospitals')}><Building2 size={20} /> Hospitals</button>
          <button className={activeTab === 'metrics' ? 'active' : ''} onClick={() => setActiveTab('metrics')}><TrendingUp size={20} /> Metrics</button>
        </nav>
        <div className="sidebar-footer"><button className="btn-exit" onClick={() => window.location.href='/'}><LogOut size={18} /> Exit Console</button></div>
      </aside>

      <main className="admin-main">
        <header className="admin-header-ref">
          <div className="header-info"><h1>System Authority</h1><p>Resource Management & Onboarding</p></div>
          <div className="admin-status-pill">PRIMARY ADMIN</div>
        </header>

        <section className="content-container-elite">
          {activeTab === 'hospitals' && (
            <div className="tab-pane-fade">
              <div className="pane-header-elite"><h2>Medical Infrastructure</h2><button className="btn-action-add" onClick={() => setShowHospModal(true)}><Plus size={20} /> Add Hospital</button></div>
              <div className="hospitals-grid-elite">
                {hospitals.map(h => (
                  <div key={h.id} className="hosp-card-admin">
                    <div className="hosp-icon-p"><Building2 /></div>
                    <div className="hosp-details-p">
                      <h3>{h.name}</h3>
                      <div className="hosp-meta-p"><MapPin size={14} /> <span>{h.city}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'specialists' && (
            <div className="tab-pane-fade">
              <div className="pane-header-elite"><h2>Clinician Management</h2><button className="btn-action-add" onClick={() => setShowDocModal(true)}><Plus size={20} /> Onboard Doctor</button></div>
              <div className="doctors-table-elite">
                <div className="table-header"><span>Name</span><span>Specialty</span><span>Facility</span><span>Authority</span></div>
                {doctors.map(d => (
                  <div key={d.id} className="table-row">
                    <span className="doc-name-cell">{d.name}</span>
                    <span className="doc-spec-cell">{d.specialty}</span>
                    <span className="doc-hosp-cell">{d.hospital}</span>
                    <div className="doc-actions-cell">
                      <button className="btn-view-creds" onClick={() => setSelectedEntity(d)}><Eye size={16} /> View</button>
                      <button className="btn-delete-node" onClick={() => deleteDoctor(d.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {/* ✅ CREDENTIAL VIEW MODAL */}
        {selectedEntity && (
          <div className="admin-modal-overlay" onClick={() => setSelectedEntity(null)}>
            <motion.div className="admin-modal-card secure-creds" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header-ref"><h2>Secure Credentials</h2><button className="btn-close-ref" onClick={() => setSelectedEntity(null)}><X /></button></div>
              <div className="cred-vault-elite">
                <div className="vault-header">
                  <div className="vh-icon"><ShieldCheck size={30} color="#3b82f6" /></div>
                  <div className="vh-text"><strong>{selectedEntity.name}</strong><p>{selectedEntity.role === 'hospital' ? 'Facility Node' : 'Clinician Node'}</p></div>
                </div>
                <div className="vault-data">
                  <div className="vd-row"><label><Mail size={14} /> Email Address</label><strong>{selectedEntity.email}</strong></div>
                  <div className="vd-row"><label><Lock size={14} /> Access Password</label><strong>{selectedEntity.password || '********'}</strong></div>
                  <div className="vd-row"><label><Building2 size={14} /> Assigned Facility</label><strong>{selectedEntity.hospital || 'Master Hub'}</strong></div>
                </div>
                <div className="vault-warning"><AlertCircle size={14} /> This data is restricted to Primary Admin level authority.</div>
                <button className="btn-submit-ref" onClick={() => setSelectedEntity(null)}>Dismiss Secure View</button>
              </div>
            </motion.div>
          </div>
        )}

        {showHospModal && (
          <div className="admin-modal-overlay" onClick={() => setShowHospModal(false)}>
            <motion.div className="admin-modal-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header-ref"><h2>Add Medical Facility</h2><button className="btn-close-ref" onClick={() => setShowHospModal(false)}><X /></button></div>
              <form onSubmit={handleAddHospital} className="admin-modal-form">
                <div className="admin-input-row">
                  <div className="admin-input-group"><label>Hospital Name</label><input name="name" required placeholder="e.g. Metro Health" /></div>
                  <div className="admin-input-group"><label>City</label><input name="city" required placeholder="e.g. Mumbai" /></div>
                </div>
                <div className="admin-divider-ref">Authentication</div>
                <div className="admin-input-group"><label><Mail size={14} /> Login Email</label><input name="email" type="email" required placeholder="hospital@healthcare.com" /></div>
                <div className="admin-input-group"><label><Lock size={14} /> Password</label><input name="password" type="password" required placeholder="••••••••" /></div>
                <button type="submit" className="btn-submit-ref">Register Facility</button>
              </form>
            </motion.div>
          </div>
        )}

        {showDocModal && (
          <div className="admin-modal-overlay" onClick={() => setShowDocModal(false)}>
            <motion.div className="admin-modal-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header-ref"><h2>Onboard Specialist</h2><button className="btn-close-ref" onClick={() => setShowDocModal(false)}><X /></button></div>
              <form onSubmit={handleAddDoctor} className="admin-modal-form">
                <div className="admin-input-row">
                  <div className="admin-input-group"><label>Full Name</label><input name="name" required placeholder="Dr. Jane Doe" /></div>
                  <div className="admin-input-group"><label>Specialty</label><select name="specialty"><option>Cardiology</option><option>Dermatology</option><option>Pediatrics</option><option>Neurology</option></select></div>
                </div>
                <div className="admin-input-group">
                  <label><Building2 size={14} /> Assign to Hospital</label>
                  <select name="hospital" required><option value="">Select Facility</option>{hospitals.map(h => (<option key={h.id} value={h.name}>{h.name} ({h.city})</option>))}</select>
                </div>
                <div className="admin-divider-ref">Authentication</div>
                <div className="admin-input-group"><label><Mail size={14} /> Doctor's Email</label><input name="email" type="email" required placeholder="doctor@healthcare.com" /></div>
                <div className="admin-input-group"><label><Lock size={14} /> Password</label><input name="password" type="password" required placeholder="••••••••" /></div>
                <div className="admin-input-group"><label>Consultation Fee (₹)</label><input name="fee" type="number" defaultValue="800" /></div>
                <button type="submit" className="btn-submit-ref">Authorize Doctor</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-divider-ref { margin: 1.5rem 0 1rem; font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }
        .admin-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .admin-portal-elite { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; background: #f8fafc; }
        .admin-sidebar { background: #0f172a; color: white; padding: 2rem; display: flex; flex-direction: column; }
        .sidebar-brand { display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem; font-size: 1.25rem; font-weight: 800; color: #3b82f6; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .sidebar-nav button { background: transparent; border: none; color: #94a3b8; padding: 1rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; font-weight: 600; cursor: pointer; transition: 0.2s; text-align: left; }
        .sidebar-nav button.active { background: #1e293b; color: white; }
        .btn-exit { background: transparent; border: 1px solid #1e293b; color: #94a3b8; padding: 0.75rem; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
        .admin-main { padding: 3rem 4rem; overflow-y: auto; }
        .admin-header-ref { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
        .admin-header-ref h1 { font-size: 2.25rem; font-weight: 900; color: #1e3a8a; }
        .admin-header-ref p { color: #64748b; font-weight: 600; }
        .admin-status-pill { background: #dcfce7; color: #166534; padding: 0.5rem 1rem; border-radius: 100px; font-weight: 800; font-size: 0.7rem; }
        .pane-header-elite { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .btn-action-add { background: #3b82f6; color: white; border: none; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
        .hospitals-grid-elite { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .hosp-card-admin { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #f1f5f9; display: flex; gap: 1.25rem; align-items: center; }
        .hosp-icon-p { width: 50px; height: 50px; background: #f1f5f9; border-radius: 15px; display: flex; align-items: center; justify-content: center; color: #64748b; }
        .hosp-details-p h3 { font-size: 1.1rem; color: #1e293b; margin-bottom: 0.5rem; }
        .hosp-meta-p { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem; font-weight: 600; }
        .doctors-table-elite { background: white; border-radius: 20px; border: 1px solid #f1f5f9; overflow: hidden; }
        .table-header { display: grid; grid-template-columns: 1.5fr 1fr 1.5fr 1fr; padding: 1.25rem 2rem; background: #f8fafc; color: #64748b; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; }
        .table-row { display: grid; grid-template-columns: 1.5fr 1fr 1.5fr 1fr; padding: 1.25rem 2rem; border-top: 1px solid #f1f5f9; align-items: center; font-size: 0.9rem; }
        .doc-name-cell { font-weight: 700; color: #1e293b; }
        .doc-spec-cell { color: #3b82f6; font-weight: 700; }
        .doc-actions-cell { display: flex; gap: 0.5rem; }
        .btn-view-creds { padding: 0.5rem 0.75rem; background: #eff6ff; color: #3b82f6; border: none; border-radius: 8px; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; }
        .btn-delete-node { padding: 0.5rem; color: #ef4444; background: transparent; border: none; cursor: pointer; }
        
        .admin-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: center; }
        .admin-modal-card { background: white; width: 100%; max-width: 500px; border-radius: 2.5rem; padding: 3rem; box-shadow: 0 40px 100px rgba(0,0,0,0.25); }
        .cred-vault-elite { text-align: left; }
        .vault-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .vd-row { margin-bottom: 1.25rem; }
        .vd-row label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem; }
        .vd-row strong { font-size: 1.1rem; color: #1e293b; font-weight: 900; word-break: break-all; }
        .vault-warning { background: #fff7ed; color: #9a3412; padding: 1rem; border-radius: 12px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 0.75rem; margin-top: 1.5rem; border: 1px solid #ffedd5; }
        
        .modal-header-ref { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .btn-close-ref { background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .admin-input-group { margin-bottom: 1rem; }
        .admin-input-group label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 800; color: #64748b; margin-bottom: 0.5rem; }
        .admin-input-group input, .admin-input-group select { width: 100%; padding: 0.85rem; border-radius: 12px; border: 1.5px solid #e2e8f0; outline: none; font-size: 0.9rem; }
        .btn-submit-ref { width: 100%; padding: 1.1rem; background: #0f172a; color: white; border: none; border-radius: 15px; font-weight: 800; cursor: pointer; transition: 0.2s; margin-top: 1rem; }
      `}</style>
    </div>
  );
};

export default AdminPortal;
