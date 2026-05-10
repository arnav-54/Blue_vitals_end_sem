import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, LogIn,
  User, Building2, Stethoscope, Heart, ArrowRight, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import './Auth.css';

const Login = ({ onLogin, adminOnly = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(adminOnly ? 'ADMIN' : 'PATIENT');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const inputEmail = (formData.email || '').trim().toLowerCase();
    const inputPass = (formData.password || '').trim();

    try {
      // 🛡️ 1. MASTER ADMIN BYPASS
      if (inputEmail === 'admin@healthcare.com' && inputPass === 'admin123') {
        const adminUser = { id: 'MASTER_ADMIN', name: 'System Admin', email: 'admin@healthcare.com', role: 'ADMIN' };
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('token', 'MASTER_TOKEN');
        onLogin(adminUser);
        toast.success('Admin Authority Verified');
        navigate('/admin-portal');
        return;
      }

      // 🔍 2. ELITE ONBOARDED AUTH BRIDGE (For Admin-created Doctors & Hospitals)
      const bridgeAuth = JSON.parse(localStorage.getItem('elite_onboarded_auth') || '[]');
      const matched = bridgeAuth.find(a => 
        (a.email || '').trim().toLowerCase() === inputEmail && 
        (a.password || '').trim() === inputPass
      );
      
      if (matched) {
        const bridgeUser = { ...matched };
        delete bridgeUser.password; // Security cleanup
        localStorage.setItem('user', JSON.stringify(bridgeUser));
        localStorage.setItem('token', 'BRIDGE_TOKEN_' + (bridgeUser.id || Date.now()));
        onLogin(bridgeUser);
        toast.success(`Welcome back, ${bridgeUser.name}`);
        
        const role = bridgeUser.role?.toUpperCase();
        if (role === 'DOCTOR') navigate('/doctor-portal');
        else if (role === 'HOSPITAL') navigate('/hospital-portal');
        else navigate('/user-portal');
        return;
      }

      // 🌐 3. STANDARD API AUTH
      const response = await api.login({ email: inputEmail, password: inputPass });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        toast.success(`Welcome back, ${data.user.name}`);
        
        const role = data.user.role?.toUpperCase();
        if (role === 'ADMIN') navigate('/admin-portal');
        else if (role === 'DOCTOR') navigate('/doctor-portal');
        else if (role === 'HOSPITAL') navigate('/hospital-portal');
        else navigate('/user-portal');
      } else {
        toast.error('Invalid credentials. Check your role or details.');
      }
    } catch (error) {
      console.error("Login System Error:", error);
      toast.error('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'PATIENT', label: 'Patient', icon: <Heart size={20} />, color: '#ef4444' },
    { id: 'DOCTOR', label: 'Doctor', icon: <Stethoscope size={20} />, color: '#3b82f6' },
    { id: 'HOSPITAL', label: 'Hospital', icon: <Building2 size={20} />, color: '#7c3aed' },
  ];

  return (
    <div className="auth-page-elite">
      <div className="auth-container-glass">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card-elite">
          <div className="auth-header-elite">
            <div className="logo-symbol-elite"><Heart fill="#3b82f6" color="#3b82f6" /></div>
            <h1>{adminOnly ? 'Admin Portal' : 'Secure Portal Access'}</h1>
            <p>{adminOnly ? 'Restricted access — admins only' : 'Enter your credentials to manage your node'}</p>
          </div>

          {!adminOnly && (
            <div className="role-selector-elite">
              {roles.map(role => (
                <button key={role.id} type="button" onClick={() => setSelectedRole(role.id)} className={`role-pill ${selectedRole === role.id ? 'active' : ''}`} style={{ '--role-color': role.color }}>
                  {role.icon} <span>{role.label}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-elite">
            <div className="input-group-elite">
              <label><Mail size={16} /> Email Address</label>
              <input type="email" name="email" required placeholder="name@example.com" value={formData.email} onChange={handleChange} />
            </div>

            <div className="input-group-elite">
              <label><Lock size={16} /> Password</label>
              <div className="password-wrapper-elite">
                <input type={showPassword ? 'text' : 'password'} name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-btn-elite">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-auth-submit">
              {loading ? 'Validating Token...' : 'Sign In To Portal'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer-elite">
            <p>New member? <Link to="/register">Create Node Account</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;