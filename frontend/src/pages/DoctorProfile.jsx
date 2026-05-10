import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Star,
    MapPin,
    Clock,
    DollarSign,
    User,
    ChevronLeft,
    Calendar,
    Award,
    ShieldCheck,
    MessageSquare,
    Activity,
    CheckCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';
import AppointmentBooking from '../components/AppointmentBooking';
import './DoctorProfile.css';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBooking, setShowBooking] = useState(false);

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            try {
                setLoading(true);
                
                // 🔍 Check Local Admin Registry first (For Sheli Pandey & others)
                const eliteDoctorsRaw = localStorage.getItem('elite_doctors');
                let eliteDoctors = [];
                try { eliteDoctors = eliteDoctorsRaw ? JSON.parse(eliteDoctorsRaw) : []; } catch (e) { eliteDoctors = []; }
                
                // Try to find the doctor in the local registry (using string comparison for ID safety)
                const localDoc = eliteDoctors.find(d => String(d.id) === String(id));

                if (localDoc) {
                    setDoctor({
                        ...localDoc,
                        experience: localDoc.experience || '12 years',
                        rating: localDoc.rating || 4.5,
                        reviews: localDoc.reviews || Math.floor(Math.random() * 150),
                        qualification: localDoc.qualification || 'MBBS, MD',
                        bio: localDoc.bio || `Dr. ${localDoc.name} is a highly experienced specialist dedicated to providing exceptional care in ${localDoc.specialty}.`,
                        available: true,
                        achievements: [
                            "Top Rated Specialist 2024",
                            "Medical Excellence Award",
                            "Board Certified Professional"
                        ]
                    });
                    setLoading(false);
                    return;
                }

                // 🌐 Fallback to API for database doctors
                try {
                    const response = await api.getDoctorById(id);
                    if (response.ok) {
                        const data = await response.json();
                        setDoctor({
                            id: data.id,
                            name: data.user?.name || 'Unknown Doctor',
                            specialty: data.speciality,
                            experience: `${data.experience}+ years`,
                            rating: data.averageRating || 4.5,
                            reviews: data.totalReviews || 0,
                            fee: data.fees,
                            hospital: (data.hospital && typeof data.hospital === 'object') ? (data.hospital.name || 'Elite Hub') : (data.hospital || 'Elite Hub'),
                            location: (data.hospital && typeof data.hospital === 'object') ? (data.hospital.city || 'Mumbai') : (data.location || 'Mumbai'),
                            qualification: data.qualification || 'Specialist',
                            bio: data.bio || `Dr. ${data.user?.name} is a highly experienced ${data.speciality} dedicated to providing exceptional care.`,
                            available: data.isAvailable !== false,
                            achievements: ["Top Rated Specialist 2023", "Medical Excellence Award", "Board Certified Professional"]
                        });
                        setLoading(false);
                        return;
                    }
                } catch (apiErr) { console.warn("API Doctor Fetch Failed"); }

                throw new Error('Doctor not found');
            } catch (err) {
                console.error('Error fetching doctor:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorDetails();
    }, [id]);

    const handleBookNow = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to book an appointment');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }
        setShowBooking(true);
    };

    if (loading) return (
        <div className="profile-loading-container">
            <div className="medical-loader"><div className="pulse-ring"></div><Activity size={32} /></div>
            <p>Syncing Clinician Data...</p>
        </div>
    );

    if (error || !doctor) return (
        <div className="profile-error-container">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <h2>Oops! Profile Not Found</h2>
                <p>The clinician profile you are looking for is currently being updated.</p>
                <button onClick={() => navigate('/doctors')} className="back-btn">
                    <ChevronLeft size={20} /> Back to Search
                </button>
            </motion.div>
        </div>
    );

    return (
        <div className="doctor-profile-page">
            <Toaster position="top-right" />
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-navigation"><ChevronLeft size={20} /> Back</button>

                <div className="profile-layout">
                    <div className="profile-main">
                        <div className="doctor-hero-card">
                            <div className="doctor-hero-header">
                                <div className="profile-image-large"><User size={64} /></div>
                                <div className="hero-info">
                                    <div className="name-row">
                                        <h1>{doctor.name}</h1>
                                        <span className={`status-pill ${doctor.available ? 'available' : 'busy'}`}>{doctor.available ? 'Available' : 'Busy'}</span>
                                    </div>
                                    <p className="specialty-text">{doctor.specialty}</p>
                                    <p className="qualification-text">{doctor.qualification}</p>
                                    <div className="rating-summary">
                                        <div className="stars"><Star size={18} fill="#F59E0B" color="#F59E0B" /><span className="rating-val">{doctor.rating}</span></div>
                                        <span className="review-count">(Based on {doctor.reviews} patient reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hero-stats-grid">
                                <div className="stat-item"><Clock size={24} className="stat-icon" /><div><span className="stat-label">Experience</span><span className="stat-value">{doctor.experience}</span></div></div>
                                <div className="stat-item"><MapPin size={24} className="stat-icon" /><div><span className="stat-label">Location</span><span className="stat-value">{doctor.location || 'India'}</span></div></div>
                                <div className="stat-item"><DollarSign size={24} className="stat-icon" /><div><span className="stat-label">Consultation Fee</span><span className="stat-value">₹{doctor.fee}</span></div></div>
                            </div>
                        </div>

                        <div className="profile-content-section">
                            <h3><User size={22} /> About Doctor</h3>
                            <p className="bio-text">{doctor.bio}</p>
                        </div>

                        <div className="profile-content-section">
                            <h3><Award size={22} /> Specializations & Expertise</h3>
                            <div className="tags-container">
                                <span className="expert-tag">{doctor.specialty}</span>
                                <span className="expert-tag">Patient Counseling</span>
                                <span className="expert-tag">Board Certified</span>
                            </div>
                        </div>
                    </div>

                    <aside className="profile-sidebar">
                        <div className="booking-sticky-card">
                            <h3>Book Appointment</h3>
                            <p>Secure your slot instantly</p>
                            <div className="price-overview"><span>Fee per Visit</span><span className="price">₹{doctor.fee}</span></div>
                            <button className={`booking-btn ${!doctor.available ? 'disabled' : ''}`} onClick={handleBookNow} disabled={!doctor.available}>
                                {doctor.available ? 'Continue to Booking' : 'Not Available'}
                            </button>
                            <div className="booking-perks">
                                <div className="perk"><ShieldCheck size={16} /><span>Verified Professional</span></div>
                                <div className="perk"><MessageSquare size={16} /><span>Instant Confirmation</span></div>
                            </div>
                        </div>

                        <div className="achievements-card">
                            <h3>Achievements</h3>
                            <ul>
                                {doctor.achievements.map((ach, idx) => (
                                    <li key={idx}><div className="achievement-icon-bg"><Award size={16} /></div><span>{ach}</span></li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
