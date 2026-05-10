import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, 
  UserPlus, Building2, Stethoscope, Heart, ArrowRight, ShieldCheck
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
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.register({ ...formData, role: selectedRole.toLowerCase() });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        toast.success('Account created successfully!');
        
        const role = data.user.role?.toUpperCase();
        if (role === 'DOCTOR') navigate('/doctor-portal');
        else if (role === 'HOSPITAL') navigate('/hospital-portal');
        else navigate('/user-portal');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Registration failed');
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
              <button key={role.id} type="button" onClick={() => setSelectedRole(role.id)} className={`role-pill ${selectedRole === role.id ? 'active' : ''}`} style={{ '--role-color': role.color }}>
                {role.icon} <span>{role.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="auth-form-elite">
            <div className="input-grid-elite">
              <div className="input-group-elite">
                <label><User size={16} /> Full Name</label>
                <input type="text" name="name" required placeholder="Enter name" value={formData.name} onChange={handleChange} />
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