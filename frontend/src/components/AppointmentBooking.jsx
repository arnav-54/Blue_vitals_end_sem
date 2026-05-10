import React, { useState } from 'react';
import { 
  Calendar, Clock, User, CreditCard, CheckCircle, 
  Building2, Activity, ShieldCheck, MessageSquare, 
  FileText, ArrowRight, ChevronLeft, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import './AppointmentBooking.css';

const AppointmentBooking = ({ doctor, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '', time: '', reason: '',
    patientInfo: { name: '', age: '', phone: '', email: '', gender: '' },
    paymentMethod: 'CARD'
  });

  const availableSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30'];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBookingData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setBookingData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = () => {
    if (step === 1 && (!bookingData.date || !bookingData.time)) return toast.error('Select Date & Time');
    if (step === 2 && !bookingData.reason) return toast.error('Select Reason');
    if (step === 3 && (!bookingData.patientInfo.name || !bookingData.patientInfo.phone)) return toast.error('Fill Patient Info');
    setStep(step + 1);
  };

  const handleBooking = async () => {
    setBookingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const hospitalName = typeof doctor.hospital === 'object' ? (doctor.hospital.name || 'Elite Medical Hub') : (doctor.hospital || 'Elite Medical Hub');
      const hospitalLocation = typeof doctor.hospital === 'object' ? (doctor.hospital.city || 'Mumbai') : (doctor.location || 'Mumbai');

      const appointmentData = {
        id: Date.now(),
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        appointmentDate: `${bookingData.date}T${bookingData.time}:00`,
        date: bookingData.date,
        time: bookingData.time,
        reason: bookingData.reason,
        patientName: bookingData.patientInfo.name,
        hospitalName: hospitalName,
        status: 'Confirmed'
      };

      // Save to local for instant dashboard sync
      let existing = [];
      try { existing = JSON.parse(localStorage.getItem('elite_appointments') || '[]'); } catch (e) { existing = []; }
      localStorage.setItem('elite_appointments', JSON.stringify([appointmentData, ...existing]));

      toast.success('System Authenticated. Booking Confirmed.');
      onSuccess && onSuccess(bookingData);
      setStep(6); // Success
    } catch (e) {
      toast.error('Booking Failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderStep = () => {
    const displayHospName = typeof doctor.hospital === 'object' ? (doctor.hospital.name || 'Elite Medical Hub') : (doctor.hospital || 'Elite Medical Hub');
    const displayHospLoc = typeof doctor.hospital === 'object' ? (doctor.hospital.city || 'Mumbai') : (doctor.location || 'Mumbai');

    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="booking-step">
            <div className="step-header-elite"><Calendar /> <h3>Select Date & Time</h3></div>
            <div className="date-time-box">
              <label>Select Date *</label>
              <input type="date" value={bookingData.date} onChange={e => handleInputChange('date', e.target.value)} />
              <label>Select Time Slot *</label>
              <div className="slot-grid">
                {availableSlots.map(s => (
                  <button key={s} className={`slot-btn ${bookingData.time === s ? 'active' : ''}`} onClick={() => handleInputChange('time', s)}>{s}</button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="booking-step">
            <div className="step-header-elite"><Activity /> <h3>Reason for Visit</h3></div>
            <div className="reason-box">
              <textarea placeholder="Describe your symptoms..." value={bookingData.reason} onChange={e => handleInputChange('reason', e.target.value)} rows={4} />
              <div className="tags-grid">
                {['Regular Checkup', 'Follow-up', 'Chest Pain', 'Headache', 'Fever'].map(t => (
                  <button key={t} className="tag-btn" onClick={() => handleInputChange('reason', t)}>{t}</button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="booking-step">
            <div className="step-header-elite"><User /> <h3>Patient Information</h3></div>
            <div className="patient-grid-elite">
              <div className="input-field"><label>Full Name *</label><input placeholder="Name" value={bookingData.patientInfo.name} onChange={e => handleInputChange('patientInfo.name', e.target.value)} /></div>
              <div className="input-field"><label>Age</label><input type="number" placeholder="Age" value={bookingData.patientInfo.age} onChange={e => handleInputChange('patientInfo.age', e.target.value)} /></div>
              <div className="input-field"><label>Gender</label><select value={bookingData.patientInfo.gender} onChange={e => handleInputChange('patientInfo.gender', e.target.value)}><option>Male</option><option>Female</option></select></div>
              <div className="input-field"><label>Phone *</label><input placeholder="Phone" value={bookingData.patientInfo.phone} onChange={e => handleInputChange('patientInfo.phone', e.target.value)} /></div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="booking-step">
            <div className="step-header-elite"><Building2 /> <h3>Facility Allocation</h3></div>
            <div className="facility-card-elite">
              <div className="hosp-assigned">
                <Building2 size={40} color="#3b82f6" />
                <div>
                  <h4>{displayHospName}</h4>
                  <p><MapPin size={14} /> {displayHospLoc}</p>
                </div>
              </div>
              <div className="bed-status-elite">
                <div className="bed-indicator"><CheckCircle size={18} color="#22c55e" /> <span>Bed Allocated: #B-204 (General Ward)</span></div>
                <p className="bed-note">Your clinical node is reserved at the facility.</p>
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="booking-step">
            <div className="step-header-elite"><FileText /> <h3>Bill & Payments</h3></div>
            <div className="billing-box-elite">
              <div className="invoice-row"><span>Consultation Fee</span><span>₹{doctor.fee}</span></div>
              <div className="invoice-row"><span>Service Tax (5%)</span><span>₹{(doctor.fee * 0.05).toFixed(0)}</span></div>
              <div className="invoice-row"><span>Facility Charge</span><span>₹150</span></div>
              <div className="invoice-total"><span>Total Payable</span><span>₹{parseInt(doctor.fee) + parseInt((doctor.fee * 0.05).toFixed(0)) + 150}</span></div>
            </div>
            <div className="payment-methods-elite">
              {['CARD', 'UPI', 'NETBANKING'].map(m => (
                <label key={m} className={`pay-pill ${bookingData.paymentMethod === m ? 'active' : ''}`}>
                  <input type="radio" value={m} checked={bookingData.paymentMethod === m} onChange={e => handleInputChange('paymentMethod', e.target.value)} />
                  {m}
                </label>
              ))}
            </div>
          </motion.div>
        );
      case 6:
        return (
          <div className="success-node-elite">
            <CheckCircle size={80} color="#22c55e" />
            <h2>Booking Complete</h2>
            <p>Your health session is synchronized.</p>
            <button className="btn-finish-elite" onClick={onClose}>Finish</button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="booking-modal-overlay-elite">
      <div className="booking-modal-card-elite">
        <div className="modal-top">
          <h2>Book Appointment</h2>
          <button className="close-x" onClick={onClose}>×</button>
        </div>

        {step < 6 && (
          <div className="progress-node-elite">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>{s}</div>
            ))}
            <div className="progress-line-bg"><div className="progress-line-fill" style={{ width: `${(step - 1) * 25}%` }}></div></div>
          </div>
        )}

        <div className="modal-body-elite">{renderStep()}</div>

        {step < 6 && (
          <div className="modal-footer-elite">
            {step > 1 && <button className="btn-back-elite" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 5 ? (
              <button className="btn-next-elite" onClick={handleNext}>Next <ArrowRight size={18} /></button>
            ) : (
              <button className="btn-pay-elite" onClick={handleBooking} disabled={bookingLoading}>{bookingLoading ? 'Processing...' : `Confirm & Pay ₹${parseInt(doctor.fee) + parseInt((doctor.fee * 0.05).toFixed(0)) + 150}`}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;