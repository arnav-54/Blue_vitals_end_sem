const express = require('express');
const router = express.Router();
let Groq;
let groqInitPromise = (async () => {
  try {
    Groq = require('groq-sdk');
    if (Groq.default) Groq = Groq.default;
    console.log('Successfully loaded Groq SDK via dynamic import');
  } catch (err) {
    console.error('CRITICAL: Failed to load Groq SDK:', err);
    Groq = class { constructor() { throw new Error('groq-sdk module not found on this environment.'); } };
  }
})();


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let groqClient;
const getGroqClient = async () => {
    if (groqClient) return groqClient;
    await groqInitPromise;
     groqClient = new Groq({
         apiKey: process.env.GROQ_API_KEY
});
    return groqClient;
};

router.post('/chat', async (req, res) => {
  try {
    const groq = await getGroqClient();
    const { message, patientId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch doctors and hospitals for context
    let doctors = [];
    let hospitals = [];
    try {
      doctors = await prisma.doctor.findMany({
        include: {
          user: true,
          hospital: true
        }
      });
      hospitals = await prisma.hospital.findMany();
    } catch (dbError) {
      console.error('Database fetching error:', dbError);
    }

    // Fetch patient's bookings if patientId is provided
    let patientBookings = [];
    if (patientId) {
      try {
        const appointments = await prisma.appointment.findMany({
          where: { patientId },
          include: {
            doctor: {
              include: {
                user: true,
                hospital: true
              }
            }
          }
        });
        patientBookings = appointments.map(apt => ({
          type: 'Appointment',
          doctor: apt.doctor.user.name,
          hospital: apt.doctor.hospital ? apt.doctor.hospital.name : 'Unknown',
          date: apt.appointmentDate,
          status: apt.status
        }));

        const bedBookings = await prisma.bedBooking.findMany({
          where: { patientId },
          include: { hospital: true }
        });
        patientBookings = [...patientBookings, ...bedBookings.map(bb => ({
          type: 'Bed Booking',
          hospital: bb.hospital.name,
          bedType: bb.bedType,
          date: bb.admissionDate,
          status: bb.status
        }))];

        const ambulanceBookings = await prisma.ambulanceBooking.findMany({
          where: { patientId }
        });
        patientBookings = [...patientBookings, ...ambulanceBookings.map(ab => ({
          type: 'Ambulance Booking',
          pickup: ab.pickupLocation,
          destination: ab.destination,
          date: ab.bookingTime,
          status: ab.status
        }))];
      } catch (bbError) {
        console.error('Patient booking fetching error:', bbError);
      }
    }

    // Construct Context for AI
    // Construct Context for AI with full info
    const doctorList = doctors.map(d => `Dr. ${d.user.name} (${d.speciality} at ${d.hospital?.name || 'Private Clinic'}), Exp: ${d.experience}yrs, Fees: ₹${d.fees}, Qualification: ${d.qualification}`).join('\n');
    const hospitalList = hospitals.map(h => `${h.name} in ${h.city} (${h.address}, Ph: ${h.phone})`).join('\n');
    const bookingsStr = patientBookings.length > 0
      ? patientBookings.map(b => `- ${b.type}: ${b.status} on ${new Date(b.date).toLocaleDateString()} at ${b.hospital || b.destination}`).join('\n')
      : 'No current bookings.';

    const systemPrompt = `
      You are the BlueVitals Concierge.
      
      **MISSION: MINIMAL GREETING FIRST**
      - If the user says "hello", "hi", or greets you: ONLY respond with a very short greeting (e.g., "Hello! Welcome to BlueVitals. How can I help you?").
      - DO NOT provide any counts (like 37 doctors or 30 hospitals) or data in your initial greeting.
      - ONLY provide data, counts, or doctor/hospital info when specifically asked.
      - Response limit: 1-2 short sentences.
      - Multi-lingual: Brief and accurate.
      - Confidentiality: Keep internal raw lists private.

      Bookings: ${bookingsStr}

      Knowledge:
      - Doctors: ${doctorList}
      - Hospitals: ${hospitalList}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 150
    });

    res.json({
      response: chatCompletion.choices[0].message.content
    });

  } catch (error) {
    console.error('AI Chat Error Details:', error);
    res.status(500).json({ 
      error: 'Failed to get response from AI assistant',
      details: error.message 
    });
  }
});

module.exports = router;
