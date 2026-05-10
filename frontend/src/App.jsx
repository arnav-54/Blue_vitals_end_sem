import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme/theme';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import Hospitals from './pages/Hospitals';
import Services from './pages/Services';
import Emergency from './pages/Emergency';
import UserPortal from './pages/UserPortal';
import DoctorPortal from './pages/DoctorPortal';
import HospitalPortal from './pages/HospitalPortal';
import AdminPortal from './pages/AdminPortal';
import DoctorProfile from './pages/DoctorProfile';
import ChatAssistant from './components/Assistant/ChatAssistant';
import RoleSelection from './pages/RoleSelection';
import AuthSuccess from './pages/AuthSuccess';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedUser !== 'undefined' && storedToken && storedToken !== 'undefined') {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('doctorId');
    localStorage.removeItem('patientId');
    localStorage.removeItem('hospitalId');

    // Clear all cookies
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setUser(null);
  };

  // Determine which portal to redirect to based on role
  const getPortalPath = () => {
    if (!user) return '/login';
    const role = user.role?.toUpperCase();
    if (role === 'DOCTOR') return '/doctor-portal';
    if (role === 'HOSPITAL') return '/hospital-portal';
    if (role === 'ADMIN') return '/admin-portal';
    return '/user-portal';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Toaster position="top-right" />
          <Navbar user={user} onLogout={handleLogout} />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={user ? <Navigate to={getPortalPath()} /> : <Login onLogin={handleLogin} />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to={getPortalPath()} /> : <Register onLogin={handleLogin} />}
              />
              <Route
                path="/select-role"
                element={user ? <Navigate to={getPortalPath()} /> : <RoleSelection onLogin={handleLogin} />}
              />
              <Route
                path="/auth-success"
                element={user ? <Navigate to={getPortalPath()} /> : <AuthSuccess onLogin={handleLogin} />}
              />

              {/* Public routes */}
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/services" element={<Services />} />
              <Route path="/emergency" element={<Emergency />} />

              {/* Patient Portal */}
              <Route
                path="/user-portal"
                element={
                  <ProtectedRoute user={user} allowedRoles={['user', 'patient']}>
                    <UserPortal />
                  </ProtectedRoute>
                }
              />

              {/* Doctor Portal */}
              <Route
                path="/doctor-portal"
                element={
                  <ProtectedRoute user={user} allowedRoles={['doctor']}>
                    <DoctorPortal />
                  </ProtectedRoute>
                }
              />

              {/* Hospital Portal */}
              <Route
                path="/hospital-portal"
                element={
                  <ProtectedRoute user={user} allowedRoles={['hospital']}>
                    <HospitalPortal />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal */}
              <Route
                path="/admin-portal"
                element={
                  <ProtectedRoute user={user} allowedRoles={['admin']}>
                    <AdminPortal />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <ChatAssistant />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;