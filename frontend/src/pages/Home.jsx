import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  Container,
  TextField,
  InputAdornment,
  Rating,
} from '@mui/material';
import { Search, LocationOn } from '@mui/icons-material';

const IconAmbulance = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h11l4 4v6a1 1 0 0 1-1 1h-1"/>
    <path d="M14 17H10"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
    <path d="M8 10V7"/>
    <path d="M6.5 8.5h3"/>
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4"/>
    <path d="M8 2v4"/>
    <path d="M3 10h18"/>
    <path d="M8 14h.01"/>
    <path d="M12 14h.01"/>
    <path d="M16 14h.01"/>
    <path d="M8 18h.01"/>
    <path d="M12 18h.01"/>
  </svg>
);

const IconHospital = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6v4"/>
    <path d="M10 8h4"/>
    <path d="M3 21V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13"/>
    <path d="M1 21h22"/>
    <path d="M9 21v-4a3 3 0 0 1 6 0v4"/>
  </svg>
);

const IconDoctor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
import { motion } from 'framer-motion';
import api from '../services/api';
import './Home.css';
import heroImage from '../assets/hero_medical.png';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedDoctors();
  }, []);

  const fetchFeaturedDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDoctors('?limit=3&featured=true');

      if (response.ok) {
        const data = await response.json();
        const transformedDoctors = data.map((doctor, index) => ({
          id: doctor.id,
          name: doctor.user.name,
          specialty: doctor.speciality,
          experience: `${doctor.experience}+ years`,
          rating: doctor.averageRating || 4.5,
          reviews: doctor.totalReviews || 0,
          fee: doctor.fees,
          hospital: doctor.hospital.name,
          image: null,
          available: doctor.isAvailable !== false
        }));
        setFeaturedDoctors(transformedDoctors);
      } else {
        throw new Error('Failed to fetch doctors');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const mockFeaturedDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      experience: "15+ years",
      rating: 4.9,
      reviews: 127,
      fee: 800,
      hospital: "Apollo Hospital",
      image: null,
      available: true
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Neurologist",
      experience: "12+ years",
      rating: 4.8,
      reviews: 98,
      fee: 1200,
      hospital: "Max Healthcare",
      image: null,
      available: true
    },
    {
      id: 3,
      name: "Dr. Emily Davis",
      specialty: "Pediatrician",
      experience: "10+ years",
      rating: 4.9,
      reviews: 156,
      fee: 600,
      hospital: "Fortis Hospital",
      image: null,
      available: false
    }
  ];

  const displayDoctors = (featuredDoctors.length > 0 ? featuredDoctors : (error ? mockFeaturedDoctors : [])).slice(0, 3);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (location) params.append('location', location);
    navigate(`/doctors?${params.toString()}`);
  };

  const handleSpecialtyClick = (specialty) => {
    navigate(`/doctors?specialty=${specialty}`);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'emergency': navigate('/emergency'); break;
      case 'appointment': navigate('/doctors'); break;
      case 'hospitals': navigate('/hospitals'); break;
      default: break;
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <Container>
          <div className="hero-grid">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-content"
            >
              <h1 className="hero-title">Your health, our priority</h1>
              <p className="hero-subtitle">
                Connect with carefully vetted doctors, book appointments instantly, and manage your health with BlueVitals — your local healthcare companion.
              </p>

              <div className="search-bar-container">
                <div className="search-input-field">
                  <TextField
                    fullWidth
                    placeholder="Search doctors, specialties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: 'var(--color-primary-600)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        border: 'none',
                        '& fieldset': { border: 'none' },
                      },
                    }}
                  />
                </div>
                <div className="search-divider" />
                <div className="search-location-field">
                  <TextField
                    fullWidth
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: 'var(--color-primary-600)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        border: 'none',
                        '& fieldset': { border: 'none' },
                      },
                    }}
                  />
                </div>
                <button
                  className="btn btn-primary search-btn"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>

              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">35+</span>
                  <span className="stat-label">Doctors</span>
                </div>
                <div className="stat">
                  <span className="stat-number">30+</span>
                  <span className="stat-label">Hospitals</span>
                </div>
                <div className="stat">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-image-container"
            >
              <img src={heroImage} alt="Professional Healthcare" className="hero-main-image" />
              <div className="experience-badge">
                <span className="badge-number">10+</span>
                <span className="badge-text">Years of Trust</span>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <Container>
          <div className="section-header">
            <h2>Quick Actions</h2>
            <p>Everything you need for your healthcare journey</p>
          </div>

          <div className="grid grid-3">
            {[
              {
                icon: <IconAmbulance />,
                title: 'Emergency Care',
                description: 'Get immediate medical attention with our 24/7 emergency services',
                buttonText: 'Call Ambulance',
                type: 'emergency',
                action: 'emergency',
                color: 'var(--color-error)'
              },
              {
                icon: <IconCalendar />,
                title: 'Book Appointment',
                description: 'Schedule consultations with top doctors at your preferred time',
                buttonText: 'Book Now',
                type: 'primary',
                action: 'appointment',
                color: 'var(--color-primary-600)'
              },
              {
                icon: <IconHospital />,
                title: 'Find Hospitals',
                description: 'Locate nearby hospitals with advanced medical facilities',
                buttonText: 'Find Hospitals',
                type: 'primary',
                action: 'hospitals',
                color: 'var(--color-primary-600)'
              },
            ].map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="action-card">
                  <div className={`action-icon ${action.type === 'emergency' ? 'emergency' : ''}`} style={{ color: action.color }}>
                    {action.icon}
                  </div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                  <button
                    className={`btn ${action.type === 'emergency' ? 'btn-primary' : 'btn-secondary'}`}
                    style={action.type === 'emergency' ? { backgroundColor: 'var(--color-error)' } : { width: '100%' }}
                    onClick={() => handleQuickAction(action.action)}
                  >
                    {action.buttonText}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Doctors */}
      <section className="featured-doctors">
        <Container>
          <div className="section-header">
            <h2>Top Rated Doctors</h2>
            <p>Consult with our experienced healthcare professionals</p>
          </div>

          {loading ? (
            <div className="premium-loading-container" style={{ minHeight: '300px' }}>
              <div className="medical-loader">
                <div className="pulse-ring"></div>
                <div className="loader-icon" style={{ width: 32, height: 32, color: 'var(--color-primary-600)' }}><IconHospital /></div>
              </div>
              <p className="loading-text">Loading top-rated doctors...</p>
              <div className="loading-progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-3 doctors-grid">
                {displayDoctors.map((doctor) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="card">
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{
                          width: 60, height: 60, borderRadius: '50%',
                          background: 'var(--color-primary-50)',
                          color: 'var(--color-primary-600)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginRight: '1rem', border: '2px solid white',
                          boxShadow: 'var(--shadow-sm)', flexShrink: 0, padding: 14, boxSizing: 'border-box'
                        }}>
                          <IconDoctor />
                        </div>
                        <div>
                          <div className={`status-pill ${doctor.available ? 'CONFIRMED' : 'REJECTED'}`}>
                            {doctor.available ? 'Available' : 'Busy'}
                          </div>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{doctor.name}</h3>
                      <p style={{ color: 'var(--color-primary-600)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        {doctor.specialty}
                      </p>
                      <div style={{ color: 'var(--color-gray-500)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                          <IconClock /> {doctor.experience}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <IconPin /> {doctor.hospital}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
                        <Rating value={doctor.rating} readOnly size="small" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)' }}>
                          {doctor.rating} ({doctor.reviews} reviews)
                        </span>
                      </div>

                      <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem' }}>Consultation Fee</span>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{doctor.fee}</span>
                      </div>

                      <div className="grid grid-2" style={{ gap: '0.5rem' }}>
                        <button className="btn btn-secondary" onClick={() => navigate(`/doctors/${doctor.id}`)}>Profile</button>
                        <button className="btn btn-primary" disabled={!doctor.available} onClick={() => navigate('/doctors')}>Book</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <button className="btn btn-secondary btn-large" onClick={() => navigate('/doctors')}>
                  View All Doctors
                </button>
              </div>
            </>
          )}
        </Container>
      </section>

      {/* Specialties */}
      <section className="specialties">
        <Container>
          <div className="section-header">
            <h2>Popular Specialties</h2>
            <p>Find experts in every field</p>
          </div>
          <div className="grid grid-4">
            {[
              {
                name: 'Cardiologist', label: 'Cardiology', count: '150+', color: '#ef4444',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              },
              {
                name: 'Neurologist', label: 'Neurology', count: '120+', color: '#7c3aed',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
              },
              {
                name: 'Orthopedic', label: 'Orthopedics', count: '200+', color: '#f59e0b',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"/><path d="M12 13v8"/><path d="M12 3v3"/></svg>
              },
              {
                name: 'Pediatrician', label: 'Pediatrics', count: '180+', color: '#10b981',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 3"/></svg>
              },
              {
                name: 'Dermatologist', label: 'Dermatology', count: '90+', color: '#8b5cf6',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
              },
              {
                name: 'Gynecologist', label: 'Gynecology', count: '110+', color: '#ec4899',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M12 13v8"/><path d="M9 18h6"/></svg>
              },
              {
                name: 'Dentist', label: 'Dentistry', count: '160+', color: '#06b6d4',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5.5c-1.5-2-4-2.5-5.5-1C4 6 4 9 6 11l6 9 6-9c2-2 2-5-.5-6.5C16 3 13.5 3.5 12 5.5Z"/></svg>
              },
              {
                name: 'Ophthalmologist', label: 'Ophthalmology', count: '80+', color: '#f97316',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              },
            ].map((specialty, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="specialty-card" onClick={() => handleSpecialtyClick(specialty.name)}>
                  <div className="specialty-icon" style={{ color: specialty.color }}>
                    {specialty.icon}
                  </div>
                  <h4>{specialty.label}</h4>
                  <p>{specialty.count} Doctors</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <div className="cta-content">
            <h2>Ready to Take Care of Your Health?</h2>
            <p>Join millions who trust us for their healthcare needs</p>
            <div className="cta-buttons">
              <button
                className="btn btn-primary btn-large"
                style={{ backgroundColor: 'white', color: 'var(--color-primary-800)' }}
                onClick={() => navigate('/doctors')}
              >
                Find a Doctor
              </button>
              <button
                className="btn btn-secondary btn-large"
                style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
                onClick={() => navigate('/doctors')}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer" style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '5rem 0 2rem' }}>
        <Container>
          <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
            <div>
              <Logo width={160} height={50} style={{ filter: 'brightness(0) invert(1)', marginBottom: '1.5rem' }} />
              <p style={{ color: '#93c5fd', fontSize: '0.95rem', lineHeight: '1.8' }}>
                Simplifying healthcare with cutting-edge technology and a patient-first approach. Your health, our priority.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Home', 'Doctors', 'Hospitals', 'Emergency'].map(item => (
                  <li key={item} style={{ marginBottom: '0.75rem' }}>
                    <Link to={`/${item.toLowerCase()}`} style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '0.9rem' }}>{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>Services</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['General Checkup', 'Video Consultation', 'Health Plans', 'Lab Tests'].map(item => (
                  <li key={item} style={{ marginBottom: '0.75rem' }}>
                    <a href="#" style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '0.9rem' }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>Contact Us</h4>
              <p style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '0.75rem' }}>support@bluevitals.com</p>
              <p style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '0.75rem' }}>1800-123-4567</p>
              <p style={{ color: '#93c5fd', fontSize: '0.9rem' }}>Mumbai, India</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(147, 197, 253, 0.2)', paddingTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: '#93c5fd' }}>
            © {new Date().getFullYear()} BlueVitals Healthcare. All rights reserved. Registered Medical Facilitator.
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Home;