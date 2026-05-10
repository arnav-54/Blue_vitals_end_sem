import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, CheckCircle,
  Building2, Activity, ShieldCheck, MessageSquare,
  FileText, ArrowRight, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import './AppointmentBooking.css';

const AppointmentBooking = ({ doctor, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]);
  const [bookingData, setBookingData] = useState({
    date: '', time: '', reason: '', paymentMethod: 'CARD'
  });

  useEffect(() => {
    if (bookingData.date && doctor?.id) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/doctors/${doctor.id}/availability?date=${bookingData.date}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.availableSlots) setAvailableSlots(data.availableSlots); })
        .catch(() => {});
    }
  }, [bookingData.date, doctor?.id]);

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && (!bookingData.date || !bookingData.time)) return toast.error('Select Date & Time');
    if (step === 2 && !bookingData.reason) return toast.error('Enter reason for visit');
    setStep(step + 1);
  };

  const handleBooking = async () => {
    setBookingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.createAppointment({
        doctorId: doctor.id,
        appointmentDate: `${bookingData.date}T${bookingData.time}:00`,
        reason: bookingData.reason,
      }, token);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Booking failed');
      }

      toast.success('Appointment booked successfully!');
      onSuccess && onSuccess();
      setStep(4);
    } catch (e) {
      toast.error(e.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const hospitalName = typeof doctor.hospital === 'object'
    ? (doctor.hospital?.name || 'Hospital')
    : (doctor.hospital || 'Hospital');
  const hospitalCity = typeof doctor.hospital === 'object'
    ? (doctor.hospital?.city || 'Pune')
    : (doctor.location || 'Pune');

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="booking-step">
            <div className="step-header-elite"><Calendar /> <h3>Select Date & Time</h3></div>
            <div className="date-time-box">
              <label>Select Date *</label>
              <input type="date" value={bookingData.date} min={new Date().toISOString().split('T')[0]} onChange={e => handleInputChange('date', e.target.value)} />
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
            <div className="step-header-elite"><FileText /> <h3>Confirm & Pay</h3></div>
            <div className="billing-box-elite">
              <div className="invoice-row"><span>Consultation Fee</span><span>₹{doctor.fee}</span></div>
              <div className="invoice-row"><span>Service Tax (5%)</span><span>₹{(doctor.fee * 0.05).toFixed(0)}</span></div>
              <div className="invoice-row"><span>Facility Charge</span><span>₹150</span></div>
              <div className="invoice-total"><span>Total Payable</span><span>₹{parseInt(doctor.fee) + parseInt((doctor.fee * 0.05).toFixed(0)) + 150}</span></div>
            </div>
            <div className="facility-card-elite" style={{ marginTop: '1.5rem' }}>
              <div className="hosp-assigned">
                <Building2 size={32} color="#3b82f6" />
                <div><h4>{hospitalName}</h4><p><MapPin size={12} /> {hospitalCity}</p></div>
              </div>
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
      case 4:
        return (
          <div className="success-node-elite">
            <CheckCircle size={80} color="#22c55e" />
            <h2>Booking Confirmed!</h2>
            <p>Your appointment on <strong>{bookingData.date}</strong> at <strong>{bookingData.time}</strong> with <strong>{doctor.name}</strong> is booked.</p>
            <button className="btn-finish-elite" onClick={onClose}>Done</button>
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

        {step < 4 && (
          <div className="progress-node-elite">
            {[1, 2, 3].map(s => (
              <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>{s}</div>
            ))}
            <div className="progress-line-bg"><div className="progress-line-fill" style={{ width: `${(step - 1) * 50}%` }}></div></div>
          </div>
        )}

        <div className="modal-body-elite">{renderStep()}</div>

        {step < 4 && (
          <div className="modal-footer-elite">
            {step > 1 && <button className="btn-back-elite" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 3 ? (
              <button className="btn-next-elite" onClick={handleNext}>Next <ArrowRight size={18} /></button>
            ) : (
              <button className="btn-pay-elite" onClick={handleBooking} disabled={bookingLoading}>
                {bookingLoading ? 'Processing...' : `Confirm & Pay ₹${parseInt(doctor.fee) + parseInt((doctor.fee * 0.05).toFixed(0)) + 150}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;
