import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Calendar, TrendingUp, Activity,
  Stethoscope, ShieldCheck, LogOut, BedDouble,
  DollarSign, CheckCircle, Clock, XCircle, RefreshCw,
  Plus, X, MapPin, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminPortal = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [docPage, setDocPage] = useState(1);
  const [docTotalPages, setDocTotalPages] = useState(1);
  const [docTotal, setDocTotal] = useState(0);
  const [patPage, setPatPage] = useState(1);
  const [patTotalPages, setPatTotalPages] = useState(1);
  const [patTotal, setPatTotal] = useState(0);
  const [docError, setDocError] = useState(null);
  const [patError, setPatError] = useState(null);
  const [showHospModal, setShowHospModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [hospForm, setHospForm] = useState({ name: '', city: '', address: '', phone: '' });
  const [docForm, setDocForm] = useState({ name: '', email: '', speciality: '', experience: '', fees: '', qualification: '', city: '', hospitalId: '' });

  const [bedBookings, setBedBookings] = useState([]);
  const [bedPage, setBedPage] = useState(1);
  const [bedTotalPages, setBedTotalPages] = useState(1);
  const [bedTotal, setBedTotal] = useState(0);
  const [bedError, setBedError] = useState(null);
  const [credDoctor, setCredDoctor] = useState(null);

  const fetchBedBookings = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/analytics/bed-bookings?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBedBookings(data.bedBookings);
        setBedTotalPages(data.totalPages);
        setBedPage(data.page);
        setBedTotal(data.total);
        setBedError(null);
      } else {
        setBedError(data.error || `Error ${res.status}`);
      }
    } catch (e) { setBedError(e.message); }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/analytics/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_BASE}/hospitals`);
      if (res.ok) setHospitals(await res.json());
      else console.error('Failed to fetch hospitals:', res.status);
    } catch (e) { console.error(e); }
  };

  const fetchDoctors = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/analytics/doctors?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDoctors(data.doctors);
        setDocTotalPages(data.totalPages);
        setDocPage(data.page);
        setDocTotal(data.total);
        setDocError(null);
      } else {
        setDocError(data.error || `Error ${res.status}`);
      }
    } catch (e) { setDocError(e.message); }
  };

  const fetchPatients = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/analytics/patients?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients);
        setPatTotalPages(data.totalPages);
        setPatPage(data.page);
        setPatTotal(data.total);
        setPatError(null);
      } else {
        setPatError(data.error || `Error ${res.status}`);
      }
    } catch (e) { setPatError(e.message); }
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/hospitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(hospForm)
      });
      if (res.ok) {
        toast.success('Hospital added!');
        setShowHospModal(false);
        setHospForm({ name: '', city: '', address: '', phone: '' });
        fetchHospitals();
      } else toast.error('Failed to add hospital');
    } catch (e) { toast.error('Error adding hospital'); }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      // First register the user
      const regRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: docForm.name, email: docForm.email, password: 'Doctor@123', role: 'DOCTOR' })
      });
      if (!regRes.ok) { toast.error('Failed to create doctor account'); return; }
      const regData = await regRes.json();
      // Then create doctor profile
      const profRes = await fetch(`${API_BASE}/doctors/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${regData.token}` },
        body: JSON.stringify({ hospitalId: docForm.hospitalId, speciality: docForm.speciality, experience: parseInt(docForm.experience), fees: parseInt(docForm.fees), qualification: docForm.qualification, city: docForm.city })
      });
      if (profRes.ok) {
        toast.success(`Dr. ${docForm.name} added! Password: Doctor@123`);
        setShowDocModal(false);
        setDocForm({ name: '', email: '', speciality: '', experience: '', fees: '', qualification: '', city: '', hospitalId: '' });
        fetchDoctors();
      } else toast.error('Failed to create doctor profile');
    } catch (e) { toast.error('Error adding doctor'); }
  };

  useEffect(() => { fetchStats(); fetchHospitals(); fetchDoctors(); fetchPatients(); fetchBedBookings(); }, []);

  const kpiCards = stats ? [
    { label: 'Total Users', value: stats.overview.totalUsers, icon: <Users size={22} />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Doctors', value: stats.overview.totalDoctors, icon: <Stethoscope size={22} />, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Patients', value: stats.overview.totalPatients, icon: <Activity size={22} />, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Hospitals', value: stats.overview.totalHospitals, icon: <Building2 size={22} />, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Appointments', value: stats.overview.totalAppointments, icon: <Calendar size={22} />, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Bed Bookings', value: stats.overview.totalBedBookings, icon: <BedDouble size={22} />, color: '#06b6d4', bg: '#ecfeff' },
    { label: 'Ambulance Bookings', value: stats.overview.totalAmbulanceBookings, icon: <Activity size={22} />, color: '#f97316', bg: '#fff7ed' },
    { label: 'Total Revenue', value: `₹${(stats.overview.totalRevenue || 0).toLocaleString()}`, icon: <span style={{ fontSize: '1.375rem', fontWeight: 700, lineHeight: 1, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>₹</span>, color: '#059669', bg: '#ecfdf5' },
  ] : [];

  const appointmentStats = stats ? [
    { label: 'Pending', value: stats.appointments.pending, icon: <Clock size={18} />, color: '#f59e0b' },
    { label: 'Confirmed', value: stats.appointments.confirmed, icon: <CheckCircle size={18} />, color: '#3b82f6' },
    { label: 'Completed', value: stats.appointments.completed, icon: <CheckCircle size={18} />, color: '#10b981' },
    { label: 'Cancelled', value: stats.appointments.cancelled, icon: <XCircle size={18} />, color: '#ef4444' },
  ] : [];

  const roleColors = { PATIENT: '#3b82f6', DOCTOR: '#10b981', HOSPITAL: '#8b5cf6', ADMIN: '#f59e0b' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: '#0f172a', color: 'white', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <ShieldCheck size={28} color="#3b82f6" />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6' }}>Admin Panel</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp size={18} /> },
            { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
            { id: 'users', label: 'Patients', icon: <Users size={18} /> },
            { id: 'doctors', label: 'Doctors', icon: <Stethoscope size={18} /> },
            { id: 'hospitals', label: 'Hospitals', icon: <Building2 size={18} /> },
            { id: 'bedbookings', label: 'Bed Bookings', icon: <BedDouble size={18} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: activeTab === tab.id ? '#1e293b' : 'transparent',
              border: 'none', color: activeTab === tab.id ? 'white' : '#94a3b8',
              padding: '0.85rem 1rem', borderRadius: 10, display: 'flex',
              alignItems: 'center', gap: '0.75rem', fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem'
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={{
          background: 'transparent', border: '1px solid #1e293b', color: '#94a3b8',
          padding: '0.75rem', borderRadius: 10, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem'
        }}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
        {/* Header */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Analytics Dashboard</h1>
              <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Blue Vitals — Live Platform Metrics</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={fetchStats} style={{ background: '#f1f5f9', border: 'none', padding: '0.6rem', borderRadius: 10, cursor: 'pointer', display: 'flex' }}>
                <RefreshCw size={18} color="#64748b" />
              </button>
            </div>
          </div>
        )}

        <div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '1rem' }}>Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                  {kpiCards.map((card, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{card.value}</p>
                        </div>
                        <div style={{ background: card.bg, color: card.color, padding: '0.75rem', borderRadius: 12 }}>{card.icon}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Row 1: Monthly Revenue + Revenue Breakdown Pie */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  {/* Monthly Revenue Bar Chart */}
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 1.5rem', fontWeight: 800, color: '#0f172a' }}>Monthly Revenue (Last 6 Months)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stats.monthlyRevenue} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v, n) => [`₹${v.toLocaleString()}`, n === 'doctorRevenue' ? 'Doctor Fees' : 'Bed Bookings']} contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: '0.8rem' }} />
                        <Legend formatter={n => n === 'doctorRevenue' ? 'Doctor Fees' : 'Bed Bookings'} wrapperStyle={{ fontSize: '0.8rem' }} />
                        <Bar dataKey="doctorRevenue" fill="#3b82f6" radius={[6,6,0,0]} />
                        <Bar dataKey="bedRevenue" fill="#06b6d4" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Revenue Breakdown Pie */}
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, color: '#0f172a' }}>Revenue Breakdown</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={stats.revenueBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                          {stats.revenueBreakdown.map((_, i) => (
                            <Cell key={i} fill={['#3b82f6','#06b6d4','#f97316'][i]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: '0.8rem' }} />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Row 2: Appointment Status Pie + Bed Type Pie + Top Specialities Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  {/* Appointment Status Pie */}
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, color: '#0f172a' }}>Appointment Status</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Pending', value: stats.appointments.pending },
                            { name: 'Confirmed', value: stats.appointments.confirmed },
                            { name: 'Completed', value: stats.appointments.completed },
                            { name: 'Cancelled', value: stats.appointments.cancelled },
                          ]}
                          cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value"
                        >
                          {['#f59e0b','#3b82f6','#10b981','#ef4444'].map((c, i) => <Cell key={i} fill={c} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: '0.8rem' }} />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bed Type Distribution Pie */}
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, color: '#0f172a' }}>Bed Type Distribution</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={stats.bedTypeDistribution} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">
                          {stats.bedTypeDistribution.map((_, i) => (
                            <Cell key={i} fill={['#8b5cf6','#ec4899','#f59e0b','#10b981'][i % 4]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: '0.8rem' }} />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Users by Role */}
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 1.5rem', fontWeight: 800, color: '#0f172a' }}>Users by Role</h3>
                    {stats.usersByRole.filter(r => r.role !== 'ADMIN').map((r, i) => {
                      const total = stats.overview.totalUsers || 1;
                      const pct = Math.round((r._count.role / total) * 100);
                      return (
                        <div key={i} style={{ marginBottom: '1.1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{r.role}</span>
                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: roleColors[r.role] || '#64748b' }}>{r._count.role} ({pct}%)</span>
                          </div>
                          <div style={{ background: '#f1f5f9', borderRadius: 100, height: 8 }}>
                            <div style={{ width: `${pct}%`, background: roleColors[r.role] || '#64748b', height: 8, borderRadius: 100, transition: 'width 1s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Recent Appointments</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr', padding: '0.75rem 1.5rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                    <span>Patient</span><span>Doctor</span><span>Date</span><span>Status</span>
                  </div>
                  {stats.recentAppointments.map((apt, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr', padding: '1rem 1.5rem', borderTop: '1px solid #f8fafc', alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{apt.patient?.user?.name || 'N/A'}</span>
                      <span style={{ color: '#64748b' }}>Dr. {apt.doctor?.user?.name || 'N/A'}</span>
                      <span style={{ color: '#64748b' }}>{new Date(apt.appointmentDate).toLocaleDateString('en-IN')}</span>
                      <span style={{
                        padding: '0.3rem 0.75rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 800, display: 'inline-block',
                        background: apt.status === 'COMPLETED' ? '#dcfce7' : apt.status === 'CONFIRMED' ? '#dbeafe' : apt.status === 'CANCELLED' ? '#fee2e2' : '#fef9c3',
                        color: apt.status === 'COMPLETED' ? '#166534' : apt.status === 'CONFIRMED' ? '#1d4ed8' : apt.status === 'CANCELLED' ? '#dc2626' : '#854d0e'
                      }}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Patients Tab */}
            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Patients ({patTotal})</h2>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Page {patPage} of {patTotalPages}</span>
                </div>
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr', padding: '0.75rem 1.5rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                    <span>Name</span><span>Email</span><span>Phone</span><span>Gender</span>
                  </div>
                  {patError && <div style={{ padding: '1.5rem', color: '#dc2626', fontWeight: 600, textAlign: 'center' }}>{patError}</div>}
                  {patients.map((p, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr', padding: '1rem 1.5rem', borderTop: '1px solid #f8fafc', alignItems: 'center', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                          {p.user?.name?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{p.user?.name}</span>
                      </div>
                      <span style={{ color: '#64748b' }}>{p.user?.email}</span>
                      <span style={{ color: '#64748b' }}>{p.user?.phone || '—'}</span>
                      <span style={{ color: '#64748b' }}>{p.gender || '—'}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button disabled={patPage <= 1} onClick={() => fetchPatients(patPage - 1)}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: patPage <= 1 ? '#f8fafc' : 'white', color: patPage <= 1 ? '#cbd5e1' : '#1e293b', fontWeight: 700, cursor: patPage <= 1 ? 'not-allowed' : 'pointer' }}>← Prev</button>
                  {Array.from({ length: patTotalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => fetchPatients(p)}
                      style={{ padding: '0.5rem 0.875rem', borderRadius: 8, border: '1px solid #e2e8f0', background: p === patPage ? '#0f172a' : 'white', color: p === patPage ? 'white' : '#1e293b', fontWeight: 700, cursor: 'pointer' }}>{p}</button>
                  ))}
                  <button disabled={patPage >= patTotalPages} onClick={() => fetchPatients(patPage + 1)}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: patPage >= patTotalPages ? '#f8fafc' : 'white', color: patPage >= patTotalPages ? '#cbd5e1' : '#1e293b', fontWeight: 700, cursor: patPage >= patTotalPages ? 'not-allowed' : 'pointer' }}>Next →</button>
                </div>
              </motion.div>
            )}
            {/* Doctors Tab */}
            {activeTab === 'doctors' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Doctors ({docTotal})</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Page {docPage} of {docTotalPages}</span>
                    <button onClick={() => setShowDocModal(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Plus size={18} /> Add Doctor
                    </button>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr 1fr', padding: '0.75rem 1.5rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                    <span>Name</span><span>Speciality</span><span>City</span><span>Hospital</span><span>Fees</span><span>Credentials</span>
                  </div>
                  {docError && <div style={{ padding: '1.5rem', color: '#dc2626', fontWeight: 600, textAlign: 'center' }}>{docError}</div>}
                  {doctors.map((d, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr 1fr', padding: '1rem 1.5rem', borderTop: '1px solid #f8fafc', alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{d.user?.name}</span>
                      <span style={{ color: '#3b82f6', fontWeight: 600 }}>{d.speciality}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b' }}><MapPin size={12} />{d.city || d.hospital?.city || '—'}</span>
                      <span style={{ color: '#64748b' }}>{d.hospital?.name || '—'}</span>
                      <span style={{ fontWeight: 700, color: '#059669' }}>₹{d.fees}</span>
                      <button onClick={() => setCredDoctor(d)} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '0.4rem 0.75rem', borderRadius: 8, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>View Login</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button disabled={docPage <= 1} onClick={() => fetchDoctors(docPage - 1)}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: docPage <= 1 ? '#f8fafc' : 'white', color: docPage <= 1 ? '#cbd5e1' : '#1e293b', fontWeight: 700, cursor: docPage <= 1 ? 'not-allowed' : 'pointer' }}>← Prev</button>
                  {Array.from({ length: docTotalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => fetchDoctors(p)}
                      style={{ padding: '0.5rem 0.875rem', borderRadius: 8, border: '1px solid #e2e8f0', background: p === docPage ? '#0f172a' : 'white', color: p === docPage ? 'white' : '#1e293b', fontWeight: 700, cursor: 'pointer' }}>{p}</button>
                  ))}
                  <button disabled={docPage >= docTotalPages} onClick={() => fetchDoctors(docPage + 1)}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: docPage >= docTotalPages ? '#f8fafc' : 'white', color: docPage >= docTotalPages ? '#cbd5e1' : '#1e293b', fontWeight: 700, cursor: docPage >= docTotalPages ? 'not-allowed' : 'pointer' }}>Next →</button>
                </div>
              </motion.div>
            )}

            {/* Hospitals Tab */}
            {activeTab === 'hospitals' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Hospitals ({hospitals.length})</h2>
                  <button onClick={() => setShowHospModal(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Add Hospital
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                  {hospitals.map((h, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: 12 }}><Building2 size={20} color="#3b82f6" /></div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{h.name}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> {h.city}</p>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{h.address}</p>
                      {h.phone && <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>{h.phone}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Bed Bookings Tab */}
            {activeTab === 'bedbookings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Bed Bookings ({bedTotal})</h2>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Page {bedPage} of {bedTotalPages}</span>
                </div>
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr', padding: '0.75rem 1.5rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                    <span>Patient</span><span>Hospital</span><span>Bed Type</span><span>Admission</span><span>Status</span>
                  </div>
                  {bedError && <div style={{ padding: '1.5rem', color: '#dc2626', fontWeight: 600, textAlign: 'center' }}>{bedError}</div>}
                  {bedBookings.map((b, i) => {
                    const statusColors = {
                      PENDING:    { bg: '#fef9c3', color: '#854d0e' },
                      CONFIRMED:  { bg: '#dbeafe', color: '#1d4ed8' },
                      CHECKED_IN: { bg: '#dcfce7', color: '#166534' },
                      CHECKED_OUT:{ bg: '#ede9fe', color: '#7c3aed' },
                      CANCELLED:  { bg: '#fee2e2', color: '#dc2626' },
                    };
                    const sc = statusColors[b.status] || statusColors.PENDING;
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr', padding: '1rem 1.5rem', borderTop: '1px solid #f8fafc', alignItems: 'center', fontSize: '0.875rem' }}>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{b.patient?.user?.name || '—'}</span>
                        <span style={{ color: '#64748b' }}>{b.hospital?.name || '—'}</span>
                        <span style={{ color: '#64748b' }}>{b.bedType}</span>
                        <span style={{ color: '#64748b' }}>{b.admissionDate ? new Date(b.admissionDate).toLocaleDateString('en-IN') : '—'}</span>
                        <span style={{ padding: '0.3rem 0.75rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 800, display: 'inline-block', background: sc.bg, color: sc.color }}>{b.status}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button disabled={bedPage <= 1} onClick={() => fetchBedBookings(bedPage - 1)}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: bedPage <= 1 ? '#f8fafc' : 'white', color: bedPage <= 1 ? '#cbd5e1' : '#1e293b', fontWeight: 700, cursor: bedPage <= 1 ? 'not-allowed' : 'pointer' }}>← Prev</button>
                  {Array.from({ length: bedTotalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => fetchBedBookings(p)}
                      style={{ padding: '0.5rem 0.875rem', borderRadius: 8, border: '1px solid #e2e8f0', background: p === bedPage ? '#0f172a' : 'white', color: p === bedPage ? 'white' : '#1e293b', fontWeight: 700, cursor: 'pointer' }}>{p}</button>
                  ))}
                  <button disabled={bedPage >= bedTotalPages} onClick={() => fetchBedBookings(bedPage + 1)}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: bedPage >= bedTotalPages ? '#f8fafc' : 'white', color: bedPage >= bedTotalPages ? '#cbd5e1' : '#1e293b', fontWeight: 700, cursor: bedPage >= bedTotalPages ? 'not-allowed' : 'pointer' }}>Next →</button>
                </div>
              </motion.div>
            )}
          </>
        )}
        </div>
      </main>

      {/* Add Hospital Modal */}
      <AnimatePresence>
        {showHospModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowHospModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: 'white', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 480 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontWeight: 800 }}>Add Hospital</h2>
                <button onClick={() => setShowHospModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: 8, cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleAddHospital}>
                {[['name','Hospital Name','e.g. Apollo Hospital'],['city','City','e.g. Mumbai'],['address','Address','Full address'],['phone','Phone','+91-22-0000-0000']].map(([field, label, placeholder]) => (
                  <div key={field} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>{label}</label>
                    <input required={field !== 'phone'} placeholder={placeholder} value={hospForm[field]} onChange={e => setHospForm({...hospForm, [field]: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button type="submit" style={{ width: '100%', padding: '0.9rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem' }}>Add Hospital</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Doctor Modal */}
        {showDocModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDocModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: 'white', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontWeight: 800 }}>Add Doctor</h2>
                <button onClick={() => setShowDocModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: 8, cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '0.75rem', borderRadius: 8 }}>Default password will be <strong>Doctor@123</strong></p>
              <form onSubmit={handleAddDoctor}>
                {[['name','Full Name','Dr. Jane Doe'],['email','Email','doctor@hospital.com'],['speciality','Speciality','e.g. Cardiology'],['qualification','Qualification','MBBS, MD'],['experience','Experience (years)','10'],['fees','Consultation Fees (₹)','800'],['city','City (where they treat)','e.g. Mumbai']].map(([field, label, placeholder]) => (
                  <div key={field} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>{label}</label>
                    <input required placeholder={placeholder} value={docForm[field]} onChange={e => setDocForm({...docForm, [field]: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>Assign Hospital</label>
                  <select value={docForm.hospitalId} onChange={e => setDocForm({...docForm, hospitalId: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }}>
                    <option value=''>— No Hospital —</option>
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} ({h.city})</option>)}
                  </select>
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.9rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem' }}>Add Doctor</button>
              </form>
            </motion.div>
          </div>
        )}
        {/* Credentials Modal */}
        {credDoctor && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCredDoctor(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: 'white', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 420 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem' }}>Login Credentials</h2>
                <button onClick={() => setCredDoctor(null)} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: 8, cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', flexShrink: 0 }}>
                  {credDoctor.user?.name?.charAt(0)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>{credDoctor.user?.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{credDoctor.speciality} &bull; {credDoctor.hospital?.name || 'Independent'}</p>
                </div>
              </div>
              {[['Email', credDoctor.user?.email], ['Password', 'Doctor@123']].map(([label, value]) => (
                <div key={label} style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{value}</span>
                    <button onClick={() => { navigator.clipboard.writeText(value); toast.success(`${label} copied!`); }}
                      style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '0.3rem 0.75rem', borderRadius: 6, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', flexShrink: 0 }}>Copy</button>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPortal;
