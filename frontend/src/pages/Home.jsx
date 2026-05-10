import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  Container,
  TextField,
  InputAdornment,
  Avatar,
  Rating,
} from '@mui/material';
import {
  Search,
  LocationOn,
  AirportShuttle,
  CalendarToday,
  LocalHospital,
  Favorite,
  Psychology,
  Accessibility,
  ChildCare,
  Visibility,
  MedicalServices,
} from '@mui/icons-material';
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
                icon: <AirportShuttle className="action-icon emergency" />,
                title: 'Emergency Care',
                description: 'Get immediate medical attention with our 24/7 emergency services',
                buttonText: 'Call Ambulance',
                type: 'emergency',
                action: 'emergency'
              },
              {
                icon: <CalendarToday className="action-icon" />,
                title: 'Book Appointment',
                description: 'Schedule consultations with top doctors at your preferred time',
                buttonText: 'Book Now',
                type: 'primary',
                action: 'appointment'
              },
              {
                icon: <LocalHospital className="action-icon" />,
                title: 'Find Hospitals',
                description: 'Locate nearby hospitals with advanced medical facilities',
                buttonText: 'Find Hospitals',
                type: 'primary',
                action: 'hospitals'
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
                  <div className={`action-icon ${action.type === 'emergency' ? 'emergency' : ''}`}>
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
                <LocalHospital style={{ width: 32, height: 32 }} className="loader-icon" />
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
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'var(--color-primary-50)',
                            color: 'var(--color-primary-600)',
                            mr: 2,
                            border: '2px solid white',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <LocalHospital />
                        </Avatar>
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
                          <CalendarToday style={{ fontSize: '0.9rem' }} /> {doctor.experience}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <LocationOn style={{ fontSize: '0.9rem' }} /> {doctor.hospital}
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
              { name: 'Cardiologist', label: 'Cardiology', icon: <Favorite />, count: '150+', color: '#ef4444' },
              { name: 'Neurologist', label: 'Neurology', icon: <Psychology />, count: '120+', color: 'var(--color-primary-600)' },
              { name: 'Orthopedic', label: 'Orthopedics', icon: <Accessibility />, count: '200+', color: '#f59e0b' },
              { name: 'Pediatrician', label: 'Pediatrics', icon: <ChildCare />, count: '180+', color: 'var(--color-success)' },
              { name: 'Dermatologist', label: 'Dermatology', icon: <MedicalServices />, count: '90+', color: '#8b5cf6' },
              { name: 'Gynecologist', label: 'Gynecology', icon: <MedicalServices />, count: '110+', color: '#ec4899' },
              { name: 'Dentist', label: 'Dentistry', icon: <MedicalServices />, count: '160+', color: '#06b6d4' },
              { name: 'Ophthalmologist', label: 'Ophthalmology', icon: <Visibility />, count: '80+', color: '#f97316' },
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