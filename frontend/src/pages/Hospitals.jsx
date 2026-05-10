import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Phone, Clock, Search, Filter, 
  ChevronRight, Star, ShieldCheck, Activity,
  Stethoscope, Users, Heart, ArrowRight, X, PhoneCall,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import './Hospitals.css';

const Hospitals = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [showBedModal, setShowBedModal] = useState(null);

  // Modal State
  const [bedForm, setBedForm] = useState({ admissionType: 'General', urgency: 'Normal' });

  useEffect(() => {
    api.getHospitals()
      .then(r => r.ok ? r.json() : [])
      .then(data => setHospitals(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load hospitals'))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenBedModal = (hospital) => {
    if (!localStorage.getItem('token')) {
      toast.error('Please login to reserve a bed');
      navigate('/login');
      return;
    }
    setShowBedModal(hospital);
  };

  const submitBedRequest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const bedTypeMap = { 'General Ward': 'GENERAL', 'Private Suite': 'PRIVATE', 'ICU Care': 'ICU' };
      const res = await api.createBedBooking({
        hospitalId: showBedModal.id,
        bedType: bedTypeMap[bedForm.admissionType] || 'GENERAL',
        admissionDate: new Date().toISOString(),
      }, token);
      if (!res.ok) throw new Error();
      toast.success(`Bed booked at ${showBedModal.name}!`);
      setShowBedModal(null);
    } catch {
      toast.error('Booking failed. Please try again.');
    }
  };

  const cities = ['All Cities', ...new Set(hospitals.map(h => h.city).filter(Boolean))];

  const filteredHospitals = hospitals.filter(hosp => {
    const matchesSearch = (hosp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (hosp.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'All Cities' || hosp.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  if (loading) return (
    <div className="premium-loading-container"><div className="medical-loader"><div className="pulse-ring"></div><Building2 size={40} /></div></div>
  );

  return (
    <div className="hospitals-page">

      <header className="hospitals-header">
        <div className="container">
          <h1>Medical Centers & Hospitals</h1>
          <p>Locate the best healthcare facilities and check real-time bed availability.</p>
          <div className="search-filters">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input type="text" className="search-input" placeholder="Search hospitals or cities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="filter-wrapper">
              <MapPin size={20} />
              <select className="location-filter" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="container hospitals-content">
        <div className="results-info">Found {filteredHospitals.length} verified facilities</div>
        <div className="hospitals-grid">
          {filteredHospitals.map((hosp, idx) => (
            <div key={hosp.id || idx} className="hospital-card">
              <div className="hospital-header">
                <div className="hospital-icon"><Building2 size={24} color="#3b82f6" /></div>
                <div className="hospital-basic-info">
                  <h3>{hosp.name}</h3>
                  <div className="hospital-rating"><Star className="rating-icon" size={14} fill="#f59e0b" /> <span>4.8 (Trusted)</span></div>
                </div>
              </div>

              <div className="hospital-details">
                <div className="detail-item"><MapPin size={16} /> <span>{hosp.address || hosp.city}</span></div>
                {hosp.phone && <div className="detail-item"><Phone size={16} /> <span>{hosp.phone}</span></div>}
                <div className="hospital-stats">
                  <div className="stat-item"><Users size={16} /> <span>{hosp.doctors?.length || 0} Doctors</span></div>
                  <div className="stat-item emergency"><AlertCircle size={16} /> <span className="emergency-badge">24/7 ER Active</span></div>
                </div>
              </div>

              <div className="hospital-actions">
                <button className="btn-secondary"><PhoneCall size={16} /> Call</button>
                <button className="btn-primary" onClick={() => handleOpenBedModal(hosp)}>Book Bed</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {showBedModal && (
          <div className="elite-custom-modal-overlay" onClick={() => setShowBedModal(null)}>
            <motion.div className="elite-custom-modal-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="modal-top">
                <h3>Bed Reservation</h3>
                <button className="close-x" onClick={() => setShowBedModal(null)}><X size={20} /></button>
              </div>
              <p className="modal-sub">Requesting admission node at <strong>{showBedModal.name}</strong></p>
              <form onSubmit={submitBedRequest} className="modal-form-p">
                <div className="m-form-group">
                  <label>Admission Type</label>
                  <select value={bedForm.admissionType} onChange={e => setBedForm({...bedForm, admissionType: e.target.value})}>
                    <option>General Ward</option><option>Private Suite</option><option>ICU Care</option>
                  </select>
                </div>
                <div className="m-form-group" style={{ marginTop: '1.5rem' }}>
                  <label>Emergency Level</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {['Normal', 'Critical'].map(u => (
                      <div key={u} className={`priority-btn ${bedForm.urgency === u ? 'active' : ''}`} onClick={() => setBedForm({...bedForm, urgency: u})} style={{ flex: 1, textAlign: 'center', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>{u}</div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="m-submit-btn" style={{ background: '#7c3aed', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>Reserve Node</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .elite-custom-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .elite-custom-modal-content { background: white; width: 100%; max-width: 450px; border-radius: 2rem; padding: 2.5rem; box-shadow: 0 30px 60px rgba(0,0,0,0.2); }
        .modal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .modal-top h3 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .modal-sub { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; }
        .close-x { background: #f1f5f9; border: none; padding: 8px; border-radius: 10px; cursor: pointer; color: #94a3b8; }
        .m-form-group label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; }
        .m-form-group select { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; }
        .priority-btn.active { background: #7c3aed; color: white; border-color: #7c3aed !important; }
        .m-submit-btn { width: 100%; color: white; border: none; padding: 1rem; border-radius: 12px; font-weight: 700; margin-top: 2rem; cursor: pointer; }
        .premium-loading-container { display: flex; justify-content: center; align-items: center; height: 100vh; }
        .pulse-ring { width: 60px; height: 60px; border: 4px solid #3b82f6; border-radius: 50%; position: absolute; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
      `}</style>
    </div>
  );
};

export default Hospitals;