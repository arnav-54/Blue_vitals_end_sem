import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Clock, Star, 
  Activity, Plus, Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import AppointmentBooking from '../components/AppointmentBooking';
import './Doctors.css';

const Doctors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [cityFilter, setCityFilter] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const city = params.get('location');
    const specialty = params.get('specialty');
    if (search) setSearchQuery(search);
    if (city) setCityFilter(city);
    if (specialty) setSelectedSpecialty(specialty);
  }, [location.search]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await api.getDoctors();
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(d => ({
            ...d,
            displayName: d.user?.name || d.name,
            displaySpecialty: d.speciality,
            displayHospital: d.hospital?.name || 'Independent',
            displayCity: d.city || d.hospital?.city || '',
            experience: `${d.experience} Years`,
            fee: d.fees,
            rating: d.averageRating || '4.5'
          }));
          setDoctors(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const specialties = useMemo(() => {
    const s = [...new Set(doctors.map(d => d.displaySpecialty).filter(Boolean))];
    return ['All Specialties', ...s.sort()];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return (doctors || []).filter(doc => {
      if (!doc) return false;
      const q = (searchQuery || '').toLowerCase();
      const name = (doc.displayName || '').toLowerCase();
      const spec = (doc.displaySpecialty || '').toLowerCase();
      const city = (doc.displayCity || '').toLowerCase();
      const matchesSearch = name.includes(q) || spec.includes(q) || city.includes(q);
      const matchesSpec = selectedSpecialty === 'All Specialties' || doc.displaySpecialty === selectedSpecialty;
      const matchesCity = !cityFilter || city.includes(cityFilter.toLowerCase());
      return matchesSearch && matchesSpec && matchesCity;
    });
  }, [doctors, searchQuery, selectedSpecialty, cityFilter]);

  const handleOpenBooking = (doctor) => {
    const user = localStorage.getItem('user');
    if (!user) { navigate('/login'); return; }
    setShowBookingModal(doctor);
  };

  if (loading) return <div className="premium-loading-container"><div className="medical-loader"><Stethoscope size={40} /></div></div>;

  return (
    <div className="doctors-page">
      <header className="doctors-header-elite">
        <div className="container">
          <h1 className="title-ref">Find Your Specialist</h1>
          <p className="subtitle-ref">Book appointments with unique, verified medical experts</p>
          <div className="search-bar-ref">
            <Search className="search-icon-ref" size={20} />
            <input type="text" placeholder="Search by name, specialty or city..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </header>

      <main className="container-ref">
        <div className="main-layout-ref">
          <aside className="sidebar-ref">
            <div className="filter-box-ref">
              <div className="filter-title-ref"><Filter size={18} /> <h3>Filters</h3></div>
              <div className="filter-item-ref">
                <label>Specialty</label>
                <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)}>
                  {specialties.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="filter-item-ref">
                <label>City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={cityFilter}
                  onChange={e => setCityFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </aside>

          <section className="results-ref">
            <div className="results-header-ref"><h3>{filteredDoctors.length} Experts Ready</h3></div>
            <div className="doctors-grid-ref">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="card-ref">
                  <div className="card-header-ref"><div className="avatar-p"><Activity size={20} color="#3b82f6" /></div><span className="status-ref">VERIFIED</span></div>
                  <div className="card-body-ref">
                    <h3 className="name-ref">{doc.displayName}</h3>
                    <span className="spec-ref">{doc.displaySpecialty}</span>
                    <div className="meta-ref"><Clock size={14} /> <span>{doc.experience || '12+ Years'}</span></div>
                    <div className="meta-ref"><MapPin size={14} /> <span>{doc.displayCity || doc.displayHospital}</span></div>
                    <div className="rating-ref">
                      <Star size={16} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontWeight: 800, marginLeft: '6px', color: '#1e293b' }}>{doc.rating || '4.5'}</span>
                    </div>
                  </div>
                  <div className="card-footer-ref">
                    <div className="fee-ref"><span>Session Fee</span> <strong>₹{doc.fee || '800'}</strong></div>
                    <div className="actions-ref">
                      <button className="btn-secondary-ref" onClick={() => navigate(`/doctors/${doc.id}`)}>Profile</button>
                      <button className="btn-primary-ref" onClick={() => handleOpenBooking(doc)}>Book Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {showBookingModal && (
        <AppointmentBooking 
          doctor={showBookingModal} 
          onClose={() => setShowBookingModal(null)} 
          onSuccess={() => { setShowBookingModal(null); navigate('/user-portal?tab=appointments'); }}
        />
      )}
    </div>
  );
};

export default Doctors;
