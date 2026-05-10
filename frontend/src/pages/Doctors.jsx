import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [showBookingModal, setShowBookingModal] = useState(null);

  useEffect(() => {
    const initDoctors = async () => {
      setLoading(true);
      try {
        // 🏥 1. UNIQUE CLINICIAN REPOSITORY (No Repeats)
        const uniqueNames = [
          "Dr. Aditi Sharma", "Dr. Rohan Mehra", "Dr. Priya Iyer", "Dr. Vikram Seth", 
          "Dr. Sanya Mirza", "Dr. Arjun Kapoor", "Dr. Kavita Devi", "Dr. Rahul Bajaj",
          "Dr. Neha Kakkar", "Dr. Amit Shah", "Dr. Deepa Malik", "Dr. Kunal Kohli",
          "Dr. Pooja Hegde", "Dr. Siddharth Roy", "Dr. Meera Bai", "Dr. Varun Dhawan",
          "Dr. Kriti Sanon", "Dr. Ishan Kishan", "Dr. Tara Sutaria", "Dr. Yash Raj",
          "Dr. Kiara Advani", "Dr. Kabir Singh", "Dr. Ananya Panday", "Dr. Rajat Sharma",
          "Dr. Sunita Williams", "Dr. Milkha Singh", "Dr. Mary Kom", "Dr. Pankaj Advani",
          "Dr. Sania Nehwal", "Dr. Abhinav Bindra", "Dr. Vishy Anand", "Dr. Leander Paes",
          "Dr. Sachin Tendulkar", "Dr. Virat Kohli", "Dr. MS Dhoni", "Dr. Kapil Dev",
          "Dr. Sunil Chhetri", "Dr. Bhaichung Bhutia", "Dr. PT Usha", "Dr. Hima Das",
          "Dr. Neeraj Chopra", "Dr. PV Sindhu"
        ];
        
        const specs = ["Cardiology", "Neurology", "Pediatrics", "Dermatology", "Orthopedics", "Ophthalmology", "Psychiatry", "Gastroenterology"];
        const hosps = ["Metro Health Center", "City General Hospital", "Apollo Hospital", "Max Healthcare", "Narayana Health", "Fortis Hospital", "Lilavati Medical"];

        const baseDocs = uniqueNames.map((name, i) => ({
          id: `unique-sys-${i}`,
          displayName: name,
          displaySpecialty: specs[i % specs.length],
          displayHospital: hosps[i % hosps.length],
          experience: `${10 + (i % 15)} Years`,
          fee: 850 + (i * 15) % 1500,
          rating: (4.4 + (i % 6) / 10).toFixed(1)
        }));

        // 🛡️ 2. LOAD EXTERNAL DATA
        let localElite = [];
        try { localElite = JSON.parse(localStorage.getItem('elite_doctors') || '[]'); } catch (e) { localElite = []; }
        
        const sanitizedLocal = localElite.map(d => {
          const hasHospObj = d.hospital && typeof d.hospital === 'object';
          return {
            ...d,
            id: d.id || `local-${Math.random()}`,
            displayName: d.name || "Specialist",
            displaySpecialty: d.specialty || "General Medicine",
            displayHospital: hasHospObj ? (d.hospital.name || 'Elite Hub') : (d.hospital || 'Elite Hub')
          };
        });

        // 3. FINAL SYNC (Prioritize local, then demo)
        setDoctors([...sanitizedLocal, ...baseDocs]);
      } catch (err) {
        console.error("Critical Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    initDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    return (doctors || []).filter(doc => {
      if (!doc) return false;
      const q = (searchQuery || '').toLowerCase();
      const name = (doc.displayName || '').toLowerCase();
      const spec = (doc.displaySpecialty || '').toLowerCase();
      const matchesSearch = name.includes(q) || spec.includes(q);
      const matchesSpec = selectedSpecialty === 'All Specialties' || doc.displaySpecialty === selectedSpecialty;
      return matchesSearch && matchesSpec;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

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
            <input type="text" placeholder="Search by name or specialty..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
                  <option>All Specialties</option>
                  {["Cardiology", "Neurology", "Pediatrics", "Dermatology", "Orthopedics", "Ophthalmology", "Psychiatry", "Gastroenterology"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
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
                    <div className="meta-ref"><MapPin size={14} /> <span>{doc.displayHospital}</span></div>
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