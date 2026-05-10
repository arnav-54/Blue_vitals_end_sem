import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, 
  UserPlus, Building2, Stethoscope, Heart, ArrowRight, ShieldCheck, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import './Auth.css';

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('PATIENT');
  const [hospitals, setHospitals] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    // Hospital fields
    city: '', address: '',
    // Doctor fields
    speciality: '', experience: '', fees: '', qualification: '', hospitalId: '',
  });

  useEffect(() => {
    if (selectedRole === 'DOCTOR') {
      api.getHospitals().then(r => r.ok ? r.json() : []).then(setHospitals).catch(() => {});
    }
  }, [selectedRole]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, city: '', address: '', speciality: '', experience: '', fees: '', qualification: '', hospitalId: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData, role: selectedRole };
      const response = await api.register(payload);
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        toast.success('Account created successfully!');
        
        const role = data.user.role?.toUpperCase();
        if (role === 'DOCTOR') navigate('/doctor-portal');
        else if (role === 'HOSPITAL') navigate('/hospital-portal');
        else if (role === 'ADMIN') navigate('/admin-portal');
        else navigate('/user-portal');
      } else {
        const error = await response.json();
        toast.error(error.message || error.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ REMOVED ADMIN FROM SIGN-UP ROLES
  const roles = [
    { id: 'PATIENT', label: 'Patient', icon: <Heart size={20} />, color: '#ef4444' },
    { id: 'DOCTOR', label: 'Doctor', icon: <Stethoscope size={20} />, color: '#3b82f6' },
    { id: 'HOSPITAL', label: 'Hospital', icon: <Building2 size={20} />, color: '#7c3aed' },
  ];

  return (
    <div className="auth-page-elite">
      <div className="auth-container-glass">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card-elite">
          <div className="auth-header-elite">
            <div className="logo-symbol-elite"><UserPlus color="#3b82f6" /></div>
            <h1>Create Account</h1>
            <p>Join the elite healthcare network today</p>
          </div>

          <div className="role-selector-elite">
            {roles.map(role => (
              <button key={role.id} type="button" onClick={() => handleRoleChange(role.id)} className={`role-pill ${selectedRole === role.id ? 'active' : ''}`} style={{ '--role-color': role.color }}>
                {role.icon} <span>{role.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="auth-form-elite">
            <div className="input-grid-elite">
              <div className="input-group-elite">
                <label><User size={16} /> Full Name {selectedRole === 'HOSPITAL' ? '(Hospital Name)' : ''}</label>
                <input type="text" name="name" required placeholder={selectedRole === 'HOSPITAL' ? 'e.g. Apollo Hospital' : 'Enter name'} value={formData.name} onChange={handleChange} />
              </div>
              <div className="input-group-elite">
                <label><Mail size={16} /> Email Address</label>
                <input type="email" name="email" required placeholder="Enter email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="input-group-elite">
                <label><Phone size={16} /> Phone Number</label>
                <input type="tel" name="phone" required placeholder="Enter phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="input-group-elite">
                <label><Lock size={16} /> Password</label>
                <div className="password-wrapper-elite">
                  <input type={showPassword ? 'text' : 'password'} name="password" required placeholder="Create password" value={formData.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-btn-elite">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {selectedRole === 'HOSPITAL' && (
                <>
                  <div className="input-group-elite">
                    <label><MapPin size={16} /> City</label>
                    <input type="text" name="city" required placeholder="e.g. Mumbai" value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="input-group-elite">
                    <label><Building2 size={16} /> Address</label>
                    <input type="text" name="address" required placeholder="Full hospital address" value={formData.address} onChange={handleChange} />
                  </div>
                </>
              )}

              {selectedRole === 'DOCTOR' && (
                <>
                  <div className="input-group-elite">
                    <label><Stethoscope size={16} /> Speciality</label>
                    <input type="text" name="speciality" required placeholder="e.g. Cardiology" value={formData.speciality} onChange={handleChange} />
                  </div>
                  <div className="input-group-elite">
                    <label><ShieldCheck size={16} /> Qualification</label>
                    <input type="text" name="qualification" required placeholder="e.g. MBBS, MD" value={formData.qualification} onChange={handleChange} />
                  </div>
                  <div className="input-group-elite">
                    <label><User size={16} /> Experience (years)</label>
                    <input type="number" name="experience" required placeholder="e.g. 5" min="0" value={formData.experience} onChange={handleChange} />
                  </div>
                  <div className="input-group-elite">
                    <label><ArrowRight size={16} /> Consultation Fees (₹)</label>
                    <input type="number" name="fees" required placeholder="e.g. 500" min="0" value={formData.fees} onChange={handleChange} />
                  </div>
                  <div className="input-group-elite">
                    <label><MapPin size={16} /> City</label>
                    <input type="text" name="city" placeholder="e.g. Mumbai" value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="input-group-elite" style={{ gridColumn: '1 / -1' }}>
                    <label><Building2 size={16} /> Select Hospital (optional)</label>
                    <select name="hospitalId" value={formData.hospitalId} onChange={handleChange}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', background: 'white' }}>
                      <option value="">— Independent / No Hospital —</option>
                      {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} ({h.city})</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-auth-submit">
              {loading ? 'Initializing...' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer-elite">
            <p>Already a member? <Link to="/login">Sign In</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;